# Mahjong priorities — v57

## Confirmed product rules

Four-player East match only, starting at 25,000 points each. Zero or negative points ends the match immediately when the scoring transaction is accepted; a provisional riichi declaration still gives legal Ron claims their response window before a deposit is accepted or refunded. The engine preserves the full winning payment before testing bankruptcy, so double Ron is settled atomically before termination. No South extension is introduced.

Priority: Ron > Pon / open Kan > Chi. A lower-priority click is a stored intention, never an immediate meld. Higher-priority eligible players may respond until the host deadline; passing or timeout releases the lower call. There is no extra delay for players with no eligible response. The private view exposes only the viewer's pending response, not the identity or options of other responders.

Multiple Ron: two winners are both paid regardless of arrival order; three Ron declarations abort the hand without Ron payment and add one honba. Dealer continues if either double-Ron winner is dealer. Each double-Ron winner receives their normal Ron payment plus honba; riichi sticks are awarded once to the winner closest after the discarder. Triple-Ron draw retains riichi sticks. Any sticks still present when the East match ends go to first place, closing the 100,000-point ledger before carrot settlement. Equal ranks use initial seat order.

The two winning hands flip together; lighting is confined to both winners' own rows/melds. The result bar has two selectable hand reports and one shared score transfer. Triple Ron has a distinct draw label.

## Carrot rooms and settlement

Three entry amounts: 2,500 / 25,000 / 250,000. Four wallets each reserve their entry for the whole East match. The platform's first three room units (10 / 100 / 1000) make each entry 250 units, within its 300-unit per-seat cap. No poker rules or blinds are imported.

Uncapped net = entry × (final points − 25,000) / 25,000. Loss is capped at one entry. Where a negative score makes the uncapped total exceed actual losses, gains are allocated proportionally from actual capped losses. A single deterministic largest-remainder pass makes every payout an integer and the total exactly four entries. Payout includes the reserved principal. A platform adapter can use maxPayoutMultiple 4; this update is a calculation module, not a live wallet transaction. Spectator/wallet authorization remains the host's responsibility.

Example: entry 2,500, final 30,000 / 20,000 / 25,000 / 25,000 gives net +500 / −500 / 0 / 0 and payouts 3,000 / 2,000 / 2,500 / 2,500. No rank bonus, fee or additional exchange rate is silently introduced.

## Bot verification

Seeded matches use the actual RoomManager, legal actions and actual Bot strategy with all four seats controlled. No timeout fallback rescues a stuck Bot. The harness checks 136 unique physical tiles and point conservation, fails if nobody progresses, and also forces legal Ron/Tsumo scenarios for every difficulty.

| Difficulty | East matches | Hands | State-changing actions | Tsumo hands | Ron hands | Draw hands | Failures |
|---|---:|---:|---:|---:|---:|---:|---:|
| low | 30 | 160 | 19,114 | 25 | 94 | 41 | 0 |
| medium | 30 | 163 | 18,289 | 53 | 76 | 34 | 0 |
| high | 30 | 168 | 18,639 | 53 | 81 | 34 | 0 |
| total | 90 | 491 | 56,042 | 131 | 251 | 109 | 0 |

These are operational checks, not a claim of strong human-level play or proof against all possible long matches. The longest sampled match had 10 hands / 1,241 state-changing actions. The platform's 2,000-loop guard still needs integration stress testing for unusually long renchan; it is not changed here. Detailed reproducible seed statistics are under docs/qa-57/.

## Other verification

- Real 136-tile competition: Chi first waits, Pon overrides Chi, Ron overrides both; duplicate intent rejected.
- Double Ron: both arrival orders, two payments, shared sticks only once, conserved points.
- Triple Ron: no premature double payment; abortive draw / honba.
- Four seat views plus spectator: hidden tile IDs, live wall, resume tokens and other claim responses absent; snapshots do not alias the authoritative room.
- All three carrot entries: zero/negative cap, integer rounding, principal return and exact conservation, including 2,000 deterministic generated score distributions.
- Zero-point draw and accepted zero-point riichi end the match; no next hand.
- Four-human host-clock takeover/resume tests continue to pass.
- Mobile Chromium: queued Chi acknowledgement, actual double-hand flip, report selection, triple draw label, three entry cards. Riichi scratch gating regression passes.

## Framework integration status

This implements/tests the mahjong core and updates the existing public local-Bot Site. It does not introduce a production GameModule, matchmaking/authentication service or real money movement. The uploaded kit's flattened workspace and missing reference-game files remain separate delivery issues. Do not run both its Table clock and our TurnClock for the same live room. Persistent 30-second takeover still requires the real host to adopt the tested policy rather than using only one-turn fallback.

## External reference check

The general pattern of accepting Chi but waiting for Pon / pass is explicitly documented by the online mahjong operator Maru-Jan: https://www.maru-jan.com/qr/guide/help/faq.html (FAQ about Pon after Chi). A public primary Mahjong Soul page specifying exact button scheduling was not located, so no claim is made that its UI internals were verified. The implemented rules above follow the user's confirmed table rules, including double Ron / triple-Ron draw.
