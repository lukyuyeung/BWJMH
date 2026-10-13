# Single physical table and result screen

All physical tiles now share the 44×60×18 model in `client/src/table-metrics.ts`.
The same constants supply CSS layout and the WebGL geometry. The physical board
is 1000×1000. Hands, concealed racks, walls, rivers and all melds belong to this
one board scene and one calibrated camera. Private hand controls are inside the
board; the former screen-space hand scene/camera has been removed. Natural
perspective remains, but no tile class receives an independent size or scale.
Flat tile bottoms and standing tile feet contact the felt at Z=0. Upper wall
slots and stacked added-kan tiles use the tile depth for their elevation.

The call presentation component no longer transforms the scene viewport. Its
sound and small call notice remain. Browser QA samples table bounds during chi,
pon, daiminkan, ankan and kakan and rejects any zoom, translation or resize.
The hand row sits at the near edge of the felt, separated from its river.

The yaku guide shows illustrated tile groups for all 38 supported yaku. These
are examples, not live hands. Situational conditions remain explained in text.
The examples are tested as valid winning shapes, with kan groups normalized.

Results sort real concealed tiles in suit/rank order, preserve red flags and
winning IDs, and display exposed melds separately, retaining source orientation
and kan stacking. No tiles or scores are embedded in art. A new result-only
casino plate restores the red velvet chair, chips, amber/pink light and black/gold
panel composition. The right corner title and duplicated winner text are removed.
The held tile, han/fu, limits, score changes and avatars still use server data.

Validation commands:

- `npm run typecheck`, `npm run build`, `npm run verify:art`.
- `npx vitest run server/test/result-layout.test.ts` (inventory, meld provenance,
  all illustrated winning shapes).
- `node --import tsx scripts/browser-felt.mjs` (desktop and landscape phones,
  one model/camera, real tile ground contact, populated rivers and center bounds).
- `QA_CHROMIUM_PATH=/usr/bin/chromium node --import tsx scripts/browser-table-ui.mjs`
  (legal calls, fixed viewport during calls, illustrated guide, same-seat reload).
- `QA_CHROMIUM_PATH=/usr/bin/chromium node --import tsx scripts/browser-result-ui.mjs`
  (real sorted tsumo/ron hands, exposed pon/kan, score card bounds, portrait and
  landscape, actual winning tile and App profile event).

Characters remain transparent 2D sprites composited behind the photographed table.
The App account provider is still deferred. At 844×390 the smallest far river
faces have a projected depth around 6 pixels; physical size consistency does not
remove the phone screen's perspective/legibility limit. Portrait table play is
not claimed by the landscape acceptance checks; the portrait result screen is.
