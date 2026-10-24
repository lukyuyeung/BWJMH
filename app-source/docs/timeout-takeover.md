# 30-second timeout takeover and full-table dimming

The table-wide shade returns for mangan+ anticipation, flip and landing while local spotlights stay on the winner's tiles. Reduced motion continues to suppress animated decoration.

A human who uses their full discard window without acting enters persistent `autoPlay` mode. The current legal drawn tile is discarded; later draws/discards and claim passes happen without another 30-second wait. This is conservative tsumogiri assistance, not the strategic Bot AI: it does not declare riichi, call melds, or choose a win on behalf of the player. Identity, score, seat, ownership and `isBot` remain unchanged. If a drawn tile is unavailable or illegal following a call, only a legal discard is selected. Claim-window expiry alone does not activate takeover. Takeover persists across hands and room snapshots.

`RoomManager.expirePlayerTurn` checks the host deadline, current discard seat, and settled/cinematic state before enabling takeover. `advanceAutoPlay` performs at most one legal action per host tick. `resumeControl` allows the connected owner to return; the UI has a visible takeover notice and return button. Reconnect alone does not silently cancel takeover. Active human controls and riichi scratch are suppressed while assistance is active.

## Multiplayer host integration (not yet deployed)
The public Site remains the local Bot demo. No matchmaking, authentication or multiplayer server was introduced by this update. `rules/turn-clock.ts` is an authoritative-host module tested against a four-human RoomManager simulation. A real host must:

1. Own one TurnClock per RoomManager and call `clock.tick(room)` on its loop, after applying motion/cinematic pauses. Broadcast and persist after a returned change; it increments the revision once.
2. Use only the host's current time/deadline. Do not accept a client `timeout` or player ID as proof of expiry.
3. Implement authenticated `game:resume-control` using the socket's verified session player ID, retain revision checks, then broadcast/persist. Do not apply a peer-supplied player ID.
4. Broadcast the initialized `actionDeadline` even when the first tick makes no move; include `autoPlay` in public player data. Do not run the old timeout scheduler alongside TurnClock.
5. Pace visible automatic moves on the host and honor in-flight presentation gates; cancel/rebuild clocks after process recovery, and use room persistence for takeover flags.

Tests: `qa/autoplay56-qa.ts` covers four humans, exact expiry, legal tsumogiri, repeat takeover, identity, reclaim, claim timeouts and persistence. `qa/autoplay56-browser.mjs` checks takeover UI, touch return, and table shade with winner-only light. The local transport exercises the same RoomManager policy while retaining its existing presentation loop.
