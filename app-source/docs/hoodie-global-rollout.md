# Black hoodie rabbit rollout — 2026-10-26

The saved/internal role key `yellow` is retained for role mapping, Demo selections and existing Japanese voice files. All active visual entry points now identify that role as 黑帽T兔 / Black Hoodie Bunny with the approved bare-headed grey rabbit and black hoodie, hood down.

## Delivered assets

- Approved original transparent portrait, plus **21 unique newly generated images**: nine reactions, six action poses and six limit-tier cinematic scenes. True RGBA transparency verified for all 15 emote/action cutouts.
- Exact 400×400 pixel avatar found in the older v2.6.0 reference package. `avatar.jpg` is copied byte-for-byte from the same reference supplied by the user, not regenerated. SHA-256: `a564f0ef589f947a280c29264d46161401fd5cc13aea12973f6cd3403d8a3662`.
- Four-character lobby scene replaces the old five-character golden-bunny backdrop, and the VS scene's hood-up rabbit. The separate robot Bot-mode character is retained.

Canonical current assets, inventory/hashes and browsable gallery: `/art/hoodie-v3/`. GitHub copy: `ART/hoodie-v3`. Historical design folders and internal audio identifiers remain for compatibility; current rendering uses fresh URLs to avoid cached golden-bunny portraits.

## Integration

`src/character-art.ts` supplies portrait, avatar and per-action cut-in routes. Chi, Pon, Kan, Riichi, Ron and Tsumo have distinct poses; Ankan/Kakan reuse the Kan character pose with the existing event lettering. Full nine-emote picker and reaction bubbles use the new set. All six tiers use current artwork with actual live winning tiles and melds. The eye lens uses the approved portrait independently of tier composition, with a calibrated upright crop.

Updated table HUD, report portraits, score transfer portraits, first-place ranking hero and avatars, Demo character names, cinematic winner/fallback portrait, lobby/ready/loading screen, final-ranking interactive preview and legacy portrait aliases. Legacy 3D demo golden-skin aliases use the hoodie rig; the active physical table already uses grey paws and dark cuffs.

Special-hand films retain their existing non-golden story characters and existing exclusive playback sequence. They are not claimed to have been regenerated. The current double-Ron / sequential-report and timeout-resume logic is preserved. Runtime final-ranking layout remains the existing layout pending separate design approval, with correct first-place character mapping; the new ranking design is still available for review.

## Verification

- `qa/hoodie67-browser.mjs`: exact avatar hash; four champion switches; lobby/ready routes; nine emote choices and sent reactions; six actual RibbonCutin component poses; six legal Demo tier animations and correct report portrait; no page errors.
- `qa/flow65-browser.mjs`: mobile touch resume during forced motion lock; all role eye→film flows; both Double Ron hands flip, ordered effects, sequential complete reports; late shared barrier and one score transfer.
- Existing claim priority/privacy/carrot and multiplayer timer/session/result-clock core suites pass.
- PNG inventory has 21 distinct hashes, 15 transparent cutouts. TypeScript and production build pass.

Public Site remains browser-local Bot play; production multiplayer transport and wallet boundaries are unchanged.
