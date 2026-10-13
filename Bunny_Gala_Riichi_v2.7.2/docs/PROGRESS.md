# Bunny Gala Riichi — current release v2.7.2

The entries below retain historical milestones. Current verification: `V271_TEST_REPORT.md`.

# Bunny Riichi — v2.5.1 progress

Latest visual deliverable: **Gala Reference Edition, 2026-10-08**. The older art milestones below are history. Current runtime evidence is in `qa-gala-reference/`.

v2.5 implementation candidate has been installed, repaired, tested over real Socket.IO connections and exercised in Chromium. TypeScript/React/Node/Socket.IO/standalone-engine architecture is preserved.

## Corrections

- Fixed workspace version mismatch (`0.1.0` engine dependency versus `2.5.0` package), added lockfile and engine-before-test/start/typecheck builds.
- Build now compiles the engine and Node server as well as the client. Replaced unbounded `latest` Vite/plugin requirements with a compatible Vite 6 range; removed unused React plugin.
- Node loader development command avoids tsx CLI IPC dependency; fixed cross-platform main-module detection. Vite's default loopback binding avoids environment network-interface enumeration failures.
- Coherent decomposition scoring: no pooling Yaku across incompatible interpretations; fixed exposed groups cannot be rearranged. Standard versus Chiitoitsu interpretations compete by supported payment value. Pinfu/Fu share the same decomposition and wait assignment.
- Double-wind Yakuhai counts twice. Closed Kan retains Menzen and supports pre-Kan Riichi eligibility calculations. Fourth Kan tile contributes Dora/Aka/Ura correctly.
- Open-hand Tenpai/Furiten and noten settlement now work; called-away discards remain in Furiten history.
- Post-Riichi discards are locked to the drawn tile in engine and UI. Point eligibility filters Riichi controls. Invalid discard does not prematurely change Ippatsu.
- Calls cannot take the last live discard except legal Ron; Kans require live and Rinshan capacity before mutation. Dead-wall replacement retains all 136 physical tiles.
- Tsumo requires a draw (or initial dealer hand), not merely a completed shape after a call.
- Atamahane is distance-prioritized, independent of arrival order. A caller may choose Chi over their own Pon and declines any own legal Ron correctly.
- Removed premature room-level empty-wall settlement that bypassed phase/turn validation; final discard/pass settles exhaustively once. Draw Honba carries across dealer rotation.
- Exposed lobby Leave/host transfer/Close and disconnected-room expiry through Socket.IO; bot-only orphan lobbies close.
- Missing acknowledgements and malformed names/codes no longer cause unhandled socket errors. Finite timeout normalization prevents NaN timer loops.
- Mandatory game revision rejects duplicate/delayed socket actions; reconnect revokes old sockets and prevents cross-room rebinding/private-state misrouting.
- Browser restores credentials on every transport connect and removes StrictMode listener/connection hazards. Timers retain deadlines on reconnect and clear on terminal states/closure.
- Displayed hand metadata stays with the completed hand even when the match has advanced; dealer-relative wind labels, explicit Furiten, legal discard controls, and generic Match Complete text improve functional clarity.

## Verification and evidence

All original test files remain. Stale tests were repaired with stronger checks: 69 live tiles after a 14-tile dead wall, explicit passing of claim windows, and exact secret/property privacy assertions rather than a substring accidentally matching `handsPlayed`.

New audit fixtures cover supported Yaku/Yakuman, decomposition selection, wait Fu/Kan Fu, transactional Kakan/Chankan, open Tenpai/Furiten, Riichi restrictions, call priority, exhaustive settlement, Honba, Hanchan/Tonpuusen, score conservation, reconnect, cleanup and real transport security/timing. Simulations fail on invariant violations rather than swallowing them. Real Chromium tests cover independent client contexts, Solo QA, action controls, reload, results and final ranking.

See `QA_REPORT.md` and `qa/*.json` for the final measured results and `qa/*.png` for browser evidence. Exact install/development/testing/simulation commands and ruleset limitations are in README and INTEGRATION.

## Remaining scope

Memory-only development identity/session model, conservative QA bots, partial documented Riichi Yaku/rules, production authentication/persistence/deployment/rate limiting/load testing, and final brand assets. No unsupported rules are claimed implemented.

## v2.5.1 Art V3 client update

Applied the supplied official logo and character/environment references without re-generating them. Asset source paths and SHA-256 hashes are recorded in `client/public/art/asset-manifest.json`. Tiles remain data-driven: opponent concealed hands show backs only, while discards and public melds show real faces. No engine, server, scoring, or private-payload schema changes were needed.

Human draw is automatic on the existing legal `canDraw` flag, with revision and duplicate-send guards; claim windows and post-Chi/Pon discard are respected. Results display Chinese Yaku names and individual Han. Local Noto Sans TC fonts prevent missing Chinese glyphs. The existing npm install/run commands and ports remain unchanged. Browser QA exercises four players, Solo Bots, reconnect, auto draw, action controls and final ranking; Art V3 screenshots include desktop and mobile. Rare-action fixtures are installed in the in-process QA manager, not exposed over Socket.IO.

