// Synthetic route pairs: each violating case has a corrected control.
const free = (x = 0, floor_ref) => ({ kind: 'free', ...(floor_ref ? { floor_ref } : {}),
  path: { vertices: [{ x, y: 0, z: 1 }, { x: x + 1, y: 0, z: 1 }] } });
const along = (wall = 'WSG001', from = 0, to = 100) => ({ kind: 'along-wall', wall_segment_ref: wall,
  from_offset_cm: from, to_offset_cm: to, height_cm: 100 });
const vertical = (from = 1, to = 2) => ({ kind: 'vertical', wall_segment_ref: 'WSG001', offset_cm: 100,
  from_elevation_m: from, to_elevation_m: to });
const house = {
  BLD001: {}, BLD002: {},
  FLR001: { building_ref: 'BLD001', finished_floor_elevation_m: 0 },
  FLR002: { building_ref: 'BLD001', finished_floor_elevation_m: 3 },
  FLR003: { building_ref: 'BLD002', finished_floor_elevation_m: 0 },
  RM001: { floor_ref: 'FLR001' }, RM002: { floor_ref: 'FLR002' },
  CMP001: { room_ref: 'RM001' }, NN001: { building_ref: 'BLD001' },
  WSG001: { floor_ref: 'FLR001', start: { x: 0, y: 0 }, end: { x: 4, y: 0 } },
  WSG002: { floor_ref: 'FLR001', start: { x: 1, y: 0 }, end: { x: 1, y: 4 } },
};

export function routeRuleCases() {
  const nonfinite = [];
  for (const value of [NaN, Infinity, -Infinity]) {
    for (const axis of ['x', 'y', 'z']) {
      const broken = free();
      broken.path.vertices[0][axis] = value;
      nonfinite.push({ bad: [broken], good: [free()] });
    }
    for (const [leg, fields] of [[along(), ['from_offset_cm', 'to_offset_cm', 'height_cm']],
      [vertical(), ['offset_cm', 'from_elevation_m', 'to_elevation_m']]]) {
      for (const field of fields) nonfinite.push({ bad: [{ ...leg, [field]: value }], good: [{ ...leg }] });
    }
  }
  return [
    { rule: 'route-non-finite-coordinate', severity: 'error', cases: nonfinite },
    { rule: 'route-discontinuous-legs', severity: 'warning', cases: [
      { bad: [free(), free(1.02)], good: [free(), free(1.01)] },
      { bad: [along(), along('WSG001', 102, 200)], good: [along(), along('WSG001', 101, 200)] },
      { bad: [along(), along('WSG002', 2, 100)], good: [along(), along('WSG002', 0, 100)] },
      { bad: [along(), vertical(1.02)], good: [along(), vertical()] },
      { bad: [vertical(), { ...free(1), path: { vertices: [{ x: 1, y: 0, z: 2.02 }, { x: 2, y: 0, z: 2.02 }] } }],
        good: [vertical(), { ...free(1), path: { vertices: [{ x: 1, y: 0, z: 2 }, { x: 2, y: 0, z: 2 }] } }] },
    ] },
    { rule: 'route-floor-association', severity: 'warning', cases: [
      { data: { through_refs: ['RM001'] }, bad: [free(0, 'FLR002')], good: [free(0, 'FLR001')] },
      { data: { from_ref: 'CMP001' }, bad: [free(0, 'FLR002')], good: [free(0, 'FLR001')] },
      { data: { from_node_ref: 'NN001' }, bad: [free(0, 'FLR003')], good: [free(0, 'FLR001')] },
      { bad: [along(), free(1, 'FLR002')], good: [along(), free(1, 'FLR001')] },
    ] },
  ];
}

export function routeEntities(id, entityType, legs, data = {}, context = house) {
  return new Map([
    ...Object.entries(context).map(([key, value]) => [key, { data: value }]),
    [id, { ...(entityType ? { entityType } : {}), data: { ...data, route: { legs } } }],
  ]);
}

export function validRouteControls() {
  return [
    routeEntities('CBR001', 'cable_run', [free(0, 'FLR002')], { through_refs: ['RM001', 'RM002'] }),
    routeEntities('PPR001', 'pipe_run', [free(0, 'FLR001')], {}, {}),
    routeEntities('NL001', 'network_link', [free(), {}, free(100)]),
    // Neither unknown references nor missing floor datum justify an invented gap.
    routeEntities('CBR001', undefined, [along(), free(100)], {}, { WSG001: house.WSG001 }),
    routeEntities('PPR001', undefined, [along(), along('WSG001', 101, 200)], {}, {}),
  ];
}
