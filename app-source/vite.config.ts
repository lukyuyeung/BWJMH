import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
export default defineConfig({resolve:{alias:{'@bunny/i18n':fileURLToPath(new URL('./src/i18n-runtime',import.meta.url)),'node:crypto':fileURLToPath(new URL('./src/web-crypto.ts',import.meta.url)),'@bunny/riichi-engine':fileURLToPath(new URL('./engine/index.ts',import.meta.url))}},server:{host:'127.0.0.1'}});
