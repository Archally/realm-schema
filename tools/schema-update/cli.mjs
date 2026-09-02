#!/usr/bin/env node
import process from "node:process";

import { applyChain, detectVersion, listUpdates, planChain, resolveChain } from "./runner.mjs";

const USAGE = `realm-schema-update - move a realm model to a newer schema version

Usage:
  realm-schema-update <model-dir> [--dry-run]
  realm-schema-update --list

Options:
  --dry-run     Show what would change; write nothing
  --list        List every available update
  -h, --help    Show this message

The model directory is the one holding realm.yaml (for example .realm/v2.1).
Preview with --dry-run first, and validate afterwards:
  realm-validate --model <model-dir> --schemas schema/v2.2
`;

function parseArguments(argv) {
  const options = { modelDir: null, dryRun: false, list: false, help: false };
  for (const argument of argv) {
    if (argument === "--dry-run") options.dryRun = true;
    else if (argument === "--list") options.list = true;
    else if (argument === "-h" || argument === "--help") options.help = true;
    else if (argument.startsWith("-")) return { error: `Unknown option: ${argument}` };
    else if (options.modelDir === null) options.modelDir = argument;
    else return { error: `Unexpected argument: ${argument}` };
  }
  return { options };
}

function describeChanges(changes) {
  const lines = [];
  let referenceTotal = 0;
  let textTotal = 0;
  for (const change of changes) {
    const marker = change.type === "edit-yaml" ? "edit  " : change.type === "rename-file" ? "rename" : "move  ";
    lines.push(`  ${marker} ${change.path}${change.detail ? `  ${change.detail}` : ""}`);
    referenceTotal += change.referenceHits ?? 0;
    textTotal += change.textHits ?? 0;
  }
  return { lines, referenceTotal, textTotal };
}

/**
 * The two totals are printed on their own line because they answer different questions.
 * A rewrite inside a reference field is the migration doing what it says; one inside a
 * description or a tag is the tool editing a sentence a person wrote, and the operator
 * is the only one who can decide whether that is wanted before it happens.
 */
function reportTotals(referenceTotal, textTotal) {
  if (referenceTotal === 0 && textTotal === 0) return;
  console.log(
    `  ${referenceTotal} rewrite(s) in reference fields, ${textTotal} in descriptions, notes and tags`,
  );
}

function main() {
  const parsed = parseArguments(process.argv.slice(2));
  if (parsed.error) {
    console.error(parsed.error);
    console.error(USAGE);
    process.exit(2);
  }
  const { options } = parsed;

  if (options.help) {
    console.log(USAGE);
    process.exit(0);
  }

  if (options.list) {
    console.log("Available updates:\n");
    for (const update of listUpdates()) {
      console.log(`  ${update.sourceVersion} -> ${update.targetVersion}`);
      console.log(`    ${update.description}\n`);
    }
    process.exit(0);
  }

  if (!options.modelDir) {
    console.error(USAGE);
    process.exit(2);
  }

  const detected = detectVersion(options.modelDir);
  if (!detected.version) {
    const { error } = planChain(options.modelDir);
    console.error(error);
    process.exit(1);
  }

  console.log(
    `Model on schema ${detected.declared ?? detected.version}, read from ${detected.source}.`,
  );
  if (detected.source === "realm.yaml" && detected.directoryVersion && detected.directoryVersion !== detected.version) {
    console.log(
      `  Note: the directory is named v${detected.directoryVersion}. realm.yaml is authoritative; ` +
        `a realm model directory is named for the model's own line, not the schema's.`,
    );
  }

  const chain = resolveChain(detected.version);
  if (chain.length === 0) {
    console.log("No update available - this model is already on the newest published version.");
    process.exit(0);
  }

  console.log(`Chain: ${chain.map((update) => `${update.sourceVersion} -> ${update.targetVersion}`).join(", ")}\n`);

  if (options.dryRun) {
    const { plans } = planChain(options.modelDir);
    const [first] = plans;
    console.log(`${first.sourceVersion} -> ${first.targetVersion}: ${first.description}`);
    const { lines, referenceTotal, textTotal } = describeChanges(first.changes);
    if (lines.length === 0) console.log("  nothing to change");
    else lines.forEach((line) => console.log(line));
    reportTotals(referenceTotal, textTotal);
    for (const warning of first.warnings) console.log(`  warning: ${warning}`);

    // Later hops transform the tree this one produces, so planning them against the
    // current tree would report changes to files that do not exist yet.
    for (const update of chain.slice(1)) {
      console.log(`\n${update.sourceVersion} -> ${update.targetVersion}: ${update.description}`);
      console.log("  announced, not planned - it reads the tree the previous hop produces");
    }
    console.log("\nNothing was written. Re-run without --dry-run to apply.");
    process.exit(0);
  }

  const result = applyChain(options.modelDir);
  for (const hop of result.hops) {
    console.log(`${hop.update.sourceVersion} -> ${hop.update.targetVersion}: ${hop.result.description}`);
    const { lines, referenceTotal, textTotal } = describeChanges(hop.result.changes);
    if (lines.length === 0) console.log("  nothing to change");
    else lines.forEach((line) => console.log(line));
    reportTotals(referenceTotal, textTotal);
    for (const warning of hop.result.warnings) console.log(`  warning: ${warning}`);
    console.log("");
  }

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  console.log(`Done. Model is at ${result.finalDirectory}.`);
  console.log("Validate it: realm-validate --model <model-dir> --schemas schema/v2.2");
  process.exit(0);
}

main();
