// GENERATED - do not edit.
// Emitted by tsc from servers/realm/core/src/validation/estateChangeRules.ts and copied here by scripts/gen-derived.mjs.
// The TypeScript module is the single implementation: realm-core, the realm MCP server and
// `rl check` import it directly, while this plain-ESM emission is what the zero-build validator
// runs - including the copy published in the public realm repo, which is Apache-2.0 and therefore
// cannot import the engine. Editing this file makes the two disagree; change the .ts and re-run:
//     npm run build --workspace=servers/realm/core && npm run gen-derived

/**
 * Estate-change consistency rules (schema v2.2.0).
 *
 * These live in realm-core rather than beside the standalone validator so that the
 * validator shim, the MCP server and the `rl check` verb all report the same findings
 * from the same code. A rule implemented twice is a rule that disagrees with itself
 * eventually.
 *
 * All six ship at WARNING severity. Each one fires on the cewice model today, and a
 * blocking rule whose backlog has not been worked through blocks the person who would
 * work through it. The counts are the input to the model-update pass; raising severity
 * is a later, deliberate decision.
 *
 * The cycle check is separate and reports an ERROR, because a cycle in
 * `part_of_change_ref` is not a judgement about the model's content - it is a shape the
 * rest of the code assumes cannot occur.
 */
/** Statuses that mean the change is over, one way or the other. */
const TERMINAL_STATUSES = new Set(['completed', 'cancelled']);
function isEstateChange(id) {
    return /^([a-z][a-z0-9-]*\.)?ECH\d{3,}[a-z]?$/.test(id);
}
function isEvent(id) {
    return /^([a-z][a-z0-9-]*\.)?EVT\d{3,}$/.test(id);
}
function statusOf(entity) {
    const status = entity?.data['status'];
    return typeof status === 'string' ? status : undefined;
}
function executionsOf(entity) {
    const executions = entity.data['executions'];
    return Array.isArray(executions) ? executions : [];
}
function changesOf(entity) {
    const changes = entity.data['changes'];
    return Array.isArray(changes) ? changes : [];
}
function refsOf(entity, field) {
    const value = entity.data[field];
    return Array.isArray(value) ? value.filter((v) => typeof v === 'string') : [];
}
/**
 * Run every estate-change rule over a loaded model.
 *
 * @param entities Map of entity id to its parsed data. Entities of other types are
 *   read (events, for the cost rule) but never reported on.
 */
