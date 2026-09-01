// @ts-check
/**
 * Mermaid primitives.
 *
 * Mermaid is a text format with a parser, so an unescaped label is not a cosmetic problem:
 * one quotation mark in a room name and the whole diagram stops rendering, leaving a block
 * of source where the picture was. Escaping happens HERE and once - a caller passes raw
 * model text and never pre-escapes, because a string escaped twice shows its own entities.
 */

/**
 * A Mermaid-safe node identifier.
 *
 * Entity ids in realm are already `[A-Z]{2,4}[0-9]{3}`, so this is a guard rather than a
 * transformation - but a model may carry an id the schema tolerates and Mermaid does not.
 *
 * @param {string} id
 * @returns {string}
 */
export function nodeId(id) {
  return String(id).replace(/[^A-Za-z0-9_]/g, "_");
}

/**
 * Escape one label for a quoted Mermaid node or edge caption.
 *
 * `"` ends the label and `#` opens an entity reference, so both are replaced by the entity
 * form Mermaid renders back. Newlines become `<br/>`, which is the only markup Mermaid
 * accepts inside a label.
 *
 * @param {unknown} text
 * @returns {string}
 */
export function label(text) {
  return String(text ?? "")
    .replace(/#/g, "#35;")
    .replace(/"/g, "#quot;")
    .replace(/\s*\n\s*/g, "<br/>")
    .replace(/[ \t]+/g, " ")
    .trim();
}

/** Node shapes, by the bracket pair that draws them. */
const SHAPES = {
  box: ["[", "]"],
  round: ["(", ")"],
  stadium: ["([", "])"],
  subroutine: ["[[", "]]"],
  cylinder: ["[(", ")]"],
  hexagon: ["{{", "}}"],
};

/**
 * A flowchart, or "" when there is nothing to draw.
 *
 * Returning "" for an empty graph rather than an empty `graph TD` matters: an empty diagram
 * renders as a blank frame, which reads as a broken renderer, while an absent section reads
 * as a model that does not carry that plane.
 *
 * @param {{
 *   direction?: string,
 *   nodes: {id: string, label: unknown, shape?: keyof typeof SHAPES}[],
 *   edges?: {from: string, to: string, label?: unknown, dashed?: boolean}[],
 * }} spec
 * @returns {string}
 */
export function flowchart(spec) {
  const { direction = "TD", nodes, edges = [] } = spec;
  if (nodes.length === 0) return "";

  const lines = [`flowchart ${direction}`];
  for (const node of nodes) {
    const [open, close] = SHAPES[node.shape ?? "box"] ?? SHAPES.box;
    lines.push(`    ${nodeId(node.id)}${open}"${label(node.label)}"${close}`);
  }
  const declared = new Set(nodes.map((node) => nodeId(node.id)));
  for (const edge of edges) {
    const from = nodeId(edge.from);
    const to = nodeId(edge.to);
    // An edge to a node the caller did not declare would make Mermaid invent an unlabelled
    // box, which looks like a real entity and is not one.
    if (!declared.has(from) || !declared.has(to)) continue;
    const line = edge.dashed ? "-.->" : "-->";
    lines.push(
      edge.label ? `    ${from} ${line}|"${label(edge.label)}"| ${to}` : `    ${from} ${line} ${to}`,
    );
  }
  return lines.join("\n");
}

/**
 * Wrap a diagram in a fenced block, or "" when there is no diagram.
 * @param {string} body
 * @returns {string}
 */
export function fence(body) {
  return body ? ["```mermaid", body, "```"].join("\n") : "";
}
