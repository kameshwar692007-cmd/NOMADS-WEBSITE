# Nomad's Province — Production Asset Map & Modular Inventory

**Document Version:** 2.0.0  
**Status:** Extracted, Refined & Ready for Map Implementation  
**Primary Reference:** `images/image 5.png` (Production Ready Asset Source)  
**Composition Target:** `images/image1.png` (Homepage Composition Target)  
**Supporting References:** `images/imadge 2.png`, `images/image 3.png`, `images/image 4.png`  
**Asset Root Directory:** `public/assets/game/`  
**Visual Gallery Utility:** `public/assets-gallery.html`

---

## 1. Directory Structure Overview

All assets have been extracted, alpha-keyed (transparent backgrounds), organized, and verified across 12 modular folders:

```text
public/assets/game/
├── buildings/               (6 HQ buildings — transparent PNGs)
├── terrain/                 (8 seamless terrain tiles — 32×32)
├── paths/                   (12 stone path tiles — 32×32 transparent overlays)
├── water/                   (17 water tiles, animated waterfall, lilypad, duck)
├── cliffs/                  (8 cliff tiers and rocks)
├── structures/              (5 bridges, docks, stone and wood stairs)
├── props/
│   ├── environment/         (26 trees, bushes, flowers, lamps, benches, signs, props)
│   └── event/               (11 tents, canopy, market stall, stage, screen, trophies)
├── characters/
│   ├── player/              (8 sprites — 4 directions × Idle/Walk in 32×48)
│   └── npcs/                (12 campus NPCs in 32×48)
└── ui/
    ├── (16 HUD buttons, cards, joystick, keys, prompts, badges)
    └── location-labels/     (6 floating location pills matching Image 1)
```

**Total Modular Production Assets:** **135 Assets**

---

## 2. Mandatory Buildings (6 Locations)

All buildings are extracted from Section A of `image 5.png`, scaled to match the proportions in Image 1, with dark navy backgrounds removed for transparent overlay onto terrain.

| Asset File | Path | Dimensions | Alpha | Image 1 Mapping / Placement |
| :--- | :--- | :--- | :--- | :--- |
| `main-headquarters.png` | `buildings/main-headquarters.png` | 236 × 144 | Yes | **Top Center** — The grand central palace with platinum walls, crimson banner, and glowing entrance stairs. |
| `esports-arena.png` | `buildings/esports-arena.png` | 198 × 146 | Yes | **Top Right** — Tiered stadium with curved crimson roof, trophy screen, twin crimson flags, and illuminated double doors. |
| `game-dev-studio.png` | `buildings/game-dev-studio.png` | 180 × 138 | Yes | **Top Left** — Modern tech hub with glass skylights, glowing developer workspace, crimson awning, and `</>` monitor. |
| `community-hub.png` | `buildings/community-hub.png` | 228 × 130 | Yes | **Bottom Left** — Cozy cafe bistro with red-tiled roof, warm glowing windows, steaming cup logo, and outdoor dining umbrella. |
| `contact-centre.png` | `buildings/contact-centre.png` | 222 × 144 | Yes | **Bottom Right** — Communications facility with satellite dish antenna, blue portico awning, and glowing inquiry hall. |
| `event-grounds.png` | `buildings/event-grounds.png` | 246 × 133 | Yes | **Bottom Center** — Open-air amphitheater with festival bunting, red canopy stage, stone proscenium, and side stalls. |

---

## 3. Terrain Base Tileset

Extracted from Section B, Row 1. Sliced from the inner core of each tile preview to ensure 100% seamless tiling across the world grid.

