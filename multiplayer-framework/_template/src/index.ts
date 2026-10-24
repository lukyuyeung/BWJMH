import type { GameModule } from '@bunny-gala/contract';
import { logic } from './game.js';
import type { Action, State, View } from './logic.js';
import { view } from './view.js';

export const game: GameModule<State, Action, View> = { ...logic, view };
