# Startup and public entry — 2026-10-24 update

The root URL enters `/design/lobby/index.html`. Selecting a Bot tier opens the existing four-seat ready scene; START enters `/?mode=bot&difficulty=...` with the same scene used as the loading curtain.

Entry waits for the WebGL first frame (or DOM fallback) and currently visible table images. It no longer fetches or decodes `startup-assets.json`, which included the entire optional art library. Character/callout art and the hand animation rig load independently. A 20-second deadline offers Retry; Retry reloads the same game URL so failed resources and renderer initialization can recover. No turn advances while the curtain is present; completion resets the first turn deadline. Optional font downloads do not gate play.

`qa/handover-update-qa.mjs` checks lobby entry, a delayed required avatar, paused hand revision and fresh clock, failed required-image recovery, optional-ribbon failure, touch emotes, and WebGL win effects. Old startup-curtain65 QA describes the superseded full-library gate.