## v2.5.1 Art V5 FINAL LOCKED

V5 supersedes V3 runtime art. All eight locked masters are bundled unchanged, hash-checked by `npm run verify:art`, and connected to the actual client. Cropping is CSS-only. Four-sided table geometry uses CSS perspective/depth; material/environment references are cropped without importing poker geometry, event characters or broken roof. Original lock documents are included in `docs/art-v5-lock/`.

Small private serialization addition: `you.drawnTileId` identifies only the recipient's own draw while awaiting discard. This fixes the false 13+1 gap after Chi/Pon and survives reconnect; no opponent draw identity or wall order is exposed. Engine rules and action validation remain unchanged. White Dragon has no printed 白 glyph. Regression coverage includes draw metadata privacy and browser assertions after calls.

Run/install commands, Node requirements, ports and rules limitations remain in README. Browser evidence is in `docs/qa-art-v5`. Master images are profile/material crops, not 3D models or character animations.

## Reference 1 scene correction (background retained; tile renderer superseded below)

Replaced gameplay's geometric table/background with a reference-derived cinematic scene asset. Projective CSS maps real tiles/rivers/melds/HUD to its felt; four profiles and the interactive hand remain live React. Wall graphics use only public counts. Engine and server are unchanged from the previous package. Official logo/back masters are unchanged. Static artwork plus live UI is 2.5D; no animated 3D models are claimed. New evidence is in `docs/qa-scene/`. Client ignores stale game revisions and cannot revert a finished room to an older unfinished snapshot.

## Earlier CSS tile correction (superseded by WebGL below)

Gameplay tiles now have elevated faces, visible ivory side surfaces, bevels and cast shadows. Concealed opponent tiles stand upright with the unchanged locked black/gold backs; walls show two physical layers. The table projection preserves CSS 3D depth. This is CSS-rendered tile geometry over a static cinematic scene, not animated character models. No engine or server rules changed. Runtime evidence: `docs/qa-solid-tiles/`. Existing install, ports and run commands still apply.

## Earlier WebGL tile pass (historical)

Gameplay uses real rounded 3D tile geometry through Three.js/WebGL2. Ivory physical materials, beveled edges, textured faces, calibrated table projection, directional lighting, and shadow-casting tile bodies replace the CSS-only tile surfaces. Opponent concealed tiles are upright backs only; wall bodies have two layers. The exact locked black/gold source image is sampled for the back texture without changing its original bytes. Chinese faces remain data-driven and the White Dragon remains blank. Own-hand buttons keep their existing input handlers; server actions, privacy and game rules are unchanged.

`client/src/tiles3d.ts` is a passive visual layer: it consumes the positions and face metadata of existing visible React elements. It cannot access the engine, opponent identities or wall order. DOM buttons remain the sole input controls. The renderer is loaded only after entering gameplay, caches shared geometry/materials, draws on state/size/interaction changes, and releases its GPU resources on unmount. GPU context loss or initialization failure restores the playable CSS view with a visible status; restoration resumes one canvas.

The photographed table/characters/background remain static artwork, not animated 3D models. The wall layout is still illustrative public-count allocation. This is not a full freely rotating 3D environment. WebGL2 and a working GPU/driver are needed for the 3D presentation; portrait mobile retains the scaled scene and landscape is recommended. The new Three.js dependency is locked in package-lock.json and installed by `npm ci`; no new environment variables or ports.

Run `QA_OUTPUT_DIR=docs/qa-webgl-tiles npm run test:browser` after installing Playwright Chromium. Browser QA now verifies real mesh rendering, actual game controls, hidden-payload privacy, GPU loss/recovery, mobile scaling, reconnect and final ranking. Screenshots, including an actual own-hand detail, are in `docs/qa-webgl-tiles/`. Earlier QA folders are historical evidence.

A client completion race was independently reproduced and fixed: a terminal `room:state` now locks the room even before its terminal `game:state` arrives. Later unfinished game/room snapshots cannot reopen controls or trigger auto-draw. The server remains authoritative; its rules and validation were unchanged. Browser QA includes this mixed-message-order regression.

## Current edition: Gala Reference · 2026-10-08

This complete **Bunny Riichi MVP v2.5.1 — Gala Reference Edition** follows the supplied `Mahjong2.png` composition. The warm chandelier casino, seated Wizard/Ninja/King, green felt and gold/pink table rim come from a clean environment plate edited from that reference. Baked-in tiles, counters, names, action buttons and the circular material callout were removed. All visible game tiles, counts, scores and controls are live.

