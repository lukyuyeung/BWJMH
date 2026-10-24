# Public game audio integration — 2026-10-23

The user now explicitly consented to publicly adding the earlier 136 yaku recordings (reply 「同意」 to the specific approval question). This release includes both the 128 new GitHub recordings and that earlier set. The rejected version 41 remains undeployed; this is a newly built release with latency fixes. ART was not changed or deployed.

## Imported assets

- Latest GitHub `lukyuyeung/BWJMH`, commit `88296b4b42170305d55f4899a5f65fc08fdbd6ea`, directory `Bunny_Gala_Riichi_v2.7.2/client/public/audio/`: 204 WAV originals, Git blob SHA-1 verified before conversion.
- 2 BGM, 26 SFX, 176 uploaded VO files (44 each for yellow, wizard, ninja and king).
- Earlier user ZIP: 136 yaku voices (34 per character), now explicitly approved for public release; original/repaired WAVs remain in the ignored source directory.
- Public delivery: 340 MP3 files, 44.1 kHz. BGM 128 kbps; voices/SFX 64 kbps. Source WAVs remain outside the deployment.
- Public inventory: `/audio/manifest.json`, including file durations, role/event paths and source commit. Missing clips are skipped, never voiced by another character.

## Runtime

`public/audio/player.js` is shared by the static lobby and React table. Music starts after a browser gesture. Lobby and table have separate looping tracks. Settings persist locally, with independent music, voice and SFX volumes. Voice playback queues one at a time and ducks music. Common calls and result voice clips are warmed before display. At most four SFX play concurrently. Hidden pages, navigation and cinematics stop/pause the relevant audio. Returning to a result does not replay a completed announcement.

- Lobby navigation: click SFX; lobby BGM.
- Table: draw/discard/riichi-stick sounds at physical hand contact, or immediate state update when rendering is reduced/unavailable. Existing hand motion scheduling and camera geometry are unchanged.
- Ribbons: actual character chi/pon/kan/riichi/ron/tsumo; claims and riichi bell.
- Dora: additional indicator reveal.
- Results: ordinary yaku names (specific dragon/seat/round wind from the actual hand), dora/aka/ura, uploaded yakuman names, general win reactions and limit clips. Special SFX for chankan, haitei, ippatsu and rinshan. Leaving the page cancels that voice scope; result animations do not wait for audio.
- Draw results: tenpai/noten only from public settlement; abortive draw does not falsely announce noten.
- Scores: transfer sound and rank-up sound aligned with rank-update timing; existing point-transfer layout unchanged.
- Final ranking: own match-end/rank reaction when available.
- Private tenpai/furiten/time hints: own player only, opt-in and off by default. No hidden opponent hints.

Some uploaded recordings describe events not currently implemented (e.g. chombo penalties, network reconnect in the browser-local Bot mode) or variants not distinguished by the engine (pure/double yakuman waits). These assets are included and indexed but are not played under an unrelated event. No riichi/results BGM was uploaded; table music remains the available table track, with cinematic suspension.

## Validation

- `npm run typecheck`, `npm run build`.
- `qa/audio-public-qa.mjs`: all 340 MP3s decoded in Chromium, lobby/table BGM, persistent sliders, serial voice queue, missing-role skip, scope cancellation, actual win and transfer flow, no duplicate transfer sound on reopening, cinematic hold, private hints off, no browser errors.
- `qa/audio-contact-qa.mjs`: actual WebGL hand contact triggers draw SFX within 100 ms.

Browser decoding/playback checks do not constitute a Japanese pronunciation/semantic listening review. Real iOS/Android device playback remains to be tested.

## Latency fix

Original WAV inspection found the discard impact at 0.8307 s, click at 0.2108 s, draw at 0.1013 s and yellow pon voice at ~0.287 s. `scripts/prepare-audio-latency.py` removes only leading low-level/empty audio in delivery copies (8 ms SFX padding, 20 ms voice padding); originals are untouched. Discard trims 0.8227 s, click 0.2029 s, draw 0.0933 s and yellow pon 0.2669 s. Music is not trimmed. Manifest records each trim and cache-versioned URLs prevent reuse of old delivery copies.

SFX are predecoded into an interactive-latency AudioContext, with contact sounds first. Hot-path playback starts an AudioBufferSource without fetch/HTML media decode. A cold effect that takes over 65 ms to prepare is dropped instead of playing out of time later. Voice buffers use a bounded cache; common calls remain pinned. HTML audio is only a compatibility fallback and for the music stream.

`qa/audio-latency-qa.mjs` verifies decoded audible onset below 30 ms (measured discard ~3.6 ms, draw ~8.1 ms, click ~7 ms), 12 buffered triggers under 10 ms with no additional SFX requests, plus slow-network drop behavior. These are software/buffer checks, not a physical speaker latency measurement. The browser still reports hardware/output latency; iOS/Android/Bluetooth end-to-end latency cannot be promised as zero.

## Declaration-only discard cue and missing basic voices

