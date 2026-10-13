import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
/** Development file serving must never expose authoritative server state or credentials. */
export default defineConfig({server:{fs:{strict:true,allow:[fileURLToPath(new URL('.',import.meta.url)),fileURLToPath(new URL('../node_modules/',import.meta.url)),fileURLToPath(new URL('../packages/riichi-engine/dist/',import.meta.url))],deny:['.env','.env.*','*.{crt,pem,key}','**/.git/**','**/.bunny-data/**','**/server/**']}}});
