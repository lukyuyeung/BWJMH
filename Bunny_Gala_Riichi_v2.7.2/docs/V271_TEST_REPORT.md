# Bunny Gala Riichi v2.7.1 verification report

This continues the supplied project; the existing architecture, official runtime assets and engine were retained. It is a development MVP, not public production certification or complete Mahjong Soul parity.

## Implemented fixes

- Shared authoritative Kuikae discard filtering after Chi/Pon, including the opposite edge exchange. Bot planning, AFK and client legal choices use the same restriction.
- Post-Riichi Ankan requires the drawn fourth copy, unchanged waits and an unambiguous triplet in every supported prior decomposition. Own Kan requires a draw rather than a post-call discard turn.
- Double Riichi and first-turn Tenhou/Chiihou, with interruption conditions and distinct Yakuman stacking.
- Best scoring interpretation compares bonus-adjusted actual payment value; hidden Ura only contributes on a confirmed win.
- Ron on a Riichi declaration tile refunds the not-yet-established 1,000-point deposit before paying the carried pot. Passing establishes the declaration.
- Configurable bankruptcy and final-dealer Agari-yame; zero is not bankruptcy.
- Atomic private room checkpoints, physical tile/score validation on recovery, exact deadline restoration, real four-socket restart and SIGKILL regression cases. Corrupt snapshots fail closed.
- Browser-origin allowlist, 16 KiB Socket.IO packet limit, per-connection burst guard. Vite development filesystem excludes server-private checkpoint files; storage rejects all client-tree locations.
- Mobile native-size automatic option/menu controls and dialogs; action reserve prevents overlap and terminal states leave Next Hand accessible.
- Auto/Low/High graphics, software-GPU detection, effective Reduce Effects, idle redraw suppression, cached pulse frames and slower low-quality pulse. Latest-discard gold takes visual priority over matching cyan.

## Final validation

Engine suite: **163 passed**; server suite: **103 passed**; total **266**. TypeScript checks, all workspace builds and official art verification completed successfully. Raw logs are retained in `qa-v271/`. Final root-command rerun logs use the `release-` prefix.

Browser continuation: `final-browser/results.json` passed four groups, zero unexpected console/page errors, Chromium 153.0.8010.0. Real viewports 844×390, 667×375 and 915×412; 44px option/action targets, settings bounds, graphics toggles, touch inspection, Kuikae choice filtering and automatic reconnect across a real server restart were exercised.

The initial restored-session browser launch crashed because the previous Chromium executable was truncated. Re-extraction from the original compressed package restored the executable; rerun passed. The initial default concurrent test run was interrupted while its synchronous simulation test was still running; this is not counted as a pass. Failures and retries are retained in logs, not deleted or substituted with older version results.

## Security findings

Actual Socket.IO tests cover private serialization, fabricated actions, duplicate/revision guards, origin rejection, oversized packets, burst throttling and recovery. Snapshot files contain all private state and bearer tokens and MUST remain private; the HTTP regression requests both raw filesystem routes and verifies denial while legitimate assets remain available. Origin checks are not user authentication. Rate limits are per connection, not global or per identity. Checksums detect accidental corruption, not a malicious storage administrator. No public-internet penetration/load certification is claimed.

## Completed / incomplete scope

Implemented and tested in this continuation: new rule branches above, conservative timeout recovery, single-process restart recovery, packet/origin guards and mobile presentation/performance controls. Existing graphical calls, right-end melds, state-driven walls, synchronized official Chinitsu video, results and bot strategy were retained.

Incomplete production requirements: supplied art has no rigged seated character models/animation rigs, complete official face atlas, isolated master-faithful casino background, voice library or other character/Yaku video variants. Existing painted seated scene and procedural face symbols remain; no artwork was regenerated. Current concealed tile meshes can be upright while seated artwork remains static. Bots are deterministic shanten/value/defense heuristics, not a proven competitive AI or exact win-probability search. Native hardware/mobile Safari/fullscreen orientation APIs and Windows OS execution are not certified by Linux Chromium tests. Mobile tables can remain letterboxed and small hand tiles require further real-device UX work.

