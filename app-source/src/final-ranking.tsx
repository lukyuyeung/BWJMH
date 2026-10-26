import React from 'react';
import type {Game,Seat} from './main';
import {characterAvatar,characterPortrait} from './character-art';
import {seatCharacter} from './seat-character';
import {carrotSettlement,type CarrotEntry} from '../rules/carrot-settlement';
import './final-ranking-live.css';
const seats:Seat[]=['east','south','west','north'];
/** Actual match results use the approved champion-left design. Bot carrots are explicitly estimates. */
export function FinalRanking({game,onRestart}:{game:Game;onRestart:()=>void}){
 const room=game.room,ranked=room.finalRanking??[...seats].sort((a,b)=>room.scores[b]-room.scores[a]||seats.indexOf(a)-seats.indexOf(b)),winner=ranked[0]!,role=seatCharacter(game,winner),ms=room.rules?.actionTimeoutMs??30000,entry:CarrotEntry=ms===10000?250000:ms===20000?25000:2500,tier=ms===10000?'高級場':ms===20000?'中級場':'新手場';
 let settlement:ReturnType<typeof carrotSettlement>|undefined;try{settlement=carrotSettlement(entry,room.scores)}catch{/* A host must close outstanding deposits before financial estimates. */}
 const name=(s:Seat)=>room.players.find(p=>p.seat===s)?.name??s,net=settlement?.net[game.you.seat],signed=(n:number)=>(n>0?'+':'')+n.toLocaleString();
 return <section className="final-ranking-screen" role="dialog" aria-modal="true" aria-label="終局排名" data-design="champion-v2" data-champion={winner}>
  <header className="fr-top"><span>BUNNY GALA <i>立直麻雀</i></span><span>四人東風戰 <b>終局排名</b></span></header>
  <div className="fr-champion"><div className="fr-light"/><span className="fr-vertical">EAST MATCH CHAMPION</span><div className="fr-champion-heading"><small>第 一 名</small><h1>本場冠軍</h1></div><img className="fr-character" src={characterPortrait(role)} alt={name(winner)+'冠軍角色'} decoding="async"/><div className="fr-champion-name"><span>CHAMPION</span><strong>{name(winner)}</strong><b>{room.scores[winner].toLocaleString()}<em> 點</em></b></div></div>
  <div className="fr-results"><div className="fr-heading"><div><small>FINAL STANDINGS</small><h2>東風戰結束</h2></div><span>{tier} · 入場 {entry.toLocaleString()} 🥕</span></div><div className="fr-columns"><span>名次／玩家</span><span>最終點數</span><span>紅蘿蔔試算</span></div><ol className="fr-standings">{ranked.map((seat,index)=><li key={seat} data-seat={seat} data-you={seat===game.you.seat||undefined}><span className="fr-rank">{index+1}</span><img className="fr-avatar" src={characterAvatar(seatCharacter(game,seat))} alt=""/><span className="fr-person">{name(seat)}<small>{seat===game.you.seat?'自己':index===0?'本場冠軍':'對局玩家'}</small></span><strong className="fr-points">{room.scores[seat].toLocaleString()}</strong><span className={'fr-net '+((settlement?.net[seat]??0)>0?'positive':(settlement?.net[seat]??0)<0?'negative':'')}>{settlement?signed(settlement.net[seat]):'待結算'}</span></li>)}</ol><div className="fr-your-result"><span>你的紅蘿蔔試算<small>{settlement?`入場 ${entry.toLocaleString()} → 結算 ${settlement.payouts[game.you.seat].toLocaleString()}`:'等待供託及點數結算完成'}</small></span><strong className={net!==undefined&&net<0?'negative':''}>{net!==undefined?signed(net):'—'} <em>🥕</em></strong></div><footer className="fr-actions"><a href="/design/lobby/index.html">返回大廳</a><button data-action="restart-match" onClick={onRestart}>再開一局 <span>→</span></button></footer><p className="fr-note">Bot 對局 · 紅蘿蔔為試算，未變更錢包</p></div>
 </section>;
}