export function checkEstateChangeRules(entities) {
    const findings = [];
    const changes = new Map();
    for (const [id, entity] of entities) {
        if (isEstateChange(id))
            changes.set(id, entity);
    }
    // Child -> parent, and the reverse, built once.
    const childrenOf = new Map();
    for (const [id, entity] of changes) {
        const parent = entity.data['part_of_change_ref'];
        if (typeof parent !== 'string')
            continue;
        const siblings = childrenOf.get(parent);
        if (siblings)
            siblings.push(id);
        else
            childrenOf.set(parent, [id]);
    }
    for (const [id, entity] of changes) {
        const status = statusOf(entity);
        // R-A: closed, with nothing recording that anything was done.
        if (status === 'completed' && executionsOf(entity).length === 0) {
            findings.push({
                severity: 'warning',
                rule: 'R-A',
                entity: id,
                message: 'status is "completed" but no executions[] entry records when the work was carried out',
            });
        }
        // R-B: a change that is over, waiting on one that is not.
        if (status === 'completed') {
            for (const dependency of refsOf(entity, 'depends_on_estate_change_refs')) {
                const dependencyStatus = statusOf(changes.get(dependency));
                if (dependencyStatus && !TERMINAL_STATUSES.has(dependencyStatus)) {
                    findings.push({
                        severity: 'warning',
                        rule: 'R-B',
                        entity: id,
                        message: `status is "completed" but it depends on ${dependency}, which is still "${dependencyStatus}"`,
                    });
                }
            }
        }
        // R-C: closed without saying what it left behind. The quantifier matters: a change
        // with no changes[] at all would otherwise pass by having nothing to check.
        if (status === 'completed') {
            const items = changesOf(entity);
            const unverified = items.length === 0 || items.some((item) => typeof item['actual_state'] !== 'string');
            if (unverified) {
                findings.push({
                    severity: 'warning',
                    rule: 'R-C',
                    entity: id,
                    message: items.length === 0
                        ? 'status is "completed" but it declares no changes[], so nothing records what it left behind'
                        : 'status is "completed" but at least one changes[] item has no actual_state (unverified closure)',
                });
            }
        }
        // R-D: a family parent disagreeing with its members. A cancelled parent is exempt:
        // a branch abandoned wholesale legitimately leaves its members where they stood.
        const members = childrenOf.get(id);
        if (members && members.length > 0 && status !== 'cancelled') {
            const memberStatuses = members.map((member) => statusOf(changes.get(member)));
            const allCompleted = memberStatuses.every((memberStatus) => memberStatus === 'completed');
            const anyOpen = memberStatuses.some((memberStatus) => memberStatus !== undefined && !TERMINAL_STATUSES.has(memberStatus));
            if (status === 'completed' && anyOpen) {
                findings.push({
                    severity: 'warning',
                    rule: 'R-D',
                    entity: id,
                    message: `status is "completed" but ${members.length} member(s) include one that is not finished`,
                });
            }
            else if (allCompleted && status !== 'completed') {
                findings.push({
                    severity: 'warning',
                    rule: 'R-D',
                    entity: id,
                    message: `every member is "completed" but this parent is "${status ?? 'unset'}"`,
                });
            }
        }
        // R-G: closed as having created something, without saying what. A change whose
        // product is an entity's existence is unverifiable while it names no entity, and
        // the failure is silent in both directions: the model shows no gap, and the change
        // reads as done. Measured 2026-08-30 on cewice - a shredder bought in March, its
        // purchase closed as `completed`, its output already relied on by a bed's mulch,
        // and the machine itself absent from 62 equipment records for five months.
        //
        // Scoped to `add` deliberately. `modify` and `relocate` arguably want a referent
        // too, but `remove` legitimately loses one, so widening this needs a rule per
        // action rather than a looser filter.
        if (status === 'completed') {
            changesOf(entity).forEach((item, index) => {
                if (item['action'] !== 'add')
                    return;
                if (typeof item['entity_ref'] === 'string' && item['entity_ref'].length > 0)
                    return;
                const entityType = typeof item['entity_type'] === 'string' ? item['entity_type'] : 'entity';
                findings.push({
                    severity: 'warning',
                    rule: 'R-G',
                    entity: id,
                    message: `status is "completed" and changes[${index}] adds a ${entityType}, but no entity_ref says which one it created`,
                });
            });
        }
        // R-F: the same cost recorded twice, once here and once on the event it links to.
        for (const execution of executionsOf(entity)) {
            const eventRef = execution['event_ref'];
            if (typeof execution['cost_pln'] !== 'number' || typeof eventRef !== 'string')
                continue;
            const event = entities.get(eventRef);
            if (event && isEvent(eventRef) && typeof event.data['cost_pln'] === 'number') {
                findings.push({
                    severity: 'warning',
                    rule: 'R-F',
                    entity: id,
                    message: `an execution records cost_pln and so does the event it links to (${eventRef}); a cost belongs to one of them`,
                });
            }
        }
    }
    findings.push(...checkVariantGroups(changes, childrenOf));
    findings.push(...checkFamilyCycles(changes));
    return findings;
}
/**
 * R-E: two branches of one set of mutually exclusive scenarios both carried out.
 * A branch counts as carried out when its parent or any of its members is completed.
 */
function checkVariantGroups(changes, childrenOf) {
    const groups = new Map();
    for (const [id, entity] of changes) {
        const group = entity.data['variant_group'];
        if (typeof group !== 'string' || group.length === 0)
            continue;
        const branches = groups.get(group);
        if (branches)
            branches.push(id);
        else
            groups.set(group, [id]);
    }
    const findings = [];
    for (const [group, branches] of groups) {
        const carriedOut = branches.filter((branch) => {
            if (statusOf(changes.get(branch)) === 'completed')
                return true;
            return (childrenOf.get(branch) ?? []).some((member) => statusOf(changes.get(member)) === 'completed');
        });
        if (carriedOut.length < 2)
            continue;
        for (const branch of carriedOut) {
            findings.push({
                severity: 'warning',
                rule: 'R-E',
                entity: branch,
                message: `variant group "${group}" expects exactly one branch to be carried out, but ${carriedOut.join(', ')} all were`,
            });
        }
    }
    return findings;
}
/** A cycle in `part_of_change_ref` - reported as an error, since nothing can resolve it. */
function checkFamilyCycles(changes) {
    const findings = [];
    const seen = new Set();
    for (const start of changes.keys()) {
        if (seen.has(start))
            continue;
        const path = [];
        const onPath = new Set();
        let current = start;
        while (current !== undefined && changes.has(current) && !seen.has(current)) {
            if (onPath.has(current)) {
                const cycle = path.slice(path.indexOf(current)).concat(current);
                findings.push({
                    severity: 'error',
                    rule: 'R-CYCLE',
                    entity: current,
                    message: `part_of_change_ref forms a cycle: ${cycle.join(' -> ')}`,
                });
                break;
            }
            path.push(current);
            onPath.add(current);
            const parent = changes.get(current)?.data['part_of_change_ref'];
            current = typeof parent === 'string' ? parent : undefined;
        }
        for (const visited of path)
            seen.add(visited);
    }
    return findings;
}
//# sourceMappingURL=estateChangeRules.js.map