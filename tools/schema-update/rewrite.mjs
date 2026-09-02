import fs from "node:fs";
import path from "node:path";

/**
 * Text substitution over a model tree, line by line.
 *
 * Realm models are hand-authored YAML carrying comments, column alignment, blank-line
 * grouping and Polish prose. A parse-and-serialise round trip would discard all of it,
 * so every edit here is textual and only the matched substring changes. The cost is that
 * a substitution has to be shaped tightly enough to be safe outside a parser, which is
 * why the id pattern demands three digits and a word boundary.
 */

/** Every `.yaml` / `.yml` file under `dir`, relative to it, sorted for a stable report. */
export function modelFiles(dir) {
  const found = [];
  const walk = (current, prefix) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(path.join(current, entry.name), relative);
        continue;
      }
      if (/\.ya?ml$/.test(entry.name)) found.push(relative);
    }
  };
  walk(dir, "");
  return found.sort();
}

/**
 * Whether a hit on this line lands in a REFERENCE field or in free text.
 *
 * Reporting only - the substitution itself is identical either way. The distinction is
 * what a reader needs to judge the run: an id rewritten inside `depends_on_..._refs` is
 * the migration doing its declared job, while one rewritten inside a Polish description
 * is the tool editing a sentence somebody wrote. Both are wanted; conflating them in one
 * number hides the second.
 *
 * A tag counts as free text. `tags:` is a structured field holding unstructured labels,
 * and a label is authored prose however it is stored.
 */
export function isReferenceLine(line) {
  const keyed = line.match(/^\s*(?:-\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*:/);
  if (keyed) {
    const key = keyed[1];
    if (key === "id" || key === "schemaVersion" || key === "event_type") return true;
    if (/_refs?$/.test(key)) return true;
    if (key === "migrations" || key === "estate_changes") return true;
    if (key === "migration_schema" || key === "estate_change_schema") return true;
    return false;
  }
  // A bare list item holding nothing but an id continues a reference list above it.
  return /^\s*-\s*[A-Z]{2,4}\d{3,}[a-z]?\s*$/.test(line);
}

/**
 * Apply `substitutions` to `text`, counting hits by line class.
 *
 * Substitutions run in the given order against each line, so a longer key must precede
 * any key that is a substring of it. Returns the rewritten text and the two counts.
 */
export function substitute(text, substitutions) {
  let referenceHits = 0;
  let textHits = 0;
  const lines = text.split("\n");
  const rewritten = lines.map((line) => {
    let current = line;
    for (const { pattern, replacement } of substitutions) {
      current = current.replace(pattern, replacement);
    }
    if (current === line) return line;
    if (isReferenceLine(line)) referenceHits += 1;
    else textHits += 1;
    return current;
  });
  return { text: rewritten.join("\n"), referenceHits, textHits };
}

/**
 * Set `schemaVersion` in a model's `realm.yaml`, leaving the rest of the line intact.
 *
 * Only `schemaVersion` is touched. `version:` in the same file is the MODEL's own
 * version and means something else entirely; a migration that bumped it would rewrite a
 * fact about the property to record a fact about the schema.
 */
export function setSchemaVersion(text, targetVersion) {
  let changed = false;
  const rewritten = text.replace(
    /^(schemaVersion:\s*)(["']?)(\d+\.\d+(?:\.\d+)?)\2/m,
    (whole, prefix, quote, current) => {
      if (current === targetVersion) return whole;
      changed = true;
      return `${prefix}${quote}${targetVersion}${quote}`;
    },
  );
  return { text: rewritten, changed };
}

/**
 * Write every edit, or none of them.
 *
 * `edits` is a list of `{ absolutePath, text }` plus `renames` of `{ from, to }`. The
 * reads and the substitutions all happen first, so a file that cannot be read fails the
 * hop before any file has been rewritten. A half-migrated model whose failure point is
 * unknown is the outcome this ordering exists to prevent.
 *
 * Renames run BEFORE writes, so an edit to a renamed file must give its absolutePath as
 * the path AFTER the rename. Writing to the old name would restore the file this hop
 * just retired, leaving the model holding both.
 */
export function commit(edits, renames) {
  for (const { from, to } of renames) fs.renameSync(from, to);
  for (const { absolutePath, text } of edits) fs.writeFileSync(absolutePath, text, "utf8");
}
