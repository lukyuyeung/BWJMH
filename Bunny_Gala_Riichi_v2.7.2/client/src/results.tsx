import React,{useEffect,useMemo,useRef,useState} from 'react';
import type {Game,Seat,Tile} from './main.js';
import type {Character} from './presentation.js';
import './results.css';
import{FourWaySettlement}from'./settlement.js';
type Meld=Game['hand']['melds'][Seat][number];
export type ResultOverlayProps={game:Game;characters:Record<string,Character>;pending:boolean;onNext:()=>void;renderTile:(tile:Tile)=>React.ReactNode;renderMeld:(meld:Meld,seat:Seat,index:number)=>React.ReactNode;embedded?:boolean;language?:'zh'|'en';onExit?:()=>void};
const ART='/art/results/';
const seats:Seat[]=['east','south','west','north'];
const characterNames:Record<Character,string>={yellow:'LUK',wizard:'WIZARD',ninja:'NINJA',king:'KING'};
const yakuNames:Record<string,string>={Tanyao:'斷么九','Double Riichi':'雙立直',Tenhou:'天和',Chiihou:'地和',Riichi:'立直',Ippatsu:'一發','Menzen Tsumo':'門前清自摸',Pinfu:'平和',Yakuhai:'役牌',Iipeikou:'一盃口','Sanshoku Doujun':'三色同順',Ittsu:'一氣通貫',Toitoi:'對對和',Chiitoitsu:'七對子',Honitsu:'混一色',Chinitsu:'清一色',Honroutou:'混老頭',Shousangen:'小三元','Haitei Raoyue':'海底摸月','Houtei Raoyui':'河底撈魚','Rinshan Kaihou':'嶺上開花',Chankan:'搶槓','Kokushi Musou':'國士無雙',Daisangen:'大三元',Tsuuiisou:'字一色',Chinroutou:'清老頭'};
const limits:Record<string,{zh:string;en:string;art?:string}>={mangan:{zh:'滿貫',en:'MANGAN',art:'mangan'},haneman:{zh:'跳滿',en:'HANEMAN',art:'haneman'},baiman:{zh:'倍滿',en:'BAIMAN',art:'baiman'},sanbaiman:{zh:'三倍滿',en:'SANBAIMAN',art:'sanbaiman'},yakuman:{zh:'役滿',en:'YAKUMAN',art:'yakuman'},'double-yakuman':{zh:'雙倍役滿',en:'DOUBLE YAKUMAN',art:'double-yakuman'},'counted-yakuman':{zh:'累計役滿',en:'COUNTED YAKUMAN',art:'yakuman'}};
function ScoreDigits({value}:{value:number}){return <span className="gr-digits" aria-label={value.toLocaleString()}>{String(Math.max(0,value)).split('').map((digit,i)=><img src={ART+'digits/'+digit+'-ivory.svg'} key={i} alt="" aria-hidden="true"/>)}</span>}
export function ResultOverlay({game,characters,pending,onNext,renderTile,renderMeld,embedded=false,language='zh',onExit}:ResultOverlayProps){
 const {room}=game;const result=game.hand.result;const [phase,setPhase]=useState<'hand'|'scores'|'ranking'>('hand');
 const [revealStep,setRevealStep]=useState(0);const [replay,setReplay]=useState(0);const railRef=useRef<HTMLDivElement>(null);const handRef=useRef<HTMLDivElement>(null);
 const t=(zh:string,en:string)=>language==='zh'?zh:en;
 const handKey=[room.code,game.hand.match.roundWind,game.hand.match.handNumber,game.hand.match.honba].join(':');
 useEffect(()=>setPhase('hand'),[handKey]);
 useEffect(()=>{if(embedded)return;const before=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=before}},[embedded]);
 const winner=result?.winner??game.you.seat;const character=characters[winner]??'yellow';const winnerName=room.players.find(p=>p.seat===winner)?.name??characterNames[character];
 const baseLimit=result?.evaluation.yakuman&&result.evaluation.yakuman>1?'double-yakuman':result?.score.limit.toLowerCase().replaceAll('_','-')??'';
 const limit=limits[baseLimit];const match=game.hand.match;
 const rawHand=game.hand.settlement?.winningHand??[];const finalTile=rawHand.at(-1);const concealed=rawHand.slice(0,-1);
 const scoreChanges=game.hand.settlement?.scoreChanges;
 const ranked=useMemo(()=>room.finalRanking??[...seats].sort((a,b)=>room.scores[b]-room.scores[a]),[room.finalRanking,room.scores]);
 const seatName=(seat:Seat)=>language==='zh'?({east:'東',south:'南',west:'西',north:'北'}[seat]):seat.toUpperCase();
 const bonus=result?[{zh:'寶牌',en:'DORA',value:result.dora.indicatorDora},{zh:'赤寶牌',en:'AKA DORA',value:result.dora.akaDora},{zh:'裏寶牌',en:'URA DORA',value:result.dora.uraDora}]:[];
 const rows=result?[...result.evaluation.yaku.map(y=>({name:language==='zh'?(yakuNames[y.name]??y.name):y.name,value:y.yakuman??y.han,unit:y.yakuman?t('役滿','YAKUMAN'):t('番','HAN'),bonus:false})),...bonus.filter(b=>b.value>0).map(b=>({name:t(b.zh,b.en),value:b.value,unit:t('番','HAN'),bonus:true}))]:[];
 useEffect(()=>{
  if(phase!=='hand'||!result)return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setRevealStep(rows.length+5);return}
  setRevealStep(0);const timers:ReturnType<typeof setTimeout>[]=[];
  for(const [step,at] of [[1,100],[2,650],[3,1100]])timers.push(setTimeout(()=>setRevealStep(n=>Math.max(n,step!)),at));
  for(let i=0;i<rows.length;i++)timers.push(setTimeout(()=>setRevealStep(n=>Math.max(n,i+4)),1600+i*420));
  const afterRows=1600+rows.length*420;
  timers.push(setTimeout(()=>setRevealStep(n=>Math.max(n,rows.length+4)),afterRows+300));
  timers.push(setTimeout(()=>setRevealStep(n=>Math.max(n,rows.length+5)),afterRows+950));
  return()=>timers.forEach(clearTimeout);
 },[handKey,phase,result?.winner,result?.method,rows.length,language,replay]);
 useEffect(()=>{
  const rail=railRef.current,content=handRef.current;if(!rail||!content)return;
  const fit=()=>{const width=rail.clientWidth,natural=content.offsetWidth;if(!width||!natural)return;const scale=width/natural;content.style.transform=`scale(${scale})`;rail.style.height=`${Math.ceil(content.offsetHeight*scale)+parseFloat(getComputedStyle(content).top)}px`};
  fit();const observer=new ResizeObserver(fit);observer.observe(rail);observer.observe(content);return()=>observer.disconnect();
 },[phase,handKey,rawHand.length,game.hand.melds[winner].length]);
 const totalVisible=revealStep>=rows.length+4;const limitVisible=revealStep>=rows.length+5;
 const roundLabel=language==='zh'?`${match.roundWind==='east'?'東':'南'}${match.handNumber}局 · ${match.honba}本場`:`${match.roundWind.toUpperCase()} ${match.handNumber} · HONBA ${match.honba}`;
 const resultTitle=phase==='ranking'?t('終局排名','MATCH RESULTS'):phase==='scores'?t('點數結算','SCORE SETTLEMENT'):result?t(result.method==='tsumo'?'自摸':'榮和',result.method.toUpperCase()):t(game.hand.abortiveReason?'中途流局':'荒牌流局',game.hand.abortiveReason?'ABORTIVE DRAW':'EXHAUSTIVE DRAW');
 return <section className={'gala-result'+(embedded?' gr-embedded':'')+' gr-phase-'+phase+(result?' gr-won':' gr-draw')} role="dialog" aria-modal={!embedded} aria-label={t('牌局結算','Hand results')} data-result-phase={phase}>
  <div className="gr-backdrop" aria-hidden="true"/><div className="gr-vignette" aria-hidden="true"/>
  <header className="gr-header"><div className="gr-edition"><span className="gr-mark" aria-hidden="true">✦</span><span>BUNNY GALA <small>{t('日式立直麻雀','RIICHI MAHJONG')}</small></span></div><div className="gr-round">{roundLabel}<span>{t('房間','ROOM')} {room.code}</span></div></header>
  <div className="gr-stage">
   <aside className="gr-hero"><div className="gr-halo" aria-hidden="true"/><img className="gr-character" src={ART+character+'-presentation.png'} alt={characterNames[character]}/><div className="gr-player-plate"><span className="gr-player-kicker">{result?t('和牌玩家','WINNING PLAYER'):t('本局結束','ROUND COMPLETE')}</span><strong>{winnerName}</strong><span>{characterNames[character]} <i>·</i> {seatName(winner)}{winner===match.dealer?' · '+t('莊家','DEALER'):''}</span></div></aside>
   <main className="gr-main">
    <div className="gr-title-row"><div><p className="gr-eyebrow">{phase==='hand'?'HAND COMPLETE':phase==='scores'?'ROUND BALANCE':'FINAL STANDINGS'}</p><h1>{resultTitle}</h1></div></div>
    {phase==='hand'&&result&&<div className="gr-score-sheet" data-hand-revealed={revealStep>=1} data-dora-revealed={revealStep>=2} data-ura-revealed={revealStep>=3}>
     <section className="gr-tile-panel" aria-label={t('和牌牌面','Winning hand')}><div className="gr-panel-label"><span>{t('和牌牌面','WINNING HAND')}</span><span>{t('門前牌與副露','CONCEALED + MELDS')}</span></div><div className="gr-winning-hand" ref={railRef}><div className="gr-hand-content" ref={handRef}><div className="gr-concealed">{concealed.map(renderTile)}</div>{game.hand.melds[winner].length>0&&<div className="gr-melds">{game.hand.melds[winner].map((m,i)=>renderMeld(m,winner,i))}</div>}{finalTile&&<div className="gr-final-tile"><span>{t('和','WIN')}</span>{renderTile(finalTile)}</div>}{rawHand.length===0&&<span className="gr-muted">{t('等候牌面同步','Waiting for hand data')}</span>}</div></div></section>
     <div className="gr-dora-rail gr-report-indicators"><div className="gr-indicator-group gr-dora-group"><small>{t('寶牌','DORA INDICATORS')}</small><div className="gr-indicator-tiles">{game.hand.doraIndicators.map(renderTile)}{Array.from({length:Math.max(0,5-game.hand.doraIndicators.length)},(_,i)=><span className="tile-back" key={'d'+i} aria-hidden="true"/>)}</div></div><div className="gr-indicator-group gr-ura-group"><small>{t('裏寶牌','URA DORA INDICATORS')}</small><div className="gr-indicator-tiles">{game.hand.resultUraIndicators?.map(renderTile)}{Array.from({length:Math.max(0,5-(game.hand.resultUraIndicators?.length??0))},(_,i)=><span className="tile-back" key={'u'+i} aria-hidden="true"/>)}</div>{!game.hand.resultUraIndicators&&<span className="gr-indicator-status">{game.hand.riichi[winner]?t('待牌面同步','AWAITING INDICATORS'):t('未立直','NO RIICHI')}</span>}</div></div>
     <div className="gr-analysis"><section className="gr-yaku-panel"><div className="gr-panel-label"><span>{t('役種與寶牌','YAKU & BONUSES')}</span><span>{t('番數','HAN')}</span></div><div className="gr-yaku-list">{rows.map((row,i)=><div className={'gr-yaku-row'+(row.bonus?' gr-bonus-row':'')} key={i} data-revealed={revealStep>=i+4}><span>{row.name}</span><b>{row.value}<small>{row.unit}</small></b></div>)}</div></section>{result&&phase==='hand'&&<div className="gr-hand-grade gr-reveal-total" data-revealed={totalVisible}><strong>{result.evaluation.yakuman?result.evaluation.yakuman:result.score.han}</strong><span>{result.evaluation.yakuman?t('役滿','YAKUMAN'):t('番','HAN')}</span>{!result.evaluation.yakuman&&<small>{result.score.fu}{t('符',' FU')}</small>}</div>}</div>
      <section className="gr-point-panel" data-total-revealed={totalVisible} data-limit-revealed={limitVisible} aria-label={t('和牌點數','Winning points')}><span className="gr-point-kicker">{totalVisible?t('和牌點數','HAND VALUE'):t('逐項確認役種…','REVEALING YAKU…')}</span>{limit?.art?<img className="gr-limit-art" src={ART+'limits/'+limit.art+(language==='en'?'-en':'')+'.png'} alt={t(limit.zh,limit.en)}/>:<span className="gr-limit-text">{limit?t(limit.zh,limit.en):t('和牌','WIN')}</span>}<div className="gr-point-total"><ScoreDigits value={result.score.payment.total}/><span>{t('點','PTS')}</span></div><div className="gr-score-rule"/></section>
    </div>}
    {phase==='hand'&&!result&&<section className="gr-draw-panel"><h2>{t(game.hand.abortiveReason?'本局中途結束':'牌山已用盡',game.hand.abortiveReason?'Hand aborted':'The wall is exhausted')}</h2><p>{game.hand.abortiveReason??t('聽牌與未聽牌的點數交換如下；供託保留。','Tenpai / noten payments are shown below. The riichi pot carries over.')}</p><div className="gr-tenpai-grid">{seats.map(seat=><div key={seat}><b>{room.players.find(p=>p.seat===seat)?.name}</b><span className={game.hand.settlement?.tenpai.includes(seat)?'gr-positive':'gr-muted'}>{game.hand.abortiveReason?t('中途流局','ABORTED'):game.hand.settlement?.tenpai.includes(seat)?t('聽牌','TENPAI'):t('未聽','NOTEN')}</span></div>)}</div></section>}
    {phase==='scores'&&<FourWaySettlement game={game} language={language}/>}
    {phase==='ranking'&&<section className="gr-ranking-panel"><div className="gr-panel-label"><span>{t('最終名次','FINAL RANKING')}</span><span>{t('最終持點','FINAL SCORE')}</span></div><div className="gr-ranking-list">{ranked.map((seat,i)=><div className={'gr-ranking-row'+(i===0?' gr-first-place':'')} key={seat}><img className="gr-place-art" src={ART+'rankings/place-'+(i+1)+'.svg'} alt={String(i+1)}/><span className="gr-avatar"><img src={ART+(characters[seat]??'yellow')+'-avatar.png'} alt=""/></span><div className="gr-rank-person"><strong>{room.players.find(p=>p.seat===seat)?.name}</strong><small>{characterNames[characters[seat]??'yellow']}</small></div><strong className="gr-rank-score">{room.scores[seat].toLocaleString()}<small>{t('點','PTS')}</small></strong></div>)}</div></section>}
   </main>
  </div>
  <footer className="gr-footer"><div className="gr-progress" aria-label={t('結算步驟','Settlement steps')}>{(['hand','scores',...(room.match.finished?['ranking']:[])] as const).map((step,i)=><button className={phase===step?'gr-active':''} key={step} onClick={()=>setPhase(step as typeof phase)}><b>{String(i+1).padStart(2,'0')}</b><span>{step==='hand'?t('牌局結果','HAND'):step==='scores'?t('點數變動','BALANCE'):t('終局排名','RANKING')}</span></button>)}</div><div className="gr-footer-actions">{phase==='hand'&&result&&<button className="gr-animation-control" onClick={()=>limitVisible?setReplay(n=>n+1):setRevealStep(rows.length+5)}>{limitVisible?t('重播演出','REPLAY'):t('略過演出','SKIP REVEAL')}</button>}{phase!=='hand'&&<button className="gr-button gr-secondary" onClick={()=>setPhase('hand')}>{t('查看牌面','REVIEW HAND')}</button>}{phase==='hand'?<button className="gr-button gr-primary" onClick={()=>setPhase('scores')}>{t('查看點數','VIEW BALANCE')} <span>→</span></button>:phase==='scores'&&room.match.finished?<button className="gr-button gr-primary" onClick={()=>setPhase('ranking')}>{t('終局排名','FINAL RANKING')} <span>→</span></button>:phase==='scores'?<button className="gr-button gr-primary" disabled={pending} data-action="next-hand" onClick={onNext}>{pending?t('處理中…','PLEASE WAIT…'):t('下一局','NEXT HAND')} <span>→</span></button>:onExit?<button className="gr-button gr-primary" onClick={onExit}>{t('返回大廳','BACK TO LOBBY')} <span>→</span></button>:<span className="gr-match-finished">{t('本場對局已完成','MATCH COMPLETE')}</span>}</div></footer>
 </section>
}
