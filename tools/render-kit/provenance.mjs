// @ts-check
/**
 * What a rendered document says about where it came from.
 *
 * **No clock is read here, deliberately.** A document that stamps the moment it was
 * generated differs from itself on every run, which makes a byte comparison against the
 * committed copy fail every day for a reason that is not drift - and a drift check that
 * cries wolf is turned off. So provenance is taken entirely from the MODEL: its name, its
 * address, its declared schema version, and what it contains. Those change when the model
 * changes, which is exactly when the document should.
 *
 * The PDF generators do stamp a date, and correctly: a printed document is handed over and
 * has to say when it was true. They pin it through their own config for determinism. A
 * markdown file living in the repository beside its model is a different artifact, and git
 * already records when each version of it landed.
 */

/**
 * The model's identity, with every field optional because `realm.yaml` may be absent.
 * @param {import("./model-index.mjs").RealmModel} model
 */
export function modelIdentity(model) {
  const realm = model.realm ?? {};
  const location = realm.location && typeof realm.location === "object" ? realm.location : {};
  const address = [location.address, location.city, location.region, location.country]
    .filter((part) => typeof part === "string" && part.trim())
    .join(", ");
  return {
    name: typeof realm.name === "string" ? realm.name : undefined,
    description: typeof realm.description === "string" ? realm.description : undefined,
    address: address || undefined,
    schemaVersion: typeof realm.schemaVersion === "string" ? realm.schemaVersion : undefined,
    version: typeof realm.version === "string" ? realm.version : undefined,
  };
}

/**
 * The one-line summary under a document's title.
 * @param {import("./model-index.mjs").RealmModel} model
 * @returns {string}
 */
export function provenanceLine(model) {
  const identity = modelIdentity(model);
  const parts = [
    `${model.entities.length} entities`,
    `${model.relations.length} relations`,
    `${model.planes.length} planes`,
  ];
  if (identity.schemaVersion) parts.push(`Realm schema v${identity.schemaVersion}`);
  return `Generated from a Realm model: ${parts.join(", ")}.`;
}

/**
 * A document's title: what the caller asked for, else the model's own name, else a label.
 * @param {import("./model-index.mjs").RealmModel} model
 * @param {string|undefined} requested
 * @param {string} fallback
 * @returns {string}
 */
export function documentTitle(model, requested, fallback) {
  if (requested && requested.trim()) return requested.trim();
  const name = modelIdentity(model).name;
  return name ? `${name}` : fallback;
}
