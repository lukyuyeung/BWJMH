# V5 pre-code audit

Input project ZIP CRC verified; original preserved in baseline before edits. ZIP root and package versions say v2.6.0 despite the v2.6.1 upload name; the supplied upright-hand patch is present. All V5 read-first, manifest, lock and layout documents read before editing.

|Master|Runtime path|SHA256 match|Use|
|---|---|---|---|
|CHARACTER_WIZARD_MASTER.jpeg|`/art/v5/CHARACTER_WIZARD_MASTER.jpeg`|True|Lobby avatar img and official presentation/results identity; gameplay avatar CSS uses prior scene crops|
|CHARACTER_PLAYER_YELLOW_BUNNY_MASTER.png|`/art/v5/CHARACTER_PLAYER_YELLOW_BUNNY_MASTER.png`|True|Lobby avatar img and official presentation/results identity; gameplay avatar CSS uses prior scene crops|
|LOGO_MASTER__DO_NOT_REDRAW.png|`/art/v5/LOGO_MASTER__DO_NOT_REDRAW.png`|True|Brand img|
|CHARACTER_NINJA_MASTER.jpeg|`/art/v5/CHARACTER_NINJA_MASTER.jpeg`|True|Lobby avatar img and official presentation/results identity; gameplay avatar CSS uses prior scene crops|
|TILE_BACK_MASTER__BLACK_GOLD_NO_LOGO.png|`/art/v5/TILE_BACK_MASTER__BLACK_GOLD_NO_LOGO.png`|True|tiles3d.ts decoded master, inset UV crop; CSS fallback|
|TABLE_MATERIAL_MASTER__NOT_GEOMETRY.png|`/art/v5/TABLE_MATERIAL_MASTER__NOT_GEOMETRY.png`|True|Lobby style reference; not a geometry asset|
|ENVIRONMENT_MASTER__STYLE_ONLY.png|`/art/v5/ENVIRONMENT_MASTER__STYLE_ONLY.png`|True|Lobby style reference; not a gameplay background texture|
|CHARACTER_KING_MASTER.jpeg|`/art/v5/CHARACTER_KING_MASTER.jpeg`|True|Lobby avatar img and official presentation/results identity; gameplay avatar CSS uses prior scene crops|

## Missing production assets / existing deviations
No GLB/GLTF/FBX/rigged seated characters, isolated environment cleanplate, full 34-face tile texture atlas, official voice clips, or other Yaku cinematic clips are supplied. Existing casino scene is the prior concept-derived cleanplate, including painted seated Wizard/Ninja/King, not immutable master character pixels or real rigged models. Preserve it per instruction to keep the existing game, but this does **not** meet production master character fidelity. No artwork was regenerated. V5 character images are used unchanged for lobby identity and presentations/results. Gameplay profile CSS overrides those images with prior scene crops; this is a retained deviation, not full master integration. Existing procedural face symbols retained because no locked face atlas exists. Do not call these missing assets complete.

The layout pack excludes a foreground full-body yellow player; latest product instruction requests four visible seated characters. Latest instruction takes precedence, retain the existing small seated Yellow crop clear of the hand.

Official video: H.264/AAC 1280x720, 5.056009 seconds; original SHA256 `2d513f10dc635c363e27f0c6003da1eab368a549eec24f06229913fc31574986`. Runtime copy `/cinematics/chinitsu.mp4` matches byte-for-byte. This clip features Wizard; winner identity is displayed separately, and other character-specific clip variants are missing.
