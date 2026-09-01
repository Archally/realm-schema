#!/usr/bin/env node
// @ts-check
// ═══════════════════════════════════════════════════════════════════════════════
// Realm model validator - the one command line, five layers.
//
//   1 Structural    each file against the schema that governs it
//   2 Referential   references resolve, ids are unique
//   3 Geometric     spatial invariants (G01-G17)
//   4 Cross-Layer   semantic <-> construction consistency (C01-C10)
//   5 Semantic      domain rules (S01-S10)
//
// ── Why layers 1-2 are injectable ─────────────────────────────────────────────
// Layers 3-5 are this tree's own rules and never vary. Layers 1-2 have two correct
// implementations, and which one is right depends on where the validator is running:
//
//   in this repo   realm-core, so the verdict is identical BY CONSTRUCTION to what
//                  MCP `get_validation` serves (ADR 001). A guarantee no test can
//                  match: it holds for every model, not for the ones a suite lists.
//   published      the standalone in `core/`, because the published validator ships
//                  Apache-2.0 and cannot import the engine.
//
// So the backend is passed IN rather than selected here. That is not indirection for
// its own sake: a `--backend core` flag would mean this file importing realm-core, and
// `licence-boundary.test.mjs` would fail it - correctly, since the import would then
// exist in the published copy whether or not the flag was ever used.
//
// `core/core-parity.test.mjs` proves the two backends answer alike.
// ═══════════════════════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadConfig, extractEntities, discoverModelFiles } from "./core/helpers.mjs";
import { validateStructural } from "./core/structural.mjs";
import { validateReferential } from "./core/referential.mjs";
import { validateGeometric } from "./core/geometric.mjs";
import { validateCrossLayer } from "./core/cross-layer.mjs";
import { validateSemantic } from "./core/semantic.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * The default backend: this tree's own layers 1-2, importing nothing but ajv and yaml.
 * @type {{name: string, help: string[], run: (ctx: {modelFiles: Map<string, unknown>, schemaDir: string, extraction: any}) => Promise<{structural: any, referential: any, entityCount: number}>}}
 */
export const standaloneBackend = {
  name: "standalone",
  help: [
    "Validates a Realm model with 5 layers, using this tool's own layer 1-2",
    "implementation. No build step and no dependencies beyond ajv and yaml.",
  ],
  async run({ modelFiles, schemaDir, extraction }) {
    const structural = validateStructural(modelFiles, schemaDir);
    const referential = validateReferential(extraction);
    return { structural, referential, entityCount: referential.entityCount };
  },
};

function parseArgs(argv, defaultSchemaDir) {
  const args = { model: null, schemas: defaultSchemaDir, config: null, help: false };
  for (let i = 2; i < argv.length; i++) {
    const token = argv[i];
    if ((token === "--model" || token === "-m") && argv[i + 1]) {
      args.model = path.resolve(argv[++i]);
    } else if ((token === "--schemas" || token === "-s") && argv[i + 1]) {
      args.schemas = path.resolve(argv[++i]);
    } else if ((token === "--config" || token === "-c") && argv[i + 1]) {
      args.config = path.resolve(argv[++i]);
    } else if (token === "--help" || token === "-h") {
      args.help = true;
    } else if (!args.model) {
      args.model = path.resolve(token);
    }
  }
  return args;
}

function printHelp(backend, entryName) {
  console.log([
    `Usage: node ${entryName} --model PATH [--schemas PATH] [--config PATH]`,
    "",
    ...backend.help,
    "",
    "Options:",
    "  --model, -m    Model directory to validate (required)",
    "  --schemas, -s  Schema directory (default: auto from script location)",
    "  --config, -c   realm-config.yaml path (default: MODEL/realm-config.yaml)",
    "  --help, -h     Show this help",
    "",
    "Layers:",
    `  1. Structural   — ${backend.layerOneHelp ?? "Ajv schema validation per file"}`,
    `  2. Referential  — ${backend.layerTwoHelp ?? "reference integrity + ID uniqueness (warnings)"}`,
    "  3. Geometric    — Spatial invariant checks (G01-G17)",
    "  4. Cross-Layer  — Semantic ↔ Construction consistency (C01-C10)",
    "  5. Semantic     — Domain logic rules (S01-S10)",
    "",
    "Exit codes: 0 = valid (warnings OK), 1 = errors found, 2 = runner failure",
  ].join("\n"));
}

