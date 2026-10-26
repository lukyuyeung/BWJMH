import React,{useCallback,useEffect,useRef,useState} from 'react';import {ResultOverlay,type ResultOverlayProps} from './results';import './multi-win-results.css';
/** Count exactly one winning hand at a time, then use one shared score transfer. */
export function MultiWinResultOverlay(props:ResultOverlayProps){
 const {game}=props,results=game.hand.results??(game.hand.result?[game.hand.result]:[]),[selected,setSelected]=useState(0),[allCounted,setAllCounted]=useState(false);
 const key=[game.room.code,game.hand.match.roundWind,game.hand.match.handNumber,game.hand.match.honba].join(':'),reported=useRef(new Set<number>()),sent=useRef(false),advance=useRef<ReturnType<typeof setTimeout>>();
 useEffect(()=>{setSelected(0);setAllCounted(false);reported.current.clear();sent.current=false;return()=>clearTimeout(advance.current)},[key]);
 const complete=useCallback(()=>{
  if(reported.current.has(selected))return;reported.current.add(selected);
  const next=results.findIndex((_,i)=>!reported.current.has(i));
  if(next>=0)advance.current=setTimeout(()=>setSelected(next),900);
  else setAllCounted(true);
 },[key,selected,results.length,game.room.resultFlow?.id,props.onReportComplete]);
 useEffect(()=>{if(allCounted&&game.room.resultFlow?.phase==='report'&&!sent.current){sent.current=true;props.onReportComplete?.()}},[allCounted,game.room.resultFlow?.id,game.room.resultFlow?.phase,props.onReportComplete]);
 const result=results[Math.min(selected,results.length-1)],view=result?{...game,hand:{...game.hand,result,settlement:game.hand.settlement?{...game.hand.settlement,winningHand:game.hand.settlement.winningHands?.[result.winner]??game.hand.settlement.winningHand}:undefined}}:game;
 return <>{results.length>1&&<div className="double-ron-reports sequential-report" role="status" aria-label="雙響依序計算役種"><strong>雙響</strong><span>第 {selected+1}／{results.length} 家 · {game.room.players.find(p=>p.seat===result?.winner)?.name}</span><small>{allCounted?'兩家計算完成':'依序計算役種與分數'}</small></div>}<ResultOverlay key={key+':'+selected} {...props} allowScores={results.length<2||allCounted} onReportComplete={complete} game={view}/></>;
}
