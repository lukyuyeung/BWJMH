import {characterAvatar,characterPortrait} from './character-art';
import React,{useEffect,useRef,useState} from 'react';
import type {Game} from './main';import {WinArt,EyeCutin} from './mangan-art';import {GlobalCinematic} from './presentation';import {seatCharacter} from './seat-character';import {ResultTile,ResultMeld,sortResultTiles} from './result-tiles';import './special-results.css';
export function SpecialWinSequence({game,onComplete,reduce}:{game:Game;onComplete:()=>void;reduce:boolean}){
 const plan=game.hand.winSequence!,offset=useRef({received:performance.now(),age:plan.serverNow-plan.startedAt}),[age,setAge]=useState(offset.current.age),done=useRef(onComplete);done.current=onComplete;
 useEffect(()=>{offset.current={received:performance.now(),age:plan.serverNow-plan.startedAt}},[plan.serverNow,plan.id]);
 useEffect(()=>{const tick=()=>{const next=offset.current.age+performance.now()-offset.current.received;setAge(next);if(next>=plan.endsAt-plan.startedAt)done.current()};tick();const timer=setInterval(tick,25);return()=>clearInterval(timer)},[plan.id]);
 const segment=plan.segments.find(s=>age>=s.start&&age<s.end),results=game.hand.results??[game.hand.result!];
 if(age>=plan.endsAt-plan.startedAt)return null;
 if(!segment)return <section className="special-result-intro" role="status"><small>BUNNY GALA</small><strong>雙響</strong><div>{results.map(r=><span key={r.winner}>{game.room.players.find(p=>p.seat===r.winner)?.name}</span>)}</div></section>;
 const result=results.find(r=>r.winner===segment.winner)!,view={...game,hand:{...game.hand,result,settlement:game.hand.settlement?{...game.hand.settlement,winningHand:game.hand.settlement.winningHands?.[result.winner]??game.hand.settlement.winningHand}:undefined}},name=game.room.players.find(p=>p.seat===segment.winner)?.name??'',role=seatCharacter(view,segment.winner);
 if(segment.kind==='reveal')return <DoubleReveal game={game} age={age-segment.start} reduce={reduce}/>;
 if(segment.kind==='eyes')return <EyeCutin role={role} age={age-segment.start}/>;
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

function DoubleReveal({game,age,reduce}:{game:Game;age:number;reduce:boolean}){
 const results=game.hand.results??[],quiet=reduce||matchMedia('(prefers-reduced-motion: reduce)').matches;
 return <section className="double-reveal" role="dialog" aria-label="雙響兩家翻牌" data-revealed={quiet||age>=650} data-age={Math.floor(age)}><header><small>DOUBLE RON</small><strong>雙響</strong></header><div className="double-reveal-hands">{results.map(r=>{const raw=game.hand.settlement?.winningHands?.[r.winner]??[],final=raw.at(-1),own=sortResultTiles(raw.filter(t=>t.id!==final?.id));return <article key={r.winner} data-winner={r.winner}><div className="double-reveal-player"><img src={characterAvatar(seatCharacter({...game,hand:{...game.hand,result:r}},r.winner))} alt=""/><span>{game.room.players.find(p=>p.seat===r.winner)?.name}</span><strong>榮和</strong></div><div className="double-reveal-row"><div className="double-flip-hand" data-face-up={quiet||age>=650}>{own.map(t=><span className="double-flip-slot" key={t.id}><span className="double-flip-front"><ResultTile tile={t}/></span><span className="double-flip-back"><ResultTile tile={t} back/></span></span>)}{final&&<span className="double-flip-slot double-flip-final"><span className="double-flip-front"><ResultTile tile={final}/></span><span className="double-flip-back"><ResultTile tile={final} back/></span></span>}</div>{game.hand.melds[r.winner].map((m,i)=><ResultMeld key={i} meld={m} seat={r.winner}/>)}</div></article>})}</div><footer>兩家和牌 · 隨後依序展示</footer></section>
}
