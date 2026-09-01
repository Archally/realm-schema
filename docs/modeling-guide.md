# Realm Modeling Guide

How to author a realm model: what to write first, which conventions are easy to invert, and what
the validator is checking when it says the model is valid.

The companion documents are the [file conventions](./file-conventions.md), for where things go and
how identifiers are formed, and the [schema reference](./schema-reference.md), for every field.
This one is about judgement rather than lookup.

---

## Start with the question, not the property

A realm model can describe a property to any depth, and depth is not the goal. A model that answers
"which fences need replacing in the next five years" needs boundary segments in detail and no rooms
at all. A model built to draw a floor plan needs rooms, walls and openings and can leave the orchard
to one line.

So decide what the model is *for* before deciding what goes in it, and let the planes it does not
need stay empty. An absent plane says nothing; a plane filled in thinly says something wrong, because
a reader cannot tell "there is nothing here" from "nobody has looked yet". Where that distinction
matters, say so in a `description` rather than leaving it to be inferred.

## The order that works

Topology first, then whatever the model is for.

Almost everything refers to a space. A maintenance task is performed on a component in a system that
serves a room; a specimen grows in an outdoor zone; a warranty covers equipment installed on a floor.
Authoring the other planes first means either inventing identifiers you have not defined yet or
leaving references out and adding them later, and the second is worse because the model validates
without them.

Within topology the containment chain is: parcel, building, wing, floor, room. Outdoor zones and
boundary segments hang off the parcel and can be done at any point.

A useful checkpoint is to validate after the parcel and before anything else. Two files validate, and
from that point every addition is checked against something.

## Coordinates

### One origin, chosen and written down

A model has a single flat grid, declared once in `realm.yaml` under `coordinate_system`. Pick an
origin that a person can stand on and identify years later - a specific corner, a gatepost, the
threshold of a door - and describe it in words. A grid whose origin is "roughly the middle" cannot be
re-established, and every coordinate in the model depends on it.

State the axes too. The convention this schema is written around is +X east and +Y south, and
`north_angle_degrees` records the angle from +Y round to geographic north. A real survey almost never
yields a whole number there; a made-up one usually does, which is a reliable sign the number was
chosen rather than measured.

#### `realm.yaml`

```yaml
version: "1.0.0"
schemaVersion: "2.2.0"
name: Willow Cottage
description: >
  A smallholding on a hillside, used here to show the conventions.

coordinate_system:
  unit: meters
  origin_description: >
    The north corner of the parcel, where the drive meets the lane. All XY
    coordinates are metres from that point: +X runs east, +Y runs south.
  north_angle_degrees: 180
  vertical_datum_type: local-ground
  vertical_datum_description: >
    Z = 0 is ground level at the cottage's front threshold, 96 m above mean sea
    level. The lane is 3.4 m above it and the stream 3.0 m below.
```

Declare the coordinate system in **one place**. The schema also allows one in `topology/spatial.yaml`,
and a model that fills in both will eventually have two that disagree - the failure is silent,
because consumers reading one keep working while consumers reading the other quietly use older
numbers.

### `position` is absolute, `footprint` is relative

This is the single most useful thing to get right, and it inverts easily.

- **`position`** is absolute: metres from the model origin.
- **`footprint`** vertices are relative to that element's own `position`.

So a building's footprint vertices are small numbers around zero, and moving the building is one
edit to `position` rather than an edit to every vertex.

There are two exceptions, and both are deliberate:

- **A boundary segment has no `position`**, because a run of fence has no centre worth naming. Its
  `vertices` are absolute.
- **A wing's footprint is relative to its BUILDING's position**, not to the wing's own. The wings of
  one building therefore share a frame, which is what lets their areas be summed and compared against
  the building's footprint. A wing placed in its own frame produces a model where each wing is
  individually plausible and the building they compose is wrong.

### Elevation, and where to put zero

Elevations are metres above the model's vertical datum, declared once alongside the coordinate
system. The datum is a choice, and the useful choice is **where a reader stands**, not the highest or
lowest point of the site.

On sloping ground this matters. Put the datum on the hilltop and every building in the model carries
a large negative elevation, which reads as an error every time someone opens the file. Put it at the
threshold of the main building and the numbers say what a person walking the site would say: the lane
is three metres up, the stream three metres down.

Record the datum's height above sea level in its description, so the local grid can be tied to a
national one later without re-deriving it.

### Units

Metres outdoors, centimetres indoors, and the field name always says which: `length_m`, `area_sqm`,
`height_m` against `width_cm`, `ceiling_height_cm`, `wall_offset_cm`. The split follows the precision
each is measured to - a parcel boundary to the nearest tenth of a metre, a door opening to the
centimetre - and reading the suffix is faster than remembering the rule.

