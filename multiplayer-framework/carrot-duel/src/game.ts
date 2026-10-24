/**
 * 胡蘿蔔比大小的 GameLogic：伺服器只載入這個檔（package.json 的 exports["./logic"]），
 * 所以這裡不能碰畫面。每一行對應契約 contract/src/index.ts 的一個欄位。
 */
import type { GameLogic } from '@bunny-gala/contract';
import * as rules from './logic.js';
import type { Action, State, View } from './logic.js';

export const logic: GameLogic<State, Action, View> = {
  // 必須和資料夾名稱一樣，遊戲頁網址就是 /play/carrot-duel/。
  gameId: 'carrot-duel',
  // 沒有莊家：玩家對玩家，派彩從底池來。
  pve: false,
  // 一桌四個座位；沒有真人的座位由機器人（bot）坐。
  seats: 4,
  // 平台發牌：先公布雜湊，押注鎖定後才把 ctx.draw 給規則。
  random: 'server',
  // 每一輪說話的時間。超時伺服器會用 fallback 幫他走。
  turnMs: 15_000,
  // 結果顯示 5 秒再開下一手（多人桌）。
  restMs: 5_000,
  // 最多贏到押注的 4 倍：其他三人都棄牌時，自己押 1 份、底池 4 份；大家都跟注時，自己押 2 份、底池 8 份。
  maxPayoutMultiple: 4,
  // 大廳的選擇：選一樣的人才會被湊到同一桌。遊戲裡從 ctx.options.deck 讀。
  tableOptions: { deck: ['full', 'short'] },
  create: rules.create,
  reduce: rules.reduce,
  actors: rules.actors,
  // 發牌之後就不能作廢退錢了。
  dealt: (state) => state.phase !== 'deal',
  needsDraw: (state) => state.phase === 'deal',
  result: rules.result,
  // 只有排位賽用得到；這款沒有排位賽。
  matchOver: () => false,
  bot: rules.bot,
  fallback: rules.fallback,
  // 要鎖在桌上的紅蘿蔔。發牌後只會維持或增加，不會減少。
  liability: rules.stake,
  privateView: rules.privateView,
  minStake: rules.minStake,
  // 跨手的資料：這一桌打了幾手（只是示範，下一手的 ctx.options.handsPlayed 讀得到）。
  nextOptions: (_state, options) => ({ handsPlayed: Number(options.handsPlayed ?? 0) + 1 }),
  rules: {
    title: '胡蘿蔔比大小',
    body:
      '每人先押一份底注，各拿一張只有自己看得到的牌。從這一手的第一位開始輪流：「跟注」再押一份，或「棄牌」放棄（已押的不退）。' +
      '大家都說完後開牌，還在場的人裡牌最大的拿走整個底池（不看花色，A 最大）。平手平分，除不盡的零頭給座位號最小的人。只剩一人時直接拿走底池。' +
      '短牌桌只用 9 到 A。',
  },
};
