# Changelog

All notable changes to `@archally/realm-schema`. Versions follow the schema version:
a model declaring `schemaVersion: "2.3.0"` validates against `schema/v2.3/`, and so does one
still declaring `2.2.0`, because 2.3 removed nothing.

## 2.3.0 - 2026-09-04

**Additive.** Every model valid under 2.2.0 validates unchanged under 2.3.0. The claim was
tested, not asserted: the 2.2.0 worked example as published in 2.2.9 was validated against
this schema before it was regenerated. `schema/v2.2/` is gone from this repository, as one
version is published at a time; `npm run schema-update` moves a 2.2 model's declaration, and
nothing else in it needs to change.

### Added

- **`lifecycle`** on `specimen`, `planting`, `component`, `iot_device`, `maintenance_task`,
  `warranty`, `person` and `estate_change`: `state` (`active` / `retired` / `superseded`),
  `retired_at`, `retired_reason`, `superseded_by`. Absent means active. A thing that ended
  keeps its record, so every reference to it keeps resolving. The contract for readers
  travels in the field's description: a retired or superseded entity is left out of lists,
  graphs and generated documents by default, and a reader that leaves them out says how many
  it left out. The model-quality checker does both from this release (`Excluded: N` in its
  header, `excluded_retired` in its JSON).
- **`estate_change.changes[].outcome`** (`done` / `superseded` / `abandoned`): how one item
  of a change ended when the change's own status does not say.
- **How a coordinate is known**: `position_accuracy_m`, `position_source` (`surveyed` /
  `tape` / `gps` / `estimated`) and `position_derived_from` beside `position` on `parcel`,
  `building`, `outdoor_zone`, `specimen`, `planting`, `neighbor_property`, `equipment`,
  `component`, `iot_device` and `network_node`.
- **The georeference as fields** on `coordinate_system`: `origin_wgs84`, `origin_projected`
  (EPSG code, northing, easting), `origin_elevation_m`, `elevation_datum`. The description of
  `north_angle_degrees` now states the axis convention in words: the bearing of +Y is 360
  minus the angle, and +X lies 90 degrees to the left of +Y.
- **`shared_edges[]`** on `parcel`, `outdoor_zone`, `planting` and `boundary_segment`: one edge
  of this outline lies on another element's edge and follows it when that edge moves. A lawn
  set to meet three neighbours was a rectangle whose overlap with them nothing recorded.
- **`neighbor_property.features[]`**: the things on a neighbour's land beyond the one
  building `position` and `footprint` describe - a shed, a hedge, a row of trees, a fence -
  each with a kind, dimensions, a position, an optional relative footprint and the boundary
  segment it runs along.
- **`metamodel.derivation`** (`derived_from`, `derived_on`): where a value came from when it
  was not measured on site.
- **`furniture.outdoor_zone_ref`**: a piece that belongs to no building and no room stands in
  an outdoor zone.
- **`members[]`** on `planting` and `component`: one placed unit per entry for a record that
  stands for several identical things, each with its own position; **`member_of_ref`** on
  `specimen` and `component` for a unit promoted out of its group.
- **`epic`** (`EPK###`, root key `epics:` in `estate-changes.yaml`): a named group of estate
  changes with a display order; **`estate_change.epic_refs`**, most specific first.
- **The wiring inside the walls.** An electrical installation is modelled as `component`s of
  the electrical system, classified by `metamodel.electrical_component_type`
  (`distribution-panel`, `protective-device`, `circuit`, `junction-box`, `socket-outlet`,
  `switch`, `lighting-fixture`, `cable-end`) and joined by `circuit_ref`, `protected_by_ref`
  and `fed_from_ref`. `component_type` stays free text; a component that uses one of the
  three references is held to the vocabulary. `unit_count` lets one record stand for several
  identical units. A component can be placed on a wall of the construction layer:
  `wall_segment_ref`, `wall_offset_cm` from the wall's start, `mounting_height_cm` above the
  finished floor; `outdoor_zone_ref` for one outside every building.
