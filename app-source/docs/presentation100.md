# v100 — ninth course and four room tiers

Lesson9 is an untimed graduation exercise with two actual136-tile scenarios. Students discard a genbutsu, identify a yaku, declare riichi with a1000-point payment, scratch a losing draw, tsumogiri, scratch a winning draw and manually choose Tsumo. Real yaku/ura-dora counting and ScoreTransition show engine settlement. Hints are opt-in with incremental frames from physical river projections or actual DOM targets; cards avoid hand, buttons and scratch panel. All11 checkpoints resume by reconstructing physically valid practice state. The300-carrot reward is local, once-only; existing eight-course progress and Bot saves remain independent. Completion leads to beginner character selection, without overwriting an existing game until the normal new-match confirmation.

| Room | Entry carrots | Turn time | Bot policy |
|---|---:|---:|---|
| Beginner / 新手 |1,000|30s|Shanten and simple grouping; no active danger score|
| Intermediate / 中級 |10,000|20s|Visible remaining improving tiles, basic genbutsu defense|
| Advanced / 高級 |100,000|10s|Suji/visible-wall heuristics, dora and red-five retention|
| Master / 雀聖 |1,000,000|10s|Advanced policy plus bounded one-draw shape search and late/leading defense|

Claim response remains12s and timed human entry30s. Explicit rules.tier is persisted and serialized: high and master are separate matching pools despite sharing10s. Old saves lacking tier infer low/medium/high from their former clock. Selection, ready screen, URL, saved summary, BOT fills, final-ranking estimates and pure settlement calculation use the new tiers. Four entry units4/40/400/4000 still lock250 platform units per seat, below the300-unit cap; the platform wallet/matchmaking integration status is unchanged.

Bot profiles now follow character rather than array index: Ninja aggressive, King balanced, Wizard defensive, Hoodie balanced. Explicit caller-supplied profiles remain supported. Master sees only its own hand plus public serialized information. The bounded search compares at most2 distinct discard candidates,4 improving draws each, and possible next discards; it never receives opponents' hands or wall order. This is a heuristic improvement, not an asserted human rank or measured win-rate advantage.

Validation: typecheck/build; ninth-course physical actions and all11 resumes; four separate timed room pools; matching/Bot-fill character invariants; claim priority/privacy and zero-sum settlement regression; one complete seeded East match per Bot tier including legal Ron/Tsumo fixtures; full English phone touch course including hints, wrong answers, both scratches, actual report/transfers/reward and beginner handoff; Chinese desktop and additional English target/scratch layouts; Chinese/English four-tier screens at desktop/landscape/portrait sizes; actual Master ready→Wizard choice→game/save metadata; legacy progress/reward migration; exact lesson translation coverage. Logs: docs/qa-100.
