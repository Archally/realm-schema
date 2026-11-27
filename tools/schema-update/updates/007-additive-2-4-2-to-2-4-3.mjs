import fs from "node:fs";
import path from "node:path";

import { setSchemaVersion } from "../rewrite.mjs";

const SOURCE_SCHEMA_VERSION = "2.4.2";
const TARGET_SCHEMA_VERSION = "2.4.3";

/**
 * Realm schema 2.4.2 -> 2.4.3, a patch on the same 2.4 line.
 *
 * The 2.4.3 schema accepts models valid under 2.4.2 and adds the optional
 * `heating.emitters` list on rooms. This update writes only `schemaVersion`.
 *
 * The hop moves only a model that declares exactly 2.4.2. A model already on 2.4.3 has
 * nothing to change, and one that declares a later 2.4 patch is left alone and reported,
 * because rewriting it would move its declaration backwards.
 *
 * What it deliberately does NOT do: convert legacy flat room heating fields into
 * `emitters`. When a room states both underfloor heating and a radiator with a single
 * reference, the pairing cannot be recovered mechanically.
 */
function plan(modelDir) {
  const changes = [];
  const warnings = [];

  const realmYaml = path.join(modelDir, "realm.yaml");
  if (!fs.existsSync(realmYaml)) {
    warnings.push("No realm.yaml - the declared schema version cannot be updated.");
  } else {
    const text = fs.readFileSync(realmYaml, "utf8");
    const declared = declaredVersion(text);
    if (declared === SOURCE_SCHEMA_VERSION) {
      changes.push({
        type: "edit-yaml",
        path: "realm.yaml",
        detail: `schemaVersion -> "${TARGET_SCHEMA_VERSION}"`,
        referenceHits: 1,
        textHits: 0,
      });
    } else if (declared !== TARGET_SCHEMA_VERSION) {
      warnings.push(
        `realm.yaml declares ${declared ?? "no full version"}; only ${SOURCE_SCHEMA_VERSION} moves to ${TARGET_SCHEMA_VERSION}, so it is left as written.`,
      );
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
  if (!fs.existsSync(realmYaml)) {
    errors.push(`realm.yaml not found in ${modelDir}`);
  } else if (planned.changes.length > 0) {
    const { text, changed } = setSchemaVersion(
      fs.readFileSync(realmYaml, "utf8"),
      TARGET_SCHEMA_VERSION,
    );
    if (changed) {
      fs.writeFileSync(realmYaml, text, "utf8");
    }
  }

  return { ...planned, applied: errors.length === 0, errors };
}

/** The full schema version `realm.yaml` declares, or null. */
function declaredVersion(text) {
  return text.match(/^schemaVersion:\s*["']?(\d+\.\d+\.\d+)/m)?.[1] ?? null;
}

export const update = {
  sourceVersion: "2.4",
  targetVersion: "2.4",
  targetSchemaVersion: TARGET_SCHEMA_VERSION,
  description:
    "Additive only - optional heating.emitters list on rooms. No model content changes; the hop moves a 2.4.2 declaration to 2.4.3.",
  plan,
  apply,
};
