import type { GameModule } from '@bunny-gala/contract';
import { logic } from './game.js';
import type { Action, State, View } from './logic.js';
import { view } from './view.js';

/** 整款遊戲：規則（game.ts，伺服器跑）加上畫面（view.ts，瀏覽器畫）。牌桌頁用 playGame(game, el) 掛上。 */
export const game: GameModule<State, Action, View> = { ...logic, view };
