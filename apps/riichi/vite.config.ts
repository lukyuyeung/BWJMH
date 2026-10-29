import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
import {getProfile} from './branding/profiles.mjs';
import {brandPlugin} from './branding/vite-plugin.mjs';
const root=fileURLToPath(new URL('.',import.meta.url));
export default defineConfig(({mode})=>{const profile=getProfile(mode);return{plugins:[brandPlugin(mode,root)],resolve:{alias:{'@bunny/i18n':fileURLToPath(new URL('./src/i18n-runtime',import.meta.url)),'node:crypto':fileURLToPath(new URL('./src/web-crypto.ts',import.meta.url)),'@bunny/riichi-engine':fileURLToPath(new URL('./engine/index.ts',import.meta.url))}},optimizeDeps:{noDiscovery:true,include:['react','react-dom/client','react/jsx-runtime','three']},build:{outDir:`dist/${profile.id}`,emptyOutDir:true},server:{host:'127.0.0.1'}}});
