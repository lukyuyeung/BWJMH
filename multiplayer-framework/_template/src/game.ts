/** 新遊戲的 GameLogic。伺服器只載入這個檔，不能碰畫面。欄位說明見 docs/外包指南.md 第 4 節。 */
import type { GameLogic } from '@bunny-gala/contract';
import * as rules from './logic.js';
import type { Action, State, View } from './logic.js';

export const logic: GameLogic<State, Action, View> = {
  // 改這裡：必須等於資料夾名稱（也要改 package.json 的 name 和 web/vite.config.ts 的 base）。
  gameId: 'template',
  pve: true,
  seats: 1,
  random: 'server',
  turnMs: 20_000,
  maxPayoutMultiple: 2,
  create: rules.create,
  reduce: rules.reduce,
  actors: (state) => (state.phase === 'bet' ? [state.player] : []),
  dealt: (state) => state.phase === 'done',
  needsDraw: (state) => state.phase === 'deal',
  result: rules.result,
  matchOver: () => false,
  bot: rules.bot,
  fallback: rules.fallback,
  liability: (state, seat) => (seat === state.player ? state.bet : 0),
  // 沒有暗牌：兩張牌同時亮出。有暗牌的遊戲一定要在這裡把別人的牌藏起來。
  privateView: (state) => state,
  rules: { title: '比大小（範本）', body: '押注後你和莊家各拿一張牌，點數大的贏，1 賠 1；同點退回押注。A 最大。' },
};
