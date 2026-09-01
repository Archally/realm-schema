// ═══════════════════════════════════════════════════════════════════════════════
// Layer 3: Geometric Invariants (G01-G17)
// Physical plausibility checks for spatial data.
// ═══════════════════════════════════════════════════════════════════════════════

import { distance2d, polygonArea, coplanarityError, polygonsOverlapArea, entityPrefix } from "./helpers.mjs";

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

  return { issues };
}
