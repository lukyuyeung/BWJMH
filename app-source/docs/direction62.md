# Mangan Demo: animate the direction board

Owner-selected direction: `ART/win-cinematic-v3/baiman-direction.png`. Its upper-left branding/words were removed with image editing while preserving the scene and storyboard. `mangan-runtime.png` is the corresponding single-scene Mangan adaptation: diagonal character band, no upper-left writing, empty felt for actual gameplay tiles. Runtime cache URL is versioned for this revision.

## Four camera beats (Mangan Demo only)

| Time after decoded assets/first paint | Shot |
| --- | --- |
| Immediately, including while loading | Entire table covered by 86% dark layer |
| 0–240 ms | Dark anticipation |
| 240–1,450 ms | Diagonal close-up of both eyes, horizontal cut-in/tracking, one light slash |
| 1,450–2,800 ms | Real concealed tiles, Chi and winning tile rise/reveal with a short per-tile stagger |
| 2,800–5,500 ms | Complete artwork punches in, one short warm flash and restrained camera recoil; actual tiles settle onto the artwork's felt |
| From 5,500 ms | Existing yaku/han/fu/points report, without a second impact |

All 14 tile IDs and the sideways called Chi remain authoritative. No painted concept tiles or changed score fields are used. Tile reveal is contained in the cinematic component; the old physical flip and projected lights remain bypassed for this Demo. Image decode and two animation frames precede the timed sequence. Reduced-motion preferences disable transforms/flash while retaining the informational stages.

## Dedicated-video exception (all actual wins and demos)

A winning hand with a configured `cinematic.video` starts that video directly, using its full host-owned duration. It no longer adds the earlier 900 ms declaration, tier cut-in, table flip or tier lighting before/after the movie. At movie completion it enters the yaku/points report directly. This covers Chinitsu, Daisangen, Suuankou and Daisuushi with their existing clips. Missing-video cases retain their current fallback route; this revision does not invent clips.

Verification: `qa/direction62-browser.mjs` verifies each Mangan shot in order, full dimming, all 14 tile IDs/Chi, full-image impact and subsequent report. It then tests each of the four dedicated-video demos: immediate video, no declaration/tier overlap, direct report, no active winner light. Screenshots of eyes, tile reveal and full artwork inspected. No browser errors. All 11 real Demo hands continue passing evaluator/tile-uniqueness/score-conservation checks. TypeScript and production build pass.

This supersedes the earlier static Mangan Demo and the earlier movie-plus-tier sequence. Other non-video tier previews are unchanged pending review of this Mangan direction.
