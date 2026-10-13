# v2.7.2 — Mobile fullscreen correction

## User-visible change

The v2.7.1 mobile capture was incorrectly letterboxed: fitting the desktop 3:2 stage plus reserving a permanent bottom toolbar shrank the game into the center of the screen. This patch removes that fit in mobile landscape. The actual scene now starts at x=0/y=0 and occupies the entire viewport width and height. Menu buttons float at the upper right; Auto Sort/Auto Ron/Disable Calls/Auto Discard remain in the existing native-size Settings panel. There is no permanent settings strip taking gameplay height.

The original background/character pixels keep a uniform width scale. The existing felt/frame region and calibrated 3D camera use a shared table-plane projection; upright tile Z height and thickness are retained. Own hand, profiles, round information, timer above PASS and action rows are reframed. The round panel is verified above the actual tile faces. No art was generated, replaced or re-encoded; no engine, multiplayer or bot functionality was removed.

## Validation

- Root npm test: engine **163 passed**, server **108 passed** = **271**; five new viewport framing regression cases. Existing deterministic safe/bot/call match simulations remain in the suite.
- npm run typecheck, npm run build and npm run verify:art passed. The existing large Three.js chunk warning remains.
- Real browser: **844×390, 844×375, 667×375, 915×412**, including a height-only resize. Full viewport bounds, no scrolling, 44px actions, timer above PASS, round information clear of tile faces, actual WebGL/CSS projection agreement, own tiles present, no footer, native Settings Auto Ron toggle, confirmed touch discard, graphical Chi/right meld and fullscreen win results all passed. Unexpected browser errors: **0**.
- Built Node + built React preview: actual Solo + three Bots, legal discard and subsequent turn advancement, production QA UI absent, official video available; desktop/mobile captured; browser errors **0**. See qa-v272/production-final/production-runtime.json.
- Official eight master hashes, current cleanplate hash and official Chinitsu video hash passed verification.

Actual screenshots are in qa-v272/. They are application captures, not generated mockups. The early fullscreen test harness had a wrong timer-map reference and a tsx page-evaluation helper issue; those were corrected. The initial typecheck also caught an optional executablePath field; it was corrected, then typecheck/build/browser were rerun. Failed logs are retained in qa-v271/fullscreen-* and qa-v272/typecheck.log, with successful final runs explicitly named.

## Scope and remaining limits

This is a responsive layout correction over v2.7.1. Riichi rules, server-authoritative validation, serialization, Bot strategy and checkpoint/security behavior are unchanged. The v2.7.1 1,302-hand run belongs to v2.7.1; it is historical evidence for the unchanged engine, not a newly claimed v2.7.2 large simulation.

The previous four simultaneous software-rendered browser performance/acceptance failures remain documented in V271_TEST_REPORT.md; this patch does not claim to resolve them. Real mobile hardware, mobile Safari and Windows OS runtime are not certified by these Chromium/Linux viewport tests. The supplied artwork still lacks rigged seated models, a complete official face atlas, voice assets and other character/Yaku videos. Existing painted characters and procedural face symbols remain. Unsupported optional Riichi rules and public-production limitations remain in README.

## Run locally on Windows

Extract the complete ZIP and open PowerShell at package.json. Run npm.cmd ci. Terminal 1: npm.cmd run server (3001). Terminal 2: npm.cmd run client (5173). Open http://127.0.0.1:5173. Create Room → Fill with Bots → Ready → Start Game. For a phone connect over your LAN and configure VITE_SERVER_URL as documented in README; a phone's localhost is not your PC. Fullscreen API can be requested in Settings where the browser supports it.

Checks: npm.cmd test; npm.cmd run typecheck; npm.cmd run build; npm.cmd run verify:art; npm.cmd run test:browser:fullscreen. Playwright Chromium installation is needed for browser QA.

## Orientation transition correction

Visual inspection of the first compiled mobile capture caught a transient stale WebGL hand after changing from desktop to landscape. The renderer now invalidates old tile poses on viewport/root-frame changes and temporarily exposes the functional DOM tile layer until the new 3D frame is complete. It does not leave an empty hand during the transition. New diagnostics/capture checks require the rendered hand position and table scale to agree with the live DOM before reporting a stable view. Typecheck/build/art and source/compiled browser checks were rerun after this fix; successful final logs use browser-last / production-final / typecheck-final-second / build-final / art-final.
