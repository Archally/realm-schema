// @ts-check
/**
 * The property document.
 *
 * Section for section from `viewers/realm/schedule-planner`, the PDF generator this schema
 * has had since March: a description part and a schedule part, under a header naming the
 * property and what it is made of. What that generator groups its planned work by - an
 * `x-epic` extension read through a project-local lookup - is not in the schema, so this one
 * groups by `status`, which every model carries.
 */

import {
  indexModel,
  ofType,
  nameOf,
  followField,
  GEOMETRY_TYPES,
  buildContainment,
  containmentOrder,
  containmentEdges,
  maintenanceByKind,
  estateChangesByStatus,
  scheduleSummary,
  lastExecution,
  costByCategory,
  systemsWithParts,
  monitoringDevices,
  table,
  section,
  sections,
  prose,
  blockquote,
  cell,
  flowchart,
  fence,
  provenanceLine,
  documentTitle,
  modelIdentity,
} from "../render-kit/index.mjs";

/**
 * @param {import("../render-kit/model-index.mjs").RealmModel} model
 * @param {{title?: string, relations?: boolean, geometry?: boolean, findings?: {ruleId: string, severity: string, message: string}[]}} [options]
 * @returns {string}
 */
export function renderProperty(model, options = {}) {
  const index = indexModel(model);
  const identity = modelIdentity(model);

  return sections([
    `# ${documentTitle(model, options.title, "Property")}`,
    blockquote(provenanceLine(model)),
    identity.address ? `**${identity.address}**` : "",
    prose(identity.description),
    whereThingsAre(index),
    buildingsAndRooms(index),
    grounds(index),
    systemsSection(index),
    maintenanceSection(index),
    plannedWork(index),
    contextSection(index),
    modelCoverage(model, options.findings),
    catalogue(model, index, options.geometry === true),
    options.relations === true ? relationTable(model, index) : "",
  ]);
}

/** The containment tree, drawn and then stated. */
function whereThingsAre(index) {
  const tree = buildContainment(index);
  const order = containmentOrder(tree);
  if (order.length === 0) return "";

  const nodes = order.map(({ entity }) => ({
    id: entity.id,
    label: entity.name ? `${entity.name}\n${entity.id}` : entity.id,
    shape: entity.type === "outdoor_zone" ? "round" : "box",
  }));

  return section(
    2,
    "Where things are",
    fence(flowchart({ direction: "TD", nodes, edges: containmentEdges(tree) })),
    // Depth is a NUMBER, not a prefix of hyphens. The absent marker in every other cell is a
    // hyphen, so an indented name reads as three empty columns followed by a name.
    table(
      ["Id", "Level", "Type", "Name", "Area", "Within"],
      order.map(({ entity, depth }) => [
        entity.id,
        depth,
        entity.type,
        entity.name,
        areaOf(entity.data),
        nameOf(index, tree.nodes.get(entity.id)?.parent),
      ]),
    ),
  );
}

function areaOf(data) {
  if (typeof data?.area_sqm === "number") return `${data.area_sqm} m2`;
  if (typeof data?.total_area_sqm === "number") return `${data.total_area_sqm} m2`;
  return "";
}

/** Rooms, per building, with the properties a person walking the building can check. */
function buildingsAndRooms(index) {
  const buildings = ofType(index, "building");
  if (buildings.length === 0) return "";

  const parts = [];
  for (const building of buildings) {
    const wings = ofType(index, "wing").filter(
      (wing) => followField(index, wing.id, "building_ref")[0]?.id === building.id,
    );
    const wingIds = new Set(wings.map((wing) => wing.id));
    const floors = ofType(index, "floor").filter((floor) => {
      const viaWing = followField(index, floor.id, "wing_ref")[0];
      const viaBuilding = followField(index, floor.id, "building_ref")[0];
      return (viaWing && wingIds.has(viaWing.id)) || viaBuilding?.id === building.id;
    });
    const floorIds = new Set(floors.map((floor) => floor.id));
    const rooms = ofType(index, "room").filter((room) => {
      const floor = followField(index, room.id, "floor_ref")[0];
      const wing = followField(index, room.id, "wing_ref")[0];
      return (floor && floorIds.has(floor.id)) || (wing && wingIds.has(wing.id));
    });

    parts.push(
      section(
        3,
        `${building.name ?? building.id} (${building.id})`,
        prose(building.data?.description),
        table(
          ["Property", "Value"],
          [
            ["Type", building.data?.building_type],
            ["Built", building.data?.built_year],
            ["Floors", building.data?.floors_count],
            ["Area", areaOf(building.data)],
            ["Wings", wings.map((wing) => wing.id)],
          ].filter((row) => cell(row[1]) !== "-"),
        ),
        table(
          ["Room", "Name", "Type", "Floor", "Area", "Ceiling", "Water", "Heating"],
          rooms.map((room) => [
            room.id,
            room.name,
            room.data?.room_type,
            nameOf(index, followField(index, room.id, "floor_ref")[0]?.id),
            areaOf(room.data),
            typeof room.data?.ceiling_height_cm === "number" ? `${room.data.ceiling_height_cm} cm` : "",
            room.data?.has_water === true ? "yes" : room.data?.has_water === false ? "no" : "",
            room.data?.has_heating === true ? "yes" : room.data?.has_heating === false ? "no" : "",
          ]),
        ),
      ),
    );
  }
  return section(2, "Buildings and rooms", ...parts);
}

