# Realm v2.3 schema atlas

Generated from the shipped YAML schemas. The YAML schemas define validation; this atlas lists fields, definitions, references and selected constraints rather than replacing a validator.

## Schema files

- [context/persons.schema.yaml](../../schema/v2.3/context/persons.schema.yaml)
- [context/surroundings.schema.yaml](../../schema/v2.3/context/surroundings.schema.yaml)
- [estate-change.schema.yaml](../../schema/v2.3/estate-change.schema.yaml)
- [events.schema.yaml](../../schema/v2.3/events.schema.yaml)
- [infrastructure/network.schema.yaml](../../schema/v2.3/infrastructure/network.schema.yaml)
- [infrastructure/systems.schema.yaml](../../schema/v2.3/infrastructure/systems.schema.yaml)
- [metamodel.schema.yaml](../../schema/v2.3/metamodel.schema.yaml)
- [nature/biomass.schema.yaml](../../schema/v2.3/nature/biomass.schema.yaml)
- [nature/care.schema.yaml](../../schema/v2.3/nature/care.schema.yaml)
- [nature/recommendations.schema.yaml](../../schema/v2.3/nature/recommendations.schema.yaml)
- [nature/soil.schema.yaml](../../schema/v2.3/nature/soil.schema.yaml)
- [nature/vegetation.schema.yaml](../../schema/v2.3/nature/vegetation.schema.yaml)
- [operations/compliance.schema.yaml](../../schema/v2.3/operations/compliance.schema.yaml)
- [operations/maintenance.schema.yaml](../../schema/v2.3/operations/maintenance.schema.yaml)
- [realm-config.schema.yaml](../../schema/v2.3/realm-config.schema.yaml)
- [realm.schema.yaml](../../schema/v2.3/realm.schema.yaml)
- [risks.schema.yaml](../../schema/v2.3/risks.schema.yaml)
- [topology/boundary.schema.yaml](../../schema/v2.3/topology/boundary.schema.yaml)
- [topology/construction.schema.yaml](../../schema/v2.3/topology/construction.schema.yaml)
- [topology/equipment.schema.yaml](../../schema/v2.3/topology/equipment.schema.yaml)
- [topology/estate.schema.yaml](../../schema/v2.3/topology/estate.schema.yaml)
- [topology/spatial.schema.yaml](../../schema/v2.3/topology/spatial.schema.yaml)
- [topology/tools.schema.yaml](../../schema/v2.3/topology/tools.schema.yaml)
- [visualization/scene.schema.yaml](../../schema/v2.3/visualization/scene.schema.yaml)

## context/persons.schema.yaml

Persons &amp; Organizations

| JSON Pointer | Type / constraints | Reference |
|---|---|---|
| / | type: object; additionalProperties: false; description: People and organizations involved with the property: owners, household members, contractors, service providers. Each person is a first-class entity with typed ID. Referenced from estate changes (coordinator), maintenance tasks, warranties, and optionally from neighbor properties. Context plane.  |  |
| /properties/persons | type: array; description: People and organizations involved with the property. Answers CQ32. |  |
| /properties/persons/items |  | #/$defs/person |
| /$defs/person | type: object; required: &#91;"id","name"&#93;; additionalProperties: false; description: A person or organization involved with the property: owner, household member, contractor, service provider. Can be referenced as estate change coordinator or maintenance assignee. Answers CQ32.  |  |
| /$defs/person/properties | description: {"type":"string"} |  |
| /$defs/person/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?PRS&#92;d{3,}$ |  |
| /$defs/person/properties/name | type: string; description: Full name of person or organization name. |  |
| /$defs/person/properties/person&#95;type | type: string; enum: &#91;"owner","household-member","contractor","service-provider","neighbor","family-member","other"&#93;; description: Role category in relation to the property. |  |
| /$defs/person/properties/company | type: string; description: Company or organization name (for contractors, service providers). |  |
| /$defs/person/properties/role | type: string; description: Free-text role description. |  |
| /$defs/person/properties/email | type: string |  |
| /$defs/person/properties/phone | type: string; description: Phone number in international or local format. |  |
| /$defs/person/properties/description | type: string |  |
| /$defs/person/properties/lifecycle | description: Set when this record has ended; absent means active. Retired records are excluded by default and counted. | ../metamodel.schema.yaml#/$defs/lifecycle |
| /$defs/person/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |

## context/surroundings.schema.yaml

Surroundings &amp; Neighbors

| JSON Pointer | Type / constraints | Reference |
|---|---|---|
| / | type: object; additionalProperties: false; description: External environment: neighbor properties as first-class entities with descriptive attributes, shared concerns between properties, and environmental factors affecting the estate. Context plane.  |  |
| /properties/neighbor&#95;properties | type: array; description: Adjacent properties. Answers CQ19. |  |
| /properties/neighbor&#95;properties/items |  | #/$defs/neighbor&#95;property |
| /properties/shared&#95;concerns | type: array; description: Issues shared with neighbors. Answers CQ19. |  |
| /properties/shared&#95;concerns/items |  | #/$defs/shared&#95;concern |
| /properties/environmental&#95;factors | type: array; description: Environmental conditions affecting the property. Answers CQ22. |  |
| /properties/environmental&#95;factors/items |  | #/$defs/environmental&#95;factor |
| /properties/roads | type: array; description: Public roads or shared driveways that touch the estate, modeled as polylines with width. Distinct from outdoor&#95;zone (driveway inside the estate) and from neighbor&#95;property (adjacent parcels). Used by T5 (layout) and T4 (privacy/noise from traffic).  |  |
| /properties/roads/items |  | #/$defs/road&#95;corridor |
| /$defs/neighbor&#95;feature | type: object; required: &#91;"kind"&#93;; additionalProperties: false; description: One thing standing on a neighbour's land that matters to this estate: a second building, a shed at the fence, a hedge or a row of trees that screens a boundary. A neighbour's position and footprint continue to describe its nearest structure and its main building; features hold everything else, one entry each. A feature with a footprint needs a position, since the footprint is relative to it.  |  |
| /$defs/neighbor&#95;feature/if | required: &#91;"footprint"&#93; |  |
| /$defs/neighbor&#95;feature/then | required: &#91;"position"&#93; |  |
| /$defs/neighbor&#95;feature/properties | description: {"type":"string"} |  |
| /$defs/neighbor&#95;feature/properties/kind | type: string; enum: &#91;"building","outbuilding","hedge","tree-row","fence","wall","other"&#93;; description: What the feature is. Plant kinds may carry species and form. |  |
| /$defs/neighbor&#95;feature/properties/name | type: string |  |
| /$defs/neighbor&#95;feature/properties/species | type: string; description: Botanical name, for hedge and tree-row features. |  |
| /$defs/neighbor&#95;feature/properties/common&#95;name | type: string |  |
| /$defs/neighbor&#95;feature/properties/form | type: string; enum: &#91;"clipped-hedge","solid-wall","free-growing"&#93;; description: How a plant feature is kept: clipped to shape, grown into a solid wall, or left to grow freely. |  |
| /$defs/neighbor&#95;feature/properties/height&#95;m | type: number |  |
| /$defs/neighbor&#95;feature/properties/width&#95;m | type: number; description: Thickness of a hedge, wall or fence; depth of a building. |  |
| /$defs/neighbor&#95;feature/properties/position | description: Centre of the feature in model coordinates. Required when a footprint is given. | ../metamodel.schema.yaml#/$defs/position |
| /$defs/neighbor&#95;feature/properties/footprint | description: Outline of the feature relative to its position, as for every other drawable element. | ../metamodel.schema.yaml#/$defs/footprint |
| /$defs/neighbor&#95;feature/properties/along&#95;ref | description: The estate's boundary segment this feature runs along, where one exists. A feature on a neighbour's own edge that this estate does not fence has no segment and omits this.  | ../metamodel.schema.yaml#/$defs/boundary&#95;segment&#95;ref |
| /$defs/neighbor&#95;feature/properties/derivation | description: Where the dimensions and outline came from when they were not measured. | ../metamodel.schema.yaml#/$defs/derivation |
| /$defs/neighbor&#95;feature/properties/description | type: string |  |
| /$defs/neighbor&#95;feature/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |
| /$defs/neighbor&#95;property | type: object; required: &#91;"id","name","direction"&#93;; additionalProperties: false; description: An adjacent property modeled as a first-class entity. Tracks physical characteristics (building height, distance), usage patterns (noise, occupancy), and boundary relationships. Answers CQ19 (shared concerns) and CQ22 (shade from neighbor structures). Used by T4 (privacy assessment), T5 (simplified rendering on layout).  |  |
| /$defs/neighbor&#95;property/properties | description: {"type":"string"} |  |
| /$defs/neighbor&#95;property/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?NP&#92;d{3,}$ |  |
| /$defs/neighbor&#95;property/properties/name | type: string; description: Descriptive label (not the owner's name). |  |
| /$defs/neighbor&#95;property/properties/cadastral&#95;id | type: string; description: Official land registry / cadastral identifier of the neighbor parcel. |  |
| /$defs/neighbor&#95;property/properties/direction | description: Which side of the estate this neighbor is on. | ../metamodel.schema.yaml#/$defs/compass&#95;direction |
| /$defs/neighbor&#95;property/properties/property&#95;type | type: string; enum: &#91;"residential-single","residential-multi","commercial","agricultural","industrial","public","recreational","vacant","forest","water"&#93;; description: General land use of the neighbor property. |  |
| /$defs/neighbor&#95;property/properties/building&#95;height&#95;m | type: number; description: Height of the tallest structure. Used for shade analysis (CQ22). |  |
| /$defs/neighbor&#95;property/properties/eave&#95;height&#95;m | type: number; description: Height of the neighbor building's eave in meters. |  |
| /$defs/neighbor&#95;property/properties/building&#95;stories | type: integer |  |
| /$defs/neighbor&#95;property/properties/distance&#95;from&#95;boundary&#95;m | type: number; description: Distance from the neighbor's nearest building to the shared boundary. |  |
| /$defs/neighbor&#95;property/properties/has&#95;windows&#95;facing | type: boolean; description: Whether the neighbor building has windows overlooking our property. Privacy concern. |  |
| /$defs/neighbor&#95;property/properties/terrain&#95;elevation&#95;offset&#95;cm | type: number; description: Neighbor terrain height relative to estate ground level. Positive = neighbor is higher. Affects drainage (CQ19) and privacy assessment (T4). Answers CQ29.  |  |
| /$defs/neighbor&#95;property/properties/foundation&#95;elevation&#95;offset&#95;cm | type: number; description: Neighbor building foundation height relative to estate ground level. Combined with terrain offset gives effective overlooking height. Answers CQ29.  |  |
| /$defs/neighbor&#95;property/properties/household&#95;count | type: integer; description: Number of households occupying the property. |  |
| /$defs/neighbor&#95;property/properties/occupancy | type: string; enum: &#91;"permanent","seasonal","weekend","vacant","unknown"&#93;; description: How regularly the property is occupied. |  |
| /$defs/neighbor&#95;property/properties/noise&#95;level | type: string; enum: &#91;"quiet","moderate","loud","variable"&#93;; description: Typical noise impact from this neighbor. |  |
| /$defs/neighbor&#95;property/properties/crowd&#95;level | type: string; enum: &#91;"low","moderate","high"&#93;; description: Frequency and volume of human activity (parties, gatherings, traffic). |  |
| /$defs/neighbor&#95;property/properties/has&#95;pets | type: boolean; description: Whether the neighbor has outdoor pets (dogs, etc.) that impact boundary. |  |
| /$defs/neighbor&#95;property/properties/has&#95;outdoor&#95;lighting | type: boolean; description: Whether neighbor lighting impacts our property (light pollution). |  |
| /$defs/neighbor&#95;property/properties/boundary&#95;segment&#95;refs | type: array; description: Boundary segments between our property and this neighbor. |  |
| /$defs/neighbor&#95;property/properties/boundary&#95;segment&#95;refs/items |  | ../metamodel.schema.yaml#/$defs/boundary&#95;segment&#95;ref |
| /$defs/neighbor&#95;property/properties/position&#95;accuracy&#95;m |  | ../metamodel.schema.yaml#/$defs/position&#95;accuracy&#95;m |
| /$defs/neighbor&#95;property/properties/position&#95;source |  | ../metamodel.schema.yaml#/$defs/position&#95;source |
| /$defs/neighbor&#95;property/properties/position&#95;derived&#95;from |  | ../metamodel.schema.yaml#/$defs/position&#95;derived&#95;from |
| /$defs/neighbor&#95;property/properties/position | description: Approximate center of the neighbor's nearest structure (for 2D layout). Further structures go in features. | ../metamodel.schema.yaml#/$defs/position |
| /$defs/neighbor&#95;property/properties/footprint | description: Outline of the neighbor's main building/structure (relative to position). Used by 2D ContextLayer for the massing block, and by 3D NeighborLayer for the building extrusion. For just the parcel boundary use parcel&#95;footprint. Further structures go in features.  | ../metamodel.schema.yaml#/$defs/polygon&#95;footprint |
| /$defs/neighbor&#95;property/properties/parcel&#95;footprint | description: Outline of the neighbor's land parcel (cadastral polygon, relative to position). Rendered as a flat ground platform in 3D scene. Distinct from &#96;footprint&#96; which represents the building. Useful for vacant plots, forests, and any case where parcel boundary matters more than a single structure.  | ../metamodel.schema.yaml#/$defs/polygon&#95;footprint |
| /$defs/neighbor&#95;property/properties/parcel&#95;vertex&#95;elevations | type: array; description: Per-vertex elevation (m, relative to model vertical datum / origin) for each vertex of &#96;parcel&#95;footprint&#96;. Length must equal &#96;parcel&#95;footprint.vertices.length&#96;. When present, the 3D viewer renders the parcel as a fan-triangulated tilted surface (each triangle = centroid + 2 adjacent vertices). When absent, the parcel is rendered flat at &#96;terrain&#95;elevation&#95;offset&#95;cm&#96;. Same vertex order.  |  |
| /$defs/neighbor&#95;property/properties/parcel&#95;vertex&#95;elevations/items | type: number |  |
| /$defs/neighbor&#95;property/properties/features | type: array; description: Structures and screening on this neighbour's land beyond the one building position and footprint describe: a shed at the fence, a hedge along the boundary. Answers CQ19 and CQ22 for neighbours with more than one thing on them.  |  |
| /$defs/neighbor&#95;property/properties/features/items |  | #/$defs/neighbor&#95;feature |
| /$defs/neighbor&#95;property/properties/roof&#95;type | type: string; enum: &#91;"flat","gable","hip","gambrel","mansard","shed","mono-pitch","unknown"&#93;; description: Approximate roof form for 3D massing context. |  |
| /$defs/neighbor&#95;property/properties/roof&#95;ridge&#95;height&#95;m | type: number; description: Approximate ridge height above neighbor's ground level. |  |
| /$defs/neighbor&#95;property/properties/ground&#95;elevation&#95;offset&#95;m | type: number; description: Neighbor's ground level relative to the model vertical datum. Positive = neighbor is higher. Used for 3D massing placement. May differ from terrain&#95;elevation&#95;offset&#95;cm (which is an observation); this is the value used for rendering.  |  |
| /$defs/neighbor&#95;property/properties/has&#95;pv&#95;panels | type: boolean; description: Whether the neighbor has photovoltaic panels (relevant for shadow analysis). |  |
| /$defs/neighbor&#95;property/properties/pv&#95;panel&#95;roof&#95;side | description: Which side of the roof the PV panels are mounted on. | ../metamodel.schema.yaml#/$defs/compass&#95;direction |
| /$defs/neighbor&#95;property/properties/resident&#95;refs | type: array; description: Known residents of this property (optional PRS### references). |  |
| /$defs/neighbor&#95;property/properties/resident&#95;refs/items |  | ../metamodel.schema.yaml#/$defs/person&#95;ref |
| /$defs/neighbor&#95;property/properties/description | type: string |  |
| /$defs/neighbor&#95;property/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |
| /$defs/shared&#95;concern | type: object; required: &#91;"id","name","concern&#95;type","neighbor&#95;property&#95;ref"&#93;; additionalProperties: false; description: A specific issue or matter shared between this property and a neighbor: overhanging branches, drainage disputes, noise complaints, shared fence maintenance. Answers CQ19. Used by T4 (privacy assessment).  |  |
| /$defs/shared&#95;concern/properties | description: {"type":"string"} |  |
| /$defs/shared&#95;concern/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?SC&#92;d{3,}$ |  |
| /$defs/shared&#95;concern/properties/name | type: string |  |
| /$defs/shared&#95;concern/properties/concern&#95;type | type: string; enum: &#91;"overhanging-branches","root-encroachment","drainage","shared-fence","noise","visual-privacy","shade-cast","light-pollution","pet-access","parking","access-right","boundary-dispute","other"&#93;; description: Category of the shared concern. |  |
| /$defs/shared&#95;concern/properties/neighbor&#95;property&#95;ref | description: The neighbor property involved in this concern. | ../metamodel.schema.yaml#/$defs/neighbor&#95;property&#95;ref |
| /$defs/shared&#95;concern/properties/severity | type: string; enum: &#91;"minor","moderate","significant"&#93;; description: Impact level of this concern. |  |
| /$defs/shared&#95;concern/properties/status | type: string; enum: &#91;"unresolved","discussed","agreed","resolved","recurring"&#93;; description: Current state of this concern. |  |
| /$defs/shared&#95;concern/properties/resolution&#95;notes | type: string; description: What was agreed or how it was resolved. |  |
| /$defs/shared&#95;concern/properties/affected&#95;boundary&#95;segment&#95;ref | description: Boundary segment where this concern manifests. | ../metamodel.schema.yaml#/$defs/boundary&#95;segment&#95;ref |
| /$defs/shared&#95;concern/properties/affected&#95;zone&#95;ref | description: Outdoor zone most impacted by this concern. | ../metamodel.schema.yaml#/$defs/outdoor&#95;zone&#95;ref |
| /$defs/shared&#95;concern/properties/description | type: string |  |
| /$defs/shared&#95;concern/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |
| /$defs/environmental&#95;factor | type: object; required: &#91;"id","name","factor&#95;type"&#93;; additionalProperties: false; description: An environmental condition affecting the property: prevailing wind, sun path, flood risk, soil conditions, noise from roads, etc. Answers CQ22 (sun exposure, wind impact). Used by T3 (garden planning), T4 (privacy - wind-borne noise), T5 (annotation on layout).  |  |
| /$defs/environmental&#95;factor/properties | description: {"type":"string"} |  |
| /$defs/environmental&#95;factor/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?EF&#92;d{3,}$ |  |
| /$defs/environmental&#95;factor/properties/name | type: string |  |
| /$defs/environmental&#95;factor/properties/factor&#95;type | type: string; enum: &#91;"prevailing-wind","sun-path","flood-risk","soil-contamination","groundwater-level","air-quality","light-pollution","traffic-noise","aircraft-noise","wildlife-corridor","frost-pocket","microclimate-warm","microclimate-cold","erosion-risk"&#93;; description: Category of environmental condition. |  |
| /$defs/environmental&#95;factor/properties/direction | description: Compass direction associated with this factor (e.g., wind from W, noise from S). | ../metamodel.schema.yaml#/$defs/compass&#95;direction |
| /$defs/environmental&#95;factor/properties/intensity | type: string; enum: &#91;"very-low","low","moderate","high","very-high"&#93;; description: Strength or severity of this factor. |  |
| /$defs/environmental&#95;factor/properties/seasonal&#95;variation | type: string; description: How this factor changes with seasons. |  |
| /$defs/environmental&#95;factor/properties/affected&#95;zone&#95;refs | type: array; description: Outdoor zones most impacted by this factor. |  |
| /$defs/environmental&#95;factor/properties/affected&#95;zone&#95;refs/items |  | ../metamodel.schema.yaml#/$defs/outdoor&#95;zone&#95;ref |
| /$defs/environmental&#95;factor/properties/position | description: Position on the layout for annotation rendering (optional). | ../metamodel.schema.yaml#/$defs/position |
| /$defs/environmental&#95;factor/properties/description | type: string |  |
| /$defs/environmental&#95;factor/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |
| /$defs/road&#95;corridor | type: object; required: &#91;"id","name","centerline","width&#95;m"&#93;; additionalProperties: false; description: Public road, shared driveway, or access lane that touches or borders the estate. Modeled as a polyline centerline with constant width - sufficient for site plan rendering and proximity / noise analysis. Distinct from outdoor&#95;zone (driveway &#42;inside&#42; the estate) and neighbor&#95;property (land parcels). Renderable as a flat strip in 2D and 3D scenes.  |  |
| /$defs/road&#95;corridor/properties | description: {"type":"string","title":"Description"} |  |
| /$defs/road&#95;corridor/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?RD&#92;d{3,}$ |  |
| /$defs/road&#95;corridor/properties/name | type: string |  |
| /$defs/road&#95;corridor/properties/surface&#95;type | type: string; enum: &#91;"asphalt","concrete","paved-stone","gravel","dirt","grass","mixed","unknown"&#93;; description: Primary surface material of the road. |  |
| /$defs/road&#95;corridor/properties/width&#95;m | type: number; description: Total width of the corridor (from edge to edge). |  |
| /$defs/road&#95;corridor/properties/centerline | description: Sequence of 3D vertices along the road centerline (open polyline). Z values represent ground elevation along the road relative to the model's vertical datum. Minimum 2 vertices.  | ../metamodel.schema.yaml#/$defs/polyline3d |
| /$defs/road&#95;corridor/properties/is&#95;public | type: boolean; description: Whether this is a publicly maintained road (vs. private driveway). |  |
| /$defs/road&#95;corridor/properties/direction | description: Approximate compass direction of the road (for annotation). | ../metamodel.schema.yaml#/$defs/compass&#95;direction |
| /$defs/road&#95;corridor/properties/borders&#95;neighbor&#95;refs | type: array; description: NeighborProperty entities the road separates this estate from. |  |
| /$defs/road&#95;corridor/properties/borders&#95;neighbor&#95;refs/items |  | ../metamodel.schema.yaml#/$defs/neighbor&#95;property&#95;ref |
| /$defs/road&#95;corridor/properties/description | type: string |  |
| /$defs/road&#95;corridor/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |

## estate-change.schema.yaml

Realm Estate Change

| JSON Pointer | Type / constraints | Reference |
|---|---|---|
| / | type: object; additionalProperties: false; description: Tracks planned changes and undertakings concerning the estate as AS-IS to TO-BE transitions. Each estate change is a discrete undertaking (add solar panels, replace fence, plant new hedge, apply to a listing platform) with timeline, status, dependencies, impact on existing entities, required resources, and a record of what was actually carried out.  |  |
| /properties/estate&#95;changes | type: array; description: Planned changes to the estate, tracking AS-IS to TO-BE transitions. Answers CQ23. |  |
| /properties/estate&#95;changes/items |  | #/$defs/estate&#95;change |
| /properties/epics | type: array; description: Named groups that estate changes belong to, in display order. Answers CQ23 for a reader who plans by theme. |  |
| /properties/epics/items |  | #/$defs/epic |
| /$defs/epic | type: object; required: &#91;"id","name","order"&#93;; additionalProperties: false; description: A named group of estate changes that a schedule or a Gantt chart groups by: the building, the garden, privacy, the forest. An epic carries a name and an order and nothing else; how a view colours it belongs to that view's configuration. Answers CQ23.  |  |
| /$defs/epic/properties | description: {"type":"string"} |  |
| /$defs/epic/properties/id |  | metamodel.schema.yaml#/$defs/epic&#95;ref |
| /$defs/epic/properties/name | type: string |  |
| /$defs/epic/properties/order | type: integer; description: Position of this epic when epics are listed or drawn; lower comes first. Unique within a model. |  |
| /$defs/epic/properties/description | type: string |  |
| /$defs/epic/properties/tags |  | metamodel.schema.yaml#/$defs/tags |
| /$defs/estate&#95;change | type: object; required: &#91;"id","name","status"&#93;; additionalProperties: false; description: A planned change or undertaking concerning the estate, with lifecycle tracking. Moves through statuses from proposed to approved to in-progress to completed or cancelled. A change may belong to a family of related changes, and a family may be one branch of a set of mutually exclusive scenarios. Answers CQ23, CQ31, CQ34.  |  |
| /$defs/estate&#95;change/patternProperties/^x- | description: Extension fields for domain-specific scheduling metadata (seasonal windows, risk/issue linkage). |  |
| /$defs/estate&#95;change/properties | description: {"type":"string"} |  |
| /$defs/estate&#95;change/properties/id |  | metamodel.schema.yaml#/$defs/estate&#95;change&#95;ref |
| /$defs/estate&#95;change/properties/name | type: string |  |
| /$defs/estate&#95;change/properties/summary | type: string; description: One-paragraph description of the planned change. |  |
| /$defs/estate&#95;change/properties/status | type: string; enum: &#91;"proposed","approved","scheduled","in-progress","completed","cancelled","deferred"&#93;; description: Current lifecycle state of this estate change. A family parent carries a status of its own; a rule reports when it disagrees with the rollup of its members.  |  |
| /$defs/estate&#95;change/properties/priority | type: string; enum: &#91;"critical","high","medium","low"&#93; |  |
| /$defs/estate&#95;change/properties/proposed&#95;date |  | metamodel.schema.yaml#/$defs/iso&#95;date |
| /$defs/estate&#95;change/properties/planned&#95;start&#95;date |  | metamodel.schema.yaml#/$defs/iso&#95;date |
| /$defs/estate&#95;change/properties/planned&#95;end&#95;date |  | metamodel.schema.yaml#/$defs/iso&#95;date |
| /$defs/estate&#95;change/properties/actual&#95;start&#95;date |  | metamodel.schema.yaml#/$defs/iso&#95;date |
| /$defs/estate&#95;change/properties/actual&#95;end&#95;date |  | metamodel.schema.yaml#/$defs/iso&#95;date |
| /$defs/estate&#95;change/properties/completed&#95;date |  | metamodel.schema.yaml#/$defs/iso&#95;date |
| /$defs/estate&#95;change/properties/affected&#95;entity&#95;refs | type: array |  |
| /$defs/estate&#95;change/properties/affected&#95;entity&#95;refs/items | type: string |  |
| /$defs/estate&#95;change/properties/changes | type: array; description: Specific changes to realm entities: add, modify, replace, or remove systems, zones, plantings, boundaries, etc.  |  |
| /$defs/estate&#95;change/properties/changes/items | type: object; required: &#91;"action","entity&#95;type"&#93;; additionalProperties: false |  |
| /$defs/estate&#95;change/properties/changes/items/properties | description: {"type":"string","title":"Change Description","examples":&#91;"Add 10kWp solar PV system on main house roof"&#93;} |  |
| /$defs/estate&#95;change/properties/changes/items/properties/action | type: string; enum: &#91;"add","modify","replace","remove","relocate"&#93; |  |
| /$defs/estate&#95;change/properties/changes/items/properties/entity&#95;type | type: string; description: Type of entity being changed. |  |
| /$defs/estate&#95;change/properties/changes/items/properties/entity&#95;ref | type: string; description: ID of the existing entity being modified/replaced/removed. |  |
| /$defs/estate&#95;change/properties/changes/items/properties/description | type: string |  |
| /$defs/estate&#95;change/properties/changes/items/properties/from&#95;state | type: string; description: Current state before the change. |  |
| /$defs/estate&#95;change/properties/changes/items/properties/to&#95;state | type: string; description: Desired state after the change. |  |
| /$defs/estate&#95;change/properties/changes/items/properties/actual&#95;state | type: string; description: What the change actually left behind, when that differs from the intended state or when the closure is worth recording in its own words. Work carried out in a different way than planned is the normal case rather than a fault, and a closed change that never records one is an unverified closure.  |  |
| /$defs/estate&#95;change/properties/changes/items/properties/outcome | type: string; enum: &#91;"done","superseded","abandoned"&#93;; description: How this one item ended, when the change as a whole has a status that does not say it. &#96;done&#96; when the item was carried out, &#96;superseded&#96; when another item or change did its work, &#96;abandoned&#96; when it was dropped and nothing replaced it. Absent while the item is still open. A completed change may carry an abandoned item; &#96;actual&#95;state&#96; says what stands there instead.  |  |
| /$defs/estate&#95;change/properties/required&#95;resources | type: array; description: Tools, materials, and equipment needed to execute this estate change. Drives preparatory checklist generation (PDF) and purchase planning. Answers CQ31.  |  |
| /$defs/estate&#95;change/properties/required&#95;resources/items |  | #/$defs/required&#95;resource |
| /$defs/estate&#95;change/properties/affected&#95;system&#95;refs | type: array; description: Existing systems impacted by this estate change. |  |
| /$defs/estate&#95;change/properties/affected&#95;system&#95;refs/items |  | metamodel.schema.yaml#/$defs/system&#95;ref |
| /$defs/estate&#95;change/properties/affected&#95;zone&#95;refs | type: array |  |
| /$defs/estate&#95;change/properties/affected&#95;zone&#95;refs/items |  | metamodel.schema.yaml#/$defs/outdoor&#95;zone&#95;ref |
| /$defs/estate&#95;change/properties/depends&#95;on&#95;estate&#95;change&#95;refs | type: array; description: Estate changes that must be completed before this one can start. |  |
| /$defs/estate&#95;change/properties/depends&#95;on&#95;estate&#95;change&#95;refs/items |  | metamodel.schema.yaml#/$defs/estate&#95;change&#95;ref |
| /$defs/estate&#95;change/properties/part&#95;of&#95;change&#95;ref | description: The family this change belongs to. A family parent carries the shared budget, goal and condition its members work towards, and lets a risk or an issue address the whole family rather than guessing at one member. The edge is held by the member, so the parent needs no list; membership must not form a cycle.  | metamodel.schema.yaml#/$defs/estate&#95;change&#95;ref |
| /$defs/estate&#95;change/properties/variant&#95;group | type: string; description: Names a set of mutually exclusive scenarios, declared on the parent of each competing branch. Exactly one branch is ever carried out, so members of one group are alternatives rather than dependencies and their statuses are not rolled up together.  |  |
| /$defs/estate&#95;change/properties/epic&#95;refs | type: array; description: The epics this change belongs to, most specific first. A view that groups by one epic uses the first; a change with no epic is listed under its own heading rather than left out.  |  |
| /$defs/estate&#95;change/properties/epic&#95;refs/items |  | metamodel.schema.yaml#/$defs/epic&#95;ref |
| /$defs/estate&#95;change/properties/executions | type: array; description: What was actually carried out, and when. A change closed without one records no evidence that anything happened. Counts, totals and the most recent date are read from this list rather than stored beside it. Answers CQ34.  |  |
| /$defs/estate&#95;change/properties/executions/items |  | metamodel.schema.yaml#/$defs/execution |
| /$defs/estate&#95;change/properties/coordinator&#95;ref | description: Person responsible for coordinating this estate change. Answers CQ32. | metamodel.schema.yaml#/$defs/person&#95;ref |
| /$defs/estate&#95;change/properties/estimated&#95;cost | type: number |  |
| /$defs/estate&#95;change/properties/currency | type: string; pattern: ^&#91;A-Z&#93;{3}$ |  |
| /$defs/estate&#95;change/properties/description | type: string |  |
| /$defs/estate&#95;change/properties/lifecycle | description: Set when this record has ended; absent means active. Retired records are excluded by default and counted. | metamodel.schema.yaml#/$defs/lifecycle |
| /$defs/estate&#95;change/properties/tags |  | metamodel.schema.yaml#/$defs/tags |
| /$defs/required&#95;resource | type: object; required: &#91;"name","category","availability"&#93;; additionalProperties: false; description: A tool, material, or piece of equipment needed to execute an estate change. Supports optional references to existing TL or EQP entities for inventory cross-checking. Used for deterministic PDF checklist generation and purchase planning. Answers CQ31.  |  |
| /$defs/required&#95;resource/properties/name | type: string; description: Human-readable name of the required resource. |  |
| /$defs/required&#95;resource/properties/category | type: string; enum: &#91;"tool","material","equipment"&#93;; description: Classification for checklist grouping. |  |
| /$defs/required&#95;resource/properties/availability | type: string; enum: &#91;"on-site","to-purchase","to-check","to-borrow","to-rent"&#93;; description: Whether this resource is available on-site or needs to be acquired. |  |
| /$defs/required&#95;resource/properties/quantity | type: number; description: Amount needed. Omit for items where quantity is implicit (e.g., 1 ladder). |  |
| /$defs/required&#95;resource/properties/unit | type: string; description: Unit of measurement for quantity (e.g., szt., kg, l, m, m²). |  |
| /$defs/required&#95;resource/properties/tool&#95;ref | description: Reference to an existing TL### entity in the tool inventory. | metamodel.schema.yaml#/$defs/tool&#95;ref |
| /$defs/required&#95;resource/properties/equipment&#95;ref | description: Reference to an existing EQP### entity in the equipment inventory. | metamodel.schema.yaml#/$defs/equipment&#95;ref |
| /$defs/required&#95;resource/properties/estimated&#95;cost | type: number; description: Estimated acquisition cost for items that need purchasing. |  |
| /$defs/required&#95;resource/properties/currency | type: string; pattern: ^&#91;A-Z&#93;{3}$ |  |
| /$defs/required&#95;resource/properties/notes | type: string; description: Where to buy, specifications, alternatives, or other preparation notes. |  |

## events.schema.yaml

Realm Event Log

