# Character selection and timed human-room entry

## Public Bot flow
Ready screen offers Black Hoodie / King / Ninja / Wizard. Confirmation sets the player's role; the three Bots use the three remaining roles. Each game therefore contains all four once, independent of AI difficulty/personality. Canonical high-resolution character art is reused. Preference is stored only after confirmation. Saves retain per-player character; existing saves without the field preserve prior defaults.

Player.character is propagated through public serialization and seatCharacter, so avatars, emotes, call ribbons/VO, eyes, hand styles, art, result narration and final standings share the same identity. No owner-always-yellow override remains except legacy fallback. DEMO initial choice follows the player's current role, and its explicit preview override remains independent.

## Human entry policy (shared authoritative rules and UI; network service not enabled here)
RoomManager.matchTimedRoom groups available rooms by tier. First human starts one absolute 30-second deadline; joiners do not reset it. Duplicate choices are allowed. setCharacter validates identity/phase and rejects choices at or after the deadline. Manual early start is rejected. Timed rooms cannot manually fill Bots early or change tier rules. At deadline, tickTimedEntry uses current choices, fills remaining seats, retains an offline human seat under takeover, marks readiness, starts exactly once and clears the lobby deadline. tickTimedEntries supplies a server-owned scheduler integration point.

CharacterRoom consumes room.selection {deadline,serverNow}; countdown uses elapsed monotonic client time. It shows all four choices without uniqueness locks and disables input at zero. It never invents seats or starts a match locally. Same-character people are distinguished by nicknames/seat/you-human-Bot tags.

## Required server transport wiring
The public site still imports DemoSocket and its VS lobby remains disabled. Do not present this as live human matching. The provided legacy server snapshot must be wired to the updated shared rules and real authenticated sessions before opening that entry.

Suggested authenticated socket contract:
- room:match {name,character,difficulty}: call matchTimedRoom, attach the authenticated player's session to the returned room, persist, broadcast public lobby state, ack playerId/resumeToken/room. Enforce the platform's one-active-seat-per-account policy in the transport, not from client-supplied identity.
- room:select-character {character}: obtain roomCode/playerId from the current authenticated socket session; call setCharacter; increment revision; persist and broadcast. Never take playerId or deadline from the payload.
- Poll tickTimedEntries on the authoritative host clock (e.g. every 100 ms); persist each change and broadcast each player's private game state on start.
- Retain the existing session replacement, player-private serialization, action timers, result clocks, reserved-seat and reconnect policies. Wallet lock/settlement must remain server owned.

The UI and rules are ready, but publishing this static site does not deploy that service. A production HTTP/WebSocket endpoint is still required; requested from the owner during this task.

## Validation
All four Bot roles through the real ready-screen/start/reload flow; unique remaining Bot roles; own avatars/emotes/hand style; actual King riichi VO/ribbon. Human duplicate choices, shared deadline, last-tick changes, late joins/choices, no manual early start/fill, tier pool isolation, offline-seat takeover, idempotent start, point/privacy checks. CharacterRoom screenshot and countdown tested against actual RoomManager state in a local component harness; it is labelled a design preview. Existing claim/payment/privacy/timer/special-result regressions remain passing.
