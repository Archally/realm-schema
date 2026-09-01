// @ts-check
// ═══════════════════════════════════════════════════════════════════════════════
// Running the rule pack, as one function rather than as a CLI.
//
// The CLI beside this file is one caller and the renderer is another. Both need the
// same two things - find the pack, run it over a model - and both would otherwise
// resolve the rule directory themselves. A second copy of that resolution is how a
// report ends up describing a different set of rules from the one `realm-check`
// prints, on the same model, with nothing to say which is right.
// ═══════════════════════════════════════════════════════════════════════════════

import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import { loadRules, runChecker } from "@archally/semantic-checker";
import { toCheckableModel } from "./adapter.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));

/**
 * Where the rule pack lives, tried in order.
 *
 * In this repository the pack is a sibling directory; in the published copy the two sit
 * under one tool folder. Both are checked rather than one being configured, so neither
 * side carries a path that is wrong in the other.
 */
export const RULE_DIR_CANDIDATES = [
  path.resolve(HERE, "../semantic-rules"),
  path.resolve(HERE, "rules"),
];

/**
 * @param {string} [explicit] a directory named by the caller, which must exist
 * @returns {string}
 */
export function resolveRuleDir(explicit) {
  if (explicit) {
    if (!fs.existsSync(explicit)) {
      throw new Error(`rule directory not found: ${explicit}`);
    }
    return explicit;
  }
  const found = RULE_DIR_CANDIDATES.find((candidate) => fs.existsSync(candidate));
  if (!found) {
    throw new Error(`no rule pack found. Looked in:\n  ${RULE_DIR_CANDIDATES.join("\n  ")}`);
  }
  return found;
}

/**
 * Run the pack over a built realm model.
 *
 * @param {unknown} source a built model, or the raw extraction map
 * @param {{ ruleDir?: string, rule?: string }} [options]
 * @returns {Promise<{ ruleDir: string, rules: Array<{id: string}>, issues: Array<{ruleId: string, severity: string, message: string, entityId?: string}> }>}
 */
export async function checkRealmModel(source, options = {}) {
  const ruleDir = resolveRuleDir(options.ruleDir);
  const all = await loadRules(ruleDir);
  const rules = options.rule ? all.filter((rule) => rule.id === options.rule) : all;
  if (options.rule && rules.length === 0) {
    throw new Error(`no rule with id "${options.rule}" in ${ruleDir}`);
  }
  const issues = runChecker(toCheckableModel(source), rules);
  return { ruleDir, rules, issues };
}
