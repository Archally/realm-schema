# Archally Realm Schema

YAML-based schema for modeling **private real estate** — a dual-layer spatial format covering physical topology, infrastructure systems, vegetation and garden care, maintenance operations, and surrounding context in a single machine-readable model.

[![npm version](https://img.shields.io/npm/v/@archally/realm-schema)](https://www.npmjs.com/package/@archally/realm-schema)
[![license](https://img.shields.io/npm/l/@archally/realm-schema)](./LICENSE)
[![CI](https://github.com/archally/realm-schema/actions/workflows/validate.yml/badge.svg)](https://github.com/archally/realm-schema/actions)

> **Status: the schema and the validator ship; the rest is still coming.** What you get
> today is the complete v2.2 schema under [`schema/v2.2/`](./schema/v2.2/) and the
> reference validator. A worked example, the remaining tools (semantic checker, model
> builder, renderer) and the full documentation arrive in subsequent releases.

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

## What is a Realm model?

A **realm** is a single formal model of a property — what physically exists, what systems serve it, what grows there, how it is maintained, and what surrounds it. It is expressed as plain YAML files organized into five planes plus cross-cutting concerns.

| Plane | Question | Key entities |
|-------|----------|--------------|
| **Topology** | What exists physically? | parcels, buildings, wings, floors, rooms, outdoor zones, boundaries, construction geometry |
| **Infrastructure** | What systems serve it? | systems, components, utility connections, network nodes, IoT devices |
| **Nature** | What grows here, and how is it cared for? | specimens, plantings, biomass flows, species care profiles, soil profiles |
| **Operations** | How is it maintained? | maintenance tasks, cost categories, warranties, regulations |
| **Context** | What surrounds it? | neighbours, surroundings, environmental factors, persons |

Cross-cutting: estate changes, risks/issues, and a chronological event log.

**Dual-layer spatial model:** a *semantic layer* (human-authored rooms, walls, openings) and a *construction layer* (deterministic wall segments, floor slabs, roof planes) — so a model rich enough to draw an accurate plan is also rich enough for spatial reasoning.

## Schema

- **Version:** 2.2.0 (JSON Schema draft 2020-12, expressed in YAML)
- **Methodology:** GDSM v1.0 (Goal-Driven Schema Modeling)
- **Location:** [`schema/v2.2/`](./schema/v2.2/) — root composition + `metamodel`, `estate-change`, `risks`, `events`, `realm-config`, and per-plane subfolders (`topology/`, `infrastructure/`, `nature/`, `operations/`, `context/`, `visualization/`).

Each plane's data files are validated independently against their own schema; cross-cutting files validate against `estate-change`, `risks`, and `events`.

v2.2 is the only published line. Models written against 2.1 need the `migration` → `estate_change` rename; see the [changelog](./CHANGELOG.md).

## License

[Apache-2.0](./LICENSE) — © 2026 Adam Walkowski. Part of the [Archally](https://archally.pro) family of modeling schemas (alongside [blueprint-schema](https://github.com/archally/blueprint-schema) and [brandvoice-schema](https://github.com/archally/brandvoice-schema)).
