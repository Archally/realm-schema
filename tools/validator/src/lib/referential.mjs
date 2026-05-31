// ═══════════════════════════════════════════════════════════════════════════════
// Layer 2: Referential Integrity
// Cross-file reference resolution + ID uniqueness.
// ═══════════════════════════════════════════════════════════════════════════════

import { ID_RE } from "./helpers.mjs";

/**
 * Recursively scans an object for *_ref and *_refs fields,
 * checking that each referenced ID exists in the global entity set.
 */
function scanRefs(obj, allIds, file, pathStack = [], issues = []) {
  if (Array.isArray(obj)) {
    obj.forEach((item, idx) => scanRefs(item, allIds, file, [...pathStack, `[${idx}]`], issues));
    return issues;
  }
  if (!obj || typeof obj !== "object") return issues;

  for (const [key, value] of Object.entries(obj)) {
    // Skip non-reference fields
    if (key === "id" || key === "semantic_source_refs" || key === "derived_from") continue;

    const currentPath = [...pathStack, key].join(".");

    if (key.endsWith("_ref") && typeof value === "string" && ID_RE.test(value)) {
      if (!allIds.has(value)) {
        issues.push({ severity: "error", file, path: currentPath, rule: "L2-REF", message: `Dangling ref: ${value}` });
      }
    } else if (key.endsWith("_refs") && Array.isArray(value)) {
      for (const ref of value) {
        if (typeof ref === "string" && ID_RE.test(ref) && !allIds.has(ref)) {
          issues.push({ severity: "error", file, path: currentPath, rule: "L2-REF", message: `Dangling ref: ${ref}` });
        }
      }
    }

    scanRefs(value, allIds, file, [...pathStack, key], issues);
  }
  return issues;
}

export function validateReferential(modelFiles, entities, allIds, duplicates) {
  const issues = [];

  // ID uniqueness
  for (const dup of duplicates) {
    issues.push({ severity: "error", file: dup.file, rule: "L2-DUP", message: `Duplicate entity ID: ${dup.id}` });
  }

  // Reference integrity
  for (const [relPath, data] of modelFiles) {
    if (!data || typeof data !== "object") continue;
    scanRefs(data, allIds, relPath, [], issues);
  }

  return {
    issues,
    entityCount: entities.size,
    refIssues: issues.filter(i => i.rule === "L2-REF").length,
  };
}
