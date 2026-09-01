// @ts-check
/**
 * What grows where.
 *
 * Specimens and plantings both sit in an outdoor zone and both follow a care profile, but
 * they are different things: a specimen is one tree with a measured height and a condition,
 * a planting is a count of something with a spacing. A document that merges them loses the
 * distinction the schema draws; one that lists them separately per zone keeps it.
 */

import { indexModel, ofType, followField } from "./model-index.mjs";

/**
 * Vegetation and soil, grouped by the outdoor zone they belong to.
 *
 * Zones with nothing in them are included: an empty zone is a fact about the property, and a
 * garden document that lists only the planted zones cannot be checked against the ground.
 *
 * @param {import("./model-index.mjs").RealmModel | import("./model-index.mjs").RealmIndex} source
 */
export function vegetationByZone(source) {
  const index = "byId" in source ? source : indexModel(source);

  const zones = ofType(index, "outdoor_zone").map((zone) => ({
    zone,
    parcel: followField(index, zone.id, "parcel_ref")[0],
    /** @type {import("./model-index.mjs").RealmEntity[]} */
    specimens: [],
    /** @type {import("./model-index.mjs").RealmEntity[]} */
    plantings: [],
    /** @type {import("./model-index.mjs").RealmEntity[]} */
    soils: [],
  }));
  const byZoneId = new Map(zones.map((entry) => [entry.zone.id, entry]));

  for (const specimen of ofType(index, "specimen")) {
    for (const zone of followField(index, specimen.id, "outdoor_zone_ref")) {
      byZoneId.get(zone.id)?.specimens.push(specimen);
    }
  }
  for (const planting of ofType(index, "planting")) {
    for (const zone of followField(index, planting.id, "outdoor_zone_ref")) {
      byZoneId.get(zone.id)?.plantings.push(planting);
    }
  }
  // Soil points AT the zone it describes, the opposite direction from the two above, because
  // a soil profile is a statement about ground rather than a thing standing on it.
  for (const soil of ofType(index, "soil_profile")) {
    for (const zone of followField(index, soil.id, "outdoor_zone_ref")) {
      byZoneId.get(zone.id)?.soils.push(soil);
    }
  }

  return {
    index,
    zones,
    /** Vegetation naming no zone at all. Absent from every zone section, so named here. */
    unplaced: [
      ...ofType(index, "specimen"),
      ...ofType(index, "planting"),
    ].filter((entity) => followField(index, entity.id, "outdoor_zone_ref").length === 0),
  };
}

/**
 * How a specimen's size reads: height with its measurement date, when both are stated.
 * @param {Record<string, any>} data
 */
export function specimenSize(data) {
  const parts = [];
  if (typeof data?.height_m === "number") parts.push(`${data.height_m} m`);
  if (typeof data?.canopy_radius_m === "number") parts.push(`canopy r ${data.canopy_radius_m} m`);
  if (typeof data?.trunk_diameter_cm === "number") parts.push(`trunk ${data.trunk_diameter_cm} cm`);
  return parts.join(", ");
}

/**
 * How a planting's size reads: a count and the height range it currently occupies.
 * @param {Record<string, any>} data
 */
export function plantingSize(data) {
  const parts = [];
  if (typeof data?.count === "number") parts.push(`${data.count}`);
  const low = data?.current_height_min_cm;
  const high = data?.current_height_max_cm;
  if (typeof low === "number" && typeof high === "number") parts.push(`${low}-${high} cm`);
  else if (typeof low === "number") parts.push(`from ${low} cm`);
  if (typeof data?.spacing_cm === "number") parts.push(`spaced ${data.spacing_cm} cm`);
  return parts.join(", ");
}
