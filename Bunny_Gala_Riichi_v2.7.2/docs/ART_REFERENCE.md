# Gala Reference Edition — art integration

Target: the user-supplied `Mahjong2.png` (1536×1024). The earlier UI screenshot was the mismatch to correct. The latest reference takes precedence over earlier composition locks; the original eight V5 image files remain untouched.

## Production asset

`client/public/art/gala-reference-cleanplate-v2.png` is the installed cleanplate; its SHA-256 and provenance are beside it in `.metadata.json`. Created with the built-in image-generation editor, then copied into the actual project and loaded by gameplay CSS. It is a static environment asset, not a playable screenshot.

Edit prompt:

> Edit the supplied Bunny Gala mahjong scene into a clean playable-game background plate, 1536×1024. Preserve the exact camera, architecture, warm pink/gold cinematic lighting, upper-left Bunny Gala neon sign, large wizard on the left, ninja at top center, king on the right, their faces/clothes/poses, polished gold/pink rim, cupholders, green felt and embossed logo. Remove every mahjong tile, standing concealed row, stacked wall, face-up discard, foreground hand and isolated front-right stack. Restore empty green felt. Remove the large circular magnified tile callout, connector and dot, restoring the casino behind them. Remove Rules/Info/Settings/Exit buttons, four player panels, center counter medallion and bottom action buttons; restore the physical scene below them. Keep table geometry and character positions/scale. Do not add tiles, game UI, labels or characters.

No generated game-state image is used for tile contents. The locked tile-back image is sampled at its front-on black/gold inset; actual ivory thickness and bevels are meshes. New Chinese face lettering comes from LXGW WenKai TC 5.3.0, five locally bundled WOFF2 subsets with OFL license. Existing Noto Sans TC remains for general UI. White Dragon remains blank; all 34 face identities come from the private/public payload already used by React.

## Layout and behavior

The background defines the camera composition. WebGL projects actual rounded tile meshes onto the felt; DOM buttons retain input/focus/accessible names. Double walls are illustrative public-count distribution over left/front/right sections, keeping the north player's area free for a readable river. Their layout does not disclose actual wall sequence or break location. Side concealed racks are inclined so the black/gold backs remain legible. Public rivers are single-layer, six tiles per row; they are not walls. Larger rivers scale in their reserved areas rather than being hidden behind the HUD.

The circular magnified-material annotation is intentionally absent from gameplay because it would obstruct the table. Static characters do not animate. Realtime material/reflection lighting approximates the photographic reference rather than claiming pixel identity. The bottom actions and menu panels are functional, not baked art. Extra Riichi/result controls remain below the scene.

## Verification

See `qa-gala-reference/reference-table.png` for the actual browser table, `populated-rivers.png` for later-hand layout, `your-hand-3d.png` for tile detail, and `browser-results.json` for real UI flows. `before-depth-fix.png` records the intermediate clipping defect, not the delivered screen. GPU context loss uses the retained CSS fallback.
