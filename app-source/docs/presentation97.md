# v97 — simplified inspection and declaration before big wins

- Removed the persistent river-copy counter popup and the tenpai/riichi wait strip. Holding and sliding still raises the inspected tile and lights matching river tiles purple; releasing does not discard. Rules and win eligibility remain authoritative.
- Ron/Tsumo/Pass use the normal 108px action baseline. Pass consequence captions sit above the buttons.
- Added a shared 1200ms Ron/Tsumo declaration segment before each big-win eye/art/video performance. Reuses the existing character ribbon and voice. Declaration claims the voice scope so unrelated table speech cannot delay it. Art music starts after the declaration.
- Shared server sequence duration includes the declaration. Double Ron keeps its initial two-hand reveal and sequential per-winner performances/results. Special-video yaku remain declaration → eyes → dedicated video.
- Updated Lessons1/5/8, English text, tutorial design notes and guide frames for the simplified UI. Lesson8 still requires actual hold/slide and correct answers; its reward and persistence are unchanged.

Validation: typecheck/build; call97-core and updated flow65 sequence assertions; exact English coverage; selected mobile tutorial frames; full English Lesson8 touch flow; production UI saved-room and cinematic browser checks. Logs in docs/qa-97.
