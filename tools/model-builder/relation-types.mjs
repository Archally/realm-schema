// @ts-check
/**
 * The relation vocabulary: what an edge MEANS, keyed by the entity type that declares it
 * and the field it is declared in.
 *
 * A reference field's name says what the target IS, not what the relationship is. Deriving
 * the edge type from the name therefore produces nouns - `care_profile`, `system`,
 * `outdoor_zone` - where the model wants verbs, and it collapses distinct predicates that
 * happen to share a spelling. Keying by (entity type, field) is what separates a component
 * that is `part-of` a system from a thermostat that `controls` one, and it is the same
 * vocabulary the navigation tooling reports, so a model reads the same way everywhere.
 *
 * A field the table does not know still becomes an edge, with its type derived from the
 * name and a warning recorded. An unknown reference must not vanish: a missing edge reads
 * to every consumer as an entity that is simply unconnected, which is indistinguishable
 * from a true finding.
 */

/** @type {Record<string, Record<string, string>>} */
export const RELATION_TYPES = {
  // ── Topology ──
  building: {
    parcel_ref: "located-on",
    furniture_refs: "contains",
    equipment_refs: "contains",
    wing_refs: "contains",
  },
  wing: {
    building_ref: "part-of",
  },
  floor: {
    building_ref: "part-of",
    wing_ref: "part-of",
  },
  room: {
    floor_ref: "part-of",
    wing_ref: "part-of",
    equipment_refs: "contains",
    furniture_refs: "contains",
    adjacent_ref: "adjacent-to",
    opens_to_room_ref: "opens-to",
    opens_to_zone_ref: "opens-to",
  },
  outdoor_zone: {
    parcel_ref: "located-on",
    soil_profile_refs: "has-soil",
  },
  boundary_segment: {
    neighbor_property_ref: "borders",
    parcel_refs: "borders",
    screening_planting_refs: "screens-with",
  },
  furniture: {
    room_ref: "located-in",
    building_ref: "located-in",
  },
  equipment: {
    room_ref: "located-in",
    building_ref: "located-in",
    outdoor_zone_ref: "located-in",
    wing_ref: "located-in",
    boundary_segment_ref: "installed-on",
    system_ref: "part-of",
    component_ref: "installed-as",
    warranty_ref: "covered-by",
  },
  tool: {
    room_ref: "stored-in",
    building_ref: "stored-in",
  },

  // ── Topology - construction ──
  // `ceiling_slab` repeats `floor_slab`'s entries rather than inheriting them: the schema
  // defines it as the same shape in a different role, and a table that lists one and not
  // the other gives two names to one geometry.
  wall_segment: {
    floor_ref: "part-of",
    wing_ref: "part-of",
    left_space_ref: "bounds",
    right_space_ref: "bounds",
    source_room_ref: "derived-from",
    connects_to_ref: "connects-to",
  },
  floor_slab: {
    floor_ref: "part-of",
    wing_ref: "part-of",
  },
  ceiling_slab: {
    floor_ref: "part-of",
    wing_ref: "part-of",
  },
  roof_plane: {
    building_ref: "covers",
    wing_ref: "covers",
  },

  // ── Infrastructure - systems ──
  system: {
    building_ref: "located-in",
    room_ref: "located-in",
    outdoor_zone_ref: "located-in",
    zone_ref: "located-in",
    utility_connection_ref: "fed-by",
    warranty_ref: "covered-by",
    component_refs: "contains",
    feeds_system_refs: "feeds",
  },
  component: {
    system_ref: "part-of",
    room_ref: "located-in",
    building_ref: "located-in",
    warranty_ref: "covered-by",
    along_ref: "runs-along",
  },
  utility_connection: {
    cost_category_ref: "charged-to",
  },

  // ── Infrastructure - network ──
  network_node: {
    room_ref: "located-in",
    outdoor_zone_ref: "located-in",
  },
  iot_device: {
    monitored_system_ref: "monitors",
    controlled_system_ref: "controls",
    network_node_ref: "connected-to",
    room_ref: "located-in",
    outdoor_zone_ref: "located-in",
  },
  network_link: {
    from_node_ref: "links-from",
    to_node_ref: "links-to",
  },

  // ── Nature ──
  specimen: {
    outdoor_zone_ref: "located-in",
    care_profile_ref: "follows-protocol",
    companion_specimen_refs: "companion-of",
    antagonist_specimen_refs: "antagonist-of",
  },
  planting: {
    outdoor_zone_ref: "located-in",
    care_profile_ref: "follows-protocol",
    change_ref: "introduced-by",
  },
  soil_profile: {
    outdoor_zone_ref: "describes",
  },
  planting_recommendation: {
    outdoor_zone_ref: "proposed-in",
    boundary_segment_ref: "screens",
    affected_zone_refs: "affects",
    addresses_concern_refs: "addresses",
    nearest_structure_ref: "near",
  },
  biomass_flow: {
    source_ref: "sourced-from",
    processing_location_ref: "processed-at",
    destination_ref: "delivered-to",
  },

  // ── Operations ──
  maintenance_task: {
    target_ref: "maintains",
    warranty_ref: "fulfills",
    regulatory_requirement_ref: "fulfills",
    notification_rule_refs: "triggers",
    cost_category_ref: "charged-to",
    care_profile_ref: "follows-protocol",
    event_ref: "recorded-as",
  },
  warranty: {
    covered_system_refs: "covers",
    covered_component_refs: "covers",
  },
  regulatory_requirement: {
    target_system_refs: "regulates",
    target_building_refs: "regulates",
    notification_rule_refs: "triggers",
  },

  // ── Context ──
  neighbor_property: {
    boundary_segment_refs: "borders",
    resident_refs: "inhabited-by",
  },
  shared_concern: {
    neighbor_property_ref: "concerns",
    affected_boundary_segment_ref: "affects",
    affected_zone_ref: "affects",
  },
  environmental_factor: {
    affected_zone_refs: "affects",
  },
  road_corridor: {
    borders_neighbor_refs: "borders",
  },

  // ── Cross-cutting ──
  estate_change: {
    affected_system_refs: "impacts",
    affected_zone_refs: "impacts",
    affected_entity_refs: "impacts",
    entity_ref: "impacts",
    equipment_ref: "uses",
    tool_ref: "uses",
    depends_on_estate_change_refs: "depends-on",
    part_of_change_ref: "part-of",
    coordinator_ref: "coordinated-by",
    event_ref: "recorded-as",
  },
  risk: {
    entity_refs: "threatens",
  },
  issue: {
    entity_refs: "affects",
  },
  event: {
    entity_refs: "records",
    estate_change_ref: "triggered-by",
    initiated_by_ref: "initiated-by",
  },
};

