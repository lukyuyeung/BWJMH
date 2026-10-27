# Beginner screenshot guide and first-visit tour

The existing question-mark button now opens a 12-chapter screenshot handbook, with access to the full existing yaku catalog and a replayable five-step live interface tour. First-time local Bot visits automatically show the tour after table startup. Skip/close and entering the yaku catalog persist the browser's seen flag. No multiplayer first-visit modal or client-side pause is introduced.

Five actual WebGL screenshots captured from developer fixtures illustrate the interface, inspection, pon, riichi and furiten. Images have region frames and can expand to a full-table view. Four sets plus one pair has a physical tile illustration. Text distinguishes one-yaku requirement from dora, explains quick taps versus inspection and gives basic call/riichi/furiten context.

Opening local Bot help or the yaku catalog pauses the existing local clock and scheduler; closing shifts all local clocks by the reading interval. BFCache restore preserves an open help pause. Touch hit testing ignores dialogs, so page controls cannot discard underlying tiles. Human reading does not pause a real table and is labelled accordingly.

Checks: first-visit tour, hand touch blocked by modal, five tour steps, all 12 images decoded, image expansion/back, 14-tile example, unchanged revision while reading and restored deadline, help reopened, yaku catalog reached, seen flag survives reload. Actual WebGL hand inspection regression and compiled production smoke are recorded in qa-80.
