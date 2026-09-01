// @ts-check
/**
 * Indexes over a built realm model.
 *
 * The model builder emits two flat arrays, which is the right shape to serialise and the
 * wrong shape to ask questions of. Every projection in this kit starts by asking "what is
 * this id", "what is of this type" and "what points at this" - three lookups that are linear
 * scans over 588 entities and 1512 relations unless someone builds them once.
 */

/**
 * Entity types the construction layer DERIVES from rooms, wings and floors.
 *
 * They are 51 of the worked example's 145 entities and, with their edges, 28% of its
 * relations - so a catalogue sorted by type lists 43 wall segments ahead of 15 rooms. A
 * document summarises them and offers to enumerate them; it does not omit them, because a
 * model with wrong geometry would then read exactly like a model with right geometry.
 */
export const GEOMETRY_TYPES = new Set([
  "wall_segment",
  "roof_plane",
  "floor_slab",
  "ceiling_slab",
]);

/**
 * @typedef {{id: string, name?: string, type: string, plane?: string, data: Record<string, any>, file?: string}} RealmEntity
 * @typedef {{id: string, source: string, target: string, type: string, refField: string}} RealmRelation
 * @typedef {{schema: string, realm?: Record<string, any>, planes: string[], entities: RealmEntity[], relations: RealmRelation[], warnings: any[], metadata: Record<string, any>}} RealmModel
 */

/**
 * @param {RealmModel} model
 */
export function indexModel(model) {
  /** @type {Map<string, RealmEntity>} */
  const byId = new Map();
  /** @type {Map<string, RealmEntity[]>} */
  const byType = new Map();
  for (const entity of model.entities) {
    byId.set(entity.id, entity);
    const list = byType.get(entity.type);
    if (list) list.push(entity);
    else byType.set(entity.type, [entity]);
  }

  /** @type {Map<string, RealmRelation[]>} */
  const outgoing = new Map();
  /** @type {Map<string, RealmRelation[]>} */
  const incoming = new Map();
  for (const relation of model.relations) {
    const from = outgoing.get(relation.source);
    if (from) from.push(relation);
    else outgoing.set(relation.source, [relation]);
    const to = incoming.get(relation.target);
    if (to) to.push(relation);
    else incoming.set(relation.target, [relation]);
  }

  return { model, byId, byType, outgoing, incoming };
}

/** @typedef {ReturnType<typeof indexModel>} RealmIndex */

/**
 * Entities of one type, in id order. Always an array, so a caller never branches on absence.
 * @param {RealmIndex} index
 * @param {string} type
 * @returns {RealmEntity[]}
 */
export function ofType(index, type) {
  return index.byType.get(type) ?? [];
}

/**
 * How an entity is named in running text: its name with its id, or just the id.
 *
 * The id is always shown, never only the name. A property document is read beside the model
 * it describes, and "the north hedge" is not something a reader can look up.
 *
 * @param {RealmIndex} index
 * @param {string|undefined} id
 * @returns {string}
 */
export function nameOf(index, id) {
  if (!id) return "";
  const entity = index.byId.get(id);
  if (!entity) return id;
  return entity.name ? `${entity.name} (${entity.id})` : entity.id;
}

/**
 * Follow one reference field from an entity, returning the entities it resolves to.
 *
 * Reads the RELATION graph rather than the raw field, so a dangling reference yields nothing
 * here exactly as it yields no edge there - one answer to "what is this connected to",
 * rather than a document that shows a link the graph does not have.
 *
 * @param {RealmIndex} index
 * @param {string} id
 * @param {string} refField
 * @returns {RealmEntity[]}
 */
export function followField(index, id, refField) {
  return (index.outgoing.get(id) ?? [])
    .filter((relation) => relation.refField === refField)
    .map((relation) => index.byId.get(relation.target))
    .filter(/** @returns {entity is RealmEntity} */ (entity) => Boolean(entity));
}

/**
 * Entities pointing AT this one over a given relation type.
 * @param {RealmIndex} index
 * @param {string} id
 * @param {string} relationType
 * @returns {RealmEntity[]}
 */
export function incomingOfType(index, id, relationType) {
  return (index.incoming.get(id) ?? [])
    .filter((relation) => relation.type === relationType)
    .map((relation) => index.byId.get(relation.source))
    .filter(/** @returns {entity is RealmEntity} */ (entity) => Boolean(entity));
}

/**
 * Group entities by one of their data fields, preserving id order within each group.
 * @template {RealmEntity} T
 * @param {T[]} entities
 * @param {string} field
 * @returns {Map<string, T[]>}
 */
export function groupByField(entities, field) {
  /** @type {Map<string, T[]>} */
  const groups = new Map();
  for (const entity of entities) {
    const key = typeof entity.data?.[field] === "string" ? entity.data[field] : "unspecified";
    const list = groups.get(key);
    if (list) list.push(entity);
    else groups.set(key, [entity]);
  }
  return groups;
}
