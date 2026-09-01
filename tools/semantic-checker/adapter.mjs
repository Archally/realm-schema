// @ts-check
// ═══════════════════════════════════════════════════════════════════════════════
// Realm model -> the semantic checker's model-agnostic representation.
//
// The rule engine (`@archally/semantic-checker`) knows nothing about realm. It reads
// entities with a type, a plane and a data bag, and relations with a source, a target
// and a type. This file is the whole of what realm has to say to it.
//
// ── Why this file is shared rather than written twice ─────────────────────────
// The obvious alternative is one adapter beside the CLI that runs in this repository
// and another beside the published one. Measured before choosing: the sibling schema
// that took that route has two adapters carrying the same logic, drifted into
// different formatting and a different import path, with nothing comparing them. One
// file, ported whole and hash-gated, cannot do that.
//
// So this stays plain ESM with no project-internal imports beyond the validator's own
// helpers, which travel with it.
// ═══════════════════════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

/**
 * Where the validator's file discovery and entity extraction live, tried in order.
 *
 * The two trees do NOT agree on this path, and a static import cannot span both: the
 * validator is canonical at `.shared/validator/` and deploys to `tools/validator/src/`,
 * so the same relative import is one segment short on the published side. Found by
 * running the published copy rather than by reading it - the canonical side had been
 * green throughout.
 *
 * Resolving from candidates is the shape this repository already uses for the same
 * problem in the realm CLI. What it buys beyond a corrected path is that neither tree
 * carries a path that is wrong in the other, so the file stays portable by construction.
 */
const HELPERS_CANDIDATES = [
  path.resolve(HERE, "../validator/core/helpers.mjs"),
  path.resolve(HERE, "../validator/src/core/helpers.mjs"),
];

/**
 * Collection key -> the entity type a rule names.
 *
 * `extractEntities` keys an entity by the YAML collection it was found in, which is
 * plural (`specimens`) or, in the construction layer, already singular (`floor_slab`).
 * Rules read far better against the singular, and realm's own model vocabulary is
 * singular, so the mapping is stated rather than guessed: naive de-pluralisation would
 * turn `soil_profiles` into `soil_profile` correctly and `boundary_segments` into
 * `boundary_segment` correctly, and then quietly mangle the first irregular key added.
 */
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

/** The five planes, by the directory a file sits in. Root files belong to no plane. */
const PLANE_OF_DIR = {
  topology: "topology",
  infrastructure: "infrastructure",
  nature: "nature",
  operations: "operations",
  context: "context",
};

/** Keys that look like references but address a schema. Same list the validator uses. */
const NOT_ENTITY_REFS = new Set(["$ref", "$schema"]);

/**
 * The relation type a reference field expresses: the field name with its `_ref`/`_refs`
 * suffix removed and underscores turned into hyphens, so `care_profile_ref` becomes
 * `care-profile` and `outdoor_zone_ref` becomes `outdoor-zone`.
 *
 * Derived rather than named in a table on purpose. A table would be a second place to
 * state a fact the field name already carries, and it would go stale silently the first
 * time the schema gained a reference nobody added a row for - the failure being a
 * relation that exists in the model and not in the graph, which reads to every rule as
 * an entity that is simply unconnected.
 */
export function relationTypeOf(refField) {
  return refField.replace(/_refs?$/, "").replace(/_/g, "-");
}

/**
 * Walk one entity's data for reference fields, emitting a relation per resolved target.
 *
 * References to ids the model does not contain are SKIPPED rather than emitted as edges
 * to nowhere. The validator's referential layer already reports those as warnings, and
 * a dangling reference should not let an entity pass a rule that asks whether it is
 * connected: an edge to something that does not exist is not a connection.
 */
function collectRelations(node, sourceId, ids, out, seen) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) collectRelations(item, sourceId, ids, out, seen);
    return;
  }

  for (const [key, value] of Object.entries(node)) {
    if (NOT_ENTITY_REFS.has(key)) continue;

    if (key.endsWith("_refs") && Array.isArray(value)) {
      for (const target of value) if (typeof target === "string") add(key, target);
    } else if (key.endsWith("_ref") && typeof value === "string") {
      add(key, value);
    } else if (typeof value === "object" && value !== null) {
      collectRelations(value, sourceId, ids, out, seen);
    }
  }

  function add(refField, target) {
    if (!ids.has(target)) return;
    const id = `REL-${sourceId}-${refField}-${target}`;
    // The same reference can be reached twice when a nested object repeats it. An edge
    // is a fact about two entities, not a count, so the second sighting adds nothing.
    if (seen.has(id)) return;
    seen.add(id);
    out.push({
      id,
      source: sourceId,
      target,
      type: relationTypeOf(refField),
      predicate: refField,
    });
  }
}

/**
 * Load a realm model directory into the extraction the adapter reads.
 *
 * The discovery and extraction belong to the validator and are borrowed rather than
 * reimplemented: two walks would agree until one of them learned about a new directory,
 * and the disagreement would surface here as a model that is simply missing entities.
 * @param {string} modelDir
 */
export async function loadRealmModel(modelDir) {
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
 * Build the checkable model from an extraction.
 *
 * Pure: it imports nothing and reads no disk, so it can be handed a model built any way
 * at all - which is also what keeps the path problem above confined to one function.
 * @param {Map<string, {type: string, data: Record<string, unknown>, file: string}>} extracted
 */
export function toCheckableModel(extracted) {
  const ids = new Set(extracted.keys());
  const entities = [];
  const relations = [];
  const seen = new Set();
  const planesPresent = new Set();

  for (const [id, entity] of extracted) {
    const plane = PLANE_OF_DIR[entity.file.split("/")[0]];
    if (plane) planesPresent.add(plane);
    entities.push({
      id,
      displayId: id,
      name: typeof entity.data?.name === "string" ? entity.data.name : undefined,
      // An unmapped collection falls back to its raw key rather than being dropped. A
      // new entity type should arrive in the rules as an odd-looking plural, not as an
      // absence - the first is noticed, the second reads as a model with fewer entities.
      type: TYPE_OF_COLLECTION[entity.type] ?? entity.type,
      plane,
      slices: [],
      data: entity.data ?? {},
      fileOrigin: entity.file,
    });
    collectRelations(entity.data, id, ids, relations, seen);
  }

  return {
    schema: "realm",
    structure: { planes: [...planesPresent].sort().map((id) => ({ id })), layers: [], slices: [] },
    entities,
    relations,
    metadata: { entityTypeCounts: countBy(entities, (e) => e.type) },
  };
}

function countBy(items, key) {
  const counts = {};
  for (const item of items) counts[key(item)] = (counts[key(item)] ?? 0) + 1;
  return counts;
}
