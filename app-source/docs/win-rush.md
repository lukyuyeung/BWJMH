# Pre-reveal character rush
For Mangan or greater, the local character rush follows the normal win declaration. It begins 1100 ms after winning-state presentation and runs 2150 ms. No hand-value, yaku or point text appears. The physical winning-hand reveal is delayed by 2350 ms, preserving its previous 900 ms initial wait; result presentation is delayed by the same amount. The win report and its VO sequencing are unchanged.

The winner is resolved from the actual player/bot profile, not a fixed seat-to-character lookup. Reduced-motion or skipped-animation settings omit this additional presentation. If an existing synchronized cinematic plays, the rush and reveal begin after it finishes. Scoring and game state are unchanged.

QA: win-rush63 checks a real WebGL winning hand, correct Ninja character, an empty text layer, waiting before reveal, and completed hand reveal before the report.
