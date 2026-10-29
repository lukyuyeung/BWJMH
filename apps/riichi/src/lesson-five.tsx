import React,{useEffect,useRef,useState} from 'react';
import type {Game} from './main';import type {RiichiReveal} from './riichi-reveal';import {RiichiScratch} from './riichi-scratch';import {ActionArt} from './action-art';import {WinBanner} from './win-banner';import {seatCharacter} from './seat-character';import {completeTileUrl} from './approved-tile-art';import './lesson-five.css';
const api=()=> (window as any).BunnyAcademy;
const titles=['第五課：立直！等到你的自摸','只差一張，就是聽牌','甚麼時候可以立直？','親手宣告立直','立直棒與鎖定的手牌','第一次刮牌：不能和就摸切','繼續等牌，不是立即和牌','第二次刮牌：親手自摸','和牌後，才揭曉裏寶牌','看懂這次立直自摸','記住立直的三件事','第五課完成！'];
const descriptions=[
 '這課會親手立直、刮開兩張摸入牌，最後自摸和牌。教學牌局預先安排，正式對局立直後不保證會贏。',
 '打出北後，這副牌只差八筒或東便完成。下方牌例及聽牌欄會顯示這兩種聽牌；聽牌也不保證能和。',
 '立直需要門前清（沒有吃、碰或明槓）、出牌後聽牌、至少 1,000 點，而且牌山至少還有四張。立直本身是一個役，值一番。',
 '先按右下「立直」，再打出手牌中標亮的北。遊戲只會讓你選擇打出後仍然聽牌的牌。',
 '你放下了 1,000 點立直棒，點數由 25,000 變成 24,000。橫放的北表示宣告立直。之後一般不能自由換手牌，摸到不能和的牌便摸切。',
 '其他三家會依序行動，再自動輪到你摸牌。按住並滑動刮開牌面；若不能和，遊戲會自動打出剛摸的那一張，這就是摸切。',
 '剛摸到的九索不能完成這手牌，已經自動摸切；原來的十三張仍然保留。現在繼續等八筒或東，不需要再按立直。',
 '再等其他三家行動，摸入牌會自動出現。先刮開確認是甚麼牌；牌面揭曉後才出現「自摸」。正式對局亦可跳過和牌；本課先練自摸，放過榮和在第七課練習。',
 '立直並成功和牌後，才會揭曉裏寶牌指示牌。這次裏指示四筒，所以五筒是裏寶牌；你有一張，加一番。不是每次立直和牌都有裏寶牌。',
 '這次有立直一番、門前清自摸和一番；普通寶牌三萬加一番，裏寶牌五筒再加一番。寶牌仍然只是加番，不能代替役。',
 '立直需要條件、一般會鎖定手牌，也可能一直等不到和牌。正式遊戲的刮牌最多十秒，逾時會自動揭曉；本課讓你慢慢練習。',
 '你已親手完成宣告立直、不能和的刮牌摸切，再刮出自摸牌，並看懂裏寶牌與真正的結算結果。'
];
const questions=[{title:'立直之後，通常可以自由更換原來的手牌嗎？',choices:['可以，隨時選一張打出','不可以，通常只能摸切或和牌'],answer:1},{title:'立直後，一定會自摸成功嗎？',choices:['不一定，正式對局可能一直等不到','一定，立直就保證會贏'],answer:0},{title:'甚麼時候可以加算裏寶牌？',choices:['任何和牌都能算','立直並成功和牌後'],answer:1}];
export function LessonFive({game,send,reportReady,busy,reveal,reduce}:{game:Game;send:(event:string,payload:any)=>void;reportReady:boolean;busy:boolean;reveal:RiichiReveal;reduce:boolean}){
 const [step,setStep]=useState<number>(()=>{const s=api()?.read().lessonFive;return s?.completed?0:s?.step??0}),[q,setQ]=useState(0),[correct,setCorrect]=useState(false),[feedback,setFeedback]=useState(''),[reportDone,setReportDone]=useState(false),[claimed,setClaimed]=useState(false),[reward,setReward]=useState(0);const latest=useRef(send);latest.current=send;const root=useRef<HTMLDivElement>(null),h=game.hand,meta=(h as any).academyFive,report=step===9,play=[1,3,4,5,6,7].includes(step),scratch=[5,7].includes(step)&&reveal.active;
 const move=(next:number)=>{if(!api()?.saveLessonFiveStep(next)){setFeedback('未能保存進度，請再試一次。');return}setStep(next)};
 useEffect(()=>{latest.current('academy:five-stage',{stage:step});setQ(0);setCorrect(false);setFeedback('');setReportDone(false)},[step]);
 useEffect(()=>{if(step===3&&h.riichi[game.you.seat])move(4);else if(step===5&&h.discards[game.you.seat].length===2)move(6);else if(step===7&&h.result?.method==='tsumo')move(8)},[step,h.riichi[game.you.seat],h.discards[game.you.seat].length,h.result?.method]);
 useEffect(()=>{if(step!==5||!meta?.ready||reveal.active||busy)return;const timer=setTimeout(()=>latest.current('academy:five-tsumogiri',{}),900);return()=>clearTimeout(timer)},[step,meta?.ready,reveal.active,busy]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key!=='Tab'||!root.current)return;const list=[...root.current.querySelectorAll<HTMLElement>('button:not(:disabled):not([hidden]),a[href]')];if(step===3&&meta?.armed)list.push(...root.current.closest('.phone-stage')!.querySelectorAll<HTMLElement>('.phone-hand-tiles>button.lesson-discard-choice'));e.preventDefault();if(!list.length)return;const i=list.indexOf(document.activeElement as HTMLElement);list[(i+(e.shiftKey?-1:1)+list.length)%list.length]?.focus({preventScroll:true})};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[step,meta?.armed]);
 const ready=meta?.stage===step&&!busy&&(step===2||step===10?correct:report?reportDone:true);
 const choose=(i:number)=>{const item=questions[q]!;if(i!==item.answer){setFeedback('再想想：立直會鎖定手牌，但不保證和牌；裏寶牌只屬於立直和牌。');return}if(q<2){setQ(n=>n+1);setFeedback('答對了，再試下一題。')}else{setCorrect(true);setFeedback('答對了！可以繼續。')}};
 const boxes=step===1?[]:step===3?[{x:110,y:525,w:855,h:107},{x:765,y:430,w:170,h:90}]:step===4?[{x:516,y:316,w:99,h:27},{x:448,y:331,w:62,h:47}]:step===6?[{x:448,y:331,w:100,h:50}]:[];
 const tile=(face:string)=><img src={completeTileUrl(face,false)} alt={face}/>;
 if([8,9].includes(step)&&(!h.result||!reportReady))return <div className="lesson-one lesson-five" ref={root}><div className="lesson-top"><strong>第五課 · 立直自摸演出中</strong><span>接著揭曉裏寶牌與真正的役種結算</span></div><div className="lesson-block" style={{inset:0}}/></div>;
 return <div className={'lesson-one lesson-five '+(report?'lesson-three-result':!play?'lesson-solid':'')} ref={root} role="dialog" aria-modal="true" aria-label="新手學堂第五課" data-step={step}>
 <div className="lesson-top"><strong>新手學堂 · 第五課</strong><span>立直・刮牌・自摸 · 教學安排</span><a href="/design/lobby/index.html?screen=academy">離開・保存已完成小節 ×</a></div>
 {report?<><div className="lesson-block" style={{inset:0}}/><WinBanner game={game} character={seatCharacter(game,game.you.seat)} name={game.room.players.find(p=>p.seat===game.you.seat)?.name??'玩家'} level="normal" allowScores={false} reduce={reduce} onScores={()=>{}} onComplete={()=>setReportDone(true)}/></>:<>
 {play&&<svg className="lesson-shade" viewBox="0 0 1125 634" aria-hidden="true">{boxes.map((b,i)=><rect key={i} {...{x:b.x,y:b.y,width:b.w,height:b.h}} rx="8" fill="none" stroke="#efd18c" strokeWidth="3"/>)}</svg>}
 {step===3&&meta?.armed?<><div className="lesson-block" style={{left:0,top:0,right:0,height:525}}/><div className="lesson-block" style={{left:0,top:525,width:110,bottom:0}}/><div className="lesson-block" style={{left:965,top:525,right:0,bottom:0}}/></>:<div className="lesson-block" style={{inset:0}}/>}
 {step===3&&<button className="lesson-win-action" data-action="academy-five-riichi" aria-label={meta?.armed?'取消立直':'立直'} disabled={busy||meta?.stage!==3} onClick={()=>latest.current('academy:five-arm',{})}><ActionArt kind={meta?.armed?'cancel':'riichi'}/></button>}
 {step===7&&!scratch&&meta?.ready&&h.actions.canTsumo&&!h.result&&<button className="lesson-win-action" data-action="academy-five-tsumo" aria-label="自摸" disabled={busy} onClick={()=>latest.current('academy:five-win',{})}><ActionArt kind="tsumo"/></button>}
 </>}
 <section className={'lesson-card '+(!play&&!report?'lesson-hero':'')} style={report?{left:20,top:60,width:300,height:385}:[5,7].includes(step)?{left:25,top:80,width:310,height:390}:play?{left:245,top:65,width:620,height:step===1?300:step===4?235:255}:undefined}>
 <small>{report?'真實役種與裏寶牌結果':`第五課 · ${step+1} / 12`}</small><h2>{titles[step]}</h2><p>{descriptions[step]}</p>
 {step===0&&<div className="lesson-reward">🥕 首次完成：300 體驗紅蘿蔔<small>保存在本瀏覽器；未完成的小節重新練習。</small></div>}
 {step===1&&<div className="lesson-five-waits"><span>打出</span>{tile('N')}<span>→ 等</span>{tile('8p')}{tile('E')}</div>}
 {step===2&&<><div className="lesson-five-conditions"><b>門前清</b><b>聽牌</b><b>1,000 點</b><b>牌山 ≥ 4 張</b></div><div className="lesson-three-answers"><button onClick={()=>setFeedback('還要門前清、聽牌，以及牌山至少剩四張。')}>只要有 1,000 點就能立直</button><button onClick={()=>{setCorrect(true);setFeedback('答對了！四個條件都要符合。')}}>四個條件都要符合</button></div></>}
 {step===4&&<div className="lesson-five-stick">25,000 → <b>{game.room.scores[game.you.seat].toLocaleString()}</b>　<span>立直棒 1,000 點</span></div>}
 {step===8&&<div className="lesson-five-ura"><div><small>裏寶牌指示牌</small>{tile(h.uraIndicators?.[0]?.face??'4p')}</div><b>→</b><div><small>真正裏寶牌</small>{tile('5p')}</div><strong>手上 1 張<br/>＋1 番</strong></div>}
 {step===10&&<><h3>{questions[q]!.title}　{q+1}/3</h3><div className="lesson-three-answers">{questions[q]!.choices.map((text,i)=><button key={i} aria-label={'立直答案 '+(i+1)} disabled={correct} onClick={()=>choose(i)}>{text}</button>)}</div></>}
 <div className="lesson-feedback" role="status">{feedback||(step===3?meta?.armed?'已選立直：請短按手牌中的北。':'先按右下立直，再選北。':[5,7].includes(step)?scratch?'刮開牌面，或按「直接揭曉」。':meta?.running?'南 → 西 → 北，然後自動摸牌…':step===5?'不能和：即將自動摸切九索。':'可以和：請按右下「自摸」。':'')}</div>
 {step===11?<><div className="lesson-reward">{claimed?reward?'🥕 已領取 300 體驗紅蘿蔔':'複習完成，不重複派獎':'首次完成：300 體驗紅蘿蔔'}<small>本瀏覽器的體驗獎勵，並非正式錢包入帳。</small></div><footer>{claimed?<><a href="/design/lobby/index.html?screen=academy">返回學堂</a><a className="lesson-primary" href="/?mode=bot&lesson=6">前往第六課 →</a></>:<button className="lesson-primary" onClick={()=>{const r=api()?.completeLessonFive();if(!r?.ok){setFeedback('未能保存，請重試。');return}setReward(r.awarded);setClaimed(true)}}>{api()?.read().lessonFive.completed?'完成複習':'完成第五課・領取獎勵'}</button>}</footer></>:[3,5,7].includes(step)?<footer><span>完成本步操作後自動繼續</span></footer>:<footer><span>{report&&!reportDone?'役種計算中…':'已完成小節會保存'}</span><button className="lesson-primary" disabled={!ready} onClick={()=>move(step+1)}>{step===0?'開始第五課 →':step===10?'完成第五課 →':'下一步 →'}</button></footer>}
 </section>
 {scratch&&<RiichiScratch key={reveal.key} reveal={reveal} canTsumo={h.actions.canTsumo} reduce={reduce}/>}
 </div>
}
