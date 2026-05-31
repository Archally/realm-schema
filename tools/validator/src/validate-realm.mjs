#!/usr/bin/env node

// ═══════════════════════════════════════════════════════════════════════════════
// Realm v2 Model Validator — CLI entry point
//
// Validates realm model YAML against v2.0 schemas with 5 validation layers:
//   Layer 1: Structural   — JSON Schema / Ajv per-file validation
//   Layer 2: Referential  — Cross-file reference integrity + ID uniqueness
//   Layer 3: Geometric    — Spatial invariant checks (G01-G17)
//   Layer 4: Cross-Layer  — Semantic ↔ Construction consistency (C01-C10)
//   Layer 5: Semantic     — Domain logic rules (S01-S10)
//
// Usage:
//   node validate-realm.mjs --model projects/cewice/.realm/v1 [--schemas PATH] [--config PATH]
//
// Exit codes:
//   0 = valid (warnings may exist)
//   1 = errors found (must fix)
// ═══════════════════════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  toPosix, walkFiles, tryLoadYaml,
  loadSchemaRegistry, makeAjv, loadConfig, extractEntities,
} from "./lib/helpers.mjs";
import { validateStructural } from "./lib/structural.mjs";
import { validateReferential } from "./lib/referential.mjs";
import { validateGeometric } from "./lib/geometric.mjs";
import { validateCrossLayer } from "./lib/cross-layer.mjs";
import { validateSemantic } from "./lib/semantic.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── CLI ────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = {
    model: null,
    // Public repo layout: tools/validator/src/ → repo root is ../../../, schemas at schema/v2.0.
    schemas: path.resolve(__dirname, "../../../schema/v2.0"),
    config: null,
    help: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const token = argv[i];
    if ((token === "--model" || token === "-m") && argv[i + 1]) {
      args.model = path.resolve(argv[i + 1]);
      i++;
    } else if ((token === "--schemas" || token === "-s") && argv[i + 1]) {
      args.schemas = path.resolve(argv[i + 1]);
      i++;
    } else if ((token === "--config" || token === "-c") && argv[i + 1]) {
      args.config = path.resolve(argv[i + 1]);
      i++;
    } else if (token === "--help" || token === "-h") {
      args.help = true;
    } else if (!args.model) {
      args.model = path.resolve(token);
    }
  }
  return args;
}

function printHelp() {
  console.log([
    "Usage: node validate-realm.mjs --model PATH [--schemas PATH] [--config PATH]",
    "",
    "Validates a Realm v2 model against schemas with 5 validation layers.",
    "",
    "Options:",
    "  --model, -m    Model directory to validate (required)",
    "  --schemas, -s  Schema directory (default: auto from script location)",
    "  --config, -c   realm-config.yaml path (default: MODEL/realm-config.yaml)",
    "  --help, -h     Show this help",
    "",
    "Layers:",
    "  1. Structural   — Ajv schema validation per file",
    "  2. Referential  — Cross-file reference integrity + ID uniqueness",
    "  3. Geometric    — Spatial invariant checks (G01-G17)",
    "  4. Cross-Layer  — Semantic ↔ Construction consistency (C01-C10)",
    "  5. Semantic     — Domain logic rules (S01-S10)",
    "",
    "Exit codes: 0 = valid (warnings OK), 1 = errors found",
  ].join("\n"));
}

// ─── Reporter ───────────────────────────────────────────────────────────────

function formatLocation(issue) {
  const parts = [];
  if (issue.entity) parts.push(issue.entity);
  else if (issue.file) parts.push(issue.file);
  if (issue.path) parts.push(issue.path);
  return parts.join(":") || "";
}

