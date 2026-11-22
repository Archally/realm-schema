// ═══════════════════════════════════════════════════════════════════════════════
// Layer 3: Geometric Invariants (G01-G29)
// Physical plausibility checks for spatial data.
// ═══════════════════════════════════════════════════════════════════════════════

import {
  distance2d,
  polygonArea,
  coplanarityError,
  polygonsOverlapArea,
  entityPrefix,
  constructionByBuilding,
  isFiniteNumber,
  projectOnSegment,
  segmentCrossing,
  pointAlong,
  planeElevationAt,
  polygonCovers,
  wallTopAt,
  buildingOutline,
} from "./helpers.mjs";

export function validateGeometric(entities, config) {
  const issues = [];

  for (const [id, { data }] of entities) {
    const prefix = entityPrefix(id);

    // ── WSG (Wall Segment) checks ──
    if (prefix === "WSG") {
      // G01: Non-zero length
      if (data.start && data.end && distance2d(data.start, data.end) < 0.01) {
        issues.push({ severity: "error", rule: "G01", entity: id, message: "Wall segment has zero length (start ≈ end)" });
      }
      // G02: Thickness bounds (0, 200] cm
      if (data.thickness_cm != null && (data.thickness_cm <= 0 || data.thickness_cm > 200)) {
        issues.push({ severity: "error", rule: "G02", entity: id, message: `Wall thickness ${data.thickness_cm}cm out of range (0, 200]` });
      }
      // G03: Height bounds (0, 20] m
      if (data.height_m != null && (data.height_m <= 0 || data.height_m > 20)) {
        issues.push({ severity: "warning", rule: "G03", entity: id, message: `Wall height ${data.height_m}m outside typical range (0, 20]` });
      }
    }

    // ── SLB (Floor Slab) checks ──
    if (prefix === "SLB") {
      // G04: Outline vertex count ≥ 3
      if (data.outline?.vertices && data.outline.vertices.length < 3) {
        issues.push({ severity: "error", rule: "G04", entity: id, message: `Slab outline has ${data.outline.vertices.length} vertices (need ≥3)` });
      }
      // G05: Thickness bounds (0, 100] cm
      if (data.thickness_cm != null && (data.thickness_cm <= 0 || data.thickness_cm > 100)) {
        issues.push({ severity: "error", rule: "G05", entity: id, message: `Slab thickness ${data.thickness_cm}cm out of range (0, 100]` });
      }
    }

    // ── RFP (Roof Plane) checks ──
    if (prefix === "RFP") {
      // G06: Vertex count ≥ 3
      if (data.vertices_3d && data.vertices_3d.length < 3) {
        issues.push({ severity: "error", rule: "G06", entity: id, message: `Roof plane has ${data.vertices_3d.length} vertices (need ≥3)` });
      }
      // G07: Coplanarity within tolerance
      if (data.vertices_3d && data.vertices_3d.length >= 4) {
        const errCm = coplanarityError(data.vertices_3d);
        const tolerance = config.coplanarity_tolerance_cm ?? 1;
        if (errCm > tolerance) {
          issues.push({ severity: "warning", rule: "G07", entity: id, message: `Roof vertices deviate ${errCm.toFixed(2)}cm from plane (tolerance: ${tolerance}cm)` });
        }
      }
    }

    // ── BLD (Building) checks ──
    if (prefix === "BLD") {
      // G08: eave < ridge
      if (data.eave_height_m != null && data.ridge_height_m != null && data.eave_height_m >= data.ridge_height_m) {
        issues.push({ severity: "warning", rule: "G08", entity: id, message: `eave_height_m (${data.eave_height_m}) ≥ ridge_height_m (${data.ridge_height_m})` });
      }
      // G09: Ground elevation reasonable (±5m from datum)
      if (data.ground_elevation_m != null && Math.abs(data.ground_elevation_m) > 5) {
        issues.push({ severity: "warning", rule: "G09", entity: id, message: `ground_elevation_m (${data.ground_elevation_m}) unusually far from datum` });
      }
      // G16: Building has ≥1 wing (v2 requirement)
      if (!data.wing_refs || data.wing_refs.length === 0) {
        issues.push({ severity: "error", rule: "G16", entity: id, message: "Building has no wing_refs (v2 requires ≥1 wing)" });
      }
    }

    // ── SPM (Specimen) checks ──
    if (prefix === "SPM") {
      // G11: crown_bottom_height < height
      if (data.crown_bottom_height_m != null && data.height_m != null && data.crown_bottom_height_m >= data.height_m) {
        issues.push({ severity: "warning", rule: "G11", entity: id, message: `crown_bottom_height_m (${data.crown_bottom_height_m}) ≥ height_m (${data.height_m})` });
      }
    }

    // ── RM (Room) checks ──
    if (prefix === "RM") {
      // G12: area ≈ width × length (within 10%)
      if (data.area_sqm && data.width_cm && data.length_cm) {
        const computed = (data.width_cm * data.length_cm) / 10000;
        const diff = Math.abs(computed - data.area_sqm) / data.area_sqm;
        if (diff > 0.1) {
          issues.push({ severity: "warning", rule: "G12", entity: id, message: `area_sqm (${data.area_sqm}) differs from width×length (${computed.toFixed(1)}) by ${(diff * 100).toFixed(0)}%` });
        }
      }
    }

    // ── LP (Parcel) checks ──
    if (prefix === "LP") {
      // G17: Elevation reasonable for local-ground (±500m)
      if (data.elevation_m != null && Math.abs(data.elevation_m) > 500) {
        issues.push({ severity: "warning", rule: "G17", entity: id, message: `elevation_m (${data.elevation_m}) unusually large for local-ground datum` });
      }
    }
  }

  // G10: Floor base_elevation increases with level number (per building)
  const floorsByBuilding = new Map();
  for (const [id, { data }] of entities) {
    if (!id.startsWith("FLR") || !data.building_ref) continue;
    if (!floorsByBuilding.has(data.building_ref)) floorsByBuilding.set(data.building_ref, []);
    floorsByBuilding.get(data.building_ref).push({ id, level: data.level, baseElev: data.base_elevation_m });
  }
  for (const [bldId, floors] of floorsByBuilding) {
    const sorted = floors.filter(f => f.level != null && f.baseElev != null).sort((a, b) => a.level - b.level);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].baseElev <= sorted[i - 1].baseElev) {
        issues.push({ severity: "warning", rule: "G10", entity: sorted[i].id, message: `base_elevation_m (${sorted[i].baseElev}) not greater than floor below (${sorted[i - 1].baseElev}) in ${bldId}` });
      }
    }
  }

  // G13: Wing footprints within same building do not overlap (>0.1 m²)
  const wingsByBuilding = new Map();
  for (const [id, { data }] of entities) {
    if (!id.startsWith("WNG") || !data.building_ref || !data.footprint?.vertices) continue;
    if (!wingsByBuilding.has(data.building_ref)) wingsByBuilding.set(data.building_ref, []);
    wingsByBuilding.get(data.building_ref).push({ id, vertices: data.footprint.vertices });
  }
  for (const [bldId, wings] of wingsByBuilding) {
    for (let i = 0; i < wings.length; i++) {
      for (let j = i + 1; j < wings.length; j++) {
        const overlap = polygonsOverlapArea(wings[i].vertices, wings[j].vertices);
        if (overlap > 0.1) {
          issues.push({ severity: "warning", rule: "G13", entity: wings[i].id, message: `Wing footprint overlaps ${wings[j].id} by ~${overlap.toFixed(1)}m² in ${bldId}` });
        }
      }
    }
  }

  // G14: Union of wing areas ≈ building footprint area (within 10%)
  for (const [bldId, wings] of wingsByBuilding) {
    const bld = entities.get(bldId);
    if (!bld?.data?.footprint?.vertices) continue;
    const bldArea = polygonArea(bld.data.footprint.vertices);
    const wingAreaSum = wings.reduce((sum, w) => sum + polygonArea(w.vertices), 0);
    if (bldArea > 0) {
      const diff = Math.abs(wingAreaSum - bldArea) / bldArea;
      if (diff > 0.1) {
        issues.push({ severity: "warning", rule: "G14", entity: bldId, message: `Wing area sum (${wingAreaSum.toFixed(1)}m²) differs from building footprint (${bldArea.toFixed(1)}m²) by ${(diff * 100).toFixed(0)}%` });
      }
    }
  }

  // G15: Room wing_ref consistent with floor wing_ref
  for (const [id, { data }] of entities) {
    if (!id.startsWith("RM") || !data.wing_ref || !data.floor_ref) continue;
    const floor = entities.get(data.floor_ref);
    if (floor?.data?.wing_ref && floor.data.wing_ref !== data.wing_ref) {
      issues.push({ severity: "warning", rule: "G15", entity: id, message: `wing_ref (${data.wing_ref}) differs from floor ${data.floor_ref} wing_ref (${floor.data.wing_ref})` });
    }
  }

  issues.push(...validateConstructionMembers(entities));

  return { issues };
}

