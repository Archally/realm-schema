// GENERATED - do not edit.
// Emitted by tsc from servers/realm/core/src/validation/electricalRules.ts and copied here by scripts/gen-derived.mjs.
// The TypeScript module is the single implementation: realm-core, the realm MCP server and
// `rl check` import it directly, while this plain-ESM emission is what the zero-build validator
// runs - including the copy published in the public realm repo, which is Apache-2.0 and therefore
// cannot import the engine. Editing this file makes the two disagree; change the .ts and re-run:
//     npm run build --workspace=servers/realm/core && npm run gen-derived

/**
 * Electrical topology and placement rules (schema v2.3.0).
 *
 * Dependency-free, like the other 2.3.0 rules, because the module is emitted into the
 * shared validator (`schemas/realm/.shared/validator/core/electrical-rules.mjs`) so the
 * published validator, the MCP server and `rl check` agree. Edit this file; the `.mjs`
 * is generated.
 *
 * The topological half (a socket belongs to a circuit, a circuit is protected by a device,
 * a device is fed from a board) is three reference fields on `component`; Ajv checks that
 * each resolves to a component. What Ajv cannot see is the far end's ROLE, the chain as a
 * whole, or a wall's geometry, and that is what these rules read:
 *
 *   feed-cycle                  `fed_from_ref` chains back to the entity itself. ERROR.
 *   circuit-refs-not-circuits   a `circuit_ref`, a `circuit_refs` entry or a lighting
 *                               group's `circuit_ref` resolves to a component whose
 *                               component_type is not `circuit`. Ajv checks the prefix;
 *                               the role is checked here. WARNING.
 *   circuit-crosses-building    a terminal device's building differs from the building of
 *                               the board its circuit's device is fed from, when both
 *                               resolve. A sub-board fed across buildings is the board's
 *                               own `fed_from_ref` and is not tested. WARNING.
 *   anchor-wall-off-room        a component mounted on a wall that bounds neither side of
 *                               its room. WARNING.
 *   anchor-beyond-wall          `wall_offset_cm` past the wall's length. Height is not
 *                               range-checked: a socket on a gable above the eave is
 *                               legitimate. WARNING.
 *   leg-beyond-wall             an along-wall leg's far offset, or a vertical leg's offset,
 *                               past the wall's length. WARNING.
 *   leg-wall-off-route          a leg on a wall that bounds none of the rooms or zones in
 *                               `through_refs`, when `through_refs` is given. WARNING.
 *
 * The two leg rules read the route's geometry, not its cargo, so they apply to every run that
 * carries the shared physical route (2.3.2): a cable run, a pipe run and a wired network link.
 * The riser rule reads `run_type`, which only a cable run has.
 *   riser-without-vertical-leg  `run_type: riser` whose route has no `vertical` leg. A
 *                               riser with no route at all is authored topologically only
 *                               and says nothing here. INFO.
 *
 * Frames, as the schema states them: a wall's `start` and `end` are model metres, so its
 * length in centimetres is the hypotenuse times 100; every offset compared to it is
 * centimetres along the wall from `start`.
 */
