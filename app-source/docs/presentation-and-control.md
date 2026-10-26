# Presentation order, champion preview and control return — 2026-10-26

## Ranking design, awaiting review

`public/art/final-ranking-v2/index.html` is an independent interactive design preview. Four role buttons select the first-place transparent character on the left, matching name/avatar and rotated example standings. Four screenshots are exported beside it and copied into GitHub root `ART/final-ranking-v2`. The game Demo menu links to this preview. The runtime terminal ranking remains unchanged pending design approval. Carrot numbers in this page are clearly marked examples, not wallet entries.

## Winning presentation

- Any Double Ron starts with one shared 2,200 ms two-hand reveal. Both actual concealed hands flip face-up; each has its name/Ron label and actual melds. No higher-tier effect can start before this stage.
- Remaining effects follow accepted winner order. A small co-winner needs only the shared reveal; artwork winners use eye cut-in → actual reveal → full tier image. Two qualifying winners each receive their own sequence.
- Every dedicated-video winner, single or double, gets DIM (240 ms) → eye cut-in (remaining 1,210 ms) → the appropriate video. No tier-image overlay or additional reveal is layered over the dedicated video. The server-core plan owns all segment deadlines and accounts for the prefix duration.
- The same widened eye lens is shared between artwork and movies. The display band is 310 px high and framing is calibrated separately for all four roles. Reused artwork contains the correct character.
- Reports count one hand completely before changing to the other, including local Bot/Demo. The first hand's final total stays visible for 900 ms before moving on. The score button remains hidden until the last report completes. There are no parallel report selectors/pages. Shared acknowledgements occur only after all reports and also work when the host report barrier arrives late.

## Timeout control repair

Control-return requests previously passed through animation locks in PhoneTable, App and DemoSocket. Continuous Bot motions could therefore discard a tap before reaching RoomManager. The return notice also lacked dedicated touch placement/styling.

`game:resume-control` is now an idempotent control request, separate from tile actions. It bypasses those animation locks and game-action revision races, retains connected-seat validation, does not reserve another tile motion, publishes current control state and refreshes the owner deadline where applicable. Tile actions retain their original guards. The touch button has a 44 px minimum target and an explicit visible notice above the hand.

## Verification

- TypeScript and production build.
- `qa/flow65-qa.ts`: shared two-hand reveal, video eye prefixes, continuous timeline, mixed small/large and two-small routing.
- `qa/flow65-browser.mjs`: four ranking cutouts and screenshots; landscape mobile touch timeout → persistent takeover → resume while motion is deliberately locked; all four eye crops and exclusive movies; two-winner flip/eye/video ordering; a single sequential report; late shared barrier and one score transfer. Browser errors: none. Chromium touch emulation is not physical iOS/Android device certification.
- Responsibility/Nagashi, claim priority/privacy/carrot and multiplayer timer/session/result-clock core regression suites pass.

Production multiplayer transport, durable recovery and wallet integration retain the boundary described in `special-rules-release.md`.
