import React,{useEffect,useState} from 'react';import {ResultOverlay,type ResultOverlayProps} from './results';import {useLanguage} from './language';import './multi-win-results.css';
/** Both winners share the score transfer; each hand has its own readable report. */
export function MultiWinResultOverlay(props:ResultOverlayProps){
 const {game}=props,results=game.hand.results??(game.hand.result?[game.hand.result]:[]),[selected,setSelected]=useState(0),language=useLanguage();
 const key=[game.room.code,game.hand.match.roundWind,game.hand.match.handNumber,game.hand.match.honba].join(':');useEffect(()=>setSelected(0),[key]);
 const result=results[Math.min(selected,results.length-1)],view=result?{...game,hand:{...game.hand,result,settlement:game.hand.settlement?{...game.hand.settlement,winningHand:game.hand.settlement.winningHands?.[result.winner]??game.hand.settlement.winningHand}:undefined}}:game;
 return <>{results.length>1&&<nav className="double-ron-reports" aria-label={language==='en'?'Double Ron reports':'雙響和牌結果'}><strong>{language==='en'?'DOUBLE RON':'雙響'}</strong>{results.map((win,index)=><button key={win.winner} aria-pressed={index===selected} onClick={()=>setSelected(index)}>{game.room.players.find(p=>p.seat===win.winner)?.name??win.winner}<span>{win.score.payment.total.toLocaleString()}</span></button>)}</nav>}<ResultOverlay key={key+':'+selected} {...props} game={view}/></>;
}
