# Specific value-honor labels in win reports

The score engine already emits a separate one-han Yakuhai entry for each dragon, seat wind and round wind. Display rows now resolve those entries into 役牌・白／發／中, 自風・東／南／西／北 and 場風・東／南. Double winds stay two independent one-han rows. This is presentation only; scoring and yaku order are unchanged.

A shared resultYakuhaiDetails resolver feeds both the report label and existing VO event selection. It follows the engine's white/green/red/seat/round ordering, derives the winner's wind relative to the hand's dealer, and reads winner-specific winningHands before the single-result fallback. This prevents per-winner details from being mixed in double ron. An English descriptor is also available for the report's English setting.

Validation: real evaluateWin fixture matching the reported hand (open honitsu, white, double east) remains 5 han and 12,000 points. Browser checks cover double south, rotated dealer, green/red dragons, non-value wind exclusion, per-winner concealed hands, and actual report row/voice alignment. Typecheck, production build and whitespace check pass.