| Asset File | Path | Dimensions | Alpha | Visual Role in Image 1 |
| :--- | :--- | :--- | :--- | :--- |
| `grass-01.png` | `terrain/grass-01.png` | 32 × 32 | Solid | Primary campus lawn, lush green base. |
| `grass-02.png` | `terrain/grass-02.png` | 32 × 32 | Solid | Secondary textured grass for natural variety. |
| `grass-flowers.png` | `terrain/grass-flowers.png` | 32 × 32 | Solid | Lawn scatter tile with white and red wild blooms. |
| `dirt.png` | `terrain/dirt.png` | 32 × 32 | Solid | Warm earth patches around gardens and trail borders. |
| `sand.png` | `terrain/sand.png` | 32 × 32 | Solid | Event Grounds arena ground, beach/river shoreline. |
| `stone-path.png` | `terrain/stone-path.png` | 32 × 32 | Solid | Solid cobblestone foundation for building perimeters. |
| `plaza-tile.png` | `terrain/plaza-tile.png` | 32 × 32 | Solid | Platinum stone paving for the central Nomad's Plaza. |
| `plaza-center.png` | `terrain/plaza-center.png` | 32 × 32 | Solid | Ornamental diamond star medallion for plaza center. |

---

## 4. Path & Walkway Network

Extracted from Section C. Sliced and alpha-keyed so pavers overlay seamlessly onto any grass, sand, or plaza base.

| Asset File | Path | Dimensions | Alpha | Visual Role in Image 1 |
| :--- | :--- | :--- | :--- | :--- |
| `path-straight-h.png` | `paths/path-straight-h.png` | 32 × 32 | Yes | Horizontal stone avenues connecting East and West wings. |
| `path-straight-v.png` | `paths/path-straight-v.png` | 32 × 32 | Yes | Vertical boulevards connecting Plaza to Main HQ and Event Grounds. |
| `path-corner-ne.png` | `paths/path-corner-ne.png` | 32 × 32 | Yes | North-to-East 90° walkway turn. |
| `path-corner-nw.png` | `paths/path-corner-nw.png` | 32 × 32 | Yes | North-to-West 90° walkway turn. |
| `path-corner-se.png` | `paths/path-corner-se.png` | 32 × 32 | Yes | South-to-East 90° walkway turn. |
| `path-corner-sw.png` | `paths/path-corner-sw.png` | 32 × 32 | Yes | South-to-West 90° walkway turn. |
| `path-t-north.png` | `paths/path-t-north.png` | 32 × 32 | Yes | 3-way T-junction heading North towards HQ. |
| `path-t-south.png` | `paths/path-t-south.png` | 32 × 32 | Yes | 3-way T-junction heading South towards Event Grounds. |
| `path-t-east.png` | `paths/path-t-east.png` | 32 × 32 | Yes | 3-way T-junction heading East towards Esports Arena. |
| `path-t-west.png` | `paths/path-t-west.png` | 32 × 32 | Yes | 3-way T-junction heading West towards Dev Studio. |
| `path-crossroad.png` | `paths/path-crossroad.png` | 32 × 32 | Yes | 4-way intersection around the central plaza. |
| `plaza-deco.png` | `paths/plaza-deco.png` | 32 × 32 | Yes | Platinum decorative stone accent with warm crimson inlay. |

---

## 5. Water, Cliffs, & Bridges

Extracted from Section B (Row 2) & Section D, with derived 90° rotations and directional corner tiles for map composition.