- **`cable_run`** (`CBR###`, root key `cable_runs:` in the systems file): a run or riser with a
  topological half (`run_type`, `from_ref`, `to_ref`, `circuit_refs`, `through_refs`) and a
  geometric one, `route.legs[]` in three kinds that each name their frame: `along-wall`
  (centimetres along a wall, height above the floor), `vertical` (elevations above the
  datum), `free` (a polyline in model metres). Either half validates alone.
- **`lighting_group.circuit_ref`**: the circuit a room's lighting is on.
- **`outdoor_zone.zone_type: path`**, and eight `equipment.equipment_type` values:
  `branch-shredder`, `lawn-roller`, `levelling-grid`, `spreader`, `garden-cart`,
  `satellite-dish`, `pressure-washer`, `cable-reel`.
- **The `enum-borrowed` tag**: the one tag with a fixed meaning, marking an entity whose enum
  value was borrowed from the nearest fit so the gap can be found by query.
- **`realm-schema-update`: 2.2 to 2.3.** Additive, so it moves the declared version and nothing
  else, and the tool says so.

### Rules

The validator's semantic layer and the model-quality pack grow together:

- **Electrical topology** (validator): `feed-cycle` (error), `circuit-refs-not-circuits`,
  `circuit-crosses-building`, `anchor-wall-off-room`, `anchor-beyond-wall`, `leg-beyond-wall`,
  `leg-wall-off-route` (warnings), `riser-without-vertical-leg` (info).
- **Lifecycle and membership** (validator): `retired-referenced-by-live`,
  `superseded-without-successor`, `promoted-member-still-listed`, `members-exceed-count`,
  `member-of-cycle` (error), `epic-order-not-unique`; `gps-position-without-georeference`;
  `shared-edge-does-not-meet`, which reads both outlines in absolute coordinates and reports
  a declared shared edge the geometry contradicts.
- **Estate changes** (validator): an `add` item of a completed change needs an `entity_ref`
  unless its `outcome` says nothing was created; a `done` item on a change not yet approved,
  and a change retired while still scheduled, are each reported.
- **Five presence rules in the pack** (`realm-check`): `circuit-without-protection`,
  `protective-device-without-source`, `terminal-without-circuit`, `run-without-circuit`,
  `electrical-requirement-without-system`.

### Changed

- **The model-quality checker leaves ended records out and says how many.** Entities whose
  `lifecycle.state` is `retired` or `superseded` are dropped, with the edges touching them,
  before any rule runs.
- **The relation vocabulary** (`tools/model-builder/relation-types.mjs`) gains the edges the
  new references make - `position-derived-from`, `shares-edge-with`, `feature-along`,
  `member-of`, `belongs-to`, and the electrical `circuit_ref` / `protected_by_ref` /
  `fed_from_ref` - and `system.zone_ref` now reads `serves` rather than `located-in`: a
  distribution zone is where a system delivers, not where it stands.
- **`spatial_relations` are edges in the model builder.** A row in the topology plane declares a
  relation directly, carrying its predicate as data (`relation_type`) rather than in a field
  name, so a graph built from this package now holds every relation the model states.
- **A ceiling slab is a floor slab.** `construction.schema.yaml` defines the `ceiling_slab` key as
  `$ref: "#/$defs/floor_slab"`: the key says where the slab sits, the reference says what it is.
  Both keys extract as `floor_slab` entities, and which role a slab plays stays where the schema
  puts it, in its own `slab_type`. `undescribed-authored-entity` names the construction types it
  excludes accordingly.
- **An opening that does not open `overlooks`.** A room with a terrace door and a fixed pane onto
  one zone has two edges asserting different things - passage and a view - rather than one
  predicate twice. The distinction comes from the opening's `openable` and `opening_type`.
- **An edge is a fact, not a count.** Two nested objects stating the same relation, such as a wall
  whose two openings both name the room they were cut from, produce one edge. The relation id
  carries the predicate beside source, field and target, so two edges between one pair that assert
  different things both survive.
