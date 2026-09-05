import fs from "node:fs";
import path from "node:path";

import { setSchemaVersion } from "../rewrite.mjs";

const TARGET_SCHEMA_VERSION = "2.3.0";

/**
 * Realm schema 2.2.0 -> 2.3.0.
 *
 * 2.3 is ADDITIVE in full: a lifecycle block, placed members and promotion, neighbour
 * features, shared edges, furniture in an outdoor zone, epics, a change item's outcome,
 * position provenance, georeference fields, one zone type, eight equipment types, and the
 * electrical layer (a component vocabulary, three references, wall placement, cable runs).
 * Nothing was removed, renamed, retyped or made required, so a document valid against 2.2 is
 * valid against 2.3 unchanged, and the whole of this hop is the declaration.
 *
 * What it deliberately does NOT do: move a model's `x-` extensions onto the fields that
 * replaced them. That mapping is recorded per key in the 2.3 migration record
 * (`.migrations/001-v2-3-additive-fields.migration.yaml`) and was applied to the reference
 * model by hand, entity by entity, because each key's target needs a reading of the record
 * (a group's members are derived from a description, a hedge becomes a neighbour's
 * feature with a relative footprint). A tool that guessed would write coordinates nobody
 * measured.
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
  sourceVersion: "2.2",
  targetVersion: "2.3",
  targetSchemaVersion: TARGET_SCHEMA_VERSION,
  description: "Additive only - lifecycle, members, features, shared edges, epics, provenance, georeference, the electrical layer. No model content changes; x- extensions are mapped by hand per the migration record.",
  plan,
  apply,
};