| Asset File | Path | Dimensions | Alpha | Role |
| :--- | :--- | :--- | :--- | :--- |
| `water-tile.png` | `water/water-tile.png` | 32 × 32 | Solid | Deep animated river and pond water. |
| `water-edge-top.png` | `water/water-edge-top.png` | 32 × 32 | Solid | Shore transition top edge. |
| `water-edge-bottom.png` | `water/water-edge-bottom.png` | 32 × 32 | Solid | Shore transition bottom edge. |
| `water-edge-left.png` | `water/water-edge-left.png` | 32 × 32 | Solid | Shore transition left edge. |
| `water-edge-right.png` | `water/water-edge-right.png` | 32 × 32 | Solid | Shore transition right edge. |
| `water-corner-inner-*.png` | `water/water-corner-inner-(ne,nw,se,sw).png` | 32 × 32 | Solid | 4 inner shoreline turns. |
| `water-corner-outer-*.png` | `water/water-corner-outer-(ne,nw,se,sw).png` | 32 × 32 | Solid | 4 outer shoreline cap corners. |
| `waterfall.png` | `water/waterfall.png` | 88 × 75 | Yes | Cliff waterfall cascading into the lower pond. |
| `lily-pad.png` | `water/lily-pad.png` | 70 × 50 | Yes | Water lilies with pink blossom pads. |
| `duck.png` | `water/duck.png` | 32 × 24 | Yes | Floating campus pond duck. |
| `shore-rock.png` | `water/shore-rock.png` | 32 × 32 | Solid | Half-submerged shoreline boulder. |
| `cliff-top.png` | `cliffs/cliff-top.png` | 32 × 32 | Solid | Upper cliff plateau edge with grass rim. |
| `cliff-middle.png` | `cliffs/cliff-middle.png` | 32 × 32 | Solid | Vertical rock face wall. |
| `cliff-bottom.png` | `cliffs/cliff-bottom.png` | 32 × 32 | Solid | Lower cliff base meeting ground/water. |
| `cliff-corner-*.png` | `cliffs/cliff-corner-(ne,nw,se,sw).png` | 32 × 32 | Solid | 4 cliff boundary turns. |
| `rock.png` | `cliffs/rock.png` | 32 × 32 | Solid | Standalone campus boulder. |
| `bridge-wood.png` | `structures/bridge-wood.png` | 88 × 75 | Yes | Arched timber bridge over the stream. |
| `bridge-stone.png` | `structures/bridge-stone.png` | 98 × 75 | Yes | Platinum stone bridge over the central canal. |
| `dock.png` | `structures/dock.png` | 65 × 55 | Yes | Wooden boat landing pier. |
| `stairs-stone.png` | `structures/stairs-stone.png` | 68 × 55 | Yes | Stone staircase connecting upper terrace to plaza. |
| `stairs-wood.png` | `structures/stairs-wood.png` | 68 × 55 | Yes | Wooden staircase for river trail. |

---

## 6. Environment Props & Campus Landscaping (26 Assets)

Extracted from Section E, Row 1 & 2. Sliced with adaptive Euclidean alpha-keying to preserve foliage highlights.

| Asset File | Path | Dimensions | Category |
| :--- | :--- | :--- | :--- |
| `tree-green-l.png` | `props/environment/tree-green-l.png` | 62 × 56 | Large deciduous shade tree |
| `tree-green-m.png` | `props/environment/tree-green-m.png` | 52 × 54 | Medium park tree |
| `tree-green-s.png` | `props/environment/tree-green-s.png` | 42 × 46 | Small ornamental tree |
| `tree-pink.png` | `props/environment/tree-pink.png` | 66 × 58 | Cherry blossom flowering tree |
| `tree-red.png` | `props/environment/tree-red.png` | 64 × 58 | Crimson autumn maple tree |
| `tree-pine.png` | `props/environment/tree-pine.png` | 36 × 64 | Evergreen pine tree |
| `tree-palm.png` | `props/environment/tree-palm.png` | 52 × 66 | Riverbank palm tree |
| `bush-01.png` | `props/environment/bush-01.png` | 40 × 38 | Round manicured garden bush |
| `bush-02.png` | `props/environment/bush-02.png` | 40 × 38 | Textured dense hedge bush |
| `flower-bed-red.png` | `props/environment/flower-bed-red.png` | 46 × 44 | Crimson rose flower bed |
| `flower-bed-white.png` | `props/environment/flower-bed-white.png` | 44 × 44 | White daisy garden cluster |
| `flower-bed-yellow.png` | `props/environment/flower-bed-yellow.png` | 48 × 44 | Golden marigold planter cluster |
| `bench-wood.png` | `props/environment/bench-wood.png` | 58 × 38 | Timber park bench |
| `bench-metal.png` | `props/environment/bench-metal.png` | 54 × 38 | Platinum metal campus bench |
| `lamp-off.png` | `props/environment/lamp-off.png` | 22 × 42 | Day-state cast iron streetlight |
| `lamp-on.png` | `props/environment/lamp-on.png` | 22 × 42 | Dusk-state illuminated streetlight |
| `banner-pole.png` | `props/environment/banner-pole.png` | 54 × 46 | Crimson Nomad diamond banner |
| `flag-stand.png` | `props/environment/flag-stand.png` | 30 × 46 | Platinum flagpole with pennant |
| `signboard.png` | `props/environment/signboard.png` | 40 × 40 | Wooden campus notice board |
| `direction-sign.png` | `props/environment/direction-sign.png` | 44 × 46 | Multi-direction waypoint signpost |
| `crate.png` | `props/environment/crate.png` | 32 × 36 | Logistics supply crate |
| `barrel.png` | `props/environment/barrel.png` | 28 × 38 | Wooden storage barrel |
| `trash-bin.png` | `props/environment/trash-bin.png` | 30 × 40 | Modern campus recycling station |
| `planter.png` | `props/environment/planter.png` | 56 × 38 | Stone flower box with blossoms |
| `hedge.png` | `props/environment/hedge.png` | 60 × 38 | Trimmed perimeter hedge fence |
| `stone-pillar.png` | `props/environment/stone-pillar.png` | 24 × 48 | Carved stone entrance boundary column |