/** An offset this far past the wall's end is a rounding, not a placement error. */
export const WALL_LENGTH_TOLERANCE_CM = 1;
const CABLE_RUN_ID = /^([a-z][a-z0-9-]*\.)?CBR\d{3,}$/;
/** The prefixes of the entities that can carry a physical route (2.3.2). */
const ROUTED_ID = /^([a-z][a-z0-9-]*\.)?(CBR|PPR|NL)\d{3,}$/;
const ROUTED_TYPES = new Set(['cable_run', 'pipe_run', 'network_link']);
const CIRCUIT = 'circuit';
const BOARD = 'distribution-panel';
/** How far a `fed_from_ref` chain is followed to find the board; an installation is not deeper. */
const FEED_DEPTH = 8;
function str(data, key) {
    const value = data[key];
    return typeof value === 'string' ? value : undefined;
}
function num(data, key) {
    const value = data[key];
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}
function isCableRun(id, entity) {
    return entity.entityType === 'cable_run' || (entity.entityType === undefined && CABLE_RUN_ID.test(id));
}
/** A cable run, a pipe run or a network link: an entity whose `route` is a physical route. */
function isRouted(id, entity) {
    if (entity.entityType !== undefined) {
        return ROUTED_TYPES.has(entity.entityType);
    }
    return ROUTED_ID.test(id);
}
/** The wall's length in centimetres, or null when `start` or `end` is not a point. */
export function wallLengthCm(wall) {
    const start = wall['start'];
    const end = wall['end'];
    if (!start || !end || typeof start !== 'object' || typeof end !== 'object')
        return null;
    const { x: x0, y: y0 } = start;
    const { x: x1, y: y1 } = end;
    if ([x0, y0, x1, y1].some((v) => typeof v !== 'number'))
        return null;
    return Math.hypot(x1 - x0, y1 - y0) * 100;
}
/** Whether the wall has the room or zone on either side. */
export function wallBoundsSpace(wall, spaceId) {
    return str(wall, 'left_space_ref') === spaceId || str(wall, 'right_space_ref') === spaceId;
}
/** The building a room belongs to: its own `building_ref`, else through its floor. */
function buildingOfRoom(entities, roomId) {
    const room = entities.get(roomId);
    if (!room)
        return undefined;
    const direct = str(room.data, 'building_ref');
    if (direct)
        return direct;
    const floorId = str(room.data, 'floor_ref');
    const floor = floorId ? entities.get(floorId) : undefined;
    return floor ? str(floor.data, 'building_ref') : undefined;
}
/** The building a component stands in: its own `building_ref`, else through its room. */
function buildingOfComponent(entities, component) {
    const direct = str(component.data, 'building_ref');
    if (direct)
        return direct;
    const roomId = str(component.data, 'room_ref');
    return roomId ? buildingOfRoom(entities, roomId) : undefined;
}
/** Follow `fed_from_ref` from a device until a board is reached; cycle-safe, depth-bounded. */
function boardFeeding(entities, deviceId) {
    const seen = new Set();
    let cursor = deviceId;
    for (let depth = 0; cursor !== undefined && depth < FEED_DEPTH; depth++) {
        if (seen.has(cursor))
            return undefined;
        seen.add(cursor);
        const entity = entities.get(cursor);
        if (!entity)
            return undefined;
        if (str(entity.data, 'component_type') === BOARD)
            return entity;
        cursor = str(entity.data, 'fed_from_ref');
    }
    return undefined;
}
/** The legs of a run's route that carry a wall reference, with their index. */
function wallLegs(data) {
    const route = data['route'];
    if (!route || typeof route !== 'object')
        return [];
    const legs = route['legs'];
    if (!Array.isArray(legs))
        return [];
    const out = [];
    legs.forEach((leg, index) => {
        if (leg && typeof leg === 'object')
            out.push({ index, leg: leg });
    });
    return out;
}
/** Consecutive endpoints may differ by at most one centimetre. */
export const ROUTE_JOIN_TOLERANCE_M = 0.01;
function record(value) {
    return value !== null && typeof value === 'object' ? value : {};
}
/** Resolve only stated associations, never a floor guessed from an elevation. */
function attachedFloors(entities, data) {
    const floors = new Set();
    const direct = str(data, 'floor_ref');
    if (direct !== undefined && entities.has(direct))
        floors.add(direct);
    for (const field of ['room_ref', 'left_space_ref', 'right_space_ref']) {
        const ref = str(data, field);
        const floor = ref !== undefined ? str(entities.get(ref)?.data ?? {}, 'floor_ref') : undefined;
        if (floor !== undefined && entities.has(floor))
            floors.add(floor);
    }
    return floors;
}
/** A finite point in model metres; absent geometry is not zero geometry. */
function point3(value) {
    const point = record(value);
    const x = num(point, 'x');
    const y = num(point, 'y');
    const z = num(point, 'z');
    return x !== undefined && y !== undefined && z !== undefined ? [x, y, z] : undefined;
}
function legEndpoint(entities, leg, end) {
    const kind = str(leg, 'kind');
    if (kind === 'free') {
        const vertices = record(leg['path'])['vertices'];
        if (!Array.isArray(vertices))
            return undefined;
        return point3(vertices[end ? vertices.length - 1 : 0]);
    }
    const wallRef = str(leg, 'wall_segment_ref');
    const wall = wallRef !== undefined ? entities.get(wallRef)?.data : undefined;
    if (wall === undefined)
        return undefined;
    const start = record(wall['start']);
    const finish = record(wall['end']);
    const x = num(start, 'x');
    const y = num(start, 'y');
    const x1 = num(finish, 'x');
    const y1 = num(finish, 'y');
    if (x === undefined || y === undefined || x1 === undefined || y1 === undefined)
        return undefined;
    const length = Math.hypot(x1 - x, y1 - y);
    if (!Number.isFinite(length) || length === 0)
        return undefined;
    const offset = num(leg, kind === 'vertical' ? 'offset_cm' : end ? 'to_offset_cm' : 'from_offset_cm');
    let z;
    if (kind === 'vertical')
        z = num(leg, end ? 'to_elevation_m' : 'from_elevation_m');
    if (kind === 'along-wall') {
        const elevations = [...attachedFloors(entities, wall)].map((id) => num(entities.get(id).data, 'finished_floor_elevation_m'));
        const height = num(leg, 'height_cm');
        if (elevations.length === 1 && elevations[0] !== undefined && height !== undefined)
            z = elevations[0] + height / 100;
    }
    if (offset === undefined || z === undefined)
        return undefined;
    const point = [x + (x1 - x) * offset / (100 * length), y + (y1 - y) * offset / (100 * length), z];
    return point.every(Number.isFinite) ? point : undefined;
}
function joinDistance(entities, left, right) {
    // This pair has the same local frame even when its datum elevation is unrecorded.
    if (str(left, 'kind') === 'along-wall' && str(right, 'kind') === 'along-wall' &&
        str(left, 'wall_segment_ref') !== undefined && str(left, 'wall_segment_ref') === str(right, 'wall_segment_ref')) {
        const a = num(left, 'to_offset_cm');
        const b = num(right, 'from_offset_cm');
        const h0 = num(left, 'height_cm');
        const h1 = num(right, 'height_cm');
        if (a !== undefined && b !== undefined && h0 !== undefined && h1 !== undefined)
            return Math.hypot(a - b, h0 - h1) / 100;
    }
    const a = legEndpoint(entities, left, true);
    const b = legEndpoint(entities, right, false);
    return a !== undefined && b !== undefined ? Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) : undefined;
}
function checkPhysicalRoute(entities, id, data) {
    const findings = [];
    const rawLegs = record(data['route'])['legs'];
    if (!Array.isArray(rawLegs))
        return findings;
    const legs = rawLegs.map(record);
    const floors = new Set();
    const buildings = new Set();
    const attachments = [data];
    for (const ref of [data['from_ref'], data['to_ref'], data['from_node_ref'], data['to_node_ref'],
        ...(Array.isArray(data['through_refs']) ? data['through_refs'] : []), ...legs.map((leg) => leg['wall_segment_ref'])]) {
        if (typeof ref !== 'string')
            continue;
        const target = entities.get(ref);
        if (target !== undefined)
            attachments.push(target.data);
    }
    for (const attachment of attachments) {
        for (const floor of attachedFloors(entities, attachment))
            floors.add(floor);
        const building = str(attachment, 'building_ref');
        if (building !== undefined && entities.has(building))
            buildings.add(building);
        const wallRef = str(attachment, 'wall_segment_ref');
        const wall = wallRef !== undefined ? entities.get(wallRef) : undefined;
        if (wall !== undefined) {
            for (const floor of attachedFloors(entities, wall.data))
                floors.add(floor);
        }
    }
    for (const floor of floors) {
        const building = str(entities.get(floor).data, 'building_ref');
        if (building !== undefined && entities.has(building))
            buildings.add(building);
    }
    legs.forEach((leg, index) => {
        const values = [];
        for (const field of ['from_offset_cm', 'to_offset_cm', 'height_cm', 'offset_cm', 'from_elevation_m', 'to_elevation_m']) {
            values.push([field, leg[field]]);
        }
        const vertices = record(leg['path'])['vertices'];
        if (Array.isArray(vertices)) {
            vertices.forEach((vertex, vertexIndex) => {
                for (const axis of ['x', 'y', 'z'])
                    values.push([`path.vertices[${vertexIndex}].${axis}`, record(vertex)[axis]]);
            });
        }
        for (const [field, value] of values) {
            if (typeof value === 'number' && !Number.isFinite(value)) {
                findings.push({ severity: 'error', rule: 'route-non-finite-coordinate', entity: id,
                    message: `route.legs[${index}].${field} is ${String(value)}; route coordinates must be finite` });
            }
        }
        if (index > 0) {
            const gap = joinDistance(entities, legs[index - 1], leg);
            if (gap !== undefined && gap > ROUTE_JOIN_TOLERANCE_M + 1e-9) {
                findings.push({ severity: 'warning', rule: 'route-discontinuous-legs', entity: id,
                    message: `route.legs[${index - 1}] end and route.legs[${index}] start are ${gap.toFixed(4)} m apart; tolerance is ${ROUTE_JOIN_TOLERANCE_M} m` });
            }
        }
        const floorRef = str(leg, 'floor_ref');
        const floor = floorRef !== undefined ? entities.get(floorRef) : undefined;
        if (floorRef === undefined || floor === undefined)
            return;
        const building = str(floor.data, 'building_ref');
        const wrongFloor = floors.size > 0 && !floors.has(floorRef);
        const wrongBuilding = buildings.size > 0 && building !== undefined && !buildings.has(building);
        if (wrongFloor || wrongBuilding) {
            findings.push({ severity: 'warning', rule: 'route-floor-association', entity: id,
                message: `route.legs[${index}].floor_ref ${floorRef} contradicts attached floors (${[...floors].join(', ') || 'unknown'}) or buildings (${[...buildings].join(', ') || 'unknown'})` });
        }
    });
    return findings;
}
export function checkElectricalRules(entities) {
    const findings = [];
    const notCircuit = (entity, field, targetId) => {
        const target = entities.get(targetId);
        if (!target)
            return; // the reference layer reports a dangling ref
        const type = str(target.data, 'component_type');
        if (type === CIRCUIT)
            return;
        findings.push({
            severity: 'warning',
            rule: 'circuit-refs-not-circuits',
            entity,
            message: `${field} names ${targetId}, whose component_type is ${type ? `"${type}"` : 'not set'}; a circuit reference resolves to a component of type "circuit"`,
        });
    };
    for (const [id, entity] of entities) {
        const data = entity.data;
        // feed-cycle: fed_from_ref is self-referential on CMP, so a cycle is possible.
        const fedFrom = str(data, 'fed_from_ref');
        if (fedFrom !== undefined) {
            const seen = new Set([id]);
            let cursor = fedFrom;
            while (cursor !== undefined) {
                if (seen.has(cursor)) {
                    findings.push({
                        severity: 'error',
                        rule: 'feed-cycle',
                        entity: id,
                        message: `fed_from_ref chain returns to ${cursor} (${[...seen, cursor].join(' -> ')}); a board cannot be fed from what it feeds`,
                    });
                    break;
                }
                seen.add(cursor);
                const next = entities.get(cursor)?.data['fed_from_ref'];
                cursor = typeof next === 'string' ? next : undefined;
            }
        }
        // circuit-refs-not-circuits: top-level, array, and the room's nested lighting groups.
        const circuitRef = str(data, 'circuit_ref');
        if (circuitRef !== undefined)
            notCircuit(id, 'circuit_ref', circuitRef);
        const circuitRefs = data['circuit_refs'];
        if (Array.isArray(circuitRefs)) {
            circuitRefs.forEach((targetId, index) => {
                if (typeof targetId === 'string')
                    notCircuit(id, `circuit_refs[${index}]`, targetId);
            });
        }
        const groups = data['lighting_groups'];
        if (Array.isArray(groups)) {
            groups.forEach((group, index) => {
                if (!group || typeof group !== 'object')
                    return;
                const target = group['circuit_ref'];
                if (typeof target === 'string')
                    notCircuit(id, `lighting_groups[${index}].circuit_ref`, target);
            });
        }
        // circuit-crosses-building: terminal -> circuit -> device -> ... -> board, both buildings known.
        if (circuitRef !== undefined) {
            const ownBuilding = buildingOfComponent(entities, entity);
            const circuit = entities.get(circuitRef);
            const deviceId = circuit ? str(circuit.data, 'protected_by_ref') : undefined;
            const board = deviceId ? boardFeeding(entities, deviceId) : undefined;
            const boardBuilding = board ? buildingOfComponent(entities, board) : undefined;
            if (ownBuilding !== undefined && boardBuilding !== undefined && ownBuilding !== boardBuilding) {
                findings.push({
                    severity: 'warning',
                    rule: 'circuit-crosses-building',
                    entity: id,
                    message: `stands in ${ownBuilding} but its circuit ${circuitRef} is fed from a board in ${boardBuilding}; a circuit that crosses buildings usually means a sub-board is missing from the model`,
                });
            }
        }
        // anchor-wall-off-room and anchor-beyond-wall: a component on a wall.
        const wallRef = str(data, 'wall_segment_ref');
        const wall = wallRef !== undefined ? entities.get(wallRef) : undefined;
        if (wall !== undefined && wallRef !== undefined && !isRouted(id, entity)) {
            const roomId = str(data, 'room_ref');
            if (roomId !== undefined && !wallBoundsSpace(wall.data, roomId)) {
                findings.push({
                    severity: 'warning',
                    rule: 'anchor-wall-off-room',
                    entity: id,
                    message: `is mounted on ${wallRef}, which bounds ${describeSides(wall.data)}, not its room ${roomId}`,
                });
            }
            const offset = num(data, 'wall_offset_cm');
            const length = wallLengthCm(wall.data);
            if (offset !== undefined && length !== null && offset > length + WALL_LENGTH_TOLERANCE_CM) {
                findings.push({
                    severity: 'warning',
                    rule: 'anchor-beyond-wall',
                    entity: id,
                    message: `wall_offset_cm ${offset} is past the end of ${wallRef}, which is ${round1(length)} cm long`,
                });
            }
        }
        // The route rules: every routed run's legs, then the cable run's riser.
        if (!isRouted(id, entity))
            continue;
        findings.push(...checkPhysicalRoute(entities, id, data));
        const through = Array.isArray(data['through_refs'])
            ? data['through_refs'].filter((v) => typeof v === 'string')
            : [];
        const legs = wallLegs(data);
        for (const { index, leg } of legs) {
            const legWallRef = str(leg, 'wall_segment_ref');
            const legWall = legWallRef !== undefined ? entities.get(legWallRef) : undefined;
            if (legWallRef === undefined || legWall === undefined)
                continue;
            const length = wallLengthCm(legWall.data);
            const kind = str(leg, 'kind');
            const farOffset = kind === 'vertical'
                ? num(leg, 'offset_cm')
                : Math.max(num(leg, 'from_offset_cm') ?? -Infinity, num(leg, 'to_offset_cm') ?? -Infinity);
            if (length !== null && farOffset !== undefined && Number.isFinite(farOffset) && farOffset > length + WALL_LENGTH_TOLERANCE_CM) {
                findings.push({
                    severity: 'warning',
                    rule: 'leg-beyond-wall',
                    entity: id,
                    message: `route.legs[${index}] reaches ${farOffset} cm along ${legWallRef}, which is ${round1(length)} cm long`,
                });
            }
            if (through.length > 0 && !through.some((space) => wallBoundsSpace(legWall.data, space))) {
                findings.push({
                    severity: 'warning',
                    rule: 'leg-wall-off-route',
                    entity: id,
                    message: `route.legs[${index}] follows ${legWallRef}, which bounds ${describeSides(legWall.data)}, none of which is in through_refs (${through.join(', ')})`,
                });
            }
        }
        if (isCableRun(id, entity) && str(data, 'run_type') === 'riser' && legs.length > 0 && !legs.some(({ leg }) => str(leg, 'kind') === 'vertical')) {
            findings.push({
                severity: 'info',
                rule: 'riser-without-vertical-leg',
                entity: id,
                message: `run_type is riser but no leg of its route is vertical; a riser's geometry is a vertical leg between two elevations`,
            });
        }
    }
    return findings;
}
function describeSides(wall) {
    const sides = [str(wall, 'left_space_ref'), str(wall, 'right_space_ref')].filter((s) => s !== undefined);
    return sides.length > 0 ? sides.join(' and ') : 'no declared space';
}
function round1(value) {
    return Math.round(value * 10) / 10;
}
//# sourceMappingURL=electricalRules.js.map