import fs from "node:fs";
import path from "node:path";

import { update as update001 } from "./updates/001-additive-2-0-to-2-1.mjs";
import { update as update002 } from "./updates/002-migration-to-estate-change.mjs";

/**
 * Version order, single pass - see resolveChain. A model on 2.0 must receive
 * 001 then 002 in one run.
 */
const ALL_UPDATES = [update001, update002];

/**
 * Which schema version a model is written against.
 *
 * `realm.yaml`'s `schemaVersion` is authoritative and the directory name is only a
 * fallback, which is the opposite of what a version directory suggests. A realm model
 * directory is named for the MODEL's own line, not the schema's: a real estate on 2.2.0
 * lives in `.realm/v1/` and has since it was authored. Reading the directory first would
 * answer `1` for a model that is fully current.
 *
 * `version:` in the same file is the model's own version and is never consulted.
 *
 * Returns `{ version, source, declared, directoryVersion }` where `version` is the
 * MINOR line (`2.1`) that an update matches on, and `declared` is the full patch version
 * as written (`2.1.0`). A disagreement between the file and the directory is reported
 * rather than resolved silently.
 */
export function detectVersion(modelDir) {
  const resolved = path.resolve(modelDir);
  const directoryVersion = path.basename(resolved).match(/^v(\d+\.\d+)$/)?.[1] ?? null;

  const realmYaml = path.join(resolved, "realm.yaml");
  if (fs.existsSync(realmYaml)) {
    const declared = fs
      .readFileSync(realmYaml, "utf8")
      .match(/^schemaVersion:\s*["']?(\d+\.\d+(?:\.\d+)?)/m)?.[1];
    if (declared) {
      const minor = declared.split(".").slice(0, 2).join(".");
      return { version: minor, declared, source: "realm.yaml", directoryVersion };
    }
  }

  if (directoryVersion) {
    return { version: directoryVersion, declared: null, source: "directory", directoryVersion };
  }
  return { version: null, declared: null, source: null, directoryVersion };
}

/**
 * Every update that applies to `sourceVersion`, in the order they must run.
 *
 * A single pass over `ALL_UPDATES` rather than "loop while something matches": an
 * in-place update (same source and target version) would make a loop non-terminating,
 * and one pass terminates by construction whatever a future module declares. Register
 * new modules in version order.
 */
export function resolveChain(sourceVersion) {
  const chain = [];
  let currentVersion = sourceVersion;
  for (const update of ALL_UPDATES) {
    if (update.sourceVersion !== currentVersion) continue;
    chain.push(update);
    currentVersion = update.targetVersion;
  }
  return chain;
}

export function listUpdates() {
  return ALL_UPDATES;
}

/**
 * Where the model lives after `update` ran against `modelDir`.
 *
 * Derived from what the hop actually did, never assumed: only a result containing a
 * `rename-directory` change moves the root. Realm models frequently sit in a directory
 * whose name is not a schema version, and those are left where they are.
 */
export function directoryAfter(modelDir, update, changes) {
  const renamed = changes.some((change) => change.type === "rename-directory");
  if (!renamed) return modelDir;
  return path.join(path.dirname(modelDir), `v${update.targetVersion}`);
}

/** Plan the chain. Only the FIRST hop is planned in detail - see the note below. */
export function planChain(modelDir) {
  const detected = detectVersion(modelDir);
  if (!detected.version) {
    return { detected, chain: [], plans: [], error: versionError(modelDir) };
  }
  const chain = resolveChain(detected.version);
  if (chain.length === 0) return { detected, chain: [], plans: [] };

  // Only hop 1 is planned against a tree that exists. Later hops transform the tree the
  // earlier one produces, so a plan computed against the pre-migration tree would be
  // fiction - they are announced by description instead.
  const plans = [chain[0].plan(modelDir)];
  return { detected, chain, plans };
}

/**
 * Apply every applicable update in order, following the model if a hop relocates it.
 *
 * Stops at the first hop reporting errors. A partially migrated tree is recoverable -
 * the completed hops are real and re-running resumes from the new version - whereas
 * continuing would apply a later transform to a tree the previous one failed to produce.
 */
export function applyChain(modelDir) {
  const detected = detectVersion(modelDir);
  if (!detected.version) {
    return { detected, hops: [], error: versionError(modelDir), finalDirectory: modelDir };
  }
  const chain = resolveChain(detected.version);
  if (chain.length === 0) {
    return { detected, hops: [], finalDirectory: modelDir };
  }

  const hops = [];
  let currentDir = modelDir;
  for (const update of chain) {
    const result = update.apply(currentDir);
    const nextDir = directoryAfter(currentDir, update, result.changes);
    hops.push({ update, result, directoryAfter: nextDir });
    if (result.errors.length > 0) {
      return {
        detected,
        hops,
        error: `Stopped at ${update.sourceVersion} -> ${update.targetVersion}: ${result.errors.join("; ")}`,
        finalDirectory: nextDir,
      };
    }
    currentDir = nextDir;
  }
  return { detected, hops, finalDirectory: currentDir };
}

function versionError(modelDir) {
  return (
    `Cannot determine the schema version of ${modelDir}. ` +
    `Add a schemaVersion to realm.yaml (e.g. schemaVersion: "2.1.0"), ` +
    `or point this at a directory named for the version (v2.1).`
  );
}
