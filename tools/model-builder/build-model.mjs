// @ts-check
/**
 * Realm model builder: a model directory in, entities and typed relations out.
 *
 * One executable answer to "what does this model contain", shared by everything that needs
 * it rather than reimplemented per consumer. The quality checker reads it, the CLI prints
 * it, and anything built on the published package gets the same graph the tooling sees.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { resolveRelationType } from "./relation-types.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));

/**
 * Where the validator's discovery and extraction live, in either tree.
 *
 * The published layout nests the validator one directory deeper than the canonical one, so
 * a single relative path is correct in exactly one of the two and silently wrong in the
 * other - wrong in a way no hash comparison can see, because the bytes match and only the
 * resolution fails.
 */
const HELPERS_CANDIDATES = [
  path.resolve(HERE, "../validator/core/helpers.mjs"),
  path.resolve(HERE, "../validator/src/core/helpers.mjs"),
];

/** Directory names that name a plane. Anything else is cross-cutting and has none. */
const PLANES = new Set(["topology", "infrastructure", "nature", "operations", "context"]);

/**
 * The plane a model file sits in: the nearest ancestor directory that names one.
 *
 * Searched from the file upwards rather than read off the first path segment, because
 * those paths are relative to whatever directory the caller pointed at. Pointing at
 * `.realm/v2.2` makes the first segment `topology`; pointing one level higher makes it
 * `.realm`, and every entity silently loses its plane - the same model, described
 * differently depending on how it was opened.
 *
 * @param {string} file
 */
function planeOf(file) {
  const segments = file.split("/").slice(0, -1);
  for (let index = segments.length - 1; index >= 0; index -= 1) {
    if (PLANES.has(segments[index])) return segments[index];
  }
  return undefined;
}

/** Keys that look like references but address a schema. Same list the validator uses. */
const NOT_ENTITY_REFS = new Set(["$ref", "$schema"]);

/** Collection keys are plural; entity types are singular. */
const TYPE_OF_COLLECTION = {
  parcels: "parcel",
  buildings: "building",
  wings: "wing",
  floors: "floor",
  rooms: "room",
  outdoor_zones: "outdoor_zone",
  boundary_segments: "boundary_segment",
  furnitures: "furniture",
  equipments: "equipment",
  tools: "tool",
  wall_segments: "wall_segment",
  roof_planes: "roof_plane",
  floor_slab: "floor_slab",
  ceiling_slab: "ceiling_slab",
  systems: "system",
  components: "component",
  utility_connections: "utility_connection",
  network_nodes: "network_node",
  iot_devices: "iot_device",
  network_links: "network_link",
  specimens: "specimen",
  plantings: "planting",
  care_profiles: "species_care_profile",
  soil_profiles: "soil_profile",
  biomass_flows: "biomass_flow",
  planting_recommendations: "planting_recommendation",
  maintenance_tasks: "maintenance_task",
  notification_rules: "notification_rule",
  cost_categories: "cost_category",
  warranties: "warranty",
  regulatory_requirements: "regulatory_requirement",
  neighbor_properties: "neighbor_property",
  shared_concerns: "shared_concern",
  environmental_factors: "environmental_factor",
  roads: "road_corridor",
  persons: "person",
  estate_changes: "estate_change",
  risks: "risk",
  issues: "issue",
  events: "event",
};

/**
 * The model directory itself, given either it or a project folder containing it.
 *
 * A realm model lives at `<project>/.realm/v<N>/`, and pointing one level too high is the
 * obvious mistake to make from a shell. It does not fail: file discovery still finds the
 * YAML, but the paths it reports are one segment longer than the schema mapping expects,
 * so files whose collection key is singular stop being recognised as collections and their
 * entities are dropped. Measured on the worked example: three slabs, no error, no warning
 * - a model 2% smaller than the same model opened one directory down.
 *
 * @param {string} dir
 * @returns {string}
 */
