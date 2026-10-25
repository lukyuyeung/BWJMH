import React,{useCallback,useEffect,useRef,useState} from 'react';import {ResultOverlay,type ResultOverlayProps} from './results';import {useLanguage} from './language';import './multi-win-results.css';
/** Both winners share the score transfer; each hand has its own readable report. */
export function MultiWinResultOverlay(props:ResultOverlayProps){
 const {game}=props,results=game.hand.results??(game.hand.result?[game.hand.result]:[]),[selected,setSelected]=useState(0),language=useLanguage();
 const key=[game.room.code,game.hand.match.roundWind,game.hand.match.handNumber,game.hand.match.honba].join(':');useEffect(()=>setSelected(0),[key]);
 const reported=useRef(new Set<number>()),sent=useRef(false);useEffect(()=>{reported.current.clear();sent.current=false},[key]);
 const complete=useCallback(()=>{if(!game.room.resultFlow||sent.current)return;reported.current.add(selected);const next=results.findIndex((_,i)=>!reported.current.has(i));if(next>=0)setSelected(next);else{sent.current=true;props.onReportComplete?.()}},[key,selected,results.length,game.room.resultFlow?.id,props.onReportComplete]);
 const result=results[Math.min(selected,results.length-1)],view=result?{...game,hand:{...game.hand,result,settlement:game.hand.settlement?{...game.hand.settlement,winningHand:game.hand.settlement.winningHands?.[result.winner]??game.hand.settlement.winningHand}:undefined}}:game;
 return <>{results.length>1&&<nav className="double-ron-reports" aria-label={language==='en'?'Double Ron reports':'雙響和牌結果'}><strong>{language==='en'?'DOUBLE RON':'雙響'}</strong>{results.map((win,index)=><button key={win.winner} aria-pressed={index===selected} disabled={!!game.room.resultFlow} onClick={()=>setSelected(index)}>{game.room.players.find(p=>p.seat===win.winner)?.name??win.winner}<span>{win.score.payment.total.toLocaleString()}</span></button>)}</nav>}<ResultOverlay key={key+':'+selected} {...props} onReportComplete={complete} game={view}/></>;
}
