# Realm File Conventions

Where the files of a realm model go, what each one holds, and how entities are named. These rules
apply to every model regardless of size: a single flat and a country estate use the same layout.

The companion documents are the [modeling guide](./modeling-guide.md), which covers how to author a
model, and the [schema reference](./schema-reference.md), which lists every entity and field.

---

## Where a model lives

A realm model is a directory named for the schema version it is written against:

```
willow-cottage/
  .realm/v2.2/
    realm.yaml
    realm-config.yaml
    topology/
    infrastructure/
    nature/
    operations/
    context/
    estate-changes.yaml
    risk-register.yaml
    events.yaml
```

The `.realm/` segment keeps the model beside the thing it describes without colliding with anything
else in that directory. The version segment is the whole version, `v2.2`, not `v2`: a model states
which schema line it was authored against, and two lines can sit side by side during a migration.

Nothing about the parent directory is prescribed. A model can live in its own repository, beside a
property's photographs and deeds, or in a directory of many estates.

## The file map

The validator resolves each file to its schema by **exact relative path**. These twenty one names
are the whole map:

| File | Holds | Schema |
|---|---|---|
| `realm.yaml` | model metadata: version, name, location, climate, vertical datum | `realm.schema.yaml` |
| `realm-config.yaml` | inference, validation and rendering settings | `realm-config.schema.yaml` |
| `topology/estate.yaml` | `parcels`, `buildings`, `wings`, `floors`, `rooms`, `outdoor_zones` | `topology/estate.schema.yaml` |
| `topology/boundary.yaml` | `boundary_segments` | `topology/boundary.schema.yaml` |
| `topology/spatial.yaml` | `coordinate_system`, `spatial_relations` | `topology/spatial.schema.yaml` |
| `topology/equipment.yaml` | `furnitures`, `equipments` | `topology/equipment.schema.yaml` |
| `topology/tools.yaml` | `tools` | `topology/tools.schema.yaml` |
| `infrastructure/systems.yaml` | `systems`, `components`, `utility_connections` | `infrastructure/systems.schema.yaml` |
| `infrastructure/network.yaml` | `network_nodes`, `iot_devices`, `network_links` | `infrastructure/network.schema.yaml` |
| `nature/vegetation.yaml` | `specimens`, `plantings` | `nature/vegetation.schema.yaml` |
| `nature/care.yaml` | `care_profiles` | `nature/care.schema.yaml` |
| `nature/soil.yaml` | `soil_profiles` | `nature/soil.schema.yaml` |
| `nature/biomass.yaml` | `biomass_flows` | `nature/biomass.schema.yaml` |
| `nature/recommendations.yaml` | `planting_recommendations` | `nature/recommendations.schema.yaml` |
| `operations/maintenance.yaml` | `maintenance_tasks`, `notification_rules`, `cost_categories` | `operations/maintenance.schema.yaml` |
| `operations/compliance.yaml` | `warranties`, `regulatory_requirements` | `operations/compliance.schema.yaml` |
| `context/surroundings.yaml` | `neighbor_properties`, `shared_concerns`, `environmental_factors`, `roads` | `context/surroundings.schema.yaml` |
| `context/persons.yaml` | `persons` | `context/persons.schema.yaml` |
| `estate-changes.yaml` | `estate_changes` | `estate-change.schema.yaml` |
| `risk-register.yaml` | `risks`, `issues` | `risks.schema.yaml` |
| `events.yaml` | `events` | `events.schema.yaml` |

**Only `realm.yaml` is required**, and only its `version` and `name` fields within it. Every other
file is optional: a model that describes a garden and nothing else has a `nature/` directory and no
`infrastructure/`. An absent file is not an incomplete model, it is a model that makes no claim
about that plane.

Each file's top-level keys are the collections listed above, and each collection is a list. A file
may carry any subset of its keys, so `topology/estate.yaml` with only `parcels:` is valid.

## The construction directory

`topology/construction/` is the one place where filenames are free. Every `.yaml` file directly
under it is validated against `topology/construction.schema.yaml`, whatever it is called:

```
topology/construction/
  BLD001.yaml     wall segments and roof planes of a building
  FLR001.yaml     wall segments and slabs of one floor
  FLR002.yaml
```

Naming each file after the entity whose geometry it holds is the convention, because a construction
file is generated from exactly one floor or building and a reader looking for a room's walls should
be able to guess the filename. The schema does not enforce it.

Each file names its subject through `floor_ref` or `building_ref`, and every construction file
requires `generated_from`, which records what the geometry was derived from. Construction geometry
is derived from the semantic layer rather than drawn independently, and `generated_from` is where
that provenance is stated. The [modeling guide](./modeling-guide.md) covers the two layers and how
one produces the other.

## Configuration is not model

`realm-config.yaml` sits beside the model rather than in it. It holds the tolerances validation
applies, the defaults geometry inference uses, and rendering preferences. It carries its own
`schema_version` and is validated against `realm-config.schema.yaml` like any other file, but it
contributes no entities.

Any file whose name ends in `-config.yaml` is treated the same way: settings for a tool that reads
the model, not part of the model. That is what makes a per-tool configuration file legal beside a
model without the validator reporting it as content nothing governs.

