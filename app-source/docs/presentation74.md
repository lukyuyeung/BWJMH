# Three additional character hands

Added Ninja / King / Wizard materials and cuff geometry to the existing shared round-paw rig. The original Black Hoodie look remains white fur, charcoal sleeve and ribbed cuff. Each rig now has its own role-specific material selection; its actual character comes from seatCharacter and the viewer-relative seat ordering. Model dressing can change without replacing its root, motion or queued tile attachment.

No game rules, movement paths, timing, release callbacks, tile poses, sound/contact timing, motion queue rules or entry/exit calculations were changed. Draw remains 0.52 s; discard and riichi remain 0.72 s; release remains at normalized 0.63. Geometry and materials are shared and disposed with the rig. The game loads no new texture/model assets for these styles.

Art: /art/character-hands-v1/collection.png and separate live-rendered screenshots. Interactive 3D model/motion preview at /art/character-hands-v1/index.html. The preview module is generated from the actual table-hands.ts each build; game runtime does not load the gallery/concept images.

Validation: 120 position/contact/attachment samples compared against frozen v73 black-hand source (qa/fixtures/black-hand-v73.ts); four role assignments and material colors, runtime restyling and resource disposal; 176 sleeve/entry/exit poses across four widths and all four styles; three interactive preview actions; actual mobile-size WebGL touch discard and opponent draw; typecheck and production build.
