# Full character collection and public rollout

The approved four-shot Mangan prototype now covers every non-video Mangan-or-higher win in the public game, including all Bot seats. It no longer depends on Demo flags.

## Assets and mapping

`public/art/win-cinematic-v4/` contains 24 distinct full-scene PNGs: yellow / king / ninja / wizard × Mangan / Haneman / Baiman / Sanbaiman / Yakuman / Double Yakuman. Each was generated with the approved diagonal black/gold direction and the corresponding existing character reference. Character-specific crown, sword, scarf, staff, robe, beard and colours are retained. Higher tiers add increasingly ornate gold blades/architecture/gates. Every foreground is empty felt: actual concealed, meld and winning tiles are composed from the authoritative result.

The directory's README is a clickable 4×6 art catalogue; manifest.json records filenames, byte counts and SHA-256 hashes. The same collection is copied to GitHub `ART/win-cinematic-v4/`.

The existing seatCharacter mapping selects the actual winner's visual identity. Demo adds an explicit four-character selector; it overrides only the preview's visual role and never the evaluator, winning seat or wallet/account identity. Both the result portrait and artwork use that override. New hands clear the override.

## Presentation

Immediate dim → eye cut-in → real tile/Chi/Pon/Kan reveal → full-scene impact → real yaku/points report. Four Mangan eye scenes are reused across their character's higher tiers for consistent eye framing; the final scenes remain individually designed. Total scene durations increase from 5.5 seconds at Mangan to 6.9 seconds at Double Yakuman. Three-or-more stacked Yakuman display the actual multiplier over the highest-tier composition.

Double Ron sequences each qualifying winner's own character, art, hand and melds before the shared report/score transfer. Lower-limit co-winners remain in the result report. The authoritative host's score/ranking phase overrides a delayed visual sequence. A single host still owns multiplayer progression; this does not introduce a live multiplayer transport.

Dedicated videos remain exclusive: movie → yaku report, without an additional tier sequence. Smaller wins keep the existing call ribbon. No second limit-impact animation/sound during yaku narration. Reduced-motion preferences suppress transforms and flash. Four eye scenes warm on table entry; higher-tier backgrounds load on demand. A failed download or eight-second load deadline falls back to the correct role portrait and textual limit and still completes.

## Verification

- 24 PNGs exist, have valid PNG signatures and distinct hashes.
- `qa/win-art63-qa.ts`: all four roles across 11 legal hand fixtures; public non-Demo activation; video exclusion; correct roles; both double-Ron results/hands; all 24 routes.
- `qa/win-art63-browser.mjs`: all 24 role/tier choices, complete four-shot progression, exact actual tile IDs/melds, report transition, image-error fallback; no browser errors. Uses canvas fallback to check the full UI matrix without duplicating GPU stress for every asset.
- `qa/win-art63-live-browser.mjs`: actual WebGL table, all four non-Demo winning seats with correct roles, both double-Ron sequences before shared reports; no browser errors.
- `qa/direction62-browser.mjs`: approved shot progression and exclusive Chinitsu/Daisangen/Suuankou/Daisuushi videos still pass.
- Existing priority/privacy/carrot settlement and authoritative clock/takeover/session checks pass.
- All character eye crops and representative final compositions visually inspected. TypeScript and production build pass.

The public Site remains the existing browser-local Bot game. The artwork rollout is live gameplay UI; production matchmaking, platform authentication and wallet integration remain separate work.
