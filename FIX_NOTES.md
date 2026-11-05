# Nomad's Province — Homepage Rescue Fix

## What changed
- Replaced the visually inconsistent reconstructed tilemap with the approved campus artwork as the authored game world.
- Preserved real player movement, collisions, proximity interaction, click-to-travel, camera following, directory/map travel, and React routing.
- Desktop zoom now auto-fits the whole campus instead of hardcoding 2.5x magnification.
- Camera clamps correctly when the complete map fits inside the viewport.
- Player is rendered smaller (24x36) for a cleaner retro scale.
- Location click areas, entrances, collision footprints, spawn point, and auto-travel waypoints were remapped to the approved artwork.
- Header styling was reduced so it does not duplicate the artwork's large brand treatment.

## Run
npm install
npm run dev

## Important
The build could not be re-run inside the Linux sandbox because the uploaded ZIP contained Windows node_modules and reinstalling dependencies exceeded the sandbox command window. Plain JavaScript game/data/system modules passed `node --check`. Run `npm install` once locally before `npm run dev`.