/** Outdoor zones, the boundary, and who is on the other side of it. */
function grounds(index) {
  const zones = ofType(index, "outdoor_zone");
  const boundaries = ofType(index, "boundary_segment");
  const neighbours = ofType(index, "neighbor_property");

  return section(
    2,
    "Grounds",
    table(
      ["Zone", "Name", "Type", "Area", "Sun", "Slope"],
      zones.map((zone) => [
        zone.id,
        zone.name,
        zone.data?.zone_type,
        areaOf(zone.data),
        zone.data?.sun_exposure,
        typeof zone.data?.slope_percent === "number"
          ? `${zone.data.slope_percent}% ${zone.data.slope_direction ?? ""}`.trim()
          : "",
      ]),
    ),
    boundaries.length
      ? section(
          3,
          "Boundary",
          table(
            ["Segment", "Name", "Type", "Length", "Borders"],
            boundaries.map((segment) => [
              segment.id,
              segment.name,
              segment.data?.boundary_type,
              typeof segment.data?.length_m === "number" ? `${segment.data.length_m} m` : "",
              followField(index, segment.id, "neighbor_property_ref")
                .map((neighbour) => nameOf(index, neighbour.id))
                .join(", "),
            ]),
          ),
        )
      : "",
    neighbours.length
      ? section(
          3,
          "Neighbouring property",
          table(
            ["Property", "Name", "Type", "Notes"],
            neighbours.map((neighbour) => [
              neighbour.id,
              neighbour.name,
              neighbour.data?.property_type,
              prose(neighbour.data?.description),
            ]),
          ),
        )
      : "",
  );
}

/** Systems, their parts, their supply, and the devices watching them. */
function systemsSection(index) {
  const { systems, connections, orphanComponents } = systemsWithParts(index);
  if (systems.length === 0 && connections.length === 0) return "";

  const nodes = [];
  const edges = [];
  for (const entry of systems) {
    nodes.push({ id: entry.system.id, label: `${entry.system.name ?? entry.system.id}\n${entry.system.id}` });
    for (const component of entry.components) {
      nodes.push({ id: component.id, label: `${component.name ?? component.id}\n${component.id}`, shape: "round" });
      edges.push({ from: entry.system.id, to: component.id, label: "contains" });
    }
    if (entry.supply) {
      nodes.push({ id: entry.supply.id, label: `${entry.supply.name ?? entry.supply.id}\n${entry.supply.id}`, shape: "stadium" });
      edges.push({ from: entry.supply.id, to: entry.system.id, label: "feeds" });
    }
    for (const fed of entry.feeds) edges.push({ from: entry.system.id, to: fed.id, label: "feeds" });
  }

  const devices = monitoringDevices(index);

  return section(
    2,
    "Systems and utilities",
    fence(flowchart({ direction: "LR", nodes: dedupeNodes(nodes), edges })),
    table(
      ["System", "Name", "Type", "Where", "Supply", "Parts", "Installed"],
      systems.map((entry) => [
        entry.system.id,
        entry.system.name,
        entry.system.data?.system_type,
        entry.placement ? nameOf(index, entry.placement.id) : "",
        entry.supply ? nameOf(index, entry.supply.id) : "",
        entry.components.map((component) => component.id),
        entry.system.data?.installed_date,
      ]),
    ),
    connections.length
      ? section(
          3,
          "Utility connections",
          table(
            ["Connection", "Name", "Type", "Provider", "Charged to"],
            connections.map((connection) => [
              connection.id,
              connection.name,
              connection.data?.connection_type,
              connection.data?.provider,
              nameOf(index, followField(index, connection.id, "cost_category_ref")[0]?.id),
            ]),
          ),
        )
      : "",
    devices.length
      ? section(
          3,
          "Monitoring",
          table(
            ["Device", "Name", "Monitors", "Controls", "Where"],
            devices.map((entry) => [
              entry.device.id,
              entry.device.name,
              entry.monitors ? nameOf(index, entry.monitors.id) : "",
              entry.controls ? nameOf(index, entry.controls.id) : "",
              entry.placement ? nameOf(index, entry.placement.id) : "",
            ]),
          ),
        )
      : "",
    orphanComponents.length
      ? `${orphanComponents.length} component(s) belong to no system: ${orphanComponents
          .map((component) => component.id)
          .join(", ")}.`
      : "",
  );
}

