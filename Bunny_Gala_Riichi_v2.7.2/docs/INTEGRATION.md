# Bunny Riichi integration contract — v2.5.1

## Architecture and startup

The existing engine → RoomManager → Socket.IO server → React client separation remains intact. `createGameServer()` permits real transport tests without changing production authority. The engine has no React/Socket.IO dependency. Each physical tile has a unique ID. Rooms operate in memory; v2.7.1 adds an optional server-private atomic checkpoint for single-process recovery.

From the repository root: `npm ci`, `npm test`, `npm run typecheck`, `npm run build`. Development: `npm run server` (3001) plus `npm run client` (127.0.0.1:5173). `PORT` sets the server port; `VITE_SERVER_URL` configures the client connection, including at build time. For Solo QA: Create → Fill with Bots → Ready → Start. Simulation: `npm run simulate -- 10 1 calls`; full options and limitations are in README.

## Trust boundary and replay protection

Clients send intentions only. No client-provided seat, score, wall, dealer, round, Yaku, or win claim context is trusted. Server session identity determines the seat; the engine validates actions.

**Every `game:*` payload must include `revision` equal to the latest `game:state.hand.revision`.** This includes actions with no other data. After a successful game action or server timeout, the room revision advances. Stale/duplicate/replayed actions return `STALE_ACTION`; invalid actions do not mutate the game. Render legal controls from `hand.actions` and enable tile discards only from `hand.discardTileIds` (Riichi restricts this to the drawn tile).

Example:

```ts
socket.emit('game:discard', {
  revision: latestState.hand.revision,
  tileId: selectedTile.id,
}, (reply) => { /* {ok:true,data} or {ok:false,error:{code,message}} */ });
```

All requests use acknowledgements. Missing acknowledgement callbacks are ignored safely, rather than crashing the server. Clients must update from emitted states and wait for new state after an action; a second intention based on an old state may be rejected safely.

## Room protocol

| Event | Payload / behavior |
| --- | --- |
| `room:create` | `{name}` → private `{playerId,resumeToken,room}` |
| `room:join` | `{code,name}` → same credential structure; at most four seats |
| `room:reconnect` | `{code,playerId,resumeToken}` → restored identity and private state |
| `room:ready` | `{ready:boolean}`; lobby only |
| `room:fill-bots` | `{}`; lobby host only |
| `room:set-rules` | Partial `{matchLength,akaDora,actionTimeoutMs}`; lobby host only |
| `room:start` | `{}`; host only, four Ready and connected human/bot seats |
| `room:leave` | `{}`; lobby leave, human host transfer, empty/bot-only cleanup |
| `room:close` | `{}`; host closes room and clears timer/session membership |

`room:state` contains public metadata only. `room:closed` clears local state; `session:replaced` means a valid reconnect has displaced this connection. Creating/joining another room while already bound is rejected, preventing old-room membership from receiving the new room's private state.

Persist `code`, `playerId`, `resumeToken` in session storage appropriate to the host app. The current browser stores them locally and resumes on every transport reconnect, including reload. Only one socket may own a player identity; reconnect revokes the old socket. Do not log/share another player's token. Disconnect reserves the seat; explicit Leave removes it only in the lobby. Fully disconnected rooms expire after 30 minutes, with a one-minute cleanup interval.

## Game protocol

All events require the latest `revision`. Tile events additionally require `tileId`; Chi requires the exact offered `faces` sequence.

`game:draw`, `game:discard`, `game:riichi-discard`, `game:tsumo`, `game:ron`, `game:pass-claim` (`game:pass-ron` alias), `game:chi`, `game:pon`, `game:kan` (open), `game:ankan`, `game:kakan`, `game:next-hand`.

Higher-priority Ron claims gate calls. Atamahane waits for nearer Ron/pass before accepting a farther Ron. A player can select a lower call instead of their own higher call when no other player's higher claim is pending. Declining a legal Ron via a call produces Furiten. Kakan keeps the Pon and added tile uncommitted during Chankan; passing all Ron opportunities commits the Kan, reveals Dora and draws Rinshan.

