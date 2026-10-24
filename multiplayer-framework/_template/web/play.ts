/** 牌桌頁：playGame 會登入、掛上畫面、依 ?room= 坐下。返回鍵回到大廳。 */
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
