// ═══════════════════════════════════════════════════════════════════════════════
// Shared helpers — YAML loading, geometry, config, entity extraction
// ═══════════════════════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

export const SCHEMA_BASE_URI = "https://archally.dev/realm/";

/** Typed ID pattern for realm entities. */
// The trailing-letter branch is scoped to ECH, matching `metamodel.any_entity_ref`.
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
 * The standalone validator uses this mapping to select a schema for each data file.
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
  // The validator checks the model configuration against its own schema.
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
      // Construction files: specific property structure. Each element also records the
      // building or floor its document describes, because a roof is often stated in a
      // building-level document and the walls under it in floor documents, and the rules
      // that judge a building as a whole need to find both.
      const document = constructionDocumentOf(data);
      for (const key of ["wall_segments", "roof_planes", "columns", "beams"]) {
        if (!Array.isArray(data[key])) continue;
        for (const item of data[key]) {
          if (!item?.id || !ID_RE.test(item.id)) continue;
          addEntity(item.id, key, item, relPath, document);
        }
      }
      for (const key of ["floor_slab", "ceiling_slab"]) {
        if (!data[key]?.id || !ID_RE.test(data[key].id)) continue;
        addEntity(data[key].id, key, data[key], relPath, document);
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

  function addEntity(id, type, data, file, document) {
    if (allIds.has(id)) {
      duplicates.push({ id, file });
    } else {
      allIds.add(id);
      entities.set(id, document ? { type, data, file, document } : { type, data, file });
    }
  }

  return { entities, allIds, duplicates };
}

/**
 * The building or floor a construction document describes: `{ building_ref, floor_ref }`,
 * each a string or null.
 */
function constructionDocumentOf(data) {
  return {
    building_ref: typeof data.building_ref === "string" ? data.building_ref : null,
    floor_ref: typeof data.floor_ref === "string" ? data.floor_ref : null,
  };
}

/**
 * The construction elements of a model grouped by the building they belong to.
 *
 * A roof plane belongs to the building it names; any other element to the building its
 * document describes, directly or through the document's floor. Returns one group per
 * building: `{ building, walls, columns, beams, roofs }`, each list holding
 * `{ id, data, buildingDocument }`, where `buildingDocument` is true for an element of a
 * building-level document (a simple building without floors).
 *
 * @param {Map<string, {type: string, data: Record<string, any>, file: string, document?: {building_ref: string|null, floor_ref: string|null}}>} entities
 */
export function constructionByBuilding(entities) {
  const groups = new Map();
  const groupOf = (building) => {
    if (!groups.has(building)) groups.set(building, { building, walls: [], columns: [], beams: [], roofs: [] });
    return groups.get(building);
  };
  for (const [id, entity] of entities) {
    if (!entity.document) continue;
    const prefix = entityPrefix(id);
    const document = entity.document;
    const floorBuilding = document.floor_ref ? entities.get(document.floor_ref)?.data?.building_ref : null;
    const documentBuilding = document.building_ref ?? floorBuilding ?? document.floor_ref ?? entity.file;
    const buildingDocument = Boolean(document.building_ref) && !document.floor_ref;
    const element = { id, data: entity.data, buildingDocument };
    if (prefix === "RFP") {
      const named = typeof entity.data.building_ref === "string" ? entity.data.building_ref : documentBuilding;
      groupOf(named).roofs.push(element);
    } else if (prefix === "WSG") groupOf(documentBuilding).walls.push(element);
    else if (prefix === "COL") groupOf(documentBuilding).columns.push(element);
    else if (prefix === "BEAM") groupOf(documentBuilding).beams.push(element);
  }
  return [...groups.values()];
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

/** Whether a value is a number that is neither infinite nor NaN. */
export function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * The point of segment a-b nearest to `point`: its parameter `t` in [0, 1] from a to b,
 * and its plan distance from `point`.
 */
export function projectOnSegment(point, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  let t = 0;
  if (lengthSquared > 0) {
    t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / lengthSquared));
  }
  return { t, distance: Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy)) };
}

/**
 * Where segments a-b and c-d cross: the parameter along a-b, or null when they do not
 * cross (parallel segments included).
 */
