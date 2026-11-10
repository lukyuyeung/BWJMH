# Minimal card-visibility recovery on the version28baseline

Keep the original clone/overflow-viewport dealer/refill animation. Do not reintroduce direct-card reparenting, negative clip-paths, language observer, full-board DOM decode or changed reward renderer. No audio, card resolution, model or stake change.

Reproduction: inject a paused .feed-card animation with never-resolving finished Promise into the unmodified baseline. After2200ms, busy=true, hiddenCards=20, waiting=20. The same injection after this patch yields busy=false, hiddenCards=0, waiting=0. This proves a stuck-completion hidden-card path exists; it does not establish every physical iPhone blank has this cause.

Targeted changes:
-Finish/cancel events and native Promise complete each feed, with an idempotent visibility release.
-One pausable fallback per column/refill explicitly completes stuck feeds. No per-frame board scan, image decode, new clip method or changed normal duration.
-Cancel tracked stale card motions when revealing the original so a reused face cannot retain an old opacity/transform.
-At round cleanup, release remaining feeds and cover images.
-Only on an actual img error: show the underlying original for a broken flying clone; original image retries its known source twice (1500ms timeout each), then uses retained cached image pixels as a local PNG fallback. If local data-image fallback is rejected, restore the original cached URI once; no recursive retry loop.
-Recovery diagnostics are held locally in galaDebug.getCardRecovery(),30image events max. No external reporting or periodic DOM inspection.

Evidence:
-`qa/baseline-card-visibility.cjs`: normal/lost completion/stalled feeds atDPR3, all20cards visible, no stale covers/flight nodes, no new DOM decode, correct seed37payout2148; guard does not advance during1800ms pause;2failed image retries followed by cached fallback without wager; rejected data fallback restores original URL.
-`qa/baseline-card-stress.cjs`:5consecutive repeat-seed rounds with multiple cascades,20visible cards each, zero emergency-guard activations on normal playback, no residue/broken images, expected final2740.
-`qa/smooth-assets.cjs` passes core load failure/retry/no charge, DPR3six-cascade card images/no extra image downloads, payout2148, failed audio nonblocking.
-30baseline unit checks pass; unchanged engine SHA25629c2450576a70eeede358247b26bc99c671200dac8f24deea3642513904e179e.

Safari/iPhone hardware is unavailable here; official WebKit download was previously blocked403. Do not claim a physical-device fix for all possible missing-image/compositor/memory cases from Chromium fault injection alone. User confirmation remains necessary.
