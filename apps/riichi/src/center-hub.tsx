import {getLanguage} from './language';
import React,{useEffect,useRef,useState} from 'react';
import type {Game,Seat} from './main.js';
const seats:Seat[]=['east','south','west','north'],winds=['東','南','西','北'];
export function CenterHub({game,order,active,awaitingClaim,yourDecision,riichiTiles,quiet}:{riichiTiles:Partial<Record<Seat,string>>;quiet:boolean;game:Game;order:Seat[];active:number;awaitingClaim:boolean;yourDecision:boolean}){
 const h=game.hand,r=game.room;
 const key=[r.code,h.match.roundWind,h.match.handNumber,h.match.honba].join(':');
 const [sticks,setSticks]=useState({...h.riichi});const seen=useRef({...h.riichi}),settled=useRef(new Set<string>()),pending=useRef<Partial<Record<Seat,string>>>({}),timers=useRef<Partial<Record<Seat,ReturnType<typeof setTimeout>>>>({});
 const show=(seat:Seat,delay:number)=>{clearTimeout(timers.current[seat]);timers.current[seat]=setTimeout(()=>setSticks(v=>({...v,[seat]:true})),delay)};
 useEffect(()=>{for(const timer of Object.values(timers.current))clearTimeout(timer);pending.current={};settled.current.clear();seen.current={...h.riichi};setSticks({...h.riichi})},[key]);
 useEffect(()=>{for(const seat of seats){if(h.riichi[seat]&&!seen.current[seat]){setSticks(v=>({...v,[seat]:false}));const id=riichiTiles[seat];if(id)pending.current[seat]=id;if(quiet||!id)show(seat,180);else{clearTimeout(timers.current[seat]);timers.current[seat]=setTimeout(()=>{if(!document.querySelector('.physical-renderer[data-ready="true"][data-hand-rig="approved-round-paw"]'))setSticks(v=>({...v,[seat]:true}))},5000)}}if(!h.riichi[seat])setSticks(v=>v[seat]?{...v,[seat]:false}:v);seen.current[seat]=h.riichi[seat]}},[key,seats.map(s=>h.riichi[s]).join(':'),seats.map(s=>riichiTiles[s]).join(':'),quiet]);
 useEffect(()=>{const land=(event:Event)=>{const id=(event as CustomEvent<{id:string}>).detail.id;settled.current.add(id);for(const seat of seats)if(id==='riichi:'+seat+':'+pending.current[seat])show(seat,0)};const unavailable=()=>{for(const seat of seats)if(pending.current[seat])show(seat,0)};window.addEventListener('bunny:riichi-placed',land);window.addEventListener('bunny:motion-unavailable',unavailable);return()=>{window.removeEventListener('bunny:riichi-placed',land);window.removeEventListener('bunny:motion-unavailable',unavailable);for(const timer of Object.values(timers.current))clearTimeout(timer)}},[]);

 const wind=(seat:Seat)=>winds[(seats.indexOf(seat)-seats.indexOf(h.match.dealer)+4)%4];
 return <section className="phone-round art26-hub" aria-label="局況" data-turn={active} data-phase={h.phase}>
  <div className="hub-core"><strong>{getLanguage()==='en'?`${h.match.roundWind==='east'?'East':'South'} ${h.match.handNumber}`:`${h.match.roundWind==='east'?'東':'南'} ${h.match.handNumber} 局`}</strong><span>餘牌 <b>{h.wallRemaining}</b></span></div>
  {order.map((seat,i)=><div className={'hub-seat hub-seat-'+i+(active===i?' active':'')+(awaitingClaim&&yourDecision&&i===0?' claim-active':'')} key={seat} aria-label={wind(seat)+'家 '+r.scores[seat]+'點'+(active===i?' 行動中':'')} aria-current={active===i?'true':undefined}>
   <span className="hub-wind">{seat===h.match.dealer&&<em aria-label="莊家">莊</em>}{wind(seat)}</span><strong className="hub-score">{r.scores[seat]}</strong><small aria-hidden="true"/>
  </div>)}
  {order.map((seat,i)=><div key={seat} className={'hub-riichi-tray tray-'+i+(sticks[seat]?' occupied':'')} data-seat={seat} data-stick-phase={sticks[seat]?'placed':h.riichi[seat]?'waiting-for-tile':'empty'} aria-label={wind(seat)+'家立直棒區：'+(h.riichi[seat]?'已立直':'空')}>
   {sticks[seat]&&<><img src="/art/update-26/carrot-riichi.png" alt="紅蘿蔔立直棒"/><span>立直</span></>}
  </div>)}
 </section>;
}
