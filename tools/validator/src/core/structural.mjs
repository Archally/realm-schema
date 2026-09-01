// @ts-check
// ═══════════════════════════════════════════════════════════════════════════════
// Layer 1 - Structural: each model file against the schema that governs it.
//
// Ajv 2020, one compiled validator per schema, one pass per file. The Ajv options
// match realm-core's exactly (`strict: false, allErrors: true, validateSchema: false`
// plus ajv-formats) because a different option set is a different verdict: `allErrors`
// changes how many errors are reported, and formats decide whether a malformed date is
// an error at all.
//
// ── On files this layer cannot place ──────────────────────────────────────────
// A model file with no schema mapping contributes NO error, so this layer's verdict
// matches core's. But it is REPORTED, as info, because silence about unrecognised
// input is how a whole layer goes unvalidated without anyone noticing - the defect
// this project has already seen twice, in a public validator that returned null for an
// unknown layer type and in core's own `continue // unknown file - skip silently`.
// Reporting without failing keeps the verdicts equal and the omission visible.
// ═══════════════════════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import YAML from "yaml";

import { DATA_FILE_TO_SCHEMA, CONSTRUCTION_SCHEMA, SCHEMA_BASE_URI, toPosix } from "./helpers.mjs";

/** Files that are configuration or generator input, not model content. */
const NOT_MODEL_CONTENT = /(^|\/)(realm-config|[a-z-]+-config)\.yaml$/;

/**
 * Which schema governs a model file, or null when nothing does.
 * @param {string} relPath posix-relative to the model dir
 */
export function resolveSchemaForFile(relPath) {
  if (relPath.startsWith("topology/construction/")) return CONSTRUCTION_SCHEMA;
  return DATA_FILE_TO_SCHEMA[relPath] ?? null;
}

/**
 * Compile every schema in the directory into one Ajv instance.
 * Schemas carry root-relative `$id`s, so registering them by that id is what makes
 * a `$ref` across plane directories resolve.
 * @param {string} schemaDir
 */
function buildValidators(schemaDir) {
  const ajv = new Ajv2020({ strict: false, allErrors: true, validateSchema: false });
  addFormats(ajv);

  /** @type {string[]} */
  const schemaFiles = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".schema.yaml")) schemaFiles.push(full);
    }
  };
  walk(schemaDir);

  // Root-level schemas register before nested ones, so a nested schema's `$ref` target
  // already exists when it compiles.
  schemaFiles.sort((a, b) => {
    const depth = (file) => (toPosix(path.relative(schemaDir, file)).includes("/") ? 1 : 0);
    return depth(a) !== depth(b) ? depth(a) - depth(b) : a.localeCompare(b);
  });

  for (const file of schemaFiles) {
    const relPath = toPosix(path.relative(schemaDir, file));
    let schema;
    try {
      schema = YAML.parse(fs.readFileSync(file, "utf8"));
    } catch {
      continue;
    }
    if (!schema || typeof schema !== "object" || Array.isArray(schema)) continue;

    // The declared `$id` is root-relative ("context/persons.schema.yaml"), which gives Ajv
    // no base to resolve "../metamodel.schema.yaml" against - it lands on "/metamodel…" and
    // fails. Overriding with an absolute URI, exactly as realm-core does, is what makes a
    // cross-directory `$ref` resolve.
    schema.$id = SCHEMA_BASE_URI + relPath;
    try {
      ajv.addSchema(schema);
    } catch {
      // A schema that cannot compile is reported when a file asks for it, not here.
    }
  }

  return ajv;
}

/**
 * @param {Map<string, unknown>} modelFiles relPath -> parsed YAML
 * @param {string} schemaDir
 */
export function validateStructural(modelFiles, schemaDir) {
  const ajv = buildValidators(schemaDir);

  const issues = [];
  const unmapped = [];

  for (const [relPath, data] of modelFiles) {
    const schemaPath = resolveSchemaForFile(relPath);
    if (!schemaPath) {
      if (!NOT_MODEL_CONTENT.test(relPath)) unmapped.push(relPath);
      continue;
    }

    const validate = ajv.getSchema(SCHEMA_BASE_URI + schemaPath);
    if (!validate) {
      issues.push({
        severity: "error",
        rule: "L1-SCHEMA",
        file: relPath,
        message: `Schema "${schemaPath}" is not present in the schema directory`,
      });
      continue;
    }

    if (validate(data)) continue;
    for (const error of validate.errors ?? []) {
      issues.push({
        severity: "error",
        rule: "L1-SCHEMA",
        file: relPath,
        path: error.instancePath || "/",
        message: describeError(error),
      });
    }
  }

  for (const relPath of unmapped) {
    issues.push({
      severity: "info",
      rule: "L1-UNMAPPED",
      file: relPath,
      message: "No schema governs this file, so nothing validated it",
    });
  }

  return { issues, unmapped };
}

/**
 * Ajv's own text is information-free for the two keywords that matter most: it says a
 * property is not allowed without naming it, and an enum is invalid without listing what
 * would have been valid. Ajv computed both and left them in `params`.
 * @param {{message?: string, keyword: string, params: Record<string, unknown>}} error
 */
function describeError(error) {
  const message = error.message ?? "is invalid";
  if (error.keyword === "additionalProperties" && error.params.additionalProperty) {
    return `${message} ("${error.params.additionalProperty}")`;
  }
  if (error.keyword === "enum" && Array.isArray(error.params.allowedValues)) {
    return `${message} (${error.params.allowedValues.join(", ")})`;
  }
  return message;
}
