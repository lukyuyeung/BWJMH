import {pref,usePreferences} from './preferences';
import {gameAudio} from './game-audio';
import React,{useEffect,useRef,useState} from 'react';
import './cinematic-fade46.css';
import {RibbonCutin,type RibbonAction} from './ribbon-cutin.js';
export const characterAssets={yellow:'/art/hoodie-v3/character.png',wizard:'/art/v5/CHARACTER_WIZARD_MASTER.jpeg',ninja:'/art/v5/CHARACTER_NINJA_MASTER.jpeg',king:'/art/v5/CHARACTER_KING_MASTER.jpeg'};
export type Character=keyof typeof characterAssets;
export type PerformanceKind='CHI'|'PON'|'KAN'|'RIICHI'|'RON'|'TSUMO'|'MANGAN'|'HANEMAN'|'BAIMAN'|'SANBAIMAN'|'YAKUMAN'|'DOUBLE_YAKUMAN';
export type PerformanceEvent={id:number;kind:PerformanceKind;seat:string};
export type PerformanceAsset={voice?:string;animation?:string;sound?:string;particles?:boolean;durationMs?:number;cameraEmphasis?:number};
/** Future official clips are configured here, without changing the engine or event contracts. */
export const performances:Record<Character,Partial<Record<PerformanceKind,PerformanceAsset>>>={yellow:{},wizard:{},ninja:{},king:{}};
const major=new Set<PerformanceKind>(['MANGAN','HANEMAN','BAIMAN','SANBAIMAN','YAKUMAN','DOUBLE_YAKUMAN']);
let audio:AudioContext|undefined;
function sound(asset:PerformanceAsset){if(!asset.voice&&!asset.sound)return()=>{};const clip=new Audio(asset.voice??asset.sound);void clip.play().catch(()=>{});return()=>{clip.pause();clip.removeAttribute('src');clip.load();};}
export function unlockPerformanceAudio(){gameAudio()?.unlock();try{audio??=new AudioContext();void audio.resume();}catch{}}
export function CharacterPerformance({relativeSeats,kanTypes,events,characters,skip,reduce,critical,handKey,settled,onSkip,suspended=false}:{relativeSeats:string[];kanTypes:Record<string,string|undefined>;events:PerformanceEvent[];characters:Record<string,Character>;skip:boolean;reduce:boolean;critical:boolean;handKey:string;settled:boolean;onSkip:()=>void;suspended?:boolean}){
 const seen=useRef<number|null>(null),queue=useRef<PerformanceEvent[]>([]),[active,setActive]=useState<PerformanceEvent|null>(null);
 useEffect(()=>{if(seen.current===null){seen.current=events.at(-1)?.id??0;return;}const fresh=events.filter(e=>e.id>seen.current!);seen.current=Math.max(seen.current,...events.map(e=>e.id));if(suspended){queue.current=[];setActive(null);return;}queue.current.push(...(fresh.some(e=>e.kind==='RON'||e.kind==='TSUMO')?fresh.filter(e=>!major.has(e.kind)):fresh));if(!active&&!suspended)setActive(queue.current.shift()??null);},[events,skip,active,suspended]);
 useEffect(()=>{queue.current=events.filter(e=>e.kind==='RON'||e.kind==='TSUMO').slice(-1);seen.current=events.at(-1)?.id??0;setActive(suspended?null:queue.current.shift()??null);},[handKey]);
 useEffect(()=>{if(!active||['CHI','PON','KAN','RIICHI','RON','TSUMO'].includes(active.kind))return;const character=characters[active.seat]??'yellow',asset=performances[character][active.kind]??{};const stop=sound(asset);const timer=setTimeout(()=>setActive(queue.current.shift()??null),reduce?450:asset.durationMs??(major.has(active.kind)?1800:720));return()=>{clearTimeout(timer);stop();};},[active,reduce,characters[active?.seat??'']]);
 useEffect(()=>{if(skip&&active&&major.has(active.kind))setActive(null)},[skip,active]);
 useEffect(()=>{if(!active||suspended)return;const a=gameAudio(),role=characters[active.seat]??'yellow',event=active.kind.toLowerCase();a?.once(handKey+':call:'+active.id,()=>{a.voices(role,[event],handKey+':calls');if(['CHI','PON','KAN'].includes(active.kind))a.sfx('tile_claim');if(active.kind==='RIICHI')a.sfx('riichi_bell');});},[active?.id,suspended,handKey]);
 useEffect(()=>()=>gameAudio()?.stopVoices(handKey+':calls'),[handKey]);
 useEffect(()=>{const stage=document.querySelector<HTMLElement>('.scene-viewport');if(!stage||!active||skip||reduce||critical)return;const strength=performances[characters[active.seat]??'yellow'][active.kind]?.cameraEmphasis??.012;stage.style.setProperty('--camera-emphasis',String(1+strength));stage.classList.add('performance-camera');return()=>{stage.classList.remove('performance-camera');stage.style.removeProperty('--camera-emphasis');};},[active,skip,reduce,critical]);
 if(!active||suspended||skip&&major.has(active.kind))return null;const character=characters[active.seat]??'yellow',asset=performances[character][active.kind]??{},cinematic=major.has(active.kind)&&!critical&&settled;
 const relative=Math.max(0,relativeSeats.indexOf(active.seat));
 const callArt:Partial<Record<PerformanceKind,string>>={CHI:'chi',PON:'pon',KAN:'kan',RIICHI:'riichi',RON:'ron',TSUMO:'tsumo',MANGAN:'mangan',HANEMAN:'haneman',BAIMAN:'baiman',SANBAIMAN:'sanbaiman',YAKUMAN:'yakuman',DOUBLE_YAKUMAN:'double-yakuman'};
 const localCalls=new Set(['CHI','PON','KAN','RON','RIICHI','TSUMO']);
 if(localCalls.has(active.kind)){
  return <RibbonCutin key={active.id} action={callArt[active.kind] as RibbonAction} character={character} relative={relative} reduce={reduce} onComplete={()=>setActive(queue.current.shift()??null)}/>;
 }
 const bannerWidths:Record<string,number>={chi:1016,pon:1024,kan:1024,ron:1024,tsumo:1112,riichi:1112,mangan:1120,haneman:1056,baiman:1192,sanbaiman:1344,yakuman:1096,'double-yakuman':1344};
 if(callArt[active.kind]){const win=active.kind==='RON'||active.kind==='TSUMO'||major.has(active.kind);return <aside className={'v9-call new-call-cutin'+(win?' is-win':'')+(reduce?' reduce-effects':'')} data-relative={relative} role="status" aria-label={active.kind}>
  {!reduce&&win&&<div className="win-cutin-frame"/>}
  {!reduce&&<img className="call-particles" src={'/art/library-v1/motion/neutral/'+(win?'win-burst':active.kind==='RIICHI'?'riichi-sweep':'claim-burst')+'.webp'} alt=""/>}
  {!reduce&&<span className={'call-portrait'+(win?' win-character':' jade-avatar avatar-'+relative)}><img src={win?'/art/results/'+character+'-presentation.png':characterAssets[character]} alt=""/></span>}
  <img className="call-banner" style={{width:bannerWidths[callArt[active.kind]!]!*(win?.5:.24),height:'auto'}} src={'/art/library-v1/banners/zh/'+callArt[active.kind]+'.png'} alt={active.kind==='TSUMO'?'自摸':active.kind==='RIICHI'?'立直':active.kind==='RON'?'和牌':''}/>
 </aside>}

 return <aside className={'character-performance '+(cinematic?'cinematic':'call-cutin')+(reduce?' reduce-effects':'')} data-event={active.kind} data-seat={active.seat} aria-live="polite"><div className="performance-content">{asset.animation&&/\.(webm|mp4)(\?|$)/i.test(asset.animation)?<video src={asset.animation} autoPlay muted playsInline aria-label={character}/>:<img src={asset.animation??characterAssets[character]} alt={character}/>}<div><small>{character==='yellow'?'LUK':character.toUpperCase()}</small><strong>{active.kind.replaceAll('_',' ')}</strong><span className="performance-tiles" aria-hidden="true">▱ ▱ ▱</span></div></div><button onClick={()=>{queue.current=[];setActive(null);onSkip();}}>略過演出</button></aside>;
}

