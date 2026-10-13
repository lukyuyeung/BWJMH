# Bunny Riichi MVP v2.5.1 — verification report

Verified 2026-10-06 on Node.js 24.19.0, npm 11.9.0, TypeScript 5.9.3, Vitest 2.1.9, Vite 6.4.4 and Chromium 153.0.8010.0. Architecture and existing engine retained. This is a verified development MVP with the explicit rules/production limitations below.

## Final results

| Check | Result |
| --- | --- |
| Clean `npm ci` | PASS |
| `npm test` | PASS — 154 tests: 118 engine + 36 server, 18 test files |
| `npm run typecheck` | PASS — engine, server, React client and QA scripts |
| `npm run build` | PASS — engine JS/declarations, server JS and React production bundle |
| Post-build `npm run test:browser` | PASS — real Chromium, 14 UI verification scenarios, zero console errors |
| Final deterministic simulations | PASS — 850 matches, 5,135 hands, 798,447 actions |

Exact timestamped commands/exit codes are in `qa/final-verification.json`; full output is in `qa/final-*.log`. Browser scenarios are in `qa/browser-results.json`. Simulation evidence is in `qa/simulation-results.json`.

## Runtime verification

Both documented development processes were started successfully (Node/Socket.IO 3001, React/Vite 5173). This execution environment isolates networking between command sessions, so the browser harness starts real Node/Socket.IO and Vite listeners together in one isolated QA process. It uses the same production server factory and React source, not a mock backend. The cloud browser could not access localhost; local Chromium was used successfully via Playwright instead.

Four separate browser contexts verified Create → six-character code → Join → seats → Ready → host Start → actual discard → claim Pass when needed → next player's Draw/Discard. Reload preserved identity and restored the private hand. One additional context verified a human with three Bunny Bots starting and taking legal timed turns. Server-side deterministic QA fixtures exercised rare UI action controls through normal Socket.IO/RoomManager validation: Tsumo, Ron, Riichi payment, Chi, Pon, open Kan, Ankan and Kakan. Next Hand and final ranking rendered correctly; completed matches offered no next-hand/discard controls.

The final-screen fixture deliberately advances remaining hand settlements in the QA manager to inspect the UI; it is not represented as a full match manually played through browser controls. Full multihand progression is covered by deterministic match tests and the simulations. No fixture/debug endpoint is present in the public server.

Screenshots: `qa/four-player-table.png`, `qa/solo-bots.png`, `qa/match-complete.png`. Browser font availability differs across machines; honor tiles include Latin identity labels so public discards remain readable without CJK fonts.

## Simulation results

| Policy | Seeds | Matches | Hands | Actions | Wins | Calls | Kans | Riichi |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Legal random calls | 1–600 | 600 | 3,624 | 565,888 | 31 | 15,977 | 569 | 34 |
| Actual Bunny Bot | 1–200 | 200 | 1,211 | 186,076 | 22 | 0 | 0 | 29 |
| Safe human AFK | 1–50 | 50 | 300 | 46,483 | 0 | 0 | 0 | 0 |

Every step checks 136 physical tiles with unique IDs; four copies of every face; expected concealed hand sizes (including pending transactional Kakan); current dealer; advancing legal phases; and 100,000 points including the Riichi pot. Matches alternate Hanchan/Tonpuusen by seed. Each match has a 12,000-step guard. No final simulation crashed, deadlocked, lost/duplicated a tile, violated a hand-size/face-count invariant, or failed point conservation. Smaller debug runs were performed before the final run. Conservative bots/random policies are intentionally weak, explaining the high exhaustive-draw rate; this is a stability result, not AI-strength evaluation.

## Bugs discovered and fixed

| Problem | Correction / regression evidence |
| --- | --- |
| Workspace referenced a nonexistent registry engine version | Workspace version aligned to 2.5.1; reproducible lockfile; engine prebuild |
| Build skipped engine/server runtime output | Root build now compiles all three packages |
| Unbounded latest Vite/plugin and dev CLI IPC issue | Compatible Vite 6, unused plugin removed, Node TS-loader dev watcher |
| Yaku from incompatible decompositions could be combined | Evaluate coherent decomposition/wait candidates and choose highest supported payment |
| Open fixed melds could be reinterpreted as concealed groups | Decompose concealed remainder and preserve actual exposed groups |
| Chiitoitsu-first shape choice could miss a better standard interpretation | Compare both supported interpretations |
| Pinfu and highest Fu could refer to different waits | Use the same selected decomposition and winning-tile placement |
| Double-wind Yakuhai undercounted | Separate seat/round wind Han; independent fixture |
| Closed Kan incorrectly treated as open | Preserve Menzen and allow pre-Riichi closed-Kan hands |
| Fourth Kan tile omitted from bonus Dora | Count all physical meld tiles for Dora/Aka/Ura |
| Open-hand Tenpai/Furiten always empty | Meld-aware waits; open noten settlement |
| Called-away own discards disappeared from Furiten history | Separate discard-face history |
| Riichi allowed arbitrary subsequent discards | Engine drawn-tile lock and client legal tile IDs |
| Invalid discard could alter Ippatsu before rejecting | Validate ownership before changing eligibility |
| Kan could mutate state then fail on exhausted Rinshan | Require capacity before offering/performing Kan |
| Dead-wall replacement lost/duplicated tracked physical tiles | Remove drawn Rinshan and replenish from live-wall tail |
| Tsumo could be offered after a call without a draw | Track legal draw ownership |
| Ron winner could depend on socket arrival order | Distance-prioritized atamahane |
| Own Pon blocked choosing own Chi | Gate only other players' higher-priority claims; declining own Ron sets Furiten |
| Empty-wall room draw bypassed turn/phase legality | Engine validates draw; final discard/pass settles exhaustively once |
| Rotating exhaustive draw reset Honba incorrectly | Increment and preserve draw Honba through rotation |
| Leave/host transfer existed only as internal primitives | Socket/UI lobby Leave, host Close, orphan and disconnected-room cleanup |
| Missing acknowledgement could throw out of the socket handler | Ignore unacknowledged requests safely |
| Malformed name/code and nonfinite timeout | Explicit validation and finite timeout normalization |
| Delayed/replayed intentions lacked state binding | Mandatory current revision for all game socket requests |
| Reconnect left old connection active / session could remain in old room | Single-socket identity takeover; reject bound cross-room create/join |
| Browser only resumed at first mount and StrictMode disconnected it | Reconnect on every connect; managed listeners/connect cleanup |
| Reconnect reset timeout deadline and ended timers remained tracked | Keep existing deadline; remove timers on terminal states/close/expiry |
| UI displayed next hand's metadata during the previous result | Hand metadata snapshot and dealer-relative wind display |