// ═══════════════════════════════════════════════════════════════════════════════
// G18-G26: wall top profiles, columns and beams, judged per building across its
// construction documents. Lengths are compared to 1 cm, heights to 5 cm. A roof plane
// is compared as the surface its vertices state, without a roof build-up.
// ═══════════════════════════════════════════════════════════════════════════════

const LENGTH_TOLERANCE_M = 0.01;
const HEIGHT_TOLERANCE_M = 0.05;
/** Default roof overhang when a column's wing states none, for G22. */
const DEFAULT_OVERHANG_M = 0.1;

/** The numbers a column, beam or top profile states, as [label, value] pairs. */
function statedNumbers(prefix, data) {
  const pairs = [];
  const add = (label, value) => {
    if (typeof value === "number") pairs.push([label, value]);
  };
  if (prefix === "COL") {
    add("position.x", data.position?.x);
    add("position.y", data.position?.y);
    for (const field of ["base_elevation_m", "height_m", "width_cm", "depth_cm", "rotation_degrees"]) add(field, data[field]);
  } else if (prefix === "BEAM") {
    add("start.x", data.start?.x);
    add("start.y", data.start?.y);
    add("end.x", data.end?.x);
    add("end.y", data.end?.y);
    for (const field of ["top_elevation_start_m", "top_elevation_end_m", "width_cm", "depth_cm"]) add(field, data[field]);
  } else if (prefix === "WSG" && Array.isArray(data.top_profile)) {
    data.top_profile.forEach((point, index) => {
      add(`top_profile[${index}].offset_from_start_cm`, point?.offset_from_start_cm);
      add(`top_profile[${index}].elevation_m`, point?.elevation_m);
    });
  }
  return pairs;
}

