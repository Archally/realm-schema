# Willow Cottage - garden care

> Generated from a Realm model: 145 entities, 444 relations, 5 planes, Realm schema v2.2.0. 4 specimens, 3 plantings, 2 care profiles, 2 soil profiles.

**Willow Cottage, Brackwater Lane, Nether Hollowby, South West England, England**

## Zones

### Willow Cottage smallholding (LP001)

| Zone | Name | Type | Area | Sun | Slope | Soil | Growing |
|---|---|---|---|---|---|---|---|
| OZ001 | Drive | driveway | 69.9 m2 | full-sun | 12.2% S | - | nothing recorded |
| OZ002 | Front garden | lawn | 210 m2 | full-sun | 12.9% S | - | 1 specimens, 1 plantings |
| OZ003 | South terrace | terrace | 44 m2 | full-sun | 14.2% S | - | nothing recorded |
| OZ004 | Orchard | orchard | 230 m2 | full-sun | 12.4% S | - | 2 specimens |
| OZ005 | Vegetable garden | vegetable-garden | 159 m2 | full-sun | 14.2% S | SOIL001 | 2 plantings |
| OZ006 | Lower meadow | meadow | 177.5 m2 | partial-sun | 13.9% S | SOIL002 | 1 specimens |
| OZ007 | Barn forecourt | gravel-area | 38.3 m2 | partial-sun | 11.5% S | - | nothing recorded |
| OZ008 | Compost corner | compost-area | 36 m2 | partial-shade | 14.2% S | - | nothing recorded |

## Plantings and specimens

### Specimens (4)

| Specimen | Name | Species | Zone | Size | Condition | Protected | Care profile |
|---|---|---|---|---|---|---|---|
| SPM001 | The willow | Salix alba | Lower meadow (OZ006) | 14 m, canopy r 6.5 m, trunk 62 cm | healthy | yes | Deciduous hedge and willow (SCP002) |
| SPM002 | Lane oak | Quercus robur | Front garden (OZ002) | 17.5 m, canopy r 8 m, trunk 88 cm | healthy | yes | - |
| SPM003 | Bramley apple | Malus domestica | Orchard (OZ004) | 5.2 m, canopy r 3.4 m, trunk 24 cm | healthy | - | Apple - standard, cooking (SCP001) |
| SPM004 | Conference pear | Pyrus communis | Orchard (OZ004) | 4.1 m, canopy r 2.2 m, trunk 16 cm | stressed | - | - |

### Plantings (3)

| Planting | Name | Species | Zone | Size | Sun | Water | Care profile |
|---|---|---|---|---|---|---|---|
| PTG001 | Beech hedge | Fagus sylvatica | Front garden (OZ002) | 34, 150-185 cm, spaced 40 cm | full-sun | moderate | Deciduous hedge and willow (SCP002) |
| PTG002 | Raised vegetable beds | - | Vegetable garden (OZ005) | 4 | full-sun | high | - |
| PTG003 | Herb strip | - | Vegetable garden (OZ005) | - | full-sun | low | - |

## Soil

| Profile | Name | Zone | Type | pH | Measured | Organic matter | Drainage |
|---|---|---|---|---|---|---|---|
| SOIL001 | Upper slope loam | Vegetable garden (OZ005) | loam | 6.4 | 2026-03-10 | 6.2% | good |
| SOIL002 | Lower meadow silt | Lower meadow (OZ006) | silt | 6.9 | 2026-03-10 | 9.1% | poor |

### Amendments for Upper slope loam (SOIL001)

| Amendment | Type | Purpose | Months | Dosage | Frequency |
|---|---|---|---|---|---|
| Garden compost | compost | Feed and structure | 10, 11 | - | Every autumn, once the beds are cleared |
| Leaf mould | bark-mulch | Surface mulch, moisture retention | 3, 4 | - | Every spring, from the leaf cage |

## Care calendar

### January

Nothing scheduled.

### February

| Species | Activity | What | Applies to |
|---|---|---|---|
| Apple | pruning | Winter prune while fully dormant - open the centre. | SPM003 |

### March

| Soil | Amendment | Dosage | Purpose |
|---|---|---|---|
| Upper slope loam (SOIL001) | Leaf mould | - | Surface mulch, moisture retention |

### April

| Soil | Amendment | Dosage | Purpose |
|---|---|---|---|
| Upper slope loam (SOIL001) | Leaf mould | - | Surface mulch, moisture retention |

### May

| Species | Activity | What | Applies to |
|---|---|---|---|
| Apple | fertilizing | Top dress with compost once blossom has set. | SPM003 |

### June

Nothing scheduled.

### July

Nothing scheduled.

### August

| Species | Activity | What | Applies to |
|---|---|---|---|
| Beech | hedge-trim | Trim after the birds have finished nesting. | PTG001, SPM001 |

### September

**Apple**: Pick when the stalk parts with a lift and a twist.

### October

| Soil | Amendment | Dosage | Purpose |
|---|---|---|---|
| Upper slope loam (SOIL001) | Garden compost | - | Feed and structure |

### November

| Species | Activity | What | Applies to |
|---|---|---|---|
| Beech | mulching | Mulch the base once the leaf has dropped. | PTG001, SPM001 |

| Soil | Amendment | Dosage | Purpose |
|---|---|---|---|
| Upper slope loam (SOIL001) | Garden compost | - | Feed and structure |

### December

Nothing scheduled.

### Threats with no months recorded

These are known to the model but state no `risk_months`, so no month above claims them.

| Species | Threat | Type | Prevention |
|---|---|---|---|
| Apple | Apple scab | disease-fungal | - |
| Apple | Codling moth | pest | - |
| Apple | European canker | disease-fungal | - |
| Beech | Beech aphid | pest | - |
| Beech | Drought stress on thin soil | environmental | - |

## Biomass

| Flow | Name | Source | Process | Output | From | Processed at | To | Annual volume | Season |
|---|---|---|---|---|---|---|---|---|---|
| BMF001 | Autumn leaf fall to leaf mould | leaf-fall | composting | leaf-mold | Lane oak (SPM002) | Compost corner (OZ008) | Vegetable garden (OZ005) | 3 cubic-meters | 10, 11, 12 |
