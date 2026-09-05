// GENERATED - do not edit.
// Emitted by tsc from servers/realm/core/src/validation/lifecycleRules.ts and copied here by scripts/gen-derived.mjs.
// The TypeScript module is the single implementation: realm-core, the realm MCP server and
// `rl check` import it directly, while this plain-ESM emission is what the zero-build validator
// runs - including the copy published in the public realm repo, which is Apache-2.0 and therefore
// cannot import the engine. Editing this file makes the two disagree; change the .ts and re-run:
//     npm run build --workspace=servers/realm/core && npm run gen-derived

/**
 * Lifecycle consistency rules (schema v2.3.0).
 *
 * Written dependency-free, like the estate-change rules beside them, because the
 * module is emitted into the shared validator (`schemas/realm/.shared/validator/core/
 * lifecycle-rules.mjs`) so that the published validator, the MCP server and `rl check`
 * report the same findings from the same code. Edit this file; the `.mjs` is generated.
 *
 * Both rules are WARNING severity in 2.3.0. The first is an error candidate for a later
 * release, the same escalation blueprint uses; raising it before the corpus has been
 * worked through would block the person doing the working through.
 *
 *   retired-referenced-by-live   an active entity points at one that ended. A reference
 *                                from an estate change's `changes[]` or `executions[]`
 *                                is exempt: recording that a change removed a thing is
 *                                the reason the retired record still exists. So is the
 *                                `lifecycle` block itself, whose `superseded_by` points
 *                                at a successor by design.
 *   superseded-without-successor `state: superseded` names no `superseded_by`; the
 *                                record should say `retired` instead.
 *
 * The rule that a retired estate change is still `scheduled` or `in-progress` (R-I)
 * lives with the other estate-change rules, since it reads the status machine those
 * rules own.
 */
const ENDED_STATES = new Set(['retired', 'superseded']);
/** Keys whose subtree may legitimately point at a record that ended. */
const EXEMPT_SUBTREES = new Set(['changes', 'executions', 'lifecycle']);
/** Keys that look like references but address a schema, not an entity. */
const NOT_ENTITY_REFS = new Set(['$ref', '$schema']);
/**
 * The lifecycle state an entity declares: `lifecycle.state`, or the legacy `x-retired`
 * marker read as `retired`, or `active`. Mirrors `lifecycleStateOf` in `retirement.ts`,
 * repeated here so the emitted module stays import-free.
 */
export function lifecycleStateOfData(data) {
    const block = data['lifecycle'];
    if (block && typeof block === 'object' && !Array.isArray(block)) {
        const state = block['state'];
        if (typeof state === 'string')
            return state;
    }
    const marker = data['x-retired'];
    return marker !== undefined && marker !== null && marker !== false ? 'retired' : 'active';
}
function collectRefs(node, out, parentKey) {
    if (!node || typeof node !== 'object')
        return;
    if (Array.isArray(node)) {
        for (const item of node)
            collectRefs(item, out, parentKey);
        return;
    }
    for (const [key, value] of Object.entries(node)) {
        if (NOT_ENTITY_REFS.has(key) || EXEMPT_SUBTREES.has(key))
            continue;
        if (key.endsWith('_refs') && Array.isArray(value)) {
            for (const target of value)
                if (typeof target === 'string')
                    out.push({ field: key, target });
        }
        else if (key.endsWith('_ref') && typeof value === 'string') {
            out.push({ field: key, target: value });
        }
        else if (typeof value === 'object' && value !== null) {
            collectRefs(value, out, key);
        }
    }
}
/**
 * Run the lifecycle rules over a loaded model.
 *
 * @param entities Map of entity id to its parsed data, every type included: the rules
 *   need to see both ends of a reference.
 */
export function checkLifecycleRules(entities) {
    const findings = [];
    const stateOf = new Map();
    for (const [id, entity] of entities)
        stateOf.set(id, lifecycleStateOfData(entity.data));
    for (const [id, entity] of entities) {
        const state = stateOf.get(id) ?? 'active';
        if (state === 'superseded') {
            const block = entity.data['lifecycle'];
            const successor = block && typeof block === 'object' ? block['superseded_by'] : undefined;
            if (typeof successor !== 'string' || successor.length === 0) {
                findings.push({
                    severity: 'warning',
                    rule: 'superseded-without-successor',
                    entity: id,
                    message: 'lifecycle.state is "superseded" but no superseded_by names the record that took its place; use "retired" when there is none',
                });
            }
        }
        if (ENDED_STATES.has(state))
            continue;
        const refs = [];
        collectRefs(entity.data, refs, '');
        for (const { field, target } of refs) {
            const targetState = stateOf.get(target);
            if (targetState === undefined || !ENDED_STATES.has(targetState))
                continue;
            findings.push({
                severity: 'warning',
                rule: 'retired-referenced-by-live',
                entity: id,
                message: `${field} points at ${target}, whose lifecycle is "${targetState}"; the reference names something that no longer stands`,
            });
        }
    }
    return findings;
}
//# sourceMappingURL=lifecycleRules.js.map