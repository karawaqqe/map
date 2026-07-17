# Project Index

Indexed at: 2026-07-17T14:59:00Z
Commit: 09f5b0cd1d2dd56544f6522cc9a2d39cca0bf639

## Overview

This is a Vite React map application. It renders an interactive fantasy world map, continent maps, region/city maps, a Spindel shrine flow, a Spindel room/book experience, atmosphere effects, route transitions, and audio consent handling.

## Commands

- `npm run dev` starts the Vite dev server.
- `npm run build` creates the production bundle.
- `npm run lint` runs ESLint over the project.
- `npm run preview` serves the built bundle.

## Entry Points

- `index.html` contains the Vite HTML root.
- `src/main.jsx` mounts React into `#root`, wraps the app in `BrowserRouter`, and imports global SCSS.
- `src/App.jsx` defines all routes with lazy-loaded pages and renders the global `AudioConsentGate`.

## Routes

- `/` renders `src/pages/WorldMap/WorldMap.jsx`.
- `/eiridor` renders `src/pages/Eiridor/Eiridor.jsx`.
- `/holy-light` renders `src/pages/HolyLight/HolyLight.jsx`.
- `/shrine` renders `src/pages/Shrine/Shrine.jsx`.
- `/spindel` and `/spindel/room` render `src/pages/Spindel/Spindel.jsx`.
- `/spindel/edar-voss-journal` renders `src/pages/Spindel/SpindelBookSection.jsx`.
- `/region/:regionId` renders `src/pages/RegionMap/RegionMap.jsx` with Eiridor parent navigation.
- `/holy-light/region/:regionId` renders `src/pages/RegionMap/RegionMap.jsx` with Holy Light parent navigation.
- `/city/:cityId` renders `src/pages/CityMap/CityMap.jsx`.
- `/void` renders `src/pages/Void/Void.jsx` outside the shared layout.

## Core Structure

- `src/components/Layout/Layout.jsx` wraps nested routes, controls the map legend, and listens for `map-route-transition` events to drive `FogTransition`.
- `src/components/FogTransition/FogTransition.jsx` renders route transition visuals.
- `src/components/AudioConsentGate/AudioConsentGate.jsx` handles the browser audio-permission interaction.
- `src/pages/WorldMap/WorldMap.jsx` renders the top-level SVG world map, continent hitboxes, quality settings, clouds, birds, wind, snow, and ambient audio.
- `src/pages/Eiridor/Eiridor.jsx` renders the Eiridor continent map using `src/data/eiridor.js`.
- `src/pages/HolyLight/HolyLight.jsx` renders the Holy Light continent map using `src/data/holylight.js`.
- `src/pages/RegionMap/RegionMap.jsx` renders zoomable/pannable region maps, tiled map surfaces, markers, atmosphere, and quality controls.
- `src/pages/Shrine/Shrine.jsx` renders the Spindel shrine scene and dialogue interaction.
- `src/pages/Spindel/Spindel.jsx`, `src/pages/Spindel/SpindelRoom.jsx`, and `src/pages/Spindel/SpindelBookSection.jsx` render Spindel map/room/book experiences.

## Data Modules

- `src/data/continents.js` defines world map dimensions, continent layers, audio, cloud assets, bird assets, and world map assets.
- `src/data/eiridor.js` defines Eiridor map dimensions and region layer metadata.
- `src/data/holylight.js` defines Holy Light map dimensions and region layer metadata.
- `src/data/spindel.js` defines Spindel map layers, building layers, room assets, fog particles, interactable castle frame, and Spindel audio assets.
- `src/data/generatedHitboxes.js` stores generated SVG path hitboxes for clickable map regions.
- `src/data/spindelJournal.js` stores the journal/book content.
- `src/data/dialogues/statueDialogue.js` stores shrine statue dialogue content.
- `src/data/locations.js` and `src/data/regions.js` are currently placeholder-style modules.

## Shared Utilities And Constants

- `src/constants/routeTransition.js` exports `ROUTE_TRANSITION_EVENT`, currently `map-route-transition`.
- `src/utils/mapHitbox.js` can build SVG hitbox paths from image alpha data in the browser.
- `src/hooks/useSessionDialogMemory.js` stores dialogue state for the active browser session.

## Styling

- The source styling convention is SCSS modules beside each component/page.
- Compiled `.module.css` and `.module.css.map` files are checked in beside the SCSS files.
- Global styles live in `src/styles/main.scss` and variables in `src/styles/variables.scss`, with compiled CSS/map outputs also present.

## Asset Layout

- `img/globalmap` contains the world map image.
- `img/continents` contains continent and region map artwork, including cropped versions and tiled Lyumeris assets.
- `img/cubes` contains layered continent/city map pieces for Eiridor, Holy Light, and Spindel.
- `img/places/spindel_room` contains Spindel room layer art.
- `img/books/spindel/voss_journal/book_assets` contains book and document assets for the journal.
- `img/clouds`, `img/particles`, `img/bird`, and `img/herbs` contain atmosphere and icon-like raster assets.
- `svg` contains map icons, crests, churches, bars, forges, markets, monastery symbols, and info-panel icons.
- `sounds` contains ambient music, wind, bird, blizzard, shrine/cave, and UI sounds.
- `videos` contains visual effect test videos.

## Notes For Future Work

- Do not hand-edit `src/data/generatedHitboxes.js` unless intentionally replacing generated hitbox paths.
- Prefer editing SCSS source files first; compiled CSS files are present and may need regeneration if the project relies on committed compiled styles.
- Route transitions should go through `ROUTE_TRANSITION_EVENT` so the shared layout can coordinate the close/open animation.
- Audio playback often depends on user interaction; check `AudioConsentGate` and page-level audio effects before changing sound behavior.
- Many visible labels in `Layout.jsx` appear mojibaked; preserve or fix deliberately rather than making incidental encoding changes.