All original test files remain. Three stale test assumptions were corrected without removing their coverage: post-deal live wall is 69, legal claim windows must pass before next draw, and a secret `hands` property must be distinguished from harmless `handsPlayed`. Privacy assertions also inspect actual tile IDs/tokens. Initial browser harness failures were synchronization/fixture issues (reading the home heading before the room response, checking enabled controls before React committed); the final harness waits for observable state/controls and passes. No simulation failure was suppressed.

## Rules/scoring audit

Independent representative fixtures cover every currently implemented Yaku/Yakuman, standard/Chiitoitsu/Kokushi shape recognition, competing decompositions, fixed melds, double-wind Yakuhai, closed/open Kan, Rinshan, Kan Dora and transactional Kakan/Chankan. Fu fixtures cover base, closed Ron, Tsumo, Pinfu 20/30, Chiitoitsu 25, value/seat/round/double-wind pairs, simple/terminal/honor triplets, open/closed Kans, Tanki/Kanchan/Penchan/Ryanmen/Shanpon and rounding. Payment fixtures cover normal hand rounding, every limit, dealer/nondealer Ron/Tsumo, multiple Yakuman, Dora/Aka/Ura gating, Honba, Riichi payment/pot and conservation.

Exhaustive settlement is checked at the final discard and last claim pass, not delayed until an impossible next draw. Hanchan tests visit East 1–4 then South 1–4, with actual dealer receiving 14 tiles and relative seat winds; Tonpuusen, continuation, Honba, final ranking and rejected post-finish actions are covered.

## Security findings

Real Socket.IO payloads were inspected separately for four seats, alongside Chromium websocket state. No opponent concealed IDs, remaining live/dead-wall order, future draw IDs, hidden Ura indicator IDs or resume tokens appeared in public/private serialized game states. Public revealed Dora indicators are intentionally exempt from the hidden dead-wall check. Settled winning decomposition/score is intentionally public.

Malicious requests with another player's tile ID, forged seat/score/dealer/wall fields, invalid tile types, malformed Chi, fake Ron/Tsumo/Kan, stale/replayed revisions and missing acknowledgements were rejected or safely ignored without illegal mutation. Invalid reconnect tokens failed; a valid token restored only that identity and revoked its previous socket. AFK tests observed a real 5-second safe discard, deadline preservation on reconnect, replacement after player action, and removal on close. Engine/settlement tests verify action rejection after hand end and match completion.

This is development security verification, not a penetration-test certificate. Permissive CORS, bearer local reconnect credentials, no production auth/rate limiting/persistence, and no concurrent-room load test remain explicit production limitations.

## Remaining limitations and run commands

Complete supported/unsupported rules and policies are in README. Major exclusions: additional Yaku/Yakuman, double-Yakuman variants, multi-Ron, Riichi Ankan wait preservation, Kokushi Ankan robbery, Kuikae, abortive draws, Nagashi Mangan/Pao, bankruptcy/target extension/Agari-yame and Uma/Oka. Memory rooms are lost on restart. Final unclaimed Riichi pot is retained under the documented policy. Bots are conservative QA agents. No final brand redesign/art work was attempted.

```bash
npm ci
npm test
npm run typecheck
npm run build
```

Two terminals:

```bash
npm run server
```

```bash
npm run client
```

Open http://127.0.0.1:5173. Solo QA: Create → Fill with Bots → Ready → Start. Simulations: `npm run simulate -- 600 1 calls`, `npm run simulate -- 200 1 bot`, `npm run simulate -- 50 1 safe`. Optional UI QA: `npx playwright install chromium`, then `npm run test:browser`.

Deliverable: **bunny-riichi-mvp-v2.5.1.zip**, containing complete corrected source, lockfile, tests, scripts, documentation and final QA evidence; excludes node_modules and generated build/cache output.
