# v58 — room tiers and multiplayer lifecycle

## Confirmed decisions

| Room | Entry carrots | Discard window |
| --- | ---: | ---: |
| 新手場 | 2,500 | 30 seconds |
| 中級場 | 25,000 | 20 seconds |
| 高級場 | 250,000 | 10 seconds |

Names are consistent across Bot selection, VS selection and ready screen. `TIER_TURN_MS` / `turnMsForEntry` supply host policy; DemoSocket applies the corresponding setting. TurnClock and resume-control use the room setting. Claim response is independently 12 seconds for all tiers. A discard timeout immediately enables persistent safe BOT takeover until explicit resume. A claim timeout passes that claim without starting persistent takeover.

Disconnected/leaving players keep their seat and original account's financial outcome. RoomManager marks disconnected active players for persistent takeover. Reconnect restores connection but retains takeover until explicit resume. Active games are excluded from disconnected-room garbage collection, including when all four humans leave. Recovery also marks disconnected active humans for takeover. Financial settlement remains the same final-points calculation; this is not a live wallet transaction.

The newest authenticated connection owns a player's seat. `SessionBindings.bind` validates the existing resume credential, returns the displaced connection ID and replaces the owner. The host must close/revoke the displaced socket and call `owns` before *every* action, report acknowledgement and resume request. A stale socket's disconnect cannot disconnect the new owner. Host authentication must associate the platform account with this seat: a client-supplied playerId alone is not authorization. This utility does not create an account service.

## Multiplayer result flow

`TurnClock.results` is a host-owned `ResultClock`, activated for two or more human seats (including offline/AFK seats). A single human with Bots keeps manual reports for practice.

1. Finish the existing shared cinematic, then publish `resultFlow` with an opaque per-hand ID and phase `report`.
2. Every connected human who controls their seat reports completion after all winning reports have counted yaku and shown final points. For double Ron, the UI automatically shows both reports in sequence, then acknowledges once. Clients use `game:report-complete {id}`; the real host must derive player identity from the active authenticated socket, validate its binding and call `clock.results.reportComplete(room, playerId, id)`. No gameplay revision check is needed for this idempotent metadata event. Broadcast changes on host ticks.
3. Once all active readers finish, publish phase `hold` for 3,000 ms. AFK/disconnected seats do not block. The report barrier has a 60-second safety deadline, allowing a suspended or broken client to stop blocking the whole table.
4. Publish phase `scores` for 3,000 ms. The UI uses the server deadline for transfer progress; double Ron draws transfer paths to both winners. Manual advance is hidden and RoomManager rejects direct next-hand requests during shared flow.
5. At the next deadline, the host starts the next hand exactly once and broadcasts it to all seats. Finished matches enter `ranking` instead; no next hand or automatic restart occurs.

A late host tick extends the phase rather than skipping the points screen entirely. Real network arrival/rendering may differ slightly, but the authoritative phase/deadline are common to all seats. Reports finish according to actual voice completion rather than an estimated row count. Muted/reduced-effect readers still acknowledge actual report completion. A stale report ID or unknown player cannot satisfy a new hand's barrier. Viewer selections and acknowledgement identities are not exposed in the public snapshot.

## Validation

- `qa/multiplayer58-qa.ts`: all three exact discard thresholds; persistent takeover and room-length resume window; independent claim deadline; all-reader barrier; exact 3,000 + 3,000 boundaries; early manual advance rejected; stale/unknown acknowledgements rejected; missing acknowledgement deadline; final ranking; reserved seats; active-game retention; new-device replacement and stale-disconnect rejection.
- Existing `qa/autoplay56-qa.ts` and `qa/priority57-qa.ts`: passed, including multi-Ron, privacy and carrot ledger conservation.
- `qa/multiplayer58-browser.mjs`: unified selection/ready names, tier timing, double-report progression, final report acknowledgement and shared score/ranking/next-hand UI.
- TypeScript check and production build.

## Delivery boundary

The public Site remains browser-local Bot play. Its visible tier names and timers are updated. Shared flow and session ownership are implemented as host-ready core and UI, exercised with an isolated developer host harness. This release does **not** connect production matchmaking, platform identities, WebSocket transport or wallets. A production host must wire the callbacks above, keep one authoritative loop, persist room/revision transitions and commit final wallet payouts idempotently. Multi-node hosting needs a shared seat lease rather than the in-memory SessionBindings map. Those deployment integrations cannot be represented as already live by this static Site.
