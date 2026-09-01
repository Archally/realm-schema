// @ts-check
// ═══════════════════════════════════════════════════════════════════════════════
// Layer 2 - Referential integrity and ID uniqueness.
//
// Two questions, and they carry different severities on purpose:
//
//   a `*_ref` / `*_refs` naming an id the model does not contain  -> WARNING
//   the same id used by two entities                              -> ERROR
//
// The split is not a style choice. A dangling reference is often a model still
// being written - the target is planned, or lives in a sibling model - so it must
// not stop a build. A duplicate id is the failure mode of a bad file split under
// concat merge: two files each contributing an entity that silently becomes one.
// Nothing downstream can recover from that, so it blocks.
//
// The walk mirrors realm-core's `scanObjectForRefs` exactly, including the order of
// its branches: a `_refs` key holding something other than an array, or a `_ref` key
// holding something other than a string, is not a reference - it falls through to the
// recursion, because that is where a nested object carrying real references lives.
// Any divergence here shows up as a different warning count, which is what the parity
// suite measures.
// ═══════════════════════════════════════════════════════════════════════════════

/** Keys that look like references but address a schema, not an entity. */
const NOT_ENTITY_REFS = new Set(["$ref", "$schema"]);

/**
 * @param {unknown} node
 * @param {string} sourceId
 * @param {Set<string>} entityIds
 * @param {{source_id: string, ref_field: string, target_id: string, message: string}[]} warnings
 */
function scanForRefs(node, sourceId, entityIds, warnings) {
  if (!node || typeof node !== "object") return;

  if (Array.isArray(node)) {
    for (const item of node) scanForRefs(item, sourceId, entityIds, warnings);
    return;
  }

  for (const [key, value] of Object.entries(node)) {
    if (NOT_ENTITY_REFS.has(key)) continue;

    if (key.endsWith("_refs") && Array.isArray(value)) {
      for (const target of value) {
        if (typeof target === "string" && !entityIds.has(target)) {
          warnings.push({
            source_id: sourceId,
            ref_field: key,
            target_id: target,
            message: `Target entity "${target}" not found in model`,
          });
        }
      }
    } else if (key.endsWith("_ref") && typeof value === "string") {
      if (!entityIds.has(value)) {
        warnings.push({
          source_id: sourceId,
          ref_field: key,
          target_id: value,
          message: `Target entity "${value}" not found in model`,
        });
      }
    } else if (typeof value === "object" && value !== null) {
      scanForRefs(value, sourceId, entityIds, warnings);
    }
  }
}

/**
 * @param {{entities: Map<string, {type: string, data: Record<string, unknown>, file: string}>,
 *          allIds: Set<string>,
 *          duplicates: {id: string, file: string}[]}} extraction
 */
export function validateReferential(extraction) {
  const { entities, allIds, duplicates } = extraction;

  /** @type {{source_id: string, ref_field: string, target_id: string, message: string}[]} */
  const warnings = [];
  for (const [id, entity] of entities) {
    scanForRefs(entity.data, id, allIds, warnings);
  }

  const issues = [
    ...warnings.map((warning) => ({
      severity: "warning",
      rule: "L2-REF",
      entity: warning.source_id,
      path: warning.ref_field,
      message: warning.message,
    })),
    ...duplicates.map((duplicate) => ({
      severity: "error",
      rule: "L2-DUP",
      entity: duplicate.id,
      file: duplicate.file,
      message: `Duplicate ID (also defined in ${duplicate.file})`,
    })),
  ];

  return { issues, referenceWarnings: warnings, entityCount: entities.size };
}
