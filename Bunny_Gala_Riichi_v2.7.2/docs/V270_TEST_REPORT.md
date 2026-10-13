# Bunny Gala Riichi v2.7.0 — verification and limitations

Verified on 2026-10-11 with Node 24.19.0, npm 11.9 and real headless Chromium 153.0.8010.0 (software WebGL). This is a runnable development MVP continuing the uploaded project. **It does not satisfy every requested production requirement.** The explicit incomplete items below remain open; no claim of Mahjong Soul parity is made.

## Deliverables and reproduction

The release ZIP contains complete source, package manifests/lockfile, unchanged required V5 runtime masters, unchanged official Chinitsu MP4, Windows README, test/simulation logs and actual browser screenshots. `node_modules` and generated build folders are excluded; npm installs the pinned dependencies. All required runtime art paths are already present. See V5_ASSET_AUDIT.md and V270_CHANGELOG.md.

Windows: extract the entire ZIP, open PowerShell in its package.json folder, run `npm.cmd ci`, then `npm.cmd run server`. In a second terminal in the same folder run `npm.cmd run client`. Open http://127.0.0.1:5173. Server port 3001. Create Room → Fill with Bots → Ready → Start Game. Full commands, environment variables and compiled startup are in README.md.

## Automated/build results

|Check|Result|Evidence in docs/qa-v270|
|---|---|---|
|Root clean dependency install|Pass, committed v2.7.0 lockfile|final-install.log|
|Engine tests|148 passed, 14 files|final-tests.log|
|Server tests|83 passed, 9 files|final-tests.log|
|Total automated tests|231 passed|final-tests.log|
|TypeScript including browser/simulation scripts|Pass|final-typecheck.log|
|Engine + server + React production build|Pass|final-build.log|
|Eight locked masters, current scene and MP4 hashes/runtime references|Pass|final-art.log|
|Existing browser regression|25 checks passed; no console errors|legacy-browser/browser-results.json|
|New four-player acceptance|11 grouped checks passed; no unexpected browser errors|browser/browser-results.json|
|Compiled server + compiled client browser smoke after build|Pass, real Solo Bots turn 1 → 5, mobile no scroll, production QA UI absent|production-runtime.json|

Build has a nonfatal ~575 kB Three.js chunk warning. The runtime-injected missing-video test intentionally produces a network error; it is separated from unexpected console errors. Windows commands are documented, but a Windows OS itself was not available for execution.

## Browser acceptance

Four independent browser contexts create/join/Ready/start a real Socket.IO game. Tested actual viewport dimensions: 1920×1080, 1366×768, 844×390, 667×375 and 915×412. All four walls/68 stacks render from actual physical-wall occupancy; revealed indicators remain separate from the deadline timer above PASS. Concealed hands expose no tile-face attributes. Upright/contact/clipping diagnostics are zero; actual close-ups and a side-camera screenshot are included. Opponents share a table world basis; local upright tiles retain a separate foreground projection camera, not a rigged player scene.

Physically valid 136-tile fixtures execute Chi, Pon, Daiminkan, Ankan and Kakan through real socket actions with graphical tile previews. Riichi displays legal discard/wait previews and pays 1,000; touch selects before an explicit confirmation discard. Existing browser regression also checks matching opponents' discards, latest discard, automatic options, terminal controls, results and context loss/restoration. Its older synthetic fixtures are not claimed to be physical full-wall states; new QA fixtures verify 136 unique IDs/four of each face.

Confirmed Chinitsu shares the same server event/deadline among all four clients. Original video actually decodes and plays in-browser. Page reload restores the current server cinematic or results state; transport tests separately reconnect during the active deadline. Skip, reduced effects, unavailable video and forged advance cannot enter results early. All four receive server results on the bounded timer. No client acknowledgement is required. A late reload correctly enters results rather than replaying an expired clip. Mobile fullscreen results fit the viewport and Next Hand clears the old presentation.

**Performance qualification:** software rendering initially stalled four simultaneous animated claim glows. Pulse updates are now bounded, shadows cached and tile bevel subdivision reduced while retaining thickness. The new four-page call tests use reduced motion on the three background pages, restoring normal motion before cinematic tests. Therefore this is not a certification of four default-effect clients under sustained mobile GPU load. Real Android/iOS devices and Safari were not available. Narrow mobile scenes letterbox to preserve table/characters; small informational text still needs further device usability work.

