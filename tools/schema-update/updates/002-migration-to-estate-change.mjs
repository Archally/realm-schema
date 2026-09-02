import fs from "node:fs";
import path from "node:path";

import { commit, modelFiles, setSchemaVersion, substitute } from "../rewrite.mjs";

const TARGET_SCHEMA_VERSION = "2.2.0";

/**
 * Realm schema 2.1.0 -> 2.2.0: the `migration` entity becomes `estate_change`.
 *
 * The word had three unrelated meanings in play at once - a change to the estate, a
 * schema version upgrade, and a staged edit in tooling - and 2.2 gives the first its own
 * name. That makes this the one hop in realm's history that a model cannot cross by
 * doing nothing.
 *
 * ── Why the rewrite reaches into prose ────────────────────────────────────────
 * An id is not confined to the field that declares it. In a real estate model the
 * identifier appears in descriptions, notes, outcomes, condition text and tags, because
 * a person writing about the work refers to it the way the model does. Rewriting only
 * the reference fields would migrate the structure and leave the sentences pointing at
 * identifiers the model no longer contains - a document that reads as current and is
 * not.
 *
 * The substitution is safe outside a parser because the token is: three fixed capitals,
 * at least three digits, an optional family letter, word-bounded. What the tool cannot
 * do is judge, so it COUNTS the two classes separately and reports them, and `--dry-run`
 * shows both before anything is written.
 */
export const SUBSTITUTIONS = [
  // The id itself, wherever it appears. MIG009a -> ECH009a; the trailing letter names
  // one member of a change family and travels with the number.
  { pattern: /\bMIG(\d{3,}[a-z]?)\b/g, replacement: "ECH$1" },

  // Reference fields. Each is spelt out because `\b` does not break on `_`, so a rule
  // for `migration_ref` does not reach inside `depends_on_migration_refs`.
  { pattern: /\bdepends_on_migration_refs\b/g, replacement: "depends_on_estate_change_refs" },
  { pattern: /\blinked_migration_ref\b/g, replacement: "linked_estate_change_ref" },
  { pattern: /\bmigration_ref(s?)\b/g, replacement: "estate_change_ref$1" },

  // The root key, the config key and the one enum value that carried the old word.
  { pattern: /^migrations:/, replacement: "estate_changes:" },
  { pattern: /\bmigration_schema\b/g, replacement: "estate_change_schema" },
  { pattern: /\bmigration-applied\b/g, replacement: "estate-change-applied" },

  // File names, which appear in the header comments realm models carry as a contents
  // list. A comment naming a file this hop renames is stale the moment it lands.
  { pattern: /\bmigrations\.yaml\b/g, replacement: "estate-changes.yaml" },
  { pattern: /\bmigration\.schema\.yaml\b/g, replacement: "estate-change.schema.yaml" },
];

/** `migrations.yaml`, and any concat-split sibling of it, become `estate-changes*.yaml`. */
function renamedFile(relativePath) {
  const dir = path.posix.dirname(relativePath);
  const base = path.posix.basename(relativePath);
  const match = base.match(/^migrations(-[^/]*)?\.ya?ml$/);
  if (!match) return null;
  const renamed = base.replace(/^migrations/, "estate-changes");
  return dir === "." ? renamed : `${dir}/${renamed}`;
}

