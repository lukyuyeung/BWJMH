# CARROT and reward overlay design — 2026-11-08

## Verified source art

All paths below are relative to ART/SuperAce/07_Independent_Art.

- `carrot/bonus.png`: 1254×1254 transparent golden faceted carrot, pink gem, green-gold leaves, CARROT gold wordmark. No rectangular frame exists in this artwork.
- `features/win-big/main.png`: 1254×1254 transparent sculpted gold BIG WIN title, plum/pink edge and starburst. Reuse whole image, with no CSS recreation.
- `features/win-epic/main.png`: 1254×1254 transparent gold EPIC WIN title with crown and laurel. Reuse whole image.
- `features/win-counter/main.png`: 2172×724 transparent black-gold/plum blank amount plate, decorated with gold carrot on left. Keep live amount in right/central blank region; preserve artwork aspect ratio.
- `features/reward-carrot-particles/main.png`: 1254×1254 transparent ring of gold carrots, pink gems and gold trails. Best as a slow scaling/rotating rear layer around amount. This is a complete ring, not an individual particle sheet.
- `carrot/layers/trigger-burst.png`, `aura.png`, `trail.png`: existing high-resolution light layers already available through runtime effects SVG wrappers.
- `currency/carrot-source.png`: original orange carrot icon, only 48×48. Fine for 18–32 px foreground particles, poor for large 80 px particles.

## Important fix

The apparent CARROT rectangle comes from `.cell:before` in `dist/portrait.css`, using `assets/art/v2/card-slot-rim.svg` at z-index 5. Hide this pseudo-element for CARROT cells. Do not erase or redraw the existing CARROT PNG.

## Designed composition

Use a full-stage reward scene with transparent rear ring and darkened background. Keep amount centered horizontally and prevent particle overlap with the amount's readability region.

1. Arrival 0–300 ms: darken game, title rises and settles. Rear burst scales from 0.7 to 1.0.
2. Burst 150–1600 ms: many carrot sprites start near lower center and fan upward to left/right, rotate, then fall below stage. Golden standalone particle artwork is preferable to the 48 px orange currency for large sprites. If no new art is generated, keep original icon small and use existing golden carrot ring as larger visual feature.
3. Count 300–1800 ms: live DM Sans amount counts within original independent win-counter art. Amount plate and title are ahead of rear particles. Keep front particles restricted to screen edges.
4. Hold: final title/amount stay readable until acknowledgement. Tap once finishes counting, next tap exits; no MAX option.
5. Exit 220–300 ms: remaining particles fall, title and plate fade together.

BIG WIN uses one main burst; EPIC WIN uses additional delayed burst and slightly larger rear ring, not a different visual language. Music is unchanged this round.

## Anticipation

Reveal columns left to right. Only revealed CARROTs count toward anticipation. At second revealed CARROT, glow/bob those two and slow only remaining columns; no artificial hold if column 5 revealed the second. Third CARROT receives distinct landing burst and free-game transition. This is a proposed behavior, not a claimed exact reconstruction of JILI without verified footage.
