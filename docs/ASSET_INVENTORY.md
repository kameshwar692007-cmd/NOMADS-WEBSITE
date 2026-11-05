# Nomad's Province — Game Asset Inventory & Architecture Specification

**Document Version:** 1.0.0  
**Status:** Approved & Implemented  
**Asset Origin:** Official Kenney Tiny Town Pack (v1.1)  
**Primary Source:** [https://kenney.nl/assets/tiny-town](https://kenney.nl/assets/tiny-town)  
**License:** Creative Commons Zero (CC0 1.0 Universal) — Public Domain  
**Target Installation Path:** `public/assets/game/`  

---

## 1. Provenance, Verification & Integrity

The assets were sourced directly from the official Kenney release page using the verified signed API distribution endpoint:

| Attribute | Specification |
| :--- | :--- |
| **Package Name** | Kenney Tiny Town (1.1) |
| **Creator / Distributor** | Kenney ([kenney.nl](https://kenney.nl)) |
| **Release / Creation Date** | 11-01-2023 |
| **Acquisition Mode** | Automated signed-link acquisition (`kenney.nl/download-link/6173736574732f74696e792d746f776e`) |
| **Archive Hash & Size** | 182,243 bytes (`tiny-town.zip`) |
| **Individual Slice Tiles** | 132 PNG tiles (`tile_0000.png` through `tile_0131.png`) |
| **Master Spritesheets** | `tilemap_packed.png` (192 × 176 px, 0px margin/padding)<br>`tilemap.png` (203 × 186 px, 1px tile separation) |
| **Native Tile Resolution** | 16 × 16 pixels per tile |
| **Color Depth / Format** | 8-bit Indexed Color PNG with Alpha Transparency (`tRNS`) |
| **Reference Samples** | `Preview.png` (918 × 515 px), `Sample.png` (918 × 515 px) |

---

## 2. Legal Clearance & Retained License

The asset pack is licensed under **Creative Commons Zero (CC0 1.0 Universal)**.

### Retained License Text (`License.txt`):
```text
Tiny Town (1.1)

Created/distributed by Kenney (www.kenney.nl)
Creation date: 11-01-2023

------------------------------

License: (Creative Commons Zero, CC0)
http://creativecommons.org/publicdomain/zero/1.0/

This content is free to use in personal, educational and commercial projects.
Support us by crediting Kenney or www.kenney.nl (this is not mandatory)

------------------------------

Donate:   http://support.kenney.nl
Patreon:  http://patreon.com/kenney/

Follow on Twitter for updates:
http://twitter.com/KenneyNL
```

- **Commercial Use:** Permitted without restriction.
- **Royalty Obligations:** $0.00 (Free public domain dedication).
- **Attribution:** Not legally mandated under CC0, but preserved in game credits and documentation.
- **Modification:** Full rights to recolor, shader-modulate, normal-map, slice, and procedurally blend.

---

## 3. Art Direction Alignment: Cinematic Top-Down RPG

*Nomad's Province* adheres to a top-down RPG perspective enhanced with hybrid cinematic lighting. Every tile from the Tiny Town collection maps into the four foundational visual pillars:

```
+---------------------------------------------------------------------------------+
|                       NOMAD'S PROVINCE ART DIRECTION PALETTE                    |
+------------------------+------------------------+-------------------------------+
| Natural Warm Env       | Deep Navy Shadows      | Platinum Detailing | Crimson  |
| #84c669 (Grass Base)   | #262b44 (Ambient Shd)  | #c0cbdc (Bright)   | #e84537  |
| #eaa56c (Warm Earth)   | #3f2631 (Line/Occl)    | #8b9bb4 (Midtone)  | #c34b35  |
| #fdbe53 (Golden Leaf)  | #52607c (Shaded Slate) | #5a6988 (Shadow)   | #763b36  |
+------------------------+------------------------+-------------------------------+
```

1. **Natural Warm Environment:**
   - Ground cover uses warm yellow-green tones (`#84c669`, `#8bd87d`) paired with rich terracotta and sun-baked loam trails (`#eaa56c`, `#fec99c`).
2. **Deep Navy Shadows:**
   - Crevices, ground occlusions, water depths, and building undercuts use deep indigo/navy undertones (`#262b44`, `#3f2631`) rather than flat black, creating rich atmospheric depth.
3. **Platinum Architectural Detailing:**
   - Civics, bastions, plinths, and quoin borders are sculpted using platinum stone values (`#c0cbdc`, `#8b9bb4`, `#5a6988`), conveying advanced craftsmanship and prestige.
4. **Crimson Signage & Highlights:**
   - Market canopies, guild flags, signpost pennants, and roof dormers employ high-contrast crimson (`#e84537`, `#c34b35`, `#ff706d`) to guide player wayfinding and signify faction presence.

---

## 4. Complete Categorized Asset Inventory

The 132 individual tiles (12 columns × 11 rows in `tilemap_packed.png`) are cataloged below by subsystem:

### A. Grass & Base Terrain (4 Tiles)
| Tile ID | File | Description | In-Game Role |
| :--- | :--- | :--- | :--- |
| `000` | `tile_0000.png` | Smooth Grass Turf | Flat green background base layer |
| `001` | `tile_0001.png` | Textured Grass Turf | Micro-detail tufts break visual repetition |
| `002` | `tile_0002.png` | Wildflower Meadow | Wildflower accent meadows, pastoral zones |
| `043` | `tile_0043.png` | Shoreline Grass Rim | Boundary between turf and water/canals |

### B. Roads, Pathways & Cobblestone (26 Tiles)
| Tile ID Range | Files | Description | In-Game Role |
| :--- | :--- | :--- | :--- |
| `012`–`014` | `tile_0012` to `tile_0014` | Dirt Path North Borders | Northern transitions (top-left, straight, top-right) |
| `024`–`026` | `tile_0024` to `tile_0026` | Dirt Path Center & Flanks | Left edge, solid loam path center (`0025`), right edge |
| `036`–`038` | `tile_0036` to `tile_0038` | Dirt Path South Borders | Southern transitions (bottom-left, straight, bottom-right) |
| `039`–`042` | `tile_0039` to `tile_0042` | Dirt Path Inner Corners | 90° concave intersections and bend tiles |
| `096`–`098` | `tile_0096` to `tile_0098` | Cobblestone North Borders | Platinum paved avenue north edges |
| `099`–`101` | `tile_0099` to `tile_0101` | Cobblestone Core & Flanks | Platinum paved street flank & solid center (`0100`) |
| `102` | `tile_0102.png` | Cobblestone South-West | Bottom-left corner curb |
| `108`–`110` | `tile_0108` to `tile_0110` | Cobblestone South Edge & Core | South border straight, smooth plaza core (`0109`), south-east curb (`0110`) |
| `120`–`122` | `tile_0120` to `tile_0122` | Cobblestone Inner Turns | Plaza junctions and alleyway turns |

### C. Buildings & Architecture (32 Tiles)
| Tile ID Range | Files | Description | In-Game Role |
| :--- | :--- | :--- | :--- |
| `048`–`051` | `tile_0048` to `tile_0051` | Slate Roof Apexes & Chimney | Deep navy/slate roof ridges, corners, and stone chimney |
| `060`–`063` | `tile_0060` to `tile_0063` | Slate Roof Slopes & Dormer | Main navy roof pitch, eaves, and dormer attic window |
| `052`–`055` | `tile_0052` to `tile_0055` | Crimson Roof Apexes & Chimney | Crimson terracotta roof crests, corners, and brick chimney |
| `064`–`067` | `tile_0064` to `tile_0067` | Crimson Roof Slopes & Dormer | Crimson roof pitches, eaves, and dormer attic window |
| `072`–`075` | `tile_0072` to `tile_0075` | Timber Plank Wall Modules | Solid timber wall, glass window wall, entry door, corner post |
| `076`–`079` | `tile_0076` to `tile_0079` | Platinum Stone Wall Modules | Ashlar stone wall, arched window wall, grand arch portal, stone quoin pillar |
| `084`–`087` | `tile_0084` to `tile_0087` | Timber Foundation Modules | Ground sill beams, wooden doorstep, corner footings |
| `088`–`091` | `tile_0088` to `tile_0091` | Platinum Stone Plinths | Heavy fortress plinths, stone entry threshold, ashlar base courses |

### D. Trees, Foliage & Landscaping (26 Tiles)
| Tile ID Range | Files | Description | In-Game Role |
| :--- | :--- | :--- | :--- |
| `004`–`006` | `tile_0004` to `tile_0006` | Green Deciduous Crowns | Upper canopy peaks of deciduous oak/elm trees |
| `016`–`018` | `tile_0016` to `tile_0018` | Green Tree Body & Trunk | Mid-canopy foliage flanks and rooted timber trunk |
| `007`, `008`, `019`, `020` | `tile_0007`, `0008`, `0019`, `0020` | Conifer Evergreen Pines | Small compact pine (`007`), tall conifer crown (`019`), trunk base (`020`) |
| `003`, `015`, `021`, `023` | `tile_0003`, `0015`, `0021`, `0023` | Golden/Autumn Deciduous | Warm autumn canopy crown, flanks, and trunk base |
| `009`–`011`, `022` | `tile_0009` to `tile_0011`, `0022` | Golden/Autumn Conifers | Autumn evergreen conifer tip, body, and full tree |
| `028`, `030`–`032` | `tile_0028`, `0030` to `0032` | Green Garden Shrubs | Round manicured shrubs, small bushes, hedges |
| `027`, `033`–`035` | `tile_0027`, `0033` to `0035` | Golden Garden Shrubs | Amber border hedges, ornamental shrubs |

### E. Props, Civics & Town Infrastructure (34 Tiles)
| Tile ID Range | Files | Description | In-Game Role |
| :--- | :--- | :--- | :--- |
| `044`–`047`, `056`–`059` | `tile_0044`–`047`, `056`–`059` | Wooden Fencing & Gates | Paddock fences, boundary perimeters, latch gates |
| `068`–`071` | `tile_0068` to `tile_0071` | Platinum Masonry Walls | Low boundary stonework, decorative parapet walls |
| `029`, `094` | `tile_0029`, `tile_0094` | Crimson Market Stalls | Bazaar stall with crimson canopy, sales counter |
| `093`, `095` | `tile_0093`, `tile_0095` | Market Table & Guild Banner | Goods display table, crimson guild banner post |
| `080`–`083` | `tile_0080` to `tile_0083` | Cargo Crates & Barrels | Shipping boxes, stacked crates, oak barrels, store groups |
| `092` | `tile_0092.png` | Logistics Handcart | Two-wheeled freight cart for caravan logistics |
| `103`, `104` | `tile_0103`, `tile_0104` | Stone Water Well | Cistern curb and bucket winch mechanism |
| `105`, `106` | `tile_0105`, `tile_0106` | Civics (Streetlamp & Bench) | Ornate platinum streetlamp, civic town bench |
| `107` | `tile_0107.png` | Civic Fountain | Central town fountain reservoir & pedestal |
| `115`–`119` | `tile_0115` to `tile_0119` | Monuments & Bollards | Milestone rune pillar, hanging lamp, monument plinth, urn, stone bollard |
| `127`–`129` | `tile_0127` to `tile_0129` | Mill / Waterwheel Hub | Rotary machinery timber blades and axle gearbox |

### F. Waterways, Canals & Bridges (10 Tiles)
| Tile ID Range | Files | Description | In-Game Role |
| :--- | :--- | :--- | :--- |
| `111`–`113` | `tile_0111` to `tile_0113` | Northern Canal Embankment | Water bank top-left, straight northern shore, top-right |
| `114` | `tile_0114.png` | Deep Flowing Water | Open water tile for streams and rivers |
| `123`, `124` | `tile_0123`, `tile_0124` | Lateral Canal Embankments | West and east water bank walls |
| `125`, `126` | `tile_0125`, `tile_0126` | Deep Canal Basin & Ripples | Deep navy water basin and wave ripple variations |
| `130`, `131` | `tile_0130`, `tile_0131` | Timber Canal Bridge | Shoreline bridge abutment (`130`), timber bridge crossing (`131`) |

---

## 5. Character Sprites Assessment & Fallback Strategy

### Asset Pack Scope Analysis:
Kenney's **Tiny Town (v1.1)** pack is an **environment, architecture, and town-planning tileset** containing 132 environmental and architectural tiles. In accordance with Kenney's modular ecosystem design, humanoid character sprites are distributed in the companion packs (*Tiny Dungeon* and *Tiny Battle*, linked in `Tiny Dungeon (base pack).url`).

### Game Implementation Fallback Strategy:
To deliver immediate, production-ready gameplay without requiring manual user downloads or violating art direction:
1. **Procedural Nomad Hero Sprite Generator:** A dedicated procedural 16×16 pixel canvas generator renders the official *Nomad's Province* protagonist:
   - **Tunic & Cowl:** Crimson field cloak (`#e84537`) with shaded folds (`#763b36`).
   - **Armor Accents:** Platinum pauldrons and clasp (`#c0cbdc`, `#8b9bb4`).
   - **Trousers & Boots:** Deep navy trail trousers (`#262b44`, `#3f2631`).
   - **Gait / Stance:** 4-directional idle and walk frame configurations matching the exact 16×16 tile grid.
2. **Phaser & React Graphics Fallback:** Embedded canvas graphics pipeline provides complete zero-dependency rendering for hero navigation, collision bounds, and interaction indicators.

---

## 6. Official Asset Mapping for the Connected Headquarters Campus

Nomad's Province features **ONE continuous, explorable campus map (44 × 32 tiles)** centered around a grand crossroads plaza. Each of the six official provincial facilities is situated within this connected world, connected by cobblestone avenues and earthen pathways:

```
+===================================================================================+
|           NOMAD'S PROVINCE: CONNECTED HEADQUARTERS CAMPUS ARCHITECTURE            |
+===================================================================================+
| 1. MAIN HEADQUARTERS      | Section: About (North Central Bastion)                |
| 2. ESPORTS ARENA          | Section: Esports and tournaments (North-East Stadium) |
| 3. GAME DEV STUDIO        | Section: Games and projects (North-West Foundry)      |
| 4. EVENT GROUNDS          | Section: Events (South-East Festival Pavilion)        |
| 5. COMMUNITY HUB          | Section: Community and collaborations (South-West)    |
| 6. CONTACT CENTRE         | Section: Contact and partnerships (South Reception)   |
+-----------------------------------------------------------------------------------+
```

### 1. Main Headquarters — Section: About
- **Coordinates & Door:** `(x: 22, y: 7)` | Interaction Zone: `(x: 19–25, y: 6–9)`
- **Architectural Identity:** Symmetrical ashlar platinum masonry (`tile_0076`, `0079`), grand double entry portals (`tile_0078`), deep navy slate roofs (`tile_0048`–`0050`, `0060`–`0063`), and ashlar fortress plinths (`tile_0088`–`0091`).
- **Forecourt & Details:** Platinum decorative urns (`tile_0118`), streetlamps (`tile_0105`), and crimson provincial guidons (`tile_0095`).
- **Function:** Houses executive administration, founding history, governance charter, and provincial legacy.

### 2. Esports Arena — Section: Esports and tournaments
- **Coordinates & Door:** `(x: 35, y: 7)` | Interaction Zone: `(x: 31–38, y: 6–9)`
- **Architectural Identity:** Grand tournament stadium with crimson terracotta roof pitches (`tile_0052`–`0055`, `0064`–`0067`), wide spectator archways (`tile_0078`), platinum quoin towers (`tile_0079`), and paved avenue approaches (`tile_0100`).
- **Forecourt & Details:** Championship trophy plinths (`tile_0117`), tournament banners (`tile_0095`), and outdoor arena illumination.
- **Function:** Headquarters for competitive team rosters, match brackets, tournament schedules, and live broadcasts.

### 3. Game Development Studio — Section: Games and projects
- **Coordinates & Door:** `(x: 8, y: 7)` | Interaction Zone: `(x: 5–12, y: 6–9)`
- **Architectural Identity:** High-tech creative studio combining platinum ashlar facades (`tile_0076`, `0077`) with slate and crimson roofs, engineering flues (`tile_0051`), and studio entrance door (`tile_0078`).
- **Forecourt & Details:** Rotary machinery / waterwheel power hub (`tile_0127`–`0129`), technical cargo wagons (`tile_0092`), milestone pillars (`tile_0115`), and streetlamps (`tile_0105`).
- **Function:** Creative engineering hub for interactive titles, canvas game prototypes, toolchains, and modding SDKs.

### 4. Event Grounds — Section: Events
- **Coordinates & Door:** `(x: 35, y: 24)` | Interaction Zone: `(x: 31–39, y: 22–26)`
- **Architectural Identity:** Open-air festival grounds featuring timber & stone pavilion backdrops (`tile_0076`, `0078`), crimson awning kiosks (`tile_0029`, `0094`), and open cobblestone staging areas (`tile_0100`).
- **Forecourt & Details:** Event cargo crates (`tile_0080`, `0081`), refreshment barrels (`tile_0082`, `0083`), festive banners (`tile_0095`), and perimeter lamps.
- **Function:** Open-air venue hosting LAN conventions, community showmatches, creator exhibitions, and watch parties.

### 5. Community Hub — Section: Community and collaborations
- **Coordinates & Door:** `(x: 8, y: 24)` | Interaction Zone: `(x: 5–12, y: 22–26)`
- **Architectural Identity:** Warm timber plank walls (`tile_0072`, `0073`), welcoming wooden entrance door (`tile_0074`), timber sills (`tile_0084`–`0087`), and terracotta gables (`tile_0052`–`0054`, `0064`–`0067`).
- **Courtyard & Details:** Freshwater well (`tile_0103`, `0104`), civic resting benches (`tile_0106`), lush wildflower meadows (`tile_0002`), and boundary fencing (`tile_0044`–`0046`).
- **Function:** Gathering space for content creators, guild ambassadors, collegiate chapters, and collaborative initiatives.

### 6. Contact Centre — Section: Contact and partnerships
- **Coordinates & Door:** `(x: 22, y: 26)` | Interaction Zone: `(x: 19–25, y: 24–28)`
- **Architectural Identity:** Symmetrical reception lodge with platinum ashlar trim (`tile_0076`–`0079`), deep navy slate roofs (`tile_0048`–`0050`, `0060`–`0063`), and polished threshold steps (`tile_0089`).
- **Forecourt & Details:** Milestone pillars (`tile_0115`), stone barrier bollards (`tile_0119`), and approach streetlamps (`tile_0105`).
- **Function:** Communications gateway for corporate partnerships, roster scouting tryouts, press inquiries, and player support.

---

## 7. Technical Engine Integration Guidelines

### Slicing & Coordinates (`tilemap_packed.png`):
- Width: `192px` (12 columns × 16px)
- Height: `176px` (11 rows × 16px)
- Individual tile index formula:
  $$\text{col} = \text{index} \pmod{12}, \quad \text{row} = \lfloor \text{index} / 12 \rfloor$$
  $$x = \text{col} \times 16, \quad y = \text{row} \times 16$$

### Phaser 3 Configuration:
```javascript
// Preload packed tilesheet
this.load.spritesheet('tiny_town', 'assets/game/Tilemap/tilemap_packed.png', {
  frameWidth: 16,
  frameHeight: 16,
  margin: 0,
  spacing: 0
});

// Configure nearest-neighbor pixel-art rendering
this.game.scale.defaultFilter = Phaser.Textures.NEAREST;
```

### Tilemap Layer Depth Standard:
1. `Depth -10`: Deep Water (`tile_0114`) & Canal Basins (`tile_0125`).
2. `Depth 0`: Ground Terrain (`tile_0000`, `tile_0025`, `tile_0100`).
3. `Depth 10`: Roads, Edges, Shorelines, Cobble Curbs.
4. `Depth 20`: Building Foundations, Plinths, Low Fences.
5. `Depth 30`: Walls, Doors, Windows, Benches, Crates, Carts.
6. `Depth 40`: Entities (Player, NPCs, Dynamic Shadows).
7. `Depth 50`: Roof Slopes, Eaves, Tree Canopies, Overhangs (Y-sorted for depth occlusion).
8. `Depth 60`: Chimneys, Roof Apexes, Weather Vanes.
9. `Depth 100`: Hybrid Cinematic Lighting Overlay (Navy ambient tint `#262b44` with multiply blend, warm radial spotlights `#fff0d0`).

---

## 8. Verification & Application Readiness

- [x] Official asset archive fetched and verified from `kenney.nl`.
- [x] Unpacked into `public/assets/game/` (132 individual tiles + master sheets + license).
- [x] Retained `License.txt` and verified CC0 public domain status.
- [x] Complete inventory categorized across 6 domain pillars.
- [x] Architectural blueprint defined for all 6 strategic Headquarters.
- [x] Interactive web application updated to demonstrate live tile loading, interactive HQ scene explorer, and pixel art inspector.
