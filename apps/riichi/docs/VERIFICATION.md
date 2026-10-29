# Verification

- Imported source: published Bunny Gala v103, commit `8da9729cb0e6ef62dcd957f5f9eb93ae5c8cef6d`.
- `npm ci`: passed using committed lockfile.
- `npm run typecheck`: passed.
- `npm run test:brands`: passed; defaults, idempotent injection, persistent-state and ownership separation.
- `npm run build`: both Bunny Gala and TYCOON outputs passed.
- `npm run test:built-brands`: passed, including original lobby preservation, TYCOON direct entry, neutral table and room-specific persistence keys.
- `node qa/wall-order-qa.mjs`: 144 dealer/dice combinations and all 123 draw prefixes passed.
- Original 126 src, 16 engine and 24 rules files remain identical to v103 across src/engine/rules.
- Original JS and CSS are byte-for-byte identical to published v103 (`index-CCfZiwfZ.js`, `index-BYanNyhd.css`).
- Vite reports an existing >500 kB main-bundle warning; the TYCOON entry preloads the game chunk while its table waits for seats.
- Browser screenshot / real-device visual acceptance is not completed in this environment.
- Real wallets, production authentication, real-time multiplayer and airdrop event settlement are not connected.

- Deployment packaging: TYCOON omits the unreferenced 4.19 MiB authoring master SVG (retained in source) and stages only the TYCOON build at `dist/client`; Bunny output omits unused new-brand assets.

## TYCOON table update

- `npm run test:tycoon`: materialized TYCOON source typecheck and actual transport tests passed. Three master-level AI seats, East-only rules, per-room saves, all score limits and double-ron timeline ordering verified.
- Casino DOM checks: public/friend modes only; East-only; six direct table links; all four locales; no right rule sidebar; occupancy filters follow received room state.
- Controlled-clock entry check: immediate table view, roster 1 → 2 → 3 → 4, start preparation at 10.5 seconds, loading completion removes wait overlay, allowlisted opener reporting. Network/WebGL load is still required; failure presents retry.
- Presentation correction: original win routing/clocks restored. Below-mangan AI tsumo uses the original small ribbon and physical hand reveal. Character layer 02 is removed; layers 01/03/04, original effect CSS, voice/SFX and report layout remain. The previous custom win screen and custom plan are deleted.
- Friend room identifiers separate browser-local saves; no cross-device invite or production multiplayer server exists. Counts describe only this browser's open table window and expire after seven seconds without heartbeat.

## Regression verification for original presentation

- Normal tsumo/ron, all five limit tiers and double ron produce the same shared plan as the original Bunny profile; below-mangan single wins return no full-screen plan.
- Actual AI self-draw settlement is exercised with a legal sub-mangan hand; it emits TSUMO and no full-screen plan. An old forced-plan save is migrated without restarting the game or changing scores.
- SSR rendering checks all four internal roles and six call types retain image layers 01/03/04 and omit character layer 02 and its backup.
- Hub SVG retains the original viewBox and every non-watermark path; its CSS changes only asset URL and colors.
- Six flattened tier scenes were edited to remove the rabbit and visually inspected. They share the existing WinArt animation/timing, with no replacement typography or new screen layout.
- Real-browser / real-device animation acceptance remains unavailable in this environment.
