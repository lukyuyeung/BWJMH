import {getLanguage} from './language';
import {useWinReport} from './win-report-timing';
import React,{useEffect,useLayoutEffect,useRef} from 'react';
import type {Game,Seat} from './main';import type {Character} from './presentation';import {ResultTile,ResultMeld,sortResultTiles} from './result-tiles';import {yakuEnglishToChinese} from './yaku-catalog';import './win-banner.css';
const A='/art/results/';
function Digits({value,unit}:{value:number;unit:string}){return <span className="wb-digits" aria-label={value+' '+unit}>{String(value).split('').map((n,i)=><img key={i} src={A+'digits/'+n+'-ivory.svg'} alt={n}/>)}<small>{unit}</small></span>}
export function WinBanner({game,character,name,level,onScores,onComplete,reduce=false}:{game:Game;character:Character;name:string;level:string;onScores:()=>void;onComplete?:()=>void;reduce?:boolean}){
 const result=game.hand.result!,h=game.hand,match=h.match;const reduced=reduce||matchMedia('(prefers-reduced-motion: reduce)').matches;
 const bonus=[['寶牌',result.dora.indicatorDora],['赤寶牌',result.dora.akaDora],['裏寶牌',result.dora.uraDora]] as const;
 const rows=[...result.evaluation.yaku.map(y=>({name:yakuEnglishToChinese[y.name]??y.name,value:y.yakuman??y.han,unit:y.yakuman?'役滿':'番'})),...bonus.filter(([,v])=>v>0&&!result.evaluation.yakuman).map(([name,value])=>({name,value,unit:'番'}))];
 const available=['mangan','haneman','baiman','sanbaiman','yakuman','double-yakuman','counted-yakuman'];const limit=available.includes(level)?level==='counted-yakuman'?'yakuman':level:'';
 const report=useWinReport(game,character,level,rows.length,reduced);
 const notified=useRef(false);useEffect(()=>{if(report.stage==='complete'&&onComplete&&!notified.current){notified.current=true;onComplete()}},[report.stage,onComplete]);
 const raw=h.settlement?.winningHand??[],final=raw.at(-1),concealed=sortResultTiles(raw.filter(t=>t.id!==final?.id));const hand=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{const el=hand.current;if(!el)return;const fit=()=>{const slots=[...el.querySelectorAll<HTMLElement>('.wb-concealed>.result-art-tile,.wb-final>.result-art-tile,.result-art-slot')],units=slots.reduce((n,e)=>n+(e.classList.contains('result-sideways')?278/188:1),0);el.style.setProperty('--result-tile-w',Math.min(52,(el.clientWidth-35-slots.length*2)/Math.max(1,units))+'px')};fit();const observer=new ResizeObserver(fit);observer.observe(el);return()=>observer.disconnect()},[raw.length]);
 const indicator=(tiles:Game['hand']['doraIndicators'])=>Array.from({length:5},(_,i)=><ResultTile key={i} tile={tiles[i]??{id:'hidden'+i,face:'E',red:false}} back={!tiles[i]}/>);
 const seats:Seat[]=['east','south','west','north'];const wind=['東','南','西','北'][(seats.indexOf(result.winner)-seats.indexOf(match.dealer)+4)%4];
 return <section className="win-banner-overlay" role="dialog" aria-modal="true" aria-label="和牌結算" data-level={limit||'normal'} data-reduce={reduced||undefined} data-stage={report.stage}>
 <div className="wb-band"/><div className="wb-canvas"><header className="wb-header"><span>BUNNY GALA</span><span>{getLanguage()==='en'?`${match.roundWind==='east'?'East':'South'} ${match.handNumber} · East-only`:`${match.roundWind==='east'?'東':'南'}${match.handNumber}局　四人東`}</span></header>
 <img className="wb-character" src={character==='yellow'?A+'yellow-presentation.png':'/art/ribbon-v2/'+character+'-character.png'} alt={name}/><div className="wb-player"><small>和牌玩家</small><strong>{name}</strong><span>{wind} · {result.method==='ron'?'榮和':'自摸'}</span></div>
 <main className="wb-info"><div className="wb-winning" ref={hand}><div className="wb-concealed">{concealed.map(t=><ResultTile key={t.id} tile={t}/>)}</div><div className="wb-melds">{h.melds[result.winner].map((m,i)=><ResultMeld key={i} meld={m} seat={result.winner}/>)}</div>{final&&<div className="wb-final"><ResultTile tile={final}/><small>和</small></div>}</div>
 <div className="wb-indicators"><div><small>寶牌指示牌</small><div>{indicator(h.doraIndicators)}</div></div>{!!h.uraIndicators?.length&&<div><small>裏寶牌指示牌</small><div>{indicator(h.uraIndicators)}</div></div>}</div>
 <div className="wb-yaku" style={{gridTemplateColumns:`repeat(${Math.max(3,Math.ceil(rows.length/2))},minmax(0,1fr))`}} data-dense={rows.length>10||undefined}>{rows.map((row,i)=><div className="wb-yaku-row" key={i} data-visible={report.revealed>i||undefined} data-active={report.activeRow===i||undefined} style={{visibility:report.revealed>i?'visible':'hidden'}}><span>{row.name}</span><b>{row.value}<small>{row.unit}</small></b></div>)}</div>
 <div className="wb-grade" style={{visibility:report.grade?'visible':'hidden'}}><Digits value={result.evaluation.yakuman||result.score.han} unit={result.evaluation.yakuman?'役滿':'番'}/>{!result.evaluation.yakuman&&<Digits value={result.score.fu} unit="符"/>}</div>
 <div className="wb-total" style={{visibility:report.points?'visible':'hidden'}}>{limit&&<img className="wb-limit-small" src={A+'limits/'+limit+'.png'} alt={limit}/>}<Digits value={result.score.payment.total} unit="點"/></div>
 </main><button hidden={!!game.room.resultFlow} className="wb-next" onClick={onScores}>查看點數　→</button>
 </div></section>
}
