# Fix performance regression after language/fullscreen reward update

Remove the document-wide MutationObserver from localization. Translate only when relevant copy is created/updated (HUD, modal, tutorial, countdown, status), with a full pass only on initial startup or explicit language change. Card feeds, reward counters, and effect elements no longer trigger observer scans. All three languages remain available.

Replace the two200%-height CSS reward texture layers and individual falling image elements with one canvas. Backing resolution is independent of device DPR, at most1280px on its longest side. Predecoded textures fill the entire canvas; only12/18foreground sprites (Big/Mega), or6at low quality. Lower tiers render at30fps, high at60fps. Reduced motion renders a static full-frame image. Closing cancels its RAF, zeros the backing store and removes the layer; pause/resume freezes/restores its visual time. Playing-card resolution remains unchanged.

Validation:
-30unit checks pass, engine hash unchanged.
-`qa/smooth-assets.cjs`: card failure/retry, no debit on load failure, no blank visible cards at DPR3 or new image downloads during six cascades, expected payout2148, failed audio doesn't block play.
-`qa/locale-waterfall.cjs`: all three languages/four lessons at320×568 and390×844, explicit entry, remembered language, wallet unchanged, full-viewport bounded canvas, cleanup, reduced-motion static canvas.
-Manual browser checks: Filipino speed label update and canvas freeze/resume/close cleanup.
-`qa/spin-performance.cjs` deterministic seed37, Filipino, DPR3,4×CPU throttle: before/after reports attached. Over50ms frames5→2; p95~16.8ms in both; no blank frames/new image requests, payout2148. Single simulated comparison is diagnostic evidence, not a physical-phone FPS guarantee. Desktop reproduction did not exhibit delayed blank cards; reported mobile regression remains the motivation for reducing both DOM work and image-layer memory.

![Bounded canvas reward](canvas-reward.png)