| JSON Pointer | Type / constraints | Reference |
|---|---|---|
| / | type: object; additionalProperties: false; description: Cross-cutting event log. Events are facts or observations about things that happened on or around the property: neighbor requests, tree transplants, storm damage, inspections, completed estate changes, etc. Events reference entities across all planes. Not part of any plane - chronological overlay. A carried-out estate change produces an event; events may also exist without any estate change.  |  |
| /properties/events | type: array; description: Chronological log of facts, observations, and external triggers. Answers CQ45-CQ47.  |  |
| /properties/events/items |  | #/$defs/event |
| /$defs/event | type: object; required: &#91;"id","name","event&#95;type","occurred&#95;at"&#93;; additionalProperties: false; description: A fact or observation about something that happened on or around the property. Events are immutable records - once logged, they represent historical truth. A carried-out estate change (ECH) produces an event; external triggers (neighbor requests, inspections, weather damage) create events without an estate change. Events reference affected entities across all planes.  |  |
| /$defs/event/properties | description: {"type":"string","title":"Description","description":"Free-text description of what happened."} |  |
| /$defs/event/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?EVT&#92;d{3,}$ |  |
| /$defs/event/properties/name | type: string |  |
| /$defs/event/properties/event&#95;type | type: string; enum: &#91;"request","incident","action","observation","milestone","inspection","complaint","weather","estate-change-applied"&#93;; description: Classification of what kind of event this is. |  |
| /$defs/event/properties/occurred&#95;at | description: Date (or date-time) when the event happened. | #/$defs/event&#95;date |
| /$defs/event/properties/resolved&#95;at | description: Date when the event was resolved or closed. Omit if still open. | #/$defs/event&#95;date |
| /$defs/event/properties/status | type: string; enum: &#91;"open","in-progress","resolved","noted"&#93;; description: Current status of the event. |  |
| /$defs/event/properties/entity&#95;refs | type: array; description: IDs of entities affected by or related to this event (SPM, PTG, NP, BS, OZ, BLD, ECH, etc.). Cross-plane references.  |  |
| /$defs/event/properties/entity&#95;refs/items |  | metamodel.schema.yaml#/$defs/any&#95;entity&#95;ref |
| /$defs/event/properties/initiated&#95;by&#95;ref | description: Person or organization that triggered or reported this event. | metamodel.schema.yaml#/$defs/person&#95;ref |
| /$defs/event/properties/participants | type: array; description: People involved in the event (witnesses, responders, contractors). |  |
| /$defs/event/properties/participants/items |  | metamodel.schema.yaml#/$defs/person&#95;ref |
| /$defs/event/properties/estate&#95;change&#95;ref | description: The estate change (ECH###) that produced this event. Present when a carried-out change is the source of this event record, including when the change is one member of a family.  | metamodel.schema.yaml#/$defs/estate&#95;change&#95;ref |
| /$defs/event/properties/description | type: string; description: Free-text description of what happened. |  |
| /$defs/event/properties/outcome | type: string; description: Result or consequence of the event. |  |
| /$defs/event/properties/cost&#95;pln | type: number; description: Financial impact or cost of responding to this event. |  |
| /$defs/event/properties/tags |  | metamodel.schema.yaml#/$defs/tags |
| /$defs/event&#95;date | type: string; pattern: ^&#92;d{4}-&#92;d{2}-&#92;d{2}(T&#92;d{2}:&#92;d{2}(:&#92;d{2})?(&#91;+-&#93;&#92;d{2}:&#92;d{2}&#124;Z)?)?$; description: Date (YYYY-MM-DD) or full ISO 8601 date-time. |  |

## infrastructure/network.schema.yaml

Network Topology

| JSON Pointer | Type / constraints | Reference |
|---|---|---|
| / | type: object; additionalProperties: false; description: Detailed network infrastructure: routers, switches, access points, mesh nodes, IoT devices, and the links between them. Models the full network topology for visualization and troubleshooting. Infrastructure plane.  |  |
| /properties/network&#95;nodes | type: array; description: Network infrastructure devices. Answers CQ06. |  |
| /properties/network&#95;nodes/items |  | #/$defs/network&#95;node |
| /properties/iot&#95;devices | type: array; description: Smart-home sensors, actuators, controllers. Answers CQ07. |  |
| /properties/iot&#95;devices/items |  | #/$defs/iot&#95;device |
| /properties/network&#95;links | type: array; description: Connections between network nodes. Answers CQ06. |  |
| /properties/network&#95;links/items |  | #/$defs/network&#95;link |
| /$defs/network&#95;node | type: object; required: &#91;"id","name","node&#95;type"&#93;; additionalProperties: false; description: A network infrastructure device: router, switch, access point, mesh node, modem, NAS, etc. Forms the vertices of the network topology graph. Answers CQ06. Used by T6 (topology map).  |  |
| /$defs/network&#95;node/properties | description: {"type":"string"} |  |
| /$defs/network&#95;node/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?NN&#92;d{3,}$ |  |
| /$defs/network&#95;node/properties/name | type: string |  |
| /$defs/network&#95;node/properties/node&#95;type | type: string; enum: &#91;"router","switch","access-point","mesh-node","modem","firewall","nas","server","bridge","media-gateway","repeater"&#93;; description: Role of this device in the network. |  |
| /$defs/network&#95;node/properties/manufacturer | type: string |  |
| /$defs/network&#95;node/properties/model&#95;name | type: string |  |
| /$defs/network&#95;node/properties/ip&#95;address | type: string; description: Static or reserved IP address on the local network. |  |
| /$defs/network&#95;node/properties/mac&#95;address | type: string; pattern: ^(&#91;0-9A-Fa-f&#93;{2}:){5}&#91;0-9A-Fa-f&#93;{2}$ |  |
| /$defs/network&#95;node/properties/wifi&#95;bands | type: array; description: Supported WiFi frequency bands (for APs and routers). |  |
| /$defs/network&#95;node/properties/wifi&#95;bands/items | type: string; enum: &#91;"2.4GHz","5GHz","6GHz"&#93; |  |
| /$defs/network&#95;node/properties/poe&#95;powered | type: boolean; description: Whether this device is powered via Power over Ethernet. |  |
| /$defs/network&#95;node/properties/room&#95;ref |  | ../metamodel.schema.yaml#/$defs/room&#95;ref |
| /$defs/network&#95;node/properties/outdoor&#95;zone&#95;ref | description: For outdoor APs and cameras. | ../metamodel.schema.yaml#/$defs/outdoor&#95;zone&#95;ref |
| /$defs/network&#95;node/properties/position&#95;accuracy&#95;m |  | ../metamodel.schema.yaml#/$defs/position&#95;accuracy&#95;m |
| /$defs/network&#95;node/properties/position&#95;source |  | ../metamodel.schema.yaml#/$defs/position&#95;source |
| /$defs/network&#95;node/properties/position&#95;derived&#95;from |  | ../metamodel.schema.yaml#/$defs/position&#95;derived&#95;from |
| /$defs/network&#95;node/properties/position |  | ../metamodel.schema.yaml#/$defs/position |
| /$defs/network&#95;node/properties/description | type: string |  |
| /$defs/network&#95;node/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |
| /$defs/iot&#95;device | type: object; required: &#91;"id","name","device&#95;type"&#93;; additionalProperties: false; description: A smart-home sensor, actuator, or controller. Connected to the network and optionally monitoring or controlling an infrastructure system. Answers CQ07. Used by T2 (inventory), T6 (topology).  |  |
| /$defs/iot&#95;device/properties | description: {"type":"string"} |  |
| /$defs/iot&#95;device/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?IOT&#92;d{3,}$ |  |
| /$defs/iot&#95;device/properties/name | type: string |  |
| /$defs/iot&#95;device/properties/device&#95;type | type: string; enum: &#91;"sensor","actuator","controller","camera","thermostat","smart-plug","smart-lock","weather-station","soil-moisture-sensor","water-meter","energy-meter","smoke-detector","motion-sensor","door-sensor","light-sensor","hub","gateway"&#93;; description: Functional classification of this IoT device. |  |
| /$defs/iot&#95;device/properties/protocol | type: string; enum: &#91;"wifi","zigbee","z-wave","bluetooth","thread","matter","lora","wired-ethernet","modbus","knx"&#93;; description: Primary wireless or wired protocol. |  |
| /$defs/iot&#95;device/properties/manufacturer | type: string |  |
| /$defs/iot&#95;device/properties/model&#95;name | type: string |  |
| /$defs/iot&#95;device/properties/monitored&#95;system&#95;ref | description: Infrastructure system this device monitors (e.g., heating, irrigation). | ../metamodel.schema.yaml#/$defs/system&#95;ref |
| /$defs/iot&#95;device/properties/controlled&#95;system&#95;ref | description: Infrastructure system this device actuates or controls. | ../metamodel.schema.yaml#/$defs/system&#95;ref |
| /$defs/iot&#95;device/properties/network&#95;node&#95;ref | description: Network node this device connects through (hub, AP, bridge). | ../metamodel.schema.yaml#/$defs/network&#95;node&#95;ref |
| /$defs/iot&#95;device/properties/room&#95;ref |  | ../metamodel.schema.yaml#/$defs/room&#95;ref |
| /$defs/iot&#95;device/properties/outdoor&#95;zone&#95;ref |  | ../metamodel.schema.yaml#/$defs/outdoor&#95;zone&#95;ref |
| /$defs/iot&#95;device/properties/position&#95;accuracy&#95;m |  | ../metamodel.schema.yaml#/$defs/position&#95;accuracy&#95;m |
| /$defs/iot&#95;device/properties/position&#95;source |  | ../metamodel.schema.yaml#/$defs/position&#95;source |
| /$defs/iot&#95;device/properties/position&#95;derived&#95;from |  | ../metamodel.schema.yaml#/$defs/position&#95;derived&#95;from |
| /$defs/iot&#95;device/properties/position |  | ../metamodel.schema.yaml#/$defs/position |
| /$defs/iot&#95;device/properties/description | type: string |  |
| /$defs/iot&#95;device/properties/lifecycle | description: Set when this record has ended; absent means active. Retired records are excluded by default and counted. | ../metamodel.schema.yaml#/$defs/lifecycle |
| /$defs/iot&#95;device/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |
| /$defs/network&#95;link | type: object; required: &#91;"id","from&#95;node&#95;ref","to&#95;node&#95;ref","link&#95;type"&#93;; additionalProperties: false; description: A physical or wireless connection between two network nodes. Forms the edges of the network topology graph. Answers CQ06 (link speeds and types). Used by T6 (topology map).  |  |
| /$defs/network&#95;link/properties | description: {"type":"string"} |  |
| /$defs/network&#95;link/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?NL&#92;d{3,}$ |  |
| /$defs/network&#95;link/properties/name | type: string |  |
| /$defs/network&#95;link/properties/from&#95;node&#95;ref | description: Source network node. | ../metamodel.schema.yaml#/$defs/network&#95;node&#95;ref |
| /$defs/network&#95;link/properties/to&#95;node&#95;ref | description: Destination network node. | ../metamodel.schema.yaml#/$defs/network&#95;node&#95;ref |
| /$defs/network&#95;link/properties/link&#95;type | type: string; enum: &#91;"ethernet-cat5e","ethernet-cat6","ethernet-cat6a","fiber-single-mode","fiber-multi-mode","wifi","coax","powerline","mesh-wireless","wifi-2.4ghz","wifi-5ghz"&#93;; description: Physical medium of this connection. |  |
| /$defs/network&#95;link/properties/speed&#95;mbps | type: integer; description: Negotiated or nominal link speed. |  |
| /$defs/network&#95;link/properties/poe&#95;delivery | type: boolean; description: Whether this link carries Power over Ethernet. |  |
| /$defs/network&#95;link/properties/description | type: string |  |
| /$defs/network&#95;link/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |

## infrastructure/systems.schema.yaml

Infrastructure Systems

| JSON Pointer | Type / constraints | Reference |
|---|---|---|
| / | type: object; additionalProperties: false; description: Infrastructure systems (energy, heating, water, electrical), their physical components, utility grid connections, and the cable runs of the electrical layer. Covers all built systems from solar panels to sewage. Infrastructure plane.  |  |
| /properties/systems | type: array; description: All infrastructure systems. Answers CQ04, CQ05. |  |
| /properties/systems/items |  | #/$defs/system |
| /properties/components | type: array; description: Physical components across all systems. Answers CQ05. |  |
| /properties/components/items |  | #/$defs/component |
| /properties/utility&#95;connections | type: array; description: External grid connections. Answers CQ08. |  |
| /properties/utility&#95;connections/items |  | #/$defs/utility&#95;connection |
| /properties/cable&#95;runs | type: array; description: Cable runs and risers of the electrical system: what each carries, what it joins, and where it goes. Answers CQ51, CQ52.  |  |
| /properties/cable&#95;runs/items |  | #/$defs/cable&#95;run |
| /$defs/system | type: object; required: &#91;"id","name","system&#95;type"&#93;; additionalProperties: false; description: A major infrastructure system serving the property. Typed by function (heating, solar, irrigation, etc.) with capacity, fuel source, and installation details. Answers CQ04, CQ05. Used by T1 (maintenance), T2 (inventory), T6 (topology map).  |  |
| /$defs/system/properties | description: {"type":"string"} |  |
| /$defs/system/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?SYS&#92;d{3,}$ |  |
| /$defs/system/properties/name | type: string |  |
| /$defs/system/properties/system&#95;type | type: string; enum: &#91;"heating","cooling","ventilation","hot-water","solar-electric","solar-thermal","battery-storage","ev-charging","electrical-distribution","irrigation","drainage","sewage","rainwater-collection","gas-distribution","fire-safety","security","lighting-outdoor","network"&#93;; description: Functional classification of this infrastructure system. |  |
| /$defs/system/properties/fuel&#95;source | type: string; enum: &#91;"electricity","natural-gas","propane","heating-oil","wood","pellet","biomass","solar","ground-heat","air-heat","water-heat","diesel","none"&#93;; description: Primary energy input for this system. Answers CQ04. |  |
| /$defs/system/properties/rated&#95;capacity | type: number; description: Nominal capacity in the capacity&#95;unit. E.g., 25 kW, 10 kWp, 500 L. |  |
| /$defs/system/properties/capacity&#95;unit | type: string; description: Unit for rated&#95;capacity. |  |
| /$defs/system/properties/efficiency&#95;rating | type: string; description: Energy efficiency label or COP/SCOP value. |  |
| /$defs/system/properties/installed&#95;date | description: Date the system was installed or commissioned. | ../metamodel.schema.yaml#/$defs/iso&#95;date |
| /$defs/system/properties/manufacturer | type: string |  |
| /$defs/system/properties/model&#95;name | type: string |  |
| /$defs/system/properties/serial&#95;number | type: string |  |
| /$defs/system/properties/building&#95;ref | description: Building where this system's main unit is installed. | ../metamodel.schema.yaml#/$defs/building&#95;ref |
| /$defs/system/properties/room&#95;ref | description: Specific room (e.g., boiler room, utility room). | ../metamodel.schema.yaml#/$defs/room&#95;ref |
| /$defs/system/properties/outdoor&#95;zone&#95;ref | description: For outdoor systems (solar panels, irrigation, heat pump outdoor unit). | ../metamodel.schema.yaml#/$defs/outdoor&#95;zone&#95;ref |
| /$defs/system/properties/position | description: Position on property grid (for outdoor-mounted systems). | ../metamodel.schema.yaml#/$defs/position |
| /$defs/system/properties/utility&#95;connection&#95;ref | description: Grid connection that supplies this system. | ../metamodel.schema.yaml#/$defs/utility&#95;connection&#95;ref |
| /$defs/system/properties/warranty&#95;ref | description: Warranty covering this system. Answers CQ05. | ../metamodel.schema.yaml#/$defs/warranty&#95;ref |
| /$defs/system/properties/component&#95;refs | type: array; description: Components that make up this system. |  |
| /$defs/system/properties/component&#95;refs/items |  | ../metamodel.schema.yaml#/$defs/component&#95;ref |
| /$defs/system/properties/feeds&#95;system&#95;refs | type: array; description: Other systems this one feeds energy/fluid to. Used by T6. |  |
| /$defs/system/properties/feeds&#95;system&#95;refs/items |  | ../metamodel.schema.yaml#/$defs/system&#95;ref |
| /$defs/system/properties/distribution&#95;zones | type: array; description: Rooms and outdoor zones served by this system with their functional roles. Captures the system's coverage topology. Used by T6.  |  |
| /$defs/system/properties/distribution&#95;zones/items | type: object; required: &#91;"zone&#95;ref"&#93;; additionalProperties: false |  |
| /$defs/system/properties/distribution&#95;zones/items/properties/zone&#95;ref | description: Room or outdoor zone served by this system. | ../metamodel.schema.yaml#/$defs/room&#95;or&#95;zone&#95;ref |
| /$defs/system/properties/distribution&#95;zones/items/properties/role | type: string; description: Function of this zone in the system distribution. |  |
| /$defs/system/properties/description | type: string |  |
| /$defs/system/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |
| /$defs/component | type: object; required: &#91;"id","name","system&#95;ref"&#93;; additionalProperties: false; description: A physical part within an infrastructure system: boiler, radiator, pump, inverter, valve, tank, filter, etc. Granular enough for maintenance targeting. Answers CQ05 (configuration detail). Used by T1 (maintenance), T2 (inventory). In an electrical system a component is also a board, a protective device, a circuit, a junction box or a terminal device, classified by component&#95;type and joined by circuit&#95;ref, protected&#95;by&#95;ref and fed&#95;from&#95;ref (CQ48-CQ50).  |  |
| /$defs/component/allOf/0/if | required: &#91;"circuit&#95;ref"&#93; |  |
| /$defs/component/allOf/0/then | required: &#91;"component&#95;type"&#93; |  |
| /$defs/component/allOf/0/then/properties/component&#95;type | enum: &#91;"socket-outlet","switch","lighting-fixture","junction-box","cable-end"&#93; |  |
| /$defs/component/allOf/1/if | required: &#91;"protected&#95;by&#95;ref"&#93; |  |
| /$defs/component/allOf/1/then | required: &#91;"component&#95;type"&#93; |  |
| /$defs/component/allOf/1/then/properties/component&#95;type | const: circuit |  |
| /$defs/component/allOf/2/if | required: &#91;"fed&#95;from&#95;ref"&#93; |  |
| /$defs/component/allOf/2/then | required: &#91;"component&#95;type"&#93; |  |
| /$defs/component/allOf/2/then/properties/component&#95;type | enum: &#91;"distribution-panel","protective-device"&#93; |  |
| /$defs/component/allOf/3/if | required: &#91;"unit&#95;count"&#93; |  |
| /$defs/component/allOf/3/then/not | required: &#91;"wall&#95;segment&#95;ref"&#93; |  |
| /$defs/component/allOf/4/if | required: &#91;"wall&#95;offset&#95;cm"&#93; |  |
| /$defs/component/allOf/4/then | required: &#91;"wall&#95;segment&#95;ref"&#93; |  |
| /$defs/component/patternProperties/^x- | description: Custom extension properties for detail the base schema does not cover - e.g. x-fixtures, where one component entity stands for a COUNT of identical fittings (sixteen staked solar lamps) and needs to say where they are, which a single position field cannot. Follows the OpenAPI x- convention, as boundary&#95;segments already do. Values may be any valid YAML.  |  |
| /$defs/component/properties | description: {"type":"string"} |  |
| /$defs/component/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?CMP&#92;d{3,}$ |  |
| /$defs/component/properties/name | type: string |  |
| /$defs/component/properties/component&#95;type | type: string; description: Functional type of this component. Electrical roles use the values of the metamodel's electrical component type; a component that takes part in circuit&#95;ref, protected&#95;by&#95;ref or fed&#95;from&#95;ref is held to them.  |  |
| /$defs/component/properties/system&#95;ref | description: Infrastructure system this component belongs to. | ../metamodel.schema.yaml#/$defs/system&#95;ref |
| /$defs/component/properties/building&#95;ref | description: Building this component is installed in. | ../metamodel.schema.yaml#/$defs/building&#95;ref |
| /$defs/component/properties/specs | description: Technical specifications for this component. | ../metamodel.schema.yaml#/$defs/specs |
| /$defs/component/properties/manufacturer | type: string |  |
| /$defs/component/properties/model&#95;name | type: string |  |
| /$defs/component/properties/serial&#95;number | type: string |  |
| /$defs/component/properties/installed&#95;date |  | ../metamodel.schema.yaml#/$defs/iso&#95;date |
| /$defs/component/properties/expected&#95;lifespan&#95;years | type: integer; description: Manufacturer's expected service life. Used by T1 for replacement planning. |  |
| /$defs/component/properties/room&#95;ref |  | ../metamodel.schema.yaml#/$defs/room&#95;ref |
| /$defs/component/properties/position&#95;accuracy&#95;m |  | ../metamodel.schema.yaml#/$defs/position&#95;accuracy&#95;m |
| /$defs/component/properties/position&#95;source |  | ../metamodel.schema.yaml#/$defs/position&#95;source |
| /$defs/component/properties/position&#95;derived&#95;from |  | ../metamodel.schema.yaml#/$defs/position&#95;derived&#95;from |
| /$defs/component/properties/position |  | ../metamodel.schema.yaml#/$defs/position |
| /$defs/component/properties/members | type: array; description: Individual positions of the units this entity stands for, one entry per unit, when a consumer needs to place them: six clipped shrubs on either side of a walk, a run of solar lamps along a fence. Explicit points only; a spacing rule is computed once and its points written here with their derivation. A unit promoted to an entity of its own is removed from this list.  |  |
| /$defs/component/properties/members/items |  | ../metamodel.schema.yaml#/$defs/placed&#95;member |
| /$defs/component/properties/member&#95;of&#95;ref | description: The group this entity was one member of before it needed a history of its own. The group keeps its count; this entity's position is no longer listed among the group's members.  | ../metamodel.schema.yaml#/$defs/component&#95;ref |
| /$defs/component/properties/warranty&#95;ref |  | ../metamodel.schema.yaml#/$defs/warranty&#95;ref |
| /$defs/component/properties/circuit&#95;ref | description: The circuit this terminal device or junction box belongs to: a component whose component&#95;type is circuit. Answers CQ49. The circuit is reached from here; a circuit does not list its members.  | ../metamodel.schema.yaml#/$defs/component&#95;ref |
| /$defs/component/properties/protected&#95;by&#95;ref | description: For a circuit: the protective device (breaker, RCD, RCBO, fuse) that protects it, a component whose component&#95;type is protective-device. The device's fed&#95;from&#95;ref says which board it sits in, so a circuit reaches its board through its device. Answers CQ50.  | ../metamodel.schema.yaml#/$defs/component&#95;ref |
| /$defs/component/properties/fed&#95;from&#95;ref | description: For a protective device or a board: the upstream component it draws its supply from. A breaker in a board names the board, or the residual-current device it sits behind; a sub-board names the breaker in the upstream board that feeds it. The main board names nothing here; its system's utility&#95;connection&#95;ref is its supply. Answers CQ48, CQ50.  | ../metamodel.schema.yaml#/$defs/component&#95;ref |
| /$defs/component/properties/unit&#95;count | type: integer; description: How many identical physical units this component stands for, when one record describes several: five single sockets on one circuit in one room, a run of garden lamps. Absent means one. A unit that needs an answer of its own, because it is broken or sits on another circuit, becomes a component of its own and this count drops by one.  |  |
| /$defs/component/properties/wall&#95;segment&#95;ref | description: The wall segment this component is mounted on or set into, from the construction layer. Which face is meant follows from room&#95;ref: the wall's left&#95;space&#95;ref or right&#95;space&#95;ref that equals it. A component standing for several units carries no wall; each unit that needs placing becomes a component of its own.  | ../metamodel.schema.yaml#/$defs/wall&#95;segment&#95;ref |
| /$defs/component/properties/wall&#95;offset&#95;cm | type: number; description: Distance from the wall segment's start point along its centreline to the component's centre, in centimetres: the frame wall openings are placed in. Requires wall&#95;segment&#95;ref.  |  |
| /$defs/component/properties/mounting&#95;height&#95;cm | type: number; description: Height of the component's centre above the finished floor of the room it is in, in centimetres, whether it is on a wall or placed by position: a socket at 30, a switch at 110, a ceiling box at the ceiling height. Not a height above the vertical datum.  |  |
| /$defs/component/properties/outdoor&#95;zone&#95;ref | description: Outdoor zone this component stands in, for one that belongs to no building and no room: a socket on a post at a parcel edge, a run of garden lamps. Systems, equipment and network nodes already place themselves this way; components now can.  | ../metamodel.schema.yaml#/$defs/outdoor&#95;zone&#95;ref |
| /$defs/component/properties/description | type: string |  |
| /$defs/component/properties/lifecycle | description: Set when this record has ended; absent means active. Retired records are excluded by default and counted. | ../metamodel.schema.yaml#/$defs/lifecycle |
| /$defs/component/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |
| /$defs/utility&#95;connection | type: object; required: &#91;"id","name","connection&#95;type","provider"&#93;; additionalProperties: false; description: An external utility grid connection bringing a service to the property: electricity, gas, water supply, sewage, internet. Answers CQ08 (what connections exist, who provides them). Used by T2 (inventory), T9 (costs).  |  |
| /$defs/utility&#95;connection/properties | description: {"type":"string"} |  |
| /$defs/utility&#95;connection/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?UC&#92;d{3,}$ |  |
| /$defs/utility&#95;connection/properties/name | type: string |  |
| /$defs/utility&#95;connection/properties/connection&#95;type | type: string; enum: &#91;"electricity","natural-gas","propane-delivery","heating-oil-delivery","water-supply","sewage","fiber-internet","cable-internet","dsl","telephone","district-heating"&#93;; description: Type of utility service. |  |
| /$defs/utility&#95;connection/properties/provider | type: string; description: Name of the service provider. |  |
| /$defs/utility&#95;connection/properties/contract&#95;id | type: string; description: Customer or contract number with the provider. |  |
| /$defs/utility&#95;connection/properties/meter&#95;id | type: string; description: Utility meter identifier for readings. |  |
| /$defs/utility&#95;connection/properties/capacity | type: number; description: Maximum capacity of this connection. |  |
| /$defs/utility&#95;connection/properties/capacity&#95;unit | type: string |  |
| /$defs/utility&#95;connection/properties/monthly&#95;cost&#95;estimate | type: number; description: Average monthly cost in the specified currency. |  |
| /$defs/utility&#95;connection/properties/currency | type: string; pattern: ^&#91;A-Z&#93;{3}$ |  |
| /$defs/utility&#95;connection/properties/entry&#95;point&#95;position | description: Where the utility enters the property (for spatial layout). | ../metamodel.schema.yaml#/$defs/position |
| /$defs/utility&#95;connection/properties/cost&#95;category&#95;ref | description: Budget category for this connection's costs. | ../metamodel.schema.yaml#/$defs/cost&#95;category&#95;ref |
| /$defs/utility&#95;connection/properties/description | type: string |  |
| /$defs/utility&#95;connection/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |
| /$defs/cable&#95;run | type: object; required: &#91;"id","name","system&#95;ref","run&#95;type"&#93;; additionalProperties: false; description: A length of cable, or a bundle of them sharing one route, between two points of an electrical system: from a board to a junction box, from a box to the last socket of a circuit, up a riser between floors, underground to an outbuilding. Two halves, each usable alone. The topological half says what the run joins (from&#95;ref, to&#95;ref), which circuits it carries (circuit&#95;refs) and which rooms and zones it passes (through&#95;refs), and needs no coordinate. The geometric half is a route of legs against wall segments, each leg in a stated frame. Cable type and cross-section go in specs. Answers CQ51 (where is the riser) and CQ52 (where does the cable run). Used by T6.  |  |
| /$defs/cable&#95;run/properties | description: {"type":"string"} |  |
| /$defs/cable&#95;run/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?CBR&#92;d{3,}$ |  |
| /$defs/cable&#95;run/properties/name | type: string |  |
| /$defs/cable&#95;run/properties/system&#95;ref | description: The electrical system this run belongs to. | ../metamodel.schema.yaml#/$defs/system&#95;ref |
| /$defs/cable&#95;run/properties/run&#95;type | type: string; enum: &#91;"wall-run","riser","buried","overhead"&#93;; description: What kind of run this is. &#96;wall-run&#96;: horizontal, along or inside walls, ceilings or floors of one storey. &#96;riser&#96;: vertical, between floors. &#96;buried&#96;: underground, between buildings or to a post. &#96;overhead&#96;: on poles or catenary. A run that changes kind is split where it changes, so that a question about risers is a filter on this field.  |  |
| /$defs/cable&#95;run/properties/from&#95;ref | description: The board, protective device, box or terminal device the run starts at. | ../metamodel.schema.yaml#/$defs/component&#95;ref |
| /$defs/cable&#95;run/properties/to&#95;ref | description: The box, board or terminal device the run ends at. | ../metamodel.schema.yaml#/$defs/component&#95;ref |
| /$defs/cable&#95;run/properties/circuit&#95;refs | type: array; description: The circuits whose conductors share this route; a riser carries several, a final run to one socket carries one. Each is a component whose component&#95;type is circuit.  |  |
| /$defs/cable&#95;run/properties/circuit&#95;refs/items |  | ../metamodel.schema.yaml#/$defs/component&#95;ref |
| /$defs/cable&#95;run/properties/through&#95;refs | type: array; description: The rooms and outdoor zones the run passes, in order from from&#95;ref to to&#95;ref. The topological route, for a reader or a tool that has no wall geometry.  |  |
| /$defs/cable&#95;run/properties/through&#95;refs/items |  | ../metamodel.schema.yaml#/$defs/room&#95;or&#95;zone&#95;ref |
| /$defs/cable&#95;run/properties/route | description: The geometric route, as legs against wall segments or free polylines. | #/$defs/cable&#95;route |
| /$defs/cable&#95;run/properties/specs | description: Cable type, conductor count and cross-section, rated voltage, length. | ../metamodel.schema.yaml#/$defs/specs |
| /$defs/cable&#95;run/properties/installed&#95;date |  | ../metamodel.schema.yaml#/$defs/iso&#95;date |
| /$defs/cable&#95;run/properties/lifecycle | description: Set when this run was removed or replaced; absent means active. | ../metamodel.schema.yaml#/$defs/lifecycle |
| /$defs/cable&#95;run/properties/description | type: string |  |
| /$defs/cable&#95;run/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |
| /$defs/cable&#95;route | type: object; required: &#91;"legs"&#93;; additionalProperties: false; description: An ordered list of legs. Consecutive legs meet end to start; a route with one leg is common. Each leg states its own frame.  |  |
| /$defs/cable&#95;route/properties/legs | type: array |  |
| /$defs/cable&#95;route/properties/legs/items/oneOf/0 |  | #/$defs/cable&#95;leg&#95;along&#95;wall |
| /$defs/cable&#95;route/properties/legs/items/oneOf/1 |  | #/$defs/cable&#95;leg&#95;vertical |
| /$defs/cable&#95;route/properties/legs/items/oneOf/2 |  | #/$defs/cable&#95;leg&#95;free |
| /$defs/cable&#95;leg&#95;along&#95;wall | type: object; required: &#91;"kind","wall&#95;segment&#95;ref","from&#95;offset&#95;cm","to&#95;offset&#95;cm","height&#95;cm"&#93;; additionalProperties: false; description: A horizontal leg along or inside one wall segment. Offsets are centimetres from the wall segment's start point along its centreline, the frame wall openings use; height is centimetres above the finished floor of the wall's floor. Which face of the wall is meant follows from placement and from the rooms in through&#95;refs.  |  |
| /$defs/cable&#95;leg&#95;along&#95;wall/properties/kind | type: string; const: along-wall |  |
| /$defs/cable&#95;leg&#95;along&#95;wall/properties/wall&#95;segment&#95;ref |  | ../metamodel.schema.yaml#/$defs/wall&#95;segment&#95;ref |
| /$defs/cable&#95;leg&#95;along&#95;wall/properties/from&#95;offset&#95;cm | type: number |  |
| /$defs/cable&#95;leg&#95;along&#95;wall/properties/to&#95;offset&#95;cm | type: number |  |
| /$defs/cable&#95;leg&#95;along&#95;wall/properties/height&#95;cm | type: number |  |
| /$defs/cable&#95;leg&#95;along&#95;wall/properties/placement |  | #/$defs/cable&#95;placement |
| /$defs/cable&#95;leg&#95;vertical | type: object; required: &#91;"kind","wall&#95;segment&#95;ref","offset&#95;cm","from&#95;elevation&#95;m","to&#95;elevation&#95;m"&#93;; additionalProperties: false; description: A vertical leg at one point of a wall segment, from one elevation to another. The offset is centimetres from the wall segment's start along its centreline; the elevations are metres above the vertical datum, the frame slabs and wall bases are in, because a riser crosses floors and no single floor is its reference.  |  |
| /$defs/cable&#95;leg&#95;vertical/properties/kind | type: string; const: vertical |  |
| /$defs/cable&#95;leg&#95;vertical/properties/wall&#95;segment&#95;ref |  | ../metamodel.schema.yaml#/$defs/wall&#95;segment&#95;ref |
| /$defs/cable&#95;leg&#95;vertical/properties/offset&#95;cm | type: number |  |
| /$defs/cable&#95;leg&#95;vertical/properties/from&#95;elevation&#95;m | type: number |  |
| /$defs/cable&#95;leg&#95;vertical/properties/to&#95;elevation&#95;m | type: number |  |
| /$defs/cable&#95;leg&#95;vertical/properties/placement |  | #/$defs/cable&#95;placement |
| /$defs/cable&#95;leg&#95;free | type: object; required: &#91;"kind","path"&#93;; additionalProperties: false; description: A leg that follows no wall: a buried cable across a lawn, an overhead span, a cable across a ceiling void. A polyline in model coordinates, metres, with z above the vertical datum; a buried cable's z is below the ground elevation at that point.  |  |
| /$defs/cable&#95;leg&#95;free/properties/kind | type: string; const: free |  |
| /$defs/cable&#95;leg&#95;free/properties/path |  | ../metamodel.schema.yaml#/$defs/polyline3d |
| /$defs/cable&#95;leg&#95;free/properties/placement |  | #/$defs/cable&#95;placement |
| /$defs/cable&#95;placement | type: string; enum: &#91;"in-wall","surface","conduit","above-ceiling","under-floor","buried","overhead"&#93;; description: How the cable is carried on this leg: chased into the wall, on the surface in trunking or clips, in conduit, above a ceiling, under a floor, buried, or overhead.  |  |

## metamodel.schema.yaml

Realm Metamodel

