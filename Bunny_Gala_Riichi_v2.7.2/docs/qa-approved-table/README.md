# Approved atlases / rose-gold table integration

Based on `codex/clear-table-scene` at 8f2169f95a002a0215dc5635cb1bcca08f2e8271.

The four existing atlases and peacock image remain unchanged. The V11 `docs/art-previews/full-table-fixed-v11/empty-plate.png` is copied byte-for-byte to `client/public/art/empty-plate.png`. The same calibrated broad-table projection drives DOM hit targets and WebGL tiles. This is an art-fitted camera, not a physical 60-degree camera.

The runtime table uses `gala-table-rose-gold.png`, a separate material refinement of the retained V11 plate: soft rose-gold outer rim and ornament lines, with the old central black pocket removed for the new hub. The original `empty-plate.png` and all atlas PNGs remain unchanged.

The actual App now uses a four-seat round hub with live scores, seat/turn state, remaining tiles, honba and pot. Chi choices are anchored above a single Chi confirmation button. The prior result-sheet and four-way settlement components are retained and use the existing atlas-backed MiniTile. The result overlay owns pointer events independently of the gameplay control rail.

These screenshots come from the actual client and Socket.IO server using deterministic legal 136-tile QA fixtures, not the old abstract ART board. Late-river and four-meld fixtures have zero DOM intersections with the hub. The iPhone-size check is Chromium touch simulation; physical Safari remains untested. This is not an exhaustive proof over all possible table states.

Validation: client TypeScript/Vite build, 12 room tests, locked-art hashes, real Chi selection/confirmation on desktop and 956×440 touch viewport, real Ron and clickable four-way settlement. No page errors or failed ART HTTP requests.

Run from the project root: `QA_OUTPUT_DIR=/tmp/bunny-approved-table node --import tsx scripts/review-real-table.mjs`. Set `QA_CHROMIUM_PATH` if needed; the script currently uses /usr/bin/chromium. Optional `RECORD_ART_VIDEO=1` records the same flow.

Formal game production has not been deployed by this change.
