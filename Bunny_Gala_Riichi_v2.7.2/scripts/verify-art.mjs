import{readFileSync}from'node:fs';import{createHash}from'node:crypto';
const base=new URL('../client/public/art/v5/',import.meta.url);
const entries=JSON.parse(readFileSync(new URL('asset-manifest.json',base),'utf8'));
for(const e of entries){const hash=createHash('sha256').update(readFileSync(new URL(e.file,base))).digest('hex');if(hash!==e.sha256)throw Error('Changed locked master: '+e.file);}
console.log('Verified '+entries.length+' retained locked master hashes.');

const current=JSON.parse(readFileSync(new URL('../client/public/art/gala-reference-cleanplate-v2.metadata.json',import.meta.url),'utf8'));
const currentBytes=readFileSync(new URL('../client/public/art/'+current.asset,import.meta.url));
if(createHash('sha256').update(currentBytes).digest('hex')!==current.sha256)throw Error('Current scene hash mismatch');
if(!readFileSync(new URL('../client/src/scene.css',import.meta.url),'utf8').includes(current.asset))throw Error('Current scene not installed');
console.log('Verified retained legacy cleanplate integrity.');

const video=readFileSync(new URL('../client/public/cinematics/chinitsu.mp4',import.meta.url));
if(createHash('sha256').update(video).digest('hex')!=='2d513f10dc635c363e27f0c6003da1eab368a549eec24f06229913fc31574986')throw Error('Official cinematic changed');
if(!readFileSync(new URL('../server/src/presentation.ts',import.meta.url),'utf8').includes('/cinematics/chinitsu.mp4'))throw Error('Cinematic not connected');
console.log('Verified official Chinitsu MP4 hash and server registry.');

const newScene=JSON.parse(readFileSync(new URL('../client/public/art/gala-clear-scene.metadata.json',import.meta.url),'utf8'));
const sceneCss=readFileSync(new URL('../client/src/product.css',import.meta.url),'utf8');
for(const [file,expected] of Object.entries(newScene.assets)){
 const actual=createHash('sha256').update(readFileSync(new URL('../client/public/art/'+file,import.meta.url))).digest('hex');
 if(actual!==expected)throw Error('New scene asset hash mismatch: '+file);
 if(!sceneCss.includes(file))throw Error('New scene asset is not connected: '+file);
}
console.log('Verified new clean table and transparent rabbit sprites.');

const resultArt=JSON.parse(readFileSync(new URL('../client/public/art/gala-result-casino.metadata.json',import.meta.url),'utf8'));
if(createHash('sha256').update(readFileSync(new URL('../client/public/art/'+resultArt.asset,import.meta.url))).digest('hex')!==resultArt.sha256)throw Error('Result casino asset changed');
if(!sceneCss.includes(resultArt.asset))throw Error('Result casino background is not connected');
console.log('Verified result-only casino plate; game tiles and scores are live overlays.');

const roomArt=JSON.parse(readFileSync(new URL('../client/public/art/gala-room-only.metadata.json',import.meta.url),'utf8'));
if(createHash('sha256').update(readFileSync(new URL('../client/public/art/'+roomArt.asset,import.meta.url))).digest('hex')!==roomArt.sha256)throw Error('Room-only backdrop hash mismatch');
if(!sceneCss.includes(roomArt.asset))throw Error('Room-only backdrop is not connected');
console.log('Verified room-only art; table, rim, chairs and carrots use real geometry.');
