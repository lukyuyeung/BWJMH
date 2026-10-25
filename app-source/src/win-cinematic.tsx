import {winClockKey,startWinClock,winClockAge} from './win-visual-clock';
import React,{useEffect,useRef,useState} from 'react';
import type {Game} from './main';import {seatCharacter} from './seat-character';import {gameAudio} from './game-audio';import {winImpactTier,WIN_LIGHT_END} from './win-impact';import './win-cinematic.css';
/** Result-owned presentation: does not depend on a transient call-event queue. */
export function WinCinematic({game,quiet}:{game:Game;quiet:boolean}){
 const h=game.hand,wins=h.results??(h.result?[h.result]:[]),key=winClockKey(game),[age,setAge]=useState(0);
 const suspended=h.cinematic?.phase==='playing';
 useEffect(()=>{setAge(0);if(suspended||!wins.length)return;let frame=0,timer:ReturnType<typeof setInterval>|undefined;const a=gameAudio(),scope=key+':prestige';frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>{startWinClock(key);for(const win of wins){const role=seatCharacter(game,win.winner);a?.once(scope+win.winner,()=>a.voices(role,[win.method],scope));}timer=setInterval(()=>setAge(winClockAge(key)),50);})});return()=>{cancelAnimationFrame(frame);clearInterval(timer);a?.stopVoices(scope)}},[key,suspended]);
 if(!wins.length||suspended||age>=WIN_LIGHT_END)return null;
 const index=wins.length>1&&age>=920?1:0,win=wins[index]!,view={...game,hand:{...h,result:win}},tier=winImpactTier(view),role=seatCharacter(game,win.winner),name=game.room.players.find(p=>p.seat===win.winner)?.name??'',stage=age<180?'darken':age<1800?'cutin':age<2450?'reveal':'landing';
 const title=tier?({mangan:'滿貫',haneman:'跳滿',baiman:'倍滿',sanbaiman:'三倍滿',yakuman:'役滿'}[tier]):win.method==='ron'?'榮和':'自摸';
 return <aside className={'prestige-win'+(quiet?' quiet':'')} data-stage={stage} data-tier={tier??'normal'} data-winner={win.winner} role="status" aria-label={name+' · '+title+'角色演出'}>
 <div className="prestige-slice" key={index}><div className="prestige-grain"/><div className="prestige-edge edge-top"/><div className="prestige-portrait"><img src={role==='yellow'?'/art/results/yellow-presentation.png':'/art/ribbon-v2/'+role+'-character.png'} alt={name}/></div><div className="prestige-copy"><small>BUNNY GALA · {win.method.toUpperCase()}{wins.length>1?' · DOUBLE RON':''}</small><strong>{title}</strong><span>{name}</span></div><div className="prestige-edge edge-bottom"/><i className="prestige-glint"/>{[0,1,2,3,4,5].map(i=><i className="prestige-spark" key={i} style={{'--i':i} as React.CSSProperties}/>)}</div>
 <div className="prestige-credit">{wins.map(w=><span key={w.winner}>{game.room.players.find(p=>p.seat===w.winner)?.name} · {w.method==='ron'?'榮和':'自摸'}</span>)}</div>
 </aside>;
}
