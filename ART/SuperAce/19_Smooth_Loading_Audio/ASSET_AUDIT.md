# Runtime asset derivatives audit

Only new `dist/assets/runtime/` files were created. Original ART, runtime JS and CSS were untouched.

- `manifest.json`: flat mapping of 111 original URLs to display WebP assets. Query strings are omitted from keys.
- Full intrinsic resolution WebP derivatives and their manifest are retained outside deployment at `/workspace/work/runtime-full-resolution/`.
- All WebP compression is lossless. Normal/gold cards, two fitted WILDs, CARROT, card-gold-overlay and BACK use max512px height without cropping or enlarging. Six FX use max512px dimension. UI buttons and small components max512px dimension; logos max768px width; rails/dealer/HUD/textures max1536px width without enlargement. Fullscreen rabbit hero and original941px backdrops remain native resolution.
- SVG raster derivatives preserve each original cropped viewBox, including fitted WILDs and rails. No CSS-frame redesign or character redraw.
- Full original SVG/PNG versus intrinsic WebP visible RGBA pixel comparison: normal J, gold K, fitted angel WILD, burst FX and gold rail each 0 different visible channels, maxdelta0. Display variants are separate Lanczos3 runtime downsampling, preserving aspect and alpha with no crop.
- Viewed normal J, gold rail, burst FX and fitted angel display variant. Original art/typography/cropping match; 512px-high WILD remains clear and full-sized within fitted viewport.

See `runtime-assets-report.json` for per-file byte and size data. The111 entries include old CSS selector references that are superseded or hidden; reported total is the complete reference catalog, not actual cold-page transfer. Root must measure the actual active cold-load request graph.

## Final codec tuning pass

The display catalog's21 card assets, six FX, all WILDs and logos remain lossless.81 other textures, UI, backgrounds and hero files now use WebP quality90, alphaQuality100, smartSubsample, effort6. These are re-encoded from original full-resolution lossless masters using the same display resize policy, rather than recompressing another lossy version. All image dimensions remain unchanged in this pass, and alpha is pixel-exact across all81 files.

- Catalog:35,622,758 →11,953,488 bytes (complete111-reference catalog, includes inactive old selectors).
- Root's96 asset startup selection, computed file bytes:25,526,860 →8,148,832 bytes. This is file-size math; root's browser profile is the actual network evidence.
- Hero:1,262,042 →316,736 bytes, composited luminance MSSIM0.99197–0.99201.
- Carrot background:1,406,460 →223,788 bytes, MSSIM0.99314.
- Free backdrop:1,155,184 →124,978 bytes, MSSIM0.99152.
- Portrait background:1,561,850 →185,124 bytes, MSSIM0.98143.
- Gold rail:306,052 →59,254 bytes, MSSIM0.98202.
- Lowest score0.95031 is the fine-grain felt texture; all other images≥0.97883. SSIM is an8×8-block luminance comparison on both black and white alpha composites, not certification of subjective perceptual quality.

`dist/assets/runtime/revision-map.json` maps old display WebP URLs to new content-hashed URLs. Old files are retained temporarily for root to rewrite references safely before cleanup. Full native archival masters stay untouched outside deployment.

Transparent lossy WebP may have arbitrary RGB values where alpha=0. The image preview tool can show those irrelevant values as colored blocks. Alpha-composited browser rendering is the visual truth; alpha was verified identical and SSIM computed after composition.
