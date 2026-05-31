// ═══════════════════════════════════════════════════════════════════════════════
// Layer 4: Cross-Layer Consistency (C01-C10)
// Semantic ↔ Construction alignment checks.
// ═══════════════════════════════════════════════════════════════════════════════

export function validateCrossLayer(entities, constructionFiles, config) {
  const issues = [];

  // Collect rooms with semantic walls
  const roomsWithWalls = new Map();
  for (const [id, { data }] of entities) {
    if (!id.startsWith("RM") || !data.walls) continue;
    roomsWithWalls.set(id, data);
  }

  // Collect construction entities by type
  const wallSegments = new Map();
  const slabs = [];
  const roofPlanes = [];

  for (const [id, { data }] of entities) {
    if (id.startsWith("WSG")) wallSegments.set(id, data);
    else if (id.startsWith("SLB")) slabs.push({ id, data });
    else if (id.startsWith("RFP")) roofPlanes.push({ id, data });
  }

  // No construction data → skip cross-layer checks
  if (wallSegments.size === 0 && slabs.length === 0 && roofPlanes.length === 0) {
    return { issues };
  }

  // ── C01: Every room with walls{} has corresponding WSG ──
  const roomsInWSG = new Set();
  for (const [, wsData] of wallSegments) {
    if (wsData.left_space_ref) roomsInWSG.add(wsData.left_space_ref);
    if (wsData.right_space_ref) roomsInWSG.add(wsData.right_space_ref);
  }
  for (const [roomId] of roomsWithWalls) {
    if (!roomsInWSG.has(roomId)) {
      issues.push({ severity: "warning", rule: "C01", entity: roomId, message: "Room has walls{} but no WSG references it" });
    }
  }

  // ── C02: Wall thickness match (±tolerance) ──
  // TODO: requires compass-direction → WSG line mapping (spatial reasoning)
  // Deferred to viewers-v2 plan Step 03 (validate_construction MCP tool)

  // ── C03: is_exterior consistency ──
  // (Requires compass-direction to WSG mapping — deferred)

  // ── C04: Adjacency consistency ──
  // (Requires spatial analysis — deferred)

  // ── C05: Opening coverage ──
  const semanticOpeningCount = new Map();
  for (const [roomId, roomData] of roomsWithWalls) {
    if (roomData.openings?.length > 0) {
      semanticOpeningCount.set(roomId, roomData.openings.length);
    }
  }
  const constructionOpeningsByRoom = new Map();
  for (const [, wsData] of wallSegments) {
    if (!wsData.openings) continue;
    for (const opening of wsData.openings) {
      if (opening.source_room_ref) {
        constructionOpeningsByRoom.set(
          opening.source_room_ref,
          (constructionOpeningsByRoom.get(opening.source_room_ref) || 0) + 1,
        );
      }
    }
  }
  for (const [roomId, count] of semanticOpeningCount) {
    const constructionCount = constructionOpeningsByRoom.get(roomId) || 0;
    if (constructionCount < count) {
      issues.push({ severity: "warning", rule: "C05", entity: roomId, message: `Room has ${count} semantic openings but only ${constructionCount} mapped to WSG` });
    }
  }

  // ── C06: Opening width match ──
  // (Would need per-opening matching — deferred to spatial analysis)

  // ── C07: SLB count ≥ FLR count per building ──
  const floorsByBld = new Map();
  const slabsByBld = new Map();
  for (const [id, { data }] of entities) {
    if (id.startsWith("FLR") && data.building_ref) {
      floorsByBld.set(data.building_ref, (floorsByBld.get(data.building_ref) || 0) + 1);
    }
  }
  for (const { data } of slabs) {
    if (data.floor_ref) {
      const floor = entities.get(data.floor_ref);
      if (floor?.data?.building_ref) {
        slabsByBld.set(floor.data.building_ref, (slabsByBld.get(floor.data.building_ref) || 0) + 1);
      }
    }
  }
  for (const [bldId, floorCount] of floorsByBld) {
    const slabCount = slabsByBld.get(bldId) || 0;
    if (slabCount < floorCount) {
      issues.push({ severity: "warning", rule: "C07", entity: bldId, message: `Building has ${floorCount} floors but only ${slabCount} slabs` });
    }
  }

  // ── C08: Building with roof metadata has ≥1 RFP ──
  const rfpByBuilding = new Map();
  for (const { data } of roofPlanes) {
    if (data.building_ref) {
      rfpByBuilding.set(data.building_ref, (rfpByBuilding.get(data.building_ref) || 0) + 1);
    }
  }
  for (const [id, { data }] of entities) {
    if (!id.startsWith("BLD")) continue;
    const hasRoofMeta = data.ridge_height_m != null || data.eave_height_m != null;
    if (hasRoofMeta && !rfpByBuilding.has(id)) {
      issues.push({ severity: "warning", rule: "C08", entity: id, message: "Building has roof height metadata but no RFP entities" });
    }
  }

  // ── C09: WSG count per floor ≥ 4 ──
  const wsgByFloor = new Map();
  for (const [, wsData] of wallSegments) {
    if (wsData.floor_ref) {
      wsgByFloor.set(wsData.floor_ref, (wsgByFloor.get(wsData.floor_ref) || 0) + 1);
    }
  }
  for (const [floorId, count] of wsgByFloor) {
    if (count < 4) {
      issues.push({ severity: "warning", rule: "C09", entity: floorId, message: `Floor has only ${count} wall segments (minimum 4 for enclosed space)` });
    }
  }

  // ── C10: Provenance refs look valid ──
  for (const [relPath, data] of constructionFiles) {
    if (data?.generated_from?.semantic_source_refs) {
      for (const ref of data.generated_from.semantic_source_refs) {
        if (!ref.includes("/") && !ref.endsWith(".yaml")) {
          issues.push({ severity: "warning", rule: "C10", file: relPath, message: `Provenance ref "${ref}" doesn't look like a YAML file path` });
        }
      }
    }
  }

  return { issues };
}
