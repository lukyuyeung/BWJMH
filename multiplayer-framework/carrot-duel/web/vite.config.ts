import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const page = (name: string) => fileURLToPath(new URL(name, import.meta.url));

/**
 * 胡蘿蔔比大小的頁面，掛在 /play/carrot-duel/：大廳（index.html）和牌桌（play.html）。
 * base 必須是 /play/<gameId>/，正式平台也是這個網址。
 */
export default defineConfig({
  base: '/play/carrot-duel/',
  build: {
    target: 'es2022',
    rollupOptions: { input: { lobby: page('index.html'), play: page('play.html') } },
  },
});
