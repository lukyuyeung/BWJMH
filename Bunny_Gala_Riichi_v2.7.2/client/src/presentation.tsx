import {performanceNames,characterNames} from './locale.js';
import React,{useEffect,useRef,useState} from 'react';
export const characterAssets={yellow:'/art/v5/CHARACTER_PLAYER_YELLOW_BUNNY_MASTER.png',wizard:'/art/v5/CHARACTER_WIZARD_MASTER.jpeg',ninja:'/art/v5/CHARACTER_NINJA_MASTER.jpeg',king:'/art/v5/CHARACTER_KING_MASTER.jpeg'};
export type Character=keyof typeof characterAssets;
export type PerformanceKind='CHI'|'PON'|'KAN'|'RIICHI'|'RON'|'TSUMO'|'MANGAN'|'HANEMAN'|'BAIMAN'|'SANBAIMAN'|'YAKUMAN'|'DOUBLE_YAKUMAN';
export type PerformanceEvent={id:number;kind:PerformanceKind;seat:string};
export type PerformanceAsset={voice?:string;animation?:string;sound?:string;particles?:boolean;durationMs?:number;cameraEmphasis?:number};
/** Future official clips are configured here, without changing the engine or event contracts. */
export const performances:Record<Character,Partial<Record<PerformanceKind,PerformanceAsset>>>={yellow:{},wizard:{},ninja:{},king:{}};
const major=new Set<PerformanceKind>(['MANGAN','HANEMAN','BAIMAN','SANBAIMAN','YAKUMAN','DOUBLE_YAKUMAN']);
let audio:AudioContext|undefined;
function sound(asset:PerformanceAsset){if(asset.voice||asset.sound){const clip=new Audio(asset.voice??asset.sound);void clip.play().catch(()=>{});return()=>{clip.pause();clip.src='';};}try{audio??=new AudioContext();if(audio.state!=='running')return()=>{};const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.setValueAtTime(520,audio.currentTime);o.frequency.exponentialRampToValueAtTime(780,audio.currentTime+.12);g.gain.setValueAtTime(.035,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.2);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+.2);return()=>{try{o.stop();}catch{}};}catch{return()=>{};}}
export function unlockPerformanceAudio(){try{audio??=new AudioContext();void audio.resume();}catch{}}
export function CharacterPerformance({events,characters,skip,reduce,critical,handKey,settled,onSkip}:{events:PerformanceEvent[];characters:Record<string,Character>;skip:boolean;reduce:boolean;critical:boolean;handKey:string;settled:boolean;onSkip:()=>void}){
 const seen=useRef<number|null>(null),queue=useRef<PerformanceEvent[]>([]),[active,setActive]=useState<PerformanceEvent|null>(null);
 useEffect(()=>{if(seen.current===null){seen.current=events.at(-1)?.id??0;return;}const fresh=events.filter(e=>e.id>seen.current!);seen.current=Math.max(seen.current,...events.map(e=>e.id));if(skip){queue.current=[];setActive(null);return;}queue.current.push(...fresh);if(!active)setActive(queue.current.shift()??null);},[events,skip,active]);
 useEffect(()=>{queue.current=[];seen.current=events.at(-1)?.id??0;setActive(null);},[handKey]);
 useEffect(()=>{if(!active)return;const character=characters[active.seat]??'yellow',asset=performances[character][active.kind]??{};const stop=sound(asset);const timer=setTimeout(()=>setActive(queue.current.shift()??null),reduce?450:asset.durationMs??(major.has(active.kind)?1800:650));return()=>{clearTimeout(timer);stop();};},[active,reduce,characters[active?.seat??'']]);
 useEffect(()=>{if(skip){queue.current=[];setActive(null);}},[skip]);
 useEffect(()=>{const stage=document.querySelector<HTMLElement>('.scene-viewport');if(!stage||!active||skip||reduce||critical)return;const strength=performances[characters[active.seat]??'yellow'][active.kind]?.cameraEmphasis??.012;stage.style.setProperty('--camera-emphasis',String(1+strength));stage.classList.add('performance-camera');return()=>{stage.classList.remove('performance-camera');stage.style.removeProperty('--camera-emphasis');};},[active,skip,reduce,critical]);
 if(!active||skip)return null;const character=characters[active.seat]??'yellow',asset=performances[character][active.kind]??{},cinematic=major.has(active.kind)&&!critical&&settled;
 return <aside className={'character-performance '+(cinematic?'cinematic':'call-cutin')+(reduce?' reduce-effects':'')} data-event={active.kind} data-seat={active.seat} aria-live="polite"><div className="performance-content">{asset.animation&&/\.(webm|mp4)(\?|$)/i.test(asset.animation)?<video src={asset.animation} autoPlay muted playsInline aria-label={characterNames[character]}/>:<img src={asset.animation??characterAssets[character]} alt={characterNames[character]}/>}<div><small>{characterNames[character]}</small><strong>{performanceNames[active.kind]??'和牌'}</strong><span className="performance-tiles" aria-hidden="true">▱ ▱ ▱</span></div></div><button onClick={()=>{queue.current=[];setActive(null);onSkip();}}>跳過動畫</button></aside>;
}

