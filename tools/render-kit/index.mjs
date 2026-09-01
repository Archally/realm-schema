// @ts-check
/**
 * `@archally/realm-render-kit` - shared, zero-build helpers for realm's renderers.
 *
 * Two halves, and the split is the point.
 *
 * **Projection** (`model-index`, `containment`, `schedule`, `care-calendar`, `vegetation`,
 * `systems`) turns the model builder's two flat arrays into the shapes a property document
 * is made of: what contains what, what has to be done and when, what grows where, what is
 * installed. This half is renderer-agnostic - a PDF, an SVG and a markdown page all need the
 * same containment tree, and each computing its own is how two documents about one property
 * come to disagree.
 *
 * **Presentation** (`markdown`, `mermaid`, `provenance`) is text output, and only some
 * consumers want it.
 *
 * Realm's kit is its own rather than shared with blueprint's: the two schemas evolve on
 * separate timetables, and a shared kit would make every realm change a blueprint review.
 */

export { indexModel, ofType, nameOf, followField, incomingOfType, groupByField, GEOMETRY_TYPES } from "./model-index.mjs";
export { buildContainment, containmentOrder, containmentEdges, PARENT_FIELDS, CONTAINMENT_TYPES } from "./containment.mjs";
export {
  maintenanceByKind,
  estateChangesByStatus,
  scheduleSummary,
  lastExecution,
  costByCategory,
  orderBy,
  orderedGroups,
  PRIORITY_ORDER,
  STATUS_ORDER,
  KIND_ORDER,
} from "./schedule.mjs";
export { careCalendar, unscheduledThreats, subjectsOfProfile, MONTH_NAMES } from "./care-calendar.mjs";
export { vegetationByZone, specimenSize, plantingSize } from "./vegetation.mjs";
export { systemsWithParts, monitoringDevices } from "./systems.mjs";
export { cell, table, section, sections, bullets, prose, blockquote, ABSENT } from "./markdown.mjs";
export { nodeId, label, flowchart, fence } from "./mermaid.mjs";
export { modelIdentity, provenanceLine, documentTitle } from "./provenance.mjs";
