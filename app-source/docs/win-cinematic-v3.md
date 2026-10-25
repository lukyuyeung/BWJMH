# Win presentation redesign

The v57 transient event queue dropped limit events whenever Ron/Tsumo appeared in the same update. Wins now have a dedicated result-owned character cut-in, independent of that queue. Claim banners remain in the original renderer. Shared post-paint timing keeps the cut-in before the real tile flip and prevents the report from covering the reveal.

Art direction and storyboard: `public/art/win-cinematic-v3/baiman-direction.png`; design notes and timeline are in that directory's README. A copy is delivered under the GitHub branch's `ART/win-cinematic-v3/` folder. The concept's illustrated tiles are not used as gameplay tiles.

The old ellipse rings, crown outline, neon colors and tile-enclosing glow were removed. The table dims globally. Spotlights and reflection stay in each winning seat's projected hand/meld region. The report uses the same emerald/black/gold palette, with no second giant limit pop-up blocking the yaku. Existing official videos are preserved.

The wait panel is centered at 53% of table width (slightly right of center), with 32×47 tiles instead of 26×39. Purple tile overlay, glowing status dot and summed unseen-tile count are removed. Per-face remaining counts, hover previews and Furiten status remain.

Validation:
- `qa/cinematic59-browser.mjs`: Baiman banners for all four winning seats even with no presentation events; no old ring/crown nodes; light confined to the corresponding winner; exact panel alignment; larger waiting tiles; no face tint or total; no browser errors.
- `qa/multiplayer58-browser.mjs`: both double-Ron reports finish before the shared barrier; score phase, final ranking and tier labels/timing pass. This completes the browser check interrupted in the previous session.
- `qa/multiplayer58-qa.ts` and `qa/priority57-qa.ts`: shared 3+3 seconds, takeover, session replacement, privacy and settlement tests pass.
- TypeScript and production build.

Delivery still includes a browser-local public Bot game and host-ready multiplayer core, not live matchmaking or wallet integration. See `multiplayer-flow58.md` for host callbacks and integration requirements.