function formatLocation(issue) {
  const parts = [];
  if (issue.entity) parts.push(issue.entity);
  else if (issue.file) parts.push(issue.file);
  if (issue.path) parts.push(issue.path);
  return parts.join(":") || "";
}

function reportLayer(name, result, counters) {
  const errors = result.issues.filter((i) => i.severity === "error");
  const warnings = result.issues.filter((i) => i.severity === "warning");
  const infos = result.issues.filter((i) => i.severity === "info");

  counters.errors += errors.length;
  counters.warnings += warnings.length;
  counters.info += infos.length;

  const status = errors.length > 0 ? "✗" : warnings.length > 0 ? "⚠" : "✓";
  const extra = result.filesValidated != null
    ? ` (${result.filesValidated} files)`
    : result.entityCount != null ? ` (${result.entityCount} entities)` : "";

  console.log(`${status} ${name}${extra}: ${errors.length} errors, ${warnings.length} warnings`);

  for (const issue of errors) console.log(`    ✗ [${issue.rule || "ERR"}] ${formatLocation(issue)}: ${issue.message}`);
  for (const issue of warnings) console.log(`    ⚠ [${issue.rule || "WARN"}] ${formatLocation(issue)}: ${issue.message}`);
  for (const issue of infos) console.log(`    ℹ [${issue.rule || "INFO"}] ${formatLocation(issue)}: ${issue.message}`);
}

/**
 * Run the validator. Returns the process exit code rather than calling `process.exit`,
 * so a caller can wrap it.
 *
 * @param {string[]} argv
 * @param {{backend?: typeof standaloneBackend, defaultSchemaDir?: string, entryName?: string}} [options]
 */
export async function runValidator(argv, options = {}) {
  const backend = options.backend ?? standaloneBackend;
  const entryName = options.entryName ?? "cli.mjs";
  const args = parseArgs(argv, options.defaultSchemaDir ?? path.resolve(__dirname, "../../schema"));

  if (args.help) {
    printHelp(backend, entryName);
    return 0;
  }
  if (!args.model) {
    console.error("Error: --model PATH is required. Use --help for usage.");
    return 1;
  }
  if (!fs.existsSync(args.model)) {
    console.error(`Error: Model directory not found: ${args.model}`);
    return 1;
  }

  const configPath = args.config || path.join(args.model, "realm-config.yaml");
  const config = loadConfig(configPath);

  console.log(`Realm v2 Validator (layers 1-2: ${backend.name})`);
  console.log(`  Model:   ${args.model}`);
  console.log(`  Schemas: ${args.schemas}`);
  console.log(`  Config:  ${fs.existsSync(configPath) ? configPath : "(defaults)"}`);
  console.log();

  const { modelFiles, constructionFiles, parseErrors } = discoverModelFiles(args.model);
  console.log(`  Discovered ${modelFiles.size} YAML files (${constructionFiles.size} construction)`);
  if (parseErrors.length > 0) {
    console.log(`  ⚠ ${parseErrors.length} files failed to parse:`);
    for (const { file, error } of parseErrors) console.log(`    ✗ ${file}: ${error}`);
  }
  console.log();

  const extraction = extractEntities(modelFiles);
  const { entities } = extraction;

  let layers12;
  try {
    layers12 = await backend.run({ modelFiles, schemaDir: args.schemas, extraction, modelDir: args.model });
  } catch (error) {
    console.error(`Validation runner failed: ${error instanceof Error ? error.message : error}`);
    return 2;
  }

  const counters = { errors: parseErrors.length, warnings: 0, info: 0 };

  reportLayer("Layer 1 (Structural)", layers12.structural, counters);
  reportLayer("Layer 2 (Referential)", layers12.referential, counters);
  reportLayer("Layer 3 (Geometric)", validateGeometric(entities, config), counters);
  reportLayer("Layer 4 (Cross-Layer)", validateCrossLayer(entities, constructionFiles, config), counters);
  reportLayer("Layer 5 (Semantic)", validateSemantic(entities, config), counters);

  console.log();
  console.log(`Result: ${counters.errors === 0 ? "PASS" : "FAIL"} (${counters.errors} errors, ${counters.warnings} warnings, ${counters.info} info)`);
  console.log(`Entities: ${layers12.entityCount} (core model), ${entities.size} (rule-layer extraction)`);

  return counters.errors > 0 ? 1 : 0;
}

// Run directly: the published entry point, on the standalone backend.
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  runValidator(process.argv, { entryName: "cli.mjs" }).then((code) => process.exit(code));
}