/** What this hop would do to `modelDir`, without touching it. */
function survey(modelDir) {
  const changes = [];
  const warnings = [];
  const edits = [];
  const renames = [];

  for (const relative of modelFiles(modelDir)) {
    const absolute = path.join(modelDir, relative);
    let text = fs.readFileSync(absolute, "utf8");

    let referenceHits = 0;
    let textHits = 0;
    const substituted = substitute(text, SUBSTITUTIONS);
    text = substituted.text;
    referenceHits += substituted.referenceHits;
    textHits += substituted.textHits;

    if (relative === "realm.yaml") {
      const bumped = setSchemaVersion(text, TARGET_SCHEMA_VERSION);
      text = bumped.text;
      if (bumped.changed) referenceHits += 1;
    }

    const renamedTo = renamedFile(relative);

    // `MIG` left over as anything but a full id is reported with the line it sits on,
    // rather than rewritten. The shape of the pattern is what makes this a report and
    // not a defect: a real estate model contains a MIG/MAG welder, and a substitution
    // loose enough to catch a truncated reference would rename the welder. Three digits
    // and a word boundary is the line between an identifier and a word that starts the
    // same way; anything on the far side of it is a person's judgement, not a rename.
    const leftover = [];
    text.split("\n").forEach((line, index) => {
      if (!/\bMIG\b|\bMIG\d{1,2}\b/.test(line)) return;
      leftover.push(`line ${index + 1}: ${line.trim().slice(0, 60)}`);
    });
    if (leftover.length > 0) {
      warnings.push(
        `${renamedTo ?? relative}: ${leftover.length} line(s) hold MIG without a complete id, ` +
          `left untouched - review by hand:\n      ${leftover.slice(0, 3).join("\n      ")}` +
          (leftover.length > 3 ? `\n      ... and ${leftover.length - 3} more` : ""),
      );
    }

    if (renamedTo) {
      renames.push({ from: absolute, to: path.join(modelDir, renamedTo) });
      changes.push({
        type: "rename-file",
        path: relative,
        detail: `-> ${renamedTo}`,
        referenceHits: 0,
        textHits: 0,
      });
    }

    const finalRelative = renamedTo ?? relative;
    if (referenceHits > 0 || textHits > 0) {
      changes.push({
        type: "edit-yaml",
        path: finalRelative,
        detail: `${referenceHits} in reference fields, ${textHits} in text`,
        referenceHits,
        textHits,
      });
      // The path AFTER any rename - see `commit`, which renames before it writes.
      edits.push({ absolutePath: path.join(modelDir, finalRelative), text });
    }
  }

  // Realm model directories are named for the model's own line far more often than for
  // the schema's, so this renames only a directory that IS a version directory for the
  // version being left behind.
  if (path.basename(path.resolve(modelDir)) === `v${update.sourceVersion}`) {
    changes.push({
      type: "rename-directory",
      path: `v${update.sourceVersion}`,
      detail: `-> v${update.targetVersion}`,
      referenceHits: 0,
      textHits: 0,
    });
  }

  return { changes, warnings, edits, renames };
}

function plan(modelDir) {
  const { changes, warnings } = survey(modelDir);
  return {
    sourceVersion: update.sourceVersion,
    targetVersion: update.targetVersion,
    description: update.description,
    changes,
    warnings,
  };
}

function apply(modelDir) {
  const errors = [];
  let surveyed;
  try {
    surveyed = survey(modelDir);
  } catch (error) {
    return {
      sourceVersion: update.sourceVersion,
      targetVersion: update.targetVersion,
      description: update.description,
      changes: [],
      warnings: [],
      applied: false,
      errors: [`Could not read ${modelDir}: ${error.message}`],
    };
  }

  const { changes, warnings, edits, renames } = surveyed;
  try {
    commit(edits, renames);
    if (changes.some((change) => change.type === "rename-directory")) {
      const resolved = path.resolve(modelDir);
      fs.renameSync(resolved, path.join(path.dirname(resolved), `v${update.targetVersion}`));
    }
  } catch (error) {
    errors.push(error.message);
  }

  return {
    sourceVersion: update.sourceVersion,
    targetVersion: update.targetVersion,
    description: update.description,
    changes,
    warnings,
    applied: errors.length === 0,
    errors,
  };
}

export const update = {
  sourceVersion: "2.1",
  targetVersion: "2.2",
  targetSchemaVersion: TARGET_SCHEMA_VERSION,
  description:
    "Rename the migration entity to estate_change: MIG### -> ECH###, migrations.yaml -> estate-changes.yaml, " +
    "and every migration_ref field to estate_change_ref. Ids are rewritten in descriptions and tags too.",
  plan,
  apply,
};