function dedupeNodes(nodes) {
  const seen = new Set();
  return nodes.filter((node) => (seen.has(node.id) ? false : (seen.add(node.id), true)));
}

/** Recurring work, grouped the way it gets carried out. */
function maintenanceSection(index) {
  const groups = maintenanceByKind(index);
  if (groups.length === 0) return "";

  const costs = costByCategory(index);
  const categories = ofType(index, "cost_category");

  return section(
    2,
    "Maintenance schedule",
    ...groups.map((group) =>
      section(
        3,
        `${group.key} (${group.items.length})`,
        table(
          ["Task", "Name", "Target", "When", "Season", "Priority", "Duration", "Cost", "Last done"],
          group.items.map((task) => [
            task.id,
            task.name,
            nameOf(index, followField(index, task.id, "target_ref")[0]?.id),
            scheduleSummary(task.data),
            task.data?.season,
            task.data?.priority,
            typeof task.data?.estimated_duration_minutes === "number"
              ? `${task.data.estimated_duration_minutes} min`
              : "",
            typeof task.data?.estimated_cost === "number"
              ? `${task.data.estimated_cost} ${task.data.currency ?? ""}`.trim()
              : "",
            lastExecution(task.data),
          ]),
        ),
      ),
    ),
    categories.length
      ? section(
          3,
          "Cost categories",
          table(
            ["Category", "Name", "Annual budget", "Charged from the schedule above"],
            categories.map((category) => [
              category.id,
              category.name,
              typeof category.data?.annual_budget_estimate === "number"
                ? `${category.data.annual_budget_estimate} ${category.data.currency ?? ""}`.trim()
                : "",
              [...(costs.get(category.id) ?? new Map())]
                .map(([currency, total]) => `${total} ${currency}`)
                .join(", "),
            ]),
          ),
        )
      : "",
  );
}

/** Planned work, what it touches, and what the model says is at risk. */
function plannedWork(index) {
  const groups = estateChangesByStatus(index);
  const risks = ofType(index, "risk");
  const issues = ofType(index, "issue");
  if (groups.length === 0 && risks.length === 0 && issues.length === 0) return "";

  return section(
    2,
    "Planned work",
    ...groups.map((group) =>
      section(
        3,
        `${group.key} (${group.items.length})`,
        table(
          ["Change", "Name", "Priority", "Planned", "Affects", "Cost"],
          group.items.map((change) => [
            change.id,
            change.name,
            change.data?.priority,
            [change.data?.planned_start_date, change.data?.planned_end_date]
              .filter(Boolean)
              .join(" to "),
            (index.outgoing.get(change.id) ?? [])
              .filter((relation) => relation.type === "impacts")
              .map((relation) => relation.target)
              .join(", "),
            typeof change.data?.estimated_cost === "number"
              ? `${change.data.estimated_cost} ${change.data.currency ?? ""}`.trim()
              : "",
          ]),
        ),
      ),
    ),
    risks.length
      ? section(
          3,
          "Risks",
          table(
            ["Risk", "Name", "Category", "Severity", "Status", "Threatens", "Mitigation"],
            risks.map((risk) => [
              risk.id,
              risk.name,
              risk.data?.category,
              risk.data?.severity,
              risk.data?.status,
              (index.outgoing.get(risk.id) ?? [])
                .filter((relation) => relation.type === "threatens")
                .map((relation) => relation.target)
                .join(", "),
              prose(risk.data?.mitigation),
            ]),
          ),
        )
      : "",
    issues.length
      ? section(
          3,
          "Open issues",
          table(
            ["Issue", "Name", "Severity", "Status", "Affects"],
            issues.map((issue) => [
              issue.id,
              issue.name,
              issue.data?.severity,
              issue.data?.status,
              (index.outgoing.get(issue.id) ?? [])
                .filter((relation) => relation.type === "affects")
                .map((relation) => relation.target)
                .join(", "),
            ]),
          ),
        )
      : "",
  );
}