Discard audio now uses a per-hand tracker shared by physical contacts and fallback rendering. A specific declaration tile can produce the special riichi-placement sound once per player. Later discards stay ordinary, and duplicate fallback/contact events cannot double-play a tile. `qa/discard-audio-qa.mjs` covers four seats, forty subsequent discards, duplicate contact, stale remapping and next-hand reset; `qa/riichi-audio-flow-qa.mjs` verifies actual WebGL declaration contact and suppression of a repeated contact callback. Later-discard policy is covered by the deterministic tracker test; the standard riichi fixture can end with a Bot win before the next own turn.

GitHub audio commit `ced9c6edeec452f1d5e6c51fa8bffac7728f02be` is missing 11 basic call recordings: ninja chi/pon/kan/riichi/ron and king chi/pon/kan/riichi/ron/tsumo. Ninja tsumo is available. They cannot be connected until supplied; no other character's voice is substituted. A filename checklist is added to BWJMH's audio/voices/MISSING-RECORDINGS.md.

## Complete VO upload update

Source commit `88296b4b42170305d55f4899a5f65fc08fdbd6ea` supplies 76 additional VO recordings. The previous missing-recordings note above is historical: all four characters now have all six basic calls, plus 44 uploaded VO files each. The GitHub checklist is marked resolved. Combined with the 136 earlier yaku voices, the public manifest has 312 voices and 340 total MP3 files. Delivery copies retain onset trimming and buffer preloading, with `vo52` cache versioning. `qa/voices52-qa.mjs` checks all 24 role/call combinations against their own recordings. Riichi declaration-only discard policy is unchanged.

## VO-driven result presentation

The user requested removal of the shuffle/dice sound and a paced, narrated yaku list, followed by the final limit announcement. `shuffle` is no longer triggered or preloaded; the runtime also ignores that cue defensively. The original recording remains in the asset inventory.

`useWinReport` replaces the fixed 160 ms row reveal and independent grade timer. Each visible row is paired with the winning character's corresponding VO start, waits for actual playback completion, then holds for at least 850 ms total with a 180 ms gap. Missing/muted/unavailable narration uses the same visual minimum. Unknown yaku retain their row slot rather than shifting subsequent narration. Yakuman rows do not show ignored dora bonuses.

After all rows finish: total han/fu appears, then the appropriate mangan/haneman/baiman/sanbaiman/yakuman/double/counted-yakuman VO and central grade art; points follow the grade voice. The central art stays visible through the announcement. The previous generic win-reaction line and introductory jingle are no longer inserted into this report sequence. Reduced-motion presentation retains sequential content without movement. Completed reports reopen without replay; early navigation aborts pending waits and voice promises. StrictMode cleanup is safe. Point-transfer layout and existing discard-contact policy are unchanged.

`qa/win-report53-qa.mjs`: actual per-row voice start/end vs DOM reveal, no shuffle even if explicitly requested, early navigation cancellation, a real chinitsu/sanbaiman fixture reaching its grade only after all yaku voices, muted fallback, completed review and no browser errors. All seven grade keys are present for all four characters in the manifest.

## Ninja voice audit: Riichi / Chiitoitsu

The user reported a possible yellow voice during ninja yaku narration, specifically Riichi and Chiitoitsu. Manifest audit found no cross-character mappings among 312 voice entries; Ninja recordings are not byte-identical to the other character counterparts. `qa/ninja-voice55-qa.mjs` builds a valid South/Ninja Riichi + Chiitoitsu win with all 136 physical tiles accounted for. Actual playback trace uses Ninja's Riichi, Menzen Tsumo, Chiitoitsu, aka dora and mangan files only.

Defensive change: a result report claims exclusive ownership of the voice queue for its winner and scope, cancels any earlier pending speech, and rejects foreign character/scoped narration until leaving the report. Audio resolution validates the requested character against the asset path. Own private hints no longer enqueue after a hand ends. Locks release safely on cleanup/StrictMode/navigation. The regression test attempts to inject yellow Riichi/Chiitoitsu during the Ninja report and verifies rejection, then verifies yellow calls can play again after exiting.

This verifies routing and isolation, not the perceived speaker identity of the original recordings. No recordings were swapped or relabeled based solely on their filenames. `/audio/voice-check/index.html` provides isolated Ninja/yellow Riichi and Chiitoitsu sources, plus Ninja's newer declaration Riichi voice, for an audible comparison of the two supplied recording batches.


## Tile-name voices (61)
136 new user recordings (34 per character), Git blob SHA verified against pinned source in tile-voice-sources.json. Rebuild with scripts/import-tile-voices.py --cache <download directory>. Original WAVs are preserved outside delivery assets; only trimmed MP3 copies ship. src/tile-voice.ts explicitly maps all 34 face codes; source spelling hachihin maps to 8p. Red fives use the ordinary five name because no distinct red-five recording was supplied.

Tile names trigger once at actual discard contact (or existing reduced-motion/fallback discard path). The riichi declaration keeps its riichi call instead of a competing tile name. Public discard and own visible hand voices prewarm; hidden opponent tiles are not inspected. New tile names replace older tile names, skip while an important call is active, and abandon a cold start more than 350 ms late. Calls interrupt disposable tile readings; win-report narrator lock is unchanged. No playback waits are added to game turns.
