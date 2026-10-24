/**
 * npm run check <gameId>：交件前的自動檢查。全部通過才印「可以交件」；交件時請附上這份輸出。
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadGames, type ServerGame } from '../platform/src/games.js';
import { simulate } from '../platform/src/simulate.js';

const kit = fileURLToPath(new URL('..', import.meta.url));
const gamesDir = join(kit, 'games');
const id = process.argv[2] ?? '';
let failed = false;

const pass = (text: string) => console.log(`✔ ${text}`);
const fail = (text: string, detail?: string) => {
  failed = true;
  console.log(`✘ ${text}`);
  if (detail) console.log(detail.replace(/^/gm, '    '));
};
const run = (command: string, args: string[]) => spawnSync(command, args, { cwd: kit, encoding: 'utf8' });
const tail = (out: string, lines = 25) => out.trim().split('\n').slice(-lines).join('\n');

function finish(): never {
  console.log(failed ? '\n還不能交件：請先修好上面標 ✘ 的項目。' : `\n可以交件：把 games/${id}/ 打包成 zip，連同這份輸出一起交。`);
  process.exit(failed ? 1 : 0);
}

console.log(`Bunny Gala 交件檢查：${id || '（沒有指定遊戲）'}\n`);

// 1. Folder and package.json
const known = readdirSync(gamesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !d.name.startsWith('_') && !d.name.startsWith('.'))
  .map((d) => d.name);
if (id.startsWith('_')) {
  fail(`${id} 是範本，請先複製並改名。現有的遊戲：${known.join('、')}`, '例如：複製 games/_template 成 games/my-game，再照 README 改三個地方。');
  finish();
}
if (!id || !known.includes(id)) {
  fail(`找不到 games/${id}。現有的遊戲：${known.join('、')}`, '用法：npm run check <遊戲資料夾名稱>。新遊戲請先複製 games/_template 再改名。');
  finish();
}
const dir = join(gamesDir, id);
if (!existsSync(join(dir, 'package.json'))) {
  fail('資料夾結構', `少了 games/${id}/package.json（從 games/_template 複製整個資料夾）。`);
  finish();
}
const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as { name?: string; exports?: Record<string, string> };
const structure: string[] = [];
if (pkg.name !== `@bunny-gala/game-${id}`) structure.push(`package.json 的 name 要是 "@bunny-gala/game-${id}"（現在是 "${pkg.name}"）`);
if (!pkg.exports?.['.'] || !pkg.exports?.['./logic']) structure.push('package.json 的 exports 要有 "." 和 "./logic"');
if (!existsSync(join(dir, 'src/game.ts'))) structure.push('少了 src/game.ts');
const viteConfig = join(dir, 'web/vite.config.ts');
if (!existsSync(viteConfig)) structure.push('少了 web/vite.config.ts');
else if (!readFileSync(viteConfig, 'utf8').includes(`'/play/${id}/'`) && !readFileSync(viteConfig, 'utf8').includes(`"/play/${id}/"`)) {
  structure.push(`web/vite.config.ts 的 base 要是 '/play/${id}/'`);
}
if (structure.length) {
  fail('資料夾結構', structure.join('\n'));
  finish();
}
pass('資料夾結構');

// 2. The server can load it
let game: ServerGame;
try {
  const games = await loadGames(gamesDir);
  game = games.get(id)!;
  pass('伺服器載入');
} catch (err) {
  fail('伺服器載入', err instanceof Error ? err.message : String(err));
  finish();
}

// 3. Types
const types = run('npm', ['run', 'typecheck', '--silent']);
if (types.status === 0) pass('型別檢查（npm run typecheck）');
else fail('型別檢查（npm run typecheck）', tail(types.stdout + types.stderr));

// 4. Rules, played by bots: 200 hands for every combination of lobby choices
const combos = Object.entries(game.tableOptions ?? {}).reduce<Record<string, string>[]>(
  (all, [key, values]) => all.flatMap((combo) => values.map((value) => ({ ...combo, [key]: value }))),
  [{}],
);
for (const options of combos) {
  const label = Object.keys(options).length ? `規則模擬 200 手（${Object.entries(options).map(([k, v]) => `${k}=${v}`).join(', ')}）` : '規則模擬 200 手';
  const { problems, played } = simulate(game, { hands: 200, options });
  if (problems.length) fail(label, problems.join('\n'));
  else if (played === 0) {
    console.log(`⚠ ${label}：機器人不會開局（例如要真人先下注），沒有打到結算，派彩規則沒檢查到。`);
    console.log('    讓 bot() 對玩家座位也能下最小注，這項檢查才有用。');
  } else pass(label);
}

// 5. Its own privateView test
if (game.random === 'server') {
  const testsDir = join(dir, 'tests');
  const hasTest =
    existsSync(testsDir) &&
    readdirSync(testsDir).some((f) => f.endsWith('.test.ts') && readFileSync(join(testsDir, f), 'utf8').includes('privateView'));
  if (hasTest) pass('有 privateView 測試');
  else fail('有 privateView 測試', `在 games/${id}/tests/ 寫一個測試，證明每個座位看不到別人的暗牌（範例：games/carrot-duel/tests/privacy.test.ts）。`);
} else pass('privateView 測試（random 為 none，不需要）');

// 6. The pages build
const out = mkdtempSync(join(tmpdir(), `kit-build-${id}-`));
const build = run('npx', ['vite', 'build', join('games', id, 'web'), '--config', viteConfig, '--outDir', out, '--emptyOutDir', '--logLevel', 'warn']);
rmSync(out, { recursive: true, force: true });
if (build.status === 0) pass('頁面建置（vite build）');
else fail('頁面建置（vite build）', tail(build.stdout + build.stderr));

// 7. Every test
const tests = run('npx', ['vitest', 'run', '--reporter', 'dot']);
if (tests.status === 0) pass('全部測試（npm test）');
else fail('全部測試（npm test）', tail(tests.stdout + tests.stderr, 40));

finish();