export type SharedCinematic={yakuman?:number;method?:'ron'|'tsumo';demo?:boolean;id:number;trigger:string;winner:string;character:Character;startedAt:number;endsAt:number;phase:'playing'|'results';video?:string;voice?:string;sound?:string;image?:string;particles?:boolean;serverNow:number};
/** The server owns this layer's lifetime. Skip/reduce/error never advance the room. */
export function GlobalCinematic({state,skip,reduce,winnerName}:{state?:SharedCinematic|undefined;skip:boolean;reduce:boolean;winnerName:string}){
 const [begun,setBegun]=useState(!state||state.startedAt<=state.serverNow);
 useEffect(()=>{if(!state)return;const delay=Math.max(0,state.startedAt-state.serverNow);setBegun(delay===0);const timer=setTimeout(()=>setBegun(true),delay);return()=>clearTimeout(timer)},[state?.id,state?.startedAt]);
 const ambience=useRef<HTMLCanvasElement>(null);
 const video=useRef<HTMLVideoElement>(null),[dismissed,setDismissed]=useState(false),[failed,setFailed]=useState(false),[blocked,setBlocked]=useState(false);
 const [audio,setAudio]=useState(()=>({volume:gameAudio()?.settings.sfx??.65,unlocked:gameAudio()?.unlocked??false})),lastVolume=useRef(audio.volume||.65),muted=!pref('winSfx')||blocked||!audio.unlocked||audio.volume<=0;
 useEffect(()=>{const a=gameAudio();if(!a)return;const update=()=>{const volume=a.settings.sfx;if(volume>0)lastVolume.current=volume;setAudio({volume,unlocked:a.unlocked})};update();return a.subscribe(update)},[]);
 useEffect(()=>{if(video.current){video.current.volume=audio.volume;video.current.muted=muted}},[audio.volume,muted,state?.id]);
 useEffect(()=>{setDismissed(false);setFailed(false);setBlocked(false);},[state?.id]);
 const retryMuted=(v:HTMLVideoElement,error:unknown)=>{if((error as DOMException)?.name==='NotAllowedError'&&!v.muted){setBlocked(true);v.muted=true;void v.play().catch(()=>setFailed(true))}else setFailed(true)};
 const toggleSound=()=>{const a=gameAudio(),v=video.current;a?.unlock();if(!muted){a?.set({sfx:0});return}const volume=audio.volume||lastVolume.current;a?.set({sfx:volume});setBlocked(false);if(v){v.volume=volume;v.muted=!pref('winSfx');void v.play().catch(error=>retryMuted(v,error))}};

 useEffect(()=>{const v=video.current;if(!v||!state)return;const received=performance.now();const sync=()=>{const elapsed=(state.serverNow-state.startedAt+Math.max(0,state.startedAt-state.serverNow)+performance.now()-received)/1000;if(Number.isFinite(v.duration))v.currentTime=Math.min(Math.max(0,elapsed),Math.max(0,v.duration-.05));v.volume=audio.volume;v.muted=muted;void v.play().catch(error=>retryMuted(v,error));};v.addEventListener('loadedmetadata',sync);if(v.readyState>=1)sync();return()=>{v.removeEventListener('loadedmetadata',sync);v.pause();};},[state?.id,state?.serverNow,skip,reduce,dismissed,begun]);
 useEffect(()=>{if(!state||state.phase!=='playing'||muted||skip||reduce||dismissed||!state.voice&&!state.sound)return;return sound(state);},[state?.id,state?.phase,muted,skip,reduce,dismissed]);
 useEffect(()=>{const v=video.current;if(!v||!state||state.phase!=='playing')return;let lastTime=v.currentTime,lastProgress=performance.now();const started=performance.now();const timer=setInterval(()=>{if(v.currentTime>lastTime+.02){lastTime=v.currentTime;lastProgress=performance.now()}if(v.readyState<2&&performance.now()-started>=5000||v.readyState>=2&&!v.ended&&!v.paused&&performance.now()-lastProgress>=3000)setFailed(true)},250);return()=>clearInterval(timer)},[state?.id,state?.video,begun]);
 usePreferences();const quiet=skip||reduce||dismissed||failed||!pref('winCinematic');
 useEffect(()=>{const canvas=ambience.current,v=video.current;if(!canvas||!v||quiet||state?.phase!=='playing')return;const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return;let timer:number|undefined,live=true;const paint=()=>{if(!live)return;if(!document.hidden&&v.readyState>=2){try{ctx.drawImage(v,0,0,64,36)}catch{/* Static purple extension remains available. */}}timer=window.setTimeout(paint,120)};paint();return()=>{live=false;clearTimeout(timer)}},[state?.id,state?.phase,quiet]);
 if(!state||state.phase!=='playing')return null;
 if(!begun)return <section className="win-declaration" role="status" aria-label="和牌宣告"><span>{winnerName}</span><strong>{state.method==='ron'?'榮和':'自摸'}</strong><small>WINNING HAND</small></section>;
 return <section className={'global-cinematic cinematic-fade'+(quiet?' quiet':'')+(state.video?' has-official-video':'')} role="dialog" aria-modal="true" aria-label="Synchronized winning cinematic" data-cinematic={pref('winCinematic')} data-event={state.trigger} data-cinematic-id={state.id} data-winner={state.winner}>
 {state.video&&!quiet?<><canvas className="cinematic-ambience" ref={ambience} width={64} height={36} aria-hidden="true"/><div className="cinematic-video-frame"><video ref={video} src={state.video} autoPlay muted={muted} playsInline preload="auto" onError={()=>setFailed(true)} aria-label="大牌和牌影片"/></div></>:<img src={state.image??characterAssets[state.character]} alt={state.character}/>}
 <div className="cinematic-winner"><img src={characterAssets[state.character]} alt={'Winning character '+state.character}/><span>{winnerName} · {state.character==='yellow'?'LUK':state.character.toUpperCase()}</span></div>{state.particles&&!quiet&&<div className="cinematic-vfx" aria-hidden="true">✧ ✦ ✧</div>}<div className="cinematic-title"><small>{winnerName} · {state.character==='yellow'?'LUK':state.character.toUpperCase()}</small><strong>{({CHINITSU:'清一色',DAISANGEN:'大三元',SUUANKOU:'四暗刻',DAISUUSHI:'大四喜',KOKUSHI_MUSOU:'國士無雙',CHUUREN_POUTOU:'九蓮寶燈',OTHER_YAKUMAN:'役滿',DOUBLE_YAKUMAN:'雙倍役滿'} as Record<string,string>)[state.trigger]??state.trigger.replaceAll('_',' ')}</strong>{(state.yakuman??0)>1&&<span className="cinematic-multiplier">{state.yakuman}倍役滿</span>}{quiet&&<span>等待全桌同步進入結算…</span>}</div>
 <div className="cinematic-controls">{!quiet&&<><button onClick={()=>setDismissed(true)}>略過演出</button><button onClick={toggleSound}>{muted?'開啟聲音':'靜音'}</button></>}</div>
 </section>;
}