- The worked example declares 2.3.0, sits at `examples/willow-cottage/.realm/v2.3/`, and its
  distribution board is a `distribution-panel`, the vocabulary's word. The four guides and the
  schema reference describe v2.3.

### Known limitations

- The renderer and the model builder still show ended records; leaving them out, with the
  count, arrives in a later release. The worked example has none, so its documents are
  unaffected.
- `component` reaches 36 properties: one type with electrical roles rather than eight types.
- `estate_change.changes[].entity_ref` and `affected_entity_refs[]` are plain strings;
  tightening them to the typed reference pattern would be a narrowing and waits for a major.

## 2.2.9 - 2026-09-03

### Changed

- **Two more types accept extension properties.** `component` and `neighbor_property` now accept
  properties prefixed `x-`, as `boundary_segment` already did. Additive: a model valid under any
  earlier 2.2.x release stays valid. Both changes reached `schema/v2.2/` in the two previous
  releases without an entry of their own; this entry records them, since a schema that changed
  without a record reads as one that did not change.

A NOTE ON TAGS. This repository carried no git tags before this release. Tags begin at `v2.2.9`;
earlier releases are told apart by the version in `package.json` and by this file.

## 2.2.8 - 2026-09-02

### Added

- **`tools/schema-update/` and the `realm-schema-update` binary** - moves a model from one
  published schema version to the next. This repository publishes one schema version at a
  time, so a model written against an earlier release has no directory left to validate
  against and no route forward but a rename carried out by hand.

  Two updates ship: **2.0 to 2.1**, which changes nothing in a model because 2.1 was purely
  additive, and **2.1 to 2.2**, which renames the migration entity to `estate_change`
  throughout. A model two versions behind receives both in one run.

  Identifiers are rewritten in descriptions and tags as well as in reference fields, because
  an id appears wherever somebody wrote about the work; the two classes are counted
  separately and both are reported before anything is written. The id pattern requires three
  digits, so a `MIG/MAG` welder keeps its name, and anything holding `MIG` without a
  complete id is reported with the line it sits on rather than rewritten.

  The version is read from `realm.yaml` rather than from the directory name, because a realm
  model directory is named for the model's own line and a current model can legitimately sit
  in `v1/`. When the two disagree the tool says so and follows the file.

  **Apache-2.0**, with the validator and the port verifier: crossing between two published
  versions of a format is a property of the format.

### Changed

- The README's licence summary named a tool list that had fallen three tools behind the
  licence map. It now states the criterion and points at the map.

## 2.2.7 - 2026-09-02

### Added

- `tools/port/verify-ported.mjs` and its tests - the tool a recipient runs to confirm the
  files they received are the files that were published. It compares the shipped tree
  against the hash manifest distributed with it, needs nothing but this repository, and CI
  runs it along with its own adversarial tests.

### Changed

- **The licence map names every tool directory.** `tools/port/` is Apache-2.0, with the
  validator rather than with the tooling: it describes no realm and reads no model, and
  it is what a recipient runs to confirm they received what was published.
- Both licence files now state **where the line falls**, so a tool added later has
  something to classify itself against: Apache-2.0 covers the format and what is needed
  to establish conformance with it, plus this distribution's integrity; FSL covers
  everything that reads a model for a purpose other than validating it. `tools/LICENSE`
  says outright that a directory in neither list is an omission, not a permission.

## 2.2.6 - 2026-09-02

### Added

- A renderer: `npm run render -- <dir> --document all -o <directory>`, or `realm-render`.
  Two markdown documents with embedded Mermaid diagrams - **`property.md`**, what the
  property is and what has to be done to it, and **`garden-care.md`**, what grows there and
  what it needs in which month, including a twelve-month calendar collating every care
  activity, soil amendment and seasonal threat the model schedules.
- `--check`, which compares a document against the model instead of writing it and exits
  non-zero when the two have parted. Rendering reads no clock, so an unchanged model
  produces the same bytes and a committed document can be gated in CI.