## Seeded bot simulation

Four fail-fast batches of 40 complete matches, seeds 270101–270260, mixed Tonpuusen/Hanchan, with Aggressive/Balanced/Defensive profiles through RoomManager. **160 matches, 1,401 hands, 155,931 actions**; 1,136 wins, 265 draws. Invalid actions **0**, deadlocks **0**, score-conservation errors **0**. The preliminary 20-hand run also passed. Detailed batch JSON and aggregate sim-1000-plus.json are included.

|Action|Count|Events per 100 hands (not win probability)|
|---|---:|---:|
|Chi|582|41.54|
|Pon|1,024|73.09|
|Daiminkan|40|2.86|
|Ankan|75|5.35|
|Kakan|48|3.43|
|All Kan|163|11.63|
|Riichi|1,043|74.45|
|Ron|658|46.97|
|Tsumo|478|34.12|

Every transition checks all 136 unique physical tiles, exactly four of every face, live/dead/public-wall consistency, 14 dead-wall tiles, legal hand sizes, dealer state and scores + unclaimed pot = 100,000. Match action caps detect nontermination. Cinematic time is fast-forwarded by the in-process simulator only; real synchronization deadlines are tested independently. Bots demonstrate all eight requested legal actions deterministically, decline unsuitable calls and differ under threat. These remain heuristics: no exact expected-win-probability or full expected-score search.

Reproduce: `npm run simulate -- 40 270101 bot` (repeat seeds 270141, 270181 and 270221 for the other batches). Standard browser testing: `npx playwright install chromium`, then `npm run test:browser` / `npm run test:browser:v270`. Developer scenarios: `npm run qa:scenarios`. They are localhost-only, host-owned, DEV-only, disabled in production. See README for browser binary override and scenario controls.

## Bugs discovered/fixed

- Standing tile transform used the wrong local vertical direction/seat transform mix. Replaced with a documented +Z table-up / +Y standing-height seat basis; flat objects remain separate. Browser contact/upright geometry and side rendering verify it.
- Initial tile distribution was one-at-a-time from the original seat order. Added proper current-dealer-relative four-tile packet dealing, singles and dealer extra tile; rotated dealer regressions retained.
- Empty-wall illegal draw mutated the hand phase before throwing. Rejection is now mutation-free; automatic last-discard exhaustive settlement remains covered.
- Bot call comparison consistently preferred Pon over otherwise suitable Daiminkan. Added a bounded early safe value-honor Kan preference and deterministic legal execution tests; natural simulations now show all Kan types.
- Several supported-looking scoring branches were missing (including Suuankou and related outside/three-triplet/three-Kan/wind/green/nine-gates patterns). Added the explicitly listed yaku and win-tile-sensitive Ron interpretation. Old fixtures that accidentally became Suuankou were corrected to shanpon waits when testing ordinary Toitoi/Honroutou; highest-value/multiple-Yakuman expectations now reflect the valid scoring interpretation. Tests were not deleted to hide failures.
- Touch could discard without a clear confirmation interaction. Added tile-ID selection and separate legal confirmation.
- Four animated claim renders stressed software GPU and delayed interaction. Bounded pulse rendering and cached shadow updates address the observed stall; physical-device profiling remains open.

Added deterministic abortive-rule branches, profile bots, shared video synchronization and fuller result details. These are new functionality, not claims that every old rule was defective. Earlier failed browser attempts and test logs are retained: some harness reload assertions missed initial Socket.IO polling packets or expected a still-active clip after its server deadline. Final harness checks actual UI state and independent active reconnect transport; the deadline was not lengthened to hide these failures.

## Security and authoritative boundaries

Actual four-player payloads and serialization tests contain only the recipient's concealed identities, public rivers/melds/indicators and anonymous wall occupancy, never opposing hands/live-wall IDs/dead-wall order/future draws or pre-win Ura. Wait estimates and bots consume private-player/public information only.