/** Whether a wall's own geometry (line, base, profile) is complete enough to compare. */
function wallGeometryUsable(wall) {
  return Boolean(wall.start && wall.end) && isFiniteNumber(wall.start.x) && isFiniteNumber(wall.start.y)
    && isFiniteNumber(wall.end.x) && isFiniteNumber(wall.end.y);
}

/** The roof planes of a group that cover a plan point, with their elevation there. */
function roofsOver(roofs, point) {
  const found = [];
  for (const roof of roofs) {
    const vertices = roof.data.vertices_3d;
    if (!Array.isArray(vertices) || vertices.length < 3) continue;
    if (!polygonCovers(vertices, point, LENGTH_TOLERANCE_M)) continue;
    const elevation = planeElevationAt(vertices, point.x, point.y);
    if (elevation == null) continue;
    found.push({ id: roof.id, elevation });
  }
  return found;
}

/** Parameters along a-b where the segment crosses an edge of any of the roofs' outlines. */
function roofEdgeCrossings(a, b, roofs) {
  const crossings = [];
  for (const roof of roofs) {
    const vertices = roof.data.vertices_3d;
    if (!Array.isArray(vertices) || vertices.length < 3) continue;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const t = segmentCrossing(a, b, vertices[j], vertices[i]);
      if (t != null) crossings.push(t);
    }
  }
  return crossings;
}

/**
 * Sample parameters for comparing a piecewise linear edge with planar roofs: the given
 * breakpoints, each roof outline crossing and a point just either side of it, and the
 * middle of every interval. Between two samples the edge and the plane over it are both
 * straight, so the largest gap lies on a sample.
 */
function sampleParameters(breakpoints, crossings, lengthM) {
  const epsilon = lengthM > 0 ? Math.min(0.5, 0.005 / lengthM) : 0;
  const raw = [0, 1, ...breakpoints];
  for (const t of crossings) raw.push(t, t - epsilon, t + epsilon);
  const sorted = [...new Set(raw.map((t) => Math.max(0, Math.min(1, t))))].sort((x, y) => x - y);
  const withMiddles = [];
  for (let i = 0; i < sorted.length; i++) {
    withMiddles.push(sorted[i]);
    if (i + 1 < sorted.length) withMiddles.push((sorted[i] + sorted[i + 1]) / 2);
  }
  return withMiddles;
}

