# Wait indicators and red-five geometry
Explicit Riichi selection uses a full-face pink lamp, without the old outline or frame asset. Ordinary discard candidates receive no recommendation class. Hovering (or held touch inspection) over a tile computes structural waits for the hand after removing that tile. It uses only owned tiles, public discards/melds and visible dora indicators; the discarded tile remains in visible counts. Counts are unseen copies, not known live-wall counts. Existing touch tap/hold separation is preserved.

Actual tenpai and prospective waits share a frameless light strip. Tenpai and Furiten status labels use identical 100×26 logical dimensions, with soft pink light markers. Individual available waits have face lighting; exhausted waits are dimmed.

Original red-five PNGs and atlas files are unchanged. scripts/normalize-red-five-art.py measures glyph bounds, creates SVG transforms to match ordinary-five glyph bounds, and updates the shared complete-art assets and master. DOM, hand, river, meld, dora and result rendering use the shared URLs. The browser rasterization QA compares final red/normal symbol bounds within two pixels.

QA: wait-indicators64-qa.mjs covers hover counts, explicit Riichi lamps, no automatic recommendation, touch release, and uniform frameless statuses. red-five64-qa.mjs validates all three normalized surfaces and complete SVG decoding. Actual WebGL readiness and Riichi lamps were also checked.
