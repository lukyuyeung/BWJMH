# Mobile hand inspection

Holding or scrubbing across hand tiles selects one physical tile, lifts it, and shows its face with the total matching tiles currently in the four discard rivers. Counts do not include melds or concealed tiles. Red fives share their ordinary face count. Release clears selection; holds, scrubs and cancellations never discard. Existing quick taps still discard once. Covered tiles are excluded from inspection.

3D foreground geometry follows the CSS lift during the short transform transition. Reduced-motion users receive the selection without a transition. Pointer event timestamps distinguish physical tap duration from renderer processing delays.

Validated native Chromium mobile touch in both fallback and WebGL: counts 3 and 0, switching exactly one selected tile, clear on release, hold/scrub/out-and-back/cancel safety, one discard on a quick tap, desktop hover. Typecheck and production build pass.
