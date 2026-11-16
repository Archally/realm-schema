// GENERATED - do not edit.
// Emitted by tsc from servers/realm/core/src/validation/pipeAndNetworkRules.ts and copied here by scripts/gen-derived.mjs.
// The TypeScript module is the single implementation: realm-core, the realm MCP server and
// `rl check` import it directly, while this plain-ESM emission is what the zero-build validator
// runs - including the copy published in the public realm repo, which is Apache-2.0 and therefore
// cannot import the engine. Editing this file makes the two disagree; change the .ts and re-run:
//     npm run build --workspace=servers/realm/core && npm run gen-derived

/**
 * Pipe run and network supply rules (schema v2.3.2).
 *
 * Dependency-free, like the other rule modules, because it is emitted into the shared
 * validator (`schemas/realm/.shared/validator/core/pipe-and-network-rules.mjs`) so the
 * published validator, the MCP server and `rl check` agree. Edit this file; the `.mjs`
 * is generated.
 *
 * Ajv checks that a pipe run's ends are a component or a utility connection, and that a
 * network node's `utility_connection_ref` names a utility connection. What it cannot see is
 * whether the utility at the far end supplies what the pipe or the node needs:
 *
 *   pipe-endpoint-utility-type   a pipe run ends at a utility connection whose connection_type
 *                                cannot deliver the run's medium: potable water comes from a
 *                                `water-supply` connection, heating water from a
 *                                `district-heating` one. WARNING.
 *   network-node-utility-type    a network node is fed by a utility connection that is not a
 *                                telecommunications service (`fiber-internet`,
 *                                `cable-internet`, `dsl`, `telephone`). WARNING.
 *
 * A dangling end is the reference layer's finding, not this one. The route geometry of a
 * pipe run or a wired network link is checked by the leg rules in `electricalRules.ts`,
 * which read every run that carries the shared physical route.
 */
const PIPE_RUN_ID = /^([a-z][a-z0-9-]*\.)?PPR\d{3,}$/;
const NETWORK_NODE_ID = /^([a-z][a-z0-9-]*\.)?NN\d{3,}$/;
const UTILITY_ID = /^([a-z][a-z0-9-]*\.)?UC\d{3,}$/;
/** The utility connection types that can deliver each pipe medium. */
const UTILITY_TYPES_FOR_MEDIUM = {
    'heating-water': ['district-heating'],
    'potable-cold-water': ['water-supply'],
    'potable-hot-water': ['water-supply'],
};
/** The utility connection types a network node can terminate. */
const TELECOM_TYPES = ['fiber-internet', 'cable-internet', 'dsl', 'telephone'];
function str(data, key) {
    const value = data[key];
    return typeof value === 'string' ? value : undefined;
}
function isType(id, entity, entityType, idPattern) {
    if (entity.entityType !== undefined) {
        return entity.entityType === entityType;
    }
    return idPattern.test(id);
}
/** The utility connection a reference names, when it resolves to one. */
function utilityAt(entities, targetId) {
    const target = entities.get(targetId);
    if (!target) {
        return undefined;
    }
    if (!isType(targetId, target, 'utility_connection', UTILITY_ID)) {
        return undefined;
    }
    return target;
}
function describeType(type) {
    if (type === undefined) {
        return 'not set';
    }
    return `"${type}"`;
}
export function checkPipeAndNetworkRules(entities) {
    const findings = [];
    for (const [id, entity] of entities) {
        const data = entity.data;
        if (isType(id, entity, 'pipe_run', PIPE_RUN_ID)) {
            const medium = str(data, 'medium');
            const allowed = medium !== undefined ? UTILITY_TYPES_FOR_MEDIUM[medium] : undefined;
            if (allowed !== undefined) {
                for (const field of ['from_ref', 'to_ref']) {
                    const targetId = str(data, field);
                    if (targetId === undefined) {
                        continue;
                    }
                    const utility = utilityAt(entities, targetId);
                    if (utility === undefined) {
                        continue;
                    }
                    const connectionType = str(utility.data, 'connection_type');
                    if (allowed.includes(connectionType ?? '')) {
                        continue;
                    }
                    findings.push({
                        severity: 'warning',
                        rule: 'pipe-endpoint-utility-type',
                        entity: id,
                        message: `${field} names ${targetId}, whose connection_type is ${describeType(connectionType)}; a pipe carrying ${medium} ends at a utility connection of type ${allowed.map((type) => `"${type}"`).join(' or ')}`,
                    });
                }
            }
        }
        if (isType(id, entity, 'network_node', NETWORK_NODE_ID)) {
            const targetId = str(data, 'utility_connection_ref');
            const utility = targetId !== undefined ? utilityAt(entities, targetId) : undefined;
            if (utility !== undefined) {
                const connectionType = str(utility.data, 'connection_type') ?? '';
                if (!TELECOM_TYPES.includes(connectionType)) {
                    findings.push({
                        severity: 'warning',
                        rule: 'network-node-utility-type',
                        entity: id,
                        message: `utility_connection_ref names ${targetId}, whose connection_type is ${describeType(connectionType || undefined)}; a network node is fed by a telecommunications service (${TELECOM_TYPES.map((type) => `"${type}"`).join(', ')})`,
                    });
                }
            }
        }
    }
    return findings;
}
//# sourceMappingURL=pipeAndNetworkRules.js.map