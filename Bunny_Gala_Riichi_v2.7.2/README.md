# Bunny Gala Riichi v2.7.2

A runnable development MVP, continuing the supplied upright-hands project. React + TypeScript + Vite client, Node + Socket.IO server, standalone Riichi engine, private player serialization, and in-memory rooms with optional single-process disk recovery are preserved. **This release is not full Mahjong Soul rule parity or a hardened public production service.** See `docs/V272_TEST_REPORT.md` and `docs/V5_ASSET_AUDIT.md` for evidence and missing assets.

## Windows installation and startup

Install **Node.js 22 LTS or newer** with npm. Extract the whole ZIP to a normal folder, not Windows ZIP preview. Open PowerShell in the folder containing `package.json`:

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run server
```

Keep that terminal open. In a **second PowerShell window in the same folder**:

```powershell
npm.cmd run client
```

Open **http://127.0.0.1:5173**. Server: **3001**. `.cmd` avoids PowerShell restrictions on the npm `.ps1` launcher. Unix equivalents omit `.cmd`. The engine is built automatically before the development server. Dependencies are installed from the committed lockfile; `node_modules` is not included in the ZIP.

For a compiled local build after `npm run build`, use two terminals:

```powershell
npm.cmd run start -w @bunny/server
npm.cmd run preview -w @bunny/client -- --host 127.0.0.1
```

Vite preview normally uses port **4173**. Preview serves the compiled client assets; the compiled Node server still needs to run.

## Solo and multiplayer

Solo: **Create Room → Fill with Bots → Ready → Start Game**. Three bots fill the other seats. Draw is automatic. Desktop: click a legal hand tile to discard. Touch: tap a tile to inspect/select, then press **確認打牌** to discard; tapping a second tile changes the selection. No matching-discard quantity counter appears. Hover/touch matching uses opponents' public discards only.

Four players: use four separate browser profiles/contexts, share the six-character code, all Ready, then host Starts. Reusing a browser profile restores the saved seat and replaces its older socket. Lobby Leave transfers the host to a remaining human. Exit during play temporarily disconnects; the server continues conservative timeout play and the seat can reconnect.

## Controls

- **Auto Sort:** own tiles sorted by face; off preserves server order. Real drawn tile keeps a gap.
- **Auto Ron:** opt-in legal Ron or Tsumo, always revalidated by server.
- **Disable Calls:** automatically passes Chi/Pon/Daiminkan; preserves legal or priority-pending Ron. Does not disable own Ankan/Kakan controls.
- **Auto Discard:** opt-in drawn-tile tsumogiri only when legal; pauses for a legal Tsumo and after Chi/Pon without a draw.
- **Riichi:** select RIICHI, inspect highlighted legal discards and waits, then discard to declare/pay 1,000. Wait counts are **unseen copies**, based only on own and public information; they are not future/live-wall counts.
- **Nine terminals:** offered on a legal uninterrupted first turn with nine distinct terminal/honor faces, when abortive draws are enabled. It is optional, never selected by human AFK timeout.
- Timer is above PASS and uses server deadline + server-now snapshot with monotonic elapsed time. Dora indicators have a separate panel. Last-discard highlight follows the live claim; resolved claims remove it.
- Exposed melds use each seat's right hand end. Called tile is sideways, Kakan stacks over the original Pon's called tile, Ankan shows two inner backs.
- Fullscreen results show the winning hand/melds, yaku, Han/Fu, bonuses, payment amounts, score changes and Next Hand. Exhaustive and configured abortive draws have distinct results.

## Official art and cinematic

All eight V5 masters are included byte-for-byte at `client/public/art/v5/`. The official H.264/AAC Chinitsu video is included unchanged at `client/public/cinematics/chinitsu.mp4`; no path reconstruction is needed. The asset audit maps every supplied master to its runtime use and lists existing deviations.

On a server-confirmed qualifying win, all players receive one cinematic ID, winner identity, start and end time. **CHINITSU** uses the official MP4 (5.056 s) with a server presentation deadline of **7.5 s** including decode grace. Other registered major triggers use short existing-art placeholders until official clips are supplied. Gameplay actions are already terminal, turn timers stop, and Next Hand is blocked until the server enters results. Local playback completion, Skip, Reduce Effects or a failed video cannot advance the room; the server deadline does. Reconnect gets the same event and seeks to its elapsed time or goes directly to results if the deadline passed. Sound defaults to muted for browser autoplay compatibility; Enable Sound is available.

The supplied video features Wizard. A separate official winner identity is shown; other character-specific video variants are not supplied. Future video, image, voice, sound and modest VFX can be configured in `server/src/presentation.ts`; existing action cut-ins remain in `client/src/presentation.tsx`. No replay is implemented.

**Missing production art:** no rigged seated GLB/GLTF/FBX models, animation rigs, isolated official casino cleanplate, complete locked tile-face atlas, official voice library, or other Yaku clips are supplied. Existing painted seated characters/casino cleanplate are retained; they are not real rigged character models and are not pixel-identical master character artwork. Existing procedural tile-face symbols are retained. No artwork was regenerated. These limitations are not marked complete.

## Bots

Bots only consume `PlayerGameState` (their own tiles + public information) and dispatch through RoomManager. Fill assigns **Aggressive / Balanced / Defensive** profiles. Decisions use exact standard/seven-pairs/orphans shanten, visible ukeire, supported open-yaku paths, visible Dora, closed-hand preservation, Riichi threats, genbutsu risk and late-round score position when considering calls. Early safe value-honor Kan receives a small replacement-draw/value preference. All profiles take legal wins. Human AFK policy is separate: draw, safe automatic discard, or Pass; no automatic Ron/Riichi/Kan.

These are deterministic heuristics, not competitive AI or an exact expected-score/win-probability search. Diagnostic seeded match counts and call rates are in the test report.

## Rules configuration

Lobby host can set `matchLength` (`hanchan`/`tonpuusen`), `akaDora` (default true), `actionTimeoutMs` (5,000–120,000; default 30,000), and `abortiveDraws` (default true) through `room:set-rules`. Rules lock at Start. Fixed policies are explicit in `server/src/rules.ts` (`RULE_POLICY`):

- 25,000 initial points each; Kuitan on; atamahane (nearest valid Ron), Ron before Pon/Kan before Chi.
- No kiriage; Kazoe Yakuman; distinct Yakuman stack; no double variants of individual Yakuman; double wind pair = 4 Fu.
- Riichi needs at least four live tiles; post-Riichi Ankan requires the drawn fourth tile, unchanged waits and an unambiguous triplet in every prior decomposition. Kokushi robbery of Ankan remains disabled. Kuikae is prohibited after Chi/Pon.
- Abortive draws: nine terminals, uninterrupted four identical first winds, four Riichi, four Kans by multiple owners. Reaction/Ron resolves before automatic abort. Four Kans by one owner continue. Abortive draws repeat dealer, add Honba, retain sticks and have no Noten exchange.
- Exhaustive draw: 3,000-point Tenpai/Noten exchange; dealer repeats if Tenpai; Honba increases; sticks carry.
- East/South match completion after last dealer rotates; bankruptcy ends at a negative score (zero continues). Final-dealer win ends the match when the dealer is first with at least 30,000 points. Host rule configuration can disable `bankruptcyEnd` or `agariYame`; no target-score extension. Final unclaimed sticks remain in the pot; no Uma/Oka.

Supported yaku: Riichi, Double Riichi, Ippatsu, Menzen Tsumo, Pinfu, Tanyao, Yakuhai, Iipeikou, Ryanpeikou, Sanshoku Doujun/Doukou, Ittsu, Toitoi, Sanankou, Sankantsu, Chiitoitsu, Honitsu, Chinitsu, Honroutou, Chanta, Junchan, Shousangen, Haitei, Houtei, Rinshan Kaihou and Chankan. Yakuman: Tenhou, Chiihou, Kokushi, Daisangen, Tsuuiisou, Chinroutou, Suuankou, Suukantsu, Shousuushi, Daisuushi, Ryuuiisou and Chuuren Poutou. Evaluation compares supported decompositions and winning-tile wait roles; dealer-relative winds feed yaku and Fu.

**Not implemented:** multiple-Ron payouts/triple-Ron abort, Kokushi Ankan robbery, Nagashi Mangan, Pao, Renhou, individual double Yakuman variants, target-score extensions/Uma/Oka. These are not silently enabled.

## Developer QA and simulations

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run verify:art
npm.cmd run simulate -- 10 270001 bot
npm.cmd run test:browser
npm.cmd run test:browser:v270
```

