// GENERATED - do not edit.
// Emitted by tsc from servers/realm/core/src/validation/sharedEdgeRules.ts and copied here by scripts/gen-derived.mjs.
// The TypeScript module is the single implementation: realm-core, the realm MCP server and
// `rl check` import it directly, while this plain-ESM emission is what the zero-build validator
// runs - including the copy published in the public realm repo, which is Apache-2.0 and therefore
// cannot import the engine. Editing this file makes the two disagree; change the .ts and re-run:
//     npm run build --workspace=servers/realm/core && npm run gen-derived

/**
 * Shared-edge consistency rule (schema v2.3.0), and the outline geometry it needs.
 *
 * Dependency-free, like the lifecycle, estate-change and georeference rules, because it
 * is emitted into the shared validator (`schemas/realm/.shared/validator/core/shared-edge-rules.mjs`)
 * so the published validator, the MCP server and `rl check` agree. Edit this file; the
 * `.mjs` is generated. The geometry lives here rather than in a sibling module for the
 * same reason: the emission is one file, and an import it cannot resolve is a validator
 * that does not start.
 *
 *   shared-edge-does-not-meet   an entity declares in `shared_edges` that one of its
 *                               edges lies on another element's edge, and the
 *                               coordinates say otherwise: the two segments are not on
 *                               one line within 0.05 m, an index names an edge the
 *                               outline does not have, the far index is missing where
 *                               it is required, the far element is itself, or either
 *                               outline is a circle and so has no edges. WARNING.
 *
 * The rule is the negative control of step-04 in rule form: coordinates that happen to
 * be equal with no declaration produce no finding, and a declaration the coordinates
 * contradict produces one. A dangling `with_ref` is the reference layer's finding, not
 * this rule's, so it is skipped here rather than reported twice.
 *
 * What counts as an outline, in absolute model coordinates:
 *
 *   - `footprint` (polygon) offset by `position`: parcel, building, outdoor zone,
 *     planting. `rotation_degrees` is not applied, because no consumer applies it and
 *     the metamodel's `shared_edge` description promises "vertices offset by position".
 *   - `parcel_footprint` offset by `position`: a neighbour's land. Its `footprint` is
 *     the neighbour's building and can share an edge with nothing of this estate, so
 *     when both are present the parcel wins.
 *   - `vertices`: a boundary segment's polyline, already absolute. A polyline has no
 *     closing edge. The deprecated `position_start` / `position_end` pair is read as a
 *     two-vertex polyline so old models are not refused.
 *
 * Edge n runs from vertex n to vertex n+1; a polygon's last edge closes to vertex 0.
 */
/** Two edges are one line when every endpoint of each lies within this of the other's line. */
export const SHARED_EDGE_TOLERANCE_M = 0.05;
export const SHARED_EDGES_FIELD = 'shared_edges';
function isPoint(value) {
    return (!!value &&
        typeof value === 'object' &&
        typeof value.x === 'number' &&
        typeof value.y === 'number');
}
/** Trim binary-float noise: 11.21 + 9.29 is 20.500000000000004 before this. */
function round6(value) {
    return Math.round(value * 1e6) / 1e6;
}
function polygonPoints(footprint) {
    if (!footprint || typeof footprint !== 'object')
        return null;
    const shape = footprint['shape'];
    if (shape === 'circle')
        return 'circle';
    const vertices = footprint['vertices'];
    if (!Array.isArray(vertices))
        return null;
    const points = vertices.filter(isPoint);
    return points.length >= 3 && points.length === vertices.length ? points : null;
}
/**
 * The entity's outline in absolute coordinates, `'circle'` when it has a circle
 * footprint (which has no edges), or `null` when it has no outline at all.
 */
export function absoluteOutline(data) {
    const vertices = data['vertices'];
    if (Array.isArray(vertices)) {
        const points = vertices.filter(isPoint);
        if (points.length >= 2 && points.length === vertices.length) {
            return { kind: 'polyline', field: 'vertices', points, origin: null };
        }
    }
    const start = data['position_start'];
    const end = data['position_end'];
    if (isPoint(start) && isPoint(end)) {
        return { kind: 'polyline', field: 'position_start_end', points: [start, end], origin: null };
    }
    const position = data['position'];
    for (const field of ['parcel_footprint', 'footprint']) {
        const points = polygonPoints(data[field]);
        if (points === null)
            continue;
        if (points === 'circle')
            return 'circle';
        if (!isPoint(position))
            return null;
        return {
            kind: 'polygon',
            field,
            points: points.map((p) => ({ x: round6(p.x + position.x), y: round6(p.y + position.y) })),
            origin: { x: position.x, y: position.y },
        };
    }
    return null;
}
export function edgeCount(outline) {
    return outline.kind === 'polygon' ? outline.points.length : outline.points.length - 1;
}
/** Edge `n` of the outline as its two endpoints, or `null` when the outline has no such edge. */
export function edgeOf(outline, n) {
    if (!Number.isInteger(n) || n < 0 || n >= edgeCount(outline))
        return null;
    const a = outline.points[n];
    const b = outline.points[(n + 1) % outline.points.length];
    return [a, b];
}
/** Perpendicular distance from `p` to the infinite line through `a` and `b`. */
export function distanceToLine(p, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy);
    if (length === 0)
        return Math.hypot(p.x - a.x, p.y - a.y);
    return Math.abs(dx * (p.y - a.y) - dy * (p.x - a.x)) / length;
}
/**
 * The largest distance any endpoint of either edge lies off the other's line. Zero when
 * the two edges are one line; symmetric, so a short edge cannot pass against a long one
 * it crosses at an angle.
 */
