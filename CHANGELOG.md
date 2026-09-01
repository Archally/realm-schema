# Changelog

All notable changes to `@archally/realm-schema`. Versions follow the schema version:
a model declaring `schemaVersion: "2.2.0"` validates against `schema/v2.2/`.

## 2.2.3 - 2026-09-01

### Added

- A model-quality checker: `npm run check -- --model <dir>`, or `realm-check`. Seven rules
  asking what neither the schema nor the validator asks - does the model say anything, in
  the places the schema deliberately leaves optional. A specimen with no care profile
  appears on no maintenance calendar; a system with no components is a name with nothing
  behind it; a boundary run belonging to no parcel appears on no site plan. Findings are
  reported rather than enforced, and `--strict` turns them into a gate.
- [`docs/model-quality.md`](./docs/model-quality.md) documents every rule: what it selects,
  what you will see, and why it is worth acting on.

### Changed

- **The repository is now dual-licensed**, and [`LICENSE`](./LICENSE) is the authoritative
  map. The schema, the examples, the documentation, the reference validator and the
  doc-snippet validator remain **Apache-2.0** (now in
  [`LICENSE-APACHE`](./LICENSE-APACHE)). The model-quality checker and its rule pack are
  **FSL-1.1-ALv2** ([`LICENSE-FSL`](./LICENSE-FSL)), each version converting to Apache-2.0
  two years after release. Nothing that was Apache-2.0 has changed licence.

  The line is between conformance and judgement: whether a model is valid is a property of
  the format and must be freely checkable by anyone, while whether a model is good is a set
  of modeling opinions. The rule engine the checker runs on is the separate Apache-2.0
  package `@archally/semantic-checker` and is not covered by the FSL section.

## 2.2.2 - 2026-09-01

### Added

- Documentation, under [`docs/`](./docs/). [File
  conventions](./docs/file-conventions.md) covers where a model's files go, the twenty one
  filenames the validator maps to a schema, the thirty nine typed identifier prefixes, and
  what happens to a file the map does not know. The [modeling
  guide](./docs/modeling-guide.md) covers authoring: what to write first, why `position` is
  absolute while `footprint` is relative and the two places that inverts, how the
  construction layer is derived from the semantic one, and what each of the five validation
  layers asserts. The [schema reference](./docs/schema-reference.md) lists every entity and
  field, and is generated from the schema's own descriptions.
- Every YAML example in the guides is validated as a real model in CI, against the shipped
  schema and by the shipped validator, together with a seeded bad example proving the check
  can still fail.

## 2.2.1 - 2026-09-01

### Added

- A worked example: [`examples/willow-cottage/`](./examples/willow-cottage/), a
  fictional English smallholding on a hillside. 145 entities across every plane - an
  irregular six-cornered parcel carrying an elevation per corner, a two-storey stone
  cottage with a rear lean-to, a detached barn on a lower platform, fifteen rooms over
  three floors, eight outdoor zones, five boundary runs, two roads and four
  neighbouring parcels - together with the construction layer derived from it, so the
  spatial and cross-layer checks have something to check. Validate it with
  `npm run validate:examples`.

### Fixed

- `realm-config.schema.yaml` accepts every version the schema line accepts. Its
  `schema_version` shares the metamodel definition rather than carrying a list of its
  own, so a configuration targeting 2.2.0 validates.
- The reference validator checks `realm-config.yaml` against its schema, so a fault in
  the configuration is reported alongside the rest of the model.

## 2.2.0 - 2026-09-01

Published schema line moves to v2.2. `schema/v2.0/` is removed - v2.2 is the only
published line.

The reference validator ships as `npm run validate` / `realm-validate`, covering all five
layers: schema conformance per file, reference integrity and id uniqueness, spatial
invariants, semantic-to-construction consistency, and the domain rules. Apache-2.0, and
its only dependencies are ajv, ajv-formats and yaml.

### Breaking

- The `migration` entity is now `estate_change`: id prefix `MIG` -> `ECH`, root key
  `migrations:` -> `estate_changes:`, schema file `migration.schema.yaml` ->
  `estate-change.schema.yaml`. Every `*migration_ref*` field is renamed to
  `*estate_change_ref*` (`event.migration_ref`, `depends_on_migration_refs`,
  `recommendations.linked_migration_ref`). A model written against 2.1 must apply this
  rename to validate as 2.2.0.
- `event.event_type` enum value `migration-applied` -> `estate-change-applied`.
- `realm.schema.yaml` config key `migration_schema` -> `estate_change_schema`.

### Added

- `executions[]` on `estate_change` and `maintenance_task` - a record of what was
  carried out and when, embedded in place. Fields: `date` (required), `event_ref`,
  `cost_pln`, `note`. Last date, occasion count and cost totals are read from this list
  rather than stored beside it.
- `metamodel.execution` - the shared shape behind both.
- `metamodel.flexible_date` - a full calendar date, or a year and month when the day is
  not known. Lexicographic order stays chronological.
- `part_of_change_ref` on `estate_change` - the family a change belongs to. The parent
  carries the shared budget, goal and target condition; the member holds the edge, so a
  parent needs no list of children. Membership must not form a cycle.
- `variant_group` on `estate_change` - names a set of mutually exclusive scenarios.
  Exactly one branch is ever carried out.
- `changes[].actual_state` - what a change actually left behind, alongside `from_state`
  and `to_state`.
- `metamodel.estate_change_ref` and `metamodel.any_entity_ref` - shared reference types.
  An estate-change id accepts an optional trailing letter addressing one member of a
  family; every other prefix stays digits only.
- `schema_version` enum += `"2.2.0"`.

### Changed

- Three inlined copies of the cross-plane entity reference pattern resolve to
  `metamodel.any_entity_ref`.

## 2.1.0 - 2026-06-01

Additive and backward-compatible with 2.0.0.

### Added

- `schema_version` enum += `"2.1.0"`.
- Enum values: `equipment_type` +18 (snow-guard, alarm-keypad, heat-pump-indoor,
  heat-pump-outdoor, lawn-mower, multi-tool, scarifier, vacuum-cleaner, wheelbarrow,
  garden-supplies, power-drill, portable-ac, fire-pit, cooking-accessory, garden-hose,
  soaker-hose, drip-hose, sprinkler); `furniture_type` +outdoor-seating, +outdoor-shade;
  `outdoor_zone.zone_type` +forest-clearing, +gravel-area; network `node_type`
  +repeater, `device_type` +gateway, `link_type` +wifi-2.4ghz, +wifi-5ghz; `system_type`
  +network; care `activity_type` +mowing, `moisture_preference` +moderately-moist,
  `preferred_soil_types` +garden-mix; `person_type` +family-member.
- `x-` extension keys (`patternProperties: {"^x-": true}`) on equipment, building, room,
  outdoor_zone, system, planting, specimen, neighbor_property, shared_concern and issue.
- `positioned_element_ref` widened to accept wing, floor, room and planting.

## 2.0.0 - 2026-05-31

Initial published schema: dual-layer spatial model (semantic layer plus construction
layer), five planes, and the cross-cutting risk, event and change files.
