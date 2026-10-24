/**
 * npm run dev：開練習伺服器（API，127.0.0.1:3100）和頁面（http://127.0.0.1:5190）。
 * 首頁是 launcher：選遊戲、選房間，用不同名字各開一個分頁就是不同玩家。這個檔案不要改。
 */
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { gamePagesPlugin, discoverGamePages } from './pages.js';
import { buildPracticeApp } from './server.js';

const API_PORT = Number(process.env.KIT_API_PORT ?? 3100);
const PAGE_PORT = Number(process.env.KIT_PORT ?? 5190);
const gamesDir = fileURLToPath(new URL('../../games', import.meta.url));
const launcher = fileURLToPath(new URL('../../launcher', import.meta.url));

let api;
try {
  api = await buildPracticeApp({ gamesDir });
} catch (err) {
  console.error(`\n遊戲載入失敗：${err instanceof Error ? err.message : err}\n`);
  process.exit(1);
}
await api.listen({ port: API_PORT, host: '127.0.0.1' });

const pages = discoverGamePages(gamesDir);
const site = await createServer({
  root: launcher,
  configFile: false,
  plugins: [gamePagesPlugin(pages)],
  server: {
    port: PAGE_PORT,
    strictPort: true,
    host: true,
    // Test links through a Cloudflare tunnel (README).
    allowedHosts: ['.trycloudflare.com'],
    proxy: { '/v1': { target: `http://127.0.0.1:${API_PORT}`, changeOrigin: true, ws: true } },
  },
});
await site.listen();

console.log(`
Bunny Gala 練習平台 0.18
  首頁：http://127.0.0.1:${PAGE_PORT}/
  遊戲：${Object.keys(pages).map((id) => `/play/${id}/`).join('  ')}
  跟團隊一起測 online：另開一個終端機執行 cloudflared tunnel --url http://localhost:${PAGE_PORT}
  停止：Ctrl+C
`);

const stop = async () => {
  await site.close();
  await api.close();
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
