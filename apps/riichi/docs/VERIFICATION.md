# Verification

- Imported source: published Bunny Gala v103, commit `8da9729cb0e6ef62dcd957f5f9eb93ae5c8cef6d`.
- `npm ci`: passed using committed lockfile.
- `npm run typecheck`: passed.
- `npm run test:brands`: passed; defaults, idempotent injection, persistent-state and ownership separation.
- `npm run build`: both Bunny Gala and TYCOON outputs passed.
- `npm run test:built-brands`: passed, including static lobby, ready screen and client persistence keys.
- `node qa/wall-order-qa.mjs`: 144 dealer/dice combinations and all 123 draw prefixes passed.
- Original core byte comparison: {"src": 126, "engine": 16, "rules": 24} files identical to v103 across src/engine/rules.
- Original JS and CSS are byte-for-byte identical to published v103 (`index-CCfZiwfZ.js`, `index-BYanNyhd.css`).
- Vite reports an existing >500 kB main-bundle warning; code splitting is outside this theme change.
- Browser screenshot / real-device visual acceptance is not completed in this environment.
- Real wallets, production authentication, real-time multiplayer and airdrop event settlement are not connected.

- Deployment packaging: TYCOON omits the unreferenced 4.19 MiB authoring master SVG (retained in source) and stages only the TYCOON build at `dist/client`; Bunny output omits unused new-brand assets.
