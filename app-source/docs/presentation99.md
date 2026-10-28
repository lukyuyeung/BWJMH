# v99 — three lobby entrances in a single row

The home lobby now presents Bunny Academy, Bot Match and VS Players as three equal illustrated cards in a single row. Narrow portrait layouts retain that row with horizontal scrolling and keyboard-accessible buttons; landscape phones and desktop show the three cards together.

Approved artwork sources:
- ART/academy-entry-v1/teacher-concept.png — wizard teacher, clear ninja eyes and black-gold tabletop tile backs.
- ART/bot-entry-v2/bot-concept.png — user-supplied red-visor robot identity,13 thick black-gold tiles.
- ART/multiplayer-entry-v2/players-concept.png — hoodie rabbit separated from table,13 tiles per side, near-side hands lying face down.

Serving assets are optimized WebP at public/design/lobby/{academy,bot,vs}-mode.webp. Removed obsolete HTML tile overlays, so only the approved physical tile artwork is shown. Full artwork is visible above a separate caption area, preserving all tile rows and character details.

Academy progress and the300-carrot first-completion reward remain visible before entry. Existing academy, bot tier/character selection and multiplayer information routes are preserved. The multiplayer backend status remains accurately displayed.

Validation: production-browser desktop1440×900, landscape844×390 and portrait390×844 in Chinese/English: three equal cards at one y-position, images loaded, no text clipping/page overflow, all cards reachable. Navigation checks cover8 live lessons, bot tiers and four-character selection, and multiplayer status. Exact English coverage, typecheck and build pass. See docs/qa-99.
