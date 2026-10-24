# Public game update — 2026-10-24

## Baseline and source
Recovered the full Sites history, including public v51 `3604c628a428a412b93d6b054580d947581e0d14` and v52 `c4fbd13576d7317bb31e4863ef1b865421a3e8b4`. This update retains v51 game rules, art, voices and touch handling, and repairs the v52 startup gate. GitHub's older `Bunny_Gala_Riichi_v2.7.2/` is a separate historical project. The `app-source/` directory on the update branch is the complete current Sites application.

## Behavior
- Root URL enters the lobby; START retains the four-seat ready/loading scene.
- Only the first playable table frame and visible images gate play, with a bounded retry path and paused game clock.
- Approved original sheets from `handover/2026-10-24/emotes/` are retained under `assets/emote-masters/`; 36 transparent 192px lossless WebP stickers are generated under `public/art/emotes/`. No new character artwork or avatars were generated.
- The button beside the timer opens the local player's nine reactions, displays the selection beside their seat for three seconds, and applies a three-second cooldown. This remains a local Bot feature.
- Mangan+ cut-in is followed by table dimming, simultaneous existing hand flip and a restrained landing ring. Renderer phase boundaries synchronize effects; reduced motion disables them.

## Build and QA
Node 22+; `npm ci`, `npm run typecheck`, `npm run build`. Preview: `npm exec vite -- --host 127.0.0.1 --port 5195`; run `node qa/handover-update-qa.mjs` with `/usr/bin/chromium` available. Browser QA uses Chromium mobile emulation and software WebGL, not physical iOS/Android devices.

Sources and package-lock are included; `dist/` is the generated static output declared by `.openai/hosting.json`. The emote source pipeline is `python scripts/prepare-emotes.py` (Pillow required), normally unnecessary for application builds. Asset provenance remains the original Sites history and the four user-approved GitHub sheets; third-party licensing must be checked separately before distribution beyond the existing game.

## Remaining product work
Real multiplayer, authoritative server clocks, authentication, reconnection, APP bridge and wallet/carrot settlement remain unimplemented. No live currency transaction or multiplayer service is implied. Physical iOS/Android audio unlock, safe areas and performance still need device QA.

## Verification completed
- TypeScript and production build from a clean `npm ci`: passed.
- Chromium mobile touch: hold, move, cancel and scrub do not discard; quick tap discards exactly once: passed.
- English PON action and all six English ribbon layers: passed.
- Required-avatar loading hold, untouched revision, fresh clock, retry recovery and nonblocking optional ribbon failure: passed.
- Nine own-character emotes, touch selection, three-second lifetime and cooldown: passed.
- Software WebGL first frame, high-hand flip/landing phases and return to the existing win banner: passed.
