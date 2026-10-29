import {readFileSync} from 'node:fs';
const root=new URL('./',import.meta.url);
export function tycoonSource(code,path){
 const file=path.split('/').at(-1);
 code=code.replaceAll("'bunny-riichi-session'","('bunny-riichi-session:'+new URLSearchParams(location.search).get('room'))");
 code=code.replaceAll('/art/update-26/carrot-riichi.png','/brand/riichi-stick.svg').replaceAll('紅蘿蔔立直棒','立直棒').replaceAll('#d39a90','#c8b37c').replaceAll('#a97178','#7d6b42').replaceAll('/design/lobby/index.html','https://bunny-club-design-1029.almondcrab34.chatgpt.site/mahjong.html');
 if(file==='bot-save.js')for(const key of ['bunny-bot-save-v1','bunny-bot-active-v1'])code=code.replaceAll("'"+key+"'","('"+key+":'+((window.TycoonRoom&&window.TycoonRoom.id)||'A-01'))");
 if(file==='beginner-guide.tsx')return readFileSync(new URL('tycoon-guide.tsx',root),'utf8');
 if(file==='emotes.tsx')return `export function Emotes(_props:any){return null}`;
 if(file==='character-art.ts')return `import type {Character} from './presentation';export const HOODIE_ROOT='/brand';export function characterPortrait(_role:Character){return '/brand/blank.svg'}export function characterAvatar(_role:Character){return '/brand/blank.svg'}export function characterCutin(_role:Character,_action:string){return '/brand/blank.svg'}`;
 if(file==='physical-table.tsx'){
  const a=code.indexOf("   const master=await loadImage('/art/table/rose-gold-v1/table-master.png');"),b=code.indexOf('   redraw.current=schedule;',a);
  if(a<0||b<0)throw Error('TYCOON table boundary changed');
  code=code.slice(0,a)+"   root!.dataset.tableMaster='tycoon-emerald-bronze';root!.dataset.handRig='none';\n"+code.slice(b);
  code=code.replaceAll("'#996c67'","'#6a5b38'").replaceAll("'#bc8f84'","'#b3a071'").replaceAll("'#c6ab86'","'#c9b47e'").replaceAll('/art/update-26/carrot-riichi.png','/brand/riichi-stick.svg');
 }
 if(file==='demo-transport.ts'){
  code="import {createWinSequence,sequenceCinematic} from '../rules/win-sequence';\n"+code;
  code=code.replace('try{const manager=new RoomManager();', `try{if(saved.room.game?.phase==='won'){
   const previous=saved.room.winSequence,plan=createWinSequence(saved.room.game,previous?.id??'restored:'+saved.room.code,previous?.startedAt??Date.now());
   if(plan){saved.room.winSequence=plan;const cinematic=sequenceCinematic(plan,saved.room.game.results??[saved.room.game.result!],saved.room.eventSequence??0);cinematic.phase=saved.room.cinematic?.phase??'results';saved.room.cinematic=cinematic}
   else{delete saved.room.winSequence;delete saved.room.cinematic}
  }const manager=new RoomManager();`);

  code=code.replace("raw==='low'||raw==='high'||raw==='master'?raw:'medium'","'master'");
  code=code.replace('CHARACTER_NAMES[role],CHARACTER_BOT_PROFILE[role]',"((window as any).TycoonRoom?.names?.[botCharacters(character).indexOf(role)]??'墨客')+' · AI',CHARACTER_BOT_PROFILE[role]");
  code=code.replace("this.dispatch('game:state',state);","this.dispatch('game:state',state);window.dispatchEvent(new CustomEvent('tycoon:seats',{detail:this.room.players.map(p=>({name:p.name,bot:!!p.isBot}))}));");
 }
 if(file==='preload-art.ts')code=code.replaceAll("'/art/hoodie-v3/character.png'","'/brand/blank.svg'").replaceAll("'/art/hoodie-v3/avatar.jpg'","'/brand/blank.svg'");
 if(file==='ribbon-cutin.tsx'){
  const start=code.indexOf('  {!poseReady&&<img className="ribbon-pose-backup"'),end=code.indexOf(' </>}</aside>;',start);
  if(start<0||end<0)throw Error('Ribbon character layer boundary changed');
  code=code.slice(0,start)+code.slice(end);
  code=code.replace('data-layers="01+02+03+04"','data-layers="01+03+04"');
 }
 if(file==='mangan-art.tsx')code=code.replace("const src=fallback??(role==='yellow'?'/art/hoodie-v3/character.png':winArtUrl(role,'mangan'))", "const src='/brand/blank.svg'");
 // Dedicated movies contain baked-in characters. Keep their original shared duration,
 // rendering the original WinArt layers instead of a character movie.
 if(file==='special-results.tsx'){
  code=code.replace(/const nextVideo=plan.segments.find[^;]+;/, 'const nextVideo=undefined as string|undefined;');
  code=code.replace(/ if\(segment.kind==='video'\)return <SequenceVideo[^\n]+/, " if(segment.kind==='video')return <WinArt key={segment.winner} includeCall={false} game={view} onComplete={()=>{}} timeline={{elapsed:age-segment.start,received:performance.now()}}/>;");
 }
 if(file==='phone-table.tsx'){
  code=code.replace('{standalone&&!lessonOne&&<>','{false&&standalone&&!lessonOne&&<>');
  code=code.replaceAll("'/design/lobby/index.html'","'https://bunny-club-design-1029.almondcrab34.chatgpt.site/mahjong.html'");
 }
 if(file==='main.tsx')code=code.replaceAll("'/design/lobby/index.html'","'https://bunny-club-design-1029.almondcrab34.chatgpt.site/mahjong.html'");
 if(file==='win-art-config.ts')code=code.replace(/export function winArtUrl[^\n]+/,"export function winArtUrl(_role:Character,tier:WinImpactTier){return '/brand/win-art/'+tier+'.png'}");
 return code;
}
export const tycoonHtml=`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#10291e"><title>TYC∞N · 日本麻雀</title><link rel="icon" href="/brand/icon.svg"><script src="/brand/tycoon.js"></script><link rel="stylesheet" href="/brand/table.css"></head><body><div id="root"></div><script type="module" src="/src/tycoon-entry.ts"></script></body></html>`;

export function tycoonCss(code){return code.replaceAll('/art/table/hub-bunny-luxe.svg','/brand/hub.svg').replaceAll('/art/hoodie-v3/avatar.jpg','/brand/blank.svg').replaceAll('/art/gala-reference-cleanplate-v2.png','/brand/club.webp').replaceAll('/art/gala-interior.png','/brand/club.webp').replaceAll('/gala-v9/game-art/casino-room-v9.jpg','/brand/club.webp').replaceAll('#d39a90','#c8b37c').replaceAll('#a97178','#7d6b42').replaceAll('#34263688','#173e3088').replaceAll('#15172155','#0d241c55').replaceAll('#52344044','#274d3c44').replaceAll('#15131c66','#10291f66').replaceAll('#ad887449','#b09b6549').replaceAll('#e0bc99','#ddc68e')};
