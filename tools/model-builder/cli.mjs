#!/usr/bin/env node
// @ts-check
// ═══════════════════════════════════════════════════════════════════════════════
// Realm model builder - a model directory in, one JSON graph out.
//
// The validator answers whether a model is legal and the checker whether it says
// anything. This answers neither: it just hands you what the model CONTAINS, as the
// entities and typed relations every other tool reads, so anything you want to build on
// a realm model starts from the same graph the tooling does rather than from a second
// YAML walk that will drift.
//
// Edge types come from the relation vocabulary, keyed by the entity type that declares
// the field: a component is `part-of` a system, a thermostat `controls` one, a task
// `maintains` it. A field the vocabulary does not know still becomes an edge, typed from
// its name, and is reported under `warnings`.
//
// Usage:
//   node cli.mjs <model-dir> [--output <path>] [--pretty] [--warnings]
//
// Exit codes: 0 built · 2 usage or IO error.
// ═══════════════════════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";

import { buildRealmModel } from "./build-model.mjs";

const USAGE = "usage: realm-model <model-dir> [--output <path>] [--pretty] [--warnings]";

const HELP = `${USAGE}

Loads a realm model directory and produces a model JSON with entities and relations.

Arguments:
  <model-dir>        Path to a .realm/v2.2 directory

Options:
  --output, -o       Write to a file instead of stdout
  --pretty, -p       Pretty-print JSON (2-space indent)
  --warnings, -w     Print load warnings to stderr
  --help, -h         Show this help
`;

function parseArgs(argv) {
  const options = { modelDir: undefined, output: undefined, pretty: false, warnings: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") return { help: true, ...options };
    else if (arg === "--pretty" || arg === "-p") options.pretty = true;
    else if (arg === "--warnings" || arg === "-w") options.warnings = true;
    else if (arg === "--output" || arg === "-o") options.output = argv[++index];
    else if (arg.startsWith("-")) throw new Error(`unknown option: ${arg}`);
    else if (options.modelDir === undefined) options.modelDir = arg;
    else throw new Error(`unexpected argument: ${arg}`);
  }
  return options;
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error.message}\n${USAGE}\n`);
    process.exit(2);
  }

  if (options.help) {
    process.stdout.write(HELP);
    return;
  }
  if (!options.modelDir) {
    process.stderr.write(`${USAGE}\n`);
    process.exit(2);
  }
  if (options.output === undefined && process.argv.includes("--output")) {
    process.stderr.write(`--output needs a path\n${USAGE}\n`);
    process.exit(2);
  }
  if (!fs.existsSync(options.modelDir)) {
    process.stderr.write(`model directory not found: ${options.modelDir}\n`);
    process.exit(2);
  }

  const model = await buildRealmModel(options.modelDir);
  const json = JSON.stringify(model, null, options.pretty ? 2 : 0);

  if (options.warnings && model.warnings.length > 0) {
    // Deduplicated: an unknown field on 63 entities is one fact about the vocabulary, not
    // 63 problems, and printing it 63 times buries everything else.
    for (const warning of [...new Set(model.warnings)]) {
      process.stderr.write(`warning: ${warning}\n`);
    }
  }

  if (options.output) {
    fs.mkdirSync(path.dirname(path.resolve(options.output)), { recursive: true });
    fs.writeFileSync(options.output, `${json}\n`, "utf8");
    process.stderr.write(
      `Wrote ${model.entities.length} entities and ${model.relations.length} relations to ${options.output}\n`,
    );
  } else {
    process.stdout.write(`${json}\n`);
  }
}

main().catch((error) => {
  process.stderr.write(`${error?.stack ?? error}\n`);
  process.exit(2);
});