function validateConstructionMembers(entities) {
  const issues = [];
  const warn = (rule, entity, message) => issues.push({ severity: "warning", rule, entity, message });
  const fail = (rule, entity, message) => issues.push({ severity: "error", rule, entity, message });

  // G26: a column, a beam or a top profile point that states a number which is not finite.
  // Every other comparison skips such an element, because it cannot be measured.
  const unmeasurable = new Set();
  for (const [id, { data }] of entities) {
    const prefix = entityPrefix(id);
    if (prefix !== "COL" && prefix !== "BEAM" && prefix !== "WSG") continue;
    const bad = statedNumbers(prefix, data).filter(([, value]) => !Number.isFinite(value));
    if (bad.length === 0) continue;
    unmeasurable.add(id);
    fail("G26", id, `States a number that is not finite: ${bad.map(([label, value]) => `${label}=${value}`).join(", ")}`);
  }

  for (const group of constructionByBuilding(entities)) {
    const roofs = group.roofs;
    const wallsCarryingBeams = new Set(group.beams.flatMap((beam) => beam.data.rests_on_wall_segment_refs ?? []));

    for (const wall of group.walls) {
      if (unmeasurable.has(wall.id) || !wallGeometryUsable(wall.data)) continue;
      const data = wall.data;
      const lengthM = distance2d(data.start, data.end);
      const lengthCm = lengthM * 100;
      const profile = Array.isArray(data.top_profile) && data.top_profile.length >= 2 ? data.top_profile : null;

      if (profile) {
        // G18: the profile starts at the wall's start, ends at its end and advances along it.
        const offsets = profile.map((point) => point.offset_from_start_cm);
        const advances = offsets.every((offset, index) => index === 0 || offset > offsets[index - 1]);
        const startsAtStart = Math.abs(offsets[0]) <= LENGTH_TOLERANCE_M * 100;
        const endsAtEnd = Math.abs(offsets[offsets.length - 1] - lengthCm) <= LENGTH_TOLERANCE_M * 100;
        if (!advances || !startsAtStart || !endsAtEnd) {
          fail("G18", wall.id, `top_profile runs ${offsets[0]}..${offsets[offsets.length - 1]} cm${advances ? "" : " and does not advance"} along a ${lengthCm.toFixed(0)} cm wall (tolerance 1 cm)`);
          continue;
        }
        // G20: height_m names the profile's lowest point.
        if (data.height_m != null) {
          const lowest = Math.min(...profile.map((point) => point.elevation_m));
          const stated = (data.base_elevation_m ?? 0) + data.height_m;
          if (Math.abs(stated - lowest) > LENGTH_TOLERANCE_M) {
            warn("G20", wall.id, `base_elevation_m + height_m is ${stated.toFixed(2)} m, the top profile's lowest point ${lowest.toFixed(2)} m`);
          }
        }
      }

      // G19: a shaped top, or the level top of an exterior wall in a building-level document
      // with no beam resting on it, meets the roof plane above it along the whole wall.
      const shaped = Boolean(profile) || data.gable_peak_elevation_m != null;
      const levelChecked = !shaped && data.is_exterior === true && wall.buildingDocument && !wallsCarryingBeams.has(wall.id);
      if ((!shaped && !levelChecked) || roofs.length === 0 || lengthM < LENGTH_TOLERANCE_M) continue;
      const breakpoints = profile
        ? profile.map((point) => point.offset_from_start_cm / lengthCm)
        : data.gable_peak_elevation_m != null ? [0.5] : [];
      let worst = null;
      for (const t of sampleParameters(breakpoints, roofEdgeCrossings(data.start, data.end, roofs), lengthM)) {
        const top = wallTopAt(data, t);
        if (top == null) continue;
        const over = roofsOver(roofs, pointAlong(data.start, data.end, t));
        if (over.length === 0) continue;
        const gap = Math.min(...over.map((roof) => Math.abs(roof.elevation - top)));
        if (!worst || gap > worst.gap) worst = { gap, t, top };
      }
      if (worst && worst.gap > HEIGHT_TOLERANCE_M) {
        warn("G19", wall.id, `Top at ${(worst.t * lengthCm).toFixed(0)} cm along the wall (${worst.top.toFixed(2)} m) is ${worst.gap.toFixed(3)} m from the roof plane above it (tolerance 5 cm)`);
      }
    }

    for (const column of group.columns) {
      if (unmeasurable.has(column.id)) continue;
      const data = column.data;
      if (!data.position || data.height_m == null) continue;
      const top = (data.base_elevation_m ?? 0) + data.height_m;

      // G21: a column's top meets each roof plane it says it carries.
      for (const ref of data.supports_roof_plane_refs ?? []) {
        const roof = entities.get(ref);
        if (!roof || entityPrefix(ref) !== "RFP") continue;
        const elevation = planeElevationAt(roof.data.vertices_3d, data.position.x, data.position.y);
        if (elevation == null) continue;
        if (Math.abs(elevation - top) > HEIGHT_TOLERANCE_M) {
          warn("G21", column.id, `Top ${top.toFixed(3)} m is ${Math.abs(elevation - top).toFixed(3)} m from ${ref} (${elevation.toFixed(3)} m) above it (tolerance 5 cm)`);
        }
      }

      // G22: a column stands inside its building's footprint, or under its roof overhang.
      const building = entities.get(group.building);
      const outline = building && entityPrefix(group.building) === "BLD" ? buildingOutline(building.data) : null;
      if (outline) {
        const wing = data.wing_ref ? entities.get(data.wing_ref) : null;
        const overhangCm = wing?.data?.roof_overhang_cm;
        const margin = (typeof overhangCm === "number" ? overhangCm / 100 : DEFAULT_OVERHANG_M) + LENGTH_TOLERANCE_M;
        if (!polygonCovers(outline, data.position, margin)) {
          warn("G22", column.id, `Foot stands outside ${group.building}'s footprint by more than ${margin.toFixed(2)} m (roof overhang + 1 cm)`);
        }
      }
    }

    for (const beam of group.beams) {
      if (unmeasurable.has(beam.id)) continue;
      const data = beam.data;
      if (!data.start || !data.end) continue;
      const lengthM = distance2d(data.start, data.end);

      // G25: a beam has a length.
      if (lengthM < LENGTH_TOLERANCE_M) {
        fail("G25", beam.id, `Beam start and end are ${(lengthM * 100).toFixed(1)} cm apart (tolerance 1 cm)`);
        continue;
      }
      const depthM = data.depth_cm / 100;
      const topAt = (t) => data.top_elevation_start_m + t * (data.top_elevation_end_m - data.top_elevation_start_m);

      // G23: each column a beam rests on stands under its line with its top at the beam's
      // underside; each wall it rests on carries it at an end, along it or where the beam
      // crosses it, with the wall's top at the underside there.
      for (const ref of data.rests_on_column_refs ?? []) {
        const column = entities.get(ref);
        if (!column || entityPrefix(ref) !== "COL" || unmeasurable.has(ref)) continue;
        const columnData = column.data;
        if (!columnData.position || columnData.height_m == null) continue;
        const { t, distance } = projectOnSegment(columnData.position, data.start, data.end);
        const columnHalf = Math.max(columnData.width_cm ?? 0, columnData.depth_cm ?? 0) / 200;
        const reach = data.width_cm / 200 + columnHalf + LENGTH_TOLERANCE_M;
        if (distance > reach) {
          warn("G23", beam.id, `${ref} stands ${distance.toFixed(2)} m off the beam's line (reach ${reach.toFixed(2)} m)`);
          continue;
        }
        const underside = topAt(t) - depthM;
        const columnTop = (columnData.base_elevation_m ?? 0) + columnData.height_m;
        if (Math.abs(underside - columnTop) > HEIGHT_TOLERANCE_M) {
          warn("G23", beam.id, `Underside ${underside.toFixed(3)} m is ${Math.abs(underside - columnTop).toFixed(3)} m from the top of ${ref} (${columnTop.toFixed(3)} m) (tolerance 5 cm)`);
        }
      }
      for (const ref of data.rests_on_wall_segment_refs ?? []) {
        const wall = entities.get(ref);
        if (!wall || entityPrefix(ref) !== "WSG" || unmeasurable.has(ref) || !wallGeometryUsable(wall.data)) continue;
        const wallData = wall.data;
        const reach = (wallData.thickness_cm ?? 0) / 200 + LENGTH_TOLERANCE_M;
        const bearings = [];
        for (const end of [0, 1]) {
          const point = end === 0 ? data.start : data.end;
          const projection = projectOnSegment(point, wallData.start, wallData.end);
          if (projection.distance <= reach) bearings.push({ beamT: end, wallT: projection.t });
        }
        if (bearings.length === 0) {
          const crossing = segmentCrossing(data.start, data.end, wallData.start, wallData.end);
          if (crossing != null) {
            bearings.push({ beamT: crossing, wallT: projectOnSegment(pointAlong(data.start, data.end, crossing), wallData.start, wallData.end).t });
          }
        }
        if (bearings.length === 0) {
          warn("G23", beam.id, `No part of the beam lies on ${ref}`);
          continue;
        }
        for (const bearing of bearings) {
          const wallTop = wallTopAt(wallData, bearing.wallT);
          if (wallTop == null) continue;
          const underside = topAt(bearing.beamT) - depthM;
          if (Math.abs(underside - wallTop) > HEIGHT_TOLERANCE_M) {
            warn("G23", beam.id, `Underside ${underside.toFixed(3)} m is ${Math.abs(underside - wallTop).toFixed(3)} m from the top of ${ref} (${wallTop.toFixed(3)} m) (tolerance 5 cm)`);
          }
        }
      }

      // G24: a beam's top meets each roof plane it says it carries, where it lies under it.
      for (const ref of data.supports_roof_plane_refs ?? []) {
        const roof = entities.get(ref);
        if (!roof || entityPrefix(ref) !== "RFP") continue;
        const vertices = roof.data.vertices_3d;
        if (!Array.isArray(vertices) || vertices.length < 3) continue;
        const target = [{ id: ref, data: roof.data }];
        let covered = 0;
        let worst = 0;
        for (const t of sampleParameters([0.5], roofEdgeCrossings(data.start, data.end, target), lengthM)) {
          const over = roofsOver(target, pointAlong(data.start, data.end, t));
          if (over.length === 0) continue;
          covered++;
          worst = Math.max(worst, Math.abs(over[0].elevation - topAt(t)));
        }
        if (covered === 0) {
          warn("G24", beam.id, `No point of the beam lies under ${ref}`);
        } else if (worst > HEIGHT_TOLERANCE_M) {
          warn("G24", beam.id, `Top is up to ${worst.toFixed(3)} m from ${ref} (tolerance 5 cm)`);
        }
      }
    }
  }

  issues.push(...validateWallJoints(entities, unmeasurable));

  return issues;
}

