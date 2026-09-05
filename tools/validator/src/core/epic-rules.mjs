// GENERATED - do not edit.
// Emitted by tsc from servers/realm/core/src/validation/epicRules.ts and copied here by scripts/gen-derived.mjs.
// The TypeScript module is the single implementation: realm-core, the realm MCP server and
// `rl check` import it directly, while this plain-ESM emission is what the zero-build validator
// runs - including the copy published in the public realm repo, which is Apache-2.0 and therefore
// cannot import the engine. Editing this file makes the two disagree; change the .ts and re-run:
//     npm run build --workspace=servers/realm/core && npm run gen-derived

/**
 * Epic rules (schema v2.3.0).
 *
 * Dependency-free and emitted into the shared validator
 * (`schemas/realm/.shared/validator/core/epic-rules.mjs`), like the other 2.3.0 rules.
 * Edit this file; the `.mjs` is generated.
 *
 *   epic-order-not-unique   two epics carry the same `order`, so a view that lists or
 *                           draws epics in order cannot do so deterministically. Reported
 *                           on the later epic in id order, naming the earlier. WARNING.
 *
 * Whether an estate change has an epic at all is not a rule: a change with no epic is
 * listed under its own heading by every consumer (the field's description says so), and
 * a warning would push modellers to invent one.
 */
const EPIC_ID = /^([a-z][a-z0-9-]*\.)?EPK\d{3,}$/;
function isEpic(id, entity) {
    return entity.entityType === 'epic' || (entity.entityType === undefined && EPIC_ID.test(id));
}
export function checkEpicRules(entities) {
    const findings = [];
    const byOrder = new Map();
    const ids = [...entities.keys()].filter((id) => isEpic(id, entities.get(id))).sort();
    for (const id of ids) {
        const order = entities.get(id).data['order'];
        if (typeof order !== 'number')
            continue;
        const earlier = byOrder.get(order);
        if (earlier === undefined) {
            byOrder.set(order, id);
            continue;
        }
        findings.push({
            severity: 'warning',
            rule: 'epic-order-not-unique',
            entity: id,
            message: `order ${order} is already used by ${earlier}; two epics with one order cannot be listed deterministically`,
        });
    }
    return findings;
}
//# sourceMappingURL=epicRules.js.map