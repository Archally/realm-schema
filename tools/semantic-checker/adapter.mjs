// @ts-check
// ═══════════════════════════════════════════════════════════════════════════════
// Realm model -> the semantic checker's model-agnostic representation.
//
// The rule engine (`@archally/semantic-checker`) knows nothing about realm. It reads
// entities with a type, a plane and a data bag, and relations with a source, a target
// and a type. This file is the whole of what realm has to say to it.
//
// ── What is here and what is not ──────────────────────────────────────────────
// Building the graph is NOT here. That is the model builder's job, and it is the same
// graph the CLI prints and anything built on the package reads. This file only reshapes
// it into the engine's vocabulary. The distinction matters because a rule and a reader
// must be looking at one model: if the checker built its own graph, a rule could pass on
// a model that no other tool agrees with, and nothing would say so.
//
// So realm's whole contribution to the engine is a field rename and a structure block.
// ═══════════════════════════════════════════════════════════════════════════════

import { buildRealmModel, loadRealmModel, toRealmModel } from "../model-builder/build-model.mjs";
import { deriveRelationType, resolveRelationType } from "../model-builder/relation-types.mjs";

// Re-exported so a consumer of the checker never has to know the builder exists, and so
// the CLI beside this file keeps working against one import.
export { buildRealmModel, loadRealmModel, resolveRelationType, deriveRelationType };

/**
 * Reshape a realm model into the engine's representation.
 *
 * Accepts either a built model or the raw extraction, because the checker's CLI loads a
 * directory while its tests hand over a model they built in memory.
 *
 * @param {Map<string, {type: string, data: Record<string, unknown>, file: string}> | ReturnType<typeof toRealmModel>} source
 */
export function toCheckableModel(source) {
  const model = source instanceof Map ? toRealmModel(source) : source;

  return {
    schema: "realm",
    structure: {
      planes: model.planes.map((id) => ({ id })),
      layers: [],
      slices: [],
    },
    entities: model.entities.map((entity) => ({
      id: entity.id,
      displayId: entity.id,
      name: entity.name,
      type: entity.type,
      plane: entity.plane,
      slices: [],
      data: entity.data,
      fileOrigin: entity.file,
    })),
    // `refField` becomes `predicate`: the engine's word for which declaration produced an
    // edge. It is provenance, not a second opinion about the edge's type - a rule selects
    // on `type`, and `predicate` says where that type was read from.
    relations: model.relations.map((relation) => ({
      id: relation.id,
      source: relation.source,
      target: relation.target,
      type: relation.type,
      predicate: relation.refField,
    })),
    metadata: { entityTypeCounts: model.metadata.entityTypeCounts },
  };
}
