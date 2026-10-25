# Bunny Gala — prestige win direction

`baiman-direction.png` is the generated visual concept and storyboard requested by the owner. It references the existing gold voxel bunny. It is an art direction board, not a legal mahjong hand or a texture replacing live tiles. Runtime composes the real winning player's character artwork with typography and the actual winning tiles.

Palette: obsidian, emerald, ivory, champagne gold. No rings, crown outlines, neon cyan or purple wash. Table-wide dimming is retained; reveal lighting is bounded to the winner's projected hand and melds.

Timeline after any existing official cinematic finishes:
- 0–180 ms: table darkens.
- 180–1,800 ms: diagonal character cut-in and hand-limit title. Double Ron presents both winning characters in sequence.
- 1,800–2,450 ms: actual winning tiles flip together.
- 2,450–4,700 ms: architectural spotlights, one specular sweep and sparse gold dust confined to winning tiles; identity caption.
- From 4,900 ms: yaku/score report. No second oversized title explosion over the report.

Both cut-in and physical reveal share a clock started after initial paint. Existing official yaku videos keep their host-owned lifetime and finish before this reveal; small Chi/Pon/Kan/Riichi banners retain their existing behavior. Reduced-motion presentation suppresses motion and lighting.

Tier differences: Mangan has one white spotlight; Haneman two warm shafts; Baiman three champagne shafts and a larger title; Sanbaiman stronger double gold edges; Yakuman ivory-gold contrast. Character identity always follows the winning seat.

## Updated six-tier collection

`tier-collection.png` contains six individually composed escalation designs. Runtime timing and geometry now vary by tier; the earlier fixed timeline above describes the initial v58 design only. See `docs/win-tiers60.md` for current tier timings, special-hand movie order, and Demo tests. Current report presentation has neither a second oversized title explosion nor a second limit-impact sound.

## Full-art Mangan Demo prototype

`mangan-runtime.png` adapts the collection's Mangan panel into a complete screen with empty felt. The public Mangan Demo places the authoritative winning hand and melds on that surface, holds for 3 seconds, then proceeds directly to the yaku report. It bypasses the strip/flip/spotlight sequence for this one Demo only. See `docs/mangan-art61.md`.
