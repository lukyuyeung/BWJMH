# Nine terminals declaration

- Replace the plain text 九種九牌 action with a matching silver/plum/gold button asset from the 跳過 art direction. Keep its real legal-action gating and disabled state.
- Play nine_terminals once when the server confirms the abortive draw, using the still-current declaring seat. The engine's declareNineTerminals preserves currentSeat and requires that seat's turn.
- Remove nine_terminals from the four-seat score-transition loop. Ordinary exhaustive draws retain each seat's tenpai/noten voice.
- Prewarm the local declaration clip while the action is available.

Validation: typecheck, production build, browser fixture clicking the real legal action through score transfer, and separate checks for all four declaring seats. One matching role voice per declaration, no duplicate at score transfer, no browser errors. Screenshot: qa-69/nine-terminals-button.png.