// ═══════════════════════════════════════════════════════════════════════════════
// G27-G29: stated wall corner joints (start_joint / end_joint), checked per floor
// or construction level using the same 2 cm meeting tolerance and 0.1 collinear
// sine threshold as the shared wall-joint resolution.
// ═══════════════════════════════════════════════════════════════════════════════

const WALL_JOINT_TOLERANCE_M = 0.02;
const WALL_JOINT_COLLINEAR_SINE = 0.1;
const WALL_JOINT_ZERO_LENGTH_EPS = 1e-9;

function parseWallJoint(value) {
  if (value === "through") {
    return "through";
  }
  if (value === "abuts") {
    return "abuts";
  }
  if (value === "mitre") {
    return "mitre";
  }
  return null;
}

function dot2d(first, second) {
  return first.x * second.x + first.y * second.y;
}

function cross2d(first, second) {
  return first.x * second.y - first.y * second.x;
}

function prepareJointWalls(walls) {
  const prepared = [];
  for (let index = 0; index < walls.length; index += 1) {
    const wall = walls[index];
    const deltaX = wall.data.end.x - wall.data.start.x;
    const deltaY = wall.data.end.y - wall.data.start.y;
    const length = Math.hypot(deltaX, deltaY);
    if (length < WALL_JOINT_ZERO_LENGTH_EPS) {
      continue;
    }
    const unitDirection = { x: deltaX / length, y: deltaY / length };
    prepared.push({
      index,
      id: wall.id,
      start: wall.data.start,
      end: wall.data.end,
      length,
      unitDirection,
      startJoint: parseWallJoint(wall.data.start_joint),
      endJoint: parseWallJoint(wall.data.end_joint),
    });
  }
  return prepared;
}

