# Super Ace audio source and format audit

Source: origin/main `fbad7fde756c630920daf7fe694e820634d99eb0`.

- Read user guide SUPERACE_AUDIO_GUIDE.md. Its description says44.1kHz WAV; actual uploaded WAVs are40000Hz stereo. AAC/M4A runtime derivatives are44100Hz stereo128kbps, faststart, without trimming or adding audio.
- Found37 sourceWAV files in `Bunny_Gala_Riichi_v2.7.2/super_ace_bgm`; actualfolder differs fromguide `bgm/`.
- Guide callsSFX25, but SFXtablelists28 and totalactual37 WAV includes intro andexistingtwoBGMs. Catalog followsactualfiles rather thanincorrectsummarycounts.
- OriginalWAV source size26,163,072bytes; M4A runtime total2,660,500bytes.
- Main andbonusexistingM4A aliases kept, no duplicateencodedcopy.
- All37 runtimefiles decode throughffprobe; durationdifference<60ms each; sourceoriginals unchanged.
- Missing VO (not found in anypath ofcurrentmain tree): vo_superace_yellow.wav, vo_superace_wizard.wav, vo_superace_ninja.wav, vo_superace_king.wav. No replacement or inventedvoicesgenerated.
- This task onlyadded audiofiles andcatalog; noeventwiring/runtimeJS/CSS changes.

| ID | Seconds | Category | Runtime |
|---|---:|---|---|
|auto_spin|1.0|sfx|assets/audio/superace_auto_spin.m4a|
|bet_change|0.88|sfx|assets/audio/superace_bet_change.m4a|
|bgm_bonus|21.0|bgm|assets/audio/superace-bonus.m4a|
|bgm_main|30.5|bgm|assets/audio/superace-main.m4a|
|big_joker|2.78|sfx|assets/audio/superace_big_joker.m4a|
|buy_bonus|2.0|sfx|assets/audio/superace_buy_bonus.m4a|
|card_shuffle|4.0|sfx|assets/audio/superace_card_shuffle.m4a|
|cascade|2.5|sfx|assets/audio/superace_cascade.m4a|
|coins|4.0|sfx|assets/audio/superace_coins.m4a|
|freespin_bigwin|4.5|bgm|assets/audio/superace_freespin_bigwin.m4a|
|freespin_result|5.0|transition|assets/audio/superace_freespin_result.m4a|
|freespin_retrigger|2.0|transition|assets/audio/superace_freespin_retrigger.m4a|
|freespin_trigger|4.0|transition|assets/audio/superace_freespin_trigger.m4a|
|golden_card|2.0|sfx|assets/audio/superace_golden_card.m4a|
|golden_eliminate|2.0|sfx|assets/audio/superace_golden_eliminate.m4a|
|intro|4.0|transition|assets/audio/superace_intro.m4a|
|jackpot|5.0|bgm|assets/audio/superace_jackpot.m4a|
|little_joker|1.5|sfx|assets/audio/superace_little_joker.m4a|
|lobby|15.5|bgm|assets/audio/superace_lobby.m4a|
|mega_win|5.8|bgm|assets/audio/superace_mega_win.m4a|
|multiplier|2.0|sfx|assets/audio/superace_multiplier.m4a|
|no_coins|1.0|sfx|assets/audio/superace_no_coins.m4a|
|no_win|1.5|sfx|assets/audio/superace_no_win.m4a|
|pause|1.0|sfx|assets/audio/superace_pause.m4a|
|paytable_open|2.0|sfx|assets/audio/superace_paytable_open.m4a|
|quit|3.0|sfx|assets/audio/superace_quit.m4a|
|reel_spin|2.5|sfx|assets/audio/superace_reel_spin.m4a|
|reel_stop|0.5|sfx|assets/audio/superace_reel_stop.m4a|
|return_base|3.0|transition|assets/audio/superace_return_base.m4a|
|scatter|2.0|sfx|assets/audio/superace_scatter.m4a|
|scatter_near|3.0|sfx|assets/audio/superace_scatter_near.m4a|
|settings_open|1.0|sfx|assets/audio/superace_settings_open.m4a|
|turbo_spin|6.0|sfx|assets/audio/superace_turbo_spin.m4a|
|ultimate_win|7.5|bgm|assets/audio/superace_ultimate_win.m4a|
|win_big|4.0|bgm|assets/audio/superace_win_big.m4a|
|win_countup|2.0|sfx|assets/audio/superace_win_countup.m4a|
|win_normal|1.5|sfx|assets/audio/superace_win_normal.m4a|
