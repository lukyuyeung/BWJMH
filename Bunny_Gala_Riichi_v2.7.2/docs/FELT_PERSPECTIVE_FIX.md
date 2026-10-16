# Original table design and player-view tiles

The gameplay background is `client/public/art/gala-original-table-raised-view.png`,
a camera edit of the user-selected `gala-empty-table.png`. The original is retained
unchanged. The raised view preserves the ornate copper/gold rim, emerald patterned
felt, fine gold ornament, center octagon and red velvet casino chairs. The plain
procedural green table and replacement chair geometry have been removed.

`mahjong-player-view-reference.png` is the tile shape/material reference requested
by the user: standing, flat and back views of a compact ivory mahjong block, black
back and restrained gold seam. It is stored in Art, not substituted for live game
faces. Actual face glyphs and tile IDs continue to come from game state.

The canonical block is 88×120×34 world units for own hands, concealed opponent
hands, all rivers, all melds and both wall levels. Rounded ivory bodies, charcoal
backs and a narrow gold seam follow the reference. No class gets a separate scale.
Apparent size naturally changes with distance/orientation in the shared camera.
The hand stands on the player's near rim. Six-column rivers reserve space for
four rows at each side; the narrower two-line round/seat/wall HUD leaves the
central gap clear.

`felt-projection.ts` calibrates the plane to the actual four felt corners of the
raised-view image. CSS hit targets and the single WebGL camera use this exact
homogeneous transform, including the same physical Z-height projection. This
keeps flat discards on the pictured felt and standing tile feet at Z=0. The
invisible depth-only surface occludes the lower bodies of seated bunny sprites;
it never paints a different table over the selected artwork. Carrot riichi
sticks remain real meshes. Characters remain static transparent PNG planes,
not rigged models. Calls do not change the scene viewport or camera.

The former mobile CSS exception that shrank the entire third automation button
has been removed. Single-glyph 理、和、鳴、切 share the same font size. Only the
actual two-character 不鳴 label uses the smaller font to fit its button.

Existing gameplay interaction remains: single-tap legal discard, whole-face
matching discard lights/counts, server-provided riichi discard choices, automatic
post-riichi tsumogiri that preserves tsumo/kan choices, authoritative declaration
tile recovery, and a local new-match button after the match finishes. External
Bunny Gala account/avatar provider remains deferred. Result art/scoring and the
38 illustrated yaku examples are retained.

## Validation

- `npm run typecheck`, `npm run build -w @bunny/client`, `npm run verify:art`.
- `node --import tsx scripts/browser-felt.mjs`: desktop and landscape phones,
  actual active ornate backdrop, all public tile centers within pictured felt,
  shared model/camera, zero ground-contact errors and unobscured center HUD.
- `node --import tsx scripts/browser-table-viewport.mjs`: four landscape sizes,
  river bounds, equal single-glyph automation font sizes, contextual controls
  at least 44 pixels tall, and absence of a second discard-confirm button.
- `node --import tsx scripts/browser-riichi.mjs`: direct touch, public face lights,
  legal riichi choices, carrot deposit, declaration recovery, actual automatic
  newly drawn tile discard, protected kan/tsumo choices and local restart.
- `QA_CHROMIUM_PATH=/usr/bin/chromium node --import tsx scripts/browser-table-ui.mjs`:
  same-seat session recovery, all five meld types without camera zoom, chronological
  rivers, deferred records and illustrated yaku guide.

These gameplay checks cover landscape. At 844×390 the smallest projected public
face is approximately 19×11 pixels; finite phone resolution still limits small
rotated glyphs. Portrait gameplay is not claimed by landscape checks.

## Existing Codespace update

This revision changes frontend visuals only. Keep the running game server and
working proxy-enabled Vite client. From another terminal:

```bash
cd /workspaces/BWJMH
git pull --ff-only origin codex/clear-table-scene
```

Open the working forwarded client address (5175 for the most recent proxy setup),
then hard-refresh. Do not launch duplicate listeners or change back to the old
5174 page. A stopped client can use the previously configured ignored
`client/node_modules/.cache/bunny-codespaces.config.mjs` with
`VITE_SERVER_URL=/ npx vite --config node_modules/.cache/bunny-codespaces.config.mjs --port 5175 --strictPort`
from the client directory. The server must still answer `/health` internally on
3001. Future engine/server changes require a rebuild and restart of that server.
