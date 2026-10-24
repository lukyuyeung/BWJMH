/**
 * 自動載入 games/ 底下的每一款遊戲（`_` 開頭的資料夾除外，例如 _template）。
 * 每款遊戲的 package.json 要有 exports["./logic"]，指到匯出 `logic` 的檔案（通常是 src/game.ts），
 * 而且 gameId 必須等於資料夾名稱，跟正式平台的遊戲頁網址 /play/<gameId>/ 一致。這個檔案不要改。
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { GameLogic } from '@bunny-gala/contract';

export type ServerGame = GameLogic<unknown, unknown, unknown>;

export async function loadGames(gamesDir: string): Promise<Map<string, ServerGame>> {
  const games = new Map<string, ServerGame>();
  const folders = readdirSync(gamesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('_') && !d.name.startsWith('.'))
    .map((d) => d.name)
    .sort();
  for (const folder of folders) {
    const pkgPath = join(gamesDir, folder, 'package.json');
    if (!existsSync(pkgPath)) throw new Error(`games/${folder}：少了 package.json（從 games/_template 複製整個資料夾）。`);
    let pkg: { exports?: Record<string, string> };
    try {
      pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as typeof pkg;
    } catch {
      throw new Error(`games/${folder}：package.json 不是正確的 JSON。`);
    }
    const entry = pkg.exports?.['./logic'];
    if (!entry) throw new Error(`games/${folder}：package.json 的 exports 沒有 "./logic"。`);
    const mod = (await import(pathToFileURL(join(gamesDir, folder, entry)).href)) as { logic?: ServerGame };
    const game = mod.logic;
    if (!game) throw new Error(`games/${folder}：${entry} 沒有匯出 logic。`);
    if (game.gameId !== folder) {
      throw new Error(`games/${folder}：gameId 是 "${game.gameId}"，必須和資料夾名稱 "${folder}" 一樣。`);
    }
    if (game.random === 'server' && !game.privateView) {
      throw new Error(`games/${folder}：random 是 "server" 卻沒有 privateView，暗牌會外流，平台不會載入。`);
    }
    games.set(game.gameId, game);
  }
  return games;
}