Browser tests require Playwright Chromium: `npx.cmd playwright install chromium`. An existing binary may be supplied through `QA_CHROMIUM_PATH`. Output folder can be changed by `QA_OUTPUT_DIR`. The verification environment used Chromium 153 with software WebGL; mobile tests are real browser viewport/touch emulation, not physical iOS/Android devices.

Simulation arguments: `<match-count> <first-seed> <safe|bot|calls>`. It fails immediately on invalid actions, deadlocks, duplicate/missing physical tiles, copy counts, dead-wall/wall-map errors, hand sizes, dealer mismatch, score conservation errors or step limits. Bot metrics separate Chi, Pon, Daiminkan, Ankan, Kakan, Riichi, Ron and Tsumo. Simulations fast-forward server-only cinematic deadlines in-process; real timing is verified by transport/browser tests.

For interactive deterministic QA, stop the regular development processes and run:

```powershell
npm.cmd run qa:scenarios
```

This starts a **localhost-only developer** server and Vite client on 3001/5173. Create → Fill with Bots → Ready → Start → **QA scenario** dropdown. Scenarios include Chi/Pon/all Kan types/Riichi/Furiten/open yaku/Rinshan/exhaustive/Ron/Tsumo/Chinitsu/Kokushi/nine-terminals/timer/reconnect/mobile result. Timer: wait for expiry. Reconnect: reload or Exit/Return. Chinitsu: press TSUMO. Fixtures allocate real IDs from one 136-tile pool and retain exactly four copies of each face. They are state fixtures, not saved match replays. QA socket handlers are absent from the normal production entrypoint and the launcher rejects `NODE_ENV=production`; dropdown/debug camera are removed from production builds.

