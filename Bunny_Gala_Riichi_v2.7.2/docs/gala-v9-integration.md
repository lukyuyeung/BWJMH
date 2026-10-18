# V9 presentation integration

Source: `riichi-bunny-banner-preview`, published version 17, source commit
`6f80b4f2f05512cdadb7d243f0409b2dd44bc75a` (`/game?v=9&tour=1`).

The playable client now loads the reference's models, furniture, casino background,
camera framing, black/gold tile back, tile face artwork, riichi banner and C call
artwork. Only runtime assets are included; the modelling downloads and demonstration
director are excluded.

`gala-state.ts` converts the existing player's server payload into a presentation
snapshot with relative seats. The scene receives public walls, indicator tiles,
concealed counts, rivers and melds. Private hands and action permissions stay in the
main client. Existing React controls, timers, score calculations, winning cinematics
and results continue to use the existing authoritative server contracts.

`gala-v9/live.js` renders those snapshots. Real changes trigger the model's draw and
discard clips; public claim discards also receive a short tile transition. These
clips do not change game state or delay server actions. The demonstration's scripted
352-tile board, sample scoring, camera tours and example settlements are not used.
The preview's full choreography (dice/deal and all per-finger contact sequences) is
not connected to the server by this change.

The scene and host validate both message origin and source. Reduced/disabled motion
is respected. If loading or WebGL fails, the existing interactive renderer remains
available. Own-hand buttons and authoritative action handlers are preserved.

Validation: full typecheck; production build; 163 engine and 108 existing server
tests; two new presentation-state tests covering seat rotation, public/private data
separation, red tiles, dora, and added/closed kan. Browser visual acceptance remains
pending because the supported browser QA tool was unavailable in this environment.

Reference art provenance is retained in
`client/public/gala-v9/game-art/asset-provenance.json`; font licences are included.