export function edgeSeparation(first, second) {
    return Math.max(distanceToLine(first[0], second[0], second[1]), distanceToLine(first[1], second[0], second[1]), distanceToLine(second[0], first[0], first[1]), distanceToLine(second[1], first[0], first[1]));
}
/** The `shared_edges` declarations on an entity, malformed entries dropped. */
export function sharedEdgeDeclarations(data) {
    const raw = data[SHARED_EDGES_FIELD];
    if (!Array.isArray(raw))
        return [];
    const declarations = [];
    for (const item of raw) {
        if (!item || typeof item !== 'object')
            continue;
        const { edge, with_ref, with_edge, note } = item;
        if (typeof edge !== 'number' || typeof with_ref !== 'string')
            continue;
        const declaration = { edge, with_ref };
        if (typeof with_edge === 'number')
            declaration.with_edge = with_edge;
        if (typeof note === 'string')
            declaration.note = note;
        declarations.push(declaration);
    }
    return declarations;
}
/**
 * The far edge index a declaration means: `with_edge` when given, else 0 when the far
 * outline is a two-vertex polyline (which has exactly one edge), else `null`.
 */
export function resolveFarEdge(declaration, far) {
    if (declaration.with_edge !== undefined)
        return declaration.with_edge;
    return far.kind === 'polyline' && far.points.length === 2 ? 0 : null;
}
export function checkSharedEdgeRules(entities, toleranceM = SHARED_EDGE_TOLERANCE_M) {
    const findings = [];
    const RULE = 'shared-edge-does-not-meet';
    for (const [id, entity] of entities) {
        const declarations = sharedEdgeDeclarations(entity.data);
        if (declarations.length === 0)
            continue;
        const own = absoluteOutline(entity.data);
        for (const declaration of declarations) {
            const where = `shared_edges edge ${declaration.edge} with ${declaration.with_ref}`;
            const push = (message) => findings.push({ severity: 'warning', rule: RULE, entity: id, message: `${where}: ${message}` });
            if (own === null) {
                push('this entity has no outline (no footprint with a position, and no vertices)');
                continue;
            }
            if (own === 'circle') {
                push('a circle footprint has no edges to share');
                continue;
            }
            const ownEdge = edgeOf(own, declaration.edge);
            if (!ownEdge) {
                push(`this outline has ${edgeCount(own)} edges (0 to ${edgeCount(own) - 1})`);
                continue;
            }
            if (declaration.with_ref === id) {
                push('an edge cannot lie on the same entity\'s edge');
                continue;
            }
            const farEntity = entities.get(declaration.with_ref);
            if (!farEntity)
                continue; // the reference layer reports a dangling with_ref
            const far = absoluteOutline(farEntity.data);
            if (far === null) {
                push(`${declaration.with_ref} has no outline (no footprint with a position, and no vertices)`);
                continue;
            }
            if (far === 'circle') {
                push(`${declaration.with_ref} has a circle footprint, which has no edges`);
                continue;
            }
            const farIndex = resolveFarEdge(declaration, far);
            if (farIndex === null) {
                push(`with_edge is required: ${declaration.with_ref} has ${edgeCount(far)} edges, not the single edge of a two-vertex boundary segment`);
                continue;
            }
            const farEdge = edgeOf(far, farIndex);
            if (!farEdge) {
                push(`${declaration.with_ref} has ${edgeCount(far)} edges (0 to ${edgeCount(far) - 1}), not an edge ${farIndex}`);
                continue;
            }
            const separation = edgeSeparation(ownEdge, farEdge);
            if (separation > toleranceM) {
                push(`the two edges are not one line: ${separation.toFixed(2)} m apart at the widest (tolerance ${toleranceM} m); ` +
                    'declare the edge that was measured, or move this one to meet it');
            }
        }
    }
    return findings;
}
//# sourceMappingURL=sharedEdgeRules.js.map