# Single-player continuation, demand-loaded artwork and movie sound

## Single-player save
- One versioned browser-local slot (`bunny-bot-save-v1`), saved after state publication and on pagehide. Stores the room, private wall/hands, scores, pending claims, riichi and its declaration-tile IDs. This is Bot-only and not a wallet or multiplayer authority.
- Restore uses RoomManager.restoreRooms' physical-tile and point-conservation checks, then reconnects the original human identity and restores their prior takeover status. Old declaration events are not replayed.
- Page-close/loading time is added to all game/presentation deadlines, preserving remaining time. Finished matches reopen at final standings without applying settlement again.
- Lobby offers Continue / New Match; the ready screen explicitly requests a new match, and that intent is consumed only when the active transport connects. Refresh resumes the same match. Invalid data is backed up and a playable new game starts.
- DEMO never overwrites a real Bot save. A new tab claims a local owner key; the old tab stops to avoid competing writes. React StrictMode's discarded constructor no longer installs global listeners or consumes URL intent; bindings follow connect/disconnect.
- Saves stay in the same browser/origin. Browser data deletion, private-mode restrictions, and device changes do not provide cross-device recovery. Failed storage writes produce an in-game message while play remains available.

## Assets
- Removed speculative downloads of all six hoodie poses, nine emotes, and four full mangan posters at entry.
- Prewarm only currently legal own actions and the actual winning characters' required art. Emotes load when the picker is opened; selected full art has high request priority. Video-only winners do not prefetch an unrelated tier poster.
- Coalesced image cache releases old inactive decoded-image references after a 64 MiB estimate. Active images and the currently decoding image can exceed this budget; the browser independently controls its DOM/media cache. This is not a guaranteed total memory limit.
- Existing avatar/portrait fallbacks keep calls/eyes visible during network delay; no visual animation waits for a full-poster decode.

## Movie sound
- Embedded movie audio follows the global SFX slider and audio-unlock state. In-movie mute/unmute updates that same setting and remembers the last positive volume.
- Audible autoplay rejection retries the same movie muted. The existing Open Sound button retries under a user gesture; volume updates do not restart or seek the movie.
- Win-art/movie timers mount only after the loading curtain is ready, and a resumed sequence updates its movie clock when offline time is shifted. Mid-movie lobby continuation and refresh preserve scores and resume the movie before reaching the report.
- Existing voice narration retains the independent Voice slider; movie audio is an embedded mixed track and uses the SFX channel as a whole.

## Validation
- Nine save/restore checks: actual discard/wall/scores, one-hour offline pause, lobby continuation, DEMO isolation, pending claims, riichi/declaration tiles, new match/refresh, tab ownership, finished ranking, corrupt backup.
- Demand-loading request checks, emote picker loads, selected baiman art, movie volume/mute controls, simulated NotAllowedError fallback, inactive decoded-image eviction.
- Typecheck, production build and production browser validation; see qa-73 artifacts.
