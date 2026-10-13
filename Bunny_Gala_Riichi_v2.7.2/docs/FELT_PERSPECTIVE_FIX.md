# Felt and seated character correction

Public tiles previously used an affine rectangle independently of the photographed
felt. Side river tiles were also stretched by seat, and the camera had no height
perspective, collapsing upright side racks into lines.

`client/src/felt-projection.ts` now supplies the same perspective transform to DOM
poses and WebGL. Public tile bodies have 22 stage units of thickness and their
bottom faces contact Z=0. Wall stacks retain their actual occupied slots and
upper/lower draw order. Rivers keep chronological six-column ordering and normal
50×68 faces for every seat. The center display sits between the four rivers.

Characters remain transparent 2D sprites. They are smaller and positioned over
the existing chair seats, with feet cropped at the seat boundary. Player cards
sit below the side characters instead of covering their faces. The old debug
information bar no longer covers the backdrop. No extra viewing buttons were added.

Validation:

- `npm run typecheck` and `npm run build`.
- `node --import tsx scripts/browser-felt.mjs`: actual exhaustive-hand public
  payload at 1902×900, 844×390, and 915×412; screenshots, tile contact checks,
  unobscured center and screen bounds. Portrait is not covered by this check.
- `QA_CHROMIUM_PATH=/usr/bin/chromium node --import tsx scripts/browser-fullscreen.ts`:
  four landscape mobile sizes and claim/result flow.
- `QA_CHROMIUM_PATH=/usr/bin/chromium node --import tsx scripts/browser-table-ui.mjs`:
  direct entry, reconnection, all five meld variants, legal contextual controls,
  river ordering and discarded-face visibility. Bot timeout scheduling is frozen
  only in this fixture so screenshots cannot race chankan settlement.

With the photographed perspective, the smallest dense phone river faces are
about 23×9 pixels at 844×390; this is a measured limitation, not a guarantee of
legibility on every device. No independent seat stretching or extra inspector
is used to conceal this tradeoff.
