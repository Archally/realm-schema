// ═══════════════════════════════════════════════════════════════════════════════
// Shared helpers — YAML loading, geometry, config, entity extraction
// ═══════════════════════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

export const SCHEMA_BASE_URI = "https://archally.dev/realm/";

/** Typed ID pattern for realm entities. */
// The trailing-letter branch is scoped to ECH, matching `metamodel.any_entity_ref`.
// Without it the rule layers silently skipped every member of a change family - 18 of
// 60 estate changes on cewice, measured 2026-08-29 - so a rule could not fire on the
// entities the families exist to describe, and reported nothing rather than failing.
export const ID_RE = /^([a-z][a-z0-9-]*\.)?([A-Z]{1,5}\d{3,}|ECH\d{3,}[a-z])$/;

/**
 * Extracts the entity type prefix from a typed ID.
 * Handles namespaced IDs: "site.WNG001" → "WNG", "BLD001" → "BLD".
 */
export function entityPrefix(id) {
  const segment = id.includes(".") ? id.split(".").pop() : id;
  return segment.replace(/\d+$/, "");
}

/**
 * Maps model data file (relative path) → schema file (relative to schema/).
 *
 * This IS the standalone backend's resolver - `structural.mjs` reads it for every
 * file it validates. When layers 1-2 are served by realm-core instead, core's own
 * generic resolver answers the same question, and the two must agree about which
 * files are governed at all: a file one side validates and the other never opens is
 * a difference in verdict that no count of errors reveals.
 */
export const DATA_FILE_TO_SCHEMA = {
  "realm.yaml":                   "realm.schema.yaml",
  "topology/estate.yaml":         "topology/estate.schema.yaml",
  "topology/equipment.yaml":      "topology/equipment.schema.yaml",
  "topology/boundary.yaml":       "topology/boundary.schema.yaml",
  "topology/spatial.yaml":        "topology/spatial.schema.yaml",
  "topology/tools.yaml":          "topology/tools.schema.yaml",
  "infrastructure/systems.yaml":  "infrastructure/systems.schema.yaml",
  "infrastructure/network.yaml":  "infrastructure/network.schema.yaml",
  "nature/vegetation.yaml":       "nature/vegetation.schema.yaml",
  "nature/biomass.yaml":          "nature/biomass.schema.yaml",
  "nature/care.yaml":             "nature/care.schema.yaml",
  "nature/soil.yaml":             "nature/soil.schema.yaml",
  "nature/recommendations.yaml":  "nature/recommendations.schema.yaml",
  "operations/maintenance.yaml":  "operations/maintenance.schema.yaml",
  "operations/compliance.yaml":   "operations/compliance.schema.yaml",
  "context/surroundings.yaml":    "context/surroundings.schema.yaml",
  "context/persons.yaml":         "context/persons.schema.yaml",
  "estate-changes.yaml":          "estate-change.schema.yaml",
  "risk-register.yaml":           "risks.schema.yaml",
  "events.yaml":                  "events.schema.yaml",
  // The config is a sibling of the model rather than part of it, but it has a
  // schema and realm-core validates it, so this side does too. Leaving it out
  // meant the published validator reported a clean model where the MCP server
  // reported an invalid config - the same model, two verdicts.
  "realm-config.yaml":            "realm-config.schema.yaml",
};

export const CONSTRUCTION_SCHEMA = "topology/construction.schema.yaml";

/** Default validation tolerance values (used when no realm-config.yaml). */
export const CONFIG_DEFAULTS = {
  wall_thickness_tolerance_cm: 2,
  opening_width_tolerance_cm: 1,
  head_height_tolerance_cm: 5,
  elevation_tolerance_m: 0.01,
  slab_area_tolerance_percent: 10,
  roof_coverage_tolerance_percent: 15,
  coplanarity_tolerance_cm: 1,
  wall_coverage_tolerance_percent: 5,
  opening_fit_tolerance_cm: 2,
};

// ─── File utilities ─────────────────────────────────────────────────────────

export function toPosix(p) { return p.split(path.sep).join("/"); }

export function walkFiles(dir, include) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (include(full)) out.push(full);
    }
  }
  return out.sort();
}

export function loadYaml(filePath) {
  return YAML.parse(fs.readFileSync(filePath, "utf8"));
}

/**
 * Attempts to load and parse a YAML file.
 * Returns { data } on success or { error } on failure (never throws).
 */
export function tryLoadYaml(filePath) {
  try {
    return { data: loadYaml(filePath) };
  } catch (err) {
    return { error: err.message || String(err) };
  }
}

// ─── Schema loading ─────────────────────────────────────────────────────────
// (loadSchemaRegistry/makeAjv removed 2026-06-12 — Ajv validation is delegated
//  to @archally/realm-core; see ../validate-realm.mjs header.)

// ─── Config loading ─────────────────────────────────────────────────────────

export function loadConfig(configPath) {
  const config = { ...CONFIG_DEFAULTS };
  if (!configPath || !fs.existsSync(configPath)) return config;
  const raw = tryLoadYaml(configPath);
  if (!raw) return config;
  if (raw.validation) {
    for (const [key, value] of Object.entries(raw.validation)) {
      if (typeof value === "number") config[key] = value;
    }
  }
  return config;
}

// ─── Entity extraction ──────────────────────────────────────────────────────

/**
 * Extracts all typed-ID entities from model files.
 * Construction files have a different structure (wall_segments[], floor_slab, etc.)
 * which is handled specifically.
 */
