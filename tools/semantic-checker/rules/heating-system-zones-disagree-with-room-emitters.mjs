// @ts-check
/**
 * Check whether an active heating system's explicit distribution_zones agrees with
 * active rooms that declare a complete heating.emitters list.
 *
 * Pure function over CheckableModel (no IO, no network, no mutation).
 */

/**
 * Whether an entity has ended (defensive check when called outside adapter filtering).
 *
 * @param {{ data?: Record<string, unknown> }} entity
 * @returns {boolean}
 */
function isEnded(entity) {
  const lifecycle = entity.data?.lifecycle;
  const state = lifecycle && typeof lifecycle === "object"
    ? /** @type {Record<string, unknown>} */ (lifecycle).state
    : undefined;
  if (state === "retired" || state === "superseded") {
    return true;
  }
  return entity.data?.["x-retired"] !== undefined;
}

/**
 * Compare one active heating system's explicit distribution_zones against active
 * rooms with explicit heating.emitters lists.
 *
 * @param {{ entities: Array<{ id: string, type: string, data?: Record<string, unknown> }> }} model
 * @param {{ id: string, type: string, data?: Record<string, unknown> } | undefined} subject
 * @returns {{ ok: boolean, context?: { details: string } }}
 */
export function checkHeatingSystemZonesDisagreeWithRoomEmitters(model, subject) {
  if (!subject) {
    return { ok: true };
  }
  if (subject.type !== "system") {
    return { ok: true };
  }
  if (isEnded(subject)) {
    return { ok: true };
  }
  if (subject.data?.system_type !== "heating") {
    return { ok: true };
  }
  const rawZones = subject.data?.distribution_zones;
  if (!Array.isArray(rawZones)) {
    return { ok: true };
  }

  /** @type {Set<string>} */
  const activeSystemIds = new Set();
  /** @type {Map<string, { id: string, type: string, data?: Record<string, unknown> }>} */
  const activeRoomsById = new Map();
  /** @type {Array<{ id: string, data?: Record<string, unknown> }>} */
  const activeComponents = [];

  for (const entity of model.entities) {
    if (isEnded(entity)) {
      continue;
    }
    if (entity.type === "system") {
      activeSystemIds.add(entity.id);
    } else if (entity.type === "room") {
      activeRoomsById.set(entity.id, entity);
    } else if (entity.type === "component") {
      activeComponents.push(entity);
    }
  }

  /** @type {Map<string, string>} */
  const activeComponentToSystem = new Map();
  for (const component of activeComponents) {
    const parentSystem = component.data?.system_ref;
    if (typeof parentSystem === "string" && activeSystemIds.has(parentSystem)) {
      activeComponentToSystem.set(component.id, parentSystem);
    }
  }

  /** @type {Set<string>} */
  const listedRoomIds = new Set();
  for (const entry of rawZones) {
    if (!entry || typeof entry !== "object") {
      continue;
    }
    const zoneRef = /** @type {Record<string, unknown>} */ (entry).zone_ref;
    if (typeof zoneRef !== "string") {
      continue;
    }
    if (!activeRoomsById.has(zoneRef)) {
      continue;
    }
    listedRoomIds.add(zoneRef);
  }

  /** @type {Set<string>} */
  const missingFromZones = new Set();
  /** @type {Set<string>} */
  const notHeatedBySystem = new Set();

  for (const room of activeRoomsById.values()) {
    const heating = room.data?.heating;
    if (!heating || typeof heating !== "object") {
      continue;
    }
    const emitters = /** @type {Record<string, unknown>} */ (heating).emitters;
    if (!Array.isArray(emitters)) {
      continue;
    }

    /** @type {Set<string>} */
    const confirmedSystems = new Set();
    let allMembershipKnown = true;

    for (const emitter of emitters) {
      if (!emitter || typeof emitter !== "object") {
        allMembershipKnown = false;
        continue;
      }
      const record = /** @type {Record<string, unknown>} */ (emitter);
      const componentRef = record.component_ref;
      const systemRef = record.system_ref;

      if (typeof componentRef === "string") {
        const resolvedSystem = activeComponentToSystem.get(componentRef);
        if (resolvedSystem !== undefined) {
          confirmedSystems.add(resolvedSystem);
        } else {
          allMembershipKnown = false;
        }
        continue;
      }

      if (typeof systemRef === "string") {
        if (activeSystemIds.has(systemRef)) {
          confirmedSystems.add(systemRef);
        } else {
          allMembershipKnown = false;
        }
        continue;
      }

      allMembershipKnown = false;
    }

    const heatsRoom = confirmedSystems.has(subject.id);
    const listedInZones = listedRoomIds.has(room.id);

    if (heatsRoom && !listedInZones) {
      missingFromZones.add(room.id);
    }
    if (listedInZones && !heatsRoom && allMembershipKnown) {
      notHeatedBySystem.add(room.id);
    }
  }

  const missing = [...missingFromZones].sort();
  const extra = [...notHeatedBySystem].sort();
  if (missing.length === 0 && extra.length === 0) {
    return { ok: true };
  }

  const parts = [];
  if (missing.length > 0) {
    parts.push(`rooms heated by this system but missing from distribution_zones: ${missing.join(", ")}`);
  }
  if (extra.length > 0) {
    parts.push(`rooms listed in distribution_zones with no matching emitter: ${extra.join(", ")}`);
  }
  return { ok: false, context: { details: parts.join("; ") } };
}