Optional unsupported rules: multiple-Ron payments/triple-Ron abort, Kokushi Ankan robbery, Nagashi Mangan, Pao, Renhou, individual double Yakuman variants, target-score extensions and Uma/Oka. No match replay. Public accounts/matchmaking, distributed storage/deployment, TLS hosting and sustained load testing are outside this release. In-game Exit retains the reconnectable seat; no permanent mid-match abandonment or completed-match Return Home flow was added in this continuation.

## Local startup

Extract the entire project ZIP. In its root on Windows: `npm.cmd ci`, `npm.cmd test`, `npm.cmd run typecheck`, `npm.cmd run build`. Terminal 1: `npm.cmd run server`. Terminal 2: `npm.cmd run client`. Open http://127.0.0.1:5173 (server 3001). Solo: Create Room → Fill with Bots → Ready → Start Game. README documents compiled startup, variables, rules, storage and QA commands. Node_modules/build outputs are intentionally excluded; runtime assets and lockfile are included.

## v2.7.1 seeded bot simulation

160 complete matches, 1,302 hands, 145,310 actions; seeds 271101–271260, alternating Hanchan/Tonpuusen. Chi 479; Pon 1,025; Daiminkan 39; Ankan 68; Kakan 54 (total Kan 161); Riichi 967; Ron 626; Tsumo 445; exhaustive/abortive draws 231. Invalid actions 0; deadlocks 0; score conservation failures 0. Every transition checks all 136 unique physical IDs, exactly four copies per face, public wall/dead-wall/indicator consistency, hand sizes and dealer state. Failures throw with seed/phase/turn instead of being swallowed. Four batches and aggregate JSON are included. These metrics belong to v2.7.1, not the older v2.7.0 run.

## Compiled runtime smoke

`final-production.log` and `production/production-runtime.json`: compiled Node server + built React/Vite preview launched together; health 200; browser created a room, filled three bots, readied and started; legal discard advanced turn 5 → 13 through real Bot/server actions. Production developer scenarios absent, official video HTTP 200, desktop 1920×1080 and mobile 844×390 screenshots captured, unexpected browser errors 0.

## Additional validation notes

Final root `npm test` completed successfully: engine 163 + server 103, without changing or deleting valid tests. Root `npm run typecheck`, `npm run build`, and `npm run verify:art` passed again. Vite reports the existing 578 kB Three.js chunk warning; it is not a build error and remains a mobile loading/performance limitation.

The first final four-browser attempt timed out waiting for the 3D upright diagnostic during concurrent simulation/build work, with no console errors. The repeat passed initial four-scene rendering, all assets, viewport/side-camera checks and private transport inspection. This failed attempt is retained in `final-four-player.log`/`final-four-player/failure.json`; it is not silently replaced with v2.7.0 evidence. Software-rendered multi-client performance is not equivalent to native-device testing.

Four-client normal-effects retry passed scene/assets/viewport/upright/privacy groups but was interrupted after prolonged software-rendered Chi interaction stalls. Normal-effects four-client acceptance is therefore **incomplete**, despite passing unit/transport and single-client compiled play. A separate reduced-motion-background run is recorded independently. This is an explicit performance limitation, not a passing full-effects test.

Final reduced-background four-browser attempt passed initial scenes and asset checks but timed out taking a viewport screenshot (`final-four-reduced/failure.json` includes renderer diagnostics). It did not complete all eleven interaction groups. Earlier v2.7.1 four-browser eleven-group success is retained in `browser-v270-default-second.log`, but the final repeat failure remains a known unresolved software-rendering/load limitation. No claim of a fully clean final four-browser acceptance is made.

After all final root gates, compiled runtime smoke was repeated successfully (`production-after-gates/production-runtime.json`): Solo + three Bots, turn 1 → 12, 1920×1080 and 844×390, zero browser errors. This confirms the packaged compiled application runs; it does not override the four-browser acceptance limitation.