Debug physical view: append `?debugCamera=side` in development. The actual meshes are rendered from a side camera; renderer diagnostics report upright-axis, tabletop-contact and clipping errors without exposing secrets.

## Environment

| Variable | Scope | Default |
| --- | --- | --- |
| `PORT` | Node server | `3001` |
| `ROOM_STORE_PATH` | Node server private storage | `.bunny-data/rooms.json` relative to server cwd |
| `CORS_ORIGINS` | Node server browser origins | permissive development origins |
| `VITE_SERVER_URL` | client `.env.local` / build | `http://localhost:3001` |
| `QA_CHROMIUM_PATH` | browser test process | Playwright Chromium |
| `QA_OUTPUT_DIR` | browser test process | script's QA folder |

For LAN testing, set `client/.env.local` to `VITE_SERVER_URL=http://YOUR_SERVER_IP:3001` and use `npm.cmd run dev -w @bunny/client -- --host 0.0.0.0`. Fullscreen/orientation lock have browser-specific fallbacks; rotate manually when unavailable. Landscape uses a complete uncropped stage with touch-sized actions and safe-area padding; mobile landscape fills the viewport with uniform character scaling and separately reframed felt projection.

## Production boundary

Rooms operate in memory with optional single-process private disk recovery; the standard CLI enables it. Bearer reconnect tokens, permissive development origins unless configured, no account authentication, no distributed room ownership/global identity rate limiting/load testing and no production TLS deployment are retained limitations. This ZIP is ready to install and run locally; it is not certified for public production hosting. Physical device frame rates, mobile Safari, audio permission edge cases and long network-fault stress tests remain unverified.

## v2.7.1 recovery and graphics

The standard server command writes a private atomic checkpoint to `server/.bunny-data/rooms.json` (relative to the server process working directory). `ROOM_STORE_PATH` overrides it. Keep this file private: it contains concealed tiles, wall order and bearer reconnect tokens. Never put it under client/public, client/dist or a web-served folder. Restart on the same disk restores rooms, scores, physical tiles, reconnect credentials and authoritative action/cinematic deadlines. Disconnected humans still follow room cleanup policy. This is single-process recovery, not a database or multi-server deployment. Corrupt snapshots fail closed. Library-mode `createGameServer()` is memory-only unless given a store path.

`PORT` defaults to 3001. `VITE_SERVER_URL` sets the client Socket.IO endpoint at client build/dev startup. `CORS_ORIGINS` is a comma-separated browser-origin allowlist, e.g. `http://127.0.0.1:5173,http://localhost:5173`; without it development origins are permissive. Node clients without an Origin are permitted; origin checks are not authentication. Socket packets are limited to 16 KiB and per-connection bursts are rate-limited. Use TLS, real authentication, protected storage and deployment/load testing before public hosting.

Graphics Auto selects Low on compact mobile or software GPUs; Low reduces resolution/shadows/pulse frequency. High can be selected manually. Reduce Effects also reduces 3D effects. Idle countdown updates do not redraw 3D tiles. Landscape settings/info use native-size dialogs; menu and action controls have 44-pixel targets. The mobile scene now fills the viewport; automatic options remain in Settings. Real-device usability and Safari are not certified.

Regression QA: `npm.cmd run test:browser:v271`. Install the Playwright browser once with `npx.cmd playwright install chromium`; `QA_CHROMIUM_PATH` optionally selects an existing Chromium executable. See the v2.7.1 report for final results and the v2.7.0 report for historical results; they are separate runs.

### v2.7.1 simulation evidence

`npm.cmd run simulate -- 40 271101 bot` runs deterministic complete matches, not just 40 hands. Repeat with seed bases 271141, 271181 and 271221 for the shipped 160-match/1,302-hand run. Detailed call/win/error counts are in `docs/qa-v271/simulation-results.json`. These CPU-bound tests can take several minutes; avoid running them alongside browser/GPU acceptance checks.

**Known final QA limitation:** four simultaneous software-rendered browser clients timed out during the last full-effects interaction/screenshot runs. The final four-client acceptance is incomplete. Single-client compiled Solo + three Bots, real transport recovery/authority tests and the 1,302-hand simulation passed. See the report for retained failures; do not infer public-service performance from these tests.

## v2.7.2 mobile fullscreen correction

Mobile landscape no longer uses the desktop 3:2 fit or reserves a bottom toolbar. The scene occupies 100% viewport width/height; Settings/Rules/Info/Exit float at the upper right. Auto Sort/Auto Ron/Disable Calls/Auto Discard are still available in Settings, with native-size targets. Existing character/background bytes remain unchanged; only the existing table-material region and calibrated tile camera are reframed. Upright tile Z height/thickness is preserved. Hand, round information, scores, Dora, timer and actions are repositioned for landscape. No new art was generated. Test `npm.cmd run test:browser:fullscreen`; source/compiled evidence is in `docs/V272_TEST_REPORT.md`.
