// @ts-check
/**
 * The spatial containment tree: what is inside what.
 *
 * A property model's backbone. `part-of` is its largest relation type by a wide margin (130
 * of the worked example's 444 edges) and, with `located-on`, it is what a reader means by
 * "where is it".
 */

import { indexModel, ofType } from "./model-index.mjs";

/**
 * Which reference field names an entity's PARENT, in preference order.
 *
 * A room declares both `floor_ref` and `wing_ref`, and both are `part-of` - correctly, since
 * a room is part of each. Drawn as a graph that is a diamond, not a tree, and 15 rooms
 * become 30 edges converging on two ancestors of each other. So containment picks ONE parent
 * per entity, the most specific available, and the order is declared here rather than
 * emerging from which relation the builder happened to emit first.
 *
 * The relations not chosen are not lost - they remain in the graph, and the relation table
 * shows them. What is chosen here is only what the TREE draws.
 */
export const PARENT_FIELDS = {
  building: ["parcel_ref"],
  wing: ["building_ref"],
  floor: ["wing_ref", "building_ref"],
  room: ["floor_ref", "wing_ref"],
  outdoor_zone: ["parcel_ref"],
};

/** The types the tree is drawn from, outermost first. */
export const CONTAINMENT_TYPES = ["parcel", "building", "wing", "floor", "room", "outdoor_zone"];

/**
 * Build the containment tree.
 *
 * Returns roots plus a flat `nodes` list, because a diagram wants the edges and a table
 * wants the depth, and computing depth twice is how the two come to disagree.
 *
 * @param {import("./model-index.mjs").RealmModel | import("./model-index.mjs").RealmIndex} source
 */
export function buildContainment(source) {
  const index = "byId" in source ? source : indexModel(source);

  /** @type {Map<string, {entity: import("./model-index.mjs").RealmEntity, parent?: string, children: string[], depth: number}>} */
  const nodes = new Map();
  for (const type of CONTAINMENT_TYPES) {
    for (const entity of ofType(index, type)) {
      nodes.set(entity.id, { entity, children: [], depth: 0 });
    }
  }

  for (const node of nodes.values()) {
    const fields = PARENT_FIELDS[node.entity.type] ?? [];
    for (const field of fields) {
      const relation = (index.outgoing.get(node.entity.id) ?? []).find(
        (candidate) => candidate.refField === field && nodes.has(candidate.target),
      );
      if (relation) {
        node.parent = relation.target;
        break;
      }
    }
  }

  for (const node of nodes.values()) {
    if (node.parent) nodes.get(node.parent)?.children.push(node.entity.id);
  }

  const roots = [...nodes.values()]
    .filter((node) => !node.parent)
    .map((node) => node.entity.id)
    .sort();

  // Depth by walk rather than by recursion into `children`, so a model whose refs form a
  // cycle produces a finite answer instead of a stack overflow. A cycle here is a defect the
  // validator reports; a renderer's job is to still render.
  const seen = new Set();
  const queue = roots.map((id) => ({ id, depth: 0 }));
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || seen.has(current.id)) continue;
    seen.add(current.id);
    const node = nodes.get(current.id);
    if (!node) continue;
    node.depth = current.depth;
    for (const child of node.children) queue.push({ id: child, depth: current.depth + 1 });
  }

  return { nodes, roots, index };
}

/**
 * The tree in reading order: each root, then its descendants depth-first, ids sorted.
 *
 * @param {ReturnType<typeof buildContainment>} tree
 * @returns {{entity: import("./model-index.mjs").RealmEntity, depth: number}[]}
 */
export function containmentOrder(tree) {
  const out = [];
  const seen = new Set();
  const visit = (id) => {
    if (seen.has(id)) return;
    seen.add(id);
    const node = tree.nodes.get(id);
    if (!node) return;
    out.push({ entity: node.entity, depth: node.depth });
    for (const child of [...node.children].sort()) visit(child);
  };
  for (const root of tree.roots) visit(root);
  // Anything a cycle kept out of the walk is still part of the model and is appended rather
  // than silently dropped.
  for (const id of [...tree.nodes.keys()].sort()) visit(id);
  return out;
}

/**
 * Containment edges, parent to child, for a diagram.
 * @param {ReturnType<typeof buildContainment>} tree
 */
export function containmentEdges(tree) {
  const edges = [];
  for (const node of tree.nodes.values()) {
    if (node.parent) edges.push({ from: node.parent, to: node.entity.id });
  }
  return edges.sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to));
}
