// @ts-check
/**
 * The garden care document.
 *
 * Section for section from `viewers/realm/garden-care`, the other PDF generator this schema
 * has had since March: a description part (zones, what grows in them, the soil) and a
 * twelve-month calendar. It prints separately from the property document because a gardener
 * is a different reader from an owner, and the ancestor made that split for the same reason.
 */

import {
  indexModel,
  ofType,
  nameOf,
  followField,
  careCalendar,
  unscheduledThreats,
  subjectsOfProfile,
  vegetationByZone,
  specimenSize,
  plantingSize,
  table,
  section,
  sections,
  prose,
  blockquote,
  provenanceLine,
  documentTitle,
  modelIdentity,
} from "../render-kit/index.mjs";

/**
 * @param {import("../render-kit/model-index.mjs").RealmModel} model
 * @param {{title?: string}} [options]
 * @returns {string}
 */
export function renderGardenCare(model, options = {}) {
  const index = indexModel(model);
  const identity = modelIdentity(model);
  const profiles = ofType(index, "species_care_profile");
  const specimens = ofType(index, "specimen");
  const plantings = ofType(index, "planting");
  const soils = ofType(index, "soil_profile");

  const counts = [
    `${specimens.length} specimens`,
    `${plantings.length} plantings`,
    `${profiles.length} care profiles`,
    `${soils.length} soil profiles`,
  ].join(", ");

  return sections([
    `# ${documentTitle(model, options.title, "Garden care")}${options.title ? "" : " - garden care"}`,
    blockquote(`${provenanceLine(model)} ${counts}.`),
    identity.address ? `**${identity.address}**` : "",
    zonesSection(index),
    vegetationSection(index),
    soilSection(index),
    calendarSection(model, index),
    biomassSection(index),
  ]);
}

/** Where the growing happens, per parcel. */
function zonesSection(index) {
  const { zones } = vegetationByZone(index);
  if (zones.length === 0) return "";

  const byParcel = new Map();
  for (const entry of zones) {
    const key = entry.parcel?.id ?? "(no parcel)";
    const list = byParcel.get(key);
    if (list) list.push(entry);
    else byParcel.set(key, [entry]);
  }

  return section(
    2,
    "Zones",
    ...[...byParcel.entries()]
      .sort((left, right) => left[0].localeCompare(right[0]))
      .map(([parcelId, entries]) =>
        section(
          3,
          entries[0].parcel ? nameOf(index, parcelId) : "Zones naming no parcel",
          table(
            ["Zone", "Name", "Type", "Area", "Sun", "Slope", "Soil", "Growing"],
            entries.map((entry) => [
              entry.zone.id,
              entry.zone.name,
              entry.zone.data?.zone_type,
              typeof entry.zone.data?.area_sqm === "number" ? `${entry.zone.data.area_sqm} m2` : "",
              entry.zone.data?.sun_exposure,
              typeof entry.zone.data?.slope_percent === "number"
                ? `${entry.zone.data.slope_percent}% ${entry.zone.data.slope_direction ?? ""}`.trim()
                : "",
              entry.soils.map((soil) => soil.id),
              entry.specimens.length + entry.plantings.length === 0
                ? "nothing recorded"
                : [
                    entry.specimens.length ? `${entry.specimens.length} specimens` : "",
                    entry.plantings.length ? `${entry.plantings.length} plantings` : "",
                  ]
                    .filter(Boolean)
                    .join(", "),
            ]),
          ),
        ),
      ),
  );
}

/** What is planted, kept as two tables because the schema keeps them as two things. */
function vegetationSection(index) {
  const { unplaced } = vegetationByZone(index);
  const specimens = ofType(index, "specimen");
  const plantings = ofType(index, "planting");
  if (specimens.length === 0 && plantings.length === 0) return "";

  return section(
    2,
    "Plantings and specimens",
    specimens.length
      ? section(
          3,
          `Specimens (${specimens.length})`,
          table(
            ["Specimen", "Name", "Species", "Zone", "Size", "Condition", "Protected", "Care profile"],
            specimens.map((specimen) => [
              specimen.id,
              specimen.name ?? specimen.data?.common_name,
              specimen.data?.species,
              nameOf(index, followField(index, specimen.id, "outdoor_zone_ref")[0]?.id),
              specimenSize(specimen.data),
              specimen.data?.condition,
              specimen.data?.is_protected === true ? "yes" : "",
              nameOf(index, followField(index, specimen.id, "care_profile_ref")[0]?.id),
            ]),
          ),
        )
      : "",
    plantings.length
      ? section(
          3,
          `Plantings (${plantings.length})`,
          table(
            ["Planting", "Name", "Species", "Zone", "Size", "Sun", "Water", "Care profile"],
            plantings.map((planting) => [
              planting.id,
              planting.name ?? planting.data?.common_name,
              planting.data?.species,
              nameOf(index, followField(index, planting.id, "outdoor_zone_ref")[0]?.id),
              plantingSize(planting.data),
              planting.data?.sun_requirement,
              planting.data?.water_requirement,
              nameOf(index, followField(index, planting.id, "care_profile_ref")[0]?.id),
            ]),
          ),
        )
      : "",
    unplaced.length
      ? `${unplaced.length} planted entity(ies) name no zone: ${unplaced.map((entity) => entity.id).join(", ")}.`
      : "",
  );
}

