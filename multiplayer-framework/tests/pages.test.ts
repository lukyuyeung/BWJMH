import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import { discoverGamePages } from '../platform/src/pages.js';
import { GAMES_DIR } from './helpers.js';

const fixtures = fileURLToPath(new URL('./.fixtures-pages', import.meta.url));
afterAll(() => rmSync(fixtures, { recursive: true, force: true }));

describe('discoverGamePages', () => {
  it('finds each game page under games/<id>/web', () => {
    const pages = discoverGamePages(GAMES_DIR);
    expect(pages['fortune-3-card']).toBe(join(GAMES_DIR, 'fortune-3-card', 'web'));
  });

  it('skips _ folders and games without web/vite.config.ts', () => {
    mkdirSync(fixtures, { recursive: true });
    const root = mkdtempSync(join(fixtures, 'pages-'));
    for (const folder of ['_template', 'no-page', 'has-page']) mkdirSync(join(root, folder, 'web'), { recursive: true });
    writeFileSync(join(root, '_template/web/vite.config.ts'), '');
    writeFileSync(join(root, 'has-page/web/vite.config.ts'), '');
    expect(discoverGamePages(root)).toEqual({ 'has-page': join(root, 'has-page', 'web') });
  });
});