Existing socket audits and new transport tests reject wrong-seat/out-of-turn/foreign-tile/malformed/stale/duplicate/ended-hand actions and forged cinematic advance. Client-supplied scores, dealer, round or claimed video completion do not update authoritative state. Kakan remains staged until the Chankan opportunity resolves; timeout actions remain draw/safe discard/Pass, not automatic human Ron/Riichi/Kan. Bot actions use the same RoomManager legal paths. Session replacement/reconnect and timer cleanup are tested.

This is **not** an internet production security certification: open CORS, in-memory rooms, no durable accounts/rate limiting/cluster persistence and no full adversarial fuzz/load audit remain. Developer fixture methods are internal source tools, not exposed by the normal production server entry.

## Requirement completion / remaining work

|Requested area|Status|Practical limitation|
|---|---|---|
|Preserve existing project/architecture/runtime assets|Done|No rewrite or engine replacement; original input backed up|
|Upright concealed tiles and distinct object bases|Done within existing renderer|Local hand uses foreground camera; true rigged character/table scene absent|
|Four-sided physical wall/dead wall/draws/Kan indicators|Verified|Anonymous occupancy only serialized|
|Configured rules/scoring/Fu/dealing/Furiten/progression|Implemented/tested for documented rules|Not complete platform parity; optional omissions below|
|Intelligent three-profile bots and ≥1,000 hands|Implemented/tested|Heuristic expected value/threat evaluation, not competitive AI|
|Graphical calls/Riichi waits/highlights/touch confirm|Verified|Physical device usability not certified|
|Mobile landscape/fullscreen/safe-area layout|Browser-verified|Letterboxing; Safari/device performance and text scale need work|
|Seat-relative right melds/Kan arrangement|Implemented and browser-verified|Brief meld arrival only, not rigged character call animations|
|Four automatic options|Verified|Documented conservative semantics|
|Four-player authoritative multiplayer/reconnect/timers|Verified within in-memory MVP|Atamahane configured, not multiple-Ron payouts; no public-scale deployment test|
|Fullscreen wins/draws/match results|Implemented/tested|No physical-device acceptance|
|Global Chinitsu official MP4, result transition/fallback|Verified|Wizard clip only; other winners get correct separate identity, no character-specific clip|
|Seven reusable major cinematic triggers|Framework implemented|Only Chinitsu has supplied production video; others existing-art placeholders|
|Official rigged seated 3D characters/fully master-faithful scene|Incomplete|No rigged model/clean environment production assets supplied; current static scene is concept-derived|
|Official complete tile-face atlas/voices/other videos|Incomplete|Not supplied; retained procedural faces/no invented replacement art|
|Developer-only physical QA scenarios|Implemented/tested|Rinshan is a valid state/context fixture, not a full historical replay; timer uses normal configured deadline|
|Public production readiness/full Mahjong Soul rules|Incomplete|Known optional rules, infrastructure and device/load QA remain|
|Replay|Out of scope|Structured game events retained|

Rules explicitly unsupported/disabled: multiple-Ron payments/triple-Ron abort (atamahane instead), post-Riichi Ankan, Kokushi Ankan robbery, Kuikae prohibition, Nagashi Mangan, Pao, Double Riichi, Tenhou/Chiihou/Renhou, individual double-Yakuman variants, bankruptcy/target-score extension/Agari-yame and Uma/Oka. Final unclaimed sticks remain in the pot. See server/src/rules.ts and README for the fixed configurable policy. No unsupported rule is claimed implemented.

## Actual screenshot locations

- production-desktop.png / production-mobile.png: compiled application after final checks.
- browser/gameplay-1920x1080.png, gameplay-1366x768.png, gameplay-844x390.png, gameplay-667x375.png, gameplay-915x412.png.
- browser/wizard-hand.png, king-hand.png, ninja-hand.png, local-hand.png, upright-side-camera.png.
- browser/chi-meld.png, pon-meld.png, daiminkan-meld.png, ankan-meld.png, kakan-meld.png.
- browser/chinitsu-official-video.png, video-failure-fallback.png, mobile-win-results.png.

These are screenshots of the actual application, not generated mockups. Original masters/video were neither regenerated nor redrawn.