## The two spatial layers

A realm model describes space twice, on purpose.

**The semantic layer** is what a person knows and can state: this is the kitchen, it is 4.2 by 4.4
metres, its north wall is exterior and 30 cm of rubble stone, there is a window in it 1.6 m wide,
1.3 m from the corner. It lives in `topology/estate.yaml` and it is authored by hand.

**The construction layer** is the geometry that follows: where each wall segment starts and ends in
model coordinates, which slab carries the floor, how the roof planes meet. It lives under
`topology/construction/` and it is **derived from the semantic layer**, not drawn separately.

The direction of that derivation is the whole point. Two people drawing the same cottage produce two
geometries that differ in a hundred small ways, and no one can say which is right. One person stating
the rooms and a deterministic step producing the geometry gives one answer, and when a room changes
the geometry changes with it. Every construction file records where it came from in `generated_from`,
including whether a human has edited it since.

The validator checks the two against each other. That is what the cross-layer rules are for: a wall
segment whose length disagrees with the room it bounds, a slab whose area does not match its floor,
an opening that does not fit in the wall it is cut into. Those checks only run when there is a
construction layer to check - a semantic-only model passes them by having nothing to compare, which
is a pass that means less than it looks.

Here is the whole semantic side of one small building - parcel, building, wing, floor and two
rooms, with the kitchen's walls and openings. Every convention above is visible in it, and it
validates as it stands.

#### `topology/estate.yaml`

```yaml
parcels:
  - id: LP001
    name: Willow Cottage smallholding
    area_sqm: 1927
    position: {x: 23.55, y: 22.19}
    elevation_m: 0.5

buildings:
  - id: BLD001
    name: Willow Cottage
    building_type: house
    parcel_ref: LP001
    wing_refs: [WNG001]
    position: {x: 19.5, y: 21.5}
    ground_elevation_m: 0
    exterior_wall_thickness_cm: 30

wings:
  - id: WNG001
    name: Cottage main range
    building_ref: BLD001
    footprint:
      shape: polygon
      vertices:
        - {x: -5.5, y: -4.0}
        - {x: 5.5, y: -4.0}
        - {x: 5.5, y: 4.0}
        - {x: -5.5, y: 4.0}
    roof_type: gable
    roof_pitch_degrees: 42
    ridge_direction: E
    eave_height_m: 4.6
    ridge_height_m: 8.2

floors:
  - id: FLR001
    name: Ground floor
    level: 0
    building_ref: BLD001
    base_elevation_m: 0
    ceiling_height_m: 2.45
    area_sqm: 88

rooms:
  - id: RM001
    name: Kitchen
    room_type: kitchen
    floor_ref: FLR001
    wing_ref: WNG001
    position: {x: 16.1, y: 18.2}
    area_sqm: 18.5
    width_cm: 420
    length_cm: 440
    ceiling_height_cm: 245
    walls:
      N: {thickness_cm: 30, is_exterior: true, material: rubble-stone}
      E: {thickness_cm: 12, is_exterior: false, adjacent_ref: RM002, material: timber-stud}
      S: {thickness_cm: 30, is_exterior: true, material: rubble-stone}
      W: {thickness_cm: 30, is_exterior: true, material: rubble-stone}
    openings:
      - opening_type: window
        wall: N
        wall_offset_cm: 130
        width_cm: 160
        height_cm: 110
        sill_height_cm: 95
        head_height_cm: 205
      - opening_type: door
        wall: E
        wall_offset_cm: 90
        width_cm: 84
        height_cm: 198
        sill_height_cm: 0
        head_height_cm: 198
        opens_to_room_ref: RM002
  - id: RM002
    name: Dining room
    room_type: dining-room
    floor_ref: FLR001
    wing_ref: WNG001
    position: {x: 21.0, y: 18.2}
    area_sqm: 19.4
    width_cm: 440
    length_cm: 440
    ceiling_height_cm: 245
```

Note what the kitchen's east wall says: 12 cm, not exterior, adjacent to `RM002`. The dining room
says the same thing about its own west wall, and the door between them is stated once, in the
kitchen, carrying `opens_to_room_ref`.

### Walls are declared twice and exist once

In the semantic layer a room states all four of its walls, so the kitchen declares the wall it shares
with the dining room and the dining room declares the same wall. That redundancy is deliberate: each
room is independently readable, and the two declarations are checked against each other.

In the construction layer that shared wall is **one** segment. It has to be, or the model would
contain two walls where the building has one, and every area and material quantity derived from it
would be doubled.

