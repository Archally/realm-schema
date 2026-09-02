import fs from "node:fs";
import path from "node:path";

import { setSchemaVersion } from "../rewrite.mjs";

const TARGET_SCHEMA_VERSION = "2.1.0";

/**
 * Realm schema 2.0.0 -> 2.1.0.
 *
 * 2.1 is ADDITIVE in full: enum values, optional fields, `^x-` extension keys, a widened
 * reference union and two relaxed id patterns. Nothing was removed, renamed or made
 * required, so a document valid against 2.0 is valid against 2.1 unchanged and the whole
 * of this hop is the declaration.
 *
 * It exists as a module rather than being folded into the next one because the chain has
 * to be able to say so. A model on 2.0 asking what stands between it and the current
 * schema deserves "one rename, and before it nothing" - and the alternative, declaring
 * 002 as `2.0 -> 2.2`, would quietly claim the additive hop had been examined for
 * transformations when no module had ever looked.
 */
function plan(modelDir) {
  const changes = [];
  const warnings = [];

  const realmYaml = path.join(modelDir, "realm.yaml");
  if (!fs.existsSync(realmYaml)) {
    warnings.push("No realm.yaml - the declared schema version cannot be updated.");
  } else {
    const { changed } = setSchemaVersion(fs.readFileSync(realmYaml, "utf8"), TARGET_SCHEMA_VERSION);
    if (changed) {
      changes.push({
        type: "edit-yaml",
        path: "realm.yaml",
        detail: `schemaVersion -> "${TARGET_SCHEMA_VERSION}"`,
        referenceHits: 1,
        textHits: 0,
      });
    }
  }

  return {
    sourceVersion: update.sourceVersion,
    targetVersion: update.targetVersion,
    description: update.description,
    changes,
    warnings,
  };
}

function apply(modelDir) {
  const planned = plan(modelDir);
  const errors = [];

  const realmYaml = path.join(modelDir, "realm.yaml");
  if (fs.existsSync(realmYaml)) {
    const { text, changed } = setSchemaVersion(fs.readFileSync(realmYaml, "utf8"), TARGET_SCHEMA_VERSION);
    if (changed) fs.writeFileSync(realmYaml, text, "utf8");
  } else {
    errors.push(`realm.yaml not found in ${modelDir}`);
  }

  return { ...planned, applied: errors.length === 0, errors };
}

export const update = {
  sourceVersion: "2.0",
  targetVersion: "2.1",
  targetSchemaVersion: TARGET_SCHEMA_VERSION,
  description: "Additive only - new enum values, optional fields and x- extension keys. No model content changes.",
  plan,
  apply,
};
