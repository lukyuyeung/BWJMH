import {readFileSync} from 'node:fs';
const root=new URL('./',import.meta.url);
export function tycoonSource(code,path){
 const file=path.split('/').at(-1);
 code=code.replaceAll("'bunny-riichi-session'","('bunny-riichi-session:'+new URLSearchParams(location.search).get('room'))");
 code=code.replaceAll('/art/update-26/carrot-riichi.png','/brand/riichi-stick.svg').replaceAll('紅蘿蔔立直棒','立直棒').replaceAll('#d39a90','#c8b37c').replaceAll('#a97178','#7d6b42').replaceAll('/design/lobby/index.html','https://bunny-club-design-1029.almondcrab34.chatgpt.site/mahjong.html');
 if(file==='bot-save.js')for(const key of ['bunny-bot-save-v1','bunny-bot-active-v1'])code=code.replaceAll("'"+key+"'","('"+key+":'+((window.TycoonRoom&&window.TycoonRoom.id)||'A-01'))");
 if(file==='beginner-guide.tsx')return readFileSync(new URL('tycoon-guide.tsx',root),'utf8');
 if(file==='emotes.tsx')return `export function Emotes(_props:any){return null}`;
 if(file==='win-sequence.ts')return readFileSync(new URL('tycoon-win-plan.ts',root),'utf8');
 if(file==='character-art.ts')return `import type {Character} from './presentation';export const HOODIE_ROOT='/brand';export function characterPortrait(_role:Character){return '/brand/blank.svg'}export function characterAvatar(_role:Character){return '/brand/blank.svg'}export function characterCutin(_role:Character,_action:string){return '/brand/blank.svg'}`;
 if(file==='physical-table.tsx'){
  const a=code.indexOf("   const master=await loadImage('/art/table/rose-gold-v1/table-master.png');"),b=code.indexOf('   redraw.current=schedule;',a);
  if(a<0||b<0)throw Error('TYCOON table boundary changed');
  code=code.slice(0,a)+"   root!.dataset.tableMaster='tycoon-emerald-bronze';root!.dataset.handRig='none';\n"+code.slice(b);
  code=code.replaceAll("'#996c67'","'#6a5b38'").replaceAll("'#bc8f84'","'#b3a071'").replaceAll("'#c6ab86'","'#c9b47e'").replaceAll('/art/update-26/carrot-riichi.png','/brand/riichi-stick.svg');
 }
 if(file==='demo-transport.ts'){
  code=code.replace("raw==='low'||raw==='high'||raw==='master'?raw:'medium'","'master'");
  code=code.replace('CHARACTER_NAMES[role],CHARACTER_BOT_PROFILE[role]',"((window as any).TycoonRoom?.names?.[botCharacters(character).indexOf(role)]??'墨客')+' · AI',CHARACTER_BOT_PROFILE[role]");
  code=code.replace("this.dispatch('game:state',state);","this.dispatch('game:state',state);window.dispatchEvent(new CustomEvent('tycoon:seats',{detail:this.room.players.map(p=>({name:p.name,bot:!!p.isBot}))}));");
 }
 if(file==='preload-art.ts')return `export async function preloadEventArt(){}export function preloadAvailableArt(_game:unknown){}`;
 if(file==='phone-table.tsx'){
  code=code.replace("import {SpecialWinSequence,SpecialDraw} from './special-results';","import {SpecialWinSequence} from './tycoon-win';import {SpecialDraw} from './special-results';");
  code=code.replace('{standalone&&!lessonOne&&<>','{false&&standalone&&!lessonOne&&<>');
  code=code.replace('(h.events??[]).filter','(h.events??[]).filter(e=>!h.winSequence||![\'RON\',\'TSUMO\'].includes(e.kind)).filter');
  code=code.replaceAll("'/design/lobby/index.html'","'https://bunny-club-design-1029.almondcrab34.chatgpt.site/mahjong.html'");
 }
 if(file==='main.tsx')code=code.replaceAll("'/design/lobby/index.html'","'https://bunny-club-design-1029.almondcrab34.chatgpt.site/mahjong.html'");
 if(file==='win-art-config.ts')code=code.replace(/export function winArtUrl[^\n]+/,"export function winArtUrl(_role:Character,_tier:WinImpactTier){return '/brand/win-stage.svg'}");
 return code;
}
export const tycoonHtml=`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#10291e"><title>TYC∞N · 日本麻雀</title><link rel="icon" href="/brand/icon.svg"><script src="/brand/tycoon.js"></script><link rel="stylesheet" href="/brand/table.css"></head><body><div id="root"></div><script type="module" src="/src/tycoon-entry.ts"></script></body></html>`;

export function tycoonCss(code){return code.replaceAll('/art/table/hub-bunny-luxe.svg','/brand/hub.svg').replaceAll('/art/results/gala-result-backdrop.png','/brand/club.webp').replaceAll('/art/hoodie-v3/avatar.jpg','/brand/blank.svg').replaceAll('/art/gala-reference-cleanplate-v2.png','/brand/club.webp').replaceAll('/art/gala-interior.png','/brand/club.webp').replaceAll('/gala-v9/game-art/casino-room-v9.jpg','/brand/club.webp').replaceAll('#d39a90','#c8b37c').replaceAll('#a97178','#7d6b42')};