export function segmentCrossing(a, b, c, d) {
  const rx = b.x - a.x;
  const ry = b.y - a.y;
  const sx = d.x - c.x;
  const sy = d.y - c.y;
  const denominator = rx * sy - ry * sx;
  if (Math.abs(denominator) < 1e-12) return null;
  const t = ((c.x - a.x) * sy - (c.y - a.y) * sx) / denominator;
  const u = ((c.x - a.x) * ry - (c.y - a.y) * rx) / denominator;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;
  return t;
}

/** A point at parameter t along segment a-b. */
export function pointAlong(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/**
 * The elevation of a planar roof surface above plan point (x, y), from its first three
 * vertices, or null when those vertices do not span a plane that a plan point can be
 * lifted onto (collinear, or a vertical face).
 */
export function planeElevationAt(vertices3d, x, y) {
  if (!Array.isArray(vertices3d) || vertices3d.length < 3) return null;
  const [p, q, r] = vertices3d;
  const u = { x: q.x - p.x, y: q.y - p.y, z: q.z - p.z };
  const v = { x: r.x - p.x, y: r.y - p.y, z: r.z - p.z };
  const normal = { x: u.y * v.z - u.z * v.y, y: u.z * v.x - u.x * v.z, z: u.x * v.y - u.y * v.x };
  if (Math.abs(normal.z) < 1e-12) return null;
  return p.z - (normal.x * (x - p.x) + normal.y * (y - p.y)) / normal.z;
}

/**
 * Whether a plan point lies inside a polygon, or within `tolerance` metres of its outline.
 */
export function polygonCovers(vertices, point, tolerance) {
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const a = vertices[i];
    const b = vertices[j];
    const crosses = a.y > point.y !== b.y > point.y;
    if (crosses && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  if (inside) return true;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    if (projectOnSegment(point, vertices[j], vertices[i]).distance <= tolerance) return true;
  }
  return false;
}

/**
 * The elevation of a wall segment's top at parameter t along it (0 at its start, 1 at its
 * end): its top profile, else a symmetric gable, else the level top at base + height.
 * Null when the wall states no height and no profile.
 */
export function wallTopAt(wall, t) {
  const base = wall.base_elevation_m ?? 0;
  if (Array.isArray(wall.top_profile) && wall.top_profile.length >= 2) {
    const lengthCm = distance2d(wall.start, wall.end) * 100;
    const offset = t * lengthCm;
    const points = wall.top_profile;
    if (offset <= points[0].offset_from_start_cm) return points[0].elevation_m;
    for (let i = 1; i < points.length; i++) {
      const before = points[i - 1];
      const after = points[i];
      if (offset > after.offset_from_start_cm) continue;
      const span = after.offset_from_start_cm - before.offset_from_start_cm;
      if (span <= 0) return after.elevation_m;
      return before.elevation_m + ((offset - before.offset_from_start_cm) / span) * (after.elevation_m - before.elevation_m);
    }
    return points[points.length - 1].elevation_m;
  }
  if (wall.height_m == null) return null;
  const eave = base + wall.height_m;
  if (wall.gable_peak_elevation_m != null) {
    return eave + (1 - Math.abs(2 * t - 1)) * (wall.gable_peak_elevation_m - eave);
  }
  return eave;
}

/**
 * A building's footprint in model coordinates: its `footprint` vertices rotated clockwise
 * by `rotation_degrees` about the centroid and offset by `position`. Null when the building
 * states no position or no polygon footprint.
 */
export function buildingOutline(building) {
  const vertices = building?.footprint?.vertices;
  const position = building?.position;
  if (!Array.isArray(vertices) || vertices.length < 3 || !position) return null;
  const radians = ((building.rotation_degrees ?? 0) * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return vertices.map((vertex) => ({
    x: position.x + vertex.x * cos + vertex.y * sin,
    y: position.y - vertex.x * sin + vertex.y * cos,
  }));
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
 * The validator includes `realm-config.yaml` and checks it against its schema.
 */
const EXCLUDE_PATTERNS = ["manifest", "schedule-planner", "garden-care"];

/**
 * Collect the model's YAML files for the rule layers, keyed by project-relative
 * posix path, with the construction subset alongside.
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
