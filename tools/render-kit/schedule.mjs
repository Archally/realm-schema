// @ts-check
/**
 * What has to be done, and when.
 *
 * The second half of a property document, and the half the model is least often asked for:
 * maintenance tasks grouped the way they get carried out, and planned work grouped by how
 * far along it is.
 */

import { indexModel, ofType, groupByField } from "./model-index.mjs";

/** Priority, most urgent first. Anything unrecognised sorts last, never first. */
export const PRIORITY_ORDER = ["critical", "high", "medium", "low"];

/**
 * Status, in lifecycle order.
 *
 * This is what the published renderer groups planned work by. The monorepo generator groups
 * by an `x-epic` extension field through a project-local lookup table, and the schema has no
 * such field - so a published tool cannot use it without requiring a document the schema
 * never asks for.
 */
export const STATUS_ORDER = ["in-progress", "approved", "proposed", "completed", "cancelled"];

/** Maintenance kinds, in the order the ancestor's tables ran. */
export const KIND_ORDER = ["building", "infrastructure", "garden"];

/**
 * Order a list by a declared vocabulary, then by a date, then by id.
 *
 * @template {{id: string, data: Record<string, any>}} T
 * @param {T[]} items
 * @param {{field: string, order: string[], dateField?: string}} spec
 * @returns {T[]}
 */
export function orderBy(items, spec) {
  const rank = (value) => {
    const position = spec.order.indexOf(value);
    return position === -1 ? spec.order.length : position;
  };
  return [...items].sort((left, right) => {
    const byRank = rank(left.data?.[spec.field]) - rank(right.data?.[spec.field]);
    if (byRank !== 0) return byRank;
    if (spec.dateField) {
      const leftDate = left.data?.[spec.dateField];
      const rightDate = right.data?.[spec.dateField];
      if (leftDate && !rightDate) return -1;
      if (!leftDate && rightDate) return 1;
      if (leftDate && rightDate && leftDate !== rightDate) {
        return String(leftDate).localeCompare(String(rightDate));
      }
    }
    return left.id.localeCompare(right.id);
  });
}

/**
 * Groups in a declared order, with any unlisted group appended rather than dropped.
 *
 * A vocabulary the model uses and this file has not heard of must still reach the reader: a
 * new maintenance kind should arrive as an unfamiliar heading, not as missing tasks.
 *
 * @template T
 * @param {Map<string, T[]>} groups
 * @param {string[]} order
 * @returns {{key: string, items: T[]}[]}
 */
export function orderedGroups(groups, order) {
  const known = order.filter((key) => groups.has(key)).map((key) => ({ key, items: groups.get(key) ?? [] }));
  const rest = [...groups.keys()]
    .filter((key) => !order.includes(key))
    .sort()
    .map((key) => ({ key, items: groups.get(key) ?? [] }));
  return [...known, ...rest];
}

/**
 * Maintenance tasks grouped by `kind`, in `KIND_ORDER`, each group ordered by priority.
 * @param {import("./model-index.mjs").RealmModel | import("./model-index.mjs").RealmIndex} source
 */
export function maintenanceByKind(source) {
  const index = "byId" in source ? source : indexModel(source);
  const grouped = groupByField(ofType(index, "maintenance_task"), "kind");
  return orderedGroups(grouped, KIND_ORDER).map((group) => ({
    key: group.key,
    items: orderBy(group.items, { field: "priority", order: PRIORITY_ORDER }),
  }));
}

/**
 * Estate changes grouped by `status`, in `STATUS_ORDER`, each group by priority then start date.
 * @param {import("./model-index.mjs").RealmModel | import("./model-index.mjs").RealmIndex} source
 */
export function estateChangesByStatus(source) {
  const index = "byId" in source ? source : indexModel(source);
  const grouped = groupByField(ofType(index, "estate_change"), "status");
  return orderedGroups(grouped, STATUS_ORDER).map((group) => ({
    key: group.key,
    items: orderBy(group.items, {
      field: "priority",
      order: PRIORITY_ORDER,
      dateField: "planned_start_date",
    }),
  }));
}

/**
 * How a recurring task's timing reads.
 *
 * The schema carries both an `rrule` and a human `summary`, and the summary is what a person
 * acts on. The rrule is the fallback rather than the default: "RRULE:FREQ=YEARLY;BYMONTH=9"
 * is precise and nobody schedules a plumber from it.
 *
 * @param {Record<string, any>} data
 * @returns {string}
 */
export function scheduleSummary(data) {
  const schedule = data?.schedule;
  if (!schedule || typeof schedule !== "object") return "";
  if (typeof schedule.summary === "string" && schedule.summary.trim()) return schedule.summary.trim();
  if (typeof schedule.rrule === "string") return schedule.rrule.replace(/^RRULE:/, "");
  return "";
}

/**
 * The most recent recorded execution of a task, or "".
 *
 * Executions are an unordered list in the model, so "most recent" is computed rather than
 * taken from the first element.
 *
 * @param {Record<string, any>} data
 * @returns {string}
 */
export function lastExecution(data) {
  const executions = Array.isArray(data?.executions) ? data.executions : [];
  const dates = executions
    .map((execution) => execution?.date)
    .filter((date) => typeof date === "string")
    .sort();
  return dates.length ? dates[dates.length - 1] : "";
}

/**
 * Total estimated annual spend per cost category, from the tasks charged to it.
 *
 * Only tasks that state both a cost and a currency contribute, and a category whose tasks
 * use more than one currency reports them separately rather than adding them up.
 *
 * @param {import("./model-index.mjs").RealmModel | import("./model-index.mjs").RealmIndex} source
 */
export function costByCategory(source) {
  const index = "byId" in source ? source : indexModel(source);
  /** @type {Map<string, Map<string, number>>} */
  const totals = new Map();
  for (const task of ofType(index, "maintenance_task")) {
    const category = task.data?.cost_category_ref;
    const amount = task.data?.estimated_cost;
    const currency = task.data?.currency;
    if (typeof category !== "string" || typeof amount !== "number" || typeof currency !== "string") {
      continue;
    }
    const byCurrency = totals.get(category) ?? new Map();
    byCurrency.set(currency, (byCurrency.get(currency) ?? 0) + amount);
    totals.set(category, byCurrency);
  }
  return totals;
}