---

## 7. Event & Tournament Props (11 Assets)

Extracted from Section F.

| Asset File | Path | Dimensions | Role |
| :--- | :--- | :--- | :--- |
| `tent-red.png` | `props/event/tent-red.png` | 66 × 64 | Crimson tournament registration booth |
| `tent-blue.png` | `props/event/tent-blue.png` | 72 × 64 | Navy partner exhibition tent |
| `canopy.png` | `props/event/canopy.png` | 75 × 64 | Striped hospitality pavilion |
| `market-stall.png` | `props/event/market-stall.png` | 84 × 68 | Merchandise & concessions stall |
| `stage-platform.png` | `props/event/stage-platform.png` | 135 × 56 | Main festival entertainment stage |
| `led-screen.png` | `props/event/led-screen.png` | 78 × 52 | 16:9 Jumbotron esports display |
| `speaker.png` | `props/event/speaker.png` | 35 × 52 | PA sound system speaker tower |
| `trophy-display.png` | `props/event/trophy-display.png` | 46 × 54 | Golden championship trophy on velvet |
| `podium.png` | `props/event/podium.png` | 82 × 54 | 1-2-3 tournament winners podium |
| `rope-barrier.png` | `props/event/rope-barrier.png` | 78 × 50 | Velvet rope VIP crowd stanchions |
| `bunting-string.png` | `props/event/bunting-string.png` | 90 × 40 | Festive multicolored triangular pennants |

---

## 8. Player & NPC Character Sprites

Extracted from Sections G & H. Standardized at 32 × 48 pixels with clean transparency preserving retro pixel-art silhouettes and facial details.

### Player Character Sprites (`characters/player/`)
- `player-idle-down.png` — Facing forward / south (32 × 48)
- `player-idle-up.png` — Facing north towards HQ (32 × 48)
- `player-idle-left.png` — Facing west towards Dev Studio (32 × 48)
- `player-idle-right.png` — Facing east towards Esports Arena (32 × 48)
- `player-walk-down.png` — Step frame south (32 × 48)
- `player-walk-up.png` — Step frame north (32 × 48)
- `player-walk-left.png` — Step frame west (32 × 48)
- `player-walk-right.png` — Step frame east (32 × 48)

### Campus NPCs (`characters/npcs/`)
- `npc-event-staff.png` — Official blue cap staff guide
- `npc-developer.png` — Game Dev programmer with glasses
- `npc-organizer.png` — Tournament coordinator with headset
- `npc-partner.png` — Business liaison in smart casual
- `npc-student.png` — Esports academy attendee
- `npc-visitor.png` — General campus tourist
- `npc-security.png` — Guard with peaked uniform cap
- `npc-guide.png` — Campus docent with sun hat
- `npc-media.png` — Press reporter with camera badge
- `npc-team-member.png` — Pro-player team member (pink hair)
- `npc-guest.png` — VIP esports attendee (red cap)
- `npc-speaker.png` — Keynote stage presenter

