# Riichi scratch reveal
Only the owner's actual drawn tile after riichi, while awaiting a legal discard, is used. Ordinary draws and other players never receive this overlay. Physical draw animation finishes first; the reveal remains active throughout to block automatic discard. The normal hand renderer keeps the drawn tile concealed during the overlay.

Scratch until 48% of the cover is cleared, or choose direct reveal. Maximum scratch time is ten seconds, capped by remaining authoritative turn time minus 1200 ms. Reveal holds for 550 ms (180 ms with reduced effects), then existing automaticIntent resumes: non-winning tile is discarded once; a tsumo-capable hand keeps its choice unless the player enabled auto win. The turn deadline is not extended. Missing Canvas2D safely releases the presentation. A separate keyed hook watchdog and visibility handling prevent background/unmount from trapping the turn. No game rules, wall order, or score screens change.

QA: qa/riichi-scratch62-qa.mjs exercises real app flow, touch scratch, skip, one discard, tsumo preservation, normal-draw exclusion, and expiry. Character-rush preview is ART only and is not hooked into win or reveal flow.
