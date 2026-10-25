# Mangan artwork Demo prototype

Scope: only the public Demo menu's Mangan entry uses this prototype. Regular matches and the other tier/special-hand demos retain their current presentation pending owner review.

The requested `ART/win-cinematic-v3/1tier-collection.png` was not found on fetched main or the update branch. The existing `tier-collection.png` was inspected and its top-left Mangan design used as reference. `mangan-runtime.png` is an image-generated single-scene adaptation with all illustrative tiles removed and an empty emerald tabletop reserved for gameplay tiles. It is copied into the update branch's ART folder.

Sequence: winning state → complete static artwork with actual tiles → 3-second viewing period after all images decode and paint → existing yaku/points report. No intermediate prestige strip, physical tile flip or projected winner light. The prototype does not alter results, points or hand legality.

The demo hand is a legal open Chinitsu, 5 han, 30 fu, dealer Mangan (12,000 points), including one real Chi. The artwork renders authoritative concealed/winning tile IDs plus all actual meld tiles. Called tile rotation, added-kan stacking and closed-kan masking use the shared ResultMeld renderer. Actual red flags and faces are preserved. The winning tile is separated and labelled. The background has no baked tile faces.

Verification: all 11 existing demo hands still pass the legal evaluator, physical 136-tile uniqueness and score conservation check. `qa/mangan-art61-browser.mjs` verifies 14 real tile IDs including the sideways Chi, no old prestige strip/flip/light, three-second viewing then real yaku report with the same Chi, Baiman unchanged, and no browser errors. Screenshot inspected at 1125×634. TypeScript and production build pass.