---

## 9. UI, HUD & Floating Location Labels

Extracted from Sections I & J, plus vector-sharp rendered floating location pills strictly conforming to Image 1's HUD design.

### Floating Location Labels (`ui/location-labels/`)
- `label-main-headquarters.png` (220 × 36) — `[🏛 Main Headquarters]`
- `label-esports-arena.png` (220 × 36) — `[🏆 Esports Arena]`
- `label-game-dev-studio.png` (220 × 36) — `[🎮 Game Dev Studio]`
- `label-community-hub.png` (220 × 36) — `[👥 Community Hub]`
- `label-contact-centre.png` (220 × 36) — `[🎧 Contact Centre]`
- `label-event-grounds.png` (220 × 36) — `[🎪 Event Grounds]`

### HUD Controls & Cards (`ui/`)
- `card-location-preview.png` (220 × 110) — Dark glass preview card modal with buttons
- `button-menu.png` (85 × 32) — Pill menu toggle
- `button-directory.png` (85 × 32) — Directory navigation button
- `button-map.png` (85 × 32) — Campus map view button
- `button-interact-e.png` (50 × 50) — Crimson circular "E" action button
- `joystick-base.png` (70 × 70) — Mobile on-screen thumbstick base
- `joystick-thumb.png` (30 × 30) — Mobile thumbstick knob
- `prompt-interact.png` (80 × 28) — Desktop `[E] Interact` pill
- `prompt-keys.png` (56 × 32) — WASD direction keys indicator
- `minimap-frame.png` (90 × 72) — Rounded campus minimap container
- `badge-about.png`, `badge-events.png`, `badge-esports.png`, `badge-games.png`, `badge-community.png`, `badge-contact.png` (38 × 38 each) — 6 section icon emblems

---

## 10. Synthesized / Recreated Assets Report

1. **Water & Cliff Directional Transitions:**
   - Image 5 provided base vertical edges and inner NW corners.
   - Using lossless 90° rotation and mirroring, full sets of inner and outer NE, NW, SE, SW water corners and directional cliff edges were generated to support complete lake, stream, and terrace perimeters.
2. **Floating Location Plaques:**
   - Synthesized using precise SVG vector rendering matching Image 1's dark pill container (`#16223b` gradient, 1.5px platinum outline `#f1f5f9`, drop shadow, categorical icon, and bold white typography).
3. **Pond Wildlife & Details:**
   - Created `duck.png` and `lily-pad.png` from the water props in Section D, sized for peaceful floating water animations.
4. **Boundary Stone Pillar:**
   - Created `stone-pillar.png` for plaza and road gateway bollards.

---

## 11. Color Palette Adherence

All assets adhere strictly to the Nomad's Province visual identity:
- **Midnight Navy:** `#091226` / `#0f172a` (Shadows, roofs, UI cards, water depth)
- **Deep Navy:** `#1e1b4b` / `#16223b` (Secondary shading and container fills)
- **Platinum Silver:** `#e2e8f0` / `#f8fafc` (Architectural stone walls, path bevels, UI borders)
- **Crimson Red:** `#c83246` / `#dc2626` (Banners, flags, stage drapery, interactive buttons)
- **Warm Golden Light:** `#f59e0b` / `#fbbf24` (Window glow, lamp illumination, stage lights)
- **Natural Foliage:** `#22c55e` / `#16a34a` (Lush grass lawns, tree canopies, hedges)

---

## 12. Readiness for Map Implementation

- **Asset Integrity:** All 135 files exist, load without errors, and have verified transparent alphas.
- **Build Status:** `npm run build` succeeds cleanly.
- **Gallery Verification:** `public/assets-gallery.html` enables visual confirmation of every sprite.
- **Next Step:** When instructed, Phase 2 will construct the single connected campus world in `CanvasGame.tsx` matching Image 1's layout.
