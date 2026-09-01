// ═══════════════════════════════════════════════════════════════════════════════
// Layer 5: Semantic/Logical Rules (S01-S10)
// Domain-specific consistency checks.
// ═══════════════════════════════════════════════════════════════════════════════

import { entityPrefix } from "./helpers.mjs";
import { checkEstateChangeRules } from "./estate-change-rules.mjs";

export function validateSemantic(entities, config) {
  const issues = [];

  for (const [id, { data }] of entities) {
    const prefix = entityPrefix(id);

    // ── WNG (Wing) ──
    if (prefix === "WNG") {
      // S01: Non-flat roof → pitch > 0
      if (data.roof_type && data.roof_type !== "flat" && (data.roof_pitch_degrees == null || data.roof_pitch_degrees <= 0)) {
        issues.push({ severity: "warning", rule: "S01", entity: id, message: `roof_type="${data.roof_type}" but roof_pitch_degrees is ${data.roof_pitch_degrees ?? "missing"}` });
      }
      // S02: Gable/hip/gambrel/mansard → ridge_direction required
      if (["gable", "hip", "gambrel", "mansard"].includes(data.roof_type) && !data.ridge_direction) {
        issues.push({ severity: "warning", rule: "S02", entity: id, message: `roof_type="${data.roof_type}" but ridge_direction is missing` });
      }
    }

    // ── RM (Room) openings ──
    if (prefix === "RM" && data.openings) {
      for (let i = 0; i < data.openings.length; i++) {
        const opening = data.openings[i];
        // S03: head_height ≈ sill + height (within tolerance)
        if (opening.head_height_cm != null && opening.sill_height_cm != null && opening.height_cm != null) {
          const expected = opening.sill_height_cm + opening.height_cm;
          const tolerance = config.head_height_tolerance_cm ?? 5;
          if (Math.abs(opening.head_height_cm - expected) > tolerance) {
            issues.push({ severity: "warning", rule: "S03", entity: id, message: `Opening[${i}]: head_height_cm (${opening.head_height_cm}) ≠ sill (${opening.sill_height_cm}) + height (${opening.height_cm}) = ${expected} (±${tolerance}cm)` });
          }
        }
      }
    }

    // ── BLD (Building) ──
    if (prefix === "BLD") {
      // S05: Building with ground_elevation → floors should have base_elevation
      //
      // Only buildings that HAVE floors are in scope. A building with no floors
      // at all was previously reported as "no floors have base_elevation_m",
      // which describes a gap that does not exist: the cewice gazebo has no
      // storey of its own, it is an open shelter bolted to a patio. Reading that
      // message as written leads to inventing a floor entity to satisfy it, and
      // the invented floor then trips C07 for having no slab. Whether every
      // building ought to have a floor is a different question from whether a
      // building and its floors agree about elevation, which is what S05 asks.
      if (data.ground_elevation_m != null) {
        let floorCount = 0;
        let hasFloorWithElevation = false;
        for (const [floorId, floor] of entities) {
          if (!floorId.startsWith("FLR") || floor.data.building_ref !== id) continue;
          floorCount++;
          if (floor.data.base_elevation_m != null) {
            hasFloorWithElevation = true;
            break;
          }
        }
        if (floorCount > 0 && !hasFloorWithElevation) {
          issues.push({ severity: "warning", rule: "S05", entity: id, message: `Building has ${floorCount} floor(s) but none carries base_elevation_m` });
        }
      }

      // S08: Building with wings must NOT have roof_type/roof_pitch_degrees
      if (data.wing_refs?.length > 0 && (data.roof_type || data.roof_pitch_degrees != null)) {
        issues.push({ severity: "error", rule: "S08", entity: id, message: "Building has wings but also has roof_type/roof_pitch_degrees (roof belongs on wings)" });
      }

      // S09: eave_height ≈ max(wing.eave_height)
      if (data.eave_height_m != null && data.wing_refs?.length > 0) {
        let maxWingEave = 0;
        for (const wingRef of data.wing_refs) {
          const wing = entities.get(wingRef);
          if (wing?.data?.eave_height_m != null) maxWingEave = Math.max(maxWingEave, wing.data.eave_height_m);
        }
        if (maxWingEave > 0 && Math.abs(data.eave_height_m - maxWingEave) > 0.1) {
          issues.push({ severity: "warning", rule: "S09", entity: id, message: `eave_height_m (${data.eave_height_m}) ≠ max wing eave (${maxWingEave})` });
        }
      }

      // S10: ridge_height ≈ max(wing.ridge_height)
      if (data.ridge_height_m != null && data.wing_refs?.length > 0) {
        let maxWingRidge = 0;
        for (const wingRef of data.wing_refs) {
          const wing = entities.get(wingRef);
          if (wing?.data?.ridge_height_m != null) maxWingRidge = Math.max(maxWingRidge, wing.data.ridge_height_m);
        }
        if (maxWingRidge > 0 && Math.abs(data.ridge_height_m - maxWingRidge) > 0.1) {
          issues.push({ severity: "warning", rule: "S10", entity: id, message: `ridge_height_m (${data.ridge_height_m}) ≠ max wing ridge (${maxWingRidge})` });
        }
      }
    }

    // ── NP (Neighbor Property) ──
    if (prefix === "NP") {
      // S06: PV panels → roof side specified
      if (data.has_pv_panels === true && !data.pv_panel_roof_side) {
        issues.push({ severity: "warning", rule: "S06", entity: id, message: "has_pv_panels is true but pv_panel_roof_side is missing" });
      }
    }

    // ── SPM (Specimen) ──
    if (prefix === "SPM") {
      // S07: Canopy shape consistency with specimen type
      if (data.canopy_shape && data.specimen_type) {
        if (data.canopy_shape === "cone" && !["tree-evergreen", "tree-deciduous", "tree-fruit"].includes(data.specimen_type)) {
          issues.push({ severity: "info", rule: "S07", entity: id, message: `canopy_shape "cone" unusual for specimen_type "${data.specimen_type}"` });
        }
        if (data.canopy_shape === "weeping" && data.specimen_type !== "tree-deciduous") {
          issues.push({ severity: "info", rule: "S07", entity: id, message: `canopy_shape "weeping" unusual for specimen_type "${data.specimen_type}"` });
        }
      }
    }
  }

  // Estate-change rules (R-A..R-F, plus the family-cycle check) come from realm-core,
  // so this shim, the MCP server and `rl check` all report the same findings rather
  // than three drifting copies of the same intent.
  issues.push(...checkEstateChangeRules(entities));

  return { issues };
}
