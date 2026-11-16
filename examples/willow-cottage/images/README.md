# Willow Cottage pictures

Ten drawings of the worked example in [`../.realm/v2.3/`](../.realm/v2.3/), each drawn from
that model and nothing else. They show what a Realm model can be drawn into; the model is the
source, and a picture says no more than the model records.

The pictures were drawn by the Realm plan and systems renderers of **Archally Pro**, which are
not part of this repository. Every file is a self-contained SVG with no scripts and no external
resources, and its footer states when it was generated, the build label and the schema version
the model declares.

## Site

| File | Answers | Leaves out |
|---|---|---|
| `willow-site.plan.svg` | How the parcel (LP001) is laid out: outdoor zones by kind, the two buildings with their roofs, the boundary runs, the named trees and plantings at their recorded positions, and the neighbouring parcels at the margin in the direction they lie. Numbered markers refer to the index beside the plan. | Individual plants inside a zone: a texture shows the zone's kind (meadow, orchard, vegetable beds, paving), not where each plant stands. Neighbours are cut at the frame. No house systems. |

## Floors of the cottage

| File | Answers | Leaves out |
|---|---|---|
| `Floor-BLD001-FLR001.svg` | The ground floor (FLR001): each room with its name, id and area, the recorded walls, windows and doors, and the stairs to the floor above. | Doors whose swing side or direction is not recorded are listed under the plan, not drawn. No furniture, no house systems. |
| `Floor-BLD001-FLR002.svg` | The first floor (FLR002), in the same way. | As for the ground floor. |

## House systems as schematics

Each schematic answers one question for one family of systems: where does it get its supply,
what does it feed, and what depends on what. Supply is a thick neutral line, connection a thin
neutral line, and flow a medium line in the colour of what it carries, with `cold`, `hot` or
`heat` in its number. Control is dashed and monitoring dotted. An arrow appears only where the
model records a direction. A number refers to the relation index below the drawing.

| File | Family | Leaves out |
|---|---|---|
| `willow-heating.systems.svg` | Heating: the air-source heat pump, the hot water cylinder, the ground-floor manifold, a radiator and the hall thermostat. | Physical positions: the layout is a schematic, not a plan. |
| `willow-water.systems.svg` | Water: the mains supply, the hot water cylinder and the taps it serves, cold and hot. | Physical positions. A pipe run whose route is not recorded stays in the index and is named as unlocated. |
| `willow-electricity.systems.svg` | Electricity: the mains supply, the consumer unit, its circuit protection and what each circuit feeds. | Physical positions. |
| `willow-network.systems.svg` | Network: the fibre line, the study router, the barn access point and the sensors they serve. | Physical positions. |

## House systems on the floors

Each overlay draws the recorded routes of cable runs, pipe runs and wired network links on top
of one floor plan, with the equipment, the risers to other floors and the places where a run
leaves the drawing. Runs that share one recorded path are drawn side by side as lanes; a lane is
a drawing convention, not a separate route. Labels carry the run's id and medium; the key beside
the plan pairs every id with its name and detail.

| File | Floor | Leaves out |
|---|---|---|
| `willow-FLR001.floor-systems.svg` | Ground floor: heating, water, electricity and network runs (18 drawn legs). | Runs with no recorded route. A leg that leaves the building stops at a named continuation. |
| `willow-FLR002.floor-systems.svg` | First floor: heating and water runs from the riser (8 drawn legs). | As for the ground floor. |
| `willow-FLR003.floor-systems.svg` | Barn floor: a network link and a cable run (2 drawn legs). | As for the ground floor. |
