# Special-rule release — 2026-10-26

## Delivered to public Bot game

- RULE_POLICY now adopts responsibility payment for Daisangen / Daisuushi and Nagashi Mangan under the fixed variants in the guide.
- Responsibility is derived from ordered public meld history (including the called tile and source); a later added Kan preserves the original call. Only the corresponding Yakuman units change payers. Other units, honba and deposits are handled separately.
- Settlement records exact positive transfer edges. The report lists responsible payers and the transfer animation follows those edges rather than assuming all Tsumo wins have three payers.
- Exhaustive draws check full historical river eligibility, including tiles removed by calls. Multiple Nagashi winners are calculated together; no noten transfer or concealed tenpai reveal occurs. Dealer order assigns the single deposit. New `settlement.kind: nagashi_mangan`, river presentation and guide text make this distinct from a normal winning hand.
- Server-core `winSequence` orders both Double Ron winners' actual video/art/call segments, starting with an 800 ms double declaration. Each winner keeps its own result and tiles. Public live wins use it without Demo markers. Dedicated videos remain exclusive of tier artwork.
- Timeline-based entry supports a late snapshot joining the current segment; result reports follow the common end time. Host scores/ranking still override slow clients. Images and videos have fallback paths; video loading/stall checks cannot cause a payout.
- Three or more actual Yakuman units display the correct multiplier in clips and reports; no misleading Double Yakuman report image.
- Demo adds responsibility, Nagashi, two Chinitsu Double Ron videos and a legal three-Yakuman hand. Physical-tile fixtures preserve all 136 unique tiles.

## Validation

`qa/special64-qa.ts`: legal demo physical inventory, Daisangen/Daisuushi composite responsibility, dealer and nondealer Ron/Tsumo, same/different payer, honba once, multi-Nagashi mutual net, deposit/dealer, privacy, result clock barrier, exact points, idempotent completed draw, atomic bankruptcy and real three-Yakuman evaluation.

`qa/special64-browser.mjs`: actual software WebGL page, river layout/dark background/privacy, sequential two-winner clips and reports, exact responsible-payer edge, correct multiplier, failed video still reaches result, no page errors. JSON in `docs/qa-64/browser.json`.

Existing claim/privacy/carrot core, tier/takeover/session/result-clock and four-character win checks were also rerun. Four-character × six-tier browser matrix remains the baseline for unchanged artwork.

## Explicit remaining integration boundary

The public Site is still browser-local Bot play. This release does not claim that production matching, platform login, persistent room recovery, transactional wallet payouts or all-offline server continuation are live. The provided framework exists; its static turnMs, empty-actor loop exit, 2,000-iteration cap, financial-owner/Bot coupling and restart-refund behavior need the integration work recorded in the approved design. No platform contract or platform core was modified in this release.

The approved full design is `handover/2026-10-26/special-cases-design.md` in the GitHub branch. Rules and visuals above are implemented; durable server / wallet behavior in that design remains an integration deliverable rather than a static-site feature.