/** People, obligations and cover. */
function contextSection(index) {
  const people = ofType(index, "person");
  const regulations = ofType(index, "regulatory_requirement");
  const warranties = ofType(index, "warranty");
  const factors = ofType(index, "environmental_factor");

  return section(
    2,
    "Context",
    people.length
      ? section(
          3,
          "People",
          table(
            ["Person", "Name", "Type", "Role", "Company"],
            people.map((person) => [
              person.id,
              person.name,
              person.data?.person_type,
              person.data?.role,
              person.data?.company,
            ]),
          ),
        )
      : "",
    regulations.length
      ? section(
          3,
          "Regulatory requirements",
          table(
            ["Requirement", "Name", "Type", "Inspection", "Last", "Next due", "Applies to"],
            regulations.map((requirement) => [
              requirement.id,
              requirement.name,
              requirement.data?.requirement_type,
              requirement.data?.inspection_schedule,
              requirement.data?.last_inspection_date,
              requirement.data?.next_due_date,
              (index.outgoing.get(requirement.id) ?? [])
                .filter((relation) => relation.type === "regulates")
                .map((relation) => relation.target)
                .join(", "),
            ]),
          ),
        )
      : "",
    warranties.length
      ? section(
          3,
          "Warranties",
          table(
            ["Warranty", "Name", "Manufacturer", "From", "To", "Covers"],
            warranties.map((warranty) => [
              warranty.id,
              warranty.name,
              warranty.data?.manufacturer,
              warranty.data?.start_date,
              warranty.data?.end_date,
              (index.outgoing.get(warranty.id) ?? [])
                .filter((relation) => relation.type === "covers")
                .map((relation) => relation.target)
                .join(", "),
            ]),
          ),
        )
      : "",
    factors.length
      ? section(
          3,
          "Environmental factors",
          table(
            ["Factor", "Name", "Type", "Affects", "Notes"],
            factors.map((factor) => [
              factor.id,
              factor.name,
              factor.data?.factor_type,
              (index.outgoing.get(factor.id) ?? [])
                .filter((relation) => relation.type === "affects")
                .map((relation) => relation.target)
                .join(", "),
              prose(factor.data?.description),
            ]),
          ),
        )
      : "",
  );
}

/**
 * What the model-quality rules say about this model.
 *
 * The findings come from the rule pack, not from logic written here. A renderer computing
 * its own idea of "incomplete" is a second implementation of the pack's question, and the
 * two would answer differently about the same model with nothing to say which was right.
 */
function modelCoverage(model, findings) {
  if (!findings) return "";
  if (findings.length === 0) {
    return section(2, "Model coverage", "No findings. Every model-quality rule passes on this model.");
  }
  const byRule = new Map();
  for (const finding of findings) {
    const list = byRule.get(finding.ruleId);
    if (list) list.push(finding);
    else byRule.set(finding.ruleId, [finding]);
  }
  return section(
    2,
    "Model coverage",
    `${findings.length} finding(s) from ${byRule.size} rule(s). Each names something the schema leaves optional and this model does not say. One example per rule is shown; \`realm-check\` prints them all.`,
    table(
      ["Rule", "Severity", "Findings", "Example"],
      [...byRule.entries()]
        .sort((left, right) => left[0].localeCompare(right[0]))
        .map(([ruleId, found]) => [ruleId, found[0].severity, found.length, found[0].message]),
    ),
  );
}

/** What the model contains, by plane and by type, with the derived layer summarised. */
function catalogue(model, index, includeGeometry) {
  const geometry = model.entities.filter((entity) => GEOMETRY_TYPES.has(entity.type));
  const authored = model.entities.filter((entity) => !GEOMETRY_TYPES.has(entity.type));

  const typeRows = [...index.byType.entries()]
    .filter(([type]) => includeGeometry || !GEOMETRY_TYPES.has(type))
    .sort((left, right) => right[1].length - left[1].length || left[0].localeCompare(right[0]))
    .map(([type, entities]) => [type, entities.length, entities[0]?.plane ?? ""]);

  const geometryNote = geometry.length
    ? `${geometry.length} further entities form the construction layer (${[...GEOMETRY_TYPES]
        .map((type) => `${index.byType.get(type)?.length ?? 0} ${type}`)
        .filter((part) => !part.startsWith("0 "))
        .join(", ")}). They are derived from the rooms, wings and floors above rather than authored, and are ${
        includeGeometry ? "included here" : "summarised rather than listed - pass --geometry to enumerate them"
      }.`
    : "";

  return section(
    2,
    "Catalogue",
    table(
      ["Plane", "Entities"],
      model.planes
        .map((plane) => [plane, model.entities.filter((entity) => entity.plane === plane).length])
        .concat([["(cross-cutting)", model.entities.filter((entity) => !entity.plane).length]]),
    ),
    table(["Type", "Count", "Plane"], typeRows),
    `${authored.length} authored entities, ${geometry.length} derived.`,
    geometryNote,
  );
}

/** Every relation, on request only. */
function relationTable(model, index) {
  return section(
    2,
    "Relations",
    table(
      ["Source", "Predicate", "Target", "Field"],
      model.relations.map((relation) => [
        nameOf(index, relation.source),
        relation.type,
        nameOf(index, relation.target),
        relation.refField,
      ]),
    ),
  );
}
