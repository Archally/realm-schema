#!/usr/bin/env node
// @ts-check
// ═══════════════════════════════════════════════════════════════════════════════
// Realm model-quality checker - the third question, after "is it legal?" and
// "does it hold together?".
//
//   legal        the validator's layers 1-2: each file matches its schema, references
//                resolve, ids are unique.
//   holds        the validator's layers 3-5: geometry, semantic-to-construction
//                consistency, and the domain rules.
//   says anything  THIS. Whether the model carries the content a reader or a generator
//                needs, in the places the schema leaves optional.
//
// The third question is separate because the schema cannot ask it. A field the schema
// requires is answered by layer 1 and can never reach a rule here; a field the schema
// leaves optional is exactly where a model degrades without ever going red. So every
// rule in the pack targets an OPTIONAL field or an absent relation, and a rule that
// duplicates a `required:` is dead code that reports nothing forever.
//
// Usage:
//   node cli.mjs --model <dir> [--rules <dir>] [--json] [--strict] [--rule <id>]
//
// Exit codes: 0 no error-severity findings · 1 an error finding (or any finding under
// --strict) · 2 usage or IO error.
// ═══════════════════════════════════════════════════════════════════════════════

import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import { loadRules, runChecker } from "@archally/semantic-checker";
import { loadRealmModel, toCheckableModel } from "./adapter.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const USAGE =
  "usage: realm-check --model <dir> [--rules <dir>] [--json] [--strict] [--rule <id>]";

/**
 * Where the rule pack lives, tried in order.
 *
 * In this repository the pack is a sibling directory; in the published copy the two sit
 * under one tool folder. Both are checked rather than one being configured, so neither
 * side carries a path that is wrong in the other.
 */
const RULE_DIR_CANDIDATES = [
  path.resolve(HERE, "../semantic-rules"),
  path.resolve(HERE, "rules"),
];

function fail(message) {
  console.error(`realm-check: ${message}\n${USAGE}`);
  process.exit(2);
}

function parseArgs(argv) {
  const args = { model: undefined, rules: undefined, json: false, strict: false, rule: undefined };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token === "--json") args.json = true;
    else if (token === "--strict") args.strict = true;
    else if (token === "--model") args.model = argv[++i];
    else if (token === "--rules") args.rules = argv[++i];
    else if (token === "--rule") args.rule = argv[++i];
    else if (token === "--help" || token === "-h") { console.log(USAGE); process.exit(0); }
    else if (token.startsWith("-")) fail(`unknown flag: ${token}`);
    else if (!args.model) args.model = token;
    else fail(`unexpected argument: ${token}`);
  }
  return args;
}

function resolveRuleDir(explicit) {
  if (explicit) {
    if (!fs.existsSync(explicit)) fail(`rule directory not found: ${explicit}`);
    return explicit;
  }
  const found = RULE_DIR_CANDIDATES.find((candidate) => fs.existsSync(candidate));
  if (!found) fail(`no rule pack found. Looked in:\n  ${RULE_DIR_CANDIDATES.join("\n  ")}`);
  return found;
}

const SEVERITY_MARK = { error: "✗", warning: "⚠", warn: "⚠", info: "ℹ" };

function render(model, issues, ruleDir, filter) {
  const lines = [];
  lines.push("Realm model quality");
  lines.push(`  Rules:    ${path.relative(process.cwd(), ruleDir) || ruleDir}`);
  lines.push(`  Entities: ${model.entities.length}, relations: ${model.relations.length}`);
  if (filter) lines.push(`  Filter:   rule "${filter}"`);
  lines.push("");

  if (issues.length === 0) {
    lines.push("No findings.");
    return lines.join("\n");
  }

  // Grouped by rule and printed in full. A truncating display is how a reader ends up
  // believing a rule fired three times when it fired ninety.
  const byRule = new Map();
  for (const issue of issues) {
    if (!byRule.has(issue.ruleId)) byRule.set(issue.ruleId, []);
    byRule.get(issue.ruleId).push(issue);
  }
  for (const [ruleId, found] of [...byRule].sort((a, b) => a[0].localeCompare(b[0]))) {
    const mark = SEVERITY_MARK[found[0].severity] ?? "-";
    lines.push(`${mark} ${ruleId} (${found.length})`);
    for (const issue of found) lines.push(`    ${issue.message}`);
    lines.push("");
  }
  return lines.join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.model) fail("--model is required");
  if (!fs.existsSync(args.model)) fail(`model directory not found: ${args.model}`);

  const ruleDir = resolveRuleDir(args.rules);
  const rules = await loadRules(ruleDir);
  const selected = args.rule ? rules.filter((rule) => rule.id === args.rule) : rules;
  if (args.rule && selected.length === 0) fail(`no rule with id "${args.rule}" in ${ruleDir}`);

  const model = toCheckableModel(await loadRealmModel(args.model));
  const issues = runChecker(model, selected);

  if (args.json) {
    console.log(JSON.stringify({
      model: args.model,
      entities: model.entities.length,
      relations: model.relations.length,
      rules: selected.length,
      issues,
    }, null, 2));
  } else {
    console.log(render(model, issues, ruleDir, args.rule));
  }

  const errors = issues.filter((issue) => issue.severity === "error");
  // Findings below error severity do not fail a run by default: this tool reports on
  // what the schema deliberately left optional, so a warning is a judgement about a
  // model rather than a defect in it. `--strict` is how a project opts into treating
  // them as a gate.
  if (errors.length > 0 || (args.strict && issues.length > 0)) process.exit(1);
}

main().catch((error) => {
  console.error(`realm-check: ${error?.message ?? error}`);
  process.exit(2);
});
