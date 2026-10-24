import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const page = (name: string) => fileURLToPath(new URL(name, import.meta.url));

/** 改這裡：base 必須是 /play/<你的 gameId>/。 */
export default defineConfig({
  base: '/play/template/',
  build: {
    target: 'es2022',
    rollupOptions: { input: { lobby: page('index.html'), play: page('play.html') } },
  },
});
