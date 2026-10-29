import React,{useEffect,useRef,useState} from 'react';
import type {Game} from './main';
import {ResultTile,ResultMeld} from './result-tiles';
import {sortResultTiles} from './result-tiles';
const limits:Record<string,string>={none:'和牌',mangan:'滿貫',haneman:'跳滿',baiman:'倍滿',sanbaiman:'三倍滿',yakuman:'役滿'};
export function SpecialWinSequence({game,onComplete,reduce}:{game:Game;onComplete:()=>void;reduce:boolean}){
 const plan=game.hand.winSequence!,clock=useRef({id:plan.id,at:performance.now(),age:plan.serverNow-plan.startedAt});
 if(clock.current.id!==plan.id)clock.current={id:plan.id,at:performance.now(),age:plan.serverNow-plan.startedAt};
 const [age,setAge]=useState(clock.current.age),done=useRef(false),callback=useRef(onComplete);callback.current=onComplete;
 useEffect(()=>{done.current=false;const tick=()=>{const n=clock.current.age+performance.now()-clock.current.at;setAge(n);if(n>=plan.endsAt-plan.startedAt&&!done.current){done.current=true;callback.current()}};tick();const timer=setInterval(tick,40);return()=>clearInterval(timer)},[plan.id]);
 const segment=plan.segments.find(s=>age>=s.start&&age<s.end);if(!segment)return null;
 const result=(game.hand.results??(game.hand.result?[game.hand.result]:[])).find(r=>r.winner===segment.winner);if(!result)return null;
 const winner=result.winner,name=game.room.players.find(p=>p.seat===winner)?.name??'',raw=game.hand.settlement?.winningHands?.[winner]??[],final=raw.at(-1),tiles=sortResultTiles(raw.filter(t=>t.id!==final?.id));
 const call=result.method==='tsumo'?'自摸':'榮和',title=result.evaluation.yakuman>1?`${result.evaluation.yakuman} 倍役滿`:limits[result.score.limit]??'和牌';
 return <section className="tycoon-win" data-stage={segment.kind} data-reduce={reduce} role="status" aria-label={segment.kind==='call'?call:segment.kind==='reveal'?'和牌翻牌':title}><div className="tycoon-win-frame"/><small>{name}</small><strong>{segment.kind==='call'?call:segment.kind==='reveal'?'和牌手牌':title}</strong>{segment.kind!=='call'&&<div className="tycoon-winning-row" key={segment.winner+segment.kind}>{tiles.map((tile,i)=><span key={tile.id} style={{'--tile-delay':i*45+'ms'} as React.CSSProperties}><ResultTile tile={tile}/></span>)}{game.hand.melds[winner].map((meld,i)=><ResultMeld key={i} meld={meld} seat={winner}/>)}{final&&<span className="tycoon-final-tile"><ResultTile tile={final}/></span>}</div>}<p>{segment.kind==='call'?'WINNING HAND':segment.kind==='reveal'?'翻開本手實際和牌牌面':'隨後逐項計算役種與點數'}</p></section>;
}
