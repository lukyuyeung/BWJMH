# iPhone recovery: restore the pre-localization baseline

The user reports the latest renderer fix is worse on iPhone/iPad. Do not label Chromium measurements as proof of real-device recovery. Production has been restored to saved Site version28, source2bc4ece763584f83b6a5e6fb9a729bdda89ab13f, corresponding to the user's earlier smooth-play feedback before localization and later card-render patches.

Runtime dist is restored exactly; calm rewards, language selector and newer session ledger are temporarily inactive. All completed art/proposals and diagnostics remain under ART and in Git history. The complete latest implementation is also preserved on GitHub branch `archive/iphone-render-20261110` for later isolated investigation. This is not a permanent deletion of requested work.

Baseline uses the same math engine SHA25629c2450576a70eeede358247b26bc99c671200dac8f24deea3642513904e179e and existing schema2wallet/round journal; rollback executes no clear/reset storage operation. Language/session-v2 preferences and history stay in browser storage but are not read by this baseline. No new performance or audio change has been layered onto the restoration.

Physical iPhone confirmation of this baseline remains required before treating it as recovered or restoring individual newer features. Do not claim the earlier140→0decode result identified the whole device-specific root cause.
