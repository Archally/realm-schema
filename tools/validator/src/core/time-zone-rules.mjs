// @ts-check
// ═══════════════════════════════════════════════════════════════════════════════
// Time zone rules, read from the root document's `location` and `coordinate_system`.
//
//   time-zone-missing              the model states latitude and longitude, or a WGS84
//                                  origin, and `location.time_zone` is absent. WARNING.
//   time-zone-unknown              `location.time_zone` is well formed but the runtime's
//                                  time zone database (`Intl.DateTimeFormat`) does not know
//                                  it. WARNING.
//   time-zone-far-from-longitude   the zone's UTC offset on 15 January and on 15 July 2026
//                                  both differ from the longitude's solar time (longitude /
//                                  15 hours, wrapped to plus or minus 12 h) by more than
//                                  3.5 hours. WARNING.
//
// The schema checks a zone's syntax; whether a well-formed name exists depends on the time
// zone database in use, so it is a warning here rather than a schema error. Dependency-free.
// ═══════════════════════════════════════════════════════════════════════════════

/** Hours a zone may sit from the longitude's solar time before it is reported. */
export const LONGITUDE_MARGIN_HOURS = 3.5;

/** The two instants a zone's offset is read at: one in each half of the year. */
const OFFSET_INSTANTS = ["2026-01-15T12:00:00Z", "2026-07-15T12:00:00Z"];

/** Whether the runtime's time zone database knows a zone name. */
export function isKnownTimeZone(zone) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

/** A zone's UTC offset in hours at an instant. */
export function utcOffsetHours(zone, instant) {
  const part = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "longOffset" })
    .formatToParts(new Date(instant))
    .find((entry) => entry.type === "timeZoneName");
  const match = /GMT([+-])(\d{2}):(\d{2})/.exec(part?.value ?? "GMT");
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  return sign * (Number(match[2]) + Number(match[3]) / 60);
}

/** Hours wrapped into the range from -12 to +12. */
function wrapHours(hours) {
  return ((((hours + 12) % 24) + 24) % 24) - 12;
}

/** The longitude the model states: the location's, else the coordinate system's WGS84 origin. */
function statedLongitude(location, coordinateSystem) {
  if (typeof location.latitude === "number" && typeof location.longitude === "number") return location.longitude;
  const origin = coordinateSystem?.origin_wgs84;
  if (origin && typeof origin.latitude === "number" && typeof origin.longitude === "number") return origin.longitude;
  return null;
}

/**
 * @param {Record<string, any> | undefined} root the parsed `realm.yaml`
 * @returns {{severity: string, rule: string, file: string, message: string}[]}
 */
export function checkTimeZoneRules(root) {
  const findings = [];
  if (!root || typeof root !== "object") return findings;
  const add = (rule, message) => findings.push({ severity: "warning", rule, file: "realm.yaml", message });
  const location = root.location && typeof root.location === "object" ? root.location : {};
  const longitude = statedLongitude(location, root.coordinate_system);
  const zone = location.time_zone;

  if (typeof zone !== "string") {
    if (longitude != null) {
      add("time-zone-missing", "The model states coordinates but no location.time_zone, so a local hour at the property cannot be turned into an instant");
    }
    return findings;
  }
  if (!isKnownTimeZone(zone)) {
    add("time-zone-unknown", `location.time_zone "${zone}" is not a zone this runtime's time zone database knows`);
    return findings;
  }
  if (longitude == null) return findings;
  const solar = longitude / 15;
  const gap = Math.min(...OFFSET_INSTANTS.map((instant) => Math.abs(wrapHours(utcOffsetHours(zone, instant) - solar))));
  if (gap > LONGITUDE_MARGIN_HOURS) {
    add("time-zone-far-from-longitude", `location.time_zone "${zone}" is ${gap.toFixed(1)} h from the solar time of longitude ${longitude} (margin ${LONGITUDE_MARGIN_HOURS} h)`);
  }
  return findings;
}