export function extractEntities(modelFiles) {
  const entities = new Map();
  const allIds = new Set();
  const duplicates = [];

  for (const [relPath, data] of modelFiles) {
    if (!data || typeof data !== "object") continue;

    const isConstruction = relPath.startsWith("topology/construction/");

    if (isConstruction) {
      // Construction files: specific property structure
      for (const key of ["wall_segments", "roof_planes"]) {
        if (!Array.isArray(data[key])) continue;
        for (const item of data[key]) {
          if (!item?.id || !ID_RE.test(item.id)) continue;
          addEntity(item.id, key, item, relPath);
        }
      }
      for (const key of ["floor_slab", "ceiling_slab"]) {
        if (!data[key]?.id || !ID_RE.test(data[key].id)) continue;
        addEntity(data[key].id, key, data[key], relPath);
      }
    } else {
      // Standard plane files: arrays of entities
      for (const [arrayKey, items] of Object.entries(data)) {
        if (!Array.isArray(items)) continue;
        for (const item of items) {
          if (!item?.id || !ID_RE.test(item.id)) continue;
          addEntity(item.id, arrayKey, item, relPath);
        }
      }
    }
  }

  function addEntity(id, type, data, file) {
    if (allIds.has(id)) {
      duplicates.push({ id, file });
    } else {
      allIds.add(id);
      entities.set(id, { type, data, file });
    }
  }

  return { entities, allIds, duplicates };
}

// ─── Geometry helpers ───────────────────────────────────────────────────────

export function distance2d(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function polygonArea(vertices) {
  let area = 0;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    area += (vertices[j].x + vertices[i].x) * (vertices[j].y - vertices[i].y);
  }
  return Math.abs(area) / 2;
}

/** Returns max distance (cm) of any vertex from the plane defined by first 3 vertices. */
export function coplanarityError(vertices3d) {
  if (vertices3d.length < 4) return 0;
  const [p0, p1, p2] = vertices3d;
  const v1 = { x: p1.x - p0.x, y: p1.y - p0.y, z: p1.z - p0.z };
  const v2 = { x: p2.x - p0.x, y: p2.y - p0.y, z: p2.z - p0.z };
  const normal = {
    x: v1.y * v2.z - v1.z * v2.y,
    y: v1.z * v2.x - v1.x * v2.z,
    z: v1.x * v2.y - v1.y * v2.x,
  };
  const len = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2);
  if (len < 1e-10) return Infinity;
  let maxDist = 0;
  for (let i = 3; i < vertices3d.length; i++) {
    const v = vertices3d[i];
    const d = Math.abs(normal.x * (v.x - p0.x) + normal.y * (v.y - p0.y) + normal.z * (v.z - p0.z)) / len;
    if (d > maxDist) maxDist = d;
  }
  return maxDist * 100; // meters → cm
}

/** Bounding-box overlap area as proxy for polygon intersection. */
export function polygonsOverlapArea(polyA, polyB) {
  const bbA = boundingBox(polyA);
  const bbB = boundingBox(polyB);
  const overlapX = Math.max(0, Math.min(bbA.maxX, bbB.maxX) - Math.max(bbA.minX, bbB.minX));
  const overlapY = Math.max(0, Math.min(bbA.maxY, bbB.maxY) - Math.max(bbA.minY, bbB.minY));
  return overlapX * overlapY;
}

export function boundingBox(vertices) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const v of vertices) {
    if (v.x < minX) minX = v.x;
    if (v.y < minY) minY = v.y;
    if (v.x > maxX) maxX = v.x;
    if (v.y > maxY) maxY = v.y;
  }
  return { minX, minY, maxX, maxY };
}

// ─── Model discovery (input for rule layers 3-5) ─────────────────────────────

/**
 * Files to skip when walking a model: generator inputs and asset manifests, which
 * describe how a model is USED rather than what it contains.
 *
 * `realm-config` is deliberately absent. This list used to begin with a bare
 * "config", which swallowed it, and the published validator therefore reported a
 * clean model where realm-core reported an invalid config - the same model, two
 * verdicts, and no count of errors would have shown which file the difference was
 * in. The config has a schema, so it is validated (see DATA_FILE_TO_SCHEMA).
 */
const EXCLUDE_PATTERNS = ["manifest", "schedule-planner", "garden-care"];

/**
 * Collect the model's YAML files for the rule layers, keyed by project-relative
 * posix path, with the construction subset alongside.
 *
 * Lives here rather than in the runner because `rl check` reports the same rule
 * layers and needs the same input. Two walks would agree until one of them learned
 * about a new directory, and the disagreement would surface as a rule that quietly
 * stopped seeing part of the model.
 */
export function discoverModelFiles(modelDir) {
  // Matched against the MODEL-RELATIVE path, not the absolute one: a consumer whose
  // model happens to sit under a directory named `manifest` or `garden-care` would
  // otherwise have every file in it skipped, and a model that validates because
  // nothing read it looks exactly like a model that validates.
  const yamlFiles = walkFiles(modelDir, f => {
    if (!/\.(yaml|yml)$/i.test(f)) return false;
    const relPath = toPosix(path.relative(modelDir, f));
    return !EXCLUDE_PATTERNS.some(pattern => relPath.includes(pattern));
  });

  const modelFiles = new Map();
  const constructionFiles = new Map();
  const parseErrors = [];

  for (const filePath of yamlFiles) {
    const relPath = toPosix(path.relative(modelDir, filePath));
    const result = tryLoadYaml(filePath);
    if (result.error) {
      parseErrors.push({ file: relPath, error: result.error });
    } else if (result.data != null) {
      modelFiles.set(relPath, result.data);
      if (relPath.startsWith("topology/construction/")) {
        constructionFiles.set(relPath, result.data);
      }
    }
  }

  return { modelFiles, constructionFiles, parseErrors };
}