export function resolveModelDir(dir) {
  if (fs.existsSync(path.join(dir, "realm.yaml"))) return dir;

  const realmDir = path.join(dir, ".realm");
  if (fs.existsSync(realmDir)) {
    const versions = fs
      .readdirSync(realmDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    for (const version of versions.reverse()) {
      const candidate = path.join(realmDir, version);
      if (fs.existsSync(path.join(candidate, "realm.yaml"))) return candidate;
    }
  }
  return dir;
}

/**
 * Load a realm model directory into the extraction this builder reads.
 *
 * Discovery and extraction belong to the validator and are borrowed rather than
 * reimplemented: two walks would agree until one of them learned about a new directory,
 * and the disagreement would surface as a model that is simply missing entities.
 *
 * @param {string} modelDir
 */
export async function loadRealmModel(modelDir) {
  modelDir = resolveModelDir(modelDir);
  const helpersPath = HELPERS_CANDIDATES.find((candidate) => fs.existsSync(candidate));
  if (!helpersPath) {
    throw new Error(
      `validator helpers not found. Looked in:\n  ${HELPERS_CANDIDATES.join("\n  ")}`,
    );
  }
  const helpers = await import(pathToFileURL(helpersPath).href);
  const { modelFiles } = helpers.discoverModelFiles(modelDir);
  return helpers.extractEntities(modelFiles).entities;
}

/**
 * Read the model's own `realm.yaml` - name, description, location, climate, schema version.
 *
 * Separate from `loadRealmModel` because discovery deliberately treats `realm.yaml` as a
 * metadata file rather than a source of entities, so the extraction never sees its scalars.
 * Returns `{}` when the file is absent or unreadable: a model with no name is still a model,
 * and a renderer that cannot read the header should still render the body.
 *
 * @param {string} modelDir
 * @returns {Promise<Record<string, unknown>>}
 */
export async function loadRealmMeta(modelDir) {
  const file = path.join(resolveModelDir(modelDir), "realm.yaml");
  if (!fs.existsSync(file)) return {};
  const { parse } = await import("yaml");
  const parsed = parse(fs.readFileSync(file, "utf8"));
  return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
}

/**
 * Walk one entity's data for reference fields, emitting a typed relation per resolved
 * target.
 *
 * Nested objects are walked, not only the top level: a door between two rooms, a wall's
 * source room and a change's tool are all declared inside sub-objects, and they are 22% of
 * the edges in a real property. Stopping at the top level would drop them, and a graph
 * missing a fifth of its edges answers "is this connected?" wrongly rather than partially.
 *
 * References to ids the model does not contain are SKIPPED rather than emitted as edges to
 * nowhere. The validator's referential layer already reports those, and a dangling
 * reference must not let an entity pass a rule asking whether it is connected.
 *
 * @param {unknown} node
 * @param {string} sourceId
 * @param {string} sourceType
 * @param {Set<string>} ids
 * @param {{id: string, source: string, target: string, type: string, refField: string}[]} out
 * @param {Set<string>} seen
 * @param {string[]} warnings
 */
function collectRelations(node, sourceId, sourceType, ids, out, seen, warnings) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) {
      collectRelations(item, sourceId, sourceType, ids, out, seen, warnings);
    }
    return;
  }

  for (const [key, value] of Object.entries(node)) {
    if (NOT_ENTITY_REFS.has(key)) continue;

    if (key.endsWith("_refs") && Array.isArray(value)) {
      for (const target of value) if (typeof target === "string") add(key, target);
    } else if (key.endsWith("_ref") && typeof value === "string") {
      add(key, value);
    } else if (typeof value === "object" && value !== null) {
      collectRelations(value, sourceId, sourceType, ids, out, seen, warnings);
    }
  }

  /**
   * @param {string} refField
   * @param {string} target
   */
  function add(refField, target) {
    if (!ids.has(target)) return;
    const id = `REL-${sourceId}-${refField}-${target}`;
    // The same reference can be reached twice when a nested object repeats it. An edge is
    // a fact about two entities, not a count, so the second sighting adds nothing.
    if (seen.has(id)) return;
    seen.add(id);

    const { type, curated } = resolveRelationType(sourceType, refField);
    if (!curated) {
      warnings.push(
        `Unknown reference field '${refField}' on '${sourceType}' - edge typed '${type}' from the field name.`,
      );
    }
    out.push({ id, source: sourceId, target, type, refField });
  }
}

/**
 * Build the realm model from an extraction.
 *
 * Pure: it reads no disk, so it can be handed an extraction produced any way at all -
 * which is what keeps the path resolution above confined to one function.
 *
 * @param {Map<string, {type: string, data: Record<string, unknown>, file: string}>} extracted
 * @param {Record<string, unknown>} [meta] the model's own `realm.yaml` - name, location,
 *   schema version. Optional, because a caller holding only an extraction (the checker's
 *   tests) has no file to read it from, and no rule asks about it.
 */
export function toRealmModel(extracted, meta = {}) {
  const ids = new Set(extracted.keys());
  /** @type {{id: string, name?: string, type: string, plane?: string, data: Record<string, unknown>, file?: string}[]} */
  const entities = [];
  /** @type {{id: string, source: string, target: string, type: string, refField: string}[]} */
  const relations = [];
  /** @type {Set<string>} */
  const seen = new Set();
  /** @type {string[]} */
  const warnings = [];
  /** @type {Set<string>} */
  const planesPresent = new Set();

  for (const [id, entity] of extracted) {
    const plane = planeOf(entity.file);
    if (plane) planesPresent.add(plane);
    // An unmapped collection falls back to its raw key rather than being dropped. A new
    // entity type should arrive as an odd-looking plural, not as an absence - the first is
    // noticed, the second reads as a model with fewer entities.
    const type = /** @type {Record<string, string>} */ (TYPE_OF_COLLECTION)[entity.type] ?? entity.type;
    entities.push({
      id,
      name: typeof entity.data?.name === "string" ? entity.data.name : undefined,
      type,
      plane,
      data: entity.data ?? {},
      file: entity.file,
    });
    collectRelations(entity.data, id, type, ids, relations, seen, warnings);
  }

  entities.sort((a, b) => a.id.localeCompare(b.id));
  relations.sort((a, b) => a.id.localeCompare(b.id));

  return {
    schema: "realm",
    // The model's own identity, from `realm.yaml`: what the property is called, where it is,
    // which schema version it declares. Every entity carried through and the thing they all
    // belong to did not, so a consumer could describe 145 rooms and walls without being able
    // to say whose they were. `realm.yaml` holds metadata only - no entity collection lives
    // there - so it is carried whole rather than field by field.
    realm: meta,
    planes: [...planesPresent].sort(),
    entities,
    relations,
    warnings,
    metadata: {
      entityCount: entities.length,
      relationCount: relations.length,
      entityTypeCounts: countBy(entities, (entity) => entity.type),
      relationTypeCounts: countBy(relations, (relation) => relation.type),
    },
  };
}

/**
 * Load a model directory and build its model in one call.
 * @param {string} modelDir
 */
export async function buildRealmModel(modelDir) {
  const [extracted, meta] = await Promise.all([
    loadRealmModel(modelDir),
    loadRealmMeta(modelDir),
  ]);
  return toRealmModel(extracted, meta);
}

/**
 * @template T
 * @param {T[]} items
 * @param {(item: T) => string} key
 * @returns {Record<string, number>}
 */
function countBy(items, key) {
  /** @type {Record<string, number>} */
  const counts = {};
  for (const item of items) counts[key(item)] = (counts[key(item)] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}
