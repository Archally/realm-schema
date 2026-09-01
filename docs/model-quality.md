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
| [`care-profile-without-calendar`](#care-profile-without-calendar) | every `species_care_profile` | warn |
| [`closed-change-without-referent`](#closed-change-without-referent) | every `estate_change` | warn |
| [`component-without-replacement-basis`](#component-without-replacement-basis) | every `component` | info |
| [`cost-category-without-budget`](#cost-category-without-budget) | every `cost_category` | info |
| [`estate-change-without-cost`](#estate-change-without-cost) | every `estate_change` | info |
| [`iot-device-without-subject`](#iot-device-without-subject) | every `iot_device` | info |
| [`planting-without-care-profile`](#planting-without-care-profile) | every `planting` | warn |
| [`regulatory-requirement-without-inspection-anchor`](#regulatory-requirement-without-inspection-anchor) | every `regulatory_requirement` | warn |
| [`risk-without-mitigation`](#risk-without-mitigation) | every `risk` | info |
| [`specimen-without-care-profile`](#specimen-without-care-profile) | every `specimen` | warn |
| [`system-without-maintenance`](#system-without-maintenance) | every `system` | info |
| [`system-without-parts`](#system-without-parts) | every `system` | warn |
| [`undescribed-authored-entity`](#undescribed-authored-entity) | every entity, except `wall_segment`, `roof_plane`, `floor_slab`, `ceiling_slab` | info |

14 rules.

### boundary-segment-without-parcel

**warn** - reported; fails only under `--strict`. Applies to every `boundary_segment`.

What you will see:

```
Boundary segment "{id}" ({name|'unnamed'}) borders no parcel - it belongs to no site plan.
```

A boundary run states which parcels it borders, and a segment between two parcels names both. Without any, the run has no place in the estate: it cannot be assigned to a site plan, and a question about which fences belong to this property cannot be answered from the model. `parcel_refs` is optional because a boundary can be surveyed before the parcels it divides are recorded.

### care-profile-without-calendar

**warn** - reported; fails only under `--strict`. Applies to every `species_care_profile`.

What you will see:

```
Care profile "{id}" ({name|'unnamed'}) has no care calendar - everything pointing at it is still on no schedule.
```

A care profile with no `care_calendar` names a species and prescribes nothing. It closes the one hole the two care-profile rules leave open: a specimen pointing at an empty profile satisfies `specimen-without-care-profile`, its planting satisfies `planting-without-care-profile`, and the plant is still on no calendar - three green checks and nothing to do in March.
That is why this is `warn` while its two companions describe a more visible gap. A plant with no profile is an obvious hole that a reader notices; a plant with a hollow one looks handled from every direction except the calendar itself.

### closed-change-without-referent

**warn** - reported; fails only under `--strict`. Applies to every `estate_change`.

What you will see:

```
Estate change "{id}" ({name|'unnamed'}) has started or completed but names no affected entity, system or zone - what it touched is recorded nowhere else.
```

An estate change that has started or finished, and names nothing it affected, is a record of work with no subject. While a change is still a proposal that is normal - nobody has decided which rooms are in scope. Once the work is under way the scope is known by definition, and once it is done the only remaining record of what it touched is this field.
Scoped to `in-progress` and `completed` for exactly that reason: including proposals would more than double the findings with entries whose blank is correct, and a rule that reports the normal state of a thing is one people learn to skip.
`warn` rather than `info` because the loss is irreversible. Every other gap in this pack can be filled later by reading the model or looking at the property; this one is filled by remembering, and it decays. A completed change is the one record that cannot be reconstructed from the thing itself.

### component-without-replacement-basis

**info** - reported; fails only under `--strict`. Applies to every `component`.

What you will see:

```
Component "{id}" ({name|'unnamed'}) has no installation date, expected lifespan or warranty - nothing supports a replacement estimate.
```

A component wears out, and the question a property owner eventually asks is "when does this need replacing, and is it still covered?". Three fields can answer it and any one of them is enough: `installed_date` gives an age, `expected_lifespan_years` gives a horizon, `warranty_ref` gives a claim window. A component with none of the three is a part that can only be discovered as a failure.
Deliberately `any_non_empty` rather than a demand for all three. An installation date alone supports a replacement estimate; a warranty alone dates the installation closely enough. Requiring the full set would report thoroughly documented components and teach a reader to skip the rule.

### cost-category-without-budget

**info** - reported; fails only under `--strict`. Applies to every `cost_category`.

What you will see:

```
Cost category "{id}" ({name|'unnamed'}) has no annual budget estimate - spending against it cannot be compared to anything.
```

A cost category with no `annual_budget_estimate` can record what was spent but cannot say whether that was expected. Every "are we over?" question needs a figure to be over, so the category answers the retrospective question and none of the planning ones - which is the half of cost tracking people actually act on.
An estimate, not a commitment: the field exists so a category can be compared against something, and a rough annual figure serves that better than none.

### estate-change-without-cost

**info** - reported; fails only under `--strict`. Applies to every `estate_change`.

What you will see:

```
Estate change "{id}" ({name|'unnamed'}) carries no cost estimate - it cannot be sequenced against a budget.
```

Planned work without an estimate cannot be sequenced against a budget, which is one of the two things an estate-change register exists for. Info rather than warn because an early-stage change legitimately has no number yet, and because a change already applied has a real cost recorded elsewhere.

### iot-device-without-subject

**info** - reported; fails only under `--strict`. Applies to every `iot_device`.

What you will see:

```
IoT device "{id}" ({name|'unnamed'}) neither monitors nor controls a system - nothing says what it is for.
```

A sensor or actuator exists to observe or drive something. `monitored_system_ref` and `controlled_system_ref` are both optional, so a device can be placed in a room, connected to the network and never say what it is for - at which point it is inventory rather than instrumentation, and no reading it produces can be attributed to a system.
Placement is not a subject. A thermostat's `room_ref` says where it hangs; only `controlled_system_ref` says which heating it drives, and a property with two heat sources needs the difference.

### planting-without-care-profile

**warn** - reported; fails only under `--strict`. Applies to every `planting`.

What you will see:

```
Planting "{id}" ({name|'unnamed'}) has no care profile - the whole group appears on no maintenance calendar.
```

The same gap as `specimen-without-care-profile`, one level up: a planting is a categorical group rather than an individual, and it carries the care needs of everything in it. An unlinked planting silently removes a whole bed or hedge from the maintenance calendar rather than one plant.

### regulatory-requirement-without-inspection-anchor

**warn** - reported; fails only under `--strict`. Applies to every `regulatory_requirement`.

What you will see:

```
Regulatory requirement "{id}" ({name|'unnamed'}) has neither a last inspection date nor a next due date - its schedule resolves to no deadline.
```

`inspection_schedule` is REQUIRED, so every regulatory requirement states how often it recurs. A recurrence with no anchor cannot be resolved to a date: "every five years" is a rule, not a deadline, until something says five years from when. Neither `last_inspection_date` nor `next_due_date` is required, so a requirement can be fully valid and still name no point on the calendar.
`warn` rather than `info`, and it is the one plane where that severity is about something other than model tidiness: a gas or electrical inspection that silently never comes due has consequences outside the model, and unlike most gaps here nobody discovers this one by reading the file.

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

### system-without-maintenance

**info** - reported; fails only under `--strict`. Applies to every `system`.

What you will see:

```
System "{id}" ({name|'unnamed'}) is the target of no maintenance task - it appears on no calendar and in no schedule.
```

A system that appears on no maintenance calendar is one nobody has decided how to look after. The consequence is not abstract: the maintenance calendar, the schedule planner and the compliance view are all built by walking `maintenance_task.target_ref` backwards, so a system nothing targets is simply absent from every one of them - and an artifact that renders a system-shaped hole looks exactly like a property that has no such system.
`target_ref` is REQUIRED on a task and unconstrained on the system, which is what makes this checkable at all: the schema guarantees every task names its subject and says nothing about whether any subject was named.
Scoped to the system types with a serviceable element - moving parts, a consumable, a filter, a pressurised or heated medium. `electrical-distribution` and `network` are deliberately outside it: a consumer unit and a home network are install-and-forget in maintenance terms, and where the law does require periodic inspection of the fixed wiring, realm models that as a `regulatory_requirement` with its own inspection schedule rather than as a recurring task. The list is positive rather than an exclusion so that a system type added to the schema later joins this rule by a deliberate edit instead of silently falling under it.

### system-without-parts

**warn** - reported; fails only under `--strict`. Applies to every `system`.

What you will see:

```
System "{id}" ({name|'unnamed'}) has no parts recorded - nothing says what it is made of.
```

A system is the abstraction over the parts that make it up: the heating system is its heat pump, its cylinder and its emitters. A system with nothing recorded beneath it is a name with nothing behind it, and it answers no question about condition, age, warranty or replacement cost.
A part reaches its system from either side and in either vocabulary. A `component` carries `system_ref`, and an `equipment` record may carry it too - the schema admits both for membership, so the edge is normally INCOMING. The system's own `component_refs` is optional, and a model may legitimately express membership from one side only. Any of the three satisfies this rule, because each one tells a reader what the system is made of: an expansion vessel recorded as equipment answers the question exactly as well as one recorded as a component.
The rule therefore fires only for a system with no parts recorded in ANY form - the case where the model names a system and stops.

### undescribed-authored-entity

**info** - reported; fails only under `--strict`. Applies to every entity, except `wall_segment`, `roof_plane`, `floor_slab`, `ceiling_slab`.

What you will see:

```
{type} "{id}" ({name|'unnamed'}) has no description or equivalent prose field - it renders as a bare name in reports and viewers.
```

A name says what something is called; a description says what it is, and it is the only place the reasoning behind a value survives. An undescribed entity is valid YAML and becomes a bare row in every report and viewer the model produces.
The construction layer is EXCLUDED, and that exclusion is the whole of what makes this rule usable. Measured on the worked example: of 51 entities carrying no description, all 51 were construction geometry - 43 wall segments, 5 roof planes, 3 slabs. Every one is derived from the rooms above it rather than authored, so prose there would be noise generated to satisfy a rule. Without the exclusion this rule reports 51 findings of which zero are actionable, which is how a checker teaches people to ignore it.
Prose is not confined to `description`. The schema gives several types a field of their own for exactly this content - a maintenance task carries `instructions`, a soil profile `texture_description`, a risk its `mitigation` - and an entity using the field its own type provides is documented, not undescribed. The rule reads the schema's whole prose vocabulary, and reading a field from a type that does not have it simply yields nothing - so one list serves all 39 types without a rule per type.
What is checked is prose about the RECORD. Prose nested inside a sub-object that describes one part of it - the text on an individual change item, on a shade-impact assessment, in a notification's message template - does not count, because it says what that part is rather than what the entity is.
Companion to, not a replacement for, a coverage measure: this asks only whether prose exists at all, so it stays silent on a description that is a restatement of the name.

## Adding a rule

A rule is one YAML file: what it selects, the condition that must hold, and the message when it does not. No code, and the check reads as a statement of the healthy state rather than of the failure - a finding is emitted when the condition is **not** satisfied.

Two things to establish before writing one. First, that the field it asks about is **optional** in the schema: a rule duplicating a `required:` can never fire, because validation rejects that model first, and it will report clean forever while checking nothing. Second, that it has a subject worth scoping - a rule over `every entity` that should have excluded the derived construction layer produces findings nobody can act on, which is how a checker teaches its readers to ignore it.
