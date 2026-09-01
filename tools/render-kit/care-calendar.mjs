// @ts-check
/**
 * The twelve-month care calendar.
 *
 * A species care profile states what its species needs in which month; a soil profile states
 * when each amendment goes on; a threat states the months it is a risk. Three independent
 * per-month vocabularies, and a gardener wants them collated by month rather than by entity.
 * That inversion is the whole of this file.
 */

import { indexModel, ofType, incomingOfType } from "./model-index.mjs";

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Which months a value claims.
 *
 * Accepts an array of numbers because that is what the schema declares, and filters to 1-12
 * because a month outside that range is a typo the calendar must not silently place.
 *
 * @param {unknown} value
 * @returns {number[]}
 */
function monthsOf(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((month) => typeof month === "number" && month >= 1 && month <= 12);
}

/**
 * What follows a care profile: the specimens and plantings it governs.
 *
 * Maintenance tasks also carry `care_profile_ref` and are deliberately excluded - they belong
 * to the property document's schedule, and listing them here would make the same task appear
 * in two documents as two different obligations.
 *
 * @param {import("./model-index.mjs").RealmIndex} index
 * @param {string} profileId
 */
export function subjectsOfProfile(index, profileId) {
  return incomingOfType(index, profileId, "follows-protocol").filter(
    (entity) => entity.type === "specimen" || entity.type === "planting",
  );
}

/**
 * Collate everything the model says about each of the twelve months.
 *
 * Always returns twelve entries. A month with nothing in it is a fact about the model - the
 * ancestor printed all twelve for the same reason - and `hasContent` lets a renderer say so
 * in one line rather than skipping the heading and leaving the reader to count.
 *
 * @param {import("./model-index.mjs").RealmModel | import("./model-index.mjs").RealmIndex} source
 */
export function careCalendar(source) {
  const index = "byId" in source ? source : indexModel(source);
  const profiles = ofType(index, "species_care_profile");
  const soils = ofType(index, "soil_profile");

  const months = MONTH_NAMES.map((name, offset) => ({
    month: offset + 1,
    name,
    /** @type {{profile: any, activity: any}[]} */
    activities: [],
    /** @type {{profile: any, note: string}[]} */
    notes: [],
    /** @type {{profile: any, threat: any}[]} */
    threats: [],
    /** @type {{soil: any, amendment: any}[]} */
    amendments: [],
    hasContent: false,
  }));

  for (const profile of profiles) {
    for (const entry of Array.isArray(profile.data?.care_calendar) ? profile.data.care_calendar : []) {
      const month = months[Number(entry?.month) - 1];
      if (!month) continue;
      for (const activity of Array.isArray(entry.activities) ? entry.activities : []) {
        month.activities.push({ profile, activity });
      }
      if (typeof entry.notes === "string" && entry.notes.trim()) {
        month.notes.push({ profile, note: entry.notes });
      }
    }
    for (const threat of Array.isArray(profile.data?.known_threats) ? profile.data.known_threats : []) {
      // A threat with no `risk_months` is not placed in any month. It is still part of the
      // model and the vegetation section lists it; guessing a month for it would put an
      // instruction in front of a reader on a date nothing in the model supports.
      for (const month of monthsOf(threat?.risk_months)) {
        months[month - 1].threats.push({ profile, threat });
      }
    }
  }

  for (const soil of soils) {
    for (const amendment of Array.isArray(soil.data?.amendments) ? soil.data.amendments : []) {
      for (const month of monthsOf(amendment?.application_months)) {
        months[month - 1].amendments.push({ soil, amendment });
      }
    }
  }

  for (const month of months) {
    month.hasContent =
      month.activities.length + month.notes.length + month.threats.length + month.amendments.length > 0;
  }

  return { months, index, profiles, soils };
}

/**
 * Threats the model records without saying when they apply.
 *
 * Reported rather than hidden: an unscheduled threat is the difference between a calendar
 * that is complete and one that only looks complete.
 *
 * @param {import("./model-index.mjs").RealmModel | import("./model-index.mjs").RealmIndex} source
 */
export function unscheduledThreats(source) {
  const index = "byId" in source ? source : indexModel(source);
  const out = [];
  for (const profile of ofType(index, "species_care_profile")) {
    for (const threat of Array.isArray(profile.data?.known_threats) ? profile.data.known_threats : []) {
      if (monthsOf(threat?.risk_months).length === 0) out.push({ profile, threat });
    }
  }
  return out;
}
