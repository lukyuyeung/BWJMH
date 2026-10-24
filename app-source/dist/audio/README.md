# Bunny Gala audio

Place game audio files in these folders:

- `music/`: background music (lobby, table, riichi, results).
- `voices/`: character recordings, grouped by character (`yellow/`, `wizard/`, `ninja/`, `king/`).
- `sfx/`: sound effects (tiles, calls, interface, scoring).

Use lowercase filenames with hyphens, for example `music/lobby.mp3` or `voices/ninja/pon.mp3`. MP3 is recommended for broad browser support.

Files here are public assets when the game is deployed. Adding files alone does not connect them to game events; playback must be configured separately. Keep source archives and unapproved/private files outside `public/`.
