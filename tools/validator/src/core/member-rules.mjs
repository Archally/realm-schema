// GENERATED - do not edit.
// Emitted by tsc from servers/realm/core/src/validation/memberRules.ts and copied here by scripts/gen-derived.mjs.
// The TypeScript module is the single implementation: realm-core, the realm MCP server and
// `rl check` import it directly, while this plain-ESM emission is what the zero-build validator
// runs - including the copy published in the public realm repo, which is Apache-2.0 and therefore
// cannot import the engine. Editing this file makes the two disagree; change the .ts and re-run:
//     npm run build --workspace=servers/realm/core && npm run gen-derived

/**
 * Placed-member rules (schema v2.3.0).
 *
 * Dependency-free, like the other 2.3.0 rules, because the module is emitted into the
 * shared validator (`schemas/realm/.shared/validator/core/member-rules.mjs`) so the
 * published validator, the MCP server and `rl check` agree. Edit this file; the `.mjs`
 * is generated.
 *
 *   promoted-member-still-listed   an entity names a group in `member_of_ref` while that
 *                                  group still lists a member with the entity's label, or
 *                                  within 0.05 m of the entity's position: one unit
 *                                  described twice. The coordinate match is used only
 *                                  inside the group the entity itself names, which keeps
 *                                  it a check on a declaration and not an inference
 *                                  (step-00 D6). WARNING.
 *   members-exceed-count           a group whose `members` outnumber its `count` (a
 *                                  planting) or its `unit_count` (a component, 2.3.0): the
 *                                  list says more units stand there than the group says
 *                                  exist. INFO, because a count is often the older of the
 *                                  two numbers.
 *   member-of-cycle                `member_of_ref` chains back to the entity itself. A
 *                                  group is not a member of its own member. ERROR.
 *
 * The rules read `members[].position` (three-dimensional, absolute) and the entity's own
 * `position` (two-dimensional); the match ignores z, since a lamp head and the ground
 * under it are one unit.
 */
export const MEMBERS_FIELD = 'members';
export const MEMBER_OF_FIELD = 'member_of_ref';
/** A member point this close to a promoted entity's position is the same unit. */
export const MEMBER_MATCH_TOLERANCE_M = 0.05;
/** The group's listed members with a numeric position, malformed entries dropped. */
export function memberPoints(data) {
    const raw = data[MEMBERS_FIELD];
    if (!Array.isArray(raw))
        return [];
    const points = [];
    for (const item of raw) {
        if (!item || typeof item !== 'object')
            continue;
        const position = item['position'];
        if (!position || typeof position !== 'object')
            continue;
        const { x, y } = position;
        if (typeof x !== 'number' || typeof y !== 'number')
            continue;
        const label = item['label'];
        points.push(typeof label === 'string' ? { x, y, label } : { x, y });
    }
    return points;
}
export function checkMemberRules(entities) {
    const findings = [];
    for (const [id, entity] of entities) {
        const countField = 'count' in entity.data ? 'count' : 'unit_count';
        const count = entity.data[countField];
        const members = memberPoints(entity.data);
        if (typeof count === 'number' && members.length > count) {
            findings.push({
                severity: 'info',
                rule: 'members-exceed-count',
                entity: id,
                message: `members lists ${members.length} units but ${countField} says ${count}; one of the two is stale`,
            });
        }
    }
    for (const [id, entity] of entities) {
        const groupId = entity.data[MEMBER_OF_FIELD];
        if (typeof groupId !== 'string')
            continue;
        // Cycle: follow member_of_ref until it ends or returns.
        const seen = new Set([id]);
        let cursor = groupId;
        while (cursor !== undefined) {
            if (seen.has(cursor)) {
                findings.push({
                    severity: 'error',
                    rule: 'member-of-cycle',
                    entity: id,
                    message: `member_of_ref chain returns to ${cursor} (${[...seen, cursor].join(' -> ')}); a group cannot be a member of its own member`,
                });
                break;
            }
            seen.add(cursor);
            const next = entities.get(cursor)?.data[MEMBER_OF_FIELD];
            cursor = typeof next === 'string' ? next : undefined;
        }
        const group = entities.get(groupId);
        if (!group)
            continue; // the reference layer reports a dangling member_of_ref
        const label = entity.data['label'];
        const ownName = entity.data['name'];
        const position = entity.data['position'];
        const own = position && typeof position === 'object' && typeof position.x === 'number' && typeof position.y === 'number'
            ? position
            : null;
        for (const [index, member] of memberPoints(group.data).entries()) {
            const byLabel = member.label !== undefined && (member.label === label || member.label === ownName);
            const byPosition = own !== null && Math.hypot(member.x - own.x, member.y - own.y) <= MEMBER_MATCH_TOLERANCE_M;
            if (!byLabel && !byPosition)
                continue;
            findings.push({
                severity: 'warning',
                rule: 'promoted-member-still-listed',
                entity: id,
                message: `${groupId}.members[${index}]${member.label ? ` (${member.label})` : ''} still describes this unit ` +
                    `(${byLabel ? 'same label' : `within ${MEMBER_MATCH_TOLERANCE_M} m of its position`}); ` +
                    'a promoted unit leaves the group\'s list',
            });
        }
    }
    return findings;
}
//# sourceMappingURL=memberRules.js.map