### A wall segment is directed

A wall segment runs from `start` to `end`, and its sides are named from that direction: facing along
the segment, `right_space_ref` is the space on your right and `left_space_ref` the one on your left.

With +X east and +Y south, that makes the four walls of a room a clockwise circuit - north wall west
to east, east wall north to south, south wall east to west, west wall south to north - with the room
always on the right. This is the same circuit the semantic layer measures `wall_offset_cm` along, so
an opening's offset carries from one layer to the other unchanged.

Get the direction backwards and nothing fails to parse. The rooms simply end up on the wrong sides of
their walls, and the model describes a building turned inside out.

### One door, not two

A door between two rooms is **one** opening. It carries the room it is stated in and the room it
leads to, rather than appearing as a door in the kitchen's east wall and again as a door in the
dining room's west wall.

If you do state it twice, remember that the offset is measured from the other end on the far side:
the same door 90 cm from the north end of one room's wall is `wall_length - 90 - width` from the same
corner measured the other way. Deriving the mirrored value rather than typing it is the difference
between a model that stays consistent and one that drifts the first time a room is resized.

## Say the same thing twice, and let the validator check it

A realm model carries redundancy that a database schema would normalise away. A room states its
`area_sqm` beside its `width_cm` and `length_cm`. A building states its `eave_height_m` beside those
of its wings. A parcel states `area_sqm` beside the footprint whose vertices imply it.

This is not an oversight. The redundant field is what a person knows and can check - a deed states an
area, a survey states a height - and the derived one is what a renderer needs. Holding both lets the
validator compare them, so a typo in a vertex shows up as an area that disagrees rather than as a
plan that is quietly the wrong shape.

The consequence for authoring is that **derived numbers should be computed, not typed**. Anything
computed agrees by construction; anything typed agrees until someone edits one half of it. Where a
model is generated from a specification, this is automatic. Where it is written by hand, it is worth
computing the areas rather than estimating them.

## What the validator is actually saying

Five layers run, in order, and they answer different questions:

| Layer | Question | A failure means |
|---|---|---|
| Structural | Does each file match the schema that governs it? | A field is misspelled, missing, or of the wrong type |
| Referential | Do references resolve, and are identifiers unique? | Something points at an entity that does not exist |
| Geometric | Do the spatial invariants hold? | A footprint is not closed, a room falls outside its building, an elevation is implausible |
| Cross-layer | Do the semantic and construction layers agree? | The geometry no longer describes the rooms it was derived from |
| Semantic | Do the domain rules hold? | A planned change references what it removes, a task has no schedule |

Two things are worth knowing about a pass.

**A pass is not a completeness claim.** Almost every field is optional, so a model can validate while
saying very little. The validator reports the entity count alongside the verdict for exactly this
reason: read it.

**Layers can pass by having nothing to check.** The cross-layer rules over a model with no
construction files, or the geometric rules over a model with no coordinates, report zero errors
because they found nothing to examine. This is the same reading problem as an empty search result,
and the entity count is again what distinguishes the two cases.

Warnings are real findings, not noise. They are warnings rather than errors where the schema cannot
be sure the author is wrong - a reference into a plane the model has not filled in yet, for instance,
which is a mistake in a finished model and normal in a growing one.

## Growing a model over time

**Record what changed, not just what is.** `estate-changes.yaml` holds planned and completed work,
and `events.yaml` holds what has happened. A model that only ever describes the present tense loses
the reason every value in it is what it is - and that reason is usually the expensive thing to
recover.

**Retire identifiers rather than reusing them.** A number belonging to a deleted entity stays
retired. References to it may survive in documents outside the model, and a recycled identifier makes
an old reference point at something new without appearing to have changed.

**Alternatives get a letter.** Three mutually exclusive ways to re-roof a barn are `ECH009a`,
`ECH009b` and `ECH009c` rather than three separate changes, so that a decision between them is
visible as a decision.

**Comment what the schema cannot hold.** The schema records what a field means; only a comment
records where this value came from - measured, estimated from a photograph, taken from a deed, or
which of two plausible readings of an ambiguous boundary was chosen. That provenance is what a future
reader cannot reconstruct, and it is the first thing they will want.

## The worked example

[`examples/willow-cottage/`](../examples/willow-cottage/) applies all of the above to a fictional
English smallholding on a hillside: 145 entities across every plane, with a construction layer
derived from its rooms. Every convention described here is visible in it, and its files are commented
with the reasoning behind the values rather than only the values.

It is the fastest way to see what a fully populated model looks like, and the right thing to copy
from when starting one.
