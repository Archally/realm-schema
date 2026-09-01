// @ts-check
/**
 * The installed systems and what they are made of.
 *
 * A system contains components, is fed by a utility connection, may feed another system, is
 * located in a building or a room, and may be covered by a warranty. Six reference fields,
 * five distinct meanings, and the reason `resolveRelationType` is keyed by (entity type,
 * field) rather than by field name alone.
 */

import { indexModel, ofType, followField, incomingOfType } from "./model-index.mjs";

/**
 * Systems with their parts, supply and placement resolved.
 * @param {import("./model-index.mjs").RealmModel | import("./model-index.mjs").RealmIndex} source
 */
export function systemsWithParts(source) {
  const index = "byId" in source ? source : indexModel(source);

  const systems = ofType(index, "system").map((system) => ({
    system,
    // Components declare `system_ref` (`part-of`); a system also declares `component_refs`
    // (`contains`). Both directions are read and merged by id, because a model may state
    // either or both and a document that reads one direction reports a system as empty when
    // the other was used.
    components: uniqueById([
      ...incomingOfType(index, system.id, "part-of").filter((entity) => entity.type === "component"),
      ...followField(index, system.id, "component_refs"),
    ]),
    supply: followField(index, system.id, "utility_connection_ref")[0],
    feeds: followField(index, system.id, "feeds_system_refs"),
    warranty: followField(index, system.id, "warranty_ref")[0],
    placement:
      followField(index, system.id, "room_ref")[0] ??
      followField(index, system.id, "building_ref")[0] ??
      followField(index, system.id, "outdoor_zone_ref")[0] ??
      followField(index, system.id, "zone_ref")[0],
  }));

  return {
    index,
    systems,
    connections: ofType(index, "utility_connection"),
    /** Components belonging to no system: real entities that no system section would show. */
    orphanComponents: ofType(index, "component").filter(
      (component) => followField(index, component.id, "system_ref").length === 0,
    ),
  };
}

/**
 * @template {{id: string}} T
 * @param {T[]} entities
 * @returns {T[]}
 */
function uniqueById(entities) {
  const seen = new Set();
  const out = [];
  for (const entity of entities) {
    if (seen.has(entity.id)) continue;
    seen.add(entity.id);
    out.push(entity);
  }
  return out.sort((left, right) => left.id.localeCompare(right.id));
}

/**
 * The monitoring and control layer: devices, what they watch, and how they connect.
 * @param {import("./model-index.mjs").RealmModel | import("./model-index.mjs").RealmIndex} source
 */
export function monitoringDevices(source) {
  const index = "byId" in source ? source : indexModel(source);
  return ofType(index, "iot_device").map((device) => ({
    device,
    monitors: followField(index, device.id, "monitored_system_ref")[0],
    controls: followField(index, device.id, "controlled_system_ref")[0],
    node: followField(index, device.id, "network_node_ref")[0],
    placement:
      followField(index, device.id, "room_ref")[0] ??
      followField(index, device.id, "outdoor_zone_ref")[0],
  }));
}
