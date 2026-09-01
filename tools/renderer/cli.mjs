#!/usr/bin/env node
// @ts-check
// ═══════════════════════════════════════════════════════════════════════════════
// Realm renderer - a model directory in, two readable documents out.
//
//   property.md      what the property is, and what has to be done to it
//   garden-care.md   what grows there, and what it needs in which month
//
// Both are built from the model builder's graph, so they and `realm-check` are reading
// one model rather than each walking the YAML with its own idea of what is there.
//
// Usage:
//   node cli.mjs <model-dir> [--document property|garden-care|all] [--output <path>]
//                [--title <text>] [--check] [--geometry] [--relations] [--no-coverage]
//
// Exit codes: 0 written (or up to date) · 1 --check found a stale document · 2 usage or IO
// error.
// ═══════════════════════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";

import { buildRealmModel } from "../model-builder/build-model.mjs";
import { checkRealmModel } from "../semantic-checker/check.mjs";
import { renderProperty } from "./property.mjs";
import { renderGardenCare } from "./garden-care.mjs";

const USAGE = [
  "usage: realm-render <model-dir> [options]",
  "",
  "Render a realm model as markdown with embedded Mermaid diagrams.",
  "",
  "Options:",
  "  --document, -d   property | garden-care | all   (default: property)",
  "  --output, -o     file path, or a directory when --document all (default: stdout)",
  "  --title, -t      document title (default: the model's own name)",
  "  --check          compare against --output instead of writing; exit 1 if it differs",
  "  --geometry       enumerate the derived construction layer rather than summarising it",
  "  --relations      append the full relation table",
  "  --no-coverage    omit the model-quality findings section",
  "  --rules <dir>    rule pack directory (default: the pack beside the checker)",
  "  --help, -h       show this message",
  "",
  "Examples:",
  "  realm-render examples/willow-cottage --document all -o examples/willow-cottage/.specs",
  "  realm-render .realm/v2.2 -o overview.md --check",
].join("\n");

/** Which documents each `--document` value produces, and what each is called on disk. */
const DOCUMENTS = {
  property: { file: "property.md", render: renderProperty, coverage: true },
  "garden-care": { file: "garden-care.md", render: renderGardenCare, coverage: false },
};

function fail(message) {
  console.error(`realm-render: ${message}\n${USAGE}`);
  process.exit(2);
}

function parseArgs(argv) {
  const args = {
    modelDir: undefined,
    document: "property",
    output: undefined,
    title: undefined,
    check: false,
    geometry: false,
    relations: false,
    coverage: true,
    rules: undefined,
  };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === "--help" || token === "-h") {
      console.log(USAGE);
      process.exit(0);
    } else if (token === "--document" || token === "-d") args.document = argv[++i];
    else if (token === "--output" || token === "-o") args.output = argv[++i];
    else if (token === "--title" || token === "-t") args.title = argv[++i];
    else if (token === "--rules") args.rules = argv[++i];
    else if (token === "--check") args.check = true;
    else if (token === "--geometry") args.geometry = true;
    else if (token === "--relations") args.relations = true;
    else if (token === "--no-coverage") args.coverage = false;
    else if (token.startsWith("-")) fail(`unknown flag: ${token}`);
    else if (!args.modelDir) args.modelDir = token;
    else fail(`unexpected argument: ${token}`);
  }
  return args;
}

/**
 * Compare what was rendered against what is on disk.
 *
 * Line endings are normalised on both sides: the two repositories this tool ships in are
 * checked out on different platforms, and a document is not stale because git handed it back
 * with CRLF.
 */
function compare(outputPath, markdown) {
  if (!fs.existsSync(outputPath)) {
    console.error(`STALE: ${outputPath} does not exist.`);
    return false;
  }
  const existing = fs.readFileSync(outputPath, "utf8");
  if (existing.replace(/\r\n/g, "\n") === markdown.replace(/\r\n/g, "\n")) {
    console.log(`Up to date: ${outputPath}`);
    return true;
  }
  console.error(`STALE: ${outputPath} does not match the model it describes.`);
  console.error("  Regenerate it by running the same command without --check.");
  return false;
}

function write(outputPath, markdown) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, markdown, "utf8");
  console.log(`Written ${outputPath} (${markdown.split("\n").length} lines)`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.modelDir) fail("a model directory is required");
  if (!fs.existsSync(args.modelDir)) fail(`model directory not found: ${args.modelDir}`);

  const wanted =
    args.document === "all" ? Object.keys(DOCUMENTS) : [args.document].filter((key) => key in DOCUMENTS);
  if (wanted.length === 0) {
    fail(`unknown document "${args.document}". Expected property, garden-care or all`);
  }
  if (args.document === "all" && !args.output) {
    fail("--document all writes two files and needs --output <directory>");
  }

  const model = await buildRealmModel(args.modelDir);

  // The rule pack runs once even when both documents are produced: it is the same question
  // about the same model, and running it per document would let two sections of one delivery
  // disagree if the pack were ever made order-dependent.
  let findings;
  if (args.coverage && wanted.some((key) => DOCUMENTS[key].coverage)) {
    findings = (await checkRealmModel(model, { ruleDir: args.rules })).issues;
  }

  let stale = 0;
  for (const key of wanted) {
    const document = DOCUMENTS[key];
    const markdown = document.render(model, {
      title: args.title,
      relations: args.relations,
      geometry: args.geometry,
      findings: document.coverage ? findings : undefined,
    });

    const outputPath = !args.output
      ? undefined
      : args.document === "all"
        ? path.resolve(args.output, document.file)
        : path.resolve(args.output);

    if (!outputPath) {
      process.stdout.write(markdown);
      continue;
    }
    if (args.check) {
      if (!compare(outputPath, markdown)) stale += 1;
    } else {
      write(outputPath, markdown);
    }
  }

  if (stale > 0) process.exit(1);
}

main().catch((error) => {
  console.error(`realm-render: ${error?.message ?? error}`);
  process.exit(2);
});
