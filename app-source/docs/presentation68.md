# Actual ranking delivery and presentation latency repair — 2026-10-26

## Root causes and fixes

The actual terminal branch of ScoreTransition still rendered the legacy throne/list layout. The approved design existed only as a standalone preview. This release replaces that branch with `FinalRanking`, without a Demo-only activation condition. Its names, champion, role, scores and ordering all come from the actual completed match. A separate CSS namespace prevents the old jade-avatar crop/rotation rules and legacy ranking backgrounds from leaking into the new layout.

The new page follows the approved dark-green/gold champion-left design. Four full avatars are displayed intact, and the player's carrot estimate uses the existing capped/conserved calculator and selected room tier. Bot amounts are explicitly estimates, with no wallet transaction. Restart and return-to-lobby are live. The public Demo includes an entry that reaches this same actual ranking component; four role screenshots are in ART/final-ranking-v2/live-*.png.

WinArt used to wait for all images, including the large full scene and every tile, before starting its timer. The host plan was already advancing, so a slow full-scene download could skip the entire eye stage. A failed full scene also suppressed eyes. WinArt now starts its visual clock on mount, independently loads the full scene asynchronously, and never makes eye visibility depend on the full-scene request. Eye assets use the critical decoded-image cache, with the original avatar as an immediate fallback while a portrait loads. The standalone scene and authoritative sequence both retain their original stage lengths.

RibbonCutin also waited for every image decode, desynchronizing the visible call from its voice and delaying queued calls. It now starts on the first animation frame, uses the cached portrait immediately when the action pose is still pending, and swaps to the correct action pose after decoding. The completion callback no longer waits for a network response. Failed preloads can retry on later calls.

Preloading now prioritizes the player's eyes, portrait and small call layers. Optional poses, emotes and full scenes are warmed with limited concurrency rather than allowing all large assets to compete with the first frame. Emotes retain an immediate avatar fallback while a reaction image is pending, and the entrance fade reaches full visibility sooner. Dedicated video fetching starts during the preceding eye segment.

## Verification

- `qa/presentation68-browser.mjs` deliberately blocks all six action PNGs: each call has a visible first-frame fallback and completes without waiting for downloads. It separately blocks the full Mangan scene while verifying an actually decoded, painted eye stage. All six tiers, dedicated film prefix, four live ranking roles, real score/net display, restart and the ordinary report→scores→terminal ranking route pass.
- `qa/live68-browser.mjs` uses actual WebGL, landscape mobile dimensions and touch input. It records a decoded, visible eye frame before the film, with no page errors. This is browser device emulation, not physical-device certification.
- Full nine-emote / six-action / six-tier integration check rerun, plus claim/privacy/carrot and timer/session/result-clock core regressions.
- TypeScript and production build pass. Evidence is in docs/qa-68.

Existing ranking design-review notes describe older releases; the actual terminal layout is now integrated. Production multiplayer hosting and wallet settlement remain separate from this browser-local Bot Site.

The final cold-cache check (`qa/cold68-browser.mjs`) additionally holds both the large character portrait and the action pose before the first call. The original decoded 400px avatar is used immediately, so even a completely cold character image cannot leave the call portrait empty. Evidence: docs/qa-68/cold68-browser.json.