## Files the map does not know

A file under the model directory whose relative path is not in the map above, and which is not a
`-config.yaml`, is still **loaded**. Its entities join the model and take part in reference
resolution, id uniqueness, spatial checks and the domain rules. What does not happen is schema
validation: nothing knows which schema governs it, so its shape is unchecked.

The validator says so rather than staying silent:

```
ℹ [L1-UNMAPPED] operations/maintenance-extra.yaml: No schema governs this file, so nothing validated it
```

This is reported at info severity and does not fail the run, because a file the map does not know is
not by itself an error. Treat it as one when it holds model content: a typo in a field name inside
such a file passes every layer, and the entity it defines is still counted. Keep model content in
the mapped filenames.

## Typed identifiers

Every entity carries an `id` whose prefix names its type. The prefix is uppercase, the number is at
least three digits, and the two together are unique across the whole model, not merely within a
file.

| Plane | Prefixes |
|---|---|
| Topology | `LP` parcel · `BLD` building · `WNG` wing · `FLR` floor · `RM` room · `OZ` outdoor zone · `BS` boundary segment · `FRN` furniture · `EQP` equipment · `TL` tool |
| Topology, construction layer | `WSG` wall segment · `SLB` floor or ceiling slab · `RFP` roof plane |
| Infrastructure | `SYS` system · `CMP` component · `UC` utility connection · `NN` network node · `IOT` device · `NL` network link |
| Nature | `SPM` specimen · `PTG` planting · `SCP` species care profile · `SOIL` soil profile · `BMF` biomass flow · `REC` planting recommendation |
| Operations | `MT` maintenance task · `NR` notification rule · `CC` cost category · `WRT` warranty · `REG` regulatory requirement |
| Context | `NP` neighbour property · `SC` shared concern · `EF` environmental factor · `PRS` person or organisation · `RD` road corridor |
| Cross-cutting | `ECH` estate change · `RSK` risk · `ISS` issue · `EVT` event |

Thirty nine types. A reference field names the type it accepts, so `parcel_ref` takes an `LP` id and
nothing else, and the validator rejects a well-formed id of the wrong type as firmly as a malformed
one. Fields that deliberately accept any entity take any of these prefixes.

`ECH` ids may carry a trailing lowercase letter, as in `ECH009a`. That marks alternative scenarios
for one planned change: three mutually exclusive ways to re-roof the barn are `ECH009a`, `ECH009b`
and `ECH009c` rather than three unrelated changes.

### Scoping an id

An id may be prefixed with a lowercase namespace and a dot:

```yaml
parcel_ref: north-farm.LP001
```

Scoping exists so that models can be combined without their ids colliding. Within one model it is
unnecessary, and mixing scoped and unscoped forms for the same entity makes two ids where there
should be one. Choose one and hold it.

### Numbering

Numbers are allocated in order per type and never reused. A deleted entity's number stays retired,
because references to it may survive in documents outside the model, and a recycled id makes an old
reference point at something new without appearing to have changed.

## Extension fields

Several entity types accept fields beginning with `x-`, which the schema does not otherwise define:

```yaml
x-council-reference: "PLN/2024/00871"
```

Everything else is closed. An unrecognised field is an error rather than a warning, which is what
makes a misspelled field name findable. The [schema reference](./schema-reference.md) states per
entity whether `x-` fields are accepted.

## A minimal model

Two files are enough to validate:

#### `realm.yaml`

```yaml
version: "1.0.0"
schemaVersion: "2.2.0"
name: Willow Cottage
description: >
  A smallholding on a hillside. Enough of a model to validate, and the point at
  which to start adding the planes that matter for the question being asked.
```

#### `topology/estate.yaml`

```yaml
parcels:
  - id: LP001
    name: Willow Cottage smallholding
    area_sqm: 400
    position: {x: 10, y: 10}
    footprint:
      shape: polygon
      vertices:
        - {x: -10, y: -10}
        - {x: 10, y: -10}
        - {x: 10, y: 10}
        - {x: -10, y: 10}
    elevation_m: 0
    description: A square plot of 400 m², level, with the cottage at its centre.
```

Grow it a plane at a time. The order that works is topology first, because almost everything else
refers to a room, a zone or a building; then whichever plane answers the question the model is being
built for.

The worked example in [`examples/willow-cottage/`](../examples/willow-cottage/) is the same model
carried to 145 entities across every plane, and is the fastest way to see what a fully populated
file looks like.

## Formatting

- **Two-space indentation**, no tabs. YAML rejects tabs for indentation.
- **`snake_case`** for every field name. Entity ids are the only uppercase.
- **Quote what could be read as something else.** `schemaVersion: "2.2.0"` and dates need quotes;
  names and descriptions usually do not.
- **Folded scalars for prose.** A `description` that runs past the line width reads better as `>`
  than as one long line.
- **Comments are part of the model's value.** The schema records what a field means; a comment
  records why this value. Where a number was measured, where it was estimated, and which of two
  plausible readings of a boundary was taken are the things a reader of the model cannot recover.
