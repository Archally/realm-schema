// ═══════════════════════════════════════════════════════════════════════════════
// Layer 1: Structural Validation (JSON Schema / Ajv)
// Per-file schema validation against v2.0 schemas.
// ═══════════════════════════════════════════════════════════════════════════════

import { DATA_FILE_TO_SCHEMA, CONSTRUCTION_SCHEMA, SCHEMA_BASE_URI } from "./helpers.mjs";

export function validateStructural(ajv, modelFiles) {
  const issues = [];
  let filesValidated = 0;
  let filesSkipped = 0;

  for (const [relPath, data] of modelFiles) {
    const schemaKey = DATA_FILE_TO_SCHEMA[relPath]
      ?? (relPath.startsWith("topology/construction/") ? CONSTRUCTION_SCHEMA : null);

    if (!schemaKey) { filesSkipped++; continue; }

    const schemaUri = SCHEMA_BASE_URI + schemaKey;
    const validate = ajv.getSchema(schemaUri);
    if (!validate) {
      issues.push({ severity: "error", file: relPath, rule: "L1", message: `Schema not found: ${schemaKey}` });
      continue;
    }
    if (!validate(data)) {
      for (const err of validate.errors || []) {
        issues.push({
          severity: "error",
          file: relPath,
          rule: "L1",
          message: `${err.instancePath || "/"} ${err.message}`,
        });
      }
    }
    filesValidated++;
  }
  return { issues, filesValidated, filesSkipped };
}