Human AFK timers conservatively draw/discard/pass. They never auto-win, auto-Riichi or auto-Kan. Bots are an explicit separate policy allowed to win/declare Riichi. Timers are replaced after actions, removed on hand/match end and room close/expiry, and retained across disconnect/reconnect so reconnect cannot reset a deadline.

## Private serialization

`you.hand` contains only the requesting player's concealed tiles. Opponents expose counts, public discards/melds/Riichi and scores. The live wall, remaining Rinshan order, dead-wall order, future draws and hidden Ura indicators are absent. Visible Dora indicators are public. A settled winner's scoring/decomposition is public result data; unfinished opponent hands remain private. Resume tokens never appear in public room/game states.

`hand.match` is the snapshot for the hand being displayed (round, hand number, dealer, Honba); `room.match` describes match progression, which can already have advanced after settlement. Position IDs (`east/south/west/north`) remain fixed identities. Actual seat winds are relative to `hand.match.dealer`; do not label players permanently East based on their original position.

Score conservation includes `room.riichiPot`. Unclaimed final-draw sticks remain in that pot under this MVP's documented policy. Final ranking comes from the server. No further game actions are legal after match completion, except room closure/reconnect reads.

## Integration and production boundary

Embed the existing React test client first; later replace only the view while keeping the protocol and server authority. The current client is a functional Bunny-themed prototype, not final Bunny Warriors art.

Authentication with Bunny Warriors identity, distributed persistence/deployment, global identity rate limits, structured logs, transport/session hardening, concurrency/load testing, and an explicit abandonment policy remain production work. v2.7.1 adds single-process recovery and configurable origin/per-connection packet guards. The server uses bearer reconnect credentials and permissive development origins unless CORS_ORIGINS is configured; it is not a public production service. Full supported/unsupported rules are listed in README. Do not market this engine as implementing all Riichi rules.

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

### View integration details

`client/src/scene.css` and `client/src/tiles3d.ts` share a 1536×1024 calibrated stage and a 1000×620 felt coordinate system. Keep their homography coefficients synchronized when moving the scene. Tile depth has an explicit safe clip interval; browser QA asserts no body crosses its near/far planes. The WebGL renderer only reads visible DOM metadata, never additional server data. Face text uses bundled font subsets; no font CDN is needed. Scene-head portraits are CSS samples of the cleanplate; original character sheets are retained for lobby portraits. Static scene figures represent relative seats, not selectable animated avatars.

`you.drawnTileId` still belongs only to the receiving player, separates the true draw and does not create a false draw after Chi/Pon. The current action strip uses the same revision-validated handlers; extra choices are not collapsed into an arbitrary default. Exit disconnects the transport but retains credentials; it neither calls lobby Leave nor closes the room.


## v2.6.0 product-direction integration

Architecture and socket action names are preserved. New private serialization fields:

- `hand.wallSlots`: 136 public spatial slots with side/stack/level/occupied/dead and only revealed indicator faces. No concealed tile IDs or wall order are serialized. `physicalWall.tileIds` is server-internal.
- `hand.timeout`: absolute server `deadline` and `serverNow` snapshot. The browser measures elapsed monotonic time after receipt rather than relying on its wall-clock setting. Reconnect preserves the original deadline. A new action schedules the next deadline before emission. Timer callbacks guard room identity, game identity, revision, deadline and settled/finished state. Human timeout policy remains draw / last-tile discard / Pass.
- `hand.actions.canWinClaim`: own Ron eligibility even while another seat's higher-priority Ron is pending; `canRon` still controls actual accepted Ron. Disable Calls cannot pass this waiting win.
- `hand.assistance`: current waits and legal Riichi-discard wait previews with legally visible unseen-copy counts. No future wall draws are read.
- `hand.events`: bounded accepted-action presentation events (`id`, `kind`, `seat`); no private hand contents. IDs increase per room across hands. Reconnect skips historical presentation. This is not a durable replay log.
- `hand.settlement`: only after settlement: score changes from hand-start scores, legal winning hand reveal, or exhaustive-draw Tenpai seats. Riichi deposits are included in the actual score changes; conservation includes unclaimed pot. The overlay shows base hand value separately from settlement deltas (Honba/pot included in deltas).

