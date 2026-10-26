# Win CUT IN score, ranking cleanup, lobby audio close

## Sound design
Original synthesized stereo score, composed by scripts/compose-win-cutin.py. No music-generation connector is available; the source score is reproducible with NumPy and ffmpeg.

- 0.00 s dark sub swell
- 0.24 s eye slash, ascending stereo whoosh
- 1.45 s actual tile reveal, ascending crystalline D-minor/add9 notes
- 2.80 s full-art low drum/sub-drop and harmonic ensemble impact
- 3.10 s existing winning character's grade VO, with the score already reduced to leave room for speech
- 5.20 s score tail ends; existing higher-tier visual hold lengths remain unchanged

Silver: mangan/haneman. Gold: baiman/sanbaiman. Divine: yakuman/double yakuman. Triple+ uses existing yakuman VO, rather than incorrectly announcing double yakuman. Dedicated movies receive only the 1.45-second eye prefix, which is stopped before video. Their existing report VO remains available.

The new owned cinematic bus obeys SFX volume and does not get silenced by the table's presentation hold. It seeks to visual age after late decode, stops on unmount/winner transition/backgrounding, and ducks table music. Grade VO uses the existing queue and voice volume; successful playback is recorded so the yaku report does not repeat the grade. If a grade was not actually played, report narration remains its fallback. Calls/contact SFX still use their existing low-latency path.

## UI
Remove the duplicate personal-carrot block at the bottom of actual final rankings and the ART preview. Keep each seat's existing estimate column. Refresh four runtime screenshots.

Set lobby audio dialog Close to dark text on a gold button (11.6:1 measured contrast, 44 px touch target), with an accessible dialog label.

## Validation
- Six tiers with real decoded Web Audio playback, correct winning role and voice during impact; all four roles covered. Mangan report completes without duplicate grade narration.
- Actual engine yakuman win with table audio held: cinematic music and winning VO play.
- Dedicated-video eye prefix ends before the movie; no full-tier score overlaps it.
- Late-start seek, mute settings, four real final-ranking roles, desktop/mobile lobby close, no browser errors.
- Typecheck, production build and diff whitespace check.
