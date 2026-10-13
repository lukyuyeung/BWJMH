import{readFileSync}from'node:fs';import{createHash}from'node:crypto';
const base=new URL('../client/public/art/v5/',import.meta.url);
const entries=JSON.parse(readFileSync(new URL('asset-manifest.json',base),'utf8'));
const runtime=readFileSync(new URL('../client/src/main.tsx',import.meta.url),'utf8')+readFileSync(new URL('../client/src/styles.css',import.meta.url),'utf8');
for(const e of entries){const hash=createHash('sha256').update(readFileSync(new URL(e.file,base))).digest('hex');if(hash!==e.sha256)throw Error('Changed locked master: '+e.file);if(!runtime.includes(e.file))throw Error('Master not connected to runtime: '+e.file);}
console.log('Verified '+entries.length+' locked master hashes and runtime references.');

const current=JSON.parse(readFileSync(new URL('../client/public/art/gala-reference-cleanplate-v2.metadata.json',import.meta.url),'utf8'));
const currentBytes=readFileSync(new URL('../client/public/art/'+current.asset,import.meta.url));
if(createHash('sha256').update(currentBytes).digest('hex')!==current.sha256)throw Error('Current scene hash mismatch');
if(!readFileSync(new URL('../client/src/scene.css',import.meta.url),'utf8').includes(current.asset))throw Error('Current scene not installed');
console.log('Verified current Gala Reference cleanplate hash and gameplay stylesheet.');

const video=readFileSync(new URL('../client/public/cinematics/chinitsu.mp4',import.meta.url));
if(createHash('sha256').update(video).digest('hex')!=='2d513f10dc635c363e27f0c6003da1eab368a549eec24f06229913fc31574986')throw Error('Official cinematic changed');
if(!readFileSync(new URL('../server/src/presentation.ts',import.meta.url),'utf8').includes('/cinematics/chinitsu.mp4'))throw Error('Cinematic not connected');
console.log('Verified official Chinitsu MP4 hash and server registry.');
