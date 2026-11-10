# Two-CARROT suspense foreground mix

Only scatter_near level changes0.7→1.4, doubling linear gain (~+6dB) before the existing limiter and user SFX-volume setting. While the suspense voice is active, background music ducks to20% of its normal target (previous generic SFX duck60%). Existing120ms attack and450ms release apply. Loop trigger, once-per-round protection, third-CARROT/end-of-reels stopping, roll overlap, audio preferences and all other cue levels remain unchanged.

`qa/suspense-mix.cjs` browser check: default effective suspense gain0.686 (was0.343); duplicate trigger produces one playing loop; actual background gain falls to~20%; stopping suspense restores normal gain without stopping background music. No game/math/art/animation changes.