Client automatic actions use existing socket intents and revision checks. Options persist locally, do not alter server rules, never auto-declare Riichi/Kan, and stop at terminal states. Auto Ron is opt-in legal Ron/Tsumo. Disable Calls preserves Ron including a priority-delayed Ron. Auto Discard is legal drawn-tile tsumogiri and stops on legal Tsumo or post-call no-draw.

Bot policy lives in `server/src/bot.ts` and only consumes `PlayerGameState`. Every decision is dispatched through existing RoomManager methods. Exact shanten is a new pure engine helper; it is not a replacement engine/library. Heuristic open yaku paths currently focus on Tanyao/Yakuhai and visible Dora value; defense is basic Riichi genbutsu/honor/terminal risk.

Presentation assets are configured in `client/src/presentation.tsx` (`performances[character][event]`). Optional voice, animation image/video, sound, duration and camera-emphasis fields are presentation-only. Official files are preserved unchanged. Existing art placeholders and synthesized cues are included; no new official voice clips or rigged models are claimed. Skip/Reduce Effects and reduced-motion support reset transient emphasis and clean timers/audio playback. The four seated characters remain in the original static scene.

See `PRODUCT_DIRECTION_REPORT.md` for final command results, browser screenshots, coverage and limitations.

## v2.7.0 integration

See the root README for exact Windows install/start commands, ports, environment variables, bot modes and documented rules. Socket actions remain session-bound and revision-validated. Win settlement creates a shared cinematic event only after the server accepts the win. Each private state carries the same presentation ID, winner, start/deadline and phase; reconnect does not extend it. Separate server timers end the cinematic and broadcast results. Client playback completion, Skip, reduced effects and loading errors cannot advance the hand. Next Hand is rejected while presentation is playing. All timers are cleaned on room/server closure.

Official runtime MP4 is client/public/cinematics/chinitsu.mp4. Existing V5 master paths are mapped in V5_ASSET_AUDIT.md. Future cinematic video/image/audio/VFX fields are configured in server/src/presentation.ts. Only CHINITSU has a supplied clip; other registered triggers use existing-art placeholders. Current character portraits/presentation images do not constitute rigged seated 3D models.

Developer fixtures live in server/qa/scenarios.ts and are excluded from the normal server entry. npm run qa:scenarios enables a localhost-only, host-owned QA action and a DEV-only selector. NODE_ENV=production rejects this launcher; compiled client has no selector or side-camera path. No match replay is implemented.

## v2.7.1 integration

`server/src/storage.ts` stores checksummed JSON using atomic replacement and validates room identity, scores and physical tile integrity on load. Default CLI location is `.bunny-data/rooms.json`; never expose it through HTTP. The Vite development filesystem allowlist excludes server files and storage. Production deployment must independently protect storage and serve only client/dist. Restart restores exact action and cinematic deadlines; an overdue action uses conservative server auto-play. Recovery is not a distributed deployment or public authentication system.

Engine `getLegalDiscardIds` is shared by authoritative intent validation, player serialization, bot call evaluation and AFK decisions. Clients render allowed choices, but the server revalidates them. Riichi declaration payment is provisional when its discard can be won by Ron and refunded before distributing the carried pot. Win interpretation comparison includes bonuses; unrevealed Ura is only evaluated after a confirmed win.

Client graphics controls affect presentation only. Native-size mobile option/menu bars reserve space outside the scaled game scene; terminal states hide the bar so Next Hand remains reachable. Auto software-GPU detection reduces effects during four-client QA. Actual GPU/device benchmarks remain outside this verification.

## v2.7.2 mobile frame

client/src/viewport.ts defines a width-uniform scene scale and a shared table-plane remap. Scene passes the mapping through CSS variables; the felt region/DOM board and WebGL projection use the same mapping. The Z contribution is retained to preserve upright height and thickness. Resize/style mutations invalidate the actual tile layout. Mobile fills the viewport without a dedicated toolbar; automatic options remain in Settings. Engine authority and serialization are unchanged.
