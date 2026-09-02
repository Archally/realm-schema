# Archally Realm Schema

YAML-based schema for modeling **private real estate**: a dual-layer spatial format covering physical topology, infrastructure systems, vegetation and garden care, maintenance operations, and surrounding context in a single machine-readable model.

[![npm version](https://img.shields.io/npm/v/@archally/realm-schema)](https://www.npmjs.com/package/@archally/realm-schema)
[![license](https://img.shields.io/npm/l/@archally/realm-schema)](./LICENSE)
[![CI](https://github.com/archally/realm-schema/actions/workflows/validate.yml/badge.svg)](https://github.com/archally/realm-schema/actions)

> **Status: the schema, the validator, the model-quality checker, the documentation and a
> worked example ship; two tools are still arriving.** What you get today is the complete
> v2.2 schema under [`schema/v2.2/`](./schema/v2.2/), the reference validator, the quality
> checker, four guides under [`docs/`](./docs/), and Willow Cottage. The model builder and
> renderer arrive in subsequent releases.

## Validating a model

```bash
npm install
npm run validate -- --model path/to/.realm/v2.2
```

Five layers run: each file against its schema, then reference integrity and id
uniqueness, then spatial invariants, semantic-to-construction consistency, and the domain
rules. Exit code 0 means valid (warnings may still be printed), 1 means errors, 2 means
the run itself failed.

Your editor can validate as you type, too: [`.vscode/settings.json`](./.vscode/settings.json)
maps each plane's files to its schema, and any JSON-Schema-aware editor can do the same.

## The worked example

[`examples/willow-cottage/`](./examples/willow-cottage/) is a fictional English
smallholding on a hillside, and the shortest route into the schema: 145 entities across
every plane, heavily commented, and valid.

```bash
npm run validate:examples
```

It is built to exercise the parts of the format that are easy to get wrong. The parcel is
an irregular hexagon with an elevation on each corner, so the ground genuinely falls -
6.4 m from the lane to the stream - and the vertical datum sits at the cottage rather than
at the highest corner, which is the choice that keeps every building's elevation readable.
A two-storey stone cottage with a rear lean-to shows how a building is the union of its
wings and why the roof belongs on the wing. Fifteen rooms carry walls and openings, and
the construction layer beneath them - wall segments, slabs and roof planes - is derived
from those rooms rather than drawn separately, which is what the cross-layer checks are
for. Four neighbouring parcels, two roads and five boundary runs put the plot in its
surroundings.

Two conventions are worth reading the example for, because both are easy to invert:
`position` is absolute and `footprint` is relative to it, while a boundary segment has no
position and so carries absolute vertices; and a wall segment is a directed line whose
`left_space_ref` and `right_space_ref` are read from that direction.

## Documentation

Three guides, and they answer different questions:

| Guide | Read it for |
|---|---|
| [File conventions](./docs/file-conventions.md) | Where a model's files go, which filenames the validator maps to a schema, and how the typed identifiers are formed |
| [Modeling guide](./docs/modeling-guide.md) | How to author a model: what to write first, the coordinate conventions and where they invert, the two spatial layers, and what a passing validation run does and does not claim |
| [Schema reference](./docs/schema-reference.md) | Every entity and every field. Generated from the schema itself, so it states what the validator enforces |
| [Model quality rules](./docs/model-quality.md) | What the quality checker reports and why each rule is worth acting on |

Every YAML example in the guides that names a file is validated against the shipped schema
in CI, as a real model rather than as a fragment. So an example you copy loads, and one that
would not fails the build before it reaches you.

## Checking a model's quality

Validation asks whether a model is legal and whether it holds together. A third question
is left over, and the schema cannot ask it: does the model actually say anything, in the
places the schema deliberately leaves optional?

```bash
npm run check -- --model path/to/.realm/v2.2
```

Fourteen rules today - a specimen with no care profile appears on no maintenance calendar,
a system with no parts recorded is a name with nothing behind it, a boundary run belonging
to no parcel appears on no site plan, a completed change that names nothing it touched is
the one record nobody can reconstruct later. Findings are reported rather than enforced:
each rule states an opinion about what makes a model useful, so nothing fails until you
pass `--strict`. The full list is in [the rule reference](./docs/model-quality.md).

## Reading a model as a graph

```bash
npm run model -- path/to/.realm/v2.2 --pretty
```

One JSON document: every entity with its type, plane and data, and every reference
resolved into a typed edge. This is the same graph the validator's rule layer and the
quality checker read, so a report you build on it and a finding the checker reports are
describing the same model rather than two YAML walks that agree until they do not.

Edge types say what the relationship IS, not what the target is called. A component is
`part-of` a system, a thermostat `controls` one, a maintenance task `maintains` it, a
boundary segment `borders` a parcel. The vocabulary is keyed by the entity type that
declares the field, which is what separates predicates that happen to share a spelling -
and a reference the vocabulary does not know still becomes an edge, typed from its name
and listed under `warnings`, because a missing edge reads as an entity that is simply
unconnected.

Point it at a model directory or at the project folder above it; both build the same
model.

## Rendering a model as documents

```bash
npm run render -- path/to/.realm/v2.2 --document all -o ./docs
```

Two markdown documents, because a property model has two readers.

**`property.md`** is what the property is and what has to be done to it: a containment
diagram of parcel, buildings, wings, floors, rooms and zones; rooms per building with their
areas and services; the grounds, the boundary and who is on the other side of it; the
installed systems with their parts and supply; the maintenance schedule grouped the way the
work is carried out; planned work grouped by status, with the risks and open issues; and the
people, obligations and warranties around it.

**`garden-care.md`** is what grows there and what it needs in which month: zones per parcel,
specimens and plantings with their species and condition, the soil profiles, and a
twelve-month calendar collating every care activity, soil amendment and seasonal threat the
model schedules.

Both carry a **model coverage** section built by running the quality rules, so a document
never offers a second opinion about a model the checker has already judged.

| Option | Effect |
|---|---|
| `--document property\|garden-care\|all` | which document to render; `all` needs `-o <directory>` |
| `--output`, `-o` | a file, or a directory when rendering both; stdout when omitted |
| `--title`, `-t` | document title; the model's own name by default |
| `--check` | compare against the output instead of writing, and exit non-zero if it differs |
| `--geometry` | enumerate the derived construction layer rather than summarising it |
| `--relations` | append the full relation table |
| `--no-coverage` | omit the model coverage section |

**A rendered document carries no timestamp**, so re-rendering an unchanged model produces
the same bytes. That is what makes `--check` worth wiring into CI: a document committed
beside its model either still describes it or fails the build.

The derived construction layer - wall segments, roof planes, slabs - is summarised rather
than listed. It is a third of the worked example's entities and is computed from the rooms
and wings above it, so listing it first would bury the property in its own scaffolding.
`--geometry` prints it when you are auditing that layer.

## Moving a model to a newer schema version

```bash
npm run schema-update -- path/to/.realm/v2.1 --dry-run   # preview
npm run schema-update -- path/to/.realm/v2.1             # apply
npm run schema-update:list                               # every available update
```

This repository publishes **one** schema version at a time - a superseded line is not kept
alongside the current one - so a model written against an earlier release has no directory
left to validate against. This tool is the route forward.

| Update | What it does to a model |
|---|---|
| 2.0 to 2.1 | Nothing. 2.1 added enum values, optional fields and `x-` extension keys and removed nothing, so a valid 2.0 document is a valid 2.1 document. Only the declared version moves |
| 2.1 to 2.2 | Renames the migration entity to `estate_change`: `MIG###` ids become `ECH###`, `migrations.yaml` becomes `estate-changes.yaml`, `migrations:` becomes `estate_changes:`, and every `*migration_ref*` field takes the new name |

A model two versions behind receives both in one run, in order.

**The version comes from `realm.yaml`, not from the directory name.** A realm model directory
is named for the model's own line rather than for the schema's, so a current model can
legitimately sit in `v1/`. When the two disagree, the tool says so and follows the file.

**Ids are rewritten in descriptions and tags as well as in reference fields.** An identifier
appears wherever somebody wrote about the work, and migrating only the reference fields
would leave the prose pointing at entities the model no longer contains. The two are counted
separately and both are shown before anything is written:

```
101 rewrite(s) in reference fields, 183 in descriptions, notes and tags
```

The id pattern requires three digits, so text that merely begins the same way is left alone -
a `MIG/MAG` welder keeps its name. Anything holding `MIG` without a complete id is reported
with the line it sits on, for you to judge.

Preview with `--dry-run` first, and validate afterwards:

```bash
npm run validate -- --model path/to/.realm/v2.2 --schemas schema/v2.2
```

## What is a Realm model?

A **realm** is a single formal model of a property - what physically exists, what systems serve it, what grows there, how it is maintained, and what surrounds it. It is expressed as plain YAML files organized into five planes plus cross-cutting concerns.

| Plane | Question | Key entities |
|-------|----------|--------------|
| **Topology** | What exists physically? | parcels, buildings, wings, floors, rooms, outdoor zones, boundaries, construction geometry |
| **Infrastructure** | What systems serve it? | systems, components, utility connections, network nodes, IoT devices |
| **Nature** | What grows here, and how is it cared for? | specimens, plantings, biomass flows, species care profiles, soil profiles |
| **Operations** | How is it maintained? | maintenance tasks, cost categories, warranties, regulations |
| **Context** | What surrounds it? | neighbours, surroundings, environmental factors, persons |

Cross-cutting: estate changes, risks/issues, and a chronological event log.

**Dual-layer spatial model:** a *semantic layer* (human-authored rooms, walls, openings) and a *construction layer* (deterministic wall segments, floor slabs, roof planes) - so a model rich enough to draw an accurate plan is also rich enough for spatial reasoning.

## Schema

- **Version:** 2.2.0 (JSON Schema draft 2020-12, expressed in YAML)
- **Methodology:** GDSM v1.0 (Goal-Driven Schema Modeling)
- **Location:** [`schema/v2.2/`](./schema/v2.2/) - root composition + `metamodel`, `estate-change`, `risks`, `events`, `realm-config`, and per-plane subfolders (`topology/`, `infrastructure/`, `nature/`, `operations/`, `context/`, `visualization/`).

Each plane's data files are validated independently against their own schema; cross-cutting files validate against `estate-change`, `risks`, and `events`.

v2.2 is the only published line. Models written against 2.1 need the `migration` → `estate_change` rename; see the [changelog](./CHANGELOG.md).

## License

**Dual-licensed** - [LICENSE](./LICENSE) is the authoritative map, and
[tools/LICENSE](./tools/LICENSE) names every tool directory. The schema, the examples and
the documentation are [Apache-2.0](./LICENSE-APACHE), and so is every tool that establishes
conformance or protects this distribution: the validator, the documentation-snippet
validator, the port verifier and the schema updater. The tools that read a model for some
other purpose - the model builder, the quality checker and its rules, the render kit and the
renderer - are [FSL-1.1-ALv2](./LICENSE-FSL), converting to Apache-2.0 two years after each
release.

The line is between conformance and judgement. Whether a model is *valid*, whether it is
the model that was published, and how it crosses from one published version to the next are
all properties of the format and must be freely exercisable by anyone. Whether a model is
*good*, what its edges mean and what a document about it should say are modeling opinions,
and those are the product. A directory in neither list is an omission, not a permission.

© 2026 Adam Walkowski. Part of the [Archally](https://archally.pro) family of modeling schemas (alongside [blueprint-schema](https://github.com/archally/blueprint-schema) and [brandvoice-schema](https://github.com/archally/brandvoice-schema)).
