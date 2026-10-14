# Physical table, interaction and results

Gameplay uses a real opaque 1800×1800 felt mesh, flush wood/gold rim and chair
geometry. The room-only background contains no baked table. All physical tiles
share the 64×88×26 model from `client/src/table-metrics.ts`: own hand, opponent
racks, wall stacks, rivers and melds. One orthographic camera renders everything;
near and far tiles have identical physical and projected widths. CSS hit targets
use the same camera projection. The camera fits landscape height without changing
when cards are drawn or called. Tile feet and public tile bottoms contact Z=0;
upper wall tiles and added-kan tiles use the same physical depth.

The own hand stands on the near rim. Rivers use six columns, chronological rows
and four fixed positions on the felt. Sideways called tiles retain source-seat
orientation. The center displays the round, own seat wind and remaining live wall.
Calls retain their notice/sound but cannot transform the table viewport.

Legal hand tiles discard with one click or tap. There is no second discard-confirm
button. Hover/focus lights the whole faces of matching discards in all four rivers
and the called tile of exposed melds; the count includes claimed discards exactly
once. The privately held companions of a meld are not counted as played discards.
Selecting riichi lights only server-provided legal declaration discards.
After declaration, automatic discard uses the authoritative newly drawn tile ID,
withholding it for a legal tsumo or kan choice. It cannot discard an illegal or
missing ID. Existing action revision/in-flight guards remain.

The engine records the declaration tile ID and publishes it as public hand data.
Reload and checkpoint recovery preserve its sideways orientation. Declared seats
receive a voxel carrot riichi deposit on the felt, animated into a clear space
beside their river, and a one-second riichi notice. The carrot is real geometry.
Transparent bunny PNG planes sit in world space with depth testing; the opaque
table hides their lower bodies. They are not rigged 3D character models.

Local standalone play provides a new-match button after the match finishes.
It clears only the current game session, preserving the profile/avatar. A supplied
Bunny Gala host session does not receive this local-session replacement control.
The external account/avatar provider remains deferred; profile events and existing
avatar data adapters remain in place.

Results keep sorted real concealed tiles, winning IDs/red flags and separately
oriented exposed melds/kan stacks. Held winning tiles, han/fu, score changes and
avatars use server data. The result-only casino composition remains separate from
the rebuilt gameplay scene. The guide illustrates all 38 supported yaku.

## Validation

- `npm run test`: 164 engine and 124 server tests, including declaration recovery,
  automatic riichi discard exceptions, public count deduplication and inventories.
- `npm run typecheck`, `npm run build`, `npm run verify:art`.
- `node --import tsx scripts/browser-riichi.mjs`: direct touch, whole-face signals,
  eligible riichi discards, carrot mesh, reload, actual tsumogiri, kan/tsumo choices
  and local restart.
- `node --import tsx scripts/browser-felt.mjs`: populated rivers, shared model,
  camera, ground contact and bounds at desktop and landscape phone sizes.
- `node --import tsx scripts/browser-table-viewport.mjs`: four landscape sizes,
  public card bounds, HUD placement and accessible action targets.
- `QA_CHROMIUM_PATH=/usr/bin/chromium node --import tsx scripts/browser-table-ui.mjs`:
  entry/session recovery, all five meld types without zoom, rivers and yaku guide.
- `QA_CHROMIUM_PATH=/usr/bin/chromium node --import tsx scripts/browser-result-ui.mjs`:
  sorted real tsumo/ron results, pon/kan, scoring bounds and profile avatar event.

Landscape phone tests measure a smallest projected public face around 26×10px at
844×390. Phone resolution still limits small rotated glyphs. Portrait result layout
is covered; these gameplay acceptance checks cover landscape.

## Update an existing Codespace

Stop the old server with Ctrl+C in its existing terminal, then run:

```bash
cd /workspaces/BWJMH
git pull --ff-only origin codex/clear-table-scene
cd Bunny_Gala_Riichi_v2.7.2
npm run build
npm run server
```

This update changes engine/server data, so rebuilding and restarting the server is
required. Keep the existing Vite terminal running and hard-refresh the game page.
Do not start a second server on port 3001. For a stopped client, start it in a
separate terminal with `cd /workspaces/BWJMH/Bunny_Gala_Riichi_v2.7.2/client` and
`npx vite --host 0.0.0.0 --port 5174 --strictPort`, then open port 5174 in Ports.