- Rounded WebGL ivory tile bodies, substantial depth, gold back edging and the unchanged black/leather tile-back master. Own faces use locally bundled LXGW WenKai TC lettering (OFL), engraved-style circle pips and blank White Dragons.
- Three illustrative double-height wall sections are allocated from the public remaining live/dead-wall count; they are not the actual hidden wall's positions/order. Opponent concealed tiles show backs only. No hidden information reaches this renderer.
- Single-layer public discard rivers have six columns and scale within their reserved areas for longer hands. The center medallion becomes compact as rivers fill. Dora indicators have a separate readable panel.
- Foreground hand, profiles and fixed CHI/PON/KAN/RON/TSUMO/PASS strip follow the reference. Unavailable actions are disabled; multiple legal Chi/Kan choices remain individually selectable. Riichi choices, Furiten, settlement, Next Hand and final ranking remain below the scene.
- Rules and Info open real panels. Settings changes text contrast or requests browser fullscreen. Exit temporarily disconnects, preserving the reconnect identity; Return reconnects. The match continues with server AFK behavior while away. This is not lobby Leave and does not pause the room.

The renderer is a passive presentation layer over authoritative React/socket state. It cannot read opponent hands, wall order or the engine. Revisions, automatic legal draws, claims, bot policy, server validation and the terminal-state lock remain intact. A disconnected client does not queue new actions. GPU failure restores interactive CSS tiles; restoration resumes one WebGL canvas.

The environment/characters are **static artwork**, not animated or rigged 3D models. Tiles are real-time geometry, so their lighting is an approximation of the reference render, not pixel-identical photography. The stage fits available desktop height; portrait mobile is supported for continuity but landscape is recommended for comfortable tile selection. Full rule and production limitations above still apply.

Verification evidence: `docs/qa-gala-reference/` (real browser screenshots, tests/build logs, simulation JSON and validation report). Browser checks include simultaneous three-way Chi controls, center-HUD/river overlap, tile-body clipping, menus/away-return, actual actions, private payloads, context loss/recovery and match completion.

```bash
npm run verify:art
QA_OUTPUT_DIR=docs/qa-gala-reference npm run test:browser
```

The eight V5 master files remain byte-for-byte unchanged. `npm run verify:art` checks those originals and the current cleanplate's hash/runtime reference. Earlier visual implementations and QA folders are historical, superseded by this edition. See `docs/ART_REFERENCE.md` for asset provenance, edit prompt and rendering details. No new ports or environment variables are required. This ZIP contains the complete React/Node multiplayer project, not a standalone ChatGPT demo.

### Bugs found during this visual pass

- Prior scene did not match the supplied warm casino reference; replaced the scene composition.
- Profiles sampled character sheets with a different appearance; gameplay profiles now sample the matching scene heads.
- Large center HUD obscured later discard rows; reserved river areas, compact HUD and a browser overlap regression now protect them.
- Near-wall geometry crossed the calibrated near clip plane, leaving apparently detached top faces; corrected the depth interval and added browser geometry-bound checks.
- Context controls sat outside the reference table and multiple Chi choices could overflow; integrated the fixed strip and tested all three simultaneous Chi sequences.
- Exit/Settings from the concept were absent; implemented explicit temporary disconnect/return and display settings with a blocking overlay. Disconnected actions are rejected locally instead of queued.

No engine, scoring, room authority or serialization behavior changed in this visual pass.


## v2.6.0 — final product direction

Implemented on the existing v2.5.1 source: strategic private-information bots, exact shanten, visible-information Riichi/wait assistance, graphical calls, seat-relative right-hand meld arrangement, opt-in automatic controls, viewport results, structured character events and modular existing-art performance placeholders. Added a real public spatial wall map and server-deadline countdown. Existing artwork, cleanplate, thick 3D tile geometry, engine, multiplayer and tests are retained.

Validation evidence is in `qa-final/` and `PRODUCT_DIRECTION_REPORT.md`. Earlier QA artifacts describe historical builds and are not evidence of this release. No replay, new art, official voices, or rigged seated-character animation is implemented.

## v2.7.0 historical continuation

This section supersedes older version status claims. Architecture and original supplied source are preserved. Implemented changes are in V270_CHANGELOG.md; measured acceptance results and remaining requirements are in V270_TEST_REPORT.md. The art audit distinguishes unchanged locked master bytes from the existing concept-derived scene. No rigged character assets were supplied, so rigged seated characters and full master-faithful environment integration remain incomplete. This is a development MVP rather than a claim of full Mahjong Soul rules or production-service parity.

## v2.7.1 continuation

Added authoritative Kuikae discard filtering, strict post-Riichi Ankan, Double Riichi, Tenhou/Chiihou, bonus-aware scoring interpretation selection, refund of an unestablished Riichi declaration robbed by Ron, bankruptcy/Agari-yame policy, private atomic room recovery, origin/packet guards, native landscape controls and graphics performance controls. Regression tests cover these branches, real restart/SIGKILL recovery and HTTP checkpoint privacy. Original architecture/assets remain. Optional rules and missing production art remain documented in README; this is not complete platform parity.

## v2.7.2 mobile fullscreen

Removed mobile desktop-aspect fitting and permanent footer strip. The scene fills the actual viewport, existing character image proportions are kept uniform, felt/3D camera share a responsive plane mapping, and 44px menus/actions remain accessible. Auto settings move into the existing Settings panel. New deterministic framing and real browser acceptance tests exercise viewport fill, height-only resize, round/hand separation, legal confirmed touch discard and Chi melds. See V272_TEST_REPORT.md.
