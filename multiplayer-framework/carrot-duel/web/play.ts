/**
 * 牌桌頁：playGame 會登入、掛上畫面、依網址的 ?room= 和 tableOptions（?deck=）坐下。
 * 返回鍵回到大廳，離開時平台會用 fallback 幫你把這一手打完。
 */
import { playGame } from '@bunny-gala/contract/client';
import { backButton } from '@bunny-gala/contract/back';
import { landscapeOnly } from '@bunny-gala/contract/landscape';
import { game } from '../src/index.js';

landscapeOnly();
backButton(() => {
  const name = new URLSearchParams(location.search).get('name');
  location.assign(name ? `./?name=${encodeURIComponent(name)}` : './');
});

void playGame(game, document.getElementById('table')!);
