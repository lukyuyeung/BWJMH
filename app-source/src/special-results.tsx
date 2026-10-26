import React,{useEffect,useRef,useState} from 'react';
import type {Game} from './main';import {WinArt} from './mangan-art';import {GlobalCinematic} from './presentation';import {seatCharacter} from './seat-character';import {ResultTile} from './result-tiles';import './special-results.css';
export function SpecialWinSequence({game,onComplete,reduce}:{game:Game;onComplete:()=>void;reduce:boolean}){
 const plan=game.hand.winSequence!,offset=useRef({received:performance.now(),age:plan.serverNow-plan.startedAt}),[age,setAge]=useState(offset.current.age),done=useRef(onComplete);done.current=onComplete;
 useEffect(()=>{offset.current={received:performance.now(),age:plan.serverNow-plan.startedAt}},[plan.serverNow,plan.id]);
 useEffect(()=>{const tick=()=>{const next=offset.current.age+performance.now()-offset.current.received;setAge(next);if(next>=plan.endsAt-plan.startedAt)done.current()};tick();const timer=setInterval(tick,25);return()=>clearInterval(timer)},[plan.id]);
 const segment=plan.segments.find(s=>age>=s.start&&age<s.end),results=game.hand.results??[game.hand.result!];
 if(age>=plan.endsAt-plan.startedAt)return null;
 if(!segment)return <section className="special-result-intro" role="status"><small>BUNNY GALA</small><strong>雙響</strong><div>{results.map(r=><span key={r.winner}>{game.room.players.find(p=>p.seat===r.winner)?.name}</span>)}</div></section>;
 const result=results.find(r=>r.winner===segment.winner)!,view={...game,hand:{...game.hand,result,settlement:game.hand.settlement?{...game.hand.settlement,winningHand:game.hand.settlement.winningHands?.[result.winner]??game.hand.settlement.winningHand}:undefined}},name=game.room.players.find(p=>p.seat===segment.winner)?.name??'',role=seatCharacter(view,segment.winner);
 if(segment.kind==='art')return <WinArt key={segment.winner} game={view} onComplete={()=>{}} timeline={{elapsed:age-segment.start,received:performance.now()}}/>;
 if(segment.kind==='video')return <SequenceVideo key={segment.winner} state={{id:plan.segments.indexOf(segment),trigger:segment.trigger??'',winner:segment.winner,character:role,method:result.method,startedAt:plan.startedAt+segment.start,endsAt:plan.startedAt+segment.end,serverNow:plan.startedAt+age,phase:'playing',video:segment.video,yakuman:segment.yakuman}} reduce={reduce} name={name}/>;
 return <section className="special-result-intro" role="status"><small>{name}</small><strong>榮和</strong></section>;
}
function SequenceVideo({state,reduce,name}:{state:import('./presentation').SharedCinematic;reduce:boolean;name:string}){const initial=useRef(state);return <GlobalCinematic state={initial.current} skip={false} reduce={reduce} winnerName={name}/>}
export function SpecialDraw({game,onComplete}:{game:Game;onComplete:()=>void}){
 const finish=useRef(onComplete);finish.current=onComplete;const presentation=game.hand.drawPresentation;
 useEffect(()=>{const timer=setTimeout(()=>finish.current(),presentation?Math.max(0,presentation.endsAt-presentation.serverNow):4000);return()=>clearTimeout(timer)},[presentation?.startedAt]);
 return <section className="special-draw" role="dialog" aria-label="流局滿貫"><small>牌山耗盡</small><h1>流局滿貫</h1><p>么九捨牌 · 未被鳴牌</p><div className="nagashi-rivers">{game.hand.settlement?.nagashi?.map(seat=><article key={seat} data-winner={seat}><header>{game.room.players.find(p=>p.seat===seat)?.name}<strong>滿貫自摸計付 · {(game.hand.settlement?.transfers??[]).filter(t=>t.to===seat).reduce((n,t)=>n+t.amount,0).toLocaleString()} 點</strong></header><div>{game.hand.discards[seat].map(tile=><ResultTile key={tile.id} tile={tile}/>)}</div></article>)}</div><footer>按成立者逐家計付 · 不收不聽罰符 · 隨後顯示點數轉移</footer></section>;
}