- A **render kit** under `tools/render-kit`, holding the projections both documents are
  built from: the containment tree, maintenance grouped by kind, planned work grouped by
  status, the care calendar, vegetation per zone and systems with their parts. Available to
  anything building its own view of a model.
- The worked example now ships its two rendered documents at
  `examples/willow-cottage/.specs/`.

### Changed

- A built model carries the model's own identity from `realm.yaml` - name, description,
  location, declared schema version - under `realm`, so a consumer reading the graph can say
  which property the entities belong to.
- The model quality section of `property.md` runs the published rule pack rather than any
  logic of its own, so a document and `realm-check` cannot disagree about one model.

## 2.2.5 - 2026-09-01

### Added

- A model builder: `npm run model -- <dir>`, or `realm-model`. One JSON document holding
  every entity with its type, plane and data, and every reference resolved into a typed
  edge - the same graph the quality checker reads, so a report built on it and a finding
  the checker reports describe the same model.
- The **relation vocabulary** that types those edges, keyed by the entity type declaring
  the field. An edge says what the relationship IS rather than what the target is called:
  a component is `part-of` a system, a thermostat `controls` one, a task `maintains` it.
  A reference the vocabulary does not know still becomes an edge, typed from its name and
  reported under `warnings`.

### Changed

- The quality rules now select on those relation names, so a rule reads as a statement
  about the domain: the system rule asks whether anything is `part-of` a system rather
  than whether an edge called `system` exists.
- `boundary-segment-without-parcel` checks `parcel_refs` directly. A boundary segment
  borders parcels and it borders neighbouring properties, and both are `borders` - so an
  edge test would have been satisfied by a segment naming only a neighbour, which is the
  case the rule exists to report.
- `risk-without-mitigation` reports what it checks. It described itself as also looking
  for a planned change addressing the risk; a risk's only reference field points at what
  it threatens, and no field in either direction records a change as addressing one, so
  that half could never have matched. State the acceptance in `mitigation`.

### Fixed

- A model opened at the project folder rather than at the `.realm/v<N>` directory built a
  silently smaller model - file paths one segment longer than the schema mapping expects,
  so files whose collection key is singular stopped being recognised and their entities
  were dropped. Both now build the same model.
- Entity planes are read from the nearest plane directory rather than the first path
  segment, so they no longer depend on which directory the model was opened at.

## 2.2.4 - 2026-09-01

### Added

- Seven more model-quality rules, taking the pack from seven to fourteen and reaching the
  operations plane for the first time - the plane the maintenance calendar, the schedule
  planner and the compliance view are all built from, where a gap renders as an empty
  artifact rather than a slightly poorer one. A system that no maintenance task targets
  appears on no calendar; a component with no installation date, expected lifespan or
  warranty supports no replacement estimate; a regulatory requirement states how often it
  recurs but anchors to no date, so its schedule resolves to no deadline; a cost category
  with no budget estimate can be totalled but not compared; an IoT device that neither
  monitors nor controls a system is inventory rather than instrumentation; a care profile
  with no calendar leaves everything pointing at it unscheduled. And an estate change that
  has started or finished while naming nothing it affected loses what it touched - the one
  gap here that cannot be filled later by looking at the property.

### Changed

- `system-without-components` is now **`system-without-parts`**, and says so. A part
  reaches its system as a `component` or as an `equipment` record carrying `system_ref`,
  and the schema admits both for membership - so the rule accepted either all along while
  its name and message promised to count components. The behaviour is unchanged; what it
  reports is now what it checks.
- `undescribed-authored-entity` reads prose wherever the schema puts it. Several types
  carry authored text in a field of their own - `instructions` on a maintenance task,
  `texture_description` on a soil profile, `mitigation` on a risk, `technique` inside a
  care profile's pruning guide - and an entity using the field its own type provides is
  documented, not undescribed. Its message no longer claims a reader gets nothing but the
  name; it reports the absence of a description or an equivalent field.

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
