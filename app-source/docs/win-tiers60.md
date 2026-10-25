# Six-tier win collection and complete Demo flow

Art board: `public/art/win-cinematic-v3/tier-collection.png`, also copied to GitHub `ART/win-cinematic-v3/`. Runtime uses real character assets and actual winning tiles; the concept board is not a gameplay texture.

| Tier | Runtime design | Solo cut-in/reveal lead | Dealer Demo payment |
| --- | --- | ---: | ---: |
| Mangan | One champagne rail and one spotlight | 1,800 ms | 12,000 |
| Haneman | Twin amber diagonal blades, angled portrait | 2,000 ms | 18,000 |
| Baiman | Larger title and three champagne shafts | 2,300 ms | 24,000 |
| Sanbaiman | Three layered gold blades, larger composition | 2,600 ms | 36,000 |
| Yakuman | Opening ivory-gold architectural pillars | 3,100 ms | 48,000 |
| Double Yakuman | Double rectangular frame, larger gate, white-gold portrait rim | 3,600 ms | 96,000 |

The first 180 ms darken the table. At the tier lead, the actual tiles flip for 650 ms. Winner-local light continues for 2,250 ms. The yaku report waits until 200 ms after that presentation finishes. Double Ron allocates a separate cut-in slot to each winner before their common tile reveal. Three or more stacked Yakuman reuse the final architecture but display the actual multiplier rather than mislabelling it as double. Normal wins keep the existing small Ron/Tsumo ribbon; the prestige presentation is Mangan or above only.

## Special-hand order

1. A host-timed 900 ms Ron/Tsumo declaration.
2. Exactly one applicable special-hand presentation, using the existing official video if available. Host timestamps retain its complete duration, with the declaration added before it.
3. The evaluated hand limit's character cut-in (Yakuman, double, etc.).
4. Real winning hand flip and winner-local lighting, with global table dimming retained.
5. Yaku/han/fu/points narration. It may name the final limit, but has no repeat impact animation **or impact sound**.
6. In a real multiplayer host, continue through the existing shared 3-second hold and 3-second score transfer; terminal matches enter ranking.

Special-hand choice follows existing engine policy: Daisuushi, Kokushi, Daisangen, Suuankou, Chuuren, then generic stacked Yakuman. When multiple Yakuman coexist, show one representative special presentation, then the actual aggregate limit; all constituent yaku stay in the report. Existing videos: Daisangen / Suuankou / Daisuushi / Chinitsu. Kokushi and other missing-video cases show their named character card and proceed to the correct limit rather than using another hand's clip. No overlapping prestige banner during video.

## Public Demo

The menu now has 11 choices. Six tier-only previews omit special-hand movies so each tier is directly testable. The other five are complete Daisangen, Suuankou, Daisuushi, Chinitsu and Kokushi sequences. All allocate one real 136-tile wall and pass through the real evaluator and payment path. No forced score.limit fields. Tier examples use controlled physical dora indicators, no red tiles, and explicit Riichi/Ippatsu context where applicable. The Demo returns all stakes/riichi sticks within the conserved 100,000-point test ledger. Demo resets remain available after a negative-score match end.

Verification: `qa/tiers60-qa.ts` checks all 11 legal hands, all six limits, exact double Yakuman, physical tile uniqueness and score conservation. `qa/tiers60-browser.mjs` checks all six public menu buttons, titles, tier geometry stages, and full declaration → Daisangen film → Yakuman → tile reveal → completed report, including exactly one impact sound and zero report impact overlay. Existing priority/privacy/settlement and multiplayer clock tests pass; TypeScript and production build pass.

The public Site still uses browser-local Bot play. Production multiplayer transport, account authentication and wallet integration remain separate host integration work.
