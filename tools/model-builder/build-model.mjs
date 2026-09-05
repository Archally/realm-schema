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
 * `.realm/v2.3` makes the first segment `topology`; pointing one level higher makes it
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
  // A ceiling slab is a floor slab in the ceiling position: `construction.schema.yaml`
  // defines the key as `$ref: "#/$defs/floor_slab"`, so the key says where the slab sits and
  // the `$ref` says what it is. Which role a slab plays is in its own `slab_type`.
  ceiling_slab: "floor_slab",
  systems: "system",
  components: "component",
  utility_connections: "utility_connection",
  network_nodes: "network_node",
  iot_devices: "iot_device",
  network_links: "network_link",
  cable_runs: "cable_run",
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
  epics: "epic",
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
  return (await loadRealmSources(modelDir)).entities;
}

/**
 * The two things a model file can declare: entities, and relations between them.
 *
 * `spatial_relations` rows are not entities: they have no id, and they carry their predicate
 * as data (`relation_type`) rather than in a field name, so entity extraction does not see
 * them and they are read here. They are taken from the topology plane, where the merged
 * model puts them; a row filed under another plane is not read.
 *
 * @param {string} modelDir
 * @returns {Promise<{entities: Map<string, {type: string, data: Record<string, unknown>, file: string}>, spatialRelations: Record<string, unknown>[]}>}
 */
export async function loadRealmSources(modelDir) {
  modelDir = resolveModelDir(modelDir);
  const helpersPath = HELPERS_CANDIDATES.find((candidate) => fs.existsSync(candidate));
  if (!helpersPath) {
    throw new Error(
      `validator helpers not found. Looked in:\n  ${HELPERS_CANDIDATES.join("\n  ")}`,
    );
  }
  const helpers = await import(pathToFileURL(helpersPath).href);
  const { modelFiles } = helpers.discoverModelFiles(modelDir);

  /** @type {Record<string, unknown>[]} */
  const spatialRelations = [];
  for (const [file, data] of modelFiles) {
    if (planeOf(file) !== "topology") continue;
    const declared = /** @type {Record<string, unknown>} */ (data)?.["spatial_relations"];
    if (Array.isArray(declared)) {
      for (const row of declared) if (row && typeof row === "object") spatialRelations.push(row);
    }
  }

  return { entities: helpers.extractEntities(modelFiles).entities, spatialRelations };
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
 * Reference fields whose name is a sentence rather than a `_ref` suffix, because the owner
 * named the fact ("derived from") and not the pointer. Each is an edge like any other.
 */
const SENTENCE_NAMED_REFERENCES = new Set(["position_derived_from"]);

/** Opening types you can see through and not walk through. */
const SIGHT_ONLY_OPENINGS = new Set(["window", "skylight"]);

/**
 * A window is not a door.
 *
 * One room can have two openings onto the same zone - a terrace door you walk through and a
 * fixed pane you only look through. The distinction is written in the opening's own data, so
 * the predicate reads it: an opening that does not open `overlooks` rather than `opens-to`.
 *
 * @param {Record<string, unknown>} node the object the reference sits in
 * @param {string} refField
 * @returns {string | null} the predicate, or null to use the vocabulary
 */
function sightOnlyPredicate(node, refField) {
  if (refField !== "opens_to_room_ref" && refField !== "opens_to_zone_ref") return null;
  const openingType = node["opening_type"];
  const fixed =
    node["openable"] === false ||
    (typeof openingType === "string" && SIGHT_ONLY_OPENINGS.has(openingType));
  return fixed ? "overlooks" : null;
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

  // Narrowed once, for the checker's sake: the guards above leave `node` an object, but
  // `unknown` narrows only as far as `object`, which has no index signature.
  const record = /** @type {Record<string, unknown>} */ (node);

  for (const [key, value] of Object.entries(record)) {
    if (NOT_ENTITY_REFS.has(key)) continue;

    if (key.endsWith("_refs") && Array.isArray(value)) {
      for (const target of value) if (typeof target === "string") add(key, target);
    } else if ((key.endsWith("_ref") || SENTENCE_NAMED_REFERENCES.has(key)) && typeof value === "string") {
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

    const sight = sightOnlyPredicate(record, refField);
    const { type, curated } = sight
      ? { type: sight, curated: true }
      : resolveRelationType(sourceType, refField);

    // The predicate is part of the id because it is not always a function of the field: a
    // fixed pane and a terrace door onto one zone are `overlooks` and `opens-to` through the
    // same field, and a shared id would drop the second as a repeat of the first.
    const id = `REL-${sourceId}-${refField}-${type}-${target}`;
    // The same fact can be reached twice when two nested objects state it - a wall whose two
    // openings both name the room they were cut from. An edge is a fact about two entities,
    // not a count, so the second sighting adds nothing.
    if (seen.has(id)) return;
    seen.add(id);

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
 * @param {Record<string, unknown>[]} [spatialRelations] the topology plane's
 *   `spatial_relations` rows. Optional for the same reason: an extraction carries none.
 */
export function toRealmModel(extracted, meta = {}, spatialRelations = []) {
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

  // Relations the model declares directly, predicate and all. A row naming an id the model
  // does not contain is skipped like any other dangling reference - the validator reports
  // those, and an edge to nowhere would let an entity pass a rule asking whether it is
  // connected.
  for (const row of spatialRelations) {
    const source = row["from_ref"];
    const target = row["to_ref"];
    const type = row["relation_type"];
    if (typeof source !== "string" || typeof target !== "string" || typeof type !== "string") {
      warnings.push("Skipping spatial_relation with missing from_ref, to_ref or relation_type.");
      continue;
    }
    if (!ids.has(source) || !ids.has(target)) continue;
    const id = `REL-${source}-spatial_relation-${type}-${target}`;
    if (seen.has(id)) continue;
    seen.add(id);
    relations.push({ id, source, target, type, refField: "spatial_relation" });
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
  const [sources, meta] = await Promise.all([
    loadRealmSources(modelDir),
    loadRealmMeta(modelDir),
  ]);
  return toRealmModel(sources.entities, meta, sources.spatialRelations);
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