/**
 * The type a reference field expresses when the table does not name one: the field name
 * with its `_ref`/`_refs` suffix removed and underscores turned into hyphens, so
 * `care_profile_ref` becomes `care-profile`.
 *
 * @param {string} refField
 * @returns {string}
 */
export function deriveRelationType(refField) {
  return refField.replace(/_refs?$/, "").replace(/_/g, "-");
}

/**
 * Resolve one edge's type, reporting whether the vocabulary knew it.
 *
 * @param {string} entityType
 * @param {string} refField
 * @returns {{type: string, curated: boolean}}
 */
export function resolveRelationType(entityType, refField) {
  const known = RELATION_TYPES[entityType]?.[refField];
  return known
    ? { type: known, curated: true }
    : { type: deriveRelationType(refField), curated: false };
}

/**
 * Every (entity type, field) pair the vocabulary maps to a given relation type.
 *
 * A rule that asks "does anything point AT me" cannot constrain what answered, so it needs
 * to know which kinds of entity can. Read from the table rather than from a model, because
 * a model shows only the pairs it happens to instantiate.
 *
 * @param {string} relationType
 * @returns {string[]} `entityType.field` pairs, sorted
 */
export function sourcesOfRelationType(relationType) {
  const sources = [];
  for (const [entityType, fields] of Object.entries(RELATION_TYPES)) {
    for (const [field, type] of Object.entries(fields)) {
      if (type === relationType) sources.push(`${entityType}.${field}`);
    }
  }
  return sources.sort();
}
