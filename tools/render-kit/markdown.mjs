// @ts-check
/**
 * Markdown primitives for realm's rendered documents.
 *
 * Small on purpose. What a document needs from this file is a table that does not break
 * when a cell contains a pipe, a section that disappears when it has nothing to say, and
 * one place where "this field is absent" is decided to look like a hyphen.
 */

/** What an absent value renders as. One constant, so no reader has to wonder. */
export const ABSENT = "-";

/**
 * Render one value as a table cell.
 *
 * Absent becomes a hyphen; a multi-line string becomes one line, because a newline inside a
 * pipe table ends the row. Pipes are escaped rather than dropped: a room called `Kitchen |
 * Utility` should read as its name and not silently gain a column.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function cell(value) {
  if (value === undefined || value === null || value === "") return ABSENT;
  if (Array.isArray(value)) {
    const parts = value.map((item) => cell(item)).filter((item) => item !== ABSENT);
    return parts.length ? parts.join(", ") : ABSENT;
  }
  if (typeof value === "object") return ABSENT;
  return String(value).replace(/\s+/g, " ").replace(/\|/g, "\\|").trim() || ABSENT;
}

/**
 * A pipe table. Returns "" for no rows, so a caller can hand the result straight to
 * `sections` and have an empty table vanish rather than render a header over nothing.
 *
 * @param {string[]} headers
 * @param {unknown[][]} rows
 * @returns {string}
 */
export function table(headers, rows) {
  if (rows.length === 0) return "";
  const lines = [
    `| ${headers.join(" | ")} |`,
    `|${headers.map(() => "---").join("|")}|`,
  ];
  for (const row of rows) {
    lines.push(`| ${headers.map((_, index) => cell(row[index])).join(" | ")} |`);
  }
  return lines.join("\n");
}

/**
 * A heading with its body, or "" when the body is empty.
 *
 * The emptiness rule is the point: a property model does not have to carry every plane, and
 * a document that prints "## Systems and utilities" above nothing tells the reader the
 * renderer failed rather than that the model is silent. An explicitly empty section is a
 * different thing and is written by the caller as body text.
 *
 * @param {number} level
 * @param {string} title
 * @param {...(string|undefined|null)} body
 * @returns {string}
 */
export function section(level, title, ...body) {
  const content = body.filter((part) => typeof part === "string" && part.trim() !== "");
  if (content.length === 0) return "";
  return [`${"#".repeat(level)} ${title}`, "", content.join("\n\n")].join("\n");
}

/**
 * Join document parts, dropping the empty ones and separating the rest by a blank line.
 * @param {(string|undefined|null)[]} parts
 * @returns {string}
 */
export function sections(parts) {
  return parts
    .filter((part) => typeof part === "string" && part.trim() !== "")
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .concat("\n");
}

/**
 * A bullet list, or "" when there is nothing to list.
 * @param {unknown[]} items
 * @returns {string}
 */
export function bullets(items) {
  const rendered = items.map((item) => cell(item)).filter((item) => item !== ABSENT);
  return rendered.length ? rendered.map((item) => `- ${item}`).join("\n") : "";
}

/**
 * Prose from a model field: newlines collapsed, trailing whitespace gone, "" when absent.
 *
 * Model descriptions are block scalars and arrive with a trailing newline and internal wraps
 * that belonged to the YAML column limit, not to the sentence.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function prose(value) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim();
}

/**
 * A quoted block, used for the one-line summary under a document title.
 * @param {string} text
 */
export function blockquote(text) {
  return text ? `> ${text}` : "";
}