function collectWallEndClusters(preparedWalls, tolerance) {
  const allEnds = [];
  for (const wall of preparedWalls) {
    allEnds.push({
      wall,
      endKind: "start",
      point: wall.start,
      outward: wall.unitDirection,
      statedJoint: wall.startJoint,
    });
    allEnds.push({
      wall,
      endKind: "end",
      point: wall.end,
      outward: { x: -wall.unitDirection.x, y: -wall.unitDirection.y },
      statedJoint: wall.endJoint,
    });
  }

  const visited = new Array(allEnds.length).fill(false);
  const clusters = [];

  for (let startIndex = 0; startIndex < allEnds.length; startIndex += 1) {
    if (visited[startIndex]) {
      continue;
    }
    const queue = [startIndex];
    visited[startIndex] = true;
    const cluster = [];

    while (queue.length > 0) {
      const currentIndex = queue.shift();
      const currentEnd = allEnds[currentIndex];
      cluster.push(currentEnd);

      for (let candidateIndex = 0; candidateIndex < allEnds.length; candidateIndex += 1) {
        if (visited[candidateIndex]) {
          continue;
        }
        const candidateEnd = allEnds[candidateIndex];
        if (candidateEnd.wall.index === currentEnd.wall.index) {
          continue;
        }
        if (distance2d(currentEnd.point, candidateEnd.point) <= tolerance) {
          visited[candidateIndex] = true;
          queue.push(candidateIndex);
        }
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}

function jointClusterCentroid(ends) {
  let sumX = 0;
  let sumY = 0;
  for (const endRef of ends) {
    sumX += endRef.point.x;
    sumY += endRef.point.y;
  }
  return { x: sumX / ends.length, y: sumY / ends.length };
}

function findJointPassingWalls(junctionPoint, clusterWallIndices, preparedWalls, tolerance) {
  const passing = [];
  for (const wall of preparedWalls) {
    if (clusterWallIndices.has(wall.index)) {
      continue;
    }
    const offset = {
      x: junctionPoint.x - wall.start.x,
      y: junctionPoint.y - wall.start.y,
    };
    const projection = dot2d(offset, wall.unitDirection);
    if (projection <= 0) {
      continue;
    }
    if (projection >= wall.length) {
      continue;
    }
    const closestPoint = {
      x: wall.start.x + wall.unitDirection.x * projection,
      y: wall.start.y + wall.unitDirection.y * projection,
    };
    if (distance2d(junctionPoint, closestPoint) <= tolerance) {
      passing.push({ wall, closestPoint });
    }
  }
  return passing;
}

function buildWallJointRuns(clusterEnds, passingWalls, collinearSine) {
  const runs = [];
  for (const entry of passingWalls) {
    runs.push({
      isPassing: true,
      passingWall: entry.wall,
      ends: [],
    });
  }

  const assigned = new Array(clusterEnds.length).fill(false);
  for (let firstIndex = 0; firstIndex < clusterEnds.length; firstIndex += 1) {
    if (assigned[firstIndex]) {
      continue;
    }
    assigned[firstIndex] = true;
    const group = [clusterEnds[firstIndex]];
    const seedOutward = clusterEnds[firstIndex].outward;

    for (let otherIndex = firstIndex + 1; otherIndex < clusterEnds.length; otherIndex += 1) {
      if (assigned[otherIndex]) {
        continue;
      }
      const candidate = clusterEnds[otherIndex];
      const sine = Math.abs(cross2d(seedOutward, candidate.outward));
      if (sine < collinearSine) {
        assigned[otherIndex] = true;
        group.push(candidate);
      }
    }

    runs.push({
      isPassing: false,
      passingWall: null,
      ends: group,
    });
  }

  return runs;
}

function wallGroupKey(entity) {
  if (typeof entity.data.floor_ref === "string") {
    return `floor:${entity.data.floor_ref}`;
  }
  if (entity.document?.floor_ref) {
    return `floor:${entity.document.floor_ref}`;
  }
  const docKey = entity.document?.building_ref ?? entity.file ?? "default";
  const elevationCm = Math.round((entity.data.base_elevation_m ?? 0) * 100);
  return `doc:${docKey}|elev:${elevationCm}`;
}

function validateWallJoints(entities, unmeasurable) {
  const issues = [];
  const warn = (rule, entity, message) => {
    issues.push({ severity: "warning", rule, entity, message });
  };

  const wallsByGroup = new Map();
  for (const [id, entity] of entities) {
    if (entityPrefix(id) !== "WSG") {
      continue;
    }
    if (unmeasurable.has(id)) {
      continue;
    }
    if (!wallGeometryUsable(entity.data)) {
      continue;
    }
    const key = wallGroupKey(entity);
    if (!wallsByGroup.has(key)) {
      wallsByGroup.set(key, []);
    }
    wallsByGroup.get(key).push({ id, data: entity.data });
  }

  for (const groupWalls of wallsByGroup.values()) {
    const preparedWalls = prepareJointWalls(groupWalls);
    const clusters = collectWallEndClusters(preparedWalls, WALL_JOINT_TOLERANCE_M);

    for (const clusterEnds of clusters) {
      const junctionPoint = jointClusterCentroid(clusterEnds);
      const clusterWallIndices = new Set(clusterEnds.map((endRef) => endRef.wall.index));
      const passingWalls = findJointPassingWalls(
        junctionPoint,
        clusterWallIndices,
        preparedWalls,
        WALL_JOINT_TOLERANCE_M,
      );
      const pointLabel = `(${junctionPoint.x.toFixed(2)}, ${junctionPoint.y.toFixed(2)})`;

      // G29 (wall-joint-free-end): stated joint at an end with no partner within 2 cm.
      if (clusterEnds.length === 1 && passingWalls.length === 0) {
        const solo = clusterEnds[0];
        if (solo.statedJoint !== null) {
          warn(
            "G29",
            solo.wall.id,
            `${solo.endKind}_joint "${solo.statedJoint}" stated at free end ${pointLabel} with no partner wall within 2 cm`,
          );
        }
        continue;
      }

      const statedEnds = clusterEnds.filter((endRef) => endRef.statedJoint !== null);
      if (statedEnds.length === 0) {
        continue;
      }

      const runs = buildWallJointRuns(clusterEnds, passingWalls, WALL_JOINT_COLLINEAR_SINE);
      const mitreEnds = statedEnds.filter((endRef) => endRef.statedJoint === "mitre");

      // G28 (wall-joint-mitre-shape): mitre stated where a mitre has no line.
      if (mitreEnds.length > 0) {
        let mitreProblem = null;
        if (passingWalls.length > 0) {
          const passingIds = passingWalls.map((entry) => entry.wall.id).join(", ");
          mitreProblem = `${passingIds} passes through the point`;
        } else if (runs.length === 1) {
          mitreProblem = "the walls continue each other in a straight line";
        } else if (runs.length > 2 || runs[0].ends.length !== 1 || runs[1].ends.length !== 1) {
          mitreProblem = `${clusterEnds.length} walls meet at the point`;
        } else {
          const nonMitre = statedEnds.filter((endRef) => endRef.statedJoint !== "mitre");
          if (nonMitre.length > 0) {
            mitreProblem = `partner ${nonMitre[0].wall.id} states "${nonMitre[0].statedJoint}"`;
          }
        }

        if (mitreProblem !== null) {
          for (const endRef of mitreEnds) {
            warn(
              "G28",
              endRef.wall.id,
              `${endRef.endKind}_joint "mitre" has no mitre line at ${pointLabel}: ${mitreProblem}`,
            );
          }
        }
        continue;
      }

      // G27 (wall-joint-conflict): stated through/abuts joints contradict at this point.
      const passingRuns = [];
      const statedThroughRuns = [];
      const contradictingRuns = [];
      const unstatedRuns = [];

      for (const run of runs) {
        if (run.isPassing) {
          passingRuns.push(run);
          continue;
        }
        const hasThrough = run.ends.some((endRef) => endRef.statedJoint === "through");
        const hasAbuts = run.ends.some((endRef) => endRef.statedJoint === "abuts");
        if (hasThrough && hasAbuts) {
          contradictingRuns.push(run);
        } else if (hasThrough) {
          statedThroughRuns.push(run);
        } else if (!hasAbuts) {
          unstatedRuns.push(run);
        }
      }

      if (contradictingRuns.length > 0) {
        for (const run of contradictingRuns) {
          for (const endRef of run.ends) {
            if (endRef.statedJoint !== null) {
              warn(
                "G27",
                endRef.wall.id,
                `${endRef.endKind}_joint "${endRef.statedJoint}" contradicts collinear continuation at ${pointLabel}`,
              );
            }
          }
        }
      }

      if (statedThroughRuns.length >= 1 && passingRuns.length >= 1) {
        const passingIds = passingRuns.map((run) => run.passingWall.id).join(", ");
        for (const run of statedThroughRuns) {
          for (const endRef of run.ends) {
            if (endRef.statedJoint === "through") {
              warn(
                "G27",
                endRef.wall.id,
                `${endRef.endKind}_joint "through" conflicts with wall ${passingIds} passing through ${pointLabel}`,
              );
            }
          }
        }
      } else if (statedThroughRuns.length > 1) {
        for (const run of statedThroughRuns) {
          const otherThroughIds = statedThroughRuns
            .filter((candidate) => candidate !== run)
            .flatMap((candidate) =>
              candidate.ends
                .filter((endRef) => endRef.statedJoint === "through")
                .map((endRef) => endRef.wall.id),
            );
          for (const endRef of run.ends) {
            if (endRef.statedJoint === "through") {
              warn(
                "G27",
                endRef.wall.id,
                `${endRef.endKind}_joint "through" conflicts with ${otherThroughIds.join(", ")} also stating "through" at ${pointLabel}`,
              );
            }
          }
        }
      } else if (
        contradictingRuns.length === 0
        && statedThroughRuns.length === 0
        && passingRuns.length === 0
        && unstatedRuns.length === 0
      ) {
        for (const endRef of statedEnds) {
          warn(
            "G27",
            endRef.wall.id,
            `${endRef.endKind}_joint "abuts" leaves no wall running through ${pointLabel}`,
          );
        }
      }
    }
  }

  return issues;
}