/** The ground itself. */
function soilSection(index) {
  const soils = ofType(index, "soil_profile");
  if (soils.length === 0) return "";

  return section(
    2,
    "Soil",
    table(
      ["Profile", "Name", "Zone", "Type", "pH", "Measured", "Organic matter", "Drainage"],
      soils.map((soil) => [
        soil.id,
        soil.name,
        nameOf(index, followField(index, soil.id, "outdoor_zone_ref")[0]?.id),
        soil.data?.soil_type,
        soil.data?.ph_level,
        soil.data?.ph_measured_date,
        typeof soil.data?.organic_matter_percent === "number"
          ? `${soil.data.organic_matter_percent}%`
          : "",
        soil.data?.drainage,
      ]),
    ),
    ...soils
      .filter((soil) => Array.isArray(soil.data?.amendments) && soil.data.amendments.length > 0)
      .map((soil) =>
        section(
          3,
          `Amendments for ${nameOf(index, soil.id)}`,
          table(
            ["Amendment", "Type", "Purpose", "Months", "Dosage", "Frequency"],
            soil.data.amendments.map((amendment) => [
              amendment?.name,
              amendment?.amendment_type,
              prose(amendment?.purpose),
              Array.isArray(amendment?.application_months) ? amendment.application_months : "",
              amendment?.dosage,
              prose(amendment?.frequency_description),
            ]),
          ),
        ),
      ),
  );
}

/** Twelve months, each collating everything the model schedules for it. */
function calendarSection(model, index) {
  const calendar = careCalendar(index);
  const unscheduled = unscheduledThreats(index);
  if (calendar.profiles.length === 0 && calendar.soils.length === 0) return "";

  const months = calendar.months.map((month) => {
    if (!month.hasContent) {
      return section(3, month.name, "Nothing scheduled.");
    }
    return section(
      3,
      month.name,
      table(
        ["Species", "Activity", "What", "Applies to"],
        month.activities.map(({ profile, activity }) => [
          profile.data?.common_name ?? profile.name ?? profile.id,
          activity?.activity_type,
          prose(activity?.description),
          subjectsOfProfile(index, profile.id)
            .map((subject) => subject.id)
            .join(", "),
        ]),
      ),
      month.notes.length
        ? month.notes.map(({ profile, note }) => `**${profile.data?.common_name ?? profile.id}**: ${prose(note)}`).join("\n\n")
        : "",
      table(
        ["Soil", "Amendment", "Dosage", "Purpose"],
        month.amendments.map(({ soil, amendment }) => [
          nameOf(index, soil.id),
          amendment?.name,
          amendment?.dosage,
          prose(amendment?.purpose),
        ]),
      ),
      table(
        ["At risk", "Threat", "Type", "Prevention"],
        month.threats.map(({ profile, threat }) => [
          profile.data?.common_name ?? profile.id,
          threat?.name,
          threat?.threat_type,
          prose(threat?.prevention_method),
        ]),
      ),
    );
  });

  return section(
    2,
    "Care calendar",
    ...months,
    unscheduled.length
      ? section(
          3,
          "Threats with no months recorded",
          "These are known to the model but state no `risk_months`, so no month above claims them.",
          table(
            ["Species", "Threat", "Type", "Prevention"],
            unscheduled.map(({ profile, threat }) => [
              profile.data?.common_name ?? profile.id,
              threat?.name,
              threat?.threat_type,
              prose(threat?.prevention_method),
            ]),
          ),
        )
      : "",
  );
}

/** Where cut material goes. */
function biomassSection(index) {
  const flows = ofType(index, "biomass_flow");
  if (flows.length === 0) return "";

  return section(
    2,
    "Biomass",
    table(
      ["Flow", "Name", "Source", "Process", "Output", "From", "Processed at", "To", "Annual volume", "Season"],
      flows.map((flow) => [
        flow.id,
        flow.name,
        flow.data?.source_type,
        flow.data?.process,
        flow.data?.output_type,
        nameOf(index, followField(index, flow.id, "source_ref")[0]?.id),
        nameOf(index, followField(index, flow.id, "processing_location_ref")[0]?.id),
        nameOf(index, followField(index, flow.id, "destination_ref")[0]?.id),
        typeof flow.data?.estimated_annual_volume === "number"
          ? `${flow.data.estimated_annual_volume} ${flow.data.volume_unit ?? ""}`.trim()
          : "",
        flow.data?.seasonal_availability,
      ]),
    ),
  );
}