export type SharedCinematic={id:number;trigger:string;winner:string;character:Character;startedAt:number;endsAt:number;phase:'playing'|'results';video?:string;voice?:string;sound?:string;image?:string;particles?:boolean;serverNow:number};
/** The server owns this layer's lifetime. Skip/reduce/error never advance the room. */
export function GlobalCinematic({state,skip,reduce,winnerName}:{state?:SharedCinematic|undefined;skip:boolean;reduce:boolean;winnerName:string}){
 const video=useRef<HTMLVideoElement>(null),[dismissed,setDismissed]=useState(false),[failed,setFailed]=useState(false),[muted,setMuted]=useState(true);
 useEffect(()=>{setDismissed(false);setFailed(false);setMuted(true);},[state?.id]);
 useEffect(()=>{const v=video.current;if(!v||!state)return;const received=performance.now();const sync=()=>{const elapsed=(state.serverNow-state.startedAt+performance.now()-received)/1000;if(Number.isFinite(v.duration))v.currentTime=Math.min(Math.max(0,elapsed),Math.max(0,v.duration-.05));void v.play().catch(()=>setFailed(true));};v.addEventListener('loadedmetadata',sync);if(v.readyState>=1)sync();return()=>{v.removeEventListener('loadedmetadata',sync);v.pause();};},[state?.id,state?.serverNow,skip,reduce,dismissed]);
 useEffect(()=>{if(!state||state.phase!=='playing'||muted||skip||reduce||dismissed||!state.voice&&!state.sound)return;return sound(state);},[state?.id,state?.phase,muted,skip,reduce,dismissed]);
 if(!state||state.phase!=='playing')return null;
 const quiet=skip||reduce||dismissed||failed;
 return <section className={'global-cinematic'+(quiet?' quiet':'')} role="dialog" aria-modal="true" aria-label="同步和牌動畫" data-event={state.trigger} data-cinematic-id={state.id} data-winner={state.winner}>
 {state.video&&!quiet?<video ref={video} src={state.video} autoPlay muted={muted} playsInline preload="auto" onError={()=>setFailed(true)} aria-label="清一色官方動畫"/>:<img src={state.image??characterAssets[state.character]} alt={characterNames[state.character]}/>}
 <div className="cinematic-winner"><img src={characterAssets[state.character]} alt={characterNames[state.character]}/><span>{winnerName} · {characterNames[state.character]}</span></div>{state.particles&&!quiet&&<div className="cinematic-vfx" aria-hidden="true">✧ ✦ ✧</div>}<div className="cinematic-title"><small>{winnerName} · {characterNames[state.character]}</small><strong>{performanceNames[state.trigger]??'和牌'}</strong>{quiet&&<span>等待全桌同步進入結算…</span>}</div>
 <div className="cinematic-controls">{!quiet&&<><button onClick={()=>setDismissed(true)}>跳過動畫</button><button onClick={()=>setMuted(v=>!v)}>{muted?'開啟聲音':'靜音'}</button></>}</div>
 </section>;
}