| JSON Pointer | Type / constraints | Reference |
|---|---|---|
| / | type: object; description: Cross-cutting type definitions, typed reference patterns, spatial primitives, scheduling patterns, and external data contract shapes for the Realm schema suite. All schema files in this suite import from this file. This is the entry point for machine traversal.  |  |
| /$defs/semver | type: string; pattern: ^&#92;d+&#92;.&#92;d+&#92;.&#92;d+(-&#91;a-zA-Z0-9.&#93;+)?(&#92;+&#91;a-zA-Z0-9.&#93;+)?$; description: Semantic version string (MAJOR.MINOR.PATCH). |  |
| /$defs/schema&#95;version | type: string; enum: &#91;"2.3.0","2.2.0","2.1.0","2.0.0"&#93;; description: Realm schema version this document targets. The v2.3 schemas accept documents declaring 2.2.0, 2.1.0 and 2.0.0; 2.3.0 is additive over 2.2.0, and 2.2.0 renamed the migration entity to estate&#95;change, so a document older than that which uses the construct needs the rename before it will validate.  |  |
| /$defs/tags | type: array; description: Arbitrary classification tags for filtering and grouping. One tag has a fixed meaning: &#96;enum-borrowed&#96; marks an entity whose enum-valued field carries the nearest existing value because the right one does not exist yet, so the borrowing is findable by query when the vocabulary is extended. |  |
| /$defs/tags/items | type: string |  |
| /$defs/iso&#95;date | type: string; description: Date in YYYY-MM-DD format. |  |
| /$defs/flexible&#95;date | type: string; pattern: ^&#92;d{4}-(0&#91;1-9&#93;&#124;1&#91;0-2&#93;)(-(0&#91;1-9&#93;&#124;&#91;12&#93;&#92;d&#124;3&#91;01&#93;))?$; description: A full calendar date, or a year and month when the day is not known. Recorded events often come from memory or from a receipt that names only the month; this type keeps that distinction visible instead of inviting an invented day. Lexicographic order is chronological order, so values sort correctly whichever precision they carry.  |  |
| /$defs/electrical&#95;component&#95;type | type: string; enum: &#91;"distribution-panel","protective-device","circuit","junction-box","socket-outlet","switch","lighting-fixture","cable-end"&#93;; description: The role a component plays in an electrical distribution system. &#96;distribution-panel&#96;: a board holding protective devices, the main one or a sub-board. &#96;protective-device&#96;: a breaker, residual-current device, combined RCBO, fuse or main switch mounted in a board. &#96;circuit&#96;: a named group of conductors under one protective device, the unit a board's schedule lists. &#96;junction-box&#96;: an enclosure where conductors are joined. &#96;socket-outlet&#96;, &#96;switch&#96;, &#96;lighting-fixture&#96;: the terminal devices a circuit ends in. &#96;cable-end&#96;: a cable emerging from a wall, floor or ceiling whose circuit and purpose are not yet known; it becomes a terminal device or the end of a cable run once identified. A component uses these values in component&#95;type when it takes part in circuit&#95;ref, protected&#95;by&#95;ref or fed&#95;from&#95;ref.  |  |
| /$defs/position | type: object; required: &#91;"x","y"&#93;; additionalProperties: false; description: Property-relative position in the coordinate system's unit (default meters). Origin and north direction defined by the realm's coordinate&#95;system. Accuracy and source are recorded beside the position on the entity, in position&#95;accuracy&#95;m and position&#95;source. Answers CQ21. Used by T5 for 2D spatial layout rendering.  |  |
| /$defs/position/properties/x | type: number; description: Horizontal position from origin (east-positive when north is +Y). |  |
| /$defs/position/properties/y | type: number; description: Vertical position from origin (north-positive by default). |  |
| /$defs/polygon&#95;footprint | type: object; required: &#91;"shape","vertices"&#93;; additionalProperties: false; description: Closed polygon defined by vertices relative to the element's position (centroid). Vertices are in local coordinates before rotation. The renderer rotates by the element's rotation&#95;degrees then translates by position. Used by T5.  |  |
| /$defs/polygon&#95;footprint/properties/shape | type: string; const: polygon |  |
| /$defs/polygon&#95;footprint/properties/vertices | type: array; description: Ordered vertices relative to centroid. First and last are implicitly connected. |  |
| /$defs/polygon&#95;footprint/properties/vertices/items |  | #/$defs/position |
| /$defs/circle&#95;footprint | type: object; required: &#91;"shape","radius"&#93;; additionalProperties: false; description: Circular shape centered on the element's position. Used for tree canopies (CQ09) and round features. Used by T5.  |  |
| /$defs/circle&#95;footprint/properties/shape | type: string; const: circle |  |
| /$defs/circle&#95;footprint/properties/radius | type: number; description: Radius in coordinate system units (default meters) from center. |  |
| /$defs/footprint | description: Ground-projection shape of an element - polygon or circle. |  |
| /$defs/footprint/anyOf/0 |  | #/$defs/polygon&#95;footprint |
| /$defs/footprint/anyOf/1 |  | #/$defs/circle&#95;footprint |
| /$defs/position3d | type: object; required: &#91;"x","y","z"&#93;; additionalProperties: false; description: Property-relative position with elevation above vertical datum. |  |
| /$defs/position3d/properties/x | type: number; description: Horizontal position from origin (east-positive when north is +Y). |  |
| /$defs/position3d/properties/y | type: number; description: Vertical position from origin (north-positive by default). |  |
| /$defs/position3d/properties/z | type: number; description: Height above vertical datum (meters). |  |
| /$defs/position&#95;accuracy&#95;m | type: number; description: Radius within which the true point lies, in metres, for the entity's position and for any outline placed relative to it. Every answer that uses the position carries this number with it.  |  |
| /$defs/position&#95;source | type: string; enum: &#91;"surveyed","tape","gps","estimated"&#93;; description: How the position was obtained. &#96;surveyed&#96; from a cadastral or instrument survey; &#96;tape&#96; from tape measurements off known points; &#96;gps&#96; from a satellite fix, which needs the realm's WGS84 origin to be declared before it can be placed; &#96;estimated&#96; by eye or from a description.  |  |
| /$defs/position&#95;derived&#95;from | description: The element this position was placed relative to. Records that the dependency exists, not the offset: correct the named element and this one is due for correction too. The offset stays in the description.  | #/$defs/positioned&#95;element&#95;ref |
| /$defs/derivation | type: object; required: &#91;"derived&#95;from","derived&#95;on"&#93;; additionalProperties: false; description: Where a value came from when it was not measured on site: the statement it was read from and the date it was written down. A later survey then corrects a derivation instead of guessing whether the numbers were ever measured.  |  |
| /$defs/derivation/properties/derived&#95;from | type: string; description: The source the value was read from: a field name, an owner's statement, a photograph path. |  |
| /$defs/derivation/properties/derived&#95;on | description: The day the value was derived. | #/$defs/iso&#95;date |
| /$defs/placed&#95;member | type: object; required: &#91;"position"&#93;; additionalProperties: false; description: One unit of a group entity that stands for several identical things, such as one lamp of a lighting component or one shrub of a planting. The group carries the count, the care and the attributes; the member carries only where it stands, in absolute model coordinates with a height above the vertical datum, an optional label, and where the point came from when it was derived rather than measured. A unit that needs a history of its own becomes an entity and leaves this list.  |  |
| /$defs/placed&#95;member/properties/position | description: Where this unit stands, absolute, with z for a lamp head or a ground-level plant. | #/$defs/position3d |
| /$defs/placed&#95;member/properties/label | type: string; description: Short name that tells the units apart, such as W1 or lamp-BS003-4. |  |
| /$defs/placed&#95;member/properties/derivation | description: Present when the point was read from prose or computed from a count along a segment rather than measured. | #/$defs/derivation |
| /$defs/vertex3d | type: object; required: &#91;"x","y","z"&#93;; additionalProperties: false; description: 3D vertex for use in polygon and polyline contexts. Identical shape to position3d - use position3d for point locations, vertex3d for polygon and polyline vertices.  |  |
| /$defs/vertex3d/properties/x | type: number |  |
| /$defs/vertex3d/properties/y | type: number |  |
| /$defs/vertex3d/properties/z | type: number |  |
| /$defs/polyline3d | type: object; required: &#91;"vertices"&#93;; additionalProperties: false; description: Ordered sequence of 3D vertices forming an open path. |  |
| /$defs/polyline3d/properties/vertices | type: array |  |
| /$defs/polyline3d/properties/vertices/items |  | #/$defs/vertex3d |
| /$defs/polygon3d | type: object; required: &#91;"vertices"&#93;; additionalProperties: false; description: Closed 3D polygon defined by ordered vertices. First and last vertices are implicitly connected. Vertices must be CCW when viewed from the outward-facing side (normal follows right-hand rule).  |  |
| /$defs/polygon3d/properties/vertices | type: array |  |
| /$defs/polygon3d/properties/vertices/items |  | #/$defs/vertex3d |
| /$defs/coordinate&#95;system | type: object; required: &#91;"unit"&#93;; additionalProperties: false; description: Property-relative 2D coordinate system. Defines where (0,0) is, which direction is north, and the measurement unit. All positions in the model are relative to this system. A model that declares origin&#95;wgs84 can place a satellite fix; one that declares only origin&#95;description cannot. Answers CQ21. Used by T5.  |  |
| /$defs/coordinate&#95;system/properties | description: {"type":"string","title":"Description","description":"Additional notes about the coordinate system: design rationale, relationship to true geographic north, alignment choices.&#92;n"} |  |
| /$defs/coordinate&#95;system/properties/origin&#95;description | type: string; description: Human-readable description of the (0,0) point on the property. |  |
| /$defs/coordinate&#95;system/properties/north&#95;angle&#95;degrees | type: number; description: Angle in degrees from the +Y axis to true north, measured clockwise. Default 0 means +Y points north. The +X axis lies 90 degrees to the left of +Y when looking along it, so +X points north when this is 270, and the bearing of +Y is 360 minus this value. A satellite fix or a national-grid point is converted into model coordinates with this angle and origin&#95;wgs84 or origin&#95;projected.  |  |
| /$defs/coordinate&#95;system/properties/origin&#95;wgs84 | type: object; required: &#91;"latitude","longitude"&#93;; additionalProperties: false; description: Geographic coordinates of the model origin (0, 0). With north&#95;angle&#95;degrees this is enough to convert a satellite fix into model coordinates and back.  |  |
| /$defs/coordinate&#95;system/properties/origin&#95;wgs84/properties/latitude | type: number |  |
| /$defs/coordinate&#95;system/properties/origin&#95;wgs84/properties/longitude | type: number |  |
| /$defs/coordinate&#95;system/properties/origin&#95;projected | type: object; required: &#91;"epsg&#95;code","northing","easting"&#93;; additionalProperties: false; description: The model origin in a national or regional projected grid, named by its EPSG code. Fields are named northing and easting so the grid's own axis order never has to be remembered. The bearing of the model axes in this grid follows from north&#95;angle&#95;degrees and is not stored twice.  |  |
| /$defs/coordinate&#95;system/properties/origin&#95;projected/properties/epsg&#95;code | type: integer; description: Registry code of the projected coordinate reference system. |  |
| /$defs/coordinate&#95;system/properties/origin&#95;projected/properties/crs&#95;name | type: string; description: Display name of the system the code identifies; the code is authoritative. |  |
| /$defs/coordinate&#95;system/properties/origin&#95;projected/properties/northing | type: number |  |
| /$defs/coordinate&#95;system/properties/origin&#95;projected/properties/easting | type: number |  |
| /$defs/coordinate&#95;system/properties/origin&#95;elevation&#95;m | type: number; description: Height of the model origin in the named elevation datum. Ties local Z=0 to a national height system. |  |
| /$defs/coordinate&#95;system/properties/elevation&#95;datum | type: string; description: Name of the height system origin&#95;elevation&#95;m is expressed in. |  |
| /$defs/coordinate&#95;system/properties/unit | type: string; enum: &#91;"meters","feet"&#93;; description: Unit for all position and dimension values in the model. |  |
| /$defs/coordinate&#95;system/properties/description | type: string; description: Additional notes about the coordinate system: design rationale, relationship to true geographic north, alignment choices.  |  |
| /$defs/coordinate&#95;system/properties/vertical&#95;datum&#95;type | type: string; enum: &#91;"local-ground","parcel-benchmark","sea-level-relative"&#93;; description: Reference plane for all Z values in the model. local-ground means Z=0 is the ground level at the coordinate origin point. parcel-benchmark uses a surveyed benchmark on a specific parcel. sea-level-relative uses meters above mean sea level.  |  |
| /$defs/coordinate&#95;system/properties/vertical&#95;datum&#95;description | type: string; description: Human-readable clarification of the Z reference plane. |  |
| /$defs/compass&#95;direction | type: string; enum: &#91;"N","NE","E","SE","S","SW","W","NW"&#93;; description: Cardinal or intercardinal compass direction. |  |
| /$defs/spatial&#95;relation | type: object; required: &#91;"from&#95;ref","to&#95;ref","relation&#95;type"&#93;; additionalProperties: false; description: Directional or proximity relationship between two positioned elements. Answers CQ21 (relative positioning) and CQ22 (shade/exposure). Used by T4 (privacy assessment) and T5 (layout rendering).  |  |
| /$defs/spatial&#95;relation/properties/from&#95;ref | description: Source element of the spatial relation. | #/$defs/positioned&#95;element&#95;ref |
| /$defs/spatial&#95;relation/properties/to&#95;ref | description: Target element of the spatial relation. | #/$defs/positioned&#95;element&#95;ref |
| /$defs/spatial&#95;relation/properties/relation&#95;type | type: string; enum: &#91;"overlooks","shades","blocks-wind","drains-to","faces","enables-access","shares-boundary","blocks-view"&#93;; description: Kind of spatial relationship between elements. shares-boundary states that two elements touch; which edge touches which is declared on the element itself, in shared&#95;edges.  |  |
| /$defs/spatial&#95;relation/properties/distance&#95;m | type: number; description: Approximate distance between elements in meters. |  |
| /$defs/spatial&#95;relation/properties/notes | type: string; description: Free-text clarification of the spatial relationship. |  |
| /$defs/edge&#95;bearing&#95;ref | description: Reference to an element whose outline has edges: a polygon footprint (parcel, building, outdoor zone, planting), a neighbour's parcel outline, or a polyline (boundary segment). Used as the far side of a shared edge. For a neighbour the outline read is parcel&#95;footprint, the edge of their land, never footprint, which is their building.  |  |
| /$defs/edge&#95;bearing&#95;ref/anyOf/0 |  | #/$defs/parcel&#95;ref |
| /$defs/edge&#95;bearing&#95;ref/anyOf/1 |  | #/$defs/building&#95;ref |
| /$defs/edge&#95;bearing&#95;ref/anyOf/2 |  | #/$defs/outdoor&#95;zone&#95;ref |
| /$defs/edge&#95;bearing&#95;ref/anyOf/3 |  | #/$defs/boundary&#95;segment&#95;ref |
| /$defs/edge&#95;bearing&#95;ref/anyOf/4 |  | #/$defs/planting&#95;ref |
| /$defs/edge&#95;bearing&#95;ref/anyOf/5 |  | #/$defs/neighbor&#95;property&#95;ref |
| /$defs/shared&#95;edge | type: object; required: &#91;"edge","with&#95;ref"&#93;; additionalProperties: false; description: Declares that one edge of this element's outline lies on an edge of another element's outline, so that moving the other element's edge moves this one with it. Edges are numbered from 0 in vertex order: edge n runs from vertex n to vertex n+1, and a polygon's last edge closes back to vertex 0; a boundary segment's polyline has no closing edge. Both outlines are read in absolute model coordinates (a footprint's vertices offset by its position). The two edges must lie on one line; their endpoints need not coincide, since a lawn's western edge may run along only part of a hedge's eastern one. The element that declares the edge is the one that follows; the element it names does not declare the edge back.  |  |
| /$defs/shared&#95;edge/properties/edge | type: integer; description: Index of this element's edge, counted from 0 in vertex order. |  |
| /$defs/shared&#95;edge/properties/with&#95;ref | description: The element whose edge this edge lies on. | #/$defs/edge&#95;bearing&#95;ref |
| /$defs/shared&#95;edge/properties/with&#95;edge | type: integer; description: Index of the far element's edge, counted the same way. Omit only when the far element is a boundary segment with exactly two vertices, which has one edge.  |  |
| /$defs/shared&#95;edge/properties/note | type: string; description: Why these edges are one line, in one sentence. |  |
| /$defs/rrule&#95;schedule | type: object; required: &#91;"rrule","summary"&#93;; additionalProperties: false; description: Recurring schedule using iCalendar RRULE (RFC 5545). Stores the pattern; instances are calculated at runtime. Answers CQ13 (due dates), CQ14 (warranty service intervals), CQ10 (watering). Used by T1, T3, T8.  |  |
| /$defs/rrule&#95;schedule/properties/rrule | type: string; pattern: ^RRULE:; description: iCalendar recurrence rule per RFC 5545. |  |
| /$defs/rrule&#95;schedule/properties/summary | type: string; description: Plain-language description of the recurrence. |  |
| /$defs/rrule&#95;schedule/properties/active&#95;months | type: array; description: Months (1-12) during which the schedule is active. Omit for year-round. |  |
| /$defs/rrule&#95;schedule/properties/active&#95;months/items | type: integer |  |
| /$defs/rrule&#95;schedule/properties/start&#95;date | description: Date from which this schedule takes effect. | #/$defs/iso&#95;date |
| /$defs/execution | type: object; required: &#91;"date"&#93;; additionalProperties: false; description: One occasion on which planned work was actually carried out. Its identity is the work plus the date, so it is recorded in place on the task or change it belongs to rather than as an entity of its own. When an execution acquires meaning beyond the work itself - it caused damage, it involved other people, it is worth finding later on its own terms - &#96;event&#95;ref&#96; promotes it to an Event, which is where participants and outcomes are recorded. Answers CQ34.  |  |
| /$defs/execution/properties/date | description: When the work was done, to the day or to the month. | #/$defs/flexible&#95;date |
| /$defs/execution/properties/event&#95;ref | description: The Event this execution produced, when it was significant enough to be recorded as one.  | #/$defs/event&#95;ref |
| /$defs/execution/properties/cost&#95;pln | type: number; description: What this occasion cost. A cost belongs either to the execution that incurred it or to a linked Event, never to both.  |  |
| /$defs/execution/properties/note | type: string; description: What was done on this occasion, in one or two sentences. |  |
| /$defs/cost&#95;record&#95;shape | type: object; required: &#91;"date","amount","currency","cost&#95;category&#95;ref"&#93;; additionalProperties: false; description: Contract for cost records stored in the external data store (SQLite). Not stored in the YAML model - defines the record shape for the companion store. Answers CQ16. Used by T9.  |  |
| /$defs/cost&#95;record&#95;shape/properties | description: {"type":"string","description":"What the cost was for.","examples":&#91;"Annual boiler service by TechHeat GmbH"&#93;} |  |
| /$defs/cost&#95;record&#95;shape/properties/date | description: Date the cost was incurred. | #/$defs/iso&#95;date |
| /$defs/cost&#95;record&#95;shape/properties/amount | type: number; description: Cost amount in the specified currency. |  |
| /$defs/cost&#95;record&#95;shape/properties/currency | type: string; pattern: ^&#91;A-Z&#93;{3}$; description: ISO 4217 currency code. |  |
| /$defs/cost&#95;record&#95;shape/properties/cost&#95;category&#95;ref | description: Reference to the cost category this record belongs to. | #/$defs/cost&#95;category&#95;ref |
| /$defs/cost&#95;record&#95;shape/properties/description | type: string; description: What the cost was for. |  |
| /$defs/cost&#95;record&#95;shape/properties/source | type: string; description: Origin document (invoice number, receipt ID). |  |
| /$defs/measurement&#95;record&#95;shape | type: object; required: &#91;"timestamp","value","unit","system&#95;ref"&#93;; additionalProperties: false; description: Contract for telemetry/measurement records in the external data store. Covers energy readings, temperature, humidity, flow meters, etc. Used by T6 (infrastructure map), T9 (cost dashboard).  |  |
| /$defs/measurement&#95;record&#95;shape/properties/timestamp | type: string; description: ISO 8601 date-time of the measurement. |  |
| /$defs/measurement&#95;record&#95;shape/properties/value | type: number; description: Measured value. |  |
| /$defs/measurement&#95;record&#95;shape/properties/unit | type: string; description: Unit of measurement. |  |
| /$defs/measurement&#95;record&#95;shape/properties/system&#95;ref | description: System this measurement belongs to. | #/$defs/system&#95;ref |
| /$defs/measurement&#95;record&#95;shape/properties/point&#95;name | type: string; description: Named measurement point on the system. |  |
| /$defs/notification&#95;channel | type: string; enum: &#91;"email","sms","push","calendar","webhook"&#93;; description: Delivery channel for maintenance and compliance notifications. Answers CQ17. |  |
| /$defs/location | type: object; additionalProperties: false; description: Geographic location and postal address. Latitude/longitude are for climate lookups and sun-path estimation, not for spatial layout (which uses the property-relative coordinate system). Answers CQ01. Used by T2.  |  |
| /$defs/location/properties/address | type: string |  |
| /$defs/location/properties/city | type: string |  |
| /$defs/location/properties/region | type: string |  |
| /$defs/location/properties/country | type: string |  |
| /$defs/location/properties/postal&#95;code | type: string |  |
| /$defs/location/properties/latitude | type: number; description: WGS84 latitude for climate and sun-path lookups. |  |
| /$defs/location/properties/longitude | type: number; description: WGS84 longitude for climate and sun-path lookups. |  |
| /$defs/climate&#95;profile | type: object; additionalProperties: false; description: Climate metadata for the property. Drives garden planning (CQ11), plant selection (CQ09, CQ10), and seasonal maintenance scheduling (CQ13). Used by T3 (garden advisory).  |  |
| /$defs/climate&#95;profile/properties/hardiness&#95;zone | type: string; pattern: ^&#92;d{1,2}&#91;ab&#93;$; description: Plant hardiness zone. Determines cold-tolerance requirements for plants. |  |
| /$defs/climate&#95;profile/properties/koppen&#95;classification | type: string; description: Climate type code (e.g., Cfb = oceanic, Dfb = humid continental). |  |
| /$defs/climate&#95;profile/properties/avg&#95;annual&#95;rainfall&#95;mm | type: number |  |
| /$defs/climate&#95;profile/properties/frost&#95;free&#95;days | type: integer |  |
| /$defs/climate&#95;profile/properties/first&#95;frost&#95;date | type: string; pattern: ^&#92;d{2}-&#92;d{2}$ |  |
| /$defs/climate&#95;profile/properties/last&#95;frost&#95;date | type: string; pattern: ^&#92;d{2}-&#92;d{2}$ |  |
| /$defs/climate&#95;profile/properties/prevailing&#95;wind&#95;direction | description: Dominant wind direction at this location. | #/$defs/compass&#95;direction |
| /$defs/lifecycle&#95;state | type: string; enum: &#91;"active","retired","superseded"&#93;; description: Whether the record is current. &#96;active&#96; is the default and is what an entity without a lifecycle block means. &#96;retired&#96;: the thing no longer exists or is no longer in use; the record stays so that references to it keep resolving. &#96;superseded&#96;: another record has taken its place, named in superseded&#95;by.  |  |
| /$defs/lifecycle | type: object; required: &#91;"state"&#93;; additionalProperties: false; description: Records that a thing ended without deleting the record of it. A retired or superseded entity is excluded from lists, graphs and generated documents by default, and every consumer that excludes them reports how many it excluded, including zero, so that an absence is never mistaken for a thing that was never there. Independent of any status field: status says where the work stands, lifecycle says whether the record is current.  |  |
| /$defs/lifecycle/properties/state |  | #/$defs/lifecycle&#95;state |
| /$defs/lifecycle/properties/retired&#95;at | description: When the thing ended, to the day or to the month. | #/$defs/flexible&#95;date |
| /$defs/lifecycle/properties/retired&#95;reason | type: string; description: Why, in one sentence: removed, died, given away, replaced, merged. |  |
| /$defs/lifecycle/properties/superseded&#95;by | description: The record that took this one's place. May be of another type: a planting split into individual specimens names one of them here and the rest in retired&#95;reason.  | #/$defs/any&#95;entity&#95;ref |
| /$defs/parcel&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?LP&#92;d{3,}$; description: Typed reference to a Land Parcel entity. |  |
| /$defs/building&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?BLD&#92;d{3,}$; description: Typed reference to a Building entity. |  |
| /$defs/floor&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?FLR&#92;d{3,}$; description: Typed reference to a Floor entity. |  |
| /$defs/room&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?RM&#92;d{3,}$; description: Typed reference to a Room entity. |  |
| /$defs/outdoor&#95;zone&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?OZ&#92;d{3,}$; description: Typed reference to an Outdoor Zone entity. |  |
| /$defs/boundary&#95;segment&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?BS&#92;d{3,}$; description: Typed reference to a Boundary Segment entity. |  |
| /$defs/furniture&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?FRN&#92;d{3,}$; description: Typed reference to a Furniture entity (v1.1). |  |
| /$defs/equipment&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?EQP&#92;d{3,}$; description: Typed reference to an Equipment entity (v1.1). |  |
| /$defs/tool&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?TL&#92;d{3,}$; description: Typed reference to a portable Tool entity (v1.4). |  |
| /$defs/wing&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?WNG&#92;d{3,}$; description: Typed reference to a structural wing of a building (v2.0). |  |
| /$defs/wall&#95;segment&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?WSG&#92;d{3,}$; description: Typed reference to a wall segment in the construction layer (v2.0). |  |
| /$defs/slab&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?SLB&#92;d{3,}$; description: Typed reference to a floor/ceiling slab in the construction layer (v2.0). |  |
| /$defs/roof&#95;plane&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?RFP&#92;d{3,}$; description: Typed reference to a roof plane in the construction layer (v2.0). |  |
| /$defs/event&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?EVT&#92;d{3,}$; description: Typed reference to an Event entity in the event log (v2.0). |  |
| /$defs/estate&#95;change&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?ECH&#92;d{3,}&#91;a-z&#93;?$; description: Typed reference to an Estate Change entity. The optional trailing letter addresses one member of a change family, so a reference can name either the family parent or a single member of it.  |  |
| /$defs/epic&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?EPK&#92;d{3,}$; description: Typed reference to an Epic, a named group of estate changes with a display order. |  |
| /$defs/system&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?SYS&#92;d{3,}$; description: Typed reference to an infrastructure System entity. |  |
| /$defs/component&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?CMP&#92;d{3,}$; description: Typed reference to a Component entity within a system. |  |
| /$defs/utility&#95;connection&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?UC&#92;d{3,}$; description: Typed reference to a Utility Connection entity. |  |
| /$defs/network&#95;node&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?NN&#92;d{3,}$; description: Typed reference to a Network Node entity. |  |
| /$defs/iot&#95;device&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?IOT&#92;d{3,}$; description: Typed reference to an IoT Device entity. |  |
| /$defs/network&#95;link&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?NL&#92;d{3,}$; description: Typed reference to a Network Link entity. |  |
| /$defs/cable&#95;run&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?CBR&#92;d{3,}$; description: Typed reference to a cable run or riser in the electrical layer (v2.3). |  |
| /$defs/specimen&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?SPM&#92;d{3,}$; description: Typed reference to a Specimen (individual plant/tree) entity. |  |
| /$defs/planting&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?PTG&#92;d{3,}$; description: Typed reference to a Planting (categorical group) entity. |  |
| /$defs/biomass&#95;flow&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?BMF&#92;d{3,}$; description: Typed reference to a Biomass Flow entity. |  |
| /$defs/care&#95;profile&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?SCP&#92;d{3,}$; description: Typed reference to a Species Care Profile entity (v1.6). |  |
| /$defs/soil&#95;profile&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?SOIL&#92;d{3,}$; description: Typed reference to a Soil Profile entity (v1.6). |  |
| /$defs/planting&#95;recommendation&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?REC&#92;d{3,}$; description: Typed reference to a Planting Recommendation entity (v1.7). |  |
| /$defs/maintenance&#95;task&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?MT&#92;d{3,}$; description: Typed reference to a Maintenance Task entity. |  |
| /$defs/notification&#95;rule&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?NR&#92;d{3,}$; description: Typed reference to a Notification Rule entity. |  |
| /$defs/cost&#95;category&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?CC&#92;d{3,}$; description: Typed reference to a Cost Category entity. |  |
| /$defs/warranty&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?WRT&#92;d{3,}$; description: Typed reference to a Warranty entity. |  |
| /$defs/regulatory&#95;requirement&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?REG&#92;d{3,}$; description: Typed reference to a Regulatory Requirement entity. |  |
| /$defs/neighbor&#95;property&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?NP&#92;d{3,}$; description: Typed reference to a Neighbor Property entity. |  |
| /$defs/shared&#95;concern&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?SC&#92;d{3,}$; description: Typed reference to a Shared Concern entity. |  |
| /$defs/environmental&#95;factor&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?EF&#92;d{3,}$; description: Typed reference to an Environmental Factor entity. |  |
| /$defs/person&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?PRS&#92;d{3,}$; description: Typed reference to a Person or Organization entity (v1.4). |  |
| /$defs/any&#95;entity&#95;ref | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?(&#91;A-Z&#93;{2,4}&#92;d{3,}&#124;ECH&#92;d{3,}&#91;a-z&#93;)$; description: Reference to an entity of any type, for fields that deliberately accept a cross-plane mix. Estate Change ids carry an optional trailing letter addressing one member of a change family; every other prefix is digits only.  |  |
| /$defs/positioned&#95;element&#95;ref | description: Reference to any element that can have a spatial position on the property layout. Used in spatial&#95;relation from/to fields.  |  |
| /$defs/positioned&#95;element&#95;ref/anyOf/0 |  | #/$defs/parcel&#95;ref |
| /$defs/positioned&#95;element&#95;ref/anyOf/1 |  | #/$defs/building&#95;ref |
| /$defs/positioned&#95;element&#95;ref/anyOf/2 |  | #/$defs/outdoor&#95;zone&#95;ref |
| /$defs/positioned&#95;element&#95;ref/anyOf/3 |  | #/$defs/boundary&#95;segment&#95;ref |
| /$defs/positioned&#95;element&#95;ref/anyOf/4 |  | #/$defs/specimen&#95;ref |
| /$defs/positioned&#95;element&#95;ref/anyOf/5 |  | #/$defs/system&#95;ref |
| /$defs/positioned&#95;element&#95;ref/anyOf/6 |  | #/$defs/component&#95;ref |
| /$defs/positioned&#95;element&#95;ref/anyOf/7 |  | #/$defs/network&#95;node&#95;ref |
| /$defs/positioned&#95;element&#95;ref/anyOf/8 |  | #/$defs/iot&#95;device&#95;ref |
| /$defs/positioned&#95;element&#95;ref/anyOf/9 |  | #/$defs/wing&#95;ref |
| /$defs/positioned&#95;element&#95;ref/anyOf/10 |  | #/$defs/floor&#95;ref |
| /$defs/positioned&#95;element&#95;ref/anyOf/11 |  | #/$defs/room&#95;ref |
| /$defs/positioned&#95;element&#95;ref/anyOf/12 |  | #/$defs/planting&#95;ref |
| /$defs/positioned&#95;element&#95;ref/anyOf/13 |  | #/$defs/neighbor&#95;property&#95;ref |
| /$defs/positioned&#95;element&#95;ref/anyOf/14 |  | #/$defs/equipment&#95;ref |
| /$defs/positioned&#95;element&#95;ref/anyOf/15 |  | #/$defs/furniture&#95;ref |
| /$defs/maintainable&#95;element&#95;ref | description: Reference to any element that can be a maintenance target. Used in maintenance&#95;task.target&#95;ref.  |  |
| /$defs/maintainable&#95;element&#95;ref/anyOf/0 |  | #/$defs/parcel&#95;ref |
| /$defs/maintainable&#95;element&#95;ref/anyOf/1 |  | #/$defs/system&#95;ref |
| /$defs/maintainable&#95;element&#95;ref/anyOf/2 |  | #/$defs/component&#95;ref |
| /$defs/maintainable&#95;element&#95;ref/anyOf/3 |  | #/$defs/building&#95;ref |
| /$defs/maintainable&#95;element&#95;ref/anyOf/4 |  | #/$defs/room&#95;ref |
| /$defs/maintainable&#95;element&#95;ref/anyOf/5 |  | #/$defs/outdoor&#95;zone&#95;ref |
| /$defs/maintainable&#95;element&#95;ref/anyOf/6 |  | #/$defs/boundary&#95;segment&#95;ref |
| /$defs/maintainable&#95;element&#95;ref/anyOf/7 |  | #/$defs/specimen&#95;ref |
| /$defs/maintainable&#95;element&#95;ref/anyOf/8 |  | #/$defs/planting&#95;ref |
| /$defs/maintainable&#95;element&#95;ref/anyOf/9 |  | #/$defs/network&#95;node&#95;ref |
| /$defs/maintainable&#95;element&#95;ref/anyOf/10 |  | #/$defs/iot&#95;device&#95;ref |
| /$defs/maintainable&#95;element&#95;ref/anyOf/11 |  | #/$defs/equipment&#95;ref |
| /$defs/maintainable&#95;element&#95;ref/anyOf/12 |  | #/$defs/tool&#95;ref |
| /$defs/biomass&#95;source&#95;ref | description: Reference to an element that produces biomass: a specimen, a planting or an outdoor zone. A named tree drops its own leaf, a hedge or a meadow yields trimmings and cuttings as a group, and a zone answers for everything raked off it.  |  |
| /$defs/biomass&#95;source&#95;ref/anyOf/0 |  | #/$defs/specimen&#95;ref |
| /$defs/biomass&#95;source&#95;ref/anyOf/1 |  | #/$defs/planting&#95;ref |
| /$defs/biomass&#95;source&#95;ref/anyOf/2 |  | #/$defs/outdoor&#95;zone&#95;ref |
| /$defs/biomass&#95;destination&#95;ref | description: Reference to where processed biomass is used (zone for compost, system for fuel). |  |
| /$defs/biomass&#95;destination&#95;ref/anyOf/0 |  | #/$defs/outdoor&#95;zone&#95;ref |
| /$defs/biomass&#95;destination&#95;ref/anyOf/1 |  | #/$defs/system&#95;ref |
| /$defs/room&#95;or&#95;zone&#95;ref | description: Reference to a room or outdoor zone (for system distribution targets). |  |
| /$defs/room&#95;or&#95;zone&#95;ref/anyOf/0 |  | #/$defs/room&#95;ref |
| /$defs/room&#95;or&#95;zone&#95;ref/anyOf/1 |  | #/$defs/outdoor&#95;zone&#95;ref |
| /$defs/specs | type: array; description: Generic key-value-unit specification pairs for equipment, appliances, or other entities with diverse technical attributes. Used by T2 (inventory report) to surface specifications without schema-per-type.  |  |
| /$defs/specs/items | type: object; required: &#91;"value"&#93;; additionalProperties: false |  |
| /$defs/specs/items/properties/key | type: string; description: Specification name (e.g., cutting&#95;width&#95;cm, tank&#95;capacity&#95;liters, battery&#95;voltage). |  |
| /$defs/specs/items/properties/parameter | type: string; description: Alternative specification name field (synonym of key; cewice data uses parameter). |  |
| /$defs/specs/items/properties/value | type: string; description: Specification value as string. |  |
| /$defs/specs/items/properties/unit | type: string; description: Unit of measurement (omit for dimensionless values). |  |

## nature/biomass.schema.yaml

Biomass Flows

| JSON Pointer | Type / constraints | Reference |
|---|---|---|
| / | type: object; additionalProperties: false; description: Circular biomass flows from organic sources (tree pruning, leaf fall, kitchen waste) through processing (composting, chipping, drying) to productive use (garden amendment, firewood, mulch). Nature plane.  |  |
| /properties/biomass&#95;flows | type: array; description: Circular biomass flows from source to use. Answers CQ12. |  |
| /properties/biomass&#95;flows/items |  | #/$defs/biomass&#95;flow |
| /$defs/biomass&#95;flow | type: object; required: &#91;"id","name","source&#95;type","process","output&#95;type"&#93;; additionalProperties: false; description: A circular flow of organic material from source through processing to productive use. Models the estate's closed-loop resource cycles: tree → firewood → heating, leaves → compost → garden. Answers CQ12. Used by T3 (garden advisory) and T7 (flow diagram).  |  |
| /$defs/biomass&#95;flow/properties | description: {"type":"string"} |  |
| /$defs/biomass&#95;flow/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?BMF&#92;d{3,}$ |  |
| /$defs/biomass&#95;flow/properties/name | type: string |  |
| /$defs/biomass&#95;flow/properties/source&#95;type | type: string; enum: &#91;"tree-pruning","leaf-fall","grass-clippings","kitchen-waste","wood-harvest","crop-residue","hedge-trimmings","fruit-drops","weed-clearing"&#93;; description: What kind of organic material enters this flow. |  |
| /$defs/biomass&#95;flow/properties/source&#95;ref | description: Where this biomass originates: a specimen, a planting or an outdoor zone. Several of the source types are produced by a group rather than by one plant - &#96;hedge-trimmings&#96; come off a hedge and &#96;grass-clippings&#96; off a sward - so a planting is named directly rather than through the zone it stands in.  | ../metamodel.schema.yaml#/$defs/biomass&#95;source&#95;ref |
| /$defs/biomass&#95;flow/properties/process | type: string; enum: &#91;"composting","chipping","drying","direct-use","mulching","vermicomposting","biochar","anaerobic-digestion"&#93;; description: How the raw biomass is transformed. |  |
| /$defs/biomass&#95;flow/properties/processing&#95;location&#95;ref | description: Zone where processing happens (e.g., compost area, wood shed). | ../metamodel.schema.yaml#/$defs/outdoor&#95;zone&#95;ref |
| /$defs/biomass&#95;flow/properties/processing&#95;duration&#95;days | type: integer; description: Typical time from input to usable output. |  |
| /$defs/biomass&#95;flow/properties/output&#95;type | type: string; enum: &#91;"compost","mulch","firewood","wood-chips","biochar","green-waste","worm-castings","leaf-mold"&#93;; description: What the flow produces after processing. |  |
| /$defs/biomass&#95;flow/properties/destination&#95;ref | description: Where the output is used: outdoor zone (garden amendment) or system (fuel for heating). | ../metamodel.schema.yaml#/$defs/biomass&#95;destination&#95;ref |
| /$defs/biomass&#95;flow/properties/estimated&#95;annual&#95;volume | type: number; description: Estimated annual throughput. |  |
| /$defs/biomass&#95;flow/properties/volume&#95;unit | type: string; enum: &#91;"cubic-meters","kilograms","tonnes","liters"&#93; |  |
| /$defs/biomass&#95;flow/properties/seasonal&#95;availability | type: array; description: Months (1-12) when source material is available. |  |
| /$defs/biomass&#95;flow/properties/seasonal&#95;availability/items | type: integer |  |
| /$defs/biomass&#95;flow/properties/description | type: string |  |
| /$defs/biomass&#95;flow/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |

## nature/care.schema.yaml

Species Care Profiles

| JSON Pointer | Type / constraints | Reference |
|---|---|---|
| / | type: object; additionalProperties: false; description: Species-level care protocols: annual care calendars with monthly activities, supplies/product recommendations, pest/disease protection protocols, pruning guides, and soil requirements. One profile per species serves all specimens and plantings of that species (DRY). Nature plane.  |  |
| /properties/care&#95;profiles | type: array; description: Species-level care protocols. Answers CQ35, CQ36, CQ38, CQ39, CQ40. |  |
| /properties/care&#95;profiles/items |  | #/$defs/species&#95;care&#95;profile |
| /$defs/species&#95;care&#95;profile | type: object; required: &#91;"id","name","species"&#93;; additionalProperties: false; description: Annual care protocol for a plant species: monthly activity calendar, supplies with dosage and pricing, pest/disease threats with prevention and treatment, pruning guide, and soil requirements. One SCP serves all specimens (SPM) and plantings (PTG) of that species via care&#95;profile&#95;ref. Answers CQ35 (monthly care), CQ36 (supplies/costs), CQ38 (threats), CQ39 (pruning). Used by T10 (care calendar), T11 (shopping list generator).  |  |
| /$defs/species&#95;care&#95;profile/properties | description: {"type":"string"} |  |
| /$defs/species&#95;care&#95;profile/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?SCP&#92;d{3,}$ |  |
| /$defs/species&#95;care&#95;profile/properties/name | type: string |  |
| /$defs/species&#95;care&#95;profile/properties/species | type: string; description: Botanical species name this profile applies to. |  |
| /$defs/species&#95;care&#95;profile/properties/common&#95;name | type: string |  |
| /$defs/species&#95;care&#95;profile/properties/applicable&#95;specimen&#95;types | type: array; description: Which specimen&#95;type values this profile covers. |  |
| /$defs/species&#95;care&#95;profile/properties/applicable&#95;specimen&#95;types/items | type: string; enum: &#91;"tree-deciduous","tree-evergreen","tree-fruit","shrub-deciduous","shrub-evergreen","shrub-fruit","perennial","climber","bamboo","palm"&#93; |  |
| /$defs/species&#95;care&#95;profile/properties/applicable&#95;planting&#95;types | type: array; description: Which planting&#95;type values this profile covers. |  |
| /$defs/species&#95;care&#95;profile/properties/applicable&#95;planting&#95;types/items | type: string; enum: &#91;"hedge","flower-bed","vegetable-bed","herb-garden","ground-cover","lawn","meadow-section","mixed-border","raised-bed","container-group","climbing-wall","green-roof"&#93; |  |
| /$defs/species&#95;care&#95;profile/properties/care&#95;calendar | type: array; description: Monthly care activities for this species. Each entry covers one month (1-12) with a list of activities to perform. Answers CQ35 (what to do when). Used by T10 (calendar generation).  |  |
| /$defs/species&#95;care&#95;profile/properties/care&#95;calendar/items |  | #/$defs/care&#95;month |
| /$defs/species&#95;care&#95;profile/properties/soil&#95;requirements | description: Preferred soil conditions for this species. Answers CQ37 indirectly. | #/$defs/soil&#95;requirement |
| /$defs/species&#95;care&#95;profile/properties/known&#95;threats | type: array; description: Pests, diseases, and environmental threats this species is susceptible to, with prevention and treatment protocols. This is a PROTOCOL (what to do), not STATE (is it currently affected). Current health state is tracked externally. Answers CQ38. Used by T10 (seasonal protection schedule).  |  |
| /$defs/species&#95;care&#95;profile/properties/known&#95;threats/items |  | #/$defs/known&#95;threat |
| /$defs/species&#95;care&#95;profile/properties/pruning&#95;guide | description: Pruning types, timing, and techniques. Answers CQ39. | #/$defs/pruning&#95;guide |
| /$defs/species&#95;care&#95;profile/properties/hardiness&#95;zone&#95;min | type: string; pattern: ^&#92;d{1,2}&#91;ab&#93;$; description: Coldest USDA zone this species tolerates. |  |
| /$defs/species&#95;care&#95;profile/properties/growth&#95;rate | type: string; enum: &#91;"very-slow","slow","moderate","fast","very-fast"&#93;; description: General growth speed classification. |  |
| /$defs/species&#95;care&#95;profile/properties/lifespan&#95;years | type: integer |  |
| /$defs/species&#95;care&#95;profile/properties/description | type: string |  |
| /$defs/species&#95;care&#95;profile/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |
| /$defs/care&#95;month | type: object; required: &#91;"month"&#93;; additionalProperties: false; description: Care activities for a specific month (1-12). |  |
| /$defs/care&#95;month/properties/month | type: integer; description: Calendar month (1=January, 12=December). |  |
| /$defs/care&#95;month/properties/activities | type: array; description: Care activities to perform this month. |  |
| /$defs/care&#95;month/properties/activities/items |  | #/$defs/care&#95;activity |
| /$defs/care&#95;month/properties/notes | type: string; description: General notes for this month (weather considerations, etc.). |  |
| /$defs/care&#95;activity | type: object; required: &#91;"activity&#95;type","description"&#93;; additionalProperties: false; description: A single care action: fertilizing, spraying, pruning, etc. |  |
| /$defs/care&#95;activity/properties | description: {"type":"string","title":"Description","description":"What exactly to do.","minLength":1} |  |
| /$defs/care&#95;activity/properties/activity&#95;type | type: string; enum: &#91;"fertilizing","watering","pruning","hedge-trim","treatment","pest-protection","mulching","soil-amendment","planting","transplanting","winter-protection","spring-uncovering","deadheading","weeding","inspection","harvesting","training","staking","mowing"&#93;; description: Classification of the care activity. |  |
| /$defs/care&#95;activity/properties/description | type: string; description: What exactly to do. |  |
| /$defs/care&#95;activity/properties/priority | type: string; enum: &#91;"critical","high","medium","low"&#93;; description: Importance of this activity. |  |
| /$defs/care&#95;activity/properties/condition | type: string; description: When to perform: always, or only if a condition is met. |  |
| /$defs/care&#95;activity/properties/supplies | type: array; description: Products, materials, and supplies needed for this activity. Includes dosage, estimated pricing, and store recommendations. Answers CQ36 (what to buy) and CQ40 (shopping list).  |  |
| /$defs/care&#95;activity/properties/supplies/items |  | #/$defs/supply&#95;item |
| /$defs/supply&#95;item | type: object; required: &#91;"name"&#93;; additionalProperties: false; description: A product or material needed for a care activity. Contains dosage, estimated pricing, and store info. NOT a separate entity - lives as sub-object on care activities and soil amendments. Prices are estimates and may change.  |  |
| /$defs/supply&#95;item/properties/name | type: string; description: Commercial product name or generic material name. |  |
| /$defs/supply&#95;item/properties/dosage | type: string; description: Application rate per unit area or per plant. |  |
| /$defs/supply&#95;item/properties/quantity&#95;per&#95;application | type: string; description: How much product is needed for one application cycle. |  |
| /$defs/supply&#95;item/properties/estimated&#95;price&#95;pln | type: number; description: Approximate retail price in Polish Zloty. May change over time. |  |
| /$defs/supply&#95;item/properties/store&#95;name | type: string; description: Recommended store or retailer. |  |
| /$defs/supply&#95;item/properties/product&#95;url | type: string; description: Link to product page (may become outdated). |  |
| /$defs/supply&#95;item/properties/alternative&#95;products | type: array; description: Alternative products that can be used instead. |  |
| /$defs/supply&#95;item/properties/alternative&#95;products/items | type: string |  |
| /$defs/supply&#95;item/properties/notes | type: string; description: Usage notes, warnings, or tips. |  |
| /$defs/known&#95;threat | type: object; required: &#91;"threat&#95;type","name"&#93;; additionalProperties: false; description: A pest, disease, or environmental threat this species is susceptible to. Models the PROTECTION PROTOCOL, not the current state. Includes risk season, symptoms to watch for, and prevention/treatment methods with supplies. Answers CQ38.  |  |
| /$defs/known&#95;threat/properties/threat&#95;type | type: string; enum: &#91;"pest","disease-fungal","disease-bacterial","disease-viral","animal","environmental"&#93;; description: Category of threat. |  |
| /$defs/known&#95;threat/properties/name | type: string; description: Common name of the pest, disease, or threat. |  |
| /$defs/known&#95;threat/properties/risk&#95;months | type: array; description: Months (1-12) when this threat is most dangerous. |  |
| /$defs/known&#95;threat/properties/risk&#95;months/items | type: integer |  |
| /$defs/known&#95;threat/properties/symptoms | type: string; description: Visual signs to watch for in early detection. |  |
| /$defs/known&#95;threat/properties/prevention&#95;method | type: string; description: Proactive measures to prevent this threat. |  |
| /$defs/known&#95;threat/properties/treatment&#95;method | type: string; description: Reactive measures if threat is detected. |  |
| /$defs/known&#95;threat/properties/supplies | type: array; description: Products needed for prevention and/or treatment. |  |
| /$defs/known&#95;threat/properties/supplies/items |  | #/$defs/supply&#95;item |
| /$defs/pruning&#95;guide | type: object; additionalProperties: false; description: Pruning protocol: types of pruning applicable, optimal timing, technique description, and tools. Answers CQ39.  |  |
| /$defs/pruning&#95;guide/properties/pruning&#95;types | type: array; description: Types of pruning applicable to this species. |  |
| /$defs/pruning&#95;guide/properties/pruning&#95;types/items | type: string; enum: &#91;"formative","sanitary","rejuvenation","thinning","topiary","hedge-trim","deadheading","pollarding","coppicing","espalier","crown-reduction","root-pruning"&#93; |  |
| /$defs/pruning&#95;guide/properties/best&#95;months | type: array; description: Optimal months (1-12) for pruning. |  |
| /$defs/pruning&#95;guide/properties/best&#95;months/items | type: integer |  |
| /$defs/pruning&#95;guide/properties/technique | type: string; description: Detailed pruning technique description. |  |
| /$defs/pruning&#95;guide/properties/frequency&#95;description | type: string; description: How often to prune. |  |
| /$defs/pruning&#95;guide/properties/tools&#95;required | type: array; description: Tools needed for pruning. |  |
| /$defs/pruning&#95;guide/properties/tools&#95;required/items | type: string |  |
| /$defs/pruning&#95;guide/properties/warnings | type: string; description: What NOT to do when pruning this species. |  |
| /$defs/soil&#95;requirement | type: object; additionalProperties: false; description: Preferred soil conditions for this species. |  |
| /$defs/soil&#95;requirement/properties/ph&#95;min | type: number; description: Lowest acceptable soil pH. |  |
| /$defs/soil&#95;requirement/properties/ph&#95;max | type: number; description: Highest acceptable soil pH. |  |
| /$defs/soil&#95;requirement/properties/preferred&#95;soil&#95;types | type: array; description: Soil types where this species thrives. |  |
| /$defs/soil&#95;requirement/properties/preferred&#95;soil&#95;types/items | type: string; enum: &#91;"clay","sandy","loam","silt","peat","chalky","clay-loam","sandy-loam","forest-humus","garden-mix"&#93; |  |
| /$defs/soil&#95;requirement/properties/drainage&#95;preference | type: string; enum: &#91;"poor","moderate","good","excessive"&#93; |  |
| /$defs/soil&#95;requirement/properties/moisture&#95;preference | type: string; enum: &#91;"dry","slightly-moist","moist","wet","moderately-moist"&#93; |  |
| /$defs/soil&#95;requirement/properties/notes | type: string; description: Additional soil requirements or tips. |  |

## nature/recommendations.schema.yaml

Planting Recommendations

| JSON Pointer | Type / constraints | Reference |
|---|---|---|
| / | type: object; additionalProperties: false; description: Analytically-derived planting recommendations for privacy screening, noise reduction, shade canopy, windbreak, fruit production, and ornamental value. Each recommendation identifies a specific species, position, and rationale. Accepted recommendations become estate changes (ECH###) and, upon completion, create new specimens (SPM###) or plantings (PTG###). Nature plane.  |  |
| /properties/planting&#95;recommendations | type: array; description: Analytically-derived planting recommendations. Answers CQ41–CQ44. |  |
| /properties/planting&#95;recommendations/items |  | #/$defs/planting&#95;recommendation |
| /$defs/planting&#95;recommendation | type: object; required: &#91;"id","name","species","recommendation&#95;type","growth&#95;form","outdoor&#95;zone&#95;ref","priority","status"&#93;; additionalProperties: false; description: A specific, positioned recommendation to plant a tree or shrub. Includes species, growth form, screening function, foundation safety analysis, shade impact assessment, and maintenance expectations. Answers CQ41 (screening), CQ42 (timeline), CQ43 (safety), CQ44 (shade).  |  |
| /$defs/planting&#95;recommendation/properties | description: {"type":"string"} |  |
| /$defs/planting&#95;recommendation/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?REC&#92;d{3,}$ |  |
| /$defs/planting&#95;recommendation/properties/name | type: string |  |
| /$defs/planting&#95;recommendation/properties/species | type: string; description: Botanical species name (including cultivar if relevant). |  |
| /$defs/planting&#95;recommendation/properties/common&#95;name | type: string |  |
| /$defs/planting&#95;recommendation/properties/specimen&#95;type | type: string; enum: &#91;"tree-deciduous","tree-evergreen","tree-fruit","shrub-deciduous","shrub-evergreen","shrub-fruit","perennial","climber"&#93;; description: Same enum as specimen.specimen&#95;type. |  |
| /$defs/planting&#95;recommendation/properties/recommendation&#95;type | type: string; enum: &#91;"privacy-screen","noise-barrier","shade-canopy","windbreak","ornamental","fruit","ground-cover","combined"&#93;; description: Primary function this planting serves. |  |
| /$defs/planting&#95;recommendation/properties/growth&#95;form | type: string; enum: &#91;"free-growing","pleached","espalier","columnar","multi-stem","standard","topiary"&#93;; description: How the tree will be trained or allowed to grow. |  |
| /$defs/planting&#95;recommendation/properties/target&#95;height&#95;m | type: number; description: Expected height at maturity or management target. |  |
| /$defs/planting&#95;recommendation/properties/target&#95;width&#95;m | type: number; description: Expected canopy width at maturity. |  |
| /$defs/planting&#95;recommendation/properties/growth&#95;rate&#95;cm&#95;per&#95;year | type: number |  |
| /$defs/planting&#95;recommendation/properties/planting&#95;height&#95;cm | type: number; description: Expected height of nursery stock at purchase. |  |
| /$defs/planting&#95;recommendation/properties/leaf&#95;retention | type: string; enum: &#91;"deciduous","evergreen","semi-evergreen","marcescent"&#93;; description: Foliage behavior through seasons. Marcescent = retains dead leaves through winter. |  |
| /$defs/planting&#95;recommendation/properties/sun&#95;requirement | type: string; enum: &#91;"full-sun","partial-sun","partial-shade","full-shade"&#93; |  |
| /$defs/planting&#95;recommendation/properties/water&#95;requirement | type: string; enum: &#91;"drought-tolerant","low","moderate","high"&#93; |  |
| /$defs/planting&#95;recommendation/properties/hardiness&#95;zone&#95;min | type: string; pattern: ^&#92;d{1,2}&#91;ab&#93;$ |  |
| /$defs/planting&#95;recommendation/properties/bloom&#95;months | type: array |  |
| /$defs/planting&#95;recommendation/properties/bloom&#95;months/items | type: integer |  |
| /$defs/planting&#95;recommendation/properties/outdoor&#95;zone&#95;ref | description: Outdoor zone where the tree will be planted. | ../metamodel.schema.yaml#/$defs/outdoor&#95;zone&#95;ref |
| /$defs/planting&#95;recommendation/properties/boundary&#95;segment&#95;ref | description: Boundary segment this recommendation screens (if privacy/noise function). | ../metamodel.schema.yaml#/$defs/boundary&#95;segment&#95;ref |
| /$defs/planting&#95;recommendation/properties/position | description: Proposed planting position on the property grid. | ../metamodel.schema.yaml#/$defs/position |
| /$defs/planting&#95;recommendation/properties/screening&#95;function | type: object; additionalProperties: false; description: How this planting provides screening (privacy, noise, wind). |  |
| /$defs/planting&#95;recommendation/properties/screening&#95;function/properties/screens&#95;from&#95;direction |  | ../metamodel.schema.yaml#/$defs/compass&#95;direction |
| /$defs/planting&#95;recommendation/properties/screening&#95;function/properties/addresses&#95;concern&#95;refs | type: array; description: Shared concerns (SC###) this recommendation mitigates. |  |
| /$defs/planting&#95;recommendation/properties/screening&#95;function/properties/addresses&#95;concern&#95;refs/items |  | ../metamodel.schema.yaml#/$defs/shared&#95;concern&#95;ref |
| /$defs/planting&#95;recommendation/properties/screening&#95;function/properties/effective&#95;height&#95;range&#95;min&#95;m | type: number; description: Height at which screening begins (above ground). For pleached: stem height. |  |
| /$defs/planting&#95;recommendation/properties/screening&#95;function/properties/effective&#95;height&#95;range&#95;max&#95;m | type: number; description: Height at which screening ends (top of canopy/crown). |  |
| /$defs/planting&#95;recommendation/properties/screening&#95;function/properties/year&#95;round&#95;coverage&#95;percent | type: integer; description: Screening effectiveness in winter: 100=evergreen, ~70=marcescent, ~40=deciduous skeleton. |  |
| /$defs/planting&#95;recommendation/properties/screening&#95;function/properties/years&#95;to&#95;effectiveness | type: number; description: Estimated years until this planting provides meaningful screening. |  |
| /$defs/planting&#95;recommendation/properties/foundation&#95;safety | type: object; additionalProperties: false; description: Root system risk analysis relative to nearby structures. |  |
| /$defs/planting&#95;recommendation/properties/foundation&#95;safety/properties/root&#95;type | type: string; enum: &#91;"deep-taproot","deep-spreading","shallow-spreading","compact","non-aggressive"&#93; |  |
| /$defs/planting&#95;recommendation/properties/foundation&#95;safety/properties/distance&#95;to&#95;nearest&#95;foundation&#95;m | type: number; description: Distance from proposed position to nearest building foundation. |  |
| /$defs/planting&#95;recommendation/properties/foundation&#95;safety/properties/nearest&#95;structure&#95;ref |  | ../metamodel.schema.yaml#/$defs/building&#95;ref |
| /$defs/planting&#95;recommendation/properties/foundation&#95;safety/properties/risk&#95;level | type: string; enum: &#91;"none","low","moderate","high"&#93; |  |
| /$defs/planting&#95;recommendation/properties/foundation&#95;safety/properties/notes | type: string |  |
| /$defs/planting&#95;recommendation/properties/shade&#95;impact | type: object; additionalProperties: false; description: Predicted shading effect on own property zones. |  |
| /$defs/planting&#95;recommendation/properties/shade&#95;impact/properties | description: {"type":"string","title":"Impact Description"} |  |
| /$defs/planting&#95;recommendation/properties/shade&#95;impact/properties/shadow&#95;direction | description: Primary direction shadow falls (afternoon = E for W-boundary trees). | ../metamodel.schema.yaml#/$defs/compass&#95;direction |
| /$defs/planting&#95;recommendation/properties/shade&#95;impact/properties/affected&#95;zone&#95;refs | type: array |  |
| /$defs/planting&#95;recommendation/properties/shade&#95;impact/properties/affected&#95;zone&#95;refs/items |  | ../metamodel.schema.yaml#/$defs/outdoor&#95;zone&#95;ref |
| /$defs/planting&#95;recommendation/properties/shade&#95;impact/properties/description | type: string |  |
| /$defs/planting&#95;recommendation/properties/maintenance&#95;level | type: string; enum: &#91;"zero","minimal","low","moderate","high"&#93;; description: Expected annual maintenance effort. |  |
| /$defs/planting&#95;recommendation/properties/maintenance&#95;description | type: string |  |
| /$defs/planting&#95;recommendation/properties/estimated&#95;cost&#95;pln | type: number; description: Estimated purchase cost for nursery stock. |  |
| /$defs/planting&#95;recommendation/properties/priority | type: string; enum: &#91;"critical","high","medium","low"&#93; |  |
| /$defs/planting&#95;recommendation/properties/status | type: string; enum: &#91;"proposed","accepted","rejected","planted"&#93;; description: Lifecycle status of this recommendation. |  |
| /$defs/planting&#95;recommendation/properties/planting&#95;season | type: string; description: Best time to plant this species. |  |
| /$defs/planting&#95;recommendation/properties/linked&#95;estate&#95;change&#95;ref | description: Estate change created when this recommendation is accepted. | ../metamodel.schema.yaml#/$defs/estate&#95;change&#95;ref |
| /$defs/planting&#95;recommendation/properties/rationale | type: string; description: Analytical justification for this recommendation. |  |
| /$defs/planting&#95;recommendation/properties/description | type: string |  |
| /$defs/planting&#95;recommendation/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |

## nature/soil.schema.yaml

Soil Profiles

| JSON Pointer | Type / constraints | Reference |
|---|---|---|
| / | type: object; additionalProperties: false; description: Soil profiles for outdoor zones: type classification, pH level, texture, drainage, organic matter, and amendment recommendations with dosage and product info. One zone may have multiple soil profiles (e.g., lawn area vs raised beds within the same zone). Nature plane.  |  |
| /properties/soil&#95;profiles | type: array; description: Soil profiles for outdoor zones. Answers CQ37. |  |
| /properties/soil&#95;profiles/items |  | #/$defs/soil&#95;profile |
| /$defs/soil&#95;profile | type: object; required: &#91;"id","name","outdoor&#95;zone&#95;ref"&#93;; additionalProperties: false; description: Soil characteristics for a specific area within an outdoor zone. Covers type, pH, texture, drainage, organic matter, and recommended amendments with dosage. A separate entity because the same OZ may contain different soil types (e.g., OZ004 has lawn soil vs raised bed soil). Answers CQ37. Used by T3, T10.  |  |
| /$defs/soil&#95;profile/properties | description: {"type":"string"} |  |
| /$defs/soil&#95;profile/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?SOIL&#92;d{3,}$ |  |
| /$defs/soil&#95;profile/properties/name | type: string |  |
| /$defs/soil&#95;profile/properties/outdoor&#95;zone&#95;ref | description: Zone where this soil profile applies. | ../metamodel.schema.yaml#/$defs/outdoor&#95;zone&#95;ref |
| /$defs/soil&#95;profile/properties/position | description: Center of soil profile area (when it covers only part of the zone). | ../metamodel.schema.yaml#/$defs/position |
| /$defs/soil&#95;profile/properties/footprint | description: Shape of the area this soil profile covers. | ../metamodel.schema.yaml#/$defs/footprint |
| /$defs/soil&#95;profile/properties/area&#95;sqm | type: number; description: Approximate area covered by this soil profile. |  |
| /$defs/soil&#95;profile/properties/soil&#95;type | type: string; enum: &#91;"clay","sandy","loam","silt","peat","chalky","clay-loam","sandy-loam","forest-humus","garden-mix","compost-enriched"&#93;; description: Primary soil classification. |  |
| /$defs/soil&#95;profile/properties/ph&#95;level | type: number; description: Measured or estimated soil pH. 7.0 = neutral. |  |
| /$defs/soil&#95;profile/properties/ph&#95;measured&#95;date | description: When pH was last measured. Omit if estimated. | ../metamodel.schema.yaml#/$defs/iso&#95;date |
| /$defs/soil&#95;profile/properties/organic&#95;matter&#95;percent | type: number; description: Estimated organic matter content. |  |
| /$defs/soil&#95;profile/properties/moisture&#95;retention | type: string; enum: &#91;"very-low","low","moderate","high","very-high"&#93;; description: How well the soil retains water. |  |
| /$defs/soil&#95;profile/properties/drainage | type: string; enum: &#91;"poor","moderate","good","excessive"&#93;; description: How quickly water drains through. |  |
| /$defs/soil&#95;profile/properties/texture&#95;description | type: string; description: Free-text description of soil feel and composition. |  |
| /$defs/soil&#95;profile/properties/amendments | type: array; description: Recommended or applied soil amendments with dosage, timing, and product info. Answers CQ37. Used by T10 (calendar) and T11 (shopping list).  |  |
| /$defs/soil&#95;profile/properties/amendments/items |  | #/$defs/soil&#95;amendment |
| /$defs/soil&#95;profile/properties/description | type: string |  |
| /$defs/soil&#95;profile/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |
| /$defs/soil&#95;amendment | type: object; required: &#91;"amendment&#95;type","name"&#93;; additionalProperties: false; description: A soil improvement action: what to apply, when, how much, and why. Includes product recommendations with pricing.  |  |
| /$defs/soil&#95;amendment/properties/amendment&#95;type | type: string; enum: &#91;"lime","calcium-sulfate","basalt-meal","compost","peat","sand","clay","manure","sulfur","iron-sulfate","gypsum","bark-mulch","green-manure","vermiculite","perlite","biochar"&#93;; description: Category of soil amendment. |  |
| /$defs/soil&#95;amendment/properties/name | type: string |  |
| /$defs/soil&#95;amendment/properties/purpose | type: string; description: Why this amendment is needed. |  |
| /$defs/soil&#95;amendment/properties/application&#95;months | type: array; description: Best months (1-12) for applying this amendment. |  |
| /$defs/soil&#95;amendment/properties/application&#95;months/items | type: integer |  |
| /$defs/soil&#95;amendment/properties/dosage | type: string; description: Application rate per unit area. |  |
| /$defs/soil&#95;amendment/properties/frequency&#95;description | type: string; description: How often to apply. |  |
| /$defs/soil&#95;amendment/properties/supplies | type: array; description: Products for this amendment with pricing. |  |
| /$defs/soil&#95;amendment/properties/supplies/items |  | care.schema.yaml#/$defs/supply&#95;item |
| /$defs/soil&#95;amendment/properties/notes | type: string; description: Application tips or warnings. |  |

## nature/vegetation.schema.yaml

Vegetation

| JSON Pointer | Type / constraints | Reference |
|---|---|---|
| / | type: object; additionalProperties: false; description: Individual plant specimens (significant trees, notable shrubs) and categorical planting groups (hedges, flower beds, lawns). Tracks species, botanical needs, spatial placement, and watering requirements. Nature plane.  |  |
| /properties/specimens | type: array; description: Individual plants and trees. Answers CQ09. |  |
| /properties/specimens/items |  | #/$defs/specimen |
| /properties/plantings | type: array; description: Categorical planting groups. Answers CQ10, CQ11. |  |
| /properties/plantings/items |  | #/$defs/planting |
| /$defs/specimen | type: object; required: &#91;"id","name","specimen&#95;type","outdoor&#95;zone&#95;ref"&#93;; additionalProperties: false; description: An individual plant or tree significant enough to track independently. Large trees are spatial landmarks with canopy radius. Answers CQ09 (identity, position, area). Used by T2 (inventory), T3 (garden planning), T5 (spatial layout - rendered as circle with canopy&#95;radius&#95;m).  |  |
| /$defs/specimen/properties | description: {"type":"string"} |  |
| /$defs/specimen/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?SPM&#92;d{3,}$ |  |
| /$defs/specimen/properties/name | type: string |  |
| /$defs/specimen/properties/specimen&#95;type | type: string; enum: &#91;"tree-deciduous","tree-evergreen","tree-fruit","shrub-deciduous","shrub-evergreen","shrub-fruit","perennial","climber","bamboo","palm"&#93;; description: Growth form classification. |  |
| /$defs/specimen/properties/species | type: string; description: Botanical species name. |  |
| /$defs/specimen/properties/common&#95;name | type: string |  |
| /$defs/specimen/properties/height&#95;m | type: number |  |
| /$defs/specimen/properties/canopy&#95;radius&#95;m | type: number; description: Radius of the canopy circle in meters. Used by T5 to render the specimen as a circle centered on its position. Answers CQ09 (area occupied by the tree).  |  |
| /$defs/specimen/properties/trunk&#95;diameter&#95;cm | type: number; description: Diameter at breast height (DBH). Relevant for protected tree classification. |  |
| /$defs/specimen/properties/crown&#95;bottom&#95;height&#95;m | type: number; description: Height of the bottom of the canopy above ground (clear trunk height). Used for 3D canopy placement - the canopy sphere/ellipsoid starts here. Example: a tree with height&#95;m=12 and crown&#95;bottom&#95;height&#95;m=4 has an 8m tall canopy starting 4m above ground.  |  |
| /$defs/specimen/properties/trunk&#95;height&#95;m | type: number; description: Height of the visible trunk from ground to first major branch. May differ from crown&#95;bottom&#95;height&#95;m if branches extend below canopy.  |  |
| /$defs/specimen/properties/canopy&#95;shape | type: string; enum: &#91;"sphere","ellipsoid-tall","ellipsoid-wide","cone","column","umbrella","weeping","irregular"&#93;; description: Approximate 3D shape of the canopy for rendering. Determines which geometry primitive the 3D viewer uses.  |  |
| /$defs/specimen/properties/growth&#95;rate&#95;cm&#95;per&#95;year | type: number; description: Average annual height growth rate. Answers CQ28. |  |
| /$defs/specimen/properties/mature&#95;height&#95;m | type: number; description: Expected final height at maturity. Answers CQ28. |  |
| /$defs/specimen/properties/height&#95;measured&#95;date | description: Date when height&#95;m was last measured. | ../metamodel.schema.yaml#/$defs/iso&#95;date |
| /$defs/specimen/properties/condition | type: string; enum: &#91;"healthy","stressed","damaged","recovering","dead","dormant"&#93;; description: Current botanical health condition. |  |
| /$defs/specimen/properties/planted&#95;date | description: When this specimen was planted (or estimated if pre-existing). | ../metamodel.schema.yaml#/$defs/iso&#95;date |
| /$defs/specimen/properties/estimated&#95;age&#95;years | type: integer |  |
| /$defs/specimen/properties/is&#95;protected | type: boolean; description: Whether this tree/plant is under legal protection (heritage tree, etc.). |  |
| /$defs/specimen/properties/sun&#95;requirement | type: string; enum: &#91;"full-sun","partial-sun","partial-shade","full-shade"&#93;; description: Light needs for healthy growth. Used by T3 (garden planning). |  |
| /$defs/specimen/properties/water&#95;requirement | type: string; enum: &#91;"drought-tolerant","low","moderate","high"&#93;; description: Irrigation needs. Used by T3. |  |
| /$defs/specimen/properties/hardiness&#95;zone&#95;min | type: string; pattern: ^&#92;d{1,2}&#91;ab&#93;$; description: Coldest zone this specimen tolerates. |  |
| /$defs/specimen/properties/leaf&#95;retention | type: string; enum: &#91;"deciduous","evergreen","semi-evergreen"&#93;; description: Deciduous (drops leaves) or evergreen. Affects year-round screening. |  |
| /$defs/specimen/properties/bloom&#95;months | type: array; description: Months when this specimen flowers (1-12). |  |
| /$defs/specimen/properties/bloom&#95;months/items | type: integer |  |
| /$defs/specimen/properties/outdoor&#95;zone&#95;ref | description: Outdoor zone where this specimen grows. | ../metamodel.schema.yaml#/$defs/outdoor&#95;zone&#95;ref |
| /$defs/specimen/properties/position&#95;accuracy&#95;m |  | ../metamodel.schema.yaml#/$defs/position&#95;accuracy&#95;m |
| /$defs/specimen/properties/position&#95;source |  | ../metamodel.schema.yaml#/$defs/position&#95;source |
| /$defs/specimen/properties/position&#95;derived&#95;from |  | ../metamodel.schema.yaml#/$defs/position&#95;derived&#95;from |
| /$defs/specimen/properties/position | description: Center of this specimen on the property grid. | ../metamodel.schema.yaml#/$defs/position |
| /$defs/specimen/properties/companion&#95;specimen&#95;refs | type: array; description: Other specimens that benefit from proximity. Used by T3. |  |
| /$defs/specimen/properties/companion&#95;specimen&#95;refs/items |  | ../metamodel.schema.yaml#/$defs/specimen&#95;ref |
| /$defs/specimen/properties/antagonist&#95;specimen&#95;refs | type: array; description: Specimens that should be kept distant. Used by T3. |  |
| /$defs/specimen/properties/antagonist&#95;specimen&#95;refs/items |  | ../metamodel.schema.yaml#/$defs/specimen&#95;ref |
| /$defs/specimen/properties/care&#95;profile&#95;ref | description: Species-level care protocol for this specimen. Answers CQ35, CQ38, CQ39. | ../metamodel.schema.yaml#/$defs/care&#95;profile&#95;ref |
| /$defs/specimen/properties/member&#95;of&#95;ref | description: The group this entity was one member of before it needed a history of its own. The group keeps its count; this entity's position is no longer listed among the group's members.  | ../metamodel.schema.yaml#/$defs/planting&#95;ref |
| /$defs/specimen/properties/description | type: string |  |
| /$defs/specimen/properties/lifecycle | description: Set when this record has ended; absent means active. Retired records are excluded by default and counted. | ../metamodel.schema.yaml#/$defs/lifecycle |
| /$defs/specimen/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |
| /$defs/planting | type: object; required: &#91;"id","name","planting&#95;type","outdoor&#95;zone&#95;ref"&#93;; additionalProperties: false; description: A categorical group of plants: a hedge row, flower bed, lawn section, vegetable bed, or mixed border. Tracks species, count, aggregate area, and care schedule. Answers CQ10 (species, watering needs per zone) and CQ11 (organization). Used by T2, T3.  |  |
| /$defs/planting/properties | description: {"type":"string"} |  |
| /$defs/planting/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?PTG&#92;d{3,}$ |  |
| /$defs/planting/properties/name | type: string |  |
| /$defs/planting/properties/planting&#95;type | type: string; enum: &#91;"hedge","flower-bed","vegetable-bed","herb-garden","ground-cover","lawn","meadow-section","mixed-border","raised-bed","container-group","climbing-wall","green-roof"&#93;; description: Category of this planting group. |  |
| /$defs/planting/properties/species | type: string; description: Dominant species in this planting (for monoculture groups). |  |
| /$defs/planting/properties/common&#95;name | type: string |  |
| /$defs/planting/properties/species&#95;mix | type: array; description: Multiple species in this planting (for mixed borders, meadows). |  |
| /$defs/planting/properties/species&#95;mix/items | type: object; required: &#91;"species"&#93;; additionalProperties: false |  |
| /$defs/planting/properties/species&#95;mix/items/properties/species | type: string |  |
| /$defs/planting/properties/species&#95;mix/items/properties/common&#95;name | type: string |  |
| /$defs/planting/properties/species&#95;mix/items/properties/proportion&#95;percent | type: number |  |
| /$defs/planting/properties/count | type: integer; description: Number of individual plants in this group. |  |
| /$defs/planting/properties/area&#95;sqm | type: number |  |
| /$defs/planting/properties/spacing&#95;cm | type: number; description: Distance between individual plants. Answers CQ28. |  |
| /$defs/planting/properties/current&#95;height&#95;min&#95;cm | type: number; description: Height of the shortest plant in the group. |  |
| /$defs/planting/properties/current&#95;height&#95;max&#95;cm | type: number; description: Height of the tallest plant in the group. |  |
| /$defs/planting/properties/target&#95;height&#95;m | type: number; description: Desired final height (for hedges, privacy screens). Answers CQ28. |  |
| /$defs/planting/properties/age&#95;years | type: number; description: Approximate age of the planting. |  |
| /$defs/planting/properties/species&#95;confirmed | type: boolean; description: Whether species identification has been verified in the field. |  |
| /$defs/planting/properties/sun&#95;requirement | type: string; enum: &#91;"full-sun","partial-sun","partial-shade","full-shade"&#93; |  |
| /$defs/planting/properties/water&#95;requirement | type: string; enum: &#91;"drought-tolerant","low","moderate","high"&#93; |  |
| /$defs/planting/properties/watering&#95;schedule | description: Recurring watering schedule. Typically active in summer months only. | ../metamodel.schema.yaml#/$defs/rrule&#95;schedule |
| /$defs/planting/properties/season | type: string; enum: &#91;"spring","summer","autumn","winter","year-round"&#93;; description: When this planting is actively growing or visible. |  |
| /$defs/planting/properties/outdoor&#95;zone&#95;ref |  | ../metamodel.schema.yaml#/$defs/outdoor&#95;zone&#95;ref |
| /$defs/planting/properties/position&#95;accuracy&#95;m |  | ../metamodel.schema.yaml#/$defs/position&#95;accuracy&#95;m |
| /$defs/planting/properties/position&#95;source |  | ../metamodel.schema.yaml#/$defs/position&#95;source |
| /$defs/planting/properties/position&#95;derived&#95;from |  | ../metamodel.schema.yaml#/$defs/position&#95;derived&#95;from |
| /$defs/planting/properties/position |  | ../metamodel.schema.yaml#/$defs/position |
| /$defs/planting/properties/footprint | description: Shape of this planting area on the layout. | ../metamodel.schema.yaml#/$defs/footprint |
| /$defs/planting/properties/height&#95;m | type: number; description: Current height of this planting group for 3D rendering. For hedges, the maintained height. Derived from current&#95;height&#95;min&#95;cm/max&#95;cm average / 100 if not explicitly set.  |  |
| /$defs/planting/properties/render&#95;as | type: string; enum: &#91;"extruded-polygon","ground-cover","point-cloud","row"&#93;; description: How this planting should appear in 3D scenes. |  |
| /$defs/planting/properties/care&#95;profile&#95;ref | description: Species-level care protocol for this planting. Answers CQ35, CQ38, CQ39. | ../metamodel.schema.yaml#/$defs/care&#95;profile&#95;ref |
| /$defs/planting/properties/leaf&#95;retention | type: string; description: Leaf retention habit (e.g., deciduous, evergreen, semi-evergreen). |  |
| /$defs/planting/properties/shared&#95;edges | type: array; description: Edges of this element's outline that lie on another element's edge and follow it when it moves. Declare an edge here when its coordinates were set to meet a neighbour rather than measured; tools move a declared edge and never a merely coincident one.  |  |
| /$defs/planting/properties/shared&#95;edges/items |  | ../metamodel.schema.yaml#/$defs/shared&#95;edge |
| /$defs/planting/properties/members | type: array; description: Individual positions of the units this entity stands for, one entry per unit, when a consumer needs to place them: six clipped shrubs on either side of a walk, a run of solar lamps along a fence. Explicit points only; a spacing rule is computed once and its points written here with their derivation. A unit promoted to an entity of its own is removed from this list.  |  |
| /$defs/planting/properties/members/items |  | ../metamodel.schema.yaml#/$defs/placed&#95;member |
| /$defs/planting/properties/description | type: string |  |
| /$defs/planting/properties/lifecycle | description: Set when this record has ended; absent means active. Retired records are excluded by default and counted. | ../metamodel.schema.yaml#/$defs/lifecycle |
| /$defs/planting/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |

## operations/compliance.schema.yaml

Compliance &amp; Warranties

| JSON Pointer | Type / constraints | Reference |
|---|---|---|
| / | type: object; additionalProperties: false; description: Warranty tracking with service conditions that must be met to keep coverage valid, and regulatory requirements for legally mandated inspections and certifications. Operations plane.  |  |
| /properties/warranties | type: array; description: Manufacturer and installer warranties. Answers CQ14. |  |
| /properties/warranties/items |  | #/$defs/warranty |
| /properties/regulatory&#95;requirements | type: array; description: Legally mandated inspections and certifications. Answers CQ15. |  |
| /properties/regulatory&#95;requirements/items |  | #/$defs/regulatory&#95;requirement |
| /$defs/warranty | type: object; required: &#91;"id","name","start&#95;date","end&#95;date"&#93;; additionalProperties: false; description: A manufacturer or installer warranty covering a system or component. Critically tracks service&#95;conditions - the maintenance actions required to keep the warranty valid. Missing a required service voids coverage. Answers CQ14 (expiry, required servicing). Used by T1 (calendar generation - warranty-driven tasks have critical priority).  |  |
| /$defs/warranty/properties | description: {"type":"string"} |  |
| /$defs/warranty/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?WRT&#92;d{3,}$ |  |
| /$defs/warranty/properties/name | type: string |  |
| /$defs/warranty/properties/manufacturer | type: string |  |
| /$defs/warranty/properties/warranty&#95;type | type: string; enum: &#91;"manufacturer-standard","manufacturer-extended","installer","third-party"&#93;; description: Kind of warranty coverage. |  |
| /$defs/warranty/properties/start&#95;date | description: When warranty coverage begins. | ../metamodel.schema.yaml#/$defs/iso&#95;date |
| /$defs/warranty/properties/end&#95;date | description: When warranty coverage expires. This is the critical deadline. | ../metamodel.schema.yaml#/$defs/iso&#95;date |
| /$defs/warranty/properties/covered&#95;system&#95;refs | type: array; description: Systems protected by this warranty. |  |
| /$defs/warranty/properties/covered&#95;system&#95;refs/items |  | ../metamodel.schema.yaml#/$defs/system&#95;ref |
| /$defs/warranty/properties/covered&#95;component&#95;refs | type: array; description: Individual components protected by this warranty. |  |
| /$defs/warranty/properties/covered&#95;component&#95;refs/items |  | ../metamodel.schema.yaml#/$defs/component&#95;ref |
| /$defs/warranty/properties/service&#95;conditions | type: array; description: Mandatory maintenance actions required to keep the warranty valid. Each condition specifies what must be done, how often, and what evidence is required. THIS IS THE MOST IMPORTANT WARRANTY FIELD - missing a condition voids coverage. Answers CQ14.  |  |
| /$defs/warranty/properties/service&#95;conditions/items | type: object; required: &#91;"description","frequency"&#93;; additionalProperties: false |  |
| /$defs/warranty/properties/service&#95;conditions/items/properties | description: {"type":"string","title":"Condition Description","description":"What must be done to satisfy this condition.","examples":&#91;"Annual service by certified technician"&#93;} |  |
| /$defs/warranty/properties/service&#95;conditions/items/properties/description | type: string; description: What must be done to satisfy this condition. |  |
| /$defs/warranty/properties/service&#95;conditions/items/properties/frequency | description: How often this service must be performed. | ../metamodel.schema.yaml#/$defs/rrule&#95;schedule |
| /$defs/warranty/properties/service&#95;conditions/items/properties/evidence&#95;required | type: string; description: Documentation needed to prove compliance (receipt, stamp, etc.). |  |
| /$defs/warranty/properties/service&#95;conditions/items/properties/must&#95;use&#95;certified&#95;technician | type: boolean; description: Whether only manufacturer-certified technicians qualify. |  |
| /$defs/warranty/properties/service&#95;conditions/items/properties/last&#95;performed | description: Date of most recent compliant service (snapshot in model; history in external store). | ../metamodel.schema.yaml#/$defs/iso&#95;date |
| /$defs/warranty/properties/void&#95;conditions | type: array; description: Actions or conditions that void the warranty. |  |
| /$defs/warranty/properties/void&#95;conditions/items | type: string |  |
| /$defs/warranty/properties/documentation&#95;url | type: string; description: Link to warranty terms document. |  |
| /$defs/warranty/properties/contact&#95;info | type: string; description: Phone number or email for warranty claims. |  |
| /$defs/warranty/properties/description | type: string |  |
| /$defs/warranty/properties/lifecycle | description: Set when this record has ended; absent means active. Retired records are excluded by default and counted. | ../metamodel.schema.yaml#/$defs/lifecycle |
| /$defs/warranty/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |
| /$defs/regulatory&#95;requirement | type: object; required: &#91;"id","name","requirement&#95;type","inspection&#95;schedule"&#93;; additionalProperties: false; description: A legally mandated inspection, certification, or safety check. Non-compliance may result in fines, insurance voiding, or safety hazards. Answers CQ15 (deadlines, penalties). Used by T1 (calendar).  |  |
| /$defs/regulatory&#95;requirement/properties | description: {"type":"string"} |  |
| /$defs/regulatory&#95;requirement/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?REG&#92;d{3,}$ |  |
| /$defs/regulatory&#95;requirement/properties/name | type: string |  |
| /$defs/regulatory&#95;requirement/properties/requirement&#95;type | type: string; enum: &#91;"gas-safety","electrical-safety","chimney-sweep","fire-safety","elevator-inspection","tree-inspection","septic-inspection","water-quality","energy-audit","radon-testing","asbestos-check","lightning-protection","pressure-vessel","other"&#93;; description: Category of regulatory mandate. |  |
| /$defs/regulatory&#95;requirement/properties/jurisdiction | type: string; description: Country, state, or municipality that mandates this requirement. |  |
| /$defs/regulatory&#95;requirement/properties/legal&#95;basis | type: string; description: Law, regulation, or standard that requires this inspection. |  |
| /$defs/regulatory&#95;requirement/properties/inspection&#95;schedule | description: How often this inspection must be performed. | ../metamodel.schema.yaml#/$defs/rrule&#95;schedule |
| /$defs/regulatory&#95;requirement/properties/penalty&#95;description | type: string; description: What happens if this requirement is not met. |  |
| /$defs/regulatory&#95;requirement/properties/target&#95;system&#95;refs | type: array; description: Systems that must comply with this requirement. |  |
| /$defs/regulatory&#95;requirement/properties/target&#95;system&#95;refs/items |  | ../metamodel.schema.yaml#/$defs/system&#95;ref |
| /$defs/regulatory&#95;requirement/properties/target&#95;building&#95;refs | type: array |  |
| /$defs/regulatory&#95;requirement/properties/target&#95;building&#95;refs/items |  | ../metamodel.schema.yaml#/$defs/building&#95;ref |
| /$defs/regulatory&#95;requirement/properties/last&#95;inspection&#95;date | description: Date of most recent passing inspection (snapshot; history in external store). | ../metamodel.schema.yaml#/$defs/iso&#95;date |
| /$defs/regulatory&#95;requirement/properties/next&#95;due&#95;date | description: Calculated or manually set next inspection deadline. | ../metamodel.schema.yaml#/$defs/iso&#95;date |
| /$defs/regulatory&#95;requirement/properties/certified&#95;inspector&#95;required | type: boolean; description: Whether only a licensed/certified inspector may perform the check. |  |
| /$defs/regulatory&#95;requirement/properties/notification&#95;rule&#95;refs | type: array; description: Alerts for upcoming inspection deadlines. |  |
| /$defs/regulatory&#95;requirement/properties/notification&#95;rule&#95;refs/items |  | ../metamodel.schema.yaml#/$defs/notification&#95;rule&#95;ref |
| /$defs/regulatory&#95;requirement/properties/overdue&#95;since | description: Date since which this requirement is overdue. Null/omitted if current. | ../metamodel.schema.yaml#/$defs/iso&#95;date |
| /$defs/regulatory&#95;requirement/properties/consequence&#95;description | type: string; description: Specific consequences of non-compliance beyond penalty&#95;description: insurance implications, mortgage conditions, safety hazards.  |  |
| /$defs/regulatory&#95;requirement/properties/description | type: string |  |
| /$defs/regulatory&#95;requirement/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |

## operations/maintenance.schema.yaml

Maintenance Operations

| JSON Pointer | Type / constraints | Reference |
|---|---|---|
| / | type: object; additionalProperties: false; description: Recurring maintenance tasks with RRULE scheduling, notification rules, and cost categories. The engine for generating maintenance calendars and cost dashboards. Operations plane.  |  |
| /properties/maintenance&#95;tasks | type: array; description: Recurring maintenance activities. Answers CQ13. |  |
| /properties/maintenance&#95;tasks/items |  | #/$defs/maintenance&#95;task |
| /properties/notification&#95;rules | type: array; description: Alert triggers for maintenance and compliance. Answers CQ17. |  |
| /properties/notification&#95;rules/items |  | #/$defs/notification&#95;rule |
| /properties/cost&#95;categories | type: array; description: Budget categories for cost tracking. Answers CQ16. |  |
| /properties/cost&#95;categories/items |  | #/$defs/cost&#95;category |
| /$defs/maintenance&#95;task | type: object; required: &#91;"id","name","task&#95;type","target&#95;ref","schedule"&#93;; additionalProperties: false; description: A recurring maintenance activity targeting a specific element (system, building, zone, plant, etc.). Defines what needs doing, how often (RRULE schedule), and what alerts to trigger. Answers CQ13 (due dates). Used by T1 (calendar generation).  |  |
| /$defs/maintenance&#95;task/properties | description: {"type":"string"} |  |
| /$defs/maintenance&#95;task/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?MT&#92;d{3,}$ |  |
| /$defs/maintenance&#95;task/properties/name | type: string |  |
| /$defs/maintenance&#95;task/properties/kind | type: string; enum: &#91;"garden","building","infrastructure"&#93;; description: High-level domain classification. Used to group tasks in reports and PDF generators. |  |
| /$defs/maintenance&#95;task/properties/task&#95;type | type: string; enum: &#91;"inspection","cleaning","servicing","replacement","seasonal-prep","treatment","pruning","mowing","watering","fertilizing","testing","calibration","lubrication","painting","sealing","mulching","soil-amendment","pest-protection","winter-protection","spring-uncovering","transplanting"&#93;; description: Classification of the maintenance activity. |  |
| /$defs/maintenance&#95;task/properties/target&#95;ref | description: The element this task maintains (system, component, building, zone, plant, etc.). | ../metamodel.schema.yaml#/$defs/maintainable&#95;element&#95;ref |
| /$defs/maintenance&#95;task/properties/schedule | description: When and how often this task recurs. | ../metamodel.schema.yaml#/$defs/rrule&#95;schedule |
| /$defs/maintenance&#95;task/properties/estimated&#95;duration&#95;minutes | type: integer; description: How long the task typically takes. |  |
| /$defs/maintenance&#95;task/properties/priority | type: string; enum: &#91;"critical","high","medium","low"&#93;; description: Importance level. Critical = safety/warranty risk if missed. |  |
| /$defs/maintenance&#95;task/properties/season | type: string; enum: &#91;"spring","summer","autumn","winter","year-round"&#93;; description: Season when this task is most relevant. |  |
| /$defs/maintenance&#95;task/properties/instructions | type: string; description: Step-by-step procedure or notes for performing this task. |  |
| /$defs/maintenance&#95;task/properties/tools&#95;required | type: array; description: List of tools or supplies needed. |  |
| /$defs/maintenance&#95;task/properties/tools&#95;required/items | type: string |  |
| /$defs/maintenance&#95;task/properties/executions | type: array; description: The occasions on which this task was actually carried out. A recurring task states how often it should happen; this list states when it did, which is what answers "when was this last done" and "what has it cost over the years". The most recent date, the number of occasions and the running total are read from this list rather than stored beside it, so they cannot disagree with it. Answers CQ34.  |  |
| /$defs/maintenance&#95;task/properties/executions/items |  | ../metamodel.schema.yaml#/$defs/execution |
| /$defs/maintenance&#95;task/properties/warranty&#95;ref | description: Warranty that requires this task to remain valid. Answers CQ14. | ../metamodel.schema.yaml#/$defs/warranty&#95;ref |
| /$defs/maintenance&#95;task/properties/regulatory&#95;requirement&#95;ref | description: Regulatory requirement that mandates this task. Answers CQ15. | ../metamodel.schema.yaml#/$defs/regulatory&#95;requirement&#95;ref |
| /$defs/maintenance&#95;task/properties/notification&#95;rule&#95;refs | type: array; description: Notifications to trigger for this task. |  |
| /$defs/maintenance&#95;task/properties/notification&#95;rule&#95;refs/items |  | ../metamodel.schema.yaml#/$defs/notification&#95;rule&#95;ref |
| /$defs/maintenance&#95;task/properties/cost&#95;category&#95;ref | description: Budget category for this task's costs. | ../metamodel.schema.yaml#/$defs/cost&#95;category&#95;ref |
| /$defs/maintenance&#95;task/properties/care&#95;profile&#95;ref | description: Species care profile this task originates from. Links operational task to species-level protocol. Answers CQ36 (supplies needed). Used by T10 (care calendar) and T11 (shopping list).  | ../metamodel.schema.yaml#/$defs/care&#95;profile&#95;ref |
| /$defs/maintenance&#95;task/properties/estimated&#95;cost | type: number |  |
| /$defs/maintenance&#95;task/properties/currency | type: string; pattern: ^&#91;A-Z&#93;{3}$ |  |
| /$defs/maintenance&#95;task/properties/description | type: string |  |
| /$defs/maintenance&#95;task/properties/lifecycle | description: Set when this record has ended; absent means active. Retired records are excluded by default and counted. | ../metamodel.schema.yaml#/$defs/lifecycle |
| /$defs/maintenance&#95;task/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |
| /$defs/notification&#95;rule | type: object; required: &#91;"id","name","lead&#95;time&#95;days","channel"&#93;; additionalProperties: false; description: Defines how and when to alert about upcoming maintenance tasks or compliance deadlines. Answers CQ17 (channel, lead time). Used by T1.  |  |
| /$defs/notification&#95;rule/properties | description: {"type":"string"} |  |
| /$defs/notification&#95;rule/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?NR&#92;d{3,}$ |  |
| /$defs/notification&#95;rule/properties/name | type: string |  |
| /$defs/notification&#95;rule/properties/lead&#95;time&#95;days | type: integer; description: How many days before the due date to trigger the notification. |  |
| /$defs/notification&#95;rule/properties/channel |  | ../metamodel.schema.yaml#/$defs/notification&#95;channel |
| /$defs/notification&#95;rule/properties/recipient | type: string; description: Email address, phone number, or webhook URL. |  |
| /$defs/notification&#95;rule/properties/message&#95;template | type: string; description: Template with {task&#95;name}, {due&#95;date}, {target} placeholders. |  |
| /$defs/notification&#95;rule/properties/repeat&#95;if&#95;unacknowledged | type: boolean; description: Whether to resend if the notification is not acknowledged. |  |
| /$defs/notification&#95;rule/properties/repeat&#95;interval&#95;days | type: integer; description: Days between repeated notifications. |  |
| /$defs/notification&#95;rule/properties/description | type: string |  |
| /$defs/notification&#95;rule/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |
| /$defs/cost&#95;category | type: object; required: &#91;"id","name","category&#95;type"&#93;; additionalProperties: false; description: A budget classification for grouping costs. Detailed cost records are stored in the external data store keyed by cost&#95;category&#95;ref. Answers CQ16 (annual costs by category). Used by T9.  |  |
| /$defs/cost&#95;category/properties | description: {"type":"string"} |  |
| /$defs/cost&#95;category/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?CC&#92;d{3,}$ |  |
| /$defs/cost&#95;category/properties/name | type: string |  |
| /$defs/cost&#95;category/properties/category&#95;type | type: string; enum: &#91;"energy-electricity","energy-gas","energy-heating-oil","energy-wood","energy-pellet","water","sewage","internet","telephone","heating-maintenance","garden-maintenance","building-maintenance","waste-management","insurance","property-tax","chimney-sweep","pest-control","security","other"&#93;; description: High-level cost classification. |  |
| /$defs/cost&#95;category/properties/annual&#95;budget&#95;estimate | type: number; description: Expected annual spend in this category. |  |
| /$defs/cost&#95;category/properties/currency | type: string; pattern: ^&#91;A-Z&#93;{3}$ |  |
| /$defs/cost&#95;category/properties/description | type: string |  |
| /$defs/cost&#95;category/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |

## realm-config.schema.yaml

Realm Configuration

| JSON Pointer | Type / constraints | Reference |
|---|---|---|
| / | type: object; additionalProperties: false; description: Per-model inference and validation configuration. Placed alongside the realm.yaml root file as realm-config.yaml. Controls tolerances, defaults, and thresholds used by the AI agent during construction geometry inference and by validation tools during post-inference quality checks. This is a standalone schema - NOT referenced from realm.schema.yaml. The config file is a sibling to the model, not part of the model.  |  |
| /properties/schema&#95;version | description: Realm schema version this configuration targets. | metamodel.schema.yaml#/$defs/schema&#95;version |
| /properties/inference |  | #/$defs/inference&#95;config |
| /properties/validation |  | #/$defs/validation&#95;config |
| /properties/rendering |  | #/$defs/rendering&#95;config |
| /$defs/inference&#95;config | type: object; additionalProperties: false; description: Tolerances and defaults used by the AI agent during semantic → construction geometry inference. Each parameter documents which inference rule (R01–R07) consumes it.  |  |
| /$defs/inference&#95;config/properties/wall&#95;alignment&#95;tolerance&#95;cm | type: number; description: When two room edges are within this distance, they are considered to share a wall line. Used in R05 (wall segment generation) for snapping parallel edges into a single wall line.  |  |
| /$defs/inference&#95;config/properties/room&#95;overlap&#95;tolerance&#95;sqm | type: number; description: Maximum acceptable overlap area between two room footprints before a warning is raised. Small overlaps occur due to wall thickness sharing and rounding.  |  |
| /$defs/inference&#95;config/properties/room&#95;gap&#95;threshold&#95;m | type: number; description: When the gap between two adjacent rooms exceeds this threshold, the agent classifies it as a potential corridor or open space rather than a wall alignment error.  |  |
| /$defs/inference&#95;config/properties/default&#95;interior&#95;wall&#95;thickness&#95;cm | type: number; description: Fallback wall thickness for interior walls when the semantic room data does not specify walls.X.thickness&#95;cm. Used in R05.  |  |
| /$defs/inference&#95;config/properties/default&#95;exterior&#95;wall&#95;thickness&#95;cm | type: number; description: Fallback wall thickness for exterior walls when the semantic room data does not specify walls.X.thickness&#95;cm. Typically includes structure + insulation. Used in R05.  |  |
| /$defs/inference&#95;config/properties/default&#95;slab&#95;thickness&#95;cm | type: number; description: Fallback slab thickness when floor data does not specify slab&#95;thickness&#95;cm. Used in R02 (floor slab generation).  |  |
| /$defs/inference&#95;config/properties/default&#95;roof&#95;overhang&#95;cm | type: number; description: Default eave overhang distance beyond the building footprint when not specified on individual wing.roof&#95;overhang&#95;cm. Used in R07 (roof plane generation).  |  |
| /$defs/inference&#95;config/properties/default&#95;ceiling&#95;height&#95;m | type: number; description: Fallback ceiling height when floor.ceiling&#95;height&#95;m and room.ceiling&#95;height&#95;cm are both absent. Used in R04 and R05 for wall height computation.  |  |
| /$defs/inference&#95;config/properties/default&#95;ceiling&#95;height&#95;cm | type: number; description: Fallback ceiling height in centimeters used for inference.  |  |
| /$defs/validation&#95;config | type: object; additionalProperties: false; description: Thresholds used during post-inference validation (V01–V05) to determine acceptable geometric tolerances.  |  |
| /$defs/validation&#95;config/properties/slab&#95;area&#95;tolerance&#95;percent | type: number; description: Maximum percentage by which a slab outline area may differ from the building footprint area. Used in V03 (slab coverage).  |  |
| /$defs/validation&#95;config/properties/roof&#95;coverage&#95;tolerance&#95;percent | type: number; description: Maximum percentage by which the sum of projected roof plane areas may exceed the building footprint area. Allows for overhangs. Used in V04 (roof coverage).  |  |
| /$defs/validation&#95;config/properties/coplanarity&#95;tolerance&#95;cm | type: number; description: Maximum distance a roof plane vertex may deviate from the ideal geometric plane before a warning is raised.  |  |
| /$defs/validation&#95;config/properties/wall&#95;coverage&#95;tolerance&#95;percent | type: number; description: Maximum percentage of building perimeter that may lack wall segments before a warning is raised. Used in V01 (wall coverage check).  |  |
| /$defs/validation&#95;config/properties/opening&#95;fit&#95;tolerance&#95;cm | type: number; description: Maximum distance an opening may overshoot a wall segment edge before being flagged as an error. Accounts for reveal depth and measurement imprecision. Used in V02.  |  |
| /$defs/validation&#95;config/properties/wall&#95;thickness&#95;tolerance&#95;cm | type: number; description: Maximum acceptable difference between a semantic wall thickness (room.walls.X.thickness&#95;cm) and the generated WSG thickness&#95;cm. Accounts for rounding during shared-wall merging.  |  |
| /$defs/validation&#95;config/properties/opening&#95;width&#95;tolerance&#95;cm | type: number; description: Maximum acceptable difference between a semantic opening width and the generated wall&#95;opening width&#95;cm.  |  |
| /$defs/validation&#95;config/properties/head&#95;height&#95;tolerance&#95;cm | type: number; description: Maximum acceptable deviation when checking sill&#95;height&#95;cm + height&#95;cm ≈ head&#95;height&#95;cm on wall openings.  |  |
| /$defs/validation&#95;config/properties/elevation&#95;tolerance&#95;m | type: number; description: Maximum acceptable difference between computed and declared floor elevations. Used for floor stacking consistency.  |  |
| /$defs/rendering&#95;config | type: object; additionalProperties: false; description: Preferences for visualization consumers. These do not affect inference or validation - they guide how renderers display the model and construction data.  |  |
| /$defs/rendering&#95;config/properties/default&#95;lod | type: string; enum: &#91;"auto","lod0","lod1","lod2"&#93;; description: Default LOD for 3D rendering. "auto" selects the highest LOD achievable from available data (shell-only → LOD1, with walls/ roofs → LOD2).  |  |
| /$defs/rendering&#95;config/properties/show&#95;construction&#95;layer | type: boolean; description: Whether to render construction geometry (wall segments, roof planes) in 2D/3D views. When false, only semantic data is shown.  |  |
| /$defs/rendering&#95;config/properties/show&#95;neighbor&#95;massing | type: boolean; description: Whether to render neighbor properties as massing blocks in 3D views. Requires neighbor&#95;property.footprint and building&#95;height&#95;m.  |  |
| /$defs/rendering&#95;config/properties/neighbor&#95;massing&#95;color | type: string; pattern: ^#&#91;0-9A-Fa-f&#93;{6}$; description: CSS color for neighbor massing blocks in 3D views. |  |

## realm.schema.yaml

Realm Schema

| JSON Pointer | Type / constraints | Reference |
|---|---|---|
| / | type: object; required: &#91;"version","name"&#93;; additionalProperties: false; description: Root schema for a Realm model - validates the realm.yaml metadata file. Each plane's data files are validated independently against their own schema (estate, boundary, spatial, systems, network, vegetation, biomass, maintenance, compliance, surroundings). Cross-cutting: estate changes against estate-change.schema.yaml, risks and issues against risks.schema.yaml.  |  |
| /properties | description: {"type":"string","title":"Description","description":"Brief overview of the estate."} |  |
| /properties/version | description: Semantic version of this realm model instance. | metamodel.schema.yaml#/$defs/semver |
| /properties/schemaVersion | description: Version of the Realm schema this model conforms to. | metamodel.schema.yaml#/$defs/schema&#95;version |
| /properties/name | type: string; description: Human-readable name for this estate. |  |
| /properties/description | type: string; description: Brief overview of the estate. |  |
| /properties/location | description: Geographic address and coordinates. | metamodel.schema.yaml#/$defs/location |
| /properties/climate | description: Climate metadata for garden planning and seasonal scheduling. | metamodel.schema.yaml#/$defs/climate&#95;profile |
| /properties/coordinate&#95;system | description: Coordinate system orientation for the entire realm model. Documents how the model's 2D/3D grid relates to true geographic north and the vertical datum. Authoritative definition also in topology/spatial.yaml; this top-level copy gives immediate visibility when inspecting the root realm file.  | metamodel.schema.yaml#/$defs/coordinate&#95;system |
| /properties/tags |  | metamodel.schema.yaml#/$defs/tags |

## risks.schema.yaml

Realm Risk &amp; Issues Register

| JSON Pointer | Type / constraints | Reference |
|---|---|---|
| / | type: object; additionalProperties: false; description: Cross-cutting risk and issue tracking. Risks are potential adverse events with mitigation plans; issues are identified current problems with existing measures. Both reference entities across all planes (REG, MT, WRT, SYS, NP, SC, OZ, etc.). Not part of any plane - governance overlay.  |  |
| /properties/risks | type: array; description: Potential adverse events with mitigation plans. Risks reference entities (REG, MT, WRT, SYS, NP, SC, ECH, etc.) they relate to.  |  |
| /properties/risks/items |  | #/$defs/risk |
| /properties/issues | type: array; description: Identified current problems or concerns. Unlike risks, issues describe existing conditions (e.g. noise, privacy, operational friction) with current&#95;measures rather than mitigation plans.  |  |
| /properties/issues/items |  | #/$defs/issue |
| /$defs/risk | type: object; required: &#91;"id","name","category","severity","status"&#93;; additionalProperties: false; description: A potential adverse event with negative consequences. Has a mitigation plan (what to do to reduce or avoid the risk). References entities across all planes that the risk relates to.  |  |
| /$defs/risk/properties | description: {"type":"string","title":"Description","description":"Detailed description of the risk and its consequences."} |  |
| /$defs/risk/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?RSK&#92;d{3,}$ |  |
| /$defs/risk/properties/name | type: string |  |
| /$defs/risk/properties/category | type: string; enum: &#91;"compliance","safety","privacy","structural","financial","operational"&#93;; description: Domain of the risk. |  |
| /$defs/risk/properties/severity | type: string; enum: &#91;"critical","high","moderate","low"&#93;; description: Impact level if the risk materializes. |  |
| /$defs/risk/properties/status | type: string; enum: &#91;"open","mitigated","monitoring","resolved","accepted"&#93;; description: Current handling state. |  |
| /$defs/risk/properties/entity&#95;refs | type: array; description: IDs of entities this risk relates to (REG, MT, WRT, SYS, NP, SC, ECH, etc.). |  |
| /$defs/risk/properties/entity&#95;refs/items |  | metamodel.schema.yaml#/$defs/any&#95;entity&#95;ref |
| /$defs/risk/properties/design&#95;parameters | type: array; description: Quantitative design parameters from risk analysis: load capacities, safety factors, material thresholds. Machine-queryable engineering data.  |  |
| /$defs/risk/properties/design&#95;parameters/items | type: object; required: &#91;"parameter","value"&#93;; additionalProperties: false |  |
| /$defs/risk/properties/design&#95;parameters/items/properties/parameter | type: string; description: Name of the design parameter. |  |
| /$defs/risk/properties/design&#95;parameters/items/properties/value | type: string |  |
| /$defs/risk/properties/design&#95;parameters/items/properties/unit | type: string; description: Unit of measurement (omit for dimensionless). |  |
| /$defs/risk/properties/design&#95;parameters/items/properties/context | type: string; description: Where or when this parameter applies. |  |
| /$defs/risk/properties/description | type: string; description: Detailed description of the risk and its consequences. |  |
| /$defs/risk/properties/mitigation | type: string; description: Plan or actions to reduce or avoid the risk. |  |
| /$defs/risk/properties/tags |  | metamodel.schema.yaml#/$defs/tags |
| /$defs/issue | type: object; required: &#91;"id","name","category","severity","status"&#93;; additionalProperties: false; description: An identified current problem or concern (e.g. noise, privacy, operational friction). Unlike risks, issues describe existing conditions. Uses current&#95;measures for what is already being done.  |  |
| /$defs/issue/properties | description: {"type":"string","title":"Description","description":"Detailed description of the issue."} |  |
| /$defs/issue/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?ISS&#92;d{3,}$ |  |
| /$defs/issue/properties/name | type: string |  |
| /$defs/issue/properties/category | type: string; enum: &#91;"compliance","safety","privacy","structural","financial","operational"&#93;; description: Domain of the issue. |  |
| /$defs/issue/properties/severity | type: string; enum: &#91;"critical","high","moderate","low"&#93;; description: Impact level of the issue. |  |
| /$defs/issue/properties/status | type: string; enum: &#91;"open","mitigated","monitoring","resolved","accepted"&#93;; description: Current handling state. |  |
| /$defs/issue/properties/entity&#95;refs | type: array; description: IDs of entities this issue relates to (NP, SC, OZ, RM, BS, PTG, etc.). |  |
| /$defs/issue/properties/entity&#95;refs/items |  | metamodel.schema.yaml#/$defs/any&#95;entity&#95;ref |
| /$defs/issue/properties/description | type: string; description: Detailed description of the issue. |  |
| /$defs/issue/properties/current&#95;measures | type: string; description: What is already being done to address the issue (hedge, screening, acceptance). |  |
| /$defs/issue/properties/tags |  | metamodel.schema.yaml#/$defs/tags |

## topology/boundary.schema.yaml

Property Boundaries

| JSON Pointer | Type / constraints | Reference |
|---|---|---|
| / | type: object; additionalProperties: false; description: Property boundary segments: fences, walls, hedges, and natural boundaries. Each segment describes physical construction, condition, screening properties, and neighbor associations. Topology plane.  |  |
| /properties/boundary&#95;segments | type: array; description: Property perimeter segments. Answers CQ18, CQ20. |  |
| /properties/boundary&#95;segments/items |  | #/$defs/boundary&#95;segment |
| /$defs/fence&#95;post | type: object; required: &#91;"seq","type","position"&#93;; additionalProperties: false; description: An individual fence post with measured position, type classification, and optional annotation. Posts are sequentially numbered along the boundary segment. Used by 2D/3D renderers for post visualization and by estate change planning for reinforcement tracking.  |  |
| /$defs/fence&#95;post/properties | type: {"type":"string","title":"Post Type","description":"Classification: end (corner/terminal), intermediate (standard), reinforced (strengthened, e.g. diagonal bracing + concrete footing).&#92;n","enum":&#91;"end","intermediate","reinforced"&#93;}; description: {"type":"string","title":"Post Description","description":"Per-post annotation for reinforcement notes, estate change context, inspection observations, or structural details (e.g. &#92;"ECH009a: diagonale + dobetonowanie&#92;").&#92;n"} |  |
| /$defs/fence&#95;post/properties/seq | type: integer; description: 1-based sequential post number along this boundary segment. |  |
| /$defs/fence&#95;post/properties/type | type: string; enum: &#91;"end","intermediate","reinforced"&#93;; description: Classification: end (corner/terminal), intermediate (standard), reinforced (strengthened, e.g. diagonal bracing + concrete footing).  |  |
| /$defs/fence&#95;post/properties/position | description: Absolute position in property coordinate system (meters). | ../metamodel.schema.yaml#/$defs/position |
| /$defs/fence&#95;post/properties/cumulative&#95;m | type: number; description: Distance from the first post along the boundary line. |  |
| /$defs/fence&#95;post/properties/span&#95;cm | description: Center-to-center distance from the previous post. Null for the first post. |  |
| /$defs/fence&#95;post/properties/span&#95;cm/oneOf/0 | type: number |  |
| /$defs/fence&#95;post/properties/span&#95;cm/oneOf/1 | type: null |  |
| /$defs/fence&#95;post/properties/above&#95;ground&#95;cm | type: number; description: Per-post override for above-ground height. When omitted, the boundary-level post&#95;construction.above&#95;ground&#95;cm applies. Use when individual posts differ (e.g. extended posts for a higher fence section).  |  |
| /$defs/fence&#95;post/properties/description | type: string; description: Per-post annotation for reinforcement notes, estate change context, inspection observations, or structural details (e.g. "ECH009a: diagonale + dobetonowanie").  |  |
| /$defs/boundary&#95;segment | type: object; required: &#91;"id","name","boundary&#95;type"&#93;; additionalProperties: false; description: A continuous section of property boundary with uniform construction. A property's full perimeter is composed of multiple segments. Answers CQ18 (type and condition) and CQ20 (privacy screening). Used by T4, T5.  |  |
| /$defs/boundary&#95;segment/patternProperties/^x- | description: Custom extension properties for domain-specific detail that the base schema does not cover (e.g. x-fence for detailed post/span measurements, x-gate for gate automation specs). Follows the OpenAPI x- extension convention. Values may be any valid YAML.  |  |
| /$defs/boundary&#95;segment/properties | description: {"type":"string"} |  |
| /$defs/boundary&#95;segment/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?BS&#92;d{3,}$ |  |
| /$defs/boundary&#95;segment/properties/name | type: string |  |
| /$defs/boundary&#95;segment/properties/boundary&#95;type | type: string; enum: &#91;"fence-wood","fence-metal","fence-chain-link","fence-vinyl","wall-brick","wall-stone","wall-concrete","hedge-evergreen","hedge-deciduous","hedge-mixed","natural-treeline","natural-waterway","natural-slope","none"&#93;; description: Physical construction type of this boundary segment. |  |
| /$defs/boundary&#95;segment/properties/direction | description: Which side of the property this segment faces. | ../metamodel.schema.yaml#/$defs/compass&#95;direction |
| /$defs/boundary&#95;segment/properties/height&#95;m | type: number; description: Current height of the boundary element. |  |
| /$defs/boundary&#95;segment/properties/length&#95;m | type: number; description: Length of this boundary segment. |  |
| /$defs/boundary&#95;segment/properties/condition | type: string; enum: &#91;"excellent","good","fair","poor","needs-replacement"&#93;; description: Current physical condition. Used by T4 for replacement planning. |  |
| /$defs/boundary&#95;segment/properties/installed&#95;year | type: integer |  |
| /$defs/boundary&#95;segment/properties/screening&#95;opacity | type: string; enum: &#91;"solid","semi-transparent","transparent","none"&#93;; description: Visual screening level. Answers CQ20 (privacy screening adequacy). Used by T4 to identify privacy gaps.  |  |
| /$defs/boundary&#95;segment/properties/year&#95;round&#95;screening | type: boolean; description: True if screening is effective all year (evergreen hedge, solid fence). False for deciduous hedges. |  |
| /$defs/boundary&#95;segment/properties/mature&#95;height&#95;m | type: number; description: Expected height at maturity (for hedges and natural boundaries). |  |
| /$defs/boundary&#95;segment/properties/post&#95;construction | type: object; additionalProperties: false; description: Fence post specifications. Answers CQ27. |  |
| /$defs/boundary&#95;segment/properties/post&#95;construction/properties/diameter&#95;mm | type: number |  |
| /$defs/boundary&#95;segment/properties/post&#95;construction/properties/wall&#95;thickness&#95;mm | type: number |  |
| /$defs/boundary&#95;segment/properties/post&#95;construction/properties/coating | type: string; enum: &#91;"pvc","galvanized","powder-coated","painted","none"&#93; |  |
| /$defs/boundary&#95;segment/properties/post&#95;construction/properties/total&#95;height&#95;cm | type: number; description: Full post length including buried section. |  |
| /$defs/boundary&#95;segment/properties/post&#95;construction/properties/above&#95;ground&#95;cm | type: number |  |
| /$defs/boundary&#95;segment/properties/post&#95;construction/properties/below&#95;ground&#95;cm | type: number |  |
| /$defs/boundary&#95;segment/properties/post&#95;construction/properties/spacing&#95;m | type: number; description: Distance between posts. |  |
| /$defs/boundary&#95;segment/properties/post&#95;construction/properties/footing&#95;diameter&#95;cm | type: number |  |
| /$defs/boundary&#95;segment/properties/post&#95;construction/properties/footing&#95;depth&#95;cm | type: number |  |
| /$defs/boundary&#95;segment/properties/post&#95;construction/properties/post&#95;count | type: integer |  |
| /$defs/boundary&#95;segment/properties/mesh&#95;or&#95;infill | type: object; additionalProperties: false; description: Mesh, wire, or panel infill between posts. Answers CQ27. |  |
| /$defs/boundary&#95;segment/properties/mesh&#95;or&#95;infill/properties/material | type: string; enum: &#91;"chain-link","welded-mesh","wood-panel","metal-panel","vinyl-panel","glass","polycarbonate","woven-wire","privacy-mesh","none"&#93; |  |
| /$defs/boundary&#95;segment/properties/mesh&#95;or&#95;infill/properties/wire&#95;gauge&#95;mm | type: number |  |
| /$defs/boundary&#95;segment/properties/mesh&#95;or&#95;infill/properties/mesh&#95;height&#95;cm | type: number |  |
| /$defs/boundary&#95;segment/properties/mesh&#95;or&#95;infill/properties/density&#95;gsm | type: number; description: For privacy mesh or shade cloth. |  |
| /$defs/boundary&#95;segment/properties/mesh&#95;or&#95;infill/properties/opacity&#95;percent | type: number |  |
| /$defs/boundary&#95;segment/properties/posts | type: array; description: Individual fence posts with measured positions, types, and annotations. Used by 2D/3D renderers and estate change planning. Each post is a measured physical entity along this boundary segment.  |  |
| /$defs/boundary&#95;segment/properties/posts/items |  | #/$defs/fence&#95;post |
| /$defs/boundary&#95;segment/properties/screening&#95;planting&#95;refs | type: array; description: Plantings providing visual screening along this boundary. Used by T4. |  |
| /$defs/boundary&#95;segment/properties/screening&#95;planting&#95;refs/items |  | ../metamodel.schema.yaml#/$defs/planting&#95;ref |
| /$defs/boundary&#95;segment/properties/parcel&#95;refs | type: array; description: Land parcels this boundary segment borders. A segment on the boundary between two parcels lists both. Used by renderers to assign boundaries to per-parcel site plans.  |  |
| /$defs/boundary&#95;segment/properties/parcel&#95;refs/items |  | ../metamodel.schema.yaml#/$defs/parcel&#95;ref |
| /$defs/boundary&#95;segment/properties/position&#95;start | description: Start point of this segment on the property grid. Deprecated in v1.5 - use vertices&#91;&#93; instead. | ../metamodel.schema.yaml#/$defs/position |
| /$defs/boundary&#95;segment/properties/position&#95;end | description: End point of this segment on the property grid. Deprecated in v1.5 - use vertices&#91;&#93; instead. | ../metamodel.schema.yaml#/$defs/position |
| /$defs/boundary&#95;segment/properties/vertices | type: array; description: Polyline in model coordinates (meters). Ordered list of points defining this boundary segment's geometry. Supports multi-point segments (e.g., boundaries with bends). Supersedes position&#95;start and position&#95;end.  |  |
| /$defs/boundary&#95;segment/properties/vertices/items |  | ../metamodel.schema.yaml#/$defs/position |
| /$defs/boundary&#95;segment/properties/neighbor&#95;property&#95;ref | description: Neighbor property on the other side of this boundary. | ../metamodel.schema.yaml#/$defs/neighbor&#95;property&#95;ref |
| /$defs/boundary&#95;segment/properties/shared&#95;ownership | type: boolean; description: Whether this boundary is jointly owned/maintained with the neighbor. |  |
| /$defs/boundary&#95;segment/properties/base&#95;elevation&#95;m | type: number; description: Ground elevation at the base of this boundary above vertical datum. Default 0. Non-zero for fences on retaining walls or slopes.  |  |
| /$defs/boundary&#95;segment/properties/shared&#95;edges | type: array; description: Edges of this element's outline that lie on another element's edge and follow it when it moves. Declare an edge here when its coordinates were set to meet a neighbour rather than measured; tools move a declared edge and never a merely coincident one.  |  |
| /$defs/boundary&#95;segment/properties/shared&#95;edges/items |  | ../metamodel.schema.yaml#/$defs/shared&#95;edge |
| /$defs/boundary&#95;segment/properties/description | type: string |  |
| /$defs/boundary&#95;segment/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |

## topology/construction.schema.yaml

Construction Geometry

| JSON Pointer | Type / constraints | Reference |
|---|---|---|
| / | type: object; required: &#91;"generated&#95;from"&#93;; additionalProperties: false; description: AI-agent-generated construction geometry layer. Defines wall segments, floor slabs, roof planes, and building shells as first-class entities with 3D coordinates. Derived from semantic estate descriptions by an AI agent; authoritative for 2D floor plan and 3D rendering. One file per floor (FLR###.yaml) or per simple building (BLD###.yaml).  |  |
| /properties/floor&#95;ref | description: Floor this construction file describes. Required for buildings with formal floor entities. Mutually exclusive with building&#95;ref.  | ../metamodel.schema.yaml#/$defs/floor&#95;ref |
| /properties/building&#95;ref | description: Building this construction file describes. Used only for simple buildings without formal floor entities (sheds, gazebos). Mutually exclusive with floor&#95;ref.  | ../metamodel.schema.yaml#/$defs/building&#95;ref |
| /properties/generated&#95;from |  | #/$defs/provenance |
| /properties/wall&#95;segments | type: array; description: Wall segments for this floor. Optional for open structures (carports, pergolas) that have no walls.  |  |
| /properties/wall&#95;segments/items |  | #/$defs/wall&#95;segment |
| /properties/floor&#95;slab | description: The structural slab for this floor level. | #/$defs/floor&#95;slab |
| /properties/ceiling&#95;slab | description: The ceiling/upper slab for this floor. May be the same as the next floor's floor&#95;slab. Omit for top floor (roof takes over).  | #/$defs/floor&#95;slab |
| /properties/roof&#95;planes | type: array; description: Roof planes for this floor. Only present on the topmost floor file (or on BLD-level files for flat-roof buildings).  |  |
| /properties/roof&#95;planes/items |  | #/$defs/roof&#95;plane |
| /properties/building&#95;shell | description: Simplified building envelope for LOD0/LOD1 rendering. | #/$defs/building&#95;shell |
| /$defs/provenance | type: object; required: &#91;"semantic&#95;source&#95;refs","schema&#95;version","generated&#95;at"&#93;; additionalProperties: false; description: Tracks how this construction geometry was generated. |  |
| /$defs/provenance/properties/semantic&#95;source&#95;refs | type: array; description: Semantic YAML files used as input for generation. |  |
| /$defs/provenance/properties/semantic&#95;source&#95;refs/items | type: string |  |
| /$defs/provenance/properties/schema&#95;version | type: string |  |
| /$defs/provenance/properties/generated&#95;at | type: string |  |
| /$defs/provenance/properties/generator | type: string; description: Tool or agent that produced this file. |  |
| /$defs/provenance/properties/human&#95;edited | type: boolean; description: True if a human has modified the generated output. |  |
| /$defs/provenance/properties/inference&#95;log | type: object; additionalProperties: true; description: Statistics from the AI agent's generation run. |  |
| /$defs/provenance/properties/inference&#95;log/properties/rooms&#95;processed | type: integer |  |
| /$defs/provenance/properties/inference&#95;log/properties/walls&#95;generated | type: integer |  |
| /$defs/provenance/properties/inference&#95;log/properties/walls&#95;merged | type: integer |  |
| /$defs/provenance/properties/inference&#95;log/properties/openings&#95;mapped | type: integer |  |
| /$defs/provenance/properties/inference&#95;log/properties/warnings | type: array |  |
| /$defs/provenance/properties/inference&#95;log/properties/warnings/items | type: string |  |
| /$defs/wall&#95;segment | type: object; required: &#91;"id","start","end","thickness&#95;cm","is&#95;exterior"&#93;; additionalProperties: false; description: A continuous section of wall with uniform thickness and material. Defined by start and end points in model coordinates (meters). References the rooms/zones on each side. Carries opening cutout positions. Generated from room walls{N,E,S,W} descriptions.  |  |
| /$defs/wall&#95;segment/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?WSG&#92;d{3,}$ |  |
| /$defs/wall&#95;segment/properties/start | description: Start of the wall centerline in model coordinates (meters). | ../metamodel.schema.yaml#/$defs/position |
| /$defs/wall&#95;segment/properties/end | description: End of the wall centerline in model coordinates (meters). | ../metamodel.schema.yaml#/$defs/position |
| /$defs/wall&#95;segment/properties/base&#95;elevation&#95;m | type: number; description: Bottom of the wall above vertical datum. |  |
| /$defs/wall&#95;segment/properties/height&#95;m | type: number; description: Floor-to-ceiling height of this wall segment. |  |
| /$defs/wall&#95;segment/properties/thickness&#95;cm | type: number |  |
| /$defs/wall&#95;segment/properties/gable&#95;peak&#95;elevation&#95;m | type: number; description: Elevation of the gable peak for triangular wall tops. |  |
| /$defs/wall&#95;segment/properties/is&#95;exterior | type: boolean; description: True if this wall faces outside the building envelope. |  |
| /$defs/wall&#95;segment/properties/wall&#95;type | type: string; enum: &#91;"exterior","interior-load-bearing","interior-partition"&#93; |  |
| /$defs/wall&#95;segment/properties/material | type: string |  |
| /$defs/wall&#95;segment/properties/left&#95;space&#95;ref | description: Room or outdoor zone on the left side of the wall (when looking from start to end).  | ../metamodel.schema.yaml#/$defs/room&#95;or&#95;zone&#95;ref |
| /$defs/wall&#95;segment/properties/right&#95;space&#95;ref | description: Room or outdoor zone on the right side. | ../metamodel.schema.yaml#/$defs/room&#95;or&#95;zone&#95;ref |
| /$defs/wall&#95;segment/properties/floor&#95;ref | description: Floor this wall segment belongs to. | ../metamodel.schema.yaml#/$defs/floor&#95;ref |
| /$defs/wall&#95;segment/properties/openings | type: array; description: Windows and doors placed on this wall segment. |  |
| /$defs/wall&#95;segment/properties/openings/items |  | #/$defs/wall&#95;opening |
| /$defs/wall&#95;segment/properties/wing&#95;ref | description: Structural wing this wall segment belongs to. | ../metamodel.schema.yaml#/$defs/wing&#95;ref |
| /$defs/wall&#95;segment/properties/derived&#95;from | type: string; description: Which semantic wall this was derived from (e.g., 'RM001.walls.E'). |  |
| /$defs/wall&#95;segment/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |
| /$defs/wall&#95;opening | type: object; required: &#91;"opening&#95;type","offset&#95;from&#95;start&#95;cm","width&#95;cm","height&#95;cm"&#93;; additionalProperties: false; description: A window, door, or other opening placed on a wall segment. Position is measured along the wall from start point.  |  |
| /$defs/wall&#95;opening/properties/opening&#95;type | type: string; enum: &#91;"window","door","terrace-door","french-door","sliding-door","skylight","garage-door"&#93; |  |
| /$defs/wall&#95;opening/properties/offset&#95;from&#95;start&#95;cm | type: number; description: Distance from wall segment start to the opening's near edge. |  |
| /$defs/wall&#95;opening/properties/width&#95;cm | type: number |  |
| /$defs/wall&#95;opening/properties/height&#95;cm | type: number |  |
| /$defs/wall&#95;opening/properties/sill&#95;height&#95;cm | type: number |  |
| /$defs/wall&#95;opening/properties/head&#95;height&#95;cm | type: number |  |
| /$defs/wall&#95;opening/properties/depth&#95;cm | type: number |  |
| /$defs/wall&#95;opening/properties/swing&#95;direction | type: string; enum: &#91;"left","right"&#93; |  |
| /$defs/wall&#95;opening/properties/opens&#95;inward | type: boolean |  |
| /$defs/wall&#95;opening/properties/glazing | type: string; enum: &#91;"single","double","triple"&#93; |  |
| /$defs/wall&#95;opening/properties/connects&#95;to&#95;ref | description: Room or zone on the other side of this opening; null if it connects to the exterior. |  |
| /$defs/wall&#95;opening/properties/connects&#95;to&#95;ref/anyOf/0 |  | ../metamodel.schema.yaml#/$defs/room&#95;or&#95;zone&#95;ref |
| /$defs/wall&#95;opening/properties/connects&#95;to&#95;ref/anyOf/1 | type: null |  |
| /$defs/wall&#95;opening/properties/source&#95;room&#95;ref | description: Room whose semantic opening definition this was derived from. | ../metamodel.schema.yaml#/$defs/room&#95;ref |
| /$defs/floor&#95;slab | type: object; required: &#91;"id","floor&#95;ref","outline","elevation&#95;m","thickness&#95;cm"&#93;; additionalProperties: false; description: A horizontal structural element (floor or ceiling slab). Defined by a polygon outline at a specific elevation. Used for 3D floor/ceiling rendering and room volume computation.  |  |
| /$defs/floor&#95;slab/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?SLB&#92;d{3,}$ |  |
| /$defs/floor&#95;slab/properties/floor&#95;ref | description: Floor this slab belongs to. | ../metamodel.schema.yaml#/$defs/floor&#95;ref |
| /$defs/floor&#95;slab/properties/outline | description: Plan-view polygon of this slab in model coordinates. | ../metamodel.schema.yaml#/$defs/polygon&#95;footprint |
| /$defs/floor&#95;slab/properties/elevation&#95;m | type: number; description: Elevation of the finished floor surface above vertical datum. |  |
| /$defs/floor&#95;slab/properties/thickness&#95;cm | type: number |  |
| /$defs/floor&#95;slab/properties/slab&#95;type | type: string; enum: &#91;"ground-floor","intermediate","roof-slab","basement"&#93; |  |
| /$defs/floor&#95;slab/properties/material | type: string |  |
| /$defs/floor&#95;slab/properties/derived&#95;from | type: string |  |
| /$defs/floor&#95;slab/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |
| /$defs/roof&#95;plane | type: object; required: &#91;"id","building&#95;ref","vertices&#95;3d","surface&#95;type"&#93;; additionalProperties: false; description: A planar surface of the roof. A gable roof has 2 planes; a hip roof has 4. Each plane is a 3D polygon defining the visible roof surface. Generated from building roof metadata (type, pitch, ridge&#95;direction).  |  |
| /$defs/roof&#95;plane/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?RFP&#92;d{3,}$ |  |
| /$defs/roof&#95;plane/properties/building&#95;ref | description: Building this roof plane covers. | ../metamodel.schema.yaml#/$defs/building&#95;ref |
| /$defs/roof&#95;plane/properties/wing&#95;ref | description: Wing this roof plane covers. Required when building has wings. | ../metamodel.schema.yaml#/$defs/wing&#95;ref |
| /$defs/roof&#95;plane/properties/vertices&#95;3d | type: array; description: Ordered vertices of this roof plane in model coordinates with elevation. CCW winding viewed from above.  |  |
| /$defs/roof&#95;plane/properties/vertices&#95;3d/items |  | ../metamodel.schema.yaml#/$defs/position3d |
| /$defs/roof&#95;plane/properties/surface&#95;type | type: string; enum: &#91;"slope","ridge-cap","flat","dormer-slope","dormer-face"&#93; |  |
| /$defs/roof&#95;plane/properties/pitch&#95;degrees | type: number |  |
| /$defs/roof&#95;plane/properties/facing&#95;direction | description: Compass direction the slope faces (down-slope direction). | ../metamodel.schema.yaml#/$defs/compass&#95;direction |
| /$defs/roof&#95;plane/properties/material | type: string |  |
| /$defs/roof&#95;plane/properties/overhang&#95;cm | type: number |  |
| /$defs/roof&#95;plane/properties/has&#95;pv&#95;panels | type: boolean; description: Whether photovoltaic panels are mounted on this plane. |  |
| /$defs/roof&#95;plane/properties/derived&#95;from | type: string |  |
| /$defs/roof&#95;plane/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |
| /$defs/building&#95;shell | type: object; required: &#91;"footprint&#95;absolute"&#93;; additionalProperties: false; description: Simplified building envelope for LOD0 (footprint) and LOD1 (extruded block) rendering. Pre-computed from footprint + heights for fast 3D.  |  |
| /$defs/building&#95;shell/properties/footprint&#95;absolute | description: Building footprint in model coordinates (rotation applied). | ../metamodel.schema.yaml#/$defs/polygon&#95;footprint |
| /$defs/building&#95;shell/properties/ground&#95;elevation&#95;m | type: number |  |
| /$defs/building&#95;shell/properties/eave&#95;elevation&#95;m | type: number |  |
| /$defs/building&#95;shell/properties/ridge&#95;elevation&#95;m | type: number |  |

## topology/equipment.schema.yaml

Room Equipment &amp; Furniture

| JSON Pointer | Type / constraints | Reference |
|---|---|---|
| / | type: object; additionalProperties: false; description: Movable and installed items within rooms: furniture pieces and equipment/appliances. Each item is a first-class entity with typed ID, room placement, and optional link to infrastructure systems. Topology plane.  |  |
| /properties/furnitures | type: array; description: Furniture pieces placed in rooms. Answers CQ24. |  |
| /properties/furnitures/items |  | #/$defs/furniture |
| /properties/equipments | type: array; description: Equipment and appliances installed in rooms. Answers CQ25. |  |
| /properties/equipments/items |  | #/$defs/equipment |
| /$defs/furniture | type: object; required: &#91;"id","name","furniture&#95;type"&#93;; additionalProperties: false; description: A furniture piece placed in a room or building (shed, gazebo): sofa, table, wardrobe, desk, bed, shelf unit, planter, outdoor storage, etc. Tracks placement (room + wall or building) and dimensions. Answers CQ24. Used by T2 (inventory) and T5 (layout rendering).  |  |
| /$defs/furniture/oneOf/0 | required: &#91;"room&#95;ref"&#93; |  |
| /$defs/furniture/oneOf/1 | required: &#91;"building&#95;ref"&#93; |  |
| /$defs/furniture/oneOf/2 | required: &#91;"outdoor&#95;zone&#95;ref"&#93; |  |
| /$defs/furniture/properties | description: {"type":"string"} |  |
| /$defs/furniture/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?FRN&#92;d{3,}$ |  |
| /$defs/furniture/properties/name | type: string |  |
| /$defs/furniture/properties/furniture&#95;type | type: string; enum: &#91;"sofa","armchair","table","desk","chair","bed","wardrobe","shelf","cabinet","dresser","bench","mirror","rug","curtain","shoe-rack","coat-rack","tv-stand","kitchen-island","bar","planter","outdoor-storage","outdoor-seating","outdoor-shade","other"&#93;; description: Primary classification of this furniture piece. |  |
| /$defs/furniture/properties/room&#95;ref | description: Room this furniture is placed in. Required if neither building&#95;ref nor outdoor&#95;zone&#95;ref is set. | ../metamodel.schema.yaml#/$defs/room&#95;ref |
| /$defs/furniture/properties/building&#95;ref | description: Building (shed, gazebo) this furniture is placed in. Use when the item is in a structure without formal rooms. Mutually exclusive with room&#95;ref.  | ../metamodel.schema.yaml#/$defs/building&#95;ref |
| /$defs/furniture/properties/outdoor&#95;zone&#95;ref | description: Outdoor zone this furniture stands in, for a piece that belongs to no building and no room: a table in a forest clearing, a bench on a lawn. A terrace or patio modelled as a room keeps using room&#95;ref. Mutually exclusive with room&#95;ref and building&#95;ref.  | ../metamodel.schema.yaml#/$defs/outdoor&#95;zone&#95;ref |
| /$defs/furniture/properties/wall | description: Wall or side of the room where this furniture is positioned. | ../metamodel.schema.yaml#/$defs/compass&#95;direction |
| /$defs/furniture/properties/width&#95;cm | type: number |  |
| /$defs/furniture/properties/depth&#95;cm | type: number |  |
| /$defs/furniture/properties/height&#95;cm | type: number |  |
| /$defs/furniture/properties/brand | type: string |  |
| /$defs/furniture/properties/model | type: string |  |
| /$defs/furniture/properties/position | description: Position for 2D rendering, in model coordinates like every other position; for a piece in an outdoor zone, where it stands on the estate. | ../metamodel.schema.yaml#/$defs/position |
| /$defs/furniture/properties/description | type: string |  |
| /$defs/furniture/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |
| /$defs/equipment | type: object; required: &#91;"id","name","equipment&#95;type"&#93;; additionalProperties: false; description: An appliance or piece of equipment installed in a room or building (shed, gazebo): kitchen appliances, washing machines, grill, outdoor heater, etc. Can optionally link to an infrastructure system. Answers CQ25. Used by T2 (inventory).  |  |
| /$defs/equipment/oneOf/0 | required: &#91;"room&#95;ref"&#93; |  |
| /$defs/equipment/oneOf/1 | required: &#91;"building&#95;ref"&#93; |  |
| /$defs/equipment/oneOf/2 | required: &#91;"boundary&#95;segment&#95;ref"&#93; |  |
| /$defs/equipment/oneOf/3 | required: &#91;"outdoor&#95;zone&#95;ref"&#93; |  |
| /$defs/equipment/properties | description: {"type":"string"} |  |
| /$defs/equipment/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?EQP&#92;d{3,}$ |  |
| /$defs/equipment/properties/name | type: string |  |
| /$defs/equipment/properties/equipment&#95;type | type: string; enum: &#91;"oven","microwave","dishwasher","refrigerator","freezer","induction-hob","gas-hob","range-hood","coffee-machine","washing-machine","dryer","water-filter","water-softener","air-conditioner","dehumidifier","humidifier","vacuum-robot","computer-workstation","audio-system","television","projector","printer","garage-door-opener","intercom","alarm-panel","sink","toilet","bidet","shower","bathtub","grill","outdoor-heater","sliding-gate","swing-gate","pedestrian-gate","gate-motor","gate-remote","snow-guard","alarm-keypad","heat-pump-indoor","heat-pump-outdoor","lawn-mower","multi-tool","scarifier","vacuum-cleaner","wheelbarrow","garden-supplies","power-drill","portable-ac","fire-pit","cooking-accessory","garden-hose","soaker-hose","drip-hose","sprinkler","branch-shredder","lawn-roller","levelling-grid","spreader","garden-cart","satellite-dish","pressure-washer","cable-reel","other"&#93;; description: Primary classification of this equipment. Garden machinery that is pushed or pulled rather than powered (&#96;lawn-roller&#96;, &#96;levelling-grid&#96;, &#96;spreader&#96;, &#96;garden-cart&#96;) is equipment, not a tool. |  |
| /$defs/equipment/properties/room&#95;ref | description: Room this equipment is installed in. Required if building&#95;ref is not set. | ../metamodel.schema.yaml#/$defs/room&#95;ref |
| /$defs/equipment/properties/building&#95;ref | description: Building (shed, gazebo) this equipment is installed in. Use when the item is in a structure without formal rooms. Mutually exclusive with room&#95;ref.  | ../metamodel.schema.yaml#/$defs/building&#95;ref |
| /$defs/equipment/properties/wall | description: Wall or side of the room where this equipment is positioned. | ../metamodel.schema.yaml#/$defs/compass&#95;direction |
| /$defs/equipment/properties/boundary&#95;segment&#95;ref | description: Boundary segment this equipment is installed on (for gates). Mutually exclusive with room&#95;ref and building&#95;ref.  | ../metamodel.schema.yaml#/$defs/boundary&#95;segment&#95;ref |
| /$defs/equipment/properties/outdoor&#95;zone&#95;ref | description: Outdoor zone where this equipment is placed (e.g., garden equipment). Mutually exclusive with room&#95;ref, building&#95;ref, and boundary&#95;segment&#95;ref.  | ../metamodel.schema.yaml#/$defs/outdoor&#95;zone&#95;ref |
| /$defs/equipment/properties/manufacturer | type: string; description: Manufacturer name. |  |
| /$defs/equipment/properties/model&#95;name | type: string; description: Manufacturer model name. |  |
| /$defs/equipment/properties/width&#95;cm | type: number; description: Width of the equipment in centimeters. |  |
| /$defs/equipment/properties/length&#95;cm | type: number; description: Length of the equipment in centimeters. |  |
| /$defs/equipment/properties/brand | type: string |  |
| /$defs/equipment/properties/model | type: string |  |
| /$defs/equipment/properties/power&#95;watts | type: number; description: Nominal power consumption in watts. |  |
| /$defs/equipment/properties/system&#95;ref | description: Infrastructure system this equipment belongs to or feeds into. | ../metamodel.schema.yaml#/$defs/system&#95;ref |
| /$defs/equipment/properties/component&#95;ref | description: Specific infrastructure component this equipment is part of. | ../metamodel.schema.yaml#/$defs/component&#95;ref |
| /$defs/equipment/properties/warranty&#95;ref | description: Warranty covering this equipment. | ../metamodel.schema.yaml#/$defs/warranty&#95;ref |
| /$defs/equipment/properties/installed&#95;date |  | ../metamodel.schema.yaml#/$defs/iso&#95;date |
| /$defs/equipment/properties/specs | description: Key-value technical specs beyond power&#95;watts (capacity, dimensions, etc.). Answers CQ30. | ../metamodel.schema.yaml#/$defs/specs |
| /$defs/equipment/properties/position&#95;accuracy&#95;m |  | ../metamodel.schema.yaml#/$defs/position&#95;accuracy&#95;m |
| /$defs/equipment/properties/position&#95;source |  | ../metamodel.schema.yaml#/$defs/position&#95;source |
| /$defs/equipment/properties/position&#95;derived&#95;from |  | ../metamodel.schema.yaml#/$defs/position&#95;derived&#95;from |
| /$defs/equipment/properties/position | description: Position on the room layout for 2D rendering. | ../metamodel.schema.yaml#/$defs/position |
| /$defs/equipment/properties/description | type: string |  |
| /$defs/equipment/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |

## topology/estate.schema.yaml

Estate Topology

| JSON Pointer | Type / constraints | Reference |
|---|---|---|
| / | type: object; additionalProperties: false; description: Physical containment hierarchy of the estate: land parcels, buildings, floors, rooms, and outdoor zones. Models the spatial structure from land ownership down to individual rooms and garden areas. Topology plane.  |  |
| /properties/parcels | type: array; description: Land parcels comprising this estate. Answers CQ01. |  |
| /properties/parcels/items |  | #/$defs/parcel |
| /properties/buildings | type: array; description: All buildings on the estate. Answers CQ01, CQ02. |  |
| /properties/buildings/items |  | #/$defs/building |
| /properties/wings | type: array; description: Structural sections of buildings. Every building has at least one wing. Simple rectangular buildings have exactly one wing. Complex buildings (L-shaped, T-shaped) are decomposed into multiple wings. Roof geometry lives exclusively on wings.  |  |
| /properties/wings/items |  | #/$defs/wing |
| /properties/floors | type: array; description: All floors across all buildings. Answers CQ02. |  |
| /properties/floors/items |  | #/$defs/floor |
| /properties/rooms | type: array; description: All rooms across all floors. Answers CQ02. |  |
| /properties/rooms/items |  | #/$defs/room |
| /properties/outdoor&#95;zones | type: array; description: All outdoor areas. Answers CQ03. |  |
| /properties/outdoor&#95;zones/items |  | #/$defs/outdoor&#95;zone |
| /$defs/parcel | type: object; required: &#91;"id","name"&#93;; additionalProperties: false; description: A discrete area of land with legal/cadastral identity. An estate may comprise multiple parcels (e.g., main lot + adjacent forest plot). Answers CQ01 (what parcels exist). Used by T2 (inventory) and T5 (layout).  |  |
| /$defs/parcel/properties | description: {"type":"string","title":"Description"} |  |
| /$defs/parcel/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?LP&#92;d{3,}$; description: Unique typed identifier for this land parcel. |  |
| /$defs/parcel/properties/name | type: string; description: Human-readable name for this parcel. |  |
| /$defs/parcel/properties/cadastral&#95;id | type: string; description: Official land registry / cadastral identifier. |  |
| /$defs/parcel/properties/area&#95;sqm | type: number; description: Total area of this parcel in square meters. |  |
| /$defs/parcel/properties/position&#95;accuracy&#95;m |  | ../metamodel.schema.yaml#/$defs/position&#95;accuracy&#95;m |
| /$defs/parcel/properties/position&#95;source |  | ../metamodel.schema.yaml#/$defs/position&#95;source |
| /$defs/parcel/properties/position&#95;derived&#95;from |  | ../metamodel.schema.yaml#/$defs/position&#95;derived&#95;from |
| /$defs/parcel/properties/position | description: Center position of this parcel on the property layout. | ../metamodel.schema.yaml#/$defs/position |
| /$defs/parcel/properties/footprint | description: Polygon outline of the parcel boundary. Used by T5 for rendering. | ../metamodel.schema.yaml#/$defs/polygon&#95;footprint |
| /$defs/parcel/properties/elevation&#95;m | type: number; description: Ground elevation of this parcel above the vertical datum. For flat properties using local-ground datum, typically 0. For sea-level- relative datum, the actual meters above sea level (e.g., 153). Multiple parcels may have different elevations on sloped terrain.  |  |
| /$defs/parcel/properties/vertex&#95;elevations | type: array; description: Per-vertex elevation (m, relative to model vertical datum / origin) for each vertex of &#96;footprint&#96;. Length must equal &#96;footprint.vertices.length&#96;. When present, the 3D viewer renders the parcel as a fan-triangulated tilted surface (centroid + adjacent vertices form coplanar triangles - no GPU bilinear fold). Vertex order matches &#96;footprint.vertices&#96;.  |  |
| /$defs/parcel/properties/vertex&#95;elevations/items | type: number |  |
| /$defs/parcel/properties/shared&#95;edges | type: array; description: Edges of this element's outline that lie on another element's edge and follow it when it moves. Declare an edge here when its coordinates were set to meet a neighbour rather than measured; tools move a declared edge and never a merely coincident one.  |  |
| /$defs/parcel/properties/shared&#95;edges/items |  | ../metamodel.schema.yaml#/$defs/shared&#95;edge |
| /$defs/parcel/properties/description | type: string |  |
| /$defs/parcel/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |
| /$defs/building | type: object; required: &#91;"id","name","building&#95;type","parcel&#95;ref","wing&#95;refs"&#93;; additionalProperties: false; description: A roofed structure on the estate: house, guest house, garage, shed, workshop, greenhouse, or barn. Contains floors and rooms. Answers CQ01 (estate composition) and CQ02 (room inventory). Used by T2, T5.  |  |
| /$defs/building/properties | description: {"type":"string"} |  |
| /$defs/building/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?BLD&#92;d{3,}$ |  |
| /$defs/building/properties/name | type: string |  |
| /$defs/building/properties/building&#95;type | type: string; enum: &#91;"house","guest-house","garage","shed","gazebo","workshop","greenhouse","barn","carport","pool-house","sauna"&#93;; description: Primary classification of this building. |  |
| /$defs/building/properties/parcel&#95;ref | description: Land parcel this building sits on. | ../metamodel.schema.yaml#/$defs/parcel&#95;ref |
| /$defs/building/properties/wing&#95;refs | type: array; description: Wings composing this building's structure. Every building must have at least one wing. Simple rectangular buildings have exactly one wing. Redundant with wing.building&#95;ref but enables per-building enforcement.  |  |
| /$defs/building/properties/wing&#95;refs/items |  | ../metamodel.schema.yaml#/$defs/wing&#95;ref |
| /$defs/building/properties/floors&#95;count | type: integer; description: Total number of floors including basement and attic if present. |  |
| /$defs/building/properties/built&#95;year | type: integer; description: Year the building was constructed. |  |
| /$defs/building/properties/total&#95;area&#95;sqm | type: number; description: Sum of all floor areas in this building. |  |
| /$defs/building/properties/position&#95;accuracy&#95;m |  | ../metamodel.schema.yaml#/$defs/position&#95;accuracy&#95;m |
| /$defs/building/properties/position&#95;source |  | ../metamodel.schema.yaml#/$defs/position&#95;source |
| /$defs/building/properties/position&#95;derived&#95;from |  | ../metamodel.schema.yaml#/$defs/position&#95;derived&#95;from |
| /$defs/building/properties/position | description: Center of the building footprint on the property grid. | ../metamodel.schema.yaml#/$defs/position |
| /$defs/building/properties/footprint | description: Ground-plan polygon in local coordinates (before rotation). | ../metamodel.schema.yaml#/$defs/polygon&#95;footprint |
| /$defs/building/properties/rotation&#95;degrees | type: number; description: Clockwise rotation from north in degrees. Applied to the footprint polygon vertices around the centroid for 2D rendering. 0 means the building's local +Y axis aligns with north.  |  |
| /$defs/building/properties/ground&#95;elevation&#95;m | type: number; description: Elevation of the building's ground level above the vertical datum. Default 0 for flat terrain. Non-zero for buildings on slopes or raised foundations. Used by construction inference for floor stacking and 3D placement.  |  |
| /$defs/building/properties/anchor&#95;point | description: Stable reference point for this building's geometry. Typically the south-west exterior corner of the ground-floor footprint. Unlike position (centroid), anchor&#95;point does not move when the footprint is edited. Used by construction inference as placement origin. Optional - when absent, position (centroid) is used.  | ../metamodel.schema.yaml#/$defs/position |
| /$defs/building/properties/exterior&#95;wall&#95;thickness&#95;cm | type: number; description: Typical exterior wall thickness for this building (structure + insulation). Used by construction inference to calculate interior envelope from exterior footprint.  |  |
| /$defs/building/properties/eave&#95;height&#95;m | type: number; description: DERIVED FIELD - maximum eave height across all wings of this building. Computed by inference agent. Used for quick LOD0/LOD1 site plan rendering without reading individual wing data. Optional - omit if wings are the sole consumer.  |  |
| /$defs/building/properties/ridge&#95;height&#95;m | type: number; description: DERIVED FIELD - maximum ridge height across all wings of this building. Computed by inference agent. Used for quick LOD0/LOD1 site plan rendering without reading individual wing data. Optional - omit if wings are the sole consumer.  |  |
| /$defs/building/properties/description | type: string |  |
| /$defs/building/properties/equipment&#95;refs | type: array; description: Equipment placed in this building (shed, gazebo). Used when the building has no formal rooms. Redundant with equipment.building&#95;ref.  |  |
| /$defs/building/properties/equipment&#95;refs/items |  | ../metamodel.schema.yaml#/$defs/equipment&#95;ref |
| /$defs/building/properties/furniture&#95;refs | type: array; description: Furniture placed in this building (shed, gazebo). Used when the building has no formal rooms. Redundant with furniture.building&#95;ref.  |  |
| /$defs/building/properties/furniture&#95;refs/items |  | ../metamodel.schema.yaml#/$defs/furniture&#95;ref |
| /$defs/building/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |
| /$defs/wing | type: object; required: &#91;"id","name","building&#95;ref","footprint"&#93;; additionalProperties: false; description: A structural section of a building with its own footprint and roof geometry. Every building has at least one wing. Simple rectangular buildings have exactly one wing. Complex buildings (L-shaped, T-shaped, with attached garage) are decomposed into multiple wings. Each wing has independent roof type, pitch, and height data. Roof fields live exclusively on wings - not on buildings. Rooms and construction entities reference their wing via wing&#95;ref.  |  |
| /$defs/wing/properties | description: {"type":"string"} |  |
| /$defs/wing/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?WNG&#92;d{3,}$ |  |
| /$defs/wing/properties/name | type: string |  |
| /$defs/wing/properties/building&#95;ref | description: Building this wing belongs to. | ../metamodel.schema.yaml#/$defs/building&#95;ref |
| /$defs/wing/properties/footprint | description: Outline of this wing in building-local coordinates (before rotation). The union of all wing footprints should approximate the building footprint.  | ../metamodel.schema.yaml#/$defs/polygon&#95;footprint |
| /$defs/wing/properties/position | description: Center of this wing for labeling. | ../metamodel.schema.yaml#/$defs/position |
| /$defs/wing/properties/roof&#95;type | type: string; enum: &#91;"flat","gable","hip","gambrel","mansard","shed","mono-pitch"&#93;; description: Primary roof form for this wing. |  |
| /$defs/wing/properties/roof&#95;pitch&#95;degrees | type: number |  |
| /$defs/wing/properties/ridge&#95;direction | description: Compass direction the ridge runs (parallel to). | ../metamodel.schema.yaml#/$defs/compass&#95;direction |
| /$defs/wing/properties/eave&#95;height&#95;m | type: number |  |
| /$defs/wing/properties/ridge&#95;height&#95;m | type: number |  |
| /$defs/wing/properties/roof&#95;overhang&#95;cm | type: number |  |
| /$defs/wing/properties/ground&#95;elevation&#95;m | type: number; description: Ground level of this wing above vertical datum, if different from building.ground&#95;elevation&#95;m. For split-level or stepped buildings.  |  |
| /$defs/wing/properties/description | type: string |  |
| /$defs/wing/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |
| /$defs/floor | type: object; required: &#91;"id","name","level","building&#95;ref"&#93;; additionalProperties: false; description: A storey or level within a building. Level 0 = ground floor, negative = basement, positive = upper floors. Answers CQ02 (rooms per floor). Used by T2 (inventory).  |  |
| /$defs/floor/properties | description: {"type":"string"} |  |
| /$defs/floor/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?FLR&#92;d{3,}$ |  |
| /$defs/floor/properties/name | type: string |  |
| /$defs/floor/properties/level | type: integer; description: 0 = ground, -1 = basement, 1 = first floor, etc. |  |
| /$defs/floor/properties/building&#95;ref | description: Building this floor belongs to. | ../metamodel.schema.yaml#/$defs/building&#95;ref |
| /$defs/floor/properties/area&#95;sqm | type: number |  |
| /$defs/floor/properties/ceiling&#95;height&#95;m | type: number |  |
| /$defs/floor/properties/base&#95;elevation&#95;m | type: number; description: Elevation of the bottom of this floor's slab above the vertical datum. Typically: ground&#95;floor = building.ground&#95;elevation&#95;m, upper floors = previous floor's base + slab + clear height.  |  |
| /$defs/floor/properties/finished&#95;floor&#95;elevation&#95;m | type: number; description: Elevation of the walking surface (top of slab + finish). Used to place rooms and furniture in 3D.  |  |
| /$defs/floor/properties/slab&#95;thickness&#95;cm | type: number; description: Structural slab thickness including finish. |  |
| /$defs/floor/properties/wing&#95;ref | description: Structural wing this floor belongs to. Required when the parent building has multiple wings. Optional for single-wing buildings (inferred from the sole wing). Omit for floors spanning the entire building across wing boundaries.  | ../metamodel.schema.yaml#/$defs/wing&#95;ref |
| /$defs/floor/properties/footprint | description: Floor plan outline in building-local coordinates. May differ from building footprint for partial floors (e.g., basement doesn't extend under garage). When absent, inherited from building (or wing) footprint.  | ../metamodel.schema.yaml#/$defs/polygon&#95;footprint |
| /$defs/floor/properties/description | type: string |  |
| /$defs/floor/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |
| /$defs/room | type: object; required: &#91;"id","name","room&#95;type","floor&#95;ref"&#93;; additionalProperties: false; description: An indoor space within a floor, classified by purpose. Answers CQ02 (room purpose and area), CQ26 (openings, lighting, heating detail). Used by T2 (inventory).  |  |
| /$defs/room/properties | description: {"type":"string"} |  |
| /$defs/room/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?RM&#92;d{3,}$ |  |
| /$defs/room/properties/name | type: string |  |
| /$defs/room/properties/room&#95;type | type: string; enum: &#91;"bedroom","bathroom","kitchen","living-room","dining-room","office","utility","storage","hallway","staircase","attic","cellar","workshop","laundry","garage-bay","pantry","dressing-room","server-room","boiler-room","terrace"&#93;; description: Primary purpose of this room. |  |
| /$defs/room/properties/floor&#95;ref | description: Floor this room is on. | ../metamodel.schema.yaml#/$defs/floor&#95;ref |
| /$defs/room/properties/area&#95;sqm | type: number |  |
| /$defs/room/properties/width&#95;cm | type: number; description: Interior width (shorter axis) in centimeters. |  |
| /$defs/room/properties/length&#95;cm | type: number; description: Interior length (longer axis) in centimeters. |  |
| /$defs/room/properties/ceiling&#95;height&#95;cm | type: number; description: Floor-to-ceiling height in centimeters. |  |
| /$defs/room/properties/position | description: Center of the room on the building floor plan grid. Used by T5. | ../metamodel.schema.yaml#/$defs/position |
| /$defs/room/properties/footprint | description: Floor-plan polygon in local coordinates (before translation by position). Used by T5. | ../metamodel.schema.yaml#/$defs/polygon&#95;footprint |
| /$defs/room/properties/rotation&#95;degrees | type: number; description: Clockwise rotation from north. Most rooms are axis-aligned (0). |  |
| /$defs/room/properties/wing&#95;ref | description: Structural wing this room belongs to. Can be inferred from floor's wing&#95;ref for single-wing buildings. Explicit when a floor spans multiple wings (e.g., hallway connecting main body and garage wing).  | ../metamodel.schema.yaml#/$defs/wing&#95;ref |
| /$defs/room/properties/walls | type: object; additionalProperties: false; description: Axis-aligned wall definitions for this room. Keys are compass directions (N, E, S, W). Optional - omit for models without wall-level detail. Answers CQ33.  |  |
| /$defs/room/properties/walls/properties/N |  | #/$defs/room&#95;wall |
| /$defs/room/properties/walls/properties/E |  | #/$defs/room&#95;wall |
| /$defs/room/properties/walls/properties/S |  | #/$defs/room&#95;wall |
| /$defs/room/properties/walls/properties/W |  | #/$defs/room&#95;wall |
| /$defs/room/properties/window&#95;count | type: integer; description: Simple window count. Superseded by openings&#91;&#93; in v1.1. |  |
| /$defs/room/properties/window&#95;orientation | description: Compass direction the main windows face. Superseded by openings&#91;&#93; in v1.1. | ../metamodel.schema.yaml#/$defs/compass&#95;direction |
| /$defs/room/properties/has&#95;water | type: boolean; description: Whether this room has plumbed water (relevant for bathrooms, kitchen, utility). |  |
| /$defs/room/properties/has&#95;heating | type: boolean; description: Whether this room has a heating element. Superseded by heating in v1.1. |  |
| /$defs/room/properties/equipment&#95;refs | type: array; description: Equipment entities placed in this room. Redundant with equipment.room&#95;ref but improves human readability of room definitions.  |  |
| /$defs/room/properties/equipment&#95;refs/items |  | ../metamodel.schema.yaml#/$defs/equipment&#95;ref |
| /$defs/room/properties/furniture&#95;refs | type: array; description: Furniture entities placed in this room. Redundant with furniture.room&#95;ref but improves human readability of room definitions.  |  |
| /$defs/room/properties/furniture&#95;refs/items |  | ../metamodel.schema.yaml#/$defs/furniture&#95;ref |
| /$defs/room/properties/openings | type: array; description: Windows, doors, and other openings in this room. Answers CQ26. |  |
| /$defs/room/properties/openings/items |  | #/$defs/opening |
| /$defs/room/properties/staircase | description: The flight of stairs leaving this room for another floor. Present on any room the stairs start from, whatever its &#96;room&#95;type&#96; - an open stair in a living room is as real as an enclosed stair hall.  | #/$defs/staircase |
| /$defs/room/properties/lighting&#95;groups | type: array; description: Lighting fixture groups in this room, each independently switched. Answers CQ26.  |  |
| /$defs/room/properties/lighting&#95;groups/items |  | #/$defs/lighting&#95;group |
| /$defs/room/properties/heating | description: Structured heating details for this room. | #/$defs/room&#95;heating |
| /$defs/room/properties/description | type: string |  |
| /$defs/room/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |
| /$defs/opening | type: object; required: &#91;"opening&#95;type","wall"&#93;; additionalProperties: false; description: A window, door, or other opening in a room wall. Embedded sub-object (no ID). Tracks type, wall, dimensions, and operability. Answers CQ26.  |  |
| /$defs/opening/properties | description: {"type":"string"} |  |
| /$defs/opening/properties/opening&#95;type | type: string; enum: &#91;"window","door","terrace-door","french-door","sliding-door","skylight","garage-door"&#93; |  |
| /$defs/opening/properties/wall | description: Wall where this opening is located. | ../metamodel.schema.yaml#/$defs/compass&#95;direction |
| /$defs/opening/properties/width&#95;cm | type: number; description: Opening width including frame/recess. |  |
| /$defs/opening/properties/height&#95;cm | type: number; description: Opening height including frame/recess. |  |
| /$defs/opening/properties/sill&#95;height&#95;cm | type: number; description: Height of window sill above floor. 0 for floor-to-ceiling. |  |
| /$defs/opening/properties/wall&#95;offset&#95;cm | type: number; description: Distance from the clockwise start of the wall to the opening's near edge, in centimeters. Convention: N wall starts at NW corner (left-to-right), E wall at NE corner (top-to-bottom), S wall at SE corner (right-to-left), W wall at SW corner (bottom-to-top). Omit for models without precise opening placement.  |  |
| /$defs/opening/properties/panes | type: integer; description: Number of separate glass panes or wings. |  |
| /$defs/opening/properties/openable | type: boolean; description: Whether this opening can be opened (false = fixed glazing). |  |
| /$defs/opening/properties/opens&#95;inward | type: boolean; description: True if opens inward, false if opens outward. |  |
| /$defs/opening/properties/glazing | type: string; enum: &#91;"single","double","triple"&#93; |  |
| /$defs/opening/properties/opens&#95;to&#95;room&#95;ref | description: For doors: the room on the other side. Omit for exterior doors/windows. | ../metamodel.schema.yaml#/$defs/room&#95;ref |
| /$defs/opening/properties/opens&#95;to&#95;zone&#95;ref | description: For exterior doors: the outdoor zone on the other side. | ../metamodel.schema.yaml#/$defs/outdoor&#95;zone&#95;ref |
| /$defs/opening/properties/head&#95;height&#95;cm | type: number; description: Height of the opening's top edge (lintel/head) above floor level. Can be derived as sill&#95;height&#95;cm + height&#95;cm, but explicit value prevents rounding errors in construction inference.  |  |
| /$defs/opening/properties/depth&#95;cm | type: number; description: Depth of the wall reveal (window/door recess) in centimeters. Typically equals wall thickness. Used for 3D opening cutout depth.  |  |
| /$defs/opening/properties/swing&#95;direction | type: string; enum: &#91;"left","right"&#93;; description: For hinged doors: which direction the door swings when opening. Combines with opens&#95;inward to fully describe the door arc.  |  |
| /$defs/opening/properties/description | type: string |  |
| /$defs/staircase | type: object; required: &#91;"connects&#95;to&#95;floor&#95;ref"&#93;; additionalProperties: false; description: The flight of stairs that leaves this room and reaches another floor. Embedded sub-object (no ID), on the room the flight starts from, naming the floor it arrives at - the same shape as an opening, which sits in the wall it is cut into and names the space on the far side. A room is on exactly one floor and a flight spans two, so the flight is a property of the room rather than a room of its own. A room with stairs up and stairs down declares the one that leaves it going up; the floor above declares its own. The rise is not stated here because it is already known: the two floors carry &#96;finished&#95;floor&#95;elevation&#95;m&#96;, and their difference divided by &#96;step&#95;count&#96; is the height of one riser. A stated rise could disagree with the floors it joins.  |  |
| /$defs/staircase/properties | description: {"type":"string"} |  |
| /$defs/staircase/properties/connects&#95;to&#95;floor&#95;ref | description: The floor this flight arrives at. Usually the next level up, but a flight from a cellar to the ground floor names the ground floor.  | ../metamodel.schema.yaml#/$defs/floor&#95;ref |
| /$defs/staircase/properties/arrives&#95;in&#95;room&#95;ref | description: The room on that floor the flight arrives in - a landing, a hall, an attic. Optional, and worth stating: with it the model can be walked from any room to any other, and without it a route stops at the floor.  | ../metamodel.schema.yaml#/$defs/room&#95;ref |
| /$defs/staircase/properties/staircase&#95;type | type: string; enum: &#91;"straight","quarter-turn","half-turn","winder","spiral","ladder"&#93;; description: The plan shape of the flight. |  |
| /$defs/staircase/properties/ascent&#95;direction | description: The direction faced when climbing the first flight. For a turning stair this is where it starts, not where it ends.  | ../metamodel.schema.yaml#/$defs/compass&#95;direction |
| /$defs/staircase/properties/step&#95;count | type: integer; description: Risers in the whole flight, landings excluded. |  |
| /$defs/staircase/properties/going&#95;cm | type: number; description: Tread depth of one step, front to back. |  |
| /$defs/staircase/properties/width&#95;cm | type: number; description: Usable width between the walls or balustrades. |  |
| /$defs/staircase/properties/description | type: string |  |
| /$defs/lighting&#95;group | type: object; required: &#91;"name"&#93;; additionalProperties: false; description: A group of lighting fixtures controlled by the same switch. Tracks fixture type, bulb specifications, wattage, and switching. Answers CQ26.  |  |
| /$defs/lighting&#95;group/properties | description: {"type":"string"} |  |
| /$defs/lighting&#95;group/properties/name | type: string |  |
| /$defs/lighting&#95;group/properties/fixture&#95;count | type: integer |  |
| /$defs/lighting&#95;group/properties/fixture&#95;type | type: string; enum: &#91;"recessed-spot","surface-spot","pendant","chandelier","wall-sconce","led-strip","track","floor-lamp","table-lamp","under-cabinet","range-hood-light","mirror-light","other"&#93; |  |
| /$defs/lighting&#95;group/properties/adjustable | type: boolean; description: Whether fixtures are directional (tiltable/rotatable spots). |  |
| /$defs/lighting&#95;group/properties/bulb&#95;socket | type: string; enum: &#91;"GU10","E27","E14","G9","GX53","MR16","integrated"&#93;; description: Socket type for replaceable bulbs. Omit for integrated LED. |  |
| /$defs/lighting&#95;group/properties/bulb&#95;type | type: string; enum: &#91;"LED","halogen","fluorescent","incandescent","CFL"&#93; |  |
| /$defs/lighting&#95;group/properties/wattage&#95;per&#95;bulb | type: number |  |
| /$defs/lighting&#95;group/properties/total&#95;wattage | type: number; description: Total wattage of all fixtures in this group. |  |
| /$defs/lighting&#95;group/properties/color&#95;temperature&#95;k | type: integer; description: Correlated color temperature in Kelvin. |  |
| /$defs/lighting&#95;group/properties/dimmable | type: boolean |  |
| /$defs/lighting&#95;group/properties/switch&#95;type | type: string; enum: &#91;"wall-switch","dimmer","remote","smart","pull-cord","motion-sensor","integrated"&#93; |  |
| /$defs/lighting&#95;group/properties/switch&#95;location | type: string; description: Where the switch is located (e.g., wall by door, combined with other group). |  |
| /$defs/lighting&#95;group/properties/circuit&#95;ref | description: The lighting circuit this group is on: a component whose component&#95;type is circuit. Lets the board's schedule be read from the room and the room from the schedule. Answers CQ49 for fixtures.  | ../metamodel.schema.yaml#/$defs/component&#95;ref |
| /$defs/lighting&#95;group/properties/description | type: string |  |
| /$defs/room&#95;heating | type: object; additionalProperties: false; description: Structured heating details for a room: type(s), location, and link to infrastructure system/component.  |  |
| /$defs/room&#95;heating/properties | description: {"type":"string"} |  |
| /$defs/room&#95;heating/properties/has&#95;underfloor | type: boolean |  |
| /$defs/room&#95;heating/properties/radiator&#95;type | type: string; enum: &#91;"panel-radiator","towel-radiator","convector","fan-coil","electric-heater","stove"&#93;; description: Type of radiator if present. Omit if no radiator. |  |
| /$defs/room&#95;heating/properties/radiator&#95;wall | description: Wall where the radiator is mounted. | ../metamodel.schema.yaml#/$defs/compass&#95;direction |
| /$defs/room&#95;heating/properties/system&#95;ref | description: Infrastructure heating system serving this room. | ../metamodel.schema.yaml#/$defs/system&#95;ref |
| /$defs/room&#95;heating/properties/component&#95;ref | description: Specific radiator component in the infrastructure model. | ../metamodel.schema.yaml#/$defs/component&#95;ref |
| /$defs/room&#95;heating/properties/description | type: string |  |
| /$defs/room&#95;wall | type: object; required: &#91;"thickness&#95;cm","is&#95;exterior"&#93;; additionalProperties: false; description: Wall segment of a room. Each room has up to 4 axis-aligned walls (N, E, S, W). Tracks thickness, exterior status, adjacency, and material. Shared interior walls are declared by both rooms - redundancy enables cross-validation. Answers CQ33. Used by T5 for wall-thickness rendering.  |  |
| /$defs/room&#95;wall/properties/thickness&#95;cm | type: number; description: Structural thickness of this wall in centimeters. |  |
| /$defs/room&#95;wall/properties/is&#95;exterior | type: boolean; description: True if this wall faces outside the building envelope. |  |
| /$defs/room&#95;wall/properties/adjacent&#95;ref | description: Room or outdoor zone on the other side of this wall. Omit for exterior walls facing open areas without a defined zone.  | ../metamodel.schema.yaml#/$defs/room&#95;or&#95;zone&#95;ref |
| /$defs/room&#95;wall/properties/material | type: string; description: Primary structural material of this wall. |  |
| /$defs/outdoor&#95;zone | type: object; required: &#91;"id","name","zone&#95;type","parcel&#95;ref"&#93;; additionalProperties: false; description: A classified outdoor area within a parcel: garden bed, lawn, forest section, driveway, patio, etc. Answers CQ03 (zone classification) and CQ11 (planting suitability). Used by T2, T3, T5.  |  |
| /$defs/outdoor&#95;zone/properties | description: {"type":"string"} |  |
| /$defs/outdoor&#95;zone/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?OZ&#92;d{3,}$ |  |
| /$defs/outdoor&#95;zone/properties/name | type: string |  |
| /$defs/outdoor&#95;zone/properties/zone&#95;type | type: string; enum: &#91;"garden","vegetable-garden","orchard","forest","lawn","meadow","driveway","parking","patio","terrace","deck","pool-area","playground","greenhouse-area","compost-area","woodshed-area","utility-area","forest-clearing","gravel-area","path"&#93;; description: Primary classification of this outdoor area. A &#96;path&#96; is an outdoor area whose purpose is that you walk along it: a paved walk between two places, or a track through a forest. Use it regardless of surface; the surface belongs in the description. |  |
| /$defs/outdoor&#95;zone/properties/parcel&#95;ref | description: Land parcel this zone belongs to. | ../metamodel.schema.yaml#/$defs/parcel&#95;ref |
| /$defs/outdoor&#95;zone/properties/area&#95;sqm | type: number |  |
| /$defs/outdoor&#95;zone/properties/position&#95;accuracy&#95;m |  | ../metamodel.schema.yaml#/$defs/position&#95;accuracy&#95;m |
| /$defs/outdoor&#95;zone/properties/position&#95;source |  | ../metamodel.schema.yaml#/$defs/position&#95;source |
| /$defs/outdoor&#95;zone/properties/position&#95;derived&#95;from |  | ../metamodel.schema.yaml#/$defs/position&#95;derived&#95;from |
| /$defs/outdoor&#95;zone/properties/position |  | ../metamodel.schema.yaml#/$defs/position |
| /$defs/outdoor&#95;zone/properties/footprint | description: Shape of this zone on the property layout. Polygon for irregular areas, circle for round features. | ../metamodel.schema.yaml#/$defs/footprint |
| /$defs/outdoor&#95;zone/properties/sun&#95;exposure | type: string; enum: &#91;"full-sun","partial-sun","partial-shade","full-shade"&#93;; description: Typical sun exposure level. Answers CQ11, CQ22. Used by T3 (garden planning). |  |
| /$defs/outdoor&#95;zone/properties/soil&#95;type | type: string; enum: &#91;"clay","loam","sandy-loam","sand","silt","peat","chalk","rocky"&#93;; description: Dominant soil type in this zone. Affects plant selection (CQ11). |  |
| /$defs/outdoor&#95;zone/properties/soil&#95;ph | type: number; description: Measured or estimated soil pH. Affects plant compatibility. |  |
| /$defs/outdoor&#95;zone/properties/soil&#95;profile&#95;refs | type: array; description: Detailed soil profiles for this zone. One zone may have multiple soil profiles (e.g., lawn area vs raised bed). Answers CQ37. Convenience reverse-ref; SOIL entity is primary owner via outdoor&#95;zone&#95;ref.  |  |
| /$defs/outdoor&#95;zone/properties/soil&#95;profile&#95;refs/items |  | ../metamodel.schema.yaml#/$defs/soil&#95;profile&#95;ref |
| /$defs/outdoor&#95;zone/properties/slope&#95;direction | description: Direction the ground slopes downward (for drainage analysis). | ../metamodel.schema.yaml#/$defs/compass&#95;direction |
| /$defs/outdoor&#95;zone/properties/slope&#95;percent | type: number; description: Gradient as percentage. 0 = flat, 100 = 45 degrees. |  |
| /$defs/outdoor&#95;zone/properties/shared&#95;edges | type: array; description: Edges of this element's outline that lie on another element's edge and follow it when it moves. Declare an edge here when its coordinates were set to meet a neighbour rather than measured; tools move a declared edge and never a merely coincident one.  |  |
| /$defs/outdoor&#95;zone/properties/shared&#95;edges/items |  | ../metamodel.schema.yaml#/$defs/shared&#95;edge |
| /$defs/outdoor&#95;zone/properties/description | type: string |  |
| /$defs/outdoor&#95;zone/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |

## topology/spatial.schema.yaml

Spatial Layout Configuration

| JSON Pointer | Type / constraints | Reference |
|---|---|---|
| / | type: object; additionalProperties: false; description: Coordinate system definition and spatial relation edges. |  |
| /properties/coordinate&#95;system | description: Property-relative coordinate system with optional vertical datum (v2.0). All positions in the model are relative to this origin and north direction. Z values reference the vertical datum when 3D data is present.  | ../metamodel.schema.yaml#/$defs/coordinate&#95;system |
| /properties/spatial&#95;relations | type: array; description: Explicit directional and proximity relationships between positioned elements. Used for shade analysis (CQ22), privacy assessment (T4), and spatial reasoning in layout visualization (T5).  |  |
| /properties/spatial&#95;relations/items |  | ../metamodel.schema.yaml#/$defs/spatial&#95;relation |

## topology/tools.schema.yaml

Portable Tools

| JSON Pointer | Type / constraints | Reference |
|---|---|---|
| / | type: object; additionalProperties: false; description: Portable, hand-held, or easily transportable tools used for property maintenance, garden work, and construction. Distinct from equipment (EQP) which covers heavier, installed, or hard-to-move items. Each tool is a first-class entity with typed ID and storage location. Topology plane.  |  |
| /properties/tools | type: array; description: Portable tools available on the property. Answers CQ31. |  |
| /properties/tools/items |  | #/$defs/tool |
| /$defs/tool | type: object; required: &#91;"id","name"&#93;; additionalProperties: false; description: A portable, hand-held, or easily transportable tool: shovels, rakes, saws, welders, ladders, etc. Lighter and more mobile than equipment (EQP). Tracks storage location and condition. Answers CQ31. Used by T2 (inventory) and T8 (estate change checklist).  |  |
| /$defs/tool/properties | description: {"type":"string"} |  |
| /$defs/tool/properties/id | type: string; pattern: ^(&#91;a-z&#93;&#91;a-z0-9-&#93;&#42;&#92;.)?TL&#92;d{3,}$ |  |
| /$defs/tool/properties/name | type: string |  |
| /$defs/tool/properties/tool&#95;type | type: string; description: Free-text classification of this tool (e.g., shovel, welder, ladder). |  |
| /$defs/tool/properties/room&#95;ref | description: Room where this tool is stored. | ../metamodel.schema.yaml#/$defs/room&#95;ref |
| /$defs/tool/properties/building&#95;ref | description: Building (shed, garage) where this tool is stored. Use when the storage location has no formal rooms.  | ../metamodel.schema.yaml#/$defs/building&#95;ref |
| /$defs/tool/properties/brand | type: string |  |
| /$defs/tool/properties/model | type: string |  |
| /$defs/tool/properties/condition | type: string; enum: &#91;"good","fair","poor","needs-repair"&#93;; description: Current physical condition of the tool. |  |
| /$defs/tool/properties/description | type: string |  |
| /$defs/tool/properties/tags |  | ../metamodel.schema.yaml#/$defs/tags |

## visualization/scene.schema.yaml

Scene Export Contract

| JSON Pointer | Type / constraints | Reference |
|---|---|---|
| / | type: object; additionalProperties: false; description: Data contract between the Realm model (semantic + construction layers) and visualization consumers (SVG renderers, Three.js viewer, SketchUp export). Defines the shape of renderer-ready data, NOT model data. Scene data is generated on-the-fly (GraphQL) or exported as static JSON (CLI). Three scene types: floor&#95;plan&#95;scene (one floor), site&#95;plan&#95;scene (whole property), scene&#95;3d (full 3D). All geometry in absolute model coordinates with rotation applied - no local-to-global transforms needed by renderers. Source: Realm model (topology, construction, nature, context, infrastructure). Aligned with existing TypeScript view model types in viewers/realm/plans/src/types.ts.  |  |
| /properties/floor&#95;plan&#95;scene |  | #/$defs/floor&#95;plan&#95;scene |
| /properties/site&#95;plan&#95;scene |  | #/$defs/site&#95;plan&#95;scene |
| /properties/scene&#95;3d |  | #/$defs/scene&#95;3d |
| /$defs/point | type: object; required: &#91;"x","y"&#93;; additionalProperties: false; description: Point in absolute model coordinates (meters). |  |
| /$defs/point/properties/x | type: number |  |
| /$defs/point/properties/y | type: number |  |
| /$defs/point3d | type: object; required: &#91;"x","y","z"&#93;; additionalProperties: false; description: Point in absolute model coordinates with elevation (meters). |  |
| /$defs/point3d/properties/x | type: number |  |
| /$defs/point3d/properties/y | type: number |  |
| /$defs/point3d/properties/z | type: number |  |
| /$defs/rect | type: object; required: &#91;"left","top","right","bottom"&#93;; additionalProperties: false; description: Bounding rectangle in model coordinates. |  |
| /$defs/rect/properties/left | type: number |  |
| /$defs/rect/properties/top | type: number |  |
| /$defs/rect/properties/right | type: number |  |
| /$defs/rect/properties/bottom | type: number |  |
| /$defs/bounds2d | type: object; required: &#91;"min","max"&#93;; additionalProperties: false; description: Axis-aligned bounding box using nested points. |  |
| /$defs/bounds2d/properties/min |  | #/$defs/point |
| /$defs/bounds2d/properties/max |  | #/$defs/point |
| /$defs/bounds3d | type: object; required: &#91;"min","max"&#93;; additionalProperties: false |  |
| /$defs/bounds3d/properties/min |  | #/$defs/point3d |
| /$defs/bounds3d/properties/max |  | #/$defs/point3d |
| /$defs/floor&#95;plan&#95;scene | type: object; required: &#91;"metadata","rooms","wall&#95;segments","openings","building&#95;outline"&#93;; additionalProperties: false; description: Renderer-ready data for a single floor's SVG plan. Rooms as labeled rectangles, merged wall segments, placed openings with symbols, building outline. All coordinates absolute (rotation applied).  |  |
| /$defs/floor&#95;plan&#95;scene/properties/metadata |  | #/$defs/floor&#95;plan&#95;metadata |
| /$defs/floor&#95;plan&#95;scene/properties/rooms | type: array |  |
| /$defs/floor&#95;plan&#95;scene/properties/rooms/items |  | #/$defs/floor&#95;plan&#95;room |
| /$defs/floor&#95;plan&#95;scene/properties/wall&#95;segments | type: array; description: Pre-computed continuous wall segments from construction layer. |  |
| /$defs/floor&#95;plan&#95;scene/properties/wall&#95;segments/items |  | #/$defs/floor&#95;plan&#95;wall |
| /$defs/floor&#95;plan&#95;scene/properties/openings | type: array |  |
| /$defs/floor&#95;plan&#95;scene/properties/openings/items |  | #/$defs/floor&#95;plan&#95;opening |
| /$defs/floor&#95;plan&#95;scene/properties/building&#95;outline | type: array; description: Absolute building outline vertices (rotation applied). |  |
| /$defs/floor&#95;plan&#95;scene/properties/building&#95;outline/items |  | #/$defs/point |
| /$defs/floor&#95;plan&#95;scene/properties/annotations | type: array |  |
| /$defs/floor&#95;plan&#95;scene/properties/annotations/items |  | #/$defs/floor&#95;plan&#95;annotation |
| /$defs/floor&#95;plan&#95;scene/properties/sensors | type: array |  |
| /$defs/floor&#95;plan&#95;scene/properties/sensors/items |  | #/$defs/floor&#95;plan&#95;sensor |
| /$defs/floor&#95;plan&#95;metadata | type: object; required: &#91;"building&#95;id","floor&#95;id","level","bounds"&#93;; additionalProperties: false |  |
| /$defs/floor&#95;plan&#95;metadata/properties/building&#95;id | type: string |  |
| /$defs/floor&#95;plan&#95;metadata/properties/building&#95;name | type: string |  |
| /$defs/floor&#95;plan&#95;metadata/properties/floor&#95;id | type: string |  |
| /$defs/floor&#95;plan&#95;metadata/properties/floor&#95;name | type: string |  |
| /$defs/floor&#95;plan&#95;metadata/properties/level | type: integer; description: Floor number (0 = ground floor). |  |
| /$defs/floor&#95;plan&#95;metadata/properties/bounds |  | #/$defs/bounds2d |
| /$defs/floor&#95;plan&#95;metadata/properties/north&#95;angle&#95;degrees | type: number; description: Rotation from model +Y to true north. |  |
| /$defs/floor&#95;plan&#95;metadata/properties/unit&#95;label | type: string; description: Display unit for dimensions. |  |
| /$defs/floor&#95;plan&#95;room | type: object; required: &#91;"id","name","room&#95;type","rect"&#93;; additionalProperties: false |  |
| /$defs/floor&#95;plan&#95;room/properties/id | type: string |  |
| /$defs/floor&#95;plan&#95;room/properties/name | type: string |  |
| /$defs/floor&#95;plan&#95;room/properties/room&#95;type | type: string |  |
| /$defs/floor&#95;plan&#95;room/properties/area&#95;sqm | type: number |  |
| /$defs/floor&#95;plan&#95;room/properties/rect |  | #/$defs/rect |
| /$defs/floor&#95;plan&#95;room/properties/is&#95;outdoor | type: boolean |  |
| /$defs/floor&#95;plan&#95;wall | type: object; required: &#91;"start","end","is&#95;exterior"&#93;; additionalProperties: false; description: Merged wall segment with thickness and adjacency. |  |
| /$defs/floor&#95;plan&#95;wall/properties/start |  | #/$defs/point |
| /$defs/floor&#95;plan&#95;wall/properties/end |  | #/$defs/point |
| /$defs/floor&#95;plan&#95;wall/properties/thickness&#95;cm | type: number |  |
| /$defs/floor&#95;plan&#95;wall/properties/is&#95;exterior | type: boolean |  |
| /$defs/floor&#95;plan&#95;wall/properties/material | type: string |  |
| /$defs/floor&#95;plan&#95;wall/properties/room&#95;ids | type: array; description: Room IDs on either side of this wall. |  |
| /$defs/floor&#95;plan&#95;wall/properties/room&#95;ids/items | type: string |  |
| /$defs/floor&#95;plan&#95;opening | type: object; required: &#91;"symbol","position","width&#95;m","angle","room&#95;id"&#93;; additionalProperties: false; description: Window/door positioned on a wall for SVG rendering. |  |
| /$defs/floor&#95;plan&#95;opening/properties/symbol | type: string; enum: &#91;"window","door","terrace-door","french-door","sliding-door","garage-door","skylight"&#93; |  |
| /$defs/floor&#95;plan&#95;opening/properties/position | description: Absolute position of the opening's near edge on the wall. | #/$defs/point |
| /$defs/floor&#95;plan&#95;opening/properties/width&#95;m | type: number |  |
| /$defs/floor&#95;plan&#95;opening/properties/angle | type: number; description: Angle of the wall direction (atan2 of start→end), used for SVG rotate() transforms. |  |
| /$defs/floor&#95;plan&#95;opening/properties/wall&#95;segment&#95;id | type: string; description: Optional WSG entity ID this opening belongs to. May be omitted when the opening is not attached to a specific wall segment or when wall-segment data is unavailable. Renderers MUST NOT assume this field is present; when absent, rely on position and angle for placement and transforms.  |  |
| /$defs/floor&#95;plan&#95;opening/properties/sill&#95;height&#95;cm | type: number; description: Distance from floor to bottom of opening. |  |
| /$defs/floor&#95;plan&#95;opening/properties/head&#95;height&#95;cm | type: number; description: Distance from floor to top of opening. |  |
| /$defs/floor&#95;plan&#95;opening/properties/room&#95;id | type: string; description: Room this opening belongs to. |  |
| /$defs/floor&#95;plan&#95;annotation | type: object; required: &#91;"type","start","end"&#93;; additionalProperties: false; description: Visual annotation line (ridge, divider, stairs marker). |  |
| /$defs/floor&#95;plan&#95;annotation/properties | type: {"type":"string","enum":&#91;"ridge-line","divider","stairs-marker"&#93;} |  |
| /$defs/floor&#95;plan&#95;annotation/properties/type | type: string; enum: &#91;"ridge-line","divider","stairs-marker"&#93; |  |
| /$defs/floor&#95;plan&#95;annotation/properties/start |  | #/$defs/point |
| /$defs/floor&#95;plan&#95;annotation/properties/end |  | #/$defs/point |
| /$defs/floor&#95;plan&#95;annotation/properties/label | type: string |  |
| /$defs/floor&#95;plan&#95;sensor | type: object; required: &#91;"id","name","position","is&#95;active"&#93;; additionalProperties: false; description: Alarm sensor / motion detector rendered as a dot. |  |
| /$defs/floor&#95;plan&#95;sensor/properties/id | type: string |  |
| /$defs/floor&#95;plan&#95;sensor/properties/name | type: string |  |
| /$defs/floor&#95;plan&#95;sensor/properties/position |  | #/$defs/point |
| /$defs/floor&#95;plan&#95;sensor/properties/is&#95;active | type: boolean |  |
| /$defs/site&#95;plan&#95;scene | type: object; required: &#91;"metadata","parcel&#95;boundary","zones","buildings","boundaries"&#93;; additionalProperties: false; description: Renderer-ready data for the whole property site plan (SVG). Zones, buildings, boundaries, vegetation, fence posts. All coordinates absolute (rotation applied).  |  |
| /$defs/site&#95;plan&#95;scene/properties/metadata |  | #/$defs/site&#95;plan&#95;metadata |
| /$defs/site&#95;plan&#95;scene/properties/parcel&#95;boundary | type: array; description: Parcel outline vertices in model coordinates. |  |
| /$defs/site&#95;plan&#95;scene/properties/parcel&#95;boundary/items |  | #/$defs/point |
| /$defs/site&#95;plan&#95;scene/properties/zones | type: array |  |
| /$defs/site&#95;plan&#95;scene/properties/zones/items |  | #/$defs/site&#95;plan&#95;zone |
| /$defs/site&#95;plan&#95;scene/properties/buildings | type: array |  |
| /$defs/site&#95;plan&#95;scene/properties/buildings/items |  | #/$defs/site&#95;plan&#95;building |
| /$defs/site&#95;plan&#95;scene/properties/boundaries | type: array |  |
| /$defs/site&#95;plan&#95;scene/properties/boundaries/items |  | #/$defs/site&#95;plan&#95;boundary |
| /$defs/site&#95;plan&#95;scene/properties/specimens | type: array |  |
| /$defs/site&#95;plan&#95;scene/properties/specimens/items |  | #/$defs/site&#95;plan&#95;specimen |
| /$defs/site&#95;plan&#95;scene/properties/plantings | type: array |  |
| /$defs/site&#95;plan&#95;scene/properties/plantings/items |  | #/$defs/site&#95;plan&#95;planting |
| /$defs/site&#95;plan&#95;scene/properties/fence&#95;posts | type: array |  |
| /$defs/site&#95;plan&#95;scene/properties/fence&#95;posts/items |  | #/$defs/site&#95;plan&#95;fence&#95;post |
| /$defs/site&#95;plan&#95;scene/properties/roof&#95;outlines | type: array; description: Projected 2D roof plane outlines rendered as dashed overlays. |  |
| /$defs/site&#95;plan&#95;scene/properties/roof&#95;outlines/items |  | #/$defs/site&#95;plan&#95;roof&#95;outline |
| /$defs/site&#95;plan&#95;metadata | type: object; required: &#91;"parcel&#95;id","bounds"&#93;; additionalProperties: false |  |
| /$defs/site&#95;plan&#95;metadata/properties/parcel&#95;id | type: string |  |
| /$defs/site&#95;plan&#95;metadata/properties/parcel&#95;name | type: string |  |
| /$defs/site&#95;plan&#95;metadata/properties/area&#95;sqm | type: number |  |
| /$defs/site&#95;plan&#95;metadata/properties/bounds |  | #/$defs/bounds2d |
| /$defs/site&#95;plan&#95;metadata/properties/north&#95;angle&#95;degrees | type: number |  |
| /$defs/site&#95;plan&#95;metadata/properties/unit | type: string |  |
| /$defs/site&#95;plan&#95;zone | type: object; required: &#91;"id","name","zone&#95;type","position"&#93;; additionalProperties: false |  |
| /$defs/site&#95;plan&#95;zone/properties/id | type: string |  |
| /$defs/site&#95;plan&#95;zone/properties/name | type: string |  |
| /$defs/site&#95;plan&#95;zone/properties/zone&#95;type | type: string |  |
| /$defs/site&#95;plan&#95;zone/properties/position |  | #/$defs/point |
| /$defs/site&#95;plan&#95;zone/properties/absolute&#95;vertices | type: array |  |
| /$defs/site&#95;plan&#95;zone/properties/absolute&#95;vertices/items |  | #/$defs/point |
| /$defs/site&#95;plan&#95;zone/properties/area&#95;sqm | type: number |  |
| /$defs/site&#95;plan&#95;zone/properties/is&#95;proposed | type: boolean |  |
| /$defs/site&#95;plan&#95;wing | type: object; required: &#91;"id","name","absolute&#95;vertices"&#93;; additionalProperties: false; description: Wing footprint polygon in absolute model coordinates. |  |
| /$defs/site&#95;plan&#95;wing/properties/id | type: string |  |
| /$defs/site&#95;plan&#95;wing/properties/name | type: string |  |
| /$defs/site&#95;plan&#95;wing/properties/absolute&#95;vertices | type: array |  |
| /$defs/site&#95;plan&#95;wing/properties/absolute&#95;vertices/items |  | #/$defs/point |
| /$defs/site&#95;plan&#95;roof&#95;outline | type: object; required: &#91;"id","building&#95;id","absolute&#95;vertices","surface&#95;type"&#93;; additionalProperties: false; description: Projected 2D roof plane outline (dashed overlay). |  |
| /$defs/site&#95;plan&#95;roof&#95;outline/properties/id | type: string |  |
| /$defs/site&#95;plan&#95;roof&#95;outline/properties/building&#95;id | type: string |  |
| /$defs/site&#95;plan&#95;roof&#95;outline/properties/absolute&#95;vertices | type: array |  |
| /$defs/site&#95;plan&#95;roof&#95;outline/properties/absolute&#95;vertices/items |  | #/$defs/point |
| /$defs/site&#95;plan&#95;roof&#95;outline/properties/surface&#95;type | type: string |  |
| /$defs/site&#95;plan&#95;roof&#95;outline/properties/facing&#95;direction | type: string |  |
| /$defs/site&#95;plan&#95;building | type: object; required: &#91;"id","name","wings"&#93;; additionalProperties: false; description: Building as semantic container with wing geometry. |  |
| /$defs/site&#95;plan&#95;building/properties/id | type: string |  |
| /$defs/site&#95;plan&#95;building/properties/name | type: string |  |
| /$defs/site&#95;plan&#95;building/properties/wings | type: array; description: Renderable wing polygons (geometry is per-wing, not per-building). |  |
| /$defs/site&#95;plan&#95;building/properties/wings/items |  | #/$defs/site&#95;plan&#95;wing |
| /$defs/site&#95;plan&#95;building/properties/is&#95;neighbor | type: boolean; description: True for neighbor property massing blocks. |  |
| /$defs/site&#95;plan&#95;building/properties/height&#95;m | type: number; description: Building height for neighbor massing shading. |  |
| /$defs/site&#95;plan&#95;building/properties/direction | type: string; description: Cardinal direction relative to parcel (neighbor properties). |  |
| /$defs/site&#95;plan&#95;boundary | type: object; required: &#91;"id","name","boundary&#95;type","points"&#93;; additionalProperties: false |  |
| /$defs/site&#95;plan&#95;boundary/properties/id | type: string |  |
| /$defs/site&#95;plan&#95;boundary/properties/name | type: string |  |
| /$defs/site&#95;plan&#95;boundary/properties/boundary&#95;type | type: string |  |
| /$defs/site&#95;plan&#95;boundary/properties/points | type: array |  |
| /$defs/site&#95;plan&#95;boundary/properties/points/items |  | #/$defs/point |
| /$defs/site&#95;plan&#95;boundary/properties/length&#95;m | type: number |  |
| /$defs/site&#95;plan&#95;boundary/properties/height&#95;m | type: number |  |
| /$defs/site&#95;plan&#95;specimen | type: object; required: &#91;"id","name","specimen&#95;type","position"&#93;; additionalProperties: false |  |
| /$defs/site&#95;plan&#95;specimen/properties/id | type: string |  |
| /$defs/site&#95;plan&#95;specimen/properties/name | type: string |  |
| /$defs/site&#95;plan&#95;specimen/properties/species | type: string |  |
| /$defs/site&#95;plan&#95;specimen/properties/specimen&#95;type | type: string |  |
| /$defs/site&#95;plan&#95;specimen/properties/position |  | #/$defs/point |
| /$defs/site&#95;plan&#95;specimen/properties/canopy&#95;radius&#95;m | type: number |  |
| /$defs/site&#95;plan&#95;specimen/properties/height&#95;m | type: number |  |
| /$defs/site&#95;plan&#95;planting | type: object; required: &#91;"id","name","planting&#95;type"&#93;; additionalProperties: false |  |
| /$defs/site&#95;plan&#95;planting/properties/id | type: string |  |
| /$defs/site&#95;plan&#95;planting/properties/name | type: string |  |
| /$defs/site&#95;plan&#95;planting/properties/planting&#95;type | type: string |  |
| /$defs/site&#95;plan&#95;planting/properties/position |  | #/$defs/point |
| /$defs/site&#95;plan&#95;planting/properties/absolute&#95;vertices | type: array |  |
| /$defs/site&#95;plan&#95;planting/properties/absolute&#95;vertices/items |  | #/$defs/point |
| /$defs/site&#95;plan&#95;planting/properties/is&#95;proposed | type: boolean |  |
| /$defs/site&#95;plan&#95;planting/properties/plant&#95;positions | type: array; description: Individual plant positions (e.g., 6 shrubs along a walkway). |  |
| /$defs/site&#95;plan&#95;planting/properties/plant&#95;positions/items |  | #/$defs/point |
| /$defs/site&#95;plan&#95;fence&#95;post | type: object; required: &#91;"seq","position","type"&#93;; additionalProperties: false |  |
| /$defs/site&#95;plan&#95;fence&#95;post/properties | type: {"type":"string","enum":&#91;"standard","end","reinforced"&#93;} |  |
| /$defs/site&#95;plan&#95;fence&#95;post/properties/seq | type: integer |  |
| /$defs/site&#95;plan&#95;fence&#95;post/properties/position |  | #/$defs/point |
| /$defs/site&#95;plan&#95;fence&#95;post/properties/type | type: string; enum: &#91;"standard","end","reinforced"&#93; |  |
| /$defs/scene&#95;3d | type: object; required: &#91;"metadata","ground&#95;plane","buildings"&#93;; additionalProperties: false; description: Complete 3D scene data for browser-based visualization (Three.js) or CAD export (SketchUp). All geometry in absolute model coordinates. Supports LOD degradation: shell-only (LOD1) when construction layer is unavailable, detailed walls+roofs (LOD2) when available.  |  |
| /$defs/scene&#95;3d/properties/metadata |  | #/$defs/scene&#95;3d&#95;metadata |
| /$defs/scene&#95;3d/properties/ground&#95;plane |  | #/$defs/scene&#95;3d&#95;ground |
| /$defs/scene&#95;3d/properties/buildings | type: array; description: Building geometry at available LOD. |  |
| /$defs/scene&#95;3d/properties/buildings/items |  | #/$defs/scene&#95;3d&#95;building |
| /$defs/scene&#95;3d/properties/boundaries | type: array |  |
| /$defs/scene&#95;3d/properties/boundaries/items |  | #/$defs/scene&#95;3d&#95;boundary |
| /$defs/scene&#95;3d/properties/vegetation | type: array |  |
| /$defs/scene&#95;3d/properties/vegetation/items |  | #/$defs/scene&#95;3d&#95;vegetation |
| /$defs/scene&#95;3d/properties/neighbors | type: array; description: Neighbor building massing (gray blocks for context). |  |
| /$defs/scene&#95;3d/properties/neighbors/items |  | #/$defs/scene&#95;3d&#95;neighbor |
| /$defs/scene&#95;3d&#95;metadata | type: object; required: &#91;"realm&#95;name","coordinate&#95;system"&#93;; additionalProperties: false |  |
| /$defs/scene&#95;3d&#95;metadata/properties/realm&#95;name | type: string |  |
| /$defs/scene&#95;3d&#95;metadata/properties/coordinate&#95;system | type: object; additionalProperties: false |  |
| /$defs/scene&#95;3d&#95;metadata/properties/coordinate&#95;system/properties/unit | type: string |  |
| /$defs/scene&#95;3d&#95;metadata/properties/coordinate&#95;system/properties/north&#95;angle&#95;degrees | type: number |  |
| /$defs/scene&#95;3d&#95;metadata/properties/coordinate&#95;system/properties/vertical&#95;datum | type: string |  |
| /$defs/scene&#95;3d&#95;metadata/properties/bounds&#95;3d |  | #/$defs/bounds3d |
| /$defs/scene&#95;3d&#95;ground | type: object; additionalProperties: false; description: Flat ground plane (terrain mesh out of scope for v2). |  |
| /$defs/scene&#95;3d&#95;ground/properties/boundary&#95;vertices | type: array |  |
| /$defs/scene&#95;3d&#95;ground/properties/boundary&#95;vertices/items |  | #/$defs/point |
| /$defs/scene&#95;3d&#95;ground/properties/elevation&#95;m | type: number |  |
| /$defs/scene&#95;3d&#95;building | type: object; required: &#91;"id","name","wings"&#93;; additionalProperties: false; description: Building geometry. wings (per-wing shells) are always present (LOD1). wall&#95;segments, roof&#95;planes, and slabs are optional (LOD2 - requires construction layer).  |  |
| /$defs/scene&#95;3d&#95;building/properties/id | type: string |  |
| /$defs/scene&#95;3d&#95;building/properties/name | type: string |  |
| /$defs/scene&#95;3d&#95;building/properties/wings | type: array; description: Per-wing extruded blocks. Each wing has its own footprint and heights. |  |
| /$defs/scene&#95;3d&#95;building/properties/wings/items |  | #/$defs/scene&#95;3d&#95;wing |
| /$defs/scene&#95;3d&#95;building/properties/wall&#95;segments | type: array; description: Detailed wall geometry from construction layer. |  |
| /$defs/scene&#95;3d&#95;building/properties/wall&#95;segments/items | type: object; required: &#91;"id","vertices&#95;3d","is&#95;exterior"&#93;; additionalProperties: false |  |
| /$defs/scene&#95;3d&#95;building/properties/wall&#95;segments/items/properties/id | type: string |  |
| /$defs/scene&#95;3d&#95;building/properties/wall&#95;segments/items/properties/vertices&#95;3d | type: array; description: 3D vertices defining the wall face polygon. |  |
| /$defs/scene&#95;3d&#95;building/properties/wall&#95;segments/items/properties/vertices&#95;3d/items |  | #/$defs/point3d |
| /$defs/scene&#95;3d&#95;building/properties/wall&#95;segments/items/properties/is&#95;exterior | type: boolean |  |
| /$defs/scene&#95;3d&#95;building/properties/wall&#95;segments/items/properties/openings | type: array |  |
| /$defs/scene&#95;3d&#95;building/properties/wall&#95;segments/items/properties/openings/items | type: object; required: &#91;"type","position&#95;3d","width&#95;m","height&#95;m"&#93;; additionalProperties: false |  |
| /$defs/scene&#95;3d&#95;building/properties/wall&#95;segments/items/properties/openings/items/properties | type: {"type":"string","examples":&#91;"window","door"&#93;} |  |
| /$defs/scene&#95;3d&#95;building/properties/wall&#95;segments/items/properties/openings/items/properties/type | type: string |  |
| /$defs/scene&#95;3d&#95;building/properties/wall&#95;segments/items/properties/openings/items/properties/position&#95;3d | description: Bottom-left corner of opening in 3D. | #/$defs/point3d |
| /$defs/scene&#95;3d&#95;building/properties/wall&#95;segments/items/properties/openings/items/properties/width&#95;m | type: number |  |
| /$defs/scene&#95;3d&#95;building/properties/wall&#95;segments/items/properties/openings/items/properties/height&#95;m | type: number |  |
| /$defs/scene&#95;3d&#95;building/properties/roof&#95;planes | type: array |  |
| /$defs/scene&#95;3d&#95;building/properties/roof&#95;planes/items | type: object; required: &#91;"id","vertices&#95;3d"&#93;; additionalProperties: false |  |
| /$defs/scene&#95;3d&#95;building/properties/roof&#95;planes/items/properties/id | type: string |  |
| /$defs/scene&#95;3d&#95;building/properties/roof&#95;planes/items/properties/vertices&#95;3d | type: array |  |
| /$defs/scene&#95;3d&#95;building/properties/roof&#95;planes/items/properties/vertices&#95;3d/items |  | #/$defs/point3d |
| /$defs/scene&#95;3d&#95;building/properties/roof&#95;planes/items/properties/facing&#95;direction | type: string |  |
| /$defs/scene&#95;3d&#95;building/properties/roof&#95;planes/items/properties/material | type: string |  |
| /$defs/scene&#95;3d&#95;building/properties/slabs | type: array |  |
| /$defs/scene&#95;3d&#95;building/properties/slabs/items | type: object; required: &#91;"id","outline&#95;vertices","elevation&#95;m"&#93;; additionalProperties: false |  |
| /$defs/scene&#95;3d&#95;building/properties/slabs/items/properties/id | type: string |  |
| /$defs/scene&#95;3d&#95;building/properties/slabs/items/properties/outline&#95;vertices | type: array |  |
| /$defs/scene&#95;3d&#95;building/properties/slabs/items/properties/outline&#95;vertices/items |  | #/$defs/point |
| /$defs/scene&#95;3d&#95;building/properties/slabs/items/properties/elevation&#95;m | type: number |  |
| /$defs/scene&#95;3d&#95;building/properties/slabs/items/properties/thickness&#95;m | type: number |  |
| /$defs/scene&#95;3d&#95;wing | type: object; required: &#91;"id","name","footprint&#95;vertices"&#93;; additionalProperties: false; description: Per-wing extruded block for LOD0/LOD1 rendering. |  |
| /$defs/scene&#95;3d&#95;wing/properties/id | type: string |  |
| /$defs/scene&#95;3d&#95;wing/properties/name | type: string |  |
| /$defs/scene&#95;3d&#95;wing/properties/footprint&#95;vertices | type: array; description: Absolute 2D footprint vertices (building position applied). |  |
| /$defs/scene&#95;3d&#95;wing/properties/footprint&#95;vertices/items |  | #/$defs/point |
| /$defs/scene&#95;3d&#95;wing/properties/ground&#95;elevation&#95;m | type: number |  |
| /$defs/scene&#95;3d&#95;wing/properties/eave&#95;elevation&#95;m | type: number |  |
| /$defs/scene&#95;3d&#95;wing/properties/ridge&#95;elevation&#95;m | type: number |  |
| /$defs/scene&#95;3d&#95;boundary | type: object; required: &#91;"id","boundary&#95;type","vertices"&#93;; additionalProperties: false |  |
| /$defs/scene&#95;3d&#95;boundary/properties/id | type: string |  |
| /$defs/scene&#95;3d&#95;boundary/properties/boundary&#95;type | type: string |  |
| /$defs/scene&#95;3d&#95;boundary/properties/vertices | type: array |  |
| /$defs/scene&#95;3d&#95;boundary/properties/vertices/items |  | #/$defs/point |
| /$defs/scene&#95;3d&#95;boundary/properties/height&#95;m | type: number |  |
| /$defs/scene&#95;3d&#95;vegetation | type: object; required: &#91;"id","entity&#95;type","position"&#93;; additionalProperties: false |  |
| /$defs/scene&#95;3d&#95;vegetation/properties/id | type: string |  |
| /$defs/scene&#95;3d&#95;vegetation/properties/entity&#95;type | type: string; enum: &#91;"specimen","planting"&#93; |  |
| /$defs/scene&#95;3d&#95;vegetation/properties/position |  | #/$defs/point3d |
| /$defs/scene&#95;3d&#95;vegetation/properties/canopy&#95;shape | type: string |  |
| /$defs/scene&#95;3d&#95;vegetation/properties/canopy&#95;radius&#95;m | type: number |  |
| /$defs/scene&#95;3d&#95;vegetation/properties/height&#95;m | type: number |  |
| /$defs/scene&#95;3d&#95;vegetation/properties/crown&#95;bottom&#95;height&#95;m | type: number |  |
| /$defs/scene&#95;3d&#95;vegetation/properties/render&#95;as | type: string; description: Planting render style (only for entity&#95;type: planting). |  |
| /$defs/scene&#95;3d&#95;vegetation/properties/footprint&#95;vertices | type: array |  |
| /$defs/scene&#95;3d&#95;vegetation/properties/footprint&#95;vertices/items |  | #/$defs/point |
| /$defs/scene&#95;3d&#95;neighbor | type: object; required: &#91;"id","footprint&#95;vertices","building&#95;height&#95;m"&#93;; additionalProperties: false |  |
| /$defs/scene&#95;3d&#95;neighbor/properties/id | type: string |  |
| /$defs/scene&#95;3d&#95;neighbor/properties/footprint&#95;vertices | type: array |  |
| /$defs/scene&#95;3d&#95;neighbor/properties/footprint&#95;vertices/items |  | #/$defs/point |
| /$defs/scene&#95;3d&#95;neighbor/properties/ground&#95;elevation&#95;m | type: number |  |
| /$defs/scene&#95;3d&#95;neighbor/properties/building&#95;height&#95;m | type: number |  |
| /$defs/scene&#95;3d&#95;neighbor/properties/roof&#95;type | type: string |  |
| /$defs/scene&#95;3d&#95;neighbor/properties/ridge&#95;height&#95;m | type: number |  |
