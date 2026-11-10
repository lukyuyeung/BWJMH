# Card visibility and loading recovery

Address two failure paths rather than only reduce reward effects:

1. Dealer/refill moves the original decoded board card, instead of cloning an image into a separate flight viewport and switching back on landing. A temporary column clip retains dealer alignment and is removed at landing. No duplicate card images/texture hand-off.
2. Animation completion uses finish/cancel events as well as the finished Promise. A pausable presentation-clock fallback explicitly settles stuck feeds and reveals their original cards. It does not advance results/RNG. Round-final cleanup removes stale waiting/active flags, clips and reveal covers.
3. Actual newly rendered board image elements are decoded before their feed starts. Image errors restore their original known source with bounded retries, including one cache-busting retry. Failure does not recursively retry forever. A stalled decode Promise times out; an already valid complete image can proceed instead of hanging. Critical failures preserve the existing round journal.

Verification:
-`qa/card-reveal-recovery.cjs`: inject never-resolving animation.finished; all20cards visible, no hidden feed/cover/clone residue, deterministic payout2148. Inject paused feeds plus missing finish/cancel callbacks and throwing finish(): fallback restores all45initial/refill cards, correct2148. Pause1800ms during that case confirms fallback clock does not advance while paused. Failed post-load image source restores without any wager. A valid image with never-resolving decode returns after~2500ms.
-`qa/smooth-assets.cjs`: blocked/retried core asset, no wager on failure, retry/recovery, DPR3/no blank images or fresh image downloads through6cascades, payout2148, failed audio nonblocking.
-`qa/session-speed.cjs`: normal/fast label/icon/scale and current ledger persistence still pass.
-33unit checks passed; math engine SHA256 unchanged29c2450576a70eeede358247b26bc99c671200dac8f24deea3642513904e179e.

Fault injection confirms recovery for these specific paths; it does not claim reproduction of every physical-phone browser failure. Card art dimensions, game probabilities, suspense timing and sound cues remain unchanged.
