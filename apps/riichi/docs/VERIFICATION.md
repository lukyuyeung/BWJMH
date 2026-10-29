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
- Win sequence is call → actual hand reveal → text/gold limit presentation → original sequential yaku report. No rabbit character art, hands or video is used in the TYCOON presentation.
- Friend room identifiers separate browser-local saves; no cross-device invite or production multiplayer server exists. Counts describe only this browser's open table window and expire after seven seconds without heartbeat.
