# Realm Schema Reference

Every entity in schema v2.2, with its identifier prefix and its fields. This document is generated from the schema files themselves, so it states what the validator actually enforces rather than a description of it that might have fallen behind.

For how to author a model, read the [modeling guide](./modeling-guide.md); for where the files go and how identifiers are formed, the [file conventions](./file-conventions.md). This page is the lookup, not the introduction.

**Reading a field table.** *Required* is required by the schema, not by good practice: a model can validate while saying almost nothing. Types written as `` `name` `` are shared definitions, listed under [shared types](#shared-types). A field not listed is rejected, except where an entity accepts `x-` extension fields, which is stated per entity.

## Entities at a glance

| Prefix | Entity | Plane | Defined in |
|---|---|---|---|
| `ECH` | [Estate Change](#estate-change---ech) | Model root and cross-cutting | `estate-change.schema.yaml` |
| `EVT` | [Event](#event---evt) | Model root and cross-cutting | `events.schema.yaml` |
| `RSK` | [Risk](#risk---rsk) | Model root and cross-cutting | `risks.schema.yaml` |
| `ISS` | [Issue](#issue---iss) | Model root and cross-cutting | `risks.schema.yaml` |
| `BS` | [Boundary Segment](#boundary-segment---bs) | Topology | `topology/boundary.schema.yaml` |
| `WSG` | [Wall Segment](#wall-segment---wsg) | Topology | `topology/construction.schema.yaml` |
| `SLB` | [Floor Slab](#floor-slab---slb) | Topology | `topology/construction.schema.yaml` |
| `RFP` | [Roof Plane](#roof-plane---rfp) | Topology | `topology/construction.schema.yaml` |
| `FRN` | [Furniture](#furniture---frn) | Topology | `topology/equipment.schema.yaml` |
| `EQP` | [Equipment](#equipment---eqp) | Topology | `topology/equipment.schema.yaml` |
| `LP` | [Land Parcel](#land-parcel---lp) | Topology | `topology/estate.schema.yaml` |
| `BLD` | [Building](#building---bld) | Topology | `topology/estate.schema.yaml` |
| `WNG` | [Wing](#wing---wng) | Topology | `topology/estate.schema.yaml` |
| `FLR` | [Floor](#floor---flr) | Topology | `topology/estate.schema.yaml` |
| `RM` | [Room](#room---rm) | Topology | `topology/estate.schema.yaml` |
| `OZ` | [Outdoor Zone](#outdoor-zone---oz) | Topology | `topology/estate.schema.yaml` |
| `TL` | [Tool](#tool---tl) | Topology | `topology/tools.schema.yaml` |
| `NN` | [Network Node](#network-node---nn) | Infrastructure | `infrastructure/network.schema.yaml` |
| `IOT` | [IoT Device](#iot-device---iot) | Infrastructure | `infrastructure/network.schema.yaml` |
| `NL` | [Network Link](#network-link---nl) | Infrastructure | `infrastructure/network.schema.yaml` |
| `SYS` | [Infrastructure System](#infrastructure-system---sys) | Infrastructure | `infrastructure/systems.schema.yaml` |
| `CMP` | [System Component](#system-component---cmp) | Infrastructure | `infrastructure/systems.schema.yaml` |
| `UC` | [Utility Connection](#utility-connection---uc) | Infrastructure | `infrastructure/systems.schema.yaml` |
| `BMF` | [Biomass Flow](#biomass-flow---bmf) | Nature | `nature/biomass.schema.yaml` |
| `SCP` | [Species Care Profile](#species-care-profile---scp) | Nature | `nature/care.schema.yaml` |
| `REC` | [Planting Recommendation](#planting-recommendation---rec) | Nature | `nature/recommendations.schema.yaml` |
| `SOIL` | [Soil Profile](#soil-profile---soil) | Nature | `nature/soil.schema.yaml` |
| `SPM` | [Specimen](#specimen---spm) | Nature | `nature/vegetation.schema.yaml` |
| `PTG` | [Planting](#planting---ptg) | Nature | `nature/vegetation.schema.yaml` |
| `WRT` | [Warranty](#warranty---wrt) | Operations | `operations/compliance.schema.yaml` |
| `REG` | [Regulatory Requirement](#regulatory-requirement---reg) | Operations | `operations/compliance.schema.yaml` |
| `MT` | [Maintenance Task](#maintenance-task---mt) | Operations | `operations/maintenance.schema.yaml` |
| `NR` | [Notification Rule](#notification-rule---nr) | Operations | `operations/maintenance.schema.yaml` |
| `CC` | [Cost Category](#cost-category---cc) | Operations | `operations/maintenance.schema.yaml` |
| `PRS` | [Person](#person---prs) | Context | `context/persons.schema.yaml` |
| `NP` | [Neighbor Property](#neighbor-property---np) | Context | `context/surroundings.schema.yaml` |
| `SC` | [Shared Concern](#shared-concern---sc) | Context | `context/surroundings.schema.yaml` |
| `EF` | [Environmental Factor](#environmental-factor---ef) | Context | `context/surroundings.schema.yaml` |
| `RD` | [Road Corridor](#road-corridor---rd) | Context | `context/surroundings.schema.yaml` |

39 entity types.

## Model root and cross-cutting

The model's own metadata, the shared vocabulary every plane draws on, and the three concerns that belong to no single plane: planned change, risk, and what has happened.

### `estate-change.schema.yaml`

Tracks planned changes and undertakings concerning the estate as AS-IS to TO-BE transitions. Each estate change is a discrete undertaking (add solar panels, replace fence, plant new hedge, apply to a listing platform) with timeline, status, dependencies, impact on existing entities, required resources, and a record of what was actually carried out.

#### Estate Change - `ECH###`

A planned change or undertaking concerning the estate, with lifecycle tracking. Moves through statuses from proposed to approved to in-progress to completed or cancelled. A change may belong to a family of related changes, and a family may be one branch of a set of mutually exclusive scenarios. Answers CQ23, CQ31, CQ34.

Accepts `x-` extension fields.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | `estate_change_ref` | yes |  |
| `name` | string | yes | Example: `Install Rooftop Solar Array`. |
| `summary` | string | - | One-paragraph description of the planned change. Example: `Install 10kWp solar PV system on south-facing roof of main house with battery storage`. |
| `status` | enum | yes | Current lifecycle state of this estate change. A family parent carries a status of its own; a rule reports when it disagrees with the rollup of its members. One of: `proposed`, `approved`, `scheduled`, `in-progress`, `completed`, `cancelled`, `deferred`. Example: `proposed`. |
| `priority` | enum | - | One of: `critical`, `high`, `medium`, `low`. Example: `high`. |
| `proposed_date` | `iso_date` | - |  |
| `planned_start_date` | `iso_date` | - |  |
| `planned_end_date` | `iso_date` | - |  |
| `actual_start_date` | `iso_date` | - |  |
| `actual_end_date` | `iso_date` | - |  |
| `completed_date` | `iso_date` | - |  |
| `affected_entity_refs` | list of string | - |  |
| `changes` | list of object | - | Specific changes to realm entities: add, modify, replace, or remove systems, zones, plantings, boundaries, etc. |
| `required_resources` | list of `required_resource` | - | Tools, materials, and equipment needed to execute this estate change. Drives preparatory checklist generation (PDF) and purchase planning. Answers CQ31. |
| `affected_system_refs` | list of `system_ref` | - | Existing systems impacted by this estate change. |
| `affected_zone_refs` | list of `outdoor_zone_ref` | - |  |
| `depends_on_estate_change_refs` | list of `estate_change_ref` | - | Estate changes that must be completed before this one can start. |
| `part_of_change_ref` | `estate_change_ref` | - | The family this change belongs to. A family parent carries the shared budget, goal and condition its members work towards, and lets a risk or an issue address the whole family rather than guessing at one member. The edge is held by the member, so the parent needs no list; membership must not form a cycle. Example: `ECH009`. |
| `variant_group` | string | - | Names a set of mutually exclusive scenarios, declared on the parent of each competing branch. Exactly one branch is ever carried out, so members of one group are alternatives rather than dependencies and their statuses are not rolled up together. Example: `property-exit`. |
| `executions` | list of `execution` | - | What was actually carried out, and when. A change closed without one records no evidence that anything happened. Counts, totals and the most recent date are read from this list rather than stored beside it. Answers CQ34. |
| `coordinator_ref` | `person_ref` | - | Person responsible for coordinating this estate change. Answers CQ32. |
| `estimated_cost` | number | - | min 0. Example: `15000`. |
| `currency` | string | - | Example: `EUR`. |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

*Inside `changes`:*

| Field | Type | Required | Notes |
|---|---|---|---|
| `action` | enum | yes | One of: `add`, `modify`, `replace`, `remove`, `relocate`. Example: `add`. |
| `entity_type` | string | yes | Type of entity being changed. Example: `system`. |
| `entity_ref` | string | - | ID of the existing entity being modified/replaced/removed. Example: `SYS001`. |
| `description` | string | - | Example: `Add 10kWp solar PV system on main house roof`. |
| `from_state` | string | - | Current state before the change. Example: `No solar generation`. |
| `to_state` | string | - | Desired state after the change. Example: `10kWp solar PV with 13.5kWh battery`. |
| `actual_state` | string | - | What the change actually left behind, when that differs from the intended state or when the closure is worth recording in its own words. Work carried out in a different way than planned is the normal case rather than a fault, and a closed change that never records one is an unverified closure. Example: `Mesh sewn onto three wires; no panels and no cable ties were used`. |

### `events.schema.yaml`

Cross-cutting event log. Events are facts or observations about things that happened on or around the property: neighbor requests, tree transplants, storm damage, inspections, completed estate changes, etc. Events reference entities across all planes. Not part of any plane - chronological overlay. A carried-out estate change produces an event; events may also exist without any estate change.

#### Event - `EVT###`

A fact or observation about something that happened on or around the property. Events are immutable records - once logged, they represent historical truth. A carried-out estate change (ECH) produces an event; external triggers (neighbor requests, inspections, weather damage) create events without an estate change. Events reference affected entities across all planes.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `Sąsiad poprosił o przycięcie drzew`. |
| `event_type` | enum | yes | Classification of what kind of event this is. One of: `request`, `incident`, `action`, `observation`, `milestone`, `inspection`, `complaint`, `weather`, `estate-change-applied`. Example: `request`. |
| `occurred_at` | `event_date` | yes | Date (or date-time) when the event happened. |
| `resolved_at` | `event_date` | - | Date when the event was resolved or closed. Omit if still open. |
| `status` | enum | - | Current status of the event. One of: `open`, `in-progress`, `resolved`, `noted`. Default `"noted"`. Example: `open`. |
| `entity_refs` | list of `any_entity_ref` | - | IDs of entities affected by or related to this event (SPM, PTG, NP, BS, OZ, BLD, ECH, etc.). Cross-plane references. |
| `initiated_by_ref` | `person_ref` | - | Person or organization that triggered or reported this event. |
| `participants` | list of `person_ref` | - | People involved in the event (witnesses, responders, contractors). |
| `estate_change_ref` | `estate_change_ref` | - | The estate change (ECH###) that produced this event. Present when a carried-out change is the source of this event record, including when the change is one member of a family. |
| `description` | string | - | Free-text description of what happened. |
| `outcome` | string | - | Result or consequence of the event. |
| `cost_pln` | number | - | Financial impact or cost of responding to this event. min 0. |
| `tags` | `tags` | - |  |

### `risks.schema.yaml`

Cross-cutting risk and issue tracking. Risks are potential adverse events with mitigation plans; issues are identified current problems with existing measures. Both reference entities across all planes (REG, MT, WRT, SYS, NP, SC, OZ, etc.). Not part of any plane - governance overlay.

#### Risk - `RSK###`

A potential adverse event with negative consequences. Has a mitigation plan (what to do to reduce or avoid the risk). References entities across all planes that the risk relates to.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `Electrical inspection overdue`. |
| `category` | enum | yes | Domain of the risk. One of: `compliance`, `safety`, `privacy`, `structural`, `financial`, `operational`. |
| `severity` | enum | yes | Impact level if the risk materializes. One of: `critical`, `high`, `moderate`, `low`. |
| `status` | enum | yes | Current handling state. One of: `open`, `mitigated`, `monitoring`, `resolved`, `accepted`. |
| `entity_refs` | list of `any_entity_ref` | - | IDs of entities this risk relates to (REG, MT, WRT, SYS, NP, SC, ECH, etc.). |
| `design_parameters` | list of object | - | Quantitative design parameters from risk analysis: load capacities, safety factors, material thresholds. Machine-queryable engineering data. |
| `description` | string | - | Detailed description of the risk and its consequences. |
| `mitigation` | string | - | Plan or actions to reduce or avoid the risk. |
| `tags` | `tags` | - |  |

*Inside `design_parameters`:*

| Field | Type | Required | Notes |
|---|---|---|---|
| `parameter` | string | yes | Name of the design parameter. Example: `wind_load_capacity_kmh`. |
| `value` | string | yes | Example: `85`. |
| `unit` | string | - | Unit of measurement (omit for dimensionless). Example: `km/h`. |
| `context` | string | - | Where or when this parameter applies. Example: `Post-mitigation with top+bottom rail`. |

#### Issue - `ISS###`

An identified current problem or concern (e.g. noise, privacy, operational friction). Unlike risks, issues describe existing conditions. Uses current_measures for what is already being done.

Accepts `x-` extension fields.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `Noise from western neighbors`. |
| `category` | enum | yes | Domain of the issue. One of: `compliance`, `safety`, `privacy`, `structural`, `financial`, `operational`. |
| `severity` | enum | yes | Impact level of the issue. One of: `critical`, `high`, `moderate`, `low`. |
| `status` | enum | yes | Current handling state. One of: `open`, `mitigated`, `monitoring`, `resolved`, `accepted`. |
| `entity_refs` | list of `any_entity_ref` | - | IDs of entities this issue relates to (NP, SC, OZ, RM, BS, PTG, etc.). |
| `description` | string | - | Detailed description of the issue. |
| `current_measures` | string | - | What is already being done to address the issue (hedge, screening, acceptance). |
| `tags` | `tags` | - |  |

## Topology

What physically exists: land, buildings and the spaces inside them, the boundary around them, and the construction geometry derived from all of it.

### `topology/boundary.schema.yaml`

Property boundary segments: fences, walls, hedges, and natural boundaries. Each segment describes physical construction, condition, screening properties, and neighbor associations. Topology plane.

#### Boundary Segment - `BS###`

A continuous section of property boundary with uniform construction. A property's full perimeter is composed of multiple segments. Answers CQ18 (type and condition) and CQ20 (privacy screening). Used by T4, T5.

Accepts `x-` extension fields.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `North Fence`. |
| `boundary_type` | enum | yes | Physical construction type of this boundary segment. One of: `fence-wood`, `fence-metal`, `fence-chain-link`, `fence-vinyl`, `wall-brick`, `wall-stone`, `wall-concrete`, `hedge-evergreen`, `hedge-deciduous`, `hedge-mixed`, `natural-treeline`, `natural-waterway`, and 2 more. Example: `fence-wood`. |
| `direction` | `compass_direction` | - | Which side of the property this segment faces. |
| `height_m` | number | - | Current height of the boundary element. Example: `1.8`. |
| `length_m` | number | - | Length of this boundary segment. Example: `25`. |
| `condition` | enum | - | Current physical condition. Used by T4 for replacement planning. One of: `excellent`, `good`, `fair`, `poor`, `needs-replacement`. Example: `good`. |
| `installed_year` | integer | - | Example: `2018`. |
| `screening_opacity` | enum | - | Visual screening level. Answers CQ20 (privacy screening adequacy). Used by T4 to identify privacy gaps. One of: `solid`, `semi-transparent`, `transparent`, `none`. Example: `solid`. |
| `year_round_screening` | boolean | - | True if screening is effective all year (evergreen hedge, solid fence). False for deciduous hedges. |
| `mature_height_m` | number | - | Expected height at maturity (for hedges and natural boundaries). Example: `3`. |
| `post_construction` | object | - | Fence post specifications. Answers CQ27. |
| `mesh_or_infill` | object | - | Mesh, wire, or panel infill between posts. Answers CQ27. |
| `posts` | list of `fence_post` | - | Individual fence posts with measured positions, types, and annotations. Used by 2D/3D renderers and estate change planning. Each post is a measured physical entity along this boundary segment. |
| `screening_planting_refs` | list of `planting_ref` | - | Plantings providing visual screening along this boundary. Used by T4. |
| `parcel_refs` | list of `parcel_ref` | - | Land parcels this boundary segment borders. A segment on the boundary between two parcels lists both. Used by renderers to assign boundaries to per-parcel site plans. |
| `position_start` | `position` | - | Start point of this segment on the property grid. Deprecated in v1.5 - use vertices[] instead. |
| `position_end` | `position` | - | End point of this segment on the property grid. Deprecated in v1.5 - use vertices[] instead. |
| `vertices` | list of `position` | - | Polyline in model coordinates (meters). Ordered list of points defining this boundary segment's geometry. Supports multi-point segments (e.g., boundaries with bends). Supersedes position_start and position_end. at least 2 item(s). |
| `neighbor_property_ref` | `neighbor_property_ref` | - | Neighbor property on the other side of this boundary. |
| `shared_ownership` | boolean | - | Whether this boundary is jointly owned/maintained with the neighbor. |
| `base_elevation_m` | number | - | Ground elevation at the base of this boundary above vertical datum. Default 0. Non-zero for fences on retaining walls or slopes. Default `0`. Example: `0`. |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

*Inside `post_construction`:*

| Field | Type | Required | Notes |
|---|---|---|---|
| `diameter_mm` | number | - | Example: `42`. |
| `wall_thickness_mm` | number | - | Example: `2`. |
| `coating` | enum | - | One of: `pvc`, `galvanized`, `powder-coated`, `painted`, `none`. |
| `total_height_cm` | number | - | Full post length including buried section. Example: `170`. |
| `above_ground_cm` | number | - | Example: `120`. |
| `below_ground_cm` | number | - | Example: `50`. |
| `spacing_m` | number | - | Distance between posts. Example: `2.5`. |
| `footing_diameter_cm` | number | - | Example: `30`. |
| `footing_depth_cm` | number | - | Example: `20`. |
| `post_count` | integer | - | min 1. |

*Inside `mesh_or_infill`:*

| Field | Type | Required | Notes |
|---|---|---|---|
| `material` | enum | - | One of: `chain-link`, `welded-mesh`, `wood-panel`, `metal-panel`, `vinyl-panel`, `glass`, `polycarbonate`, `woven-wire`, `privacy-mesh`, `none`. |
| `wire_gauge_mm` | number | - | Example: `3`. |
| `mesh_height_cm` | number | - | Example: `120`. |
| `density_gsm` | number | - | For privacy mesh or shade cloth. Example: `180`. |
| `opacity_percent` | number | - | min 0, max 100. Example: `95`. |

### `topology/construction.schema.yaml`

AI-agent-generated construction geometry layer. Defines wall segments, floor slabs, roof planes, and building shells as first-class entities with 3D coordinates. Derived from semantic estate descriptions by an AI agent; authoritative for 2D floor plan and 3D rendering. One file per floor (FLR###.yaml) or per simple building (BLD###.yaml).

#### Wall Segment - `WSG###`

A continuous section of wall with uniform thickness and material. Defined by start and end points in model coordinates (meters). References the rooms/zones on each side. Carries opening cutout positions. Generated from room walls{N,E,S,W} descriptions.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `start` | `position` | yes | Start of the wall centerline in model coordinates (meters). |
| `end` | `position` | yes | End of the wall centerline in model coordinates (meters). |
| `base_elevation_m` | number | - | Bottom of the wall above vertical datum. Default `0`. |
| `height_m` | number | - | Floor-to-ceiling height of this wall segment. Example: `2.6`. |
| `thickness_cm` | number | yes | Example: `24`. |
| `gable_peak_elevation_m` | number | - | Elevation of the gable peak for triangular wall tops. |
| `is_exterior` | boolean | yes | True if this wall faces outside the building envelope. |
| `wall_type` | enum | - | One of: `exterior`, `interior-load-bearing`, `interior-partition`. Example: `exterior`. |
| `material` | string | - | Example: `gazobeton`. |
| `left_space_ref` | `room_or_zone_ref` | - | Room or outdoor zone on the left side of the wall (when looking from start to end). |
| `right_space_ref` | `room_or_zone_ref` | - | Room or outdoor zone on the right side. |
| `floor_ref` | `floor_ref` | - | Floor this wall segment belongs to. |
| `openings` | list of `wall_opening` | - | Windows and doors placed on this wall segment. |
| `wing_ref` | `wing_ref` | - | Structural wing this wall segment belongs to. |
| `derived_from` | string | - | Which semantic wall this was derived from (e.g., 'RM001.walls.E'). Example: `RM001.walls.E`. |
| `tags` | `tags` | - |  |

#### Floor Slab - `SLB###`

A horizontal structural element (floor or ceiling slab). Defined by a polygon outline at a specific elevation. Used for 3D floor/ceiling rendering and room volume computation.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `floor_ref` | `floor_ref` | yes | Floor this slab belongs to. |
| `outline` | `polygon_footprint` | yes | Plan-view polygon of this slab in model coordinates. |
| `elevation_m` | number | yes | Elevation of the finished floor surface above vertical datum. |
| `thickness_cm` | number | yes | Example: `20`. |
| `slab_type` | enum | - | One of: `ground-floor`, `intermediate`, `roof-slab`, `basement`. |
| `material` | string | - | Example: `reinforced-concrete`. |
| `derived_from` | string | - | Example: `FLR001 + BLD001.footprint`. |
| `tags` | `tags` | - |  |

#### Roof Plane - `RFP###`

A planar surface of the roof. A gable roof has 2 planes; a hip roof has 4. Each plane is a 3D polygon defining the visible roof surface. Generated from building roof metadata (type, pitch, ridge_direction).

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `building_ref` | `building_ref` | yes | Building this roof plane covers. |
| `wing_ref` | `wing_ref` | - | Wing this roof plane covers. Required when building has wings. |
| `vertices_3d` | list of `position3d` | yes | Ordered vertices of this roof plane in model coordinates with elevation. CCW winding viewed from above. at least 3 item(s). |
| `surface_type` | enum | yes | One of: `slope`, `ridge-cap`, `flat`, `dormer-slope`, `dormer-face`. |
| `pitch_degrees` | number | - | min 0, max 90. |
| `facing_direction` | `compass_direction` | - | Compass direction the slope faces (down-slope direction). |
| `material` | string | - | Example: `tile-concrete`. |
| `overhang_cm` | number | - | min 0. |
| `has_pv_panels` | boolean | - | Whether photovoltaic panels are mounted on this plane. |
| `derived_from` | string | - | Example: `BLD001 (gable, pitch=35, ridge=E)`. |
| `tags` | `tags` | - |  |

### `topology/equipment.schema.yaml`

Movable and installed items within rooms: furniture pieces and equipment/appliances. Each item is a first-class entity with typed ID, room placement, and optional link to infrastructure systems. Topology plane.

#### Furniture - `FRN###`

A furniture piece placed in a room or building (shed, gazebo): sofa, table, wardrobe, desk, bed, shelf unit, planter, outdoor storage, etc. Tracks placement (room + wall or building) and dimensions. Answers CQ24. Used by T2 (inventory) and T5 (layout rendering).

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `Kanapa narożna`. |
| `furniture_type` | enum | yes | Primary classification of this furniture piece. One of: `sofa`, `armchair`, `table`, `desk`, `chair`, `bed`, `wardrobe`, `shelf`, `cabinet`, `dresser`, `bench`, `mirror`, and 12 more. Example: `sofa`. |
| `room_ref` | `room_ref` | - | Room this furniture is placed in. Required if building_ref is not set. |
| `building_ref` | `building_ref` | - | Building (shed, gazebo) this furniture is placed in. Use when the item is in a structure without formal rooms. Mutually exclusive with room_ref. |
| `wall` | `compass_direction` | - | Wall or side of the room where this furniture is positioned. |
| `width_cm` | number | - | Example: `200`. |
| `depth_cm` | number | - | Example: `90`. |
| `height_cm` | number | - | Example: `210`. |
| `brand` | string | - | Example: `IKEA`. |
| `model` | string | - | Example: `KALLAX`. |
| `position` | `position` | - | Position on the room layout for 2D rendering. |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

#### Equipment - `EQP###`

An appliance or piece of equipment installed in a room or building (shed, gazebo): kitchen appliances, washing machines, grill, outdoor heater, etc. Can optionally link to an infrastructure system. Answers CQ25. Used by T2 (inventory).

Accepts `x-` extension fields.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `Piekarnik IKEA KULINARISK`. |
| `equipment_type` | enum | yes | Primary classification of this equipment. One of: `oven`, `microwave`, `dishwasher`, `refrigerator`, `freezer`, `induction-hob`, `gas-hob`, `range-hood`, `coffee-machine`, `washing-machine`, `dryer`, `water-filter`, and 44 more. Example: `oven`. |
| `room_ref` | `room_ref` | - | Room this equipment is installed in. Required if building_ref is not set. |
| `building_ref` | `building_ref` | - | Building (shed, gazebo) this equipment is installed in. Use when the item is in a structure without formal rooms. Mutually exclusive with room_ref. |
| `wall` | `compass_direction` | - | Wall or side of the room where this equipment is positioned. |
| `boundary_segment_ref` | `boundary_segment_ref` | - | Boundary segment this equipment is installed on (for gates). Mutually exclusive with room_ref and building_ref. |
| `outdoor_zone_ref` | `outdoor_zone_ref` | - | Outdoor zone where this equipment is placed (e.g., garden equipment). Mutually exclusive with room_ref, building_ref, and boundary_segment_ref. |
| `manufacturer` | string | - | Manufacturer name. |
| `model_name` | string | - | Manufacturer model name. |
| `width_cm` | number | - | Width of the equipment in centimeters. |
| `length_cm` | number | - | Length of the equipment in centimeters. |
| `brand` | string | - | Example: `IKEA`. |
| `model` | string | - | Example: `KULINARISK`. |
| `power_watts` | number | - | Nominal power consumption in watts. Example: `2000`. |
| `system_ref` | `system_ref` | - | Infrastructure system this equipment belongs to or feeds into. |
| `component_ref` | `component_ref` | - | Specific infrastructure component this equipment is part of. |
| `warranty_ref` | `warranty_ref` | - | Warranty covering this equipment. |
| `installed_date` | `iso_date` | - |  |
| `specs` | `specs` | - | Key-value technical specs beyond power_watts (capacity, dimensions, etc.). Answers CQ30. |
| `position` | `position` | - | Position on the room layout for 2D rendering. |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

### `topology/estate.schema.yaml`

Physical containment hierarchy of the estate: land parcels, buildings, floors, rooms, and outdoor zones. Models the spatial structure from land ownership down to individual rooms and garden areas. Topology plane.

#### Land Parcel - `LP###`

A discrete area of land with legal/cadastral identity. An estate may comprise multiple parcels (e.g., main lot + adjacent forest plot). Answers CQ01 (what parcels exist). Used by T2 (inventory) and T5 (layout).

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Unique typed identifier for this land parcel. |
| `name` | string | yes | Human-readable name for this parcel. Example: `Main Lot`. |
| `cadastral_id` | string | - | Official land registry / cadastral identifier. Example: `12345/6`. |
| `area_sqm` | number | - | Total area of this parcel in square meters. Example: `2500`. |
| `position` | `position` | - | Center position of this parcel on the property layout. |
| `footprint` | `polygon_footprint` | - | Polygon outline of the parcel boundary. Used by T5 for rendering. |
| `elevation_m` | number | - | Ground elevation of this parcel above the vertical datum. For flat properties using local-ground datum, typically 0. For sea-level- relative datum, the actual meters above sea level (e.g., 153). Multiple parcels may have different elevations on sloped terrain. Default `0`. Example: `0`. |
| `vertex_elevations` | list of number | - | Per-vertex elevation (m, relative to model vertical datum / origin) for each vertex of `footprint`. Length must equal `footprint.vertices.length`. When present, the 3D viewer renders the parcel as a fan-triangulated tilted surface (centroid + adjacent vertices form coplanar triangles - no GPU bilinear fold). Vertex order matches `footprint.vertices`. |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

#### Building - `BLD###`

A roofed structure on the estate: house, guest house, garage, shed, workshop, greenhouse, or barn. Contains floors and rooms. Answers CQ01 (estate composition) and CQ02 (room inventory). Used by T2, T5.

Accepts `x-` extension fields.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `Main House`. |
| `building_type` | enum | yes | Primary classification of this building. One of: `house`, `guest-house`, `garage`, `shed`, `gazebo`, `workshop`, `greenhouse`, `barn`, `carport`, `pool-house`, `sauna`. Example: `house`. |
| `parcel_ref` | `parcel_ref` | yes | Land parcel this building sits on. |
| `wing_refs` | list of `wing_ref` | yes | Wings composing this building's structure. Every building must have at least one wing. Simple rectangular buildings have exactly one wing. Redundant with wing.building_ref but enables per-building enforcement. at least 1 item(s). |
| `floors_count` | integer | - | Total number of floors including basement and attic if present. min 1. Example: `2`. |
| `built_year` | integer | - | Year the building was constructed. Example: `1995`. |
| `total_area_sqm` | number | - | Sum of all floor areas in this building. Example: `180`. |
| `position` | `position` | - | Center of the building footprint on the property grid. |
| `footprint` | `polygon_footprint` | - | Ground-plan polygon in local coordinates (before rotation). |
| `rotation_degrees` | number | - | Clockwise rotation from north in degrees. Applied to the footprint polygon vertices around the centroid for 2D rendering. 0 means the building's local +Y axis aligns with north. Default `0`. min 0. Example: `0`. |
| `ground_elevation_m` | number | - | Elevation of the building's ground level above the vertical datum. Default 0 for flat terrain. Non-zero for buildings on slopes or raised foundations. Used by construction inference for floor stacking and 3D placement. Default `0`. Example: `0`. |
| `anchor_point` | `position` | - | Stable reference point for this building's geometry. Typically the south-west exterior corner of the ground-floor footprint. Unlike position (centroid), anchor_point does not move when the footprint is edited. Used by construction inference as placement origin. Optional - when absent, position (centroid) is used. |
| `exterior_wall_thickness_cm` | number | - | Typical exterior wall thickness for this building (structure + insulation). Used by construction inference to calculate interior envelope from exterior footprint. Example: `24`. |
| `eave_height_m` | number | - | DERIVED FIELD - maximum eave height across all wings of this building. Computed by inference agent. Used for quick LOD0/LOD1 site plan rendering without reading individual wing data. Optional - omit if wings are the sole consumer. Example: `3`. |
| `ridge_height_m` | number | - | DERIVED FIELD - maximum ridge height across all wings of this building. Computed by inference agent. Used for quick LOD0/LOD1 site plan rendering without reading individual wing data. Optional - omit if wings are the sole consumer. Example: `7.2`. |
| `description` | string | - |  |
| `equipment_refs` | list of `equipment_ref` | - | Equipment placed in this building (shed, gazebo). Used when the building has no formal rooms. Redundant with equipment.building_ref. |
| `furniture_refs` | list of `furniture_ref` | - | Furniture placed in this building (shed, gazebo). Used when the building has no formal rooms. Redundant with furniture.building_ref. |
| `tags` | `tags` | - |  |

#### Wing - `WNG###`

A structural section of a building with its own footprint and roof geometry. Every building has at least one wing. Simple rectangular buildings have exactly one wing. Complex buildings (L-shaped, T-shaped, with attached garage) are decomposed into multiple wings. Each wing has independent roof type, pitch, and height data. Roof fields live exclusively on wings - not on buildings. Rooms and construction entities reference their wing via wing_ref.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `Bryła główna`. |
| `building_ref` | `building_ref` | yes | Building this wing belongs to. |
| `footprint` | `polygon_footprint` | yes | Outline of this wing in building-local coordinates (before rotation). The union of all wing footprints should approximate the building footprint. |
| `position` | `position` | - | Center of this wing for labeling. |
| `roof_type` | enum | - | Primary roof form for this wing. One of: `flat`, `gable`, `hip`, `gambrel`, `mansard`, `shed`, `mono-pitch`. Example: `gable`. |
| `roof_pitch_degrees` | number | - | min 0, max 90. Example: `35`. |
| `ridge_direction` | `compass_direction` | - | Compass direction the ridge runs (parallel to). |
| `eave_height_m` | number | - | Example: `3`. |
| `ridge_height_m` | number | - | Example: `7.2`. |
| `roof_overhang_cm` | number | - | min 0. Example: `40`. |
| `ground_elevation_m` | number | - | Ground level of this wing above vertical datum, if different from building.ground_elevation_m. For split-level or stepped buildings. Example: `0`. |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

#### Floor - `FLR###`

A storey or level within a building. Level 0 = ground floor, negative = basement, positive = upper floors. Answers CQ02 (rooms per floor). Used by T2 (inventory).

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `Ground Floor`. |
| `level` | integer | yes | 0 = ground, -1 = basement, 1 = first floor, etc. Example: `0`. |
| `building_ref` | `building_ref` | yes | Building this floor belongs to. |
| `area_sqm` | number | - | Example: `90`. |
| `ceiling_height_m` | number | - | Example: `2.6`. |
| `base_elevation_m` | number | - | Elevation of the bottom of this floor's slab above the vertical datum. Typically: ground_floor = building.ground_elevation_m, upper floors = previous floor's base + slab + clear height. Example: `0`. |
| `finished_floor_elevation_m` | number | - | Elevation of the walking surface (top of slab + finish). Used to place rooms and furniture in 3D. Example: `0.15`. |
| `slab_thickness_cm` | number | - | Structural slab thickness including finish. Example: `20`. |
| `wing_ref` | `wing_ref` | - | Structural wing this floor belongs to. Required when the parent building has multiple wings. Optional for single-wing buildings (inferred from the sole wing). Omit for floors spanning the entire building across wing boundaries. |
| `footprint` | `polygon_footprint` | - | Floor plan outline in building-local coordinates. May differ from building footprint for partial floors (e.g., basement doesn't extend under garage). When absent, inherited from building (or wing) footprint. |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

#### Room - `RM###`

An indoor space within a floor, classified by purpose. Answers CQ02 (room purpose and area), CQ26 (openings, lighting, heating detail). Used by T2 (inventory).

Accepts `x-` extension fields.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `Master Bedroom`. |
| `room_type` | enum | yes | Primary purpose of this room. One of: `bedroom`, `bathroom`, `kitchen`, `living-room`, `dining-room`, `office`, `utility`, `storage`, `hallway`, `staircase`, `attic`, `cellar`, and 8 more. Example: `bedroom`. |
| `floor_ref` | `floor_ref` | yes | Floor this room is on. |
| `area_sqm` | number | - | Example: `18.5`. |
| `width_cm` | number | - | Interior width (shorter axis) in centimeters. Example: `320`. |
| `length_cm` | number | - | Interior length (longer axis) in centimeters. Example: `518`. |
| `ceiling_height_cm` | number | - | Floor-to-ceiling height in centimeters. Example: `260`. |
| `position` | `position` | - | Center of the room on the building floor plan grid. Used by T5. |
| `footprint` | `polygon_footprint` | - | Floor-plan polygon in local coordinates (before translation by position). Used by T5. |
| `rotation_degrees` | number | - | Clockwise rotation from north. Most rooms are axis-aligned (0). Default `0`. min 0, max 360. Example: `0`. |
| `wing_ref` | `wing_ref` | - | Structural wing this room belongs to. Can be inferred from floor's wing_ref for single-wing buildings. Explicit when a floor spans multiple wings (e.g., hallway connecting main body and garage wing). |
| `walls` | object | - | Axis-aligned wall definitions for this room. Keys are compass directions (N, E, S, W). Optional - omit for models without wall-level detail. Answers CQ33. |
| `window_count` | integer | - | Simple window count. Superseded by openings[] in v1.1. min 0. Example: `2`. |
| `window_orientation` | `compass_direction` | - | Compass direction the main windows face. Superseded by openings[] in v1.1. |
| `has_water` | boolean | - | Whether this room has plumbed water (relevant for bathrooms, kitchen, utility). |
| `has_heating` | boolean | - | Whether this room has a heating element. Superseded by heating in v1.1. |
| `equipment_refs` | list of `equipment_ref` | - | Equipment entities placed in this room. Redundant with equipment.room_ref but improves human readability of room definitions. |
| `furniture_refs` | list of `furniture_ref` | - | Furniture entities placed in this room. Redundant with furniture.room_ref but improves human readability of room definitions. |
| `openings` | list of `opening` | - | Windows, doors, and other openings in this room. Answers CQ26. |
| `lighting_groups` | list of `lighting_group` | - | Lighting fixture groups in this room, each independently switched. Answers CQ26. |
| `heating` | `room_heating` | - | Structured heating details for this room. |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

*Inside `walls`:*

| Field | Type | Required | Notes |
|---|---|---|---|
| `N` | `room_wall` | - |  |
| `E` | `room_wall` | - |  |
| `S` | `room_wall` | - |  |
| `W` | `room_wall` | - |  |

#### Outdoor Zone - `OZ###`

A classified outdoor area within a parcel: garden bed, lawn, forest section, driveway, patio, etc. Answers CQ03 (zone classification) and CQ11 (planting suitability). Used by T2, T3, T5.

Accepts `x-` extension fields.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `Front Garden`. |
| `zone_type` | enum | yes | Primary classification of this outdoor area. One of: `garden`, `vegetable-garden`, `orchard`, `forest`, `lawn`, `meadow`, `driveway`, `parking`, `patio`, `terrace`, `deck`, `pool-area`, and 7 more. Example: `garden`. |
| `parcel_ref` | `parcel_ref` | yes | Land parcel this zone belongs to. |
| `area_sqm` | number | - | Example: `120`. |
| `position` | `position` | - |  |
| `footprint` | `footprint` | - | Shape of this zone on the property layout. Polygon for irregular areas, circle for round features. |
| `sun_exposure` | enum | - | Typical sun exposure level. Answers CQ11, CQ22. Used by T3 (garden planning). One of: `full-sun`, `partial-sun`, `partial-shade`, `full-shade`. Example: `partial-sun`. |
| `soil_type` | enum | - | Dominant soil type in this zone. Affects plant selection (CQ11). One of: `clay`, `loam`, `sandy-loam`, `sand`, `silt`, `peat`, `chalk`, `rocky`. Example: `loam`. |
| `soil_ph` | number | - | Measured or estimated soil pH. Affects plant compatibility. min 3, max 10. Example: `6.5`. |
| `soil_profile_refs` | list of `soil_profile_ref` | - | Detailed soil profiles for this zone. One zone may have multiple soil profiles (e.g., lawn area vs raised bed). Answers CQ37. Convenience reverse-ref; SOIL entity is primary owner via outdoor_zone_ref. |
| `slope_direction` | `compass_direction` | - | Direction the ground slopes downward (for drainage analysis). |
| `slope_percent` | number | - | Gradient as percentage. 0 = flat, 100 = 45 degrees. min 0. Example: `3`. |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

### `topology/tools.schema.yaml`

Portable, hand-held, or easily transportable tools used for property maintenance, garden work, and construction. Distinct from equipment (EQP) which covers heavier, installed, or hard-to-move items. Each tool is a first-class entity with typed ID and storage location. Topology plane.

#### Tool - `TL###`

A portable, hand-held, or easily transportable tool: shovels, rakes, saws, welders, ladders, etc. Lighter and more mobile than equipment (EQP). Tracks storage location and condition. Answers CQ31. Used by T2 (inventory) and T8 (estate change checklist).

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `Łopata ogrodowa`. |
| `tool_type` | string | - | Free-text classification of this tool (e.g., shovel, welder, ladder). Example: `shovel`. |
| `room_ref` | `room_ref` | - | Room where this tool is stored. |
| `building_ref` | `building_ref` | - | Building (shed, garage) where this tool is stored. Use when the storage location has no formal rooms. |
| `brand` | string | - | Example: `Fiskars`. |
| `model` | string | - | Example: `Xact L`. |
| `condition` | enum | - | Current physical condition of the tool. One of: `good`, `fair`, `poor`, `needs-repair`. |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

## Infrastructure

The systems that serve the property, the components they are built from, and the connections and network that reach them.

### `infrastructure/network.schema.yaml`

Detailed network infrastructure: routers, switches, access points, mesh nodes, IoT devices, and the links between them. Models the full network topology for visualization and troubleshooting. Infrastructure plane.

#### Network Node - `NN###`

A network infrastructure device: router, switch, access point, mesh node, modem, NAS, etc. Forms the vertices of the network topology graph. Answers CQ06. Used by T6 (topology map).

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `Main Router`. |
| `node_type` | enum | yes | Role of this device in the network. One of: `router`, `switch`, `access-point`, `mesh-node`, `modem`, `firewall`, `nas`, `server`, `bridge`, `media-gateway`, `repeater`. Example: `router`. |
| `manufacturer` | string | - | Example: `Ubiquiti`. |
| `model_name` | string | - | Example: `UniFi Dream Machine Pro`. |
| `ip_address` | string | - | Static or reserved IP address on the local network. Example: `192.168.1.1`. |
| `mac_address` | string | - | Example: `00:1A:2B:3C:4D:5E`. |
| `wifi_bands` | list of enum | - | Supported WiFi frequency bands (for APs and routers). One of: `2.4GHz`, `5GHz`, `6GHz`. |
| `poe_powered` | boolean | - | Whether this device is powered via Power over Ethernet. |
| `room_ref` | `room_ref` | - |  |
| `outdoor_zone_ref` | `outdoor_zone_ref` | - | For outdoor APs and cameras. |
| `position` | `position` | - |  |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

#### IoT Device - `IOT###`

A smart-home sensor, actuator, or controller. Connected to the network and optionally monitoring or controlling an infrastructure system. Answers CQ07. Used by T2 (inventory), T6 (topology).

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `Garden Soil Moisture Sensor`. |
| `device_type` | enum | yes | Functional classification of this IoT device. One of: `sensor`, `actuator`, `controller`, `camera`, `thermostat`, `smart-plug`, `smart-lock`, `weather-station`, `soil-moisture-sensor`, `water-meter`, `energy-meter`, `smoke-detector`, and 5 more. Example: `thermostat`. |
| `protocol` | enum | - | Primary wireless or wired protocol. One of: `wifi`, `zigbee`, `z-wave`, `bluetooth`, `thread`, `matter`, `lora`, `wired-ethernet`, `modbus`, `knx`. Example: `zigbee`. |
| `manufacturer` | string | - | Example: `Aqara`. |
| `model_name` | string | - | Example: `Aqara Temperature Sensor T1`. |
| `monitored_system_ref` | `system_ref` | - | Infrastructure system this device monitors (e.g., heating, irrigation). |
| `controlled_system_ref` | `system_ref` | - | Infrastructure system this device actuates or controls. |
| `network_node_ref` | `network_node_ref` | - | Network node this device connects through (hub, AP, bridge). |
| `room_ref` | `room_ref` | - |  |
| `outdoor_zone_ref` | `outdoor_zone_ref` | - |  |
| `position` | `position` | - |  |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

#### Network Link - `NL###`

A physical or wireless connection between two network nodes. Forms the edges of the network topology graph. Answers CQ06 (link speeds and types). Used by T6 (topology map).

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | - | Example: `Router to Office Switch`. |
| `from_node_ref` | `network_node_ref` | yes | Source network node. |
| `to_node_ref` | `network_node_ref` | yes | Destination network node. |
| `link_type` | enum | yes | Physical medium of this connection. One of: `ethernet-cat5e`, `ethernet-cat6`, `ethernet-cat6a`, `fiber-single-mode`, `fiber-multi-mode`, `wifi`, `coax`, `powerline`, `mesh-wireless`, `wifi-2.4ghz`, `wifi-5ghz`. Example: `ethernet-cat6`. |
| `speed_mbps` | integer | - | Negotiated or nominal link speed. min 1. Example: `1000`. |
| `poe_delivery` | boolean | - | Whether this link carries Power over Ethernet. |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

### `infrastructure/systems.schema.yaml`

Infrastructure systems (energy, heating, water, electrical), their physical components, and utility grid connections. Covers all built systems from solar panels to sewage. Infrastructure plane.

#### Infrastructure System - `SYS###`

A major infrastructure system serving the property. Typed by function (heating, solar, irrigation, etc.) with capacity, fuel source, and installation details. Answers CQ04, CQ05. Used by T1 (maintenance), T2 (inventory), T6 (topology map).

Accepts `x-` extension fields.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `Central Heating`. |
| `system_type` | enum | yes | Functional classification of this infrastructure system. One of: `heating`, `cooling`, `ventilation`, `hot-water`, `solar-electric`, `solar-thermal`, `battery-storage`, `ev-charging`, `electrical-distribution`, `irrigation`, `drainage`, `sewage`, and 6 more. Example: `heating`. |
| `fuel_source` | enum | - | Primary energy input for this system. Answers CQ04. One of: `electricity`, `natural-gas`, `propane`, `heating-oil`, `wood`, `pellet`, `biomass`, `solar`, `ground-heat`, `air-heat`, `water-heat`, `diesel`, and 1 more. Example: `natural-gas`. |
| `rated_capacity` | number | - | Nominal capacity in the capacity_unit. E.g., 25 kW, 10 kWp, 500 L. Example: `25`. |
| `capacity_unit` | string | - | Unit for rated_capacity. Example: `kW`. |
| `efficiency_rating` | string | - | Energy efficiency label or COP/SCOP value. Example: `A++`. |
| `installed_date` | `iso_date` | - | Date the system was installed or commissioned. |
| `manufacturer` | string | - | Example: `Viessmann`. |
| `model_name` | string | - | Example: `Vitodens 200-W`. |
| `serial_number` | string | - | Example: `VB2W-2026-0042`. |
| `building_ref` | `building_ref` | - | Building where this system's main unit is installed. |
| `room_ref` | `room_ref` | - | Specific room (e.g., boiler room, utility room). |
| `outdoor_zone_ref` | `outdoor_zone_ref` | - | For outdoor systems (solar panels, irrigation, heat pump outdoor unit). |
| `position` | `position` | - | Position on property grid (for outdoor-mounted systems). |
| `utility_connection_ref` | `utility_connection_ref` | - | Grid connection that supplies this system. |
| `warranty_ref` | `warranty_ref` | - | Warranty covering this system. Answers CQ05. |
| `component_refs` | list of `component_ref` | - | Components that make up this system. |
| `feeds_system_refs` | list of `system_ref` | - | Other systems this one feeds energy/fluid to. Used by T6. |
| `distribution_zones` | list of object | - | Rooms and outdoor zones served by this system with their functional roles. Captures the system's coverage topology. Used by T6. |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

*Inside `distribution_zones`:*

| Field | Type | Required | Notes |
|---|---|---|---|
| `zone_ref` | `room_or_zone_ref` | yes | Room or outdoor zone served by this system. |
| `role` | string | - | Function of this zone in the system distribution. Example: `underfloor-heating`. |

#### System Component - `CMP###`

A physical part within an infrastructure system: boiler, radiator, pump, inverter, valve, tank, filter, etc. Granular enough for maintenance targeting. Answers CQ05 (configuration detail). Used by T1 (maintenance), T2 (inventory).

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `Condensing Boiler Unit`. |
| `component_type` | string | - | Functional type of this component. Example: `boiler`. |
| `system_ref` | `system_ref` | yes | Infrastructure system this component belongs to. |
| `building_ref` | `building_ref` | - | Building this component is installed in. |
| `specs` | `specs` | - | Technical specifications for this component. |
| `manufacturer` | string | - | Example: `Viessmann`. |
| `model_name` | string | - | Example: `Vitodens 200-W B2HF-25`. |
| `serial_number` | string | - |  |
| `installed_date` | `iso_date` | - |  |
| `expected_lifespan_years` | integer | - | Manufacturer's expected service life. Used by T1 for replacement planning. min 1. Example: `15`. |
| `room_ref` | `room_ref` | - |  |
| `position` | `position` | - |  |
| `warranty_ref` | `warranty_ref` | - |  |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

#### Utility Connection - `UC###`

An external utility grid connection bringing a service to the property: electricity, gas, water supply, sewage, internet. Answers CQ08 (what connections exist, who provides them). Used by T2 (inventory), T9 (costs).

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `Grid Electricity`. |
| `connection_type` | enum | yes | Type of utility service. One of: `electricity`, `natural-gas`, `propane-delivery`, `heating-oil-delivery`, `water-supply`, `sewage`, `fiber-internet`, `cable-internet`, `dsl`, `telephone`, `district-heating`. Example: `electricity`. |
| `provider` | string | yes | Name of the service provider. Example: `Stadtwerke München`. |
| `contract_id` | string | - | Customer or contract number with the provider. Example: `KD-2026-12345`. |
| `meter_id` | string | - | Utility meter identifier for readings. Example: `1-EMH-00123456`. |
| `capacity` | number | - | Maximum capacity of this connection. Example: `63`. |
| `capacity_unit` | string | - | Example: `A`. |
| `monthly_cost_estimate` | number | - | Average monthly cost in the specified currency. min 0. Example: `85`. |
| `currency` | string | - | Example: `EUR`. |
| `entry_point_position` | `position` | - | Where the utility enters the property (for spatial layout). |
| `cost_category_ref` | `cost_category_ref` | - | Budget category for this connection's costs. |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

## Nature

What grows on the property, individually and in groups, together with the soil it grows in and the care it needs.

### `nature/biomass.schema.yaml`

Circular biomass flows from organic sources (tree pruning, leaf fall, kitchen waste) through processing (composting, chipping, drying) to productive use (garden amendment, firewood, mulch). Nature plane.

#### Biomass Flow - `BMF###`

A circular flow of organic material from source through processing to productive use. Models the estate's closed-loop resource cycles: tree → firewood → heating, leaves → compost → garden. Answers CQ12. Used by T3 (garden advisory) and T7 (flow diagram).

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `Oak Pruning to Firewood`. |
| `source_type` | enum | yes | What kind of organic material enters this flow. One of: `tree-pruning`, `leaf-fall`, `grass-clippings`, `kitchen-waste`, `wood-harvest`, `crop-residue`, `hedge-trimmings`, `fruit-drops`, `weed-clearing`. Example: `tree-pruning`. |
| `source_ref` | `biomass_source_ref` | - | Specimen or outdoor zone where this biomass originates. |
| `process` | enum | yes | How the raw biomass is transformed. One of: `composting`, `chipping`, `drying`, `direct-use`, `mulching`, `vermicomposting`, `biochar`, `anaerobic-digestion`. Example: `composting`. |
| `processing_location_ref` | `outdoor_zone_ref` | - | Zone where processing happens (e.g., compost area, wood shed). |
| `processing_duration_days` | integer | - | Typical time from input to usable output. min 0. Example: `90`. |
| `output_type` | enum | yes | What the flow produces after processing. One of: `compost`, `mulch`, `firewood`, `wood-chips`, `biochar`, `green-waste`, `worm-castings`, `leaf-mold`. Example: `firewood`. |
| `destination_ref` | `biomass_destination_ref` | - | Where the output is used: outdoor zone (garden amendment) or system (fuel for heating). |
| `estimated_annual_volume` | number | - | Estimated annual throughput. Example: `2.5`. |
| `volume_unit` | enum | - | One of: `cubic-meters`, `kilograms`, `tonnes`, `liters`. Example: `cubic-meters`. |
| `seasonal_availability` | list of integer | - | Months (1-12) when source material is available. |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

### `nature/care.schema.yaml`

Species-level care protocols: annual care calendars with monthly activities, supplies/product recommendations, pest/disease protection protocols, pruning guides, and soil requirements. One profile per species serves all specimens and plantings of that species (DRY). Nature plane.

#### Species Care Profile - `SCP###`

Annual care protocol for a plant species: monthly activity calendar, supplies with dosage and pricing, pest/disease threats with prevention and treatment, pruning guide, and soil requirements. One SCP serves all specimens (SPM) and plantings (PTG) of that species via care_profile_ref. Answers CQ35 (monthly care), CQ36 (supplies/costs), CQ38 (threats), CQ39 (pruning). Used by T10 (care calendar), T11 (shopping list generator).

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `Tuja zachodnia 'Smaragd' - profil pielęgnacji`. |
| `species` | string | yes | Botanical species name this profile applies to. Example: `Thuja occidentalis 'Smaragd'`. |
| `common_name` | string | - | Example: `Tuja zachodnia szmaragd`. |
| `applicable_specimen_types` | list of enum | - | Which specimen_type values this profile covers. One of: `tree-deciduous`, `tree-evergreen`, `tree-fruit`, `shrub-deciduous`, `shrub-evergreen`, `shrub-fruit`, `perennial`, `climber`, `bamboo`, `palm`. |
| `applicable_planting_types` | list of enum | - | Which planting_type values this profile covers. One of: `hedge`, `flower-bed`, `vegetable-bed`, `herb-garden`, `ground-cover`, `lawn`, `meadow-section`, `mixed-border`, `raised-bed`, `container-group`, `climbing-wall`, `green-roof`. |
| `care_calendar` | list of `care_month` | - | Monthly care activities for this species. Each entry covers one month (1-12) with a list of activities to perform. Answers CQ35 (what to do when). Used by T10 (calendar generation). |
| `soil_requirements` | `soil_requirement` | - | Preferred soil conditions for this species. Answers CQ37 indirectly. |
| `known_threats` | list of `known_threat` | - | Pests, diseases, and environmental threats this species is susceptible to, with prevention and treatment protocols. This is a PROTOCOL (what to do), not STATE (is it currently affected). Current health state is tracked externally. Answers CQ38. Used by T10 (seasonal protection schedule). |
| `pruning_guide` | `pruning_guide` | - | Pruning types, timing, and techniques. Answers CQ39. |
| `hardiness_zone_min` | string | - | Coldest USDA zone this species tolerates. Example: `5a`. |
| `growth_rate` | enum | - | General growth speed classification. One of: `very-slow`, `slow`, `moderate`, `fast`, `very-fast`. |
| `lifespan_years` | integer | - | min 1. |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

### `nature/recommendations.schema.yaml`

Analytically-derived planting recommendations for privacy screening, noise reduction, shade canopy, windbreak, fruit production, and ornamental value. Each recommendation identifies a specific species, position, and rationale. Accepted recommendations become estate changes (ECH###) and, upon completion, create new specimens (SPM###) or plantings (PTG###). Nature plane.

#### Planting Recommendation - `REC###`

A specific, positioned recommendation to plant a tree or shrub. Includes species, growth form, screening function, foundation safety analysis, shade impact assessment, and maintenance expectations. Answers CQ41 (screening), CQ42 (timeline), CQ43 (safety), CQ44 (shade).

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `Świerk serbski - ekran prywatności naprzeciwko salonu`. |
| `species` | string | yes | Botanical species name (including cultivar if relevant). Example: `Picea omorika`. |
| `common_name` | string | - | Example: `Świerk serbski`. |
| `specimen_type` | enum | - | Same enum as specimen.specimen_type. One of: `tree-deciduous`, `tree-evergreen`, `tree-fruit`, `shrub-deciduous`, `shrub-evergreen`, `shrub-fruit`, `perennial`, `climber`. |
| `recommendation_type` | enum | yes | Primary function this planting serves. One of: `privacy-screen`, `noise-barrier`, `shade-canopy`, `windbreak`, `ornamental`, `fruit`, `ground-cover`, `combined`. Example: `privacy-screen`. |
| `growth_form` | enum | yes | How the tree will be trained or allowed to grow. One of: `free-growing`, `pleached`, `espalier`, `columnar`, `multi-stem`, `standard`, `topiary`. Example: `free-growing`. |
| `target_height_m` | number | - | Expected height at maturity or management target. Example: `10`. |
| `target_width_m` | number | - | Expected canopy width at maturity. Example: `3`. |
| `growth_rate_cm_per_year` | number | - | Example: `30`. |
| `planting_height_cm` | number | - | Expected height of nursery stock at purchase. Example: `200`. |
| `leaf_retention` | enum | - | Foliage behavior through seasons. Marcescent = retains dead leaves through winter. One of: `deciduous`, `evergreen`, `semi-evergreen`, `marcescent`. |
| `sun_requirement` | enum | - | One of: `full-sun`, `partial-sun`, `partial-shade`, `full-shade`. |
| `water_requirement` | enum | - | One of: `drought-tolerant`, `low`, `moderate`, `high`. |
| `hardiness_zone_min` | string | - | Example: `4a`. |
| `bloom_months` | list of integer | - |  |
| `outdoor_zone_ref` | `outdoor_zone_ref` | yes | Outdoor zone where the tree will be planted. |
| `boundary_segment_ref` | `boundary_segment_ref` | - | Boundary segment this recommendation screens (if privacy/noise function). |
| `position` | `position` | - | Proposed planting position on the property grid. |
| `screening_function` | object | - | How this planting provides screening (privacy, noise, wind). |
| `foundation_safety` | object | - | Root system risk analysis relative to nearby structures. |
| `shade_impact` | object | - | Predicted shading effect on own property zones. |
| `maintenance_level` | enum | - | Expected annual maintenance effort. One of: `zero`, `minimal`, `low`, `moderate`, `high`. |
| `maintenance_description` | string | - | Example: `Cięcie formujące 2× w roku (VII + II), ~30 min na sesję`. |
| `estimated_cost_pln` | number | - | Estimated purchase cost for nursery stock. min 0. |
| `priority` | enum | yes | One of: `critical`, `high`, `medium`, `low`. |
| `status` | enum | yes | Lifecycle status of this recommendation. One of: `proposed`, `accepted`, `rejected`, `planted`. |
| `planting_season` | string | - | Best time to plant this species. Example: `X–XI 2026`. |
| `linked_estate_change_ref` | `estate_change_ref` | - | Estate change created when this recommendation is accepted. |
| `rationale` | string | - | Analytical justification for this recommendation. |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

*Inside `screening_function`:*

| Field | Type | Required | Notes |
|---|---|---|---|
| `screens_from_direction` | `compass_direction` | - |  |
| `addresses_concern_refs` | list of `shared_concern_ref` | - | Shared concerns (SC###) this recommendation mitigates. |
| `effective_height_range_min_m` | number | - | Height at which screening begins (above ground). For pleached: stem height. min 0. |
| `effective_height_range_max_m` | number | - | Height at which screening ends (top of canopy/crown). |
| `year_round_coverage_percent` | integer | - | Screening effectiveness in winter: 100=evergreen, ~70=marcescent, ~40=deciduous skeleton. min 0, max 100. |
| `years_to_effectiveness` | number | - | Estimated years until this planting provides meaningful screening. min 0. |

*Inside `foundation_safety`:*

| Field | Type | Required | Notes |
|---|---|---|---|
| `root_type` | enum | - | One of: `deep-taproot`, `deep-spreading`, `shallow-spreading`, `compact`, `non-aggressive`. |
| `distance_to_nearest_foundation_m` | number | - | Distance from proposed position to nearest building foundation. min 0. |
| `nearest_structure_ref` | `building_ref` | - |  |
| `risk_level` | enum | - | One of: `none`, `low`, `moderate`, `high`. |
| `notes` | string | - |  |

*Inside `shade_impact`:*

| Field | Type | Required | Notes |
|---|---|---|---|
| `shadow_direction` | `compass_direction` | - | Primary direction shadow falls (afternoon = E for W-boundary trees). |
| `affected_zone_refs` | list of `outdoor_zone_ref` | - |  |
| `description` | string | - |  |

### `nature/soil.schema.yaml`

Soil profiles for outdoor zones: type classification, pH level, texture, drainage, organic matter, and amendment recommendations with dosage and product info. One zone may have multiple soil profiles (e.g., lawn area vs raised beds within the same zone). Nature plane.

#### Soil Profile - `SOIL###`

Soil characteristics for a specific area within an outdoor zone. Covers type, pH, texture, drainage, organic matter, and recommended amendments with dosage. A separate entity because the same OZ may contain different soil types (e.g., OZ004 has lawn soil vs raised bed soil). Answers CQ37. Used by T3, T10.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `Gleba trawnika głównego`. |
| `outdoor_zone_ref` | `outdoor_zone_ref` | yes | Zone where this soil profile applies. |
| `position` | `position` | - | Center of soil profile area (when it covers only part of the zone). |
| `footprint` | `footprint` | - | Shape of the area this soil profile covers. |
| `area_sqm` | number | - | Approximate area covered by this soil profile. |
| `soil_type` | enum | - | Primary soil classification. One of: `clay`, `sandy`, `loam`, `silt`, `peat`, `chalky`, `clay-loam`, `sandy-loam`, `forest-humus`, `garden-mix`, `compost-enriched`. Example: `sandy-loam`. |
| `ph_level` | number | - | Measured or estimated soil pH. 7.0 = neutral. min 0, max 14. Example: `6.5`. |
| `ph_measured_date` | `iso_date` | - | When pH was last measured. Omit if estimated. |
| `organic_matter_percent` | number | - | Estimated organic matter content. min 0, max 100. Example: `5`. |
| `moisture_retention` | enum | - | How well the soil retains water. One of: `very-low`, `low`, `moderate`, `high`, `very-high`. |
| `drainage` | enum | - | How quickly water drains through. One of: `poor`, `moderate`, `good`, `excessive`. |
| `texture_description` | string | - | Free-text description of soil feel and composition. Example: `Piaszczysty z domieszką gliny, dobrze przepuszczalny`. |
| `amendments` | list of `soil_amendment` | - | Recommended or applied soil amendments with dosage, timing, and product info. Answers CQ37. Used by T10 (calendar) and T11 (shopping list). |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

### `nature/vegetation.schema.yaml`

Individual plant specimens (significant trees, notable shrubs) and categorical planting groups (hedges, flower beds, lawns). Tracks species, botanical needs, spatial placement, and watering requirements. Nature plane.

#### Specimen - `SPM###`

An individual plant or tree significant enough to track independently. Large trees are spatial landmarks with canopy radius. Answers CQ09 (identity, position, area). Used by T2 (inventory), T3 (garden planning), T5 (spatial layout - rendered as circle with canopy_radius_m).

Accepts `x-` extension fields.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `Old Oak by the Pond`. |
| `specimen_type` | enum | yes | Growth form classification. One of: `tree-deciduous`, `tree-evergreen`, `tree-fruit`, `shrub-deciduous`, `shrub-evergreen`, `shrub-fruit`, `perennial`, `climber`, `bamboo`, `palm`. Example: `tree-deciduous`. |
| `species` | string | - | Botanical species name. Example: `Quercus robur`. |
| `common_name` | string | - | Example: `English Oak`. |
| `height_m` | number | - | Example: `12`. |
| `canopy_radius_m` | number | - | Radius of the canopy circle in meters. Used by T5 to render the specimen as a circle centered on its position. Answers CQ09 (area occupied by the tree). Example: `5`. |
| `trunk_diameter_cm` | number | - | Diameter at breast height (DBH). Relevant for protected tree classification. Example: `45`. |
| `crown_bottom_height_m` | number | - | Height of the bottom of the canopy above ground (clear trunk height). Used for 3D canopy placement - the canopy sphere/ellipsoid starts here. Example: a tree with height_m=12 and crown_bottom_height_m=4 has an 8m tall canopy starting 4m above ground. min 0. Example: `4`. |
| `trunk_height_m` | number | - | Height of the visible trunk from ground to first major branch. May differ from crown_bottom_height_m if branches extend below canopy. Example: `3`. |
| `canopy_shape` | enum | - | Approximate 3D shape of the canopy for rendering. Determines which geometry primitive the 3D viewer uses. One of: `sphere`, `ellipsoid-tall`, `ellipsoid-wide`, `cone`, `column`, `umbrella`, `weeping`, `irregular`. Default `"sphere"`. Example: `cone`. |
| `growth_rate_cm_per_year` | number | - | Average annual height growth rate. Answers CQ28. Example: `50`. |
| `mature_height_m` | number | - | Expected final height at maturity. Answers CQ28. Example: `20`. |
| `height_measured_date` | `iso_date` | - | Date when height_m was last measured. |
| `condition` | enum | - | Current botanical health condition. One of: `healthy`, `stressed`, `damaged`, `recovering`, `dead`, `dormant`. Example: `healthy`. |
| `planted_date` | `iso_date` | - | When this specimen was planted (or estimated if pre-existing). |
| `estimated_age_years` | integer | - | min 0. Example: `80`. |
| `is_protected` | boolean | - | Whether this tree/plant is under legal protection (heritage tree, etc.). |
| `sun_requirement` | enum | - | Light needs for healthy growth. Used by T3 (garden planning). One of: `full-sun`, `partial-sun`, `partial-shade`, `full-shade`. Example: `partial-sun`. |
| `water_requirement` | enum | - | Irrigation needs. Used by T3. One of: `drought-tolerant`, `low`, `moderate`, `high`. Example: `low`. |
| `hardiness_zone_min` | string | - | Coldest zone this specimen tolerates. Example: `5a`. |
| `leaf_retention` | enum | - | Deciduous (drops leaves) or evergreen. Affects year-round screening. One of: `deciduous`, `evergreen`, `semi-evergreen`. |
| `bloom_months` | list of integer | - | Months when this specimen flowers (1-12). |
| `outdoor_zone_ref` | `outdoor_zone_ref` | yes | Outdoor zone where this specimen grows. |
| `position` | `position` | - | Center of this specimen on the property grid. |
| `companion_specimen_refs` | list of `specimen_ref` | - | Other specimens that benefit from proximity. Used by T3. |
| `antagonist_specimen_refs` | list of `specimen_ref` | - | Specimens that should be kept distant. Used by T3. |
| `care_profile_ref` | `care_profile_ref` | - | Species-level care protocol for this specimen. Answers CQ35, CQ38, CQ39. |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

#### Planting - `PTG###`

A categorical group of plants: a hedge row, flower bed, lawn section, vegetable bed, or mixed border. Tracks species, count, aggregate area, and care schedule. Answers CQ10 (species, watering needs per zone) and CQ11 (organization). Used by T2, T3.

Accepts `x-` extension fields.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `South Hedge`. |
| `planting_type` | enum | yes | Category of this planting group. One of: `hedge`, `flower-bed`, `vegetable-bed`, `herb-garden`, `ground-cover`, `lawn`, `meadow-section`, `mixed-border`, `raised-bed`, `container-group`, `climbing-wall`, `green-roof`. Example: `hedge`. |
| `species` | string | - | Dominant species in this planting (for monoculture groups). Example: `Buxus sempervirens`. |
| `common_name` | string | - | Example: `Boxwood`. |
| `species_mix` | list of object | - | Multiple species in this planting (for mixed borders, meadows). |
| `count` | integer | - | Number of individual plants in this group. min 1. Example: `24`. |
| `area_sqm` | number | - | Example: `15`. |
| `spacing_cm` | number | - | Distance between individual plants. Answers CQ28. Example: `60`. |
| `current_height_min_cm` | number | - | Height of the shortest plant in the group. Example: `200`. |
| `current_height_max_cm` | number | - | Height of the tallest plant in the group. Example: `350`. |
| `target_height_m` | number | - | Desired final height (for hedges, privacy screens). Answers CQ28. Example: `3.5`. |
| `age_years` | number | - | Approximate age of the planting. min 0. Example: `8`. |
| `species_confirmed` | boolean | - | Whether species identification has been verified in the field. |
| `sun_requirement` | enum | - | One of: `full-sun`, `partial-sun`, `partial-shade`, `full-shade`. |
| `water_requirement` | enum | - | One of: `drought-tolerant`, `low`, `moderate`, `high`. |
| `watering_schedule` | `rrule_schedule` | - | Recurring watering schedule. Typically active in summer months only. |
| `season` | enum | - | When this planting is actively growing or visible. One of: `spring`, `summer`, `autumn`, `winter`, `year-round`. Example: `year-round`. |
| `outdoor_zone_ref` | `outdoor_zone_ref` | yes |  |
| `position` | `position` | - |  |
| `footprint` | `footprint` | - | Shape of this planting area on the layout. |
| `height_m` | number | - | Current height of this planting group for 3D rendering. For hedges, the maintained height. Derived from current_height_min_cm/max_cm average / 100 if not explicitly set. Example: `2.5`. |
| `render_as` | enum | - | How this planting should appear in 3D scenes. One of: `extruded-polygon`, `ground-cover`, `point-cloud`, `row`. Default `"extruded-polygon"`. |
| `care_profile_ref` | `care_profile_ref` | - | Species-level care protocol for this planting. Answers CQ35, CQ38, CQ39. |
| `leaf_retention` | string | - | Leaf retention habit (e.g., deciduous, evergreen, semi-evergreen). |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

*Inside `species_mix`:*

| Field | Type | Required | Notes |
|---|---|---|---|
| `species` | string | yes | Example: `Lavandula angustifolia`. |
| `common_name` | string | - | Example: `English Lavender`. |
| `proportion_percent` | number | - | min 0, max 100. Example: `30`. |

## Operations

How the property is kept: recurring work, what it costs, and the warranties and regulations that constrain it.

### `operations/compliance.schema.yaml`

Warranty tracking with service conditions that must be met to keep coverage valid, and regulatory requirements for legally mandated inspections and certifications. Operations plane.

#### Warranty - `WRT###`

A manufacturer or installer warranty covering a system or component. Critically tracks service_conditions - the maintenance actions required to keep the warranty valid. Missing a required service voids coverage. Answers CQ14 (expiry, required servicing). Used by T1 (calendar generation - warranty-driven tasks have critical priority).

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `Viessmann Boiler 5-Year Warranty`. |
| `manufacturer` | string | - | Example: `Viessmann`. |
| `warranty_type` | enum | - | Kind of warranty coverage. One of: `manufacturer-standard`, `manufacturer-extended`, `installer`, `third-party`. Example: `manufacturer-standard`. |
| `start_date` | `iso_date` | yes | When warranty coverage begins. |
| `end_date` | `iso_date` | yes | When warranty coverage expires. This is the critical deadline. |
| `covered_system_refs` | list of `system_ref` | - | Systems protected by this warranty. |
| `covered_component_refs` | list of `component_ref` | - | Individual components protected by this warranty. |
| `service_conditions` | list of object | - | Mandatory maintenance actions required to keep the warranty valid. Each condition specifies what must be done, how often, and what evidence is required. THIS IS THE MOST IMPORTANT WARRANTY FIELD - missing a condition voids coverage. Answers CQ14. |
| `void_conditions` | list of string | - | Actions or conditions that void the warranty. |
| `documentation_url` | string (uri) | - | Link to warranty terms document. Example: `https://www.viessmann.com/warranty/terms`. |
| `contact_info` | string | - | Phone number or email for warranty claims. Example: `+49 6452 70-0`. |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

*Inside `service_conditions`:*

| Field | Type | Required | Notes |
|---|---|---|---|
| `description` | string | yes | What must be done to satisfy this condition. Example: `Annual service by certified technician`. |
| `frequency` | `rrule_schedule` | yes | How often this service must be performed. |
| `evidence_required` | string | - | Documentation needed to prove compliance (receipt, stamp, etc.). Example: `Service receipt with technician certification number`. |
| `must_use_certified_technician` | boolean | - | Whether only manufacturer-certified technicians qualify. |
| `last_performed` | `iso_date` | - | Date of most recent compliant service (snapshot in model; history in external store). |

#### Regulatory Requirement - `REG###`

A legally mandated inspection, certification, or safety check. Non-compliance may result in fines, insurance voiding, or safety hazards. Answers CQ15 (deadlines, penalties). Used by T1 (calendar).

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `Annual Gas Safety Inspection`. |
| `requirement_type` | enum | yes | Category of regulatory mandate. One of: `gas-safety`, `electrical-safety`, `chimney-sweep`, `fire-safety`, `elevator-inspection`, `tree-inspection`, `septic-inspection`, `water-quality`, `energy-audit`, `radon-testing`, `asbestos-check`, `lightning-protection`, and 2 more. Example: `gas-safety`. |
| `jurisdiction` | string | - | Country, state, or municipality that mandates this requirement. Example: `Germany`. |
| `legal_basis` | string | - | Law, regulation, or standard that requires this inspection. Example: `Schornsteinfeger-Handwerksgesetz (SchfHwG)`. |
| `inspection_schedule` | `rrule_schedule` | yes | How often this inspection must be performed. |
| `penalty_description` | string | - | What happens if this requirement is not met. Example: `Fine up to €5,000 and potential insurance claim denial`. |
| `target_system_refs` | list of `system_ref` | - | Systems that must comply with this requirement. |
| `target_building_refs` | list of `building_ref` | - |  |
| `last_inspection_date` | `iso_date` | - | Date of most recent passing inspection (snapshot; history in external store). |
| `next_due_date` | `iso_date` | - | Calculated or manually set next inspection deadline. |
| `certified_inspector_required` | boolean | - | Whether only a licensed/certified inspector may perform the check. |
| `notification_rule_refs` | list of `notification_rule_ref` | - | Alerts for upcoming inspection deadlines. |
| `overdue_since` | `iso_date` | - | Date since which this requirement is overdue. Null/omitted if current. |
| `consequence_description` | string | - | Specific consequences of non-compliance beyond penalty_description: insurance implications, mortgage conditions, safety hazards. Example: `Insurance claim denial by Nationale-Nederlanden; mortgage condition violation at Bank Millennium`. |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

### `operations/maintenance.schema.yaml`

Recurring maintenance tasks with RRULE scheduling, notification rules, and cost categories. The engine for generating maintenance calendars and cost dashboards. Operations plane.

#### Maintenance Task - `MT###`

A recurring maintenance activity targeting a specific element (system, building, zone, plant, etc.). Defines what needs doing, how often (RRULE schedule), and what alerts to trigger. Answers CQ13 (due dates). Used by T1 (calendar generation).

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `Annual Boiler Service`. |
| `kind` | enum | - | High-level domain classification. Used to group tasks in reports and PDF generators. One of: `garden`, `building`, `infrastructure`. Example: `garden`. |
| `task_type` | enum | yes | Classification of the maintenance activity. One of: `inspection`, `cleaning`, `servicing`, `replacement`, `seasonal-prep`, `treatment`, `pruning`, `mowing`, `watering`, `fertilizing`, `testing`, `calibration`, and 9 more. Example: `servicing`. |
| `target_ref` | `maintainable_element_ref` | yes | The element this task maintains (system, component, building, zone, plant, etc.). |
| `schedule` | `rrule_schedule` | yes | When and how often this task recurs. |
| `estimated_duration_minutes` | integer | - | How long the task typically takes. min 1. Example: `60`. |
| `priority` | enum | - | Importance level. Critical = safety/warranty risk if missed. One of: `critical`, `high`, `medium`, `low`. Example: `high`. |
| `season` | enum | - | Season when this task is most relevant. One of: `spring`, `summer`, `autumn`, `winter`, `year-round`. |
| `instructions` | string | - | Step-by-step procedure or notes for performing this task. Example: `1. Turn off boiler
2. Clean condensate trap
3. Check flue
4. Test safety valves`. |
| `tools_required` | list of string | - | List of tools or supplies needed. |
| `executions` | list of `execution` | - | The occasions on which this task was actually carried out. A recurring task states how often it should happen; this list states when it did, which is what answers "when was this last done" and "what has it cost over the years". The most recent date, the number of occasions and the running total are read from this list rather than stored beside it, so they cannot disagree with it. Answers CQ34. |
| `warranty_ref` | `warranty_ref` | - | Warranty that requires this task to remain valid. Answers CQ14. |
| `regulatory_requirement_ref` | `regulatory_requirement_ref` | - | Regulatory requirement that mandates this task. Answers CQ15. |
| `notification_rule_refs` | list of `notification_rule_ref` | - | Notifications to trigger for this task. |
| `cost_category_ref` | `cost_category_ref` | - | Budget category for this task's costs. |
| `care_profile_ref` | `care_profile_ref` | - | Species care profile this task originates from. Links operational task to species-level protocol. Answers CQ36 (supplies needed). Used by T10 (care calendar) and T11 (shopping list). |
| `estimated_cost` | number | - | min 0. Example: `250`. |
| `currency` | string | - | Example: `EUR`. |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

#### Notification Rule - `NR###`

Defines how and when to alert about upcoming maintenance tasks or compliance deadlines. Answers CQ17 (channel, lead time). Used by T1.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `30-Day Email Reminder`. |
| `lead_time_days` | integer | yes | How many days before the due date to trigger the notification. min 0. Example: `30`. |
| `channel` | `notification_channel` | yes |  |
| `recipient` | string | - | Email address, phone number, or webhook URL. Example: `owner@example.com`. |
| `message_template` | string | - | Template with {task_name}, {due_date}, {target} placeholders. Example: `{task_name} is due on {due_date} for {target}`. |
| `repeat_if_unacknowledged` | boolean | - | Whether to resend if the notification is not acknowledged. |
| `repeat_interval_days` | integer | - | Days between repeated notifications. min 1. Example: `3`. |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

#### Cost Category - `CC###`

A budget classification for grouping costs. Detailed cost records are stored in the external data store keyed by cost_category_ref. Answers CQ16 (annual costs by category). Used by T9.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `Electricity`. |
| `category_type` | enum | yes | High-level cost classification. One of: `energy-electricity`, `energy-gas`, `energy-heating-oil`, `energy-wood`, `energy-pellet`, `water`, `sewage`, `internet`, `telephone`, `heating-maintenance`, `garden-maintenance`, `building-maintenance`, and 7 more. Example: `energy-electricity`. |
| `annual_budget_estimate` | number | - | Expected annual spend in this category. min 0. Example: `1200`. |
| `currency` | string | - | Example: `EUR`. |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

## Context

What surrounds the property and cannot be changed from inside it: neighbours, roads, environmental factors, and the people involved.

### `context/persons.schema.yaml`

People and organizations involved with the property: owners, household members, contractors, service providers. Each person is a first-class entity with typed ID. Referenced from estate changes (coordinator), maintenance tasks, warranties, and optionally from neighbor properties. Context plane.

#### Person - `PRS###`

A person or organization involved with the property: owner, household member, contractor, service provider. Can be referenced as estate change coordinator or maintenance assignee. Answers CQ32.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Full name of person or organization name. Example: `Jan Kowalski`. |
| `person_type` | enum | - | Role category in relation to the property. One of: `owner`, `household-member`, `contractor`, `service-provider`, `neighbor`, `family-member`, `other`. Example: `owner`. |
| `company` | string | - | Company or organization name (for contractors, service providers). Example: `ElektroSerwis Sp. z o.o.`. |
| `role` | string | - | Free-text role description. Example: `właściciel`. |
| `email` | string (email) | - | Example: `jan@example.com`. |
| `phone` | string | - | Phone number in international or local format. Example: `+48 123 456 789`. |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

### `context/surroundings.schema.yaml`

External environment: neighbor properties as first-class entities with descriptive attributes, shared concerns between properties, and environmental factors affecting the estate. Context plane.

#### Neighbor Property - `NP###`

An adjacent property modeled as a first-class entity. Tracks physical characteristics (building height, distance), usage patterns (noise, occupancy), and boundary relationships. Answers CQ19 (shared concerns) and CQ22 (shade from neighbor structures). Used by T4 (privacy assessment), T5 (simplified rendering on layout).

Accepts `x-` extension fields.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Descriptive label (not the owner's name). Example: `North Neighbor (Two-Story House)`. |
| `cadastral_id` | string | - | Official land registry / cadastral identifier of the neighbor parcel. Example: `35/18`. |
| `direction` | `compass_direction` | yes | Which side of the estate this neighbor is on. |
| `property_type` | enum | - | General land use of the neighbor property. One of: `residential-single`, `residential-multi`, `commercial`, `agricultural`, `industrial`, `public`, `recreational`, `vacant`, `forest`, `water`. Example: `residential-single`. |
| `building_height_m` | number | - | Height of the tallest structure. Used for shade analysis (CQ22). Example: `8`. |
| `eave_height_m` | number | - | Height of the neighbor building's eave in meters. |
| `building_stories` | integer | - | min 1. Example: `2`. |
| `distance_from_boundary_m` | number | - | Distance from the neighbor's nearest building to the shared boundary. min 0. Example: `3`. |
| `has_windows_facing` | boolean | - | Whether the neighbor building has windows overlooking our property. Privacy concern. |
| `terrain_elevation_offset_cm` | number | - | Neighbor terrain height relative to estate ground level. Positive = neighbor is higher. Affects drainage (CQ19) and privacy assessment (T4). Answers CQ29. Example: `25`. |
| `foundation_elevation_offset_cm` | number | - | Neighbor building foundation height relative to estate ground level. Combined with terrain offset gives effective overlooking height. Answers CQ29. Example: `80`. |
| `household_count` | integer | - | Number of households occupying the property. min 1. Example: `2`. |
| `occupancy` | enum | - | How regularly the property is occupied. One of: `permanent`, `seasonal`, `weekend`, `vacant`, `unknown`. Example: `permanent`. |
| `noise_level` | enum | - | Typical noise impact from this neighbor. One of: `quiet`, `moderate`, `loud`, `variable`. Example: `moderate`. |
| `crowd_level` | enum | - | Frequency and volume of human activity (parties, gatherings, traffic). One of: `low`, `moderate`, `high`. Example: `low`. |
| `has_pets` | boolean | - | Whether the neighbor has outdoor pets (dogs, etc.) that impact boundary. |
| `has_outdoor_lighting` | boolean | - | Whether neighbor lighting impacts our property (light pollution). |
| `boundary_segment_refs` | list of `boundary_segment_ref` | - | Boundary segments between our property and this neighbor. |
| `position` | `position` | - | Approximate center of the neighbor's nearest structure (for 2D layout). |
| `footprint` | `polygon_footprint` | - | Outline of the neighbor's main building/structure (relative to position). Used by 2D ContextLayer for the massing block, and by 3D NeighborLayer for the building extrusion. For just the parcel boundary use parcel_footprint. |
| `parcel_footprint` | `polygon_footprint` | - | Outline of the neighbor's land parcel (cadastral polygon, relative to position). Rendered as a flat ground platform in 3D scene. Distinct from `footprint` which represents the building. Useful for vacant plots, forests, and any case where parcel boundary matters more than a single structure. |
| `parcel_vertex_elevations` | list of number | - | Per-vertex elevation (m, relative to model vertical datum / origin) for each vertex of `parcel_footprint`. Length must equal `parcel_footprint.vertices.length`. When present, the 3D viewer renders the parcel as a fan-triangulated tilted surface (each triangle = centroid + 2 adjacent vertices). When absent, the parcel is rendered flat at `terrain_elevation_offset_cm`. Same vertex order. |
| `roof_type` | enum | - | Approximate roof form for 3D massing context. One of: `flat`, `gable`, `hip`, `gambrel`, `mansard`, `shed`, `mono-pitch`, `unknown`. Default `"unknown"`. Example: `gable`. |
| `roof_ridge_height_m` | number | - | Approximate ridge height above neighbor's ground level. Example: `9.5`. |
| `ground_elevation_offset_m` | number | - | Neighbor's ground level relative to the model vertical datum. Positive = neighbor is higher. Used for 3D massing placement. May differ from terrain_elevation_offset_cm (which is an observation); this is the value used for rendering. Default `0`. Example: `0.25`. |
| `has_pv_panels` | boolean | - | Whether the neighbor has photovoltaic panels (relevant for shadow analysis). |
| `pv_panel_roof_side` | `compass_direction` | - | Which side of the roof the PV panels are mounted on. |
| `resident_refs` | list of `person_ref` | - | Known residents of this property (optional PRS### references). |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

#### Shared Concern - `SC###`

A specific issue or matter shared between this property and a neighbor: overhanging branches, drainage disputes, noise complaints, shared fence maintenance. Answers CQ19. Used by T4 (privacy assessment).

Accepts `x-` extension fields.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `Overhanging Oak Branches (North)`. |
| `concern_type` | enum | yes | Category of the shared concern. One of: `overhanging-branches`, `root-encroachment`, `drainage`, `shared-fence`, `noise`, `visual-privacy`, `shade-cast`, `light-pollution`, `pet-access`, `parking`, `access-right`, `boundary-dispute`, and 1 more. Example: `overhanging-branches`. |
| `neighbor_property_ref` | `neighbor_property_ref` | yes | The neighbor property involved in this concern. |
| `severity` | enum | - | Impact level of this concern. One of: `minor`, `moderate`, `significant`. Example: `moderate`. |
| `status` | enum | - | Current state of this concern. One of: `unresolved`, `discussed`, `agreed`, `resolved`, `recurring`. Example: `discussed`. |
| `resolution_notes` | string | - | What was agreed or how it was resolved. Example: `Agreed to split fence replacement cost 50/50 in spring 2027`. |
| `affected_boundary_segment_ref` | `boundary_segment_ref` | - | Boundary segment where this concern manifests. |
| `affected_zone_ref` | `outdoor_zone_ref` | - | Outdoor zone most impacted by this concern. |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

#### Environmental Factor - `EF###`

An environmental condition affecting the property: prevailing wind, sun path, flood risk, soil conditions, noise from roads, etc. Answers CQ22 (sun exposure, wind impact). Used by T3 (garden planning), T4 (privacy - wind-borne noise), T5 (annotation on layout).

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `Prevailing West Wind`. |
| `factor_type` | enum | yes | Category of environmental condition. One of: `prevailing-wind`, `sun-path`, `flood-risk`, `soil-contamination`, `groundwater-level`, `air-quality`, `light-pollution`, `traffic-noise`, `aircraft-noise`, `wildlife-corridor`, `frost-pocket`, `microclimate-warm`, and 2 more. Example: `prevailing-wind`. |
| `direction` | `compass_direction` | - | Compass direction associated with this factor (e.g., wind from W, noise from S). |
| `intensity` | enum | - | Strength or severity of this factor. One of: `very-low`, `low`, `moderate`, `high`, `very-high`. Example: `moderate`. |
| `seasonal_variation` | string | - | How this factor changes with seasons. Example: `Stronger in autumn/winter`. |
| `affected_zone_refs` | list of `outdoor_zone_ref` | - | Outdoor zones most impacted by this factor. |
| `position` | `position` | - | Position on the layout for annotation rendering (optional). |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

#### Road Corridor - `RD###`

Public road, shared driveway, or access lane that touches or borders the estate. Modeled as a polyline centerline with constant width - sufficient for site plan rendering and proximity / noise analysis. Distinct from outdoor_zone (driveway *inside* the estate) and neighbor_property (land parcels). Renderable as a flat strip in 2D and 3D scenes.

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes | Example: `ul. Słowicza`. |
| `surface_type` | enum | - | Primary surface material of the road. One of: `asphalt`, `concrete`, `paved-stone`, `gravel`, `dirt`, `grass`, `mixed`, `unknown`. Default `"unknown"`. Example: `asphalt`. |
| `width_m` | number | yes | Total width of the corridor (from edge to edge). Example: `5`. |
| `centerline` | `polyline3d` | yes | Sequence of 3D vertices along the road centerline (open polyline). Z values represent ground elevation along the road relative to the model's vertical datum. Minimum 2 vertices. |
| `is_public` | boolean | - | Whether this is a publicly maintained road (vs. private driveway). |
| `direction` | `compass_direction` | - | Approximate compass direction of the road (for annotation). |
| `borders_neighbor_refs` | list of `neighbor_property_ref` | - | NeighborProperty entities the road separates this estate from. |
| `description` | string | - |  |
| `tags` | `tags` | - |  |

## Shared types

Definitions the planes draw on. The reference types (`parcel_ref`, `room_ref` and their siblings) are the identifier patterns; the rest are shapes reused across entities.

| Type | Shape | Notes |
|---|---|---|
| `semver` | pattern `^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$` | Semantic version string (MAJOR.MINOR.PATCH). Example: `1.0.0`. |
| `schema_version` | enum | Realm schema version this document targets. The v2.2 schemas accept documents declaring 2.1.0 and 2.0.0; 2.2.0 renamed the migration entity to estate_change, so an older document that uses that construct needs the rename before it will validate. One of: `2.2.0`, `2.1.0`, `2.0.0`. |
| `tags` | list of string | Arbitrary classification tags for filtering and grouping. |
| `iso_date` | string (date) | Date in YYYY-MM-DD format. Example: `2026-03-08`. |
| `flexible_date` | pattern `^\d{4}-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?$` | A full calendar date, or a year and month when the day is not known. Recorded events often come from memory or from a receipt that names only the month; this type keeps that distinction visible instead of inviting an invented day. Lexicographic order is chronological order, so values sort correctly whichever precision they carry. Example: `2025-04-18`. |
| `position` | object | Property-relative position in the coordinate system's unit (default meters). Origin and north direction defined by the realm's coordinate_system. Answers CQ21. Used by T5 for 2D spatial layout rendering. |
| `polygon_footprint` | object | Closed polygon defined by vertices relative to the element's position (centroid). Vertices are in local coordinates before rotation. The renderer rotates by the element's rotation_degrees then translates by position. Used by T5. |
| `circle_footprint` | object | Circular shape centered on the element's position. Used for tree canopies (CQ09) and round features. Used by T5. |
| `footprint` | `polygon_footprint` or `circle_footprint` | Ground-projection shape of an element - polygon or circle. |
| `position3d` | object | Property-relative position with elevation above vertical datum. |
| `vertex3d` | object | 3D vertex for use in polygon and polyline contexts. Identical shape to position3d - use position3d for point locations, vertex3d for polygon and polyline vertices. |
| `polyline3d` | object | Ordered sequence of 3D vertices forming an open path. |
| `polygon3d` | object | Closed 3D polygon defined by ordered vertices. First and last vertices are implicitly connected. Vertices must be CCW when viewed from the outward-facing side (normal follows right-hand rule). |
| `coordinate_system` | object | Property-relative 2D coordinate system. Defines where (0,0) is, which direction is north, and the measurement unit. All positions in the model are relative to this system. Answers CQ21. Used by T5. |
| `compass_direction` | enum | Cardinal or intercardinal compass direction. One of: `N`, `NE`, `E`, `SE`, `S`, `SW`, `W`, `NW`. |
| `spatial_relation` | object | Directional or proximity relationship between two positioned elements. Answers CQ21 (relative positioning) and CQ22 (shade/exposure). Used by T4 (privacy assessment) and T5 (layout rendering). |
| `rrule_schedule` | object | Recurring schedule using iCalendar RRULE (RFC 5545). Stores the pattern; instances are calculated at runtime. Answers CQ13 (due dates), CQ14 (warranty service intervals), CQ10 (watering). Used by T1, T3, T8. |
| `execution` | object | One occasion on which planned work was actually carried out. Its identity is the work plus the date, so it is recorded in place on the task or change it belongs to rather than as an entity of its own. When an execution acquires meaning beyond the work itself - it caused damage, it involved other people, it is worth finding later on its own terms - `event_ref` promotes it to an Event, which is where participants and outcomes are recorded. Answers CQ34. |
| `cost_record_shape` | object | Contract for cost records stored in the external data store (SQLite). Not stored in the YAML model - defines the record shape for the companion store. Answers CQ16. Used by T9. |
| `measurement_record_shape` | object | Contract for telemetry/measurement records in the external data store. Covers energy readings, temperature, humidity, flow meters, etc. Used by T6 (infrastructure map), T9 (cost dashboard). |
| `notification_channel` | enum | Delivery channel for maintenance and compliance notifications. Answers CQ17. One of: `email`, `sms`, `push`, `calendar`, `webhook`. |
| `location` | object | Geographic location and postal address. Latitude/longitude are for climate lookups and sun-path estimation, not for spatial layout (which uses the property-relative coordinate system). Answers CQ01. Used by T2. |
| `climate_profile` | object | Climate metadata for the property. Drives garden planning (CQ11), plant selection (CQ09, CQ10), and seasonal maintenance scheduling (CQ13). Used by T3 (garden advisory). |
| `parcel_ref` | pattern `^([a-z][a-z0-9-]*\.)?LP\d{3,}$` | Typed reference to a Land Parcel entity. Example: `LP001`. |
| `building_ref` | pattern `^([a-z][a-z0-9-]*\.)?BLD\d{3,}$` | Typed reference to a Building entity. Example: `BLD001`. |
| `floor_ref` | pattern `^([a-z][a-z0-9-]*\.)?FLR\d{3,}$` | Typed reference to a Floor entity. Example: `FLR001`. |
| `room_ref` | pattern `^([a-z][a-z0-9-]*\.)?RM\d{3,}$` | Typed reference to a Room entity. Example: `RM001`. |
| `outdoor_zone_ref` | pattern `^([a-z][a-z0-9-]*\.)?OZ\d{3,}$` | Typed reference to an Outdoor Zone entity. Example: `OZ001`. |
| `boundary_segment_ref` | pattern `^([a-z][a-z0-9-]*\.)?BS\d{3,}$` | Typed reference to a Boundary Segment entity. Example: `BS001`. |
| `furniture_ref` | pattern `^([a-z][a-z0-9-]*\.)?FRN\d{3,}$` | Typed reference to a Furniture entity (v1.1). Example: `FRN001`. |
| `equipment_ref` | pattern `^([a-z][a-z0-9-]*\.)?EQP\d{3,}$` | Typed reference to an Equipment entity (v1.1). Example: `EQP001`. |
| `tool_ref` | pattern `^([a-z][a-z0-9-]*\.)?TL\d{3,}$` | Typed reference to a portable Tool entity (v1.4). Example: `TL001`. |
| `wing_ref` | pattern `^([a-z][a-z0-9-]*\.)?WNG\d{3,}$` | Typed reference to a structural wing of a building (v2.0). Example: `WNG001`. |
| `wall_segment_ref` | pattern `^([a-z][a-z0-9-]*\.)?WSG\d{3,}$` | Typed reference to a wall segment in the construction layer (v2.0). Example: `WSG001`. |
| `slab_ref` | pattern `^([a-z][a-z0-9-]*\.)?SLB\d{3,}$` | Typed reference to a floor/ceiling slab in the construction layer (v2.0). Example: `SLB001`. |
| `roof_plane_ref` | pattern `^([a-z][a-z0-9-]*\.)?RFP\d{3,}$` | Typed reference to a roof plane in the construction layer (v2.0). Example: `RFP001`. |
| `event_ref` | pattern `^([a-z][a-z0-9-]*\.)?EVT\d{3,}$` | Typed reference to an Event entity in the event log (v2.0). Example: `EVT001`. |
| `estate_change_ref` | pattern `^([a-z][a-z0-9-]*\.)?ECH\d{3,}[a-z]?$` | Typed reference to an Estate Change entity. The optional trailing letter addresses one member of a change family, so a reference can name either the family parent or a single member of it. Example: `ECH015`. |
| `system_ref` | pattern `^([a-z][a-z0-9-]*\.)?SYS\d{3,}$` | Typed reference to an infrastructure System entity. Example: `SYS001`. |
| `component_ref` | pattern `^([a-z][a-z0-9-]*\.)?CMP\d{3,}$` | Typed reference to a Component entity within a system. Example: `CMP001`. |
| `utility_connection_ref` | pattern `^([a-z][a-z0-9-]*\.)?UC\d{3,}$` | Typed reference to a Utility Connection entity. Example: `UC001`. |
| `network_node_ref` | pattern `^([a-z][a-z0-9-]*\.)?NN\d{3,}$` | Typed reference to a Network Node entity. Example: `NN001`. |
| `iot_device_ref` | pattern `^([a-z][a-z0-9-]*\.)?IOT\d{3,}$` | Typed reference to an IoT Device entity. Example: `IOT001`. |
| `network_link_ref` | pattern `^([a-z][a-z0-9-]*\.)?NL\d{3,}$` | Typed reference to a Network Link entity. Example: `NL001`. |
| `specimen_ref` | pattern `^([a-z][a-z0-9-]*\.)?SPM\d{3,}$` | Typed reference to a Specimen (individual plant/tree) entity. Example: `SPM001`. |
| `planting_ref` | pattern `^([a-z][a-z0-9-]*\.)?PTG\d{3,}$` | Typed reference to a Planting (categorical group) entity. Example: `PTG001`. |
| `biomass_flow_ref` | pattern `^([a-z][a-z0-9-]*\.)?BMF\d{3,}$` | Typed reference to a Biomass Flow entity. Example: `BMF001`. |
| `care_profile_ref` | pattern `^([a-z][a-z0-9-]*\.)?SCP\d{3,}$` | Typed reference to a Species Care Profile entity (v1.6). Example: `SCP001`. |
| `soil_profile_ref` | pattern `^([a-z][a-z0-9-]*\.)?SOIL\d{3,}$` | Typed reference to a Soil Profile entity (v1.6). Example: `SOIL001`. |
| `planting_recommendation_ref` | pattern `^([a-z][a-z0-9-]*\.)?REC\d{3,}$` | Typed reference to a Planting Recommendation entity (v1.7). Example: `REC001`. |
| `maintenance_task_ref` | pattern `^([a-z][a-z0-9-]*\.)?MT\d{3,}$` | Typed reference to a Maintenance Task entity. Example: `MT001`. |
| `notification_rule_ref` | pattern `^([a-z][a-z0-9-]*\.)?NR\d{3,}$` | Typed reference to a Notification Rule entity. Example: `NR001`. |
| `cost_category_ref` | pattern `^([a-z][a-z0-9-]*\.)?CC\d{3,}$` | Typed reference to a Cost Category entity. Example: `CC001`. |
| `warranty_ref` | pattern `^([a-z][a-z0-9-]*\.)?WRT\d{3,}$` | Typed reference to a Warranty entity. Example: `WRT001`. |
| `regulatory_requirement_ref` | pattern `^([a-z][a-z0-9-]*\.)?REG\d{3,}$` | Typed reference to a Regulatory Requirement entity. Example: `REG001`. |
| `neighbor_property_ref` | pattern `^([a-z][a-z0-9-]*\.)?NP\d{3,}$` | Typed reference to a Neighbor Property entity. Example: `NP001`. |
| `shared_concern_ref` | pattern `^([a-z][a-z0-9-]*\.)?SC\d{3,}$` | Typed reference to a Shared Concern entity. Example: `SC001`. |
| `environmental_factor_ref` | pattern `^([a-z][a-z0-9-]*\.)?EF\d{3,}$` | Typed reference to an Environmental Factor entity. Example: `EF001`. |
| `person_ref` | pattern `^([a-z][a-z0-9-]*\.)?PRS\d{3,}$` | Typed reference to a Person or Organization entity (v1.4). Example: `PRS001`. |
| `any_entity_ref` | pattern `^([a-z][a-z0-9-]*\.)?([A-Z]{2,4}\d{3,}|ECH\d{3,}[a-z])$` | Reference to an entity of any type, for fields that deliberately accept a cross-plane mix. Estate Change ids carry an optional trailing letter addressing one member of a change family; every other prefix is digits only. Example: `SPM020`. |
| `positioned_element_ref` | `parcel_ref` or `building_ref` or `outdoor_zone_ref` or `boundary_segment_ref` or `specimen_ref` or `system_ref` or `component_ref` or `network_node_ref` or `iot_device_ref` or `wing_ref` or `floor_ref` or `room_ref` or `planting_ref` or `neighbor_property_ref` or `equipment_ref` or `furniture_ref` | Reference to any element that can have a spatial position on the property layout. Used in spatial_relation from/to fields. |
| `maintainable_element_ref` | `parcel_ref` or `system_ref` or `component_ref` or `building_ref` or `room_ref` or `outdoor_zone_ref` or `boundary_segment_ref` or `specimen_ref` or `planting_ref` or `network_node_ref` or `iot_device_ref` or `equipment_ref` or `tool_ref` | Reference to any element that can be a maintenance target. Used in maintenance_task.target_ref. |
| `biomass_source_ref` | `specimen_ref` or `outdoor_zone_ref` | Reference to an element that produces biomass (specimen or outdoor zone). |
| `biomass_destination_ref` | `outdoor_zone_ref` or `system_ref` | Reference to where processed biomass is used (zone for compost, system for fuel). |
| `room_or_zone_ref` | `room_ref` or `outdoor_zone_ref` | Reference to a room or outdoor zone (for system distribution targets). |
| `specs` | list of object | Generic key-value-unit specification pairs for equipment, appliances, or other entities with diverse technical attributes. Used by T2 (inventory report) to surface specifications without schema-per-type. |

## Configuration

`realm-config.yaml` is settings rather than model content: it carries no entities and contributes nothing to the graph. It is validated like any other file.

| Field | Type | Required | Notes |
|---|---|---|---|
| `schema_version` | `schema_version` | - | Realm schema version this configuration targets. |
| `inference` | `inference_config` | - |  |
| `validation` | `validation_config` | - |  |
| `rendering` | `rendering_config` | - |  |

### `inference_config`

Tolerances and defaults used by the AI agent during semantic → construction geometry inference. Each parameter documents which inference rule (R01–R07) consumes it.

| Field | Type | Required | Notes |
|---|---|---|---|
| `wall_alignment_tolerance_cm` | number | - | When two room edges are within this distance, they are considered to share a wall line. Used in R05 (wall segment generation) for snapping parallel edges into a single wall line. Default `5`. min 0. Example: `5`. |
| `room_overlap_tolerance_sqm` | number | - | Maximum acceptable overlap area between two room footprints before a warning is raised. Small overlaps occur due to wall thickness sharing and rounding. Default `0.1`. min 0. Example: `0.1`. |
| `room_gap_threshold_m` | number | - | When the gap between two adjacent rooms exceeds this threshold, the agent classifies it as a potential corridor or open space rather than a wall alignment error. Default `0.5`. min 0. Example: `0.5`. |
| `default_interior_wall_thickness_cm` | number | - | Fallback wall thickness for interior walls when the semantic room data does not specify walls.X.thickness_cm. Used in R05. Default `12`. Example: `12`. |
| `default_exterior_wall_thickness_cm` | number | - | Fallback wall thickness for exterior walls when the semantic room data does not specify walls.X.thickness_cm. Typically includes structure + insulation. Used in R05. Default `24`. Example: `24`. |
| `default_slab_thickness_cm` | number | - | Fallback slab thickness when floor data does not specify slab_thickness_cm. Used in R02 (floor slab generation). Default `20`. Example: `20`. |
| `default_roof_overhang_cm` | number | - | Default eave overhang distance beyond the building footprint when not specified on individual wing.roof_overhang_cm. Used in R07 (roof plane generation). Default `30`. min 0. Example: `30`. |
| `default_ceiling_height_m` | number | - | Fallback ceiling height when floor.ceiling_height_m and room.ceiling_height_cm are both absent. Used in R04 and R05 for wall height computation. Default `2.6`. Example: `2.6`. |
| `default_ceiling_height_cm` | number | - | Fallback ceiling height in centimeters used for inference. Example: `260`. |

### `validation_config`

Thresholds used during post-inference validation (V01–V05) to determine acceptable geometric tolerances.

| Field | Type | Required | Notes |
|---|---|---|---|
| `slab_area_tolerance_percent` | number | - | Maximum percentage by which a slab outline area may differ from the building footprint area. Used in V03 (slab coverage). Default `10`. min 0, max 100. Example: `10`. |
| `roof_coverage_tolerance_percent` | number | - | Maximum percentage by which the sum of projected roof plane areas may exceed the building footprint area. Allows for overhangs. Used in V04 (roof coverage). Default `15`. min 0, max 100. Example: `15`. |
| `coplanarity_tolerance_cm` | number | - | Maximum distance a roof plane vertex may deviate from the ideal geometric plane before a warning is raised. Default `1`. min 0. Example: `1`. |
| `wall_coverage_tolerance_percent` | number | - | Maximum percentage of building perimeter that may lack wall segments before a warning is raised. Used in V01 (wall coverage check). Default `5`. min 0, max 100. Example: `5`. |
| `opening_fit_tolerance_cm` | number | - | Maximum distance an opening may overshoot a wall segment edge before being flagged as an error. Accounts for reveal depth and measurement imprecision. Used in V02. Default `2`. min 0. Example: `2`. |
| `wall_thickness_tolerance_cm` | number | - | Maximum acceptable difference between a semantic wall thickness (room.walls.X.thickness_cm) and the generated WSG thickness_cm. Accounts for rounding during shared-wall merging. Default `2`. min 0. Example: `2`. |
| `opening_width_tolerance_cm` | number | - | Maximum acceptable difference between a semantic opening width and the generated wall_opening width_cm. Default `1`. min 0. Example: `1`. |
| `head_height_tolerance_cm` | number | - | Maximum acceptable deviation when checking sill_height_cm + height_cm ≈ head_height_cm on wall openings. Default `5`. min 0. Example: `5`. |
| `elevation_tolerance_m` | number | - | Maximum acceptable difference between computed and declared floor elevations. Used for floor stacking consistency. Default `0.01`. min 0. Example: `0.01`. |

### `rendering_config`

Preferences for visualization consumers. These do not affect inference or validation - they guide how renderers display the model and construction data.

| Field | Type | Required | Notes |
|---|---|---|---|
| `default_lod` | enum | - | Default LOD for 3D rendering. "auto" selects the highest LOD achievable from available data (shell-only → LOD1, with walls/ roofs → LOD2). One of: `auto`, `lod0`, `lod1`, `lod2`. Default `"auto"`. |
| `show_construction_layer` | boolean | - | Whether to render construction geometry (wall segments, roof planes) in 2D/3D views. When false, only semantic data is shown. Default `true`. |
| `show_neighbor_massing` | boolean | - | Whether to render neighbor properties as massing blocks in 3D views. Requires neighbor_property.footprint and building_height_m. Default `true`. |
| `neighbor_massing_color` | string | - | CSS color for neighbor massing blocks in 3D views. Default `"#9E9E9E"`. Example: `#9E9E9E`. |
