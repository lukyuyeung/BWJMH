# Winner-local high-hand lighting

The v55 presentation replaces the full-table shade, center ring, and full-screen high-hand character rush. The existing yakuman/hand cinematic videos and final result screens are retained. Decorative light starts at the winning row; other seats do not glow or shake.

`win-impact.ts` selects warm-white mangan spotlights, rose-gold haneman sweeps/motes, icy-blue baiman double rings, red-gold sanbaiman triple rings, and violet-gold yakuman crown light. The hand flips together after a 700ms local lead-in; the 650ms flip is followed by a local landing light show. Result handoff remains at 4400ms after the cinematic. Non-limit hands use the existing reveal; reduced motion and skipped animations suppress decorative lights.

`physical-table.tsx` projects only the winner's real tile geometry into stage coordinates. The row effect rotates for side seats and follows viewport/panorama changes. Winner melds receive individual smaller lights. No full-stage pseudo-element, global camera shake, or nonwinner tile glow is used. Effects are DOM/CSS, reuse the existing renderer clock, add no image requests, and are removed on cleanup. Existing approved tile faces and avatars remain unchanged.

QA: `node qa/winner-light55-qa.mjs` at Vite port 5195 verifies all five tiers, four seats, winner-only melds, local bounds, absence of full-stage shading and full-screen rush, result handoff, low-hand exclusion, and reduced motion. Tier fixtures alter presentation metadata only and are loaded exclusively through the existing development-only QA hook; they do not change production scoring. The riichi scratch/hidden-tsumo regression also passes. Physical iOS/Android testing remains outstanding.
