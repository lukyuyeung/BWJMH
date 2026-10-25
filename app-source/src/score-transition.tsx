import {useScoreAudio} from './game-audio';
import {seatCharacter} from './seat-character';
import React,{useEffect,useState} from 'react';
import './score-polish45.css';
import type {Game,Seat} from './main.js';
const seats:Seat[]=['east','south','west','north'];
const names=['玩家','金帽兔','忍者兔','魔法兔'];
const portraits=['CHARACTER_PLAYER_YELLOW_BUNNY_MASTER.png','CHARACTER_KING_MASTER.jpeg','CHARACTER_NINJA_MASTER.jpeg','CHARACTER_WIZARD_MASTER.jpeg'];
export function ScoreTransition({game,ranking,onRanking,onClose,onNext,onRestart,reduce=false}:{game:Game;ranking:boolean;reduce?:boolean;onRanking:()=>void;onClose:()=>void;onNext:()=>void;onRestart:()=>void}){
 useScoreAudio(game,ranking);
 const r=game.room,h=game.hand,order=Array.from({length:4},(_,i)=>seats[(seats.indexOf(game.you.seat)+i)%4]!),ranked=r.finalRanking??[...seats].sort((a,b)=>r.scores[b]-r.scores[a]||seats.indexOf(a)-seats.indexOf(b));
 const [progress,setProgress]=useState(0);
 useEffect(()=>{if(reduce||ranking||matchMedia('(prefers-reduced-motion: reduce)').matches){setProgress(1);return}const start=performance.now();let frame=0;const step=()=>{const t=Math.min(1,(performance.now()-start)/3200);setProgress(t);if(t<1)frame=requestAnimationFrame(step)};setProgress(0);frame=requestAnimationFrame(step);const finish=window.setTimeout(()=>setProgress(1),3300);return()=>{cancelAnimationFrame(frame);clearTimeout(finish)}},[ranking,h.revision,reduce]);
 const label=(seat:Seat)=>r.players.find(p=>p.seat===seat)?.name??names[order.indexOf(seat)],relative=(seat:Seat)=>order.indexOf(seat),wind=(seat:Seat)=>['東','南','西','北'][(seats.indexOf(seat)-seats.indexOf(h.match.dealer)+4)%4];
 const quiet=reduce||matchMedia('(prefers-reduced-motion: reduce)').matches;
 const countTime=Math.max(0,Math.min(1,(progress-.18)/.52)),countProgress=quiet?1:1-Math.pow(1-countTime,3);
 const rankReady=quiet||progress>=.86;
 const beforeRank=[...seats].sort((a,b)=>(r.scores[b]-(h.settlement?.scoreChanges[b]??0))-(r.scores[a]-(h.settlement?.scoreChanges[a]??0))||seats.indexOf(a)-seats.indexOf(b));
 const payerSeats=h.result?order.filter(s=>s!==h.result!.winner&&(h.result!.method==='tsumo'||s===h.result!.from)):[];
 const transfers=h.result?payerSeats.map(from=>({from,to:h.result!.winner})):order.filter(s=>(h.settlement?.scoreChanges[s]??0)<0).flatMap(from=>order.filter(s=>(h.settlement?.scoreChanges[s]??0)>0).map(to=>({from,to})));
 const anchor=[[563,475],[925,335],[563,163],[200,335]],to=h.result?anchor[order.indexOf(h.result.winner)]!:anchor[0]!;

 if(!ranking)return <section className="simple-score-overlay" data-draw={!h.result||undefined} data-rank-stage={rankReady?'updated':'before'} data-animation-progress={progress.toFixed(3)} role="dialog" aria-modal="true" aria-label="四家點數變動">
  <header><span>{h.match.roundWind==='east'?'東':'南'} {h.match.handNumber} 局 · {h.match.honba} 本場</span>{h.result&&<button onClick={onClose}>查看和牌</button>}</header>
  <div className="simple-score-title"><span>{h.result?h.result.method==='tsumo'?'自摸':'榮和':'流局'}</span><strong>點數變動</strong></div>
  {!quiet&&progress>.08&&progress<.78&&<svg className="score-transfer" viewBox="0 0 1125 634" aria-label="點數轉移中"><defs><filter id="transfer-glow" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="3"/></filter></defs>{transfers.map(({from:seat,to:targetSeat},index)=>{
   const from=anchor[order.indexOf(seat)]!,to=anchor[order.indexOf(targetSeat)]!,t=Math.max(0,Math.min(1,(progress-.10-index*.055)/.43)),cx=(from[0]!+to[0]!)/2+(from[1]===to[1]?0:from[0]!<563?-65:65),cy=(from[1]!+to[1]!)/2+(from[0]===to[0]?0:-45),x=(1-t)**2*from[0]!+2*(1-t)*t*cx+t*t*to[0]!,y=(1-t)**2*from[1]!+2*(1-t)*t*cy+t*t*to[1]!;
   return <g key={seat+'-'+targetSeat} data-from={seat} data-to={targetSeat} opacity={Math.sin(Math.PI*t)}><path d={'M '+from.join(' ')+' Q '+cx+' '+cy+' '+to.join(' ')} fill="none" stroke="#dac299" strokeOpacity=".16" strokeWidth="1"/><circle cx={x} cy={y} r="7" fill="#e9c79c" filter="url(#transfer-glow)"/><circle cx={x} cy={y} r="2.2" fill="#fff2d4"/></g>
  })}</svg>}

  {order.map((seat,i)=>{const delta=h.settlement?.scoreChanges[seat]??0,oldRank=beforeRank.indexOf(seat)+1,newRank=ranked.indexOf(seat)+1,shownRank=rankReady?newRank:oldRank;return <article className={'simple-score-seat simple-seat-'+i+((h.results??(h.result?[h.result]:[])).some(r=>r.winner===seat)?' score-winner':'')} data-you={seat===game.you.seat||undefined} data-seat={seat} data-rank={shownRank} key={seat} aria-label={label(seat)+'點數變動'}><span key={shownRank} className={'live-rank'+(rankReady&&oldRank!==newRank?' rank-changed':'')} aria-label={'第'+shownRank+'位'}><img src={'/art/results/rankings/place-'+shownRank+'.svg'} alt={shownRank+'位'}/></span><img className="score-portrait" src={'/art/results/'+seatCharacter(game,seat)+'-avatar.png'} alt=""/><span className="simple-score-person"><b>{wind(seat)}</b>{label(seat)}</span>{!h.result&&<span className={'draw-seat-status '+(h.abortiveReason?'neutral':h.settlement?.tenpai.includes(seat)?'tenpai':'noten')}>{h.abortiveReason==='triple_ron'?'三家榮和流局':h.abortiveReason==='bankruptcy'?'零點終局':h.abortiveReason?'中途流局':h.settlement?.tenpai.includes(seat)?'聽牌':'未聽牌'}</span>}<strong>{Math.round(r.scores[seat]-delta*(1-countProgress)).toLocaleString()}</strong><em style={{opacity:progress>.1?1:0}} className={delta>0?'positive':delta<0?'negative':''}>{delta>0?'+':''}{delta.toLocaleString()}</em></article>})}
  <footer><span>{progress<.72?'點數轉移中':progress<1?'名次更新中':'點數已更新'}{(h.settlement?.awardedPot??0)>0?' · 供託 '+(h.settlement?.awardedPot??0).toLocaleString():''}</span>{r.match.finished?<button data-action="show-ranking" disabled={progress<1} onClick={onRanking}>終局排名 →</button>:<button data-action="next-hand" disabled={progress<1} onClick={onNext}>下一局 →</button>}</footer>
 </section>;
 return <section className="score-transition match-ranking-screen" role="dialog" aria-modal="true" aria-label="終局排名"><header><h2>終局排名</h2><button onClick={onClose}>返回詳情</button></header>
  <><div className="ranking-character"><img src="/gala-v9/rig-assets/golden-banner-v9.png" alt="Bunny Gala 兔子"/></div><ol className="match-ranking">{ranked.map((seat,index)=><li className={'rank-'+(index+1)+(seat===game.you.seat?' is-you':'')} key={seat}><span className="rank-number"><img src={'/art/library-v1/rankings/zh/place-'+(index+1)+'.svg'} alt={(index+1)+'位'}/></span><span className={'jade-avatar avatar-'+relative(seat)}><img src={'/art/v5/'+portraits[relative(seat)]} alt=""/></span><span className="rank-name">{label(seat)}{seat===game.you.seat&&<small>自己</small>}</span><strong>{r.scores[seat].toLocaleString()}<small> 點</small></strong></li>)}</ol><footer><span>依本場最終點數排名</span><button data-action="restart-match" onClick={onRestart}><img className="menu-action-art" src="/art/library-v1/menu/zh/play-again.svg" alt="再開一局"/></button></footer></>
 </section>;
}
