# Bunny Gala Riichi v2.6.0 — final product direction

Release evidence is in `docs/qa-final/`. This continues the existing React/Node/Socket.IO/standalone engine implementation, with no replacement engine or new third-party Mahjong assets.

## Requirement coverage

| Requirement | Status and scope |
| --- | --- |
| Original identity | Preserved locked asset bytes, original logo, casino/felt/frame, voxel character appearances and thick 3D tile bodies. Wizard/Ninja/King stay in the scene; seated Luk uses an unchanged official artwork crop rather than a profile substitute. |
| Meld placement | Seat-relative right of concealed hand for all seats; sideways source tile, open Kan, two inner Ankan backs, stacked Kakan tile. |
| Assistance | Graphical legal calls, Riichi selection, graphical waiting tiles and legally visible unseen counts; matching opponents' rivers only; active discard gold highlight. |
| Strategic bots | Exact standard/special-hand shanten, visible efficiency, Tanyao/Yakuhai opening paths, Dora heuristics, basic Riichi defense, guarded Kan/conditional Riichi. All decisions use existing RoomManager validation. |
| Automatic options | Auto Sort, opt-in legal Ron/Tsumo, Disable Calls preserving priority-delayed Ron, legal drawn-tile Auto Discard. No automatic Riichi/Kan from human options or AFK timer. |
| Fullscreen results | Winning existing character artwork, concealed winning hand/melds, Ron/Tsumo, Yaku/Han/Fu, Dora components, base hand value and four score changes. Exhaustive draws, Next Hand and final ranking. |
| P0 character framework | All 12 event contracts; accepted-action events, configurable existing-art/image/video/voice/sound slots, placeholder cut-ins, synthesized cues, transient camera emphasis, major-hand layer, Skip/Reduce Effects. |
| Mobile landscape | Browser checks at 844×390, 1366×768 and 1920×1080; results bounded by viewport with internal content scrolling. |
| Replay | Intentionally not implemented. Bounded structured events retained, not a durable replay log. |

## Incomplete production assets / limitations

- No official voice clips or rigged seated character models were present in the source. The four seated character appearances use existing static scene/artwork. Presentation is a lightweight framework/placeholder, not a finished voiced, skeletal-animation cinematic.
- Bot strategy is heuristic, not competitive AI. Opening-yaku plans focus on Tanyao/Yakuhai and basic value/defense; it does not model opponent concealed hands, wall order or deep search.
- Browser acceptance uses Chromium/software WebGL. Mobile landscape uses emulated viewport/touch; physical iOS/Safari/Android device certification is not claimed. Small landscape viewports keep the fixed casino composition and therefore smaller controls.
- Engine rules remain the documented MVP subset, not complete Mahjong Soul rule parity. Unsupported Yaku, post-Riichi Ankan, multi-Ron, abortive draws and other omissions remain listed in README.
- Match replay, persistent rooms, production authentication, rate limiting and production load testing are not included.

## Bugs found and fixed

- Release-version workspace dependency still pinned the old engine and clean `npm ci` attempted the registry: synchronized local engine dependency and lock metadata.
- Bots always passed calls and discarded the last tile: connected a deterministic private-state strategy through the original validation methods.
- Decorative three-side wall omitted Ninja's wall: added 136 physical slots and four 17-stack sides tied to actual live/dead wall membership and revealed indicators.
- Server countdown was absent; timers lacked stale-state guards: publish authoritative deadlines before snapshots, preserve reconnect deadlines and guard room/game/revision/deadline/terminal states.
- Melds were disconnected from hand ends and lacked called-tile/Kakan orientation: grouped opponent racks and added own right-hand meld rendering.
- Calls showed raw notation: graphical legal combinations and claimed-tile outlines.
- Winning results lacked hand reveal/score deltas and sat below table: settlement-only reveal plus full-viewport results.
- Disable Calls could pass a Ron waiting behind another player's priority: added own pending-Ron eligibility and deferred both automation and bots.
- Mobile first tap could discard during inspection: explicit click suppression for the first touch and outside-tap reset; regression tested with real touchscreen events.
- Presentation could outlive Next Hand: hand identity resets its queue/audio/camera state; fullscreen major effects only run for settled hands.
- Original player profile sampled King and no seated Luk was visible: corrected own profile and added official seated Luk artwork to normal gameplay.
- Larger new wall/river layout overlapped the central HUD: bounded north river size and compact HUD; overlap regression retained.

## Security findings

Real Socket.IO payload tests reject malformed/forged/out-of-turn/replayed intents and confirm that opponents' concealed IDs, hidden wall IDs, unrevealed dead wall and resume tokens are absent. Physical wall serialization contains occupancy only, except legally revealed indicators. Wait counts and bot policy use only owned/public tiles. The winner's concealed hand is revealed only after accepted settlement. Presentation contains only accepted event kind/seat/id, never hidden tiles. The server remains the sole action/scoring authority.

## Verification results

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 189 packages; all workspace package/engine pins synchronized at 2.6.0. |
| `npm test` | PASS — 129 engine + 46 server/policy tests = 175. All existing tests retained. |
| `npm run typecheck` | PASS — engine, server, client and QA scripts. |
| `npm run build` | PASS — engine/server/React. Vite reports a nonfatal >500 kB lazy Three.js chunk warning. |
| `npm run verify:art` | PASS — 8 official locked masters and the existing cleanplate hashes unchanged. |
| Actual browser | PASS — Chromium 153.0.8010.0; 25 acceptance checks; zero JS/console errors. Real Socket.IO + React/Vite; screenshots included. |
| Simulations | PASS — 225 matches / 1,499 hands / 214,752 actions / 4,557 calls / 200 Kans; no failures. |

Reproduce final simulation batches:

```powershell
npm.cmd run simulate -- 50 1001 bot
npm.cmd run simulate -- 150 2001 calls
npm.cmd run simulate -- 25 4001 safe
```

Every simulation action checks phase progress, 136 unique physical tiles, four of each face, wall/dead-wall/indicator occupancy, expected hand sizes, current dealer and score-plus-pot conservation.

Screenshots: `qa-final/solo-bots.png` (normal actual gameplay), `gameplay-1920x1080.png`, `gameplay-1366x768.png`, `gameplay-844x390.png` (runtime Kakan fixture), `mobile-landscape-results.png`, `major-winning-presentation.png`, `kakan-meld.png`, `populated-rivers.png` and `match-complete.png`.


Browser fixtures for rare Chi/Pon/Kan/Ron/results are installed through the in-process QA manager, not a debug socket endpoint. The normal four-player and Solo/Bot screenshots use actual startup/gameplay. Fixture screenshots are runtime UI evidence, not proof of random physical tile distribution; complete real simulations check physical invariants separately. Failed iteration logs are retained rather than hidden.

See README for exact Windows installation/startup/testing/simulation commands and ruleset assumptions.