function reportLayer(name, result, counters) {
  const errors = result.issues.filter(i => i.severity === "error");
  const warnings = result.issues.filter(i => i.severity === "warning");
  const infos = result.issues.filter(i => i.severity === "info");

  counters.errors += errors.length;
  counters.warnings += warnings.length;
  counters.info += infos.length;

  const status = errors.length > 0 ? "✗" : warnings.length > 0 ? "⚠" : "✓";
  const extra = result.filesValidated != null
    ? ` (${result.filesValidated} files)`
    : result.entityCount != null ? ` (${result.entityCount} entities)` : "";

  console.log(`${status} ${name}${extra}: ${errors.length} errors, ${warnings.length} warnings`);

  for (const issue of errors) {
    const location = formatLocation(issue);
    console.log(`    ✗ [${issue.rule || "ERR"}] ${location}: ${issue.message}`);
  }
  for (const issue of warnings) {
    const location = formatLocation(issue);
    console.log(`    ⚠ [${issue.rule || "WARN"}] ${location}: ${issue.message}`);
  }
  for (const issue of infos) {
    const location = formatLocation(issue);
    console.log(`    ℹ [${issue.rule || "INFO"}] ${location}: ${issue.message}`);
  }
}

// ─── Model discovery ────────────────────────────────────────────────────────

/** Files to exclude from validation (config, manifests, non-model). */
const EXCLUDE_PATTERNS = ["config", "manifest", "schedule-planner", "garden-care"];

function discoverModelFiles(modelDir) {
  const yamlFiles = walkFiles(modelDir, f =>
    /\.(yaml|yml)$/i.test(f) && !EXCLUDE_PATTERNS.some(p => f.includes(p)),
  );

  const modelFiles = new Map();
  const constructionFiles = new Map();

  const parseErrors = [];
  for (const filePath of yamlFiles) {
    const relPath = toPosix(path.relative(modelDir, filePath));
    const result = tryLoadYaml(filePath);
    if (result.error) {
      parseErrors.push({ file: relPath, error: result.error });
    } else if (result.data != null) {
      modelFiles.set(relPath, result.data);
      if (relPath.startsWith("topology/construction/")) {
        constructionFiles.set(relPath, result.data);
      }
    }
  }

  return { modelFiles, constructionFiles, parseErrors };
}

// ─── Main ───────────────────────────────────────────────────────────────────

function main() {
  const args = parseArgs(process.argv);
  if (args.help) { printHelp(); process.exit(0); }
  if (!args.model) {
    console.error("Error: --model PATH is required. Use --help for usage.");
    process.exit(1);
  }
  if (!fs.existsSync(args.model)) {
    console.error(`Error: Model directory not found: ${args.model}`);
    process.exit(1);
  }

  const configPath = args.config || path.join(args.model, "realm-config.yaml");
  const config = loadConfig(configPath);

  console.log(`Realm v2 Validator`);
  console.log(`  Model:   ${args.model}`);
  console.log(`  Schemas: ${args.schemas}`);
  console.log(`  Config:  ${fs.existsSync(configPath) ? configPath : "(defaults)"}`);
  console.log();

  // Load schemas + model
  const registry = loadSchemaRegistry(args.schemas);
  console.log(`  Loaded ${registry.size} schema files`);

  const ajv = makeAjv(registry);
  const { modelFiles, constructionFiles, parseErrors } = discoverModelFiles(args.model);
  console.log(`  Discovered ${modelFiles.size} YAML files (${constructionFiles.size} construction)`);
  if (parseErrors.length > 0) {
    console.log(`  ⚠ ${parseErrors.length} files failed to parse:`);
    for (const { file, error } of parseErrors) {
      console.log(`    ✗ ${file}: ${error}`);
    }
  }
  console.log();

  // Extract entities
  const { entities, allIds, duplicates } = extractEntities(modelFiles);

  // Run all 5 layers
  const counters = { errors: parseErrors.length, warnings: 0, info: 0 };

  reportLayer("Layer 1 (Structural)", validateStructural(ajv, modelFiles), counters);
  reportLayer("Layer 2 (Referential)", validateReferential(modelFiles, entities, allIds, duplicates), counters);
  reportLayer("Layer 3 (Geometric)", validateGeometric(entities, config), counters);
  reportLayer("Layer 4 (Cross-Layer)", validateCrossLayer(entities, constructionFiles, config), counters);
  reportLayer("Layer 5 (Semantic)", validateSemantic(entities, config), counters);

  // Summary
  console.log();
  console.log(`Result: ${counters.errors === 0 ? "PASS" : "FAIL"} (${counters.errors} errors, ${counters.warnings} warnings, ${counters.info} info)`);
  console.log(`Entities: ${entities.size}`);

  process.exit(counters.errors > 0 ? 1 : 0);
}

main();
