/**
 * 遊戲頁：每款遊戲的 games/<id>/web 是自己的 Vite 專案（自己的大廳和美術），掛在 /play/<id>/，
 * 跟正式平台的網址一樣。開發時由同一台 Vite 伺服器一起跑。這個檔案不要改。
 */
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createServer, type Plugin, type ViteDevServer } from 'vite';

/** gameId → its web folder, for every game that has web/vite.config.ts. */
export function discoverGamePages(gamesDir: string): Record<string, string> {
  const pages: Record<string, string> = {};
  for (const d of readdirSync(gamesDir, { withFileTypes: true })) {
    if (!d.isDirectory() || d.name.startsWith('_')) continue;
    const web = join(gamesDir, d.name, 'web');
    if (existsSync(join(web, 'vite.config.ts'))) pages[d.name] = web;
  }
  return pages;
}

/** Serves each game's own Vite project under /play/<gameId>/ (as apps/play does on the platform). */
export function gamePagesPlugin(pages: Record<string, string>): Plugin {
  const servers: ViteDevServer[] = [];
  return {
    name: 'bunny-gala-game-pages',
    apply: 'serve',
    async configureServer(host) {
      for (const [gameId, root] of Object.entries(pages)) {
        const game = await createServer({
          root,
          configFile: join(root, 'vite.config.ts'),
          // Live reload over this server's own port; each game's client connects under its base path.
          server: { middlewareMode: true, hmr: { server: host.httpServer ?? undefined }, allowedHosts: ['.trycloudflare.com'] },
          logLevel: 'warn',
        });
        servers.push(game);
        const base = `/play/${gameId}/`;
        host.middlewares.use((req, res, next) => {
          if (req.url === base.slice(0, -1)) {
            res.writeHead(301, { Location: base }).end();
          } else if (req.url?.startsWith(base)) game.middlewares(req, res, next);
          else next();
        });
      }
      host.httpServer?.on('close', () => void Promise.all(servers.map((s) => s.close())));
    },
  };
}
