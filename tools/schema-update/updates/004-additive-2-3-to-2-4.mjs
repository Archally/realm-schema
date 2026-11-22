import fs from "node:fs";
import path from "node:path";

import { setSchemaVersion } from "../rewrite.mjs";

const TARGET_SCHEMA_VERSION = "2.4.0";

/**
 * Realm schema 2.3.0 -> 2.4.0.
 *
 * The 2.4.0 schema accepts models valid under 2.3.0 and supports an optional
 * executable effect on a change item. This update writes only `schemaVersion`.
 * An effect uses explicit records and field values supplied by the model author.
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
  sourceVersion: "2.3",
  targetVersion: "2.4",
  targetSchemaVersion: TARGET_SCHEMA_VERSION,
  description: "Additive only - an optional executable effect on a change item. No model content changes; effects are written per item, never derived from prose.",
  plan,
  apply,
};
