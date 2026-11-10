# Measured card rendering bottlenecks

User confirmed affected platform iPhone/iPad. Audio rollback did not remove the earlier card-path changes. Before further edits, captured timeline/decoded-image instrumentation for same seed37, Filipino,390×844 DPR3,4×CPU. Current card patch called DOM image.decode140times through six cascades, including unchanged healthy cards. Pre-language reference2bc4ece called0. This repeated decode work and full-board await barrier were introduced by the card recovery patch, not by the audio gain parameter.

Fixes:
-Healthy complete DOM images with nonzero dimensions return immediately; existing shared retained texture cache is already decoded. Failure retry/timeout remains for actual incomplete/broken images. Repeated DOM decode count140→0in the measured six-cascade round.
-Remove extended negative clip-path from moving cells. Move the original card element through a plain overflow-hidden viewport using transform, then reattach it. No cloned card/image. Cancel stale card transforms before reuse; preserve finish-event/Promise and pausable timeout guards.
-Display:none/hidden for inactive scene layers. Only outgoing/incoming layers render during crossfade; one visible after it settles. Preserve scene designs and smooth transitions.
-Change only root entry plus affected module versions; do not churn every script/style/audio cache key. Audio unchanged.

Evidence: attached raw reports. Current→fixed trace: no blank images, payout2148both, repeated decode140→0. PrePaint total496.65→403.15ms, raster876.79→737.60ms; >50ms frame samples6→4. Single throttled Chromium traces fluctuate and are NOT an iPhone FPS guarantee. Aggregate decode durations overlap and must not be described as wall-clock delay. WebKit browser install was attempted through official Playwright mirrors but downloads were denied403by environment network policy; no Safari verification is claimed.

Validation: `qa/card-hot-path.cjs` asserts zero in-round DOM decode/negative clip paths/broken card images,20final cards, no feed residue, one settled live scene, payout2148. Updated `qa/card-reveal-recovery.cjs` injects stalled viewport animations and lost completion, confirms all20cards recover with correct payout, pause/resume doesn't advance guard, broken image restores, valid image never waits for stalled decode. `qa/smooth-assets.cjs` passes core failure/retry/no-debit, DPR3six-cascade image stability and audio nonblocking.33unit checks pass; engine SHA256 unchanged29c2450576a70eeede358247b26bc99c671200dac8f24deea3642513904e179e.
