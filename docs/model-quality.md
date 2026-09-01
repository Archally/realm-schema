# Realm Model Quality Rules

Three questions can be asked of a realm model, and they are asked by three different things. **Is it legal?** - the validator's first two layers: each file against its schema, references resolving, identifiers unique. **Does it hold together?** - the validator's remaining three: geometry, semantic-to-construction consistency, and the domain rules. **Does it say anything?** - these rules.

The third question is separate because the schema cannot ask it. A field the schema **requires** is settled by validation, and a rule about it here could never fire. A field the schema leaves **optional** is exactly where a model degrades without ever going red: valid, loadable, and saying less each year. Every rule below targets an optional field or an absent relation, and that is asserted by a test rather than intended - each one must fire against a fixture the validator accepts.

```bash
npm run check -- --model path/to/.realm/v2.2      # report
npm run check -- --model path/to/.realm/v2.2 --strict   # treat findings as a gate
npm run check -- --model path/to/.realm/v2.2 --rule specimen-without-care-profile
```

Findings are reported, not enforced. A rule here states an opinion about what makes a model useful, and a project that disagrees with one is not holding a broken model - which is why nothing fails until `--strict` says it should.

## The rules

| Rule | Applies to | Severity |
|---|---|---|
| [`boundary-segment-without-parcel`](#boundary-segment-without-parcel) | every `boundary_segment` | warn |
| [`estate-change-without-cost`](#estate-change-without-cost) | every `estate_change` | info |
| [`planting-without-care-profile`](#planting-without-care-profile) | every `planting` | warn |
| [`risk-without-mitigation`](#risk-without-mitigation) | every `risk` | info |
| [`specimen-without-care-profile`](#specimen-without-care-profile) | every `specimen` | warn |
| [`system-without-components`](#system-without-components) | every `system` | warn |
| [`undescribed-authored-entity`](#undescribed-authored-entity) | every entity, except `wall_segment`, `roof_plane`, `floor_slab`, `ceiling_slab` | info |

7 rules.

### boundary-segment-without-parcel

**warn** - reported; fails only under `--strict`. Applies to every `boundary_segment`.

What you will see:

```
Boundary segment "{id}" ({name|'unnamed'}) borders no parcel - it belongs to no site plan.
```

A boundary run states which parcels it borders, and a segment between two parcels names both. Without any, the run has no place in the estate: it cannot be assigned to a site plan, and a question about which fences belong to this property cannot be answered from the model. `parcel_refs` is optional because a boundary can be surveyed before the parcels it divides are recorded.

### estate-change-without-cost

**info** - reported; fails only under `--strict`. Applies to every `estate_change`.

What you will see:

```
Estate change "{id}" ({name|'unnamed'}) carries no cost estimate - it cannot be sequenced against a budget.
```

Planned work without an estimate cannot be sequenced against a budget, which is one of the two things an estate-change register exists for. Info rather than warn because an early-stage change legitimately has no number yet, and because a change already applied has a real cost recorded elsewhere.

### planting-without-care-profile

**warn** - reported; fails only under `--strict`. Applies to every `planting`.

What you will see:

```
Planting "{id}" ({name|'unnamed'}) has no care profile - the whole group appears on no maintenance calendar.
```

The same gap as `specimen-without-care-profile`, one level up: a planting is a categorical group rather than an individual, and it carries the care needs of everything in it. An unlinked planting silently removes a whole bed or hedge from the maintenance calendar rather than one plant.

### risk-without-mitigation

**info** - reported; fails only under `--strict`. Applies to every `risk`.

What you will see:

```
Risk "{id}" ({name|'unnamed'}) records no mitigation and no planned change addressing it.
```

A recorded risk with no mitigation and no planned change addressing it is a worry written down rather than a decision taken. Info rather than warn: accepting a risk is a legitimate answer, and a register whose purpose is partly to hold the accepted ones would go permanently yellow if this were louder. State the acceptance in `mitigation` and the finding goes away.

### specimen-without-care-profile

**warn** - reported; fails only under `--strict`. Applies to every `specimen`.

What you will see:

```
Specimen "{id}" ({name|'unnamed'}) has no care profile - it will appear on no maintenance calendar.
```

A specimen is an individual plant or tree, and the care it needs is held once per species in a care profile rather than repeated on every specimen. Without the link the specimen is present on the plan and absent from every calendar the model can produce: nothing knows when to prune it, feed it or check it. `care_profile_ref` is optional in the schema because a specimen can legitimately be recorded before its species profile exists, which makes this a gap to close rather than an error.

### system-without-components

**warn** - reported; fails only under `--strict`. Applies to every `system`.

What you will see:

```
System "{id}" ({name|'unnamed'}) has no components - nothing records what it is made of.
```

A system is the abstraction over the parts that make it up: the heating system is its heat pump, its cylinder and its emitters. A system with no component either side of the edge is a name with nothing behind it, and it answers no question about condition, age, warranty or replacement cost. Components carry `system_ref`, so the edge is INCOMING; the system's own `component_refs` is optional and a model may legitimately express membership from one side only.

### undescribed-authored-entity

**info** - reported; fails only under `--strict`. Applies to every entity, except `wall_segment`, `roof_plane`, `floor_slab`, `ceiling_slab`.

What you will see:

```
{type} "{id}" ({name|'unnamed'}) has no description - a reader gets the name and nothing else.
```

A name says what something is called; a description says what it is, and it is the only place the reasoning behind a value survives. An undescribed entity is valid YAML and becomes a bare row in every report and viewer the model produces.
The construction layer is EXCLUDED, and that exclusion is the whole of what makes this rule usable. Measured on the worked example: of 51 entities carrying no description, all 51 were construction geometry - 43 wall segments, 5 roof planes, 3 slabs. Every one is derived from the rooms above it rather than authored, so prose there would be noise generated to satisfy a rule. Without the exclusion this rule reports 51 findings of which zero are actionable, which is how a checker teaches people to ignore it.
Companion to, not a replacement for, a coverage measure: this asks only whether prose exists at all, so it stays silent on a description that is a restatement of the name.

## Adding a rule

A rule is one YAML file: what it selects, the condition that must hold, and the message when it does not. No code, and the check reads as a statement of the healthy state rather than of the failure - a finding is emitted when the condition is **not** satisfied.

Two things to establish before writing one. First, that the field it asks about is **optional** in the schema: a rule duplicating a `required:` can never fire, because validation rejects that model first, and it will report clean forever while checking nothing. Second, that it has a subject worth scoping - a rule over `every entity` that should have excluded the derived construction layer produces findings nobody can act on, which is how a checker teaches its readers to ignore it.
