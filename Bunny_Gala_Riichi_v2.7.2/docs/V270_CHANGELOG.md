# v2.7.0 changelog

- Preserved React/Vite, Node/Socket.IO, standalone engine, in-memory rooms and private per-player state. Original supplied ZIP preserved before changes.
- Added explicit seat-relative standing-tile basis: table vertical is +Z, standing local tile height is +Y. Opponents use seat yaw; local standing hand retains foreground camera. Flat walls/rivers/melds use a distinct basis.
- Fixed dealer-relative packet dealing, terminal empty-wall draw mutation, and safe profile-specific Kan selection. Added supported missing yaku and deterministic abortive draws; policies and omissions are explicit.
- Three deterministic bot strategy profiles, open-yaku/closed-value/threat heuristics; legal actions still go through RoomManager. Simulation metrics report call types separately.
- Touch selection requires explicit discard confirmation; mobile landscape framing, safe areas, fullscreen fallback and graphical action previews retained/improved.
- Shared server-owned winning presentation registry, unchanged official Chinitsu MP4, reconnectable event/deadline, winner identity, local Skip/reduce/error fallback and bounded transition to fullscreen results.
- Payment details include Honba and awarded Riichi pot. Added deterministic physical-tile QA fixtures and browser/transport regression tests.
- Reduced software-renderer stalls by caching shadows, lowering bevel subdivision while preserving thickness, and limiting pulse updates.
- All package manifests and engine workspace dependency updated to 2.7.0; Windows commands, asset audit and rules limitations documented.
