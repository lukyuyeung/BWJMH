import React,{useEffect,useRef,useState} from 'react';import type {Game} from './main';import {ActionArt} from './action-art';import {WinBanner} from './win-banner';import {seatCharacter} from './seat-character';import {completeTileUrl} from './approved-tile-art';import './lesson-six.css';
const api=()=> (window as any).BunnyAcademy;
const titles=['第六課：吃、碰、槓與門前清','吃，只能接上家的牌','親手吃一組一二三萬','吃完不摸牌，先出一張','副露後，仍然需要有役','碰：任何一家都可以','親手碰出三張白','碰完，也要先出一張','有白這個役，可以榮和','看懂這次副露和牌','槓：四張相同的牌','親手明槓四張中','槓後補牌與新寶牌指示牌','鳴牌前，想清楚三件事','第六課完成！'];
const descriptions=[
 '這課分三個固定教學例子，親手練習吃、碰與明槓，再了解它們怎樣影響門前清、立直與和牌。正式對局不一定要鳴牌，可以按跳過。',
 '吃只限左方上家。用自己的一、二萬接上家的三萬，組成同花色的連續三張。',
 '先看左方上家打出的三萬，再按右下「吃」，組成一二三萬。吃不能接下家或對家的牌。',
 '右下是一二三萬副露，不能拆回手牌。吃完不用再摸牌，請打出標亮的北。',
 '下家打出九筒，牌形已齊，但吃牌後沒有役，仍不能榮和。這張完成牌形的九筒被放過，也會同巡振聽。',
 '手上有兩張相同的牌，就可以碰別人打出的第三張，不限上家、下家或對家。這次用兩張白碰成三張白，取得「役牌・白」。',
 '先看右方下家打出的白，再按「碰」。白的刻子有役牌一番；不是所有刻子都有役。',
 '右下已攤開三張白。碰完不再摸牌，先打出北。副露後不能立直，但仍可靠其他役和牌。',
 '看右方下家打出的四索。你已有白這個役，可以按「和」榮和；副露後仍需要有役。',
 '這次只有「役牌・白」一番，沒有立直或門前清自摸。攤開的白也會出現在真正的和牌牌組中，分數由正常規則引擎計算。',
 '槓是四張相同牌。本課練明槓：自己三張中，接別人打出的第四張。槓後會自動補一張嶺上牌，並翻開新的寶牌指示牌。暗槓是四張都在自己手上，仍保留門前清；加槓則是把已碰的一組補成四張。',
 '先看對家打出的第四張中，再按「槓」。接著會攤開四張中、自動補牌，並增加寶牌指示牌。',
 '左上指示牌已由一張變兩張，右下是明槓。自動補入的九索不能和，請把它打出；槓不保證和牌。',
 '吃只限上家；吃、碰、明槓會失去門前清，暗槓不會。搶同一張牌時，榮和優先於碰／槓，碰／槓又優先於吃。看清有沒有需要的役，再決定鳴牌或跳過。',
 '你已親手完成吃、碰、明槓與副露榮和，知道何時要出牌、何時會自動補牌，也明白副露後仍須有役。'
];
const questions=[{title:'別人打出一張牌，誰有榮和時最優先？',choices:['榮和優先','吃最優先'],answer:0},{title:'吃牌之後，還可以立直嗎？',choices:['可以，只要有一千點','不可以，已經失去門前清'],answer:1},{title:'自己四張牌做暗槓，會失去門前清嗎？',choices:['不會，暗槓保留門前清','會，所有槓都一樣'],answer:0}];
export function LessonSix({game,send,reportReady,busy,reduce}:{game:Game;send:(e:string,p:any)=>void;reportReady:boolean;busy:boolean;reduce:boolean}){
 const [step,setStep]=useState<number>(()=>{const s=api()?.read().lessonSix;return s?.completed?0:s?.step??0}),[correct,setCorrect]=useState(false),[q,setQ]=useState(0),[feedback,setFeedback]=useState(''),[done,setDone]=useState(false),[claimed,setClaimed]=useState(false),[reward,setReward]=useState(0);const latest=useRef(send);latest.current=send;const root=useRef<HTMLDivElement>(null),h=game.hand,meta=(h as any).academySix,report=step===9,play=[2,3,4,6,7,8,11,12].includes(step),manual=[2,3,6,7,8,11].includes(step),discardStep=[3,7,12].includes(step);
 const move=(n:number)=>{if(!api()?.saveLessonSixStep(n)){setFeedback('未能保存進度，請再試一次。');return}setStep(n)};
 useEffect(()=>{latest.current('academy:six-stage',{stage:step});setCorrect(false);setQ(0);setFeedback('');setDone(false)},[step]);
 useEffect(()=>{if(meta?.stage!==step)return;if([2,6,11].includes(step)&&meta.melded)move(step+1);else if([3,7].includes(step)&&meta.discarded)move(step+1);else if(step===8&&h.result?.method==='ron')move(9)},[step,meta?.stage,meta?.melded,meta?.discarded,h.result?.method]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key!=='Tab'||!root.current)return;const list=[...root.current.querySelectorAll<HTMLElement>('button:not(:disabled):not([hidden]),a[href]')];if(discardStep)list.push(...root.current.closest('.phone-stage')!.querySelectorAll<HTMLElement>('.phone-hand-tiles>button.lesson-six-choice'));e.preventDefault();if(!list.length)return;const i=list.indexOf(document.activeElement as HTMLElement);list[(i+(e.shiftKey?-1:1)+list.length)%list.length]?.focus({preventScroll:true})};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[discardStep]);
 const ready=meta?.stage===step&&!busy&&(step===1||step===4||step===13?correct&&(step!==4||meta.ready):step===12?meta?.discarded:report?done:true);
 const choose=(i:number)=>{if(i!==questions[q]!.answer){setFeedback('再想想：榮和最優先；吃、碰、明槓失去門前清，暗槓則保留。');return}if(q<2){setQ(q+1);setFeedback('答對了，再試下一題。')}else{setCorrect(true);setFeedback('答對了！可以繼續。')}};
 const action=step===2?'chi':step===6?'pon':step===11?'kan':'ron',legal=step===2?!!h.actions.chiSequences.length:step===6?h.actions.canPon:step===11?h.actions.canKan:h.actions.canRon;
 // Keep the centre rivers free; the call's source seat also stays visible.
 const cardStyle=report?{left:20,top:60,width:300,height:385}:[0,14].includes(step)?undefined:[1,2,12].includes(step)?{left:795,top:65,width:310,height:'auto',maxHeight:step===1?440:340}:{left:20,top:125,width:350,height:'auto',maxHeight:380};
 const sourceBox=step===2?{x:408,y:140,w:60,h:48}:[4,6,8].includes(step)?{x:674,y:267,w:68,h:57}:step===11?{x:618,y:125,w:70,h:53}:undefined;
 const boxes=[...(sourceBox?[sourceBox]:[]),...(discardStep||step===4?[{x:110,y:525,w:980,h:107}]:[]),...(step===12?[{x:2,y:4,w:200,h:110}]:[]),...([2,6,8,11].includes(step)?[{x:765,y:430,w:170,h:90}]:[])];
 if(report&&(!h.result||!reportReady))return <div className="lesson-one lesson-six"><div className="lesson-top"><strong>第六課 · 榮和演出中</strong><span>接著查看副露後仍成立的役</span></div><div className="lesson-block" style={{inset:0}}/></div>;
 return <div className={'lesson-one lesson-six '+(report?'lesson-three-result':!play?'lesson-solid':'')} ref={root} role="dialog" aria-modal="true" aria-label="新手學堂第六課" data-step={step}>
 <div className="lesson-top"><strong>新手學堂 · 第六課</strong><span>吃・碰・槓・門前清 · 無倒數</span><a href="/design/lobby/index.html?screen=academy">離開・保存已完成小節 ×</a></div>
 {report?<><div className="lesson-block" style={{inset:0}}/><WinBanner game={game} character={seatCharacter(game,game.you.seat)} name="玩家" level="normal" reduce={reduce} allowScores={false} onScores={()=>{}} onComplete={()=>setDone(true)}/></>:<>
 {play&&<svg className="lesson-shade" viewBox="0 0 1125 634" aria-hidden="true">{boxes.map((b,i)=><rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="8" fill="none" stroke="#efd18c" strokeWidth="3"/>)}</svg>}
 {discardStep?<><div className="lesson-block" style={{left:0,top:0,right:0,height:525}}/><div className="lesson-block" style={{left:0,top:525,width:110,bottom:0}}/><div className="lesson-block" style={{left:1090,top:525,right:0,bottom:0}}/></>:<div className="lesson-block" style={{inset:0}}/>}
 {[2,6,8,11].includes(step)&&legal&&meta?.ready&&!h.result&&<button className="lesson-win-action" data-action={'academy-six-'+action} aria-label={action==='chi'?'吃':action==='pon'?'碰':action==='kan'?'明槓':'榮和'} disabled={busy} onClick={()=>latest.current(action==='ron'?'academy:six-win':'academy:six-call',action==='ron'?{}:{kind:action})}><ActionArt kind={action}/></button>}
 </>}
 <section className={'lesson-card '+([0,14].includes(step)?'lesson-hero':'')+(cardStyle&&!report?' lesson-six-side':'')} style={cardStyle}>
 <small>{report?'真實副露役種與結果':`第六課 · ${step+1} / 15`}</small><h2>{titles[step]}</h2><p>{descriptions[step]}</p>
 {step===0&&<div className="lesson-reward">🥕 首次完成：100 體驗紅蘿蔔<small>三個獨立教學例子；進度保存在本瀏覽器。</small></div>}
 {step===1&&<div className="lesson-three-answers"><button onClick={()=>{setCorrect(true);setFeedback('答對了！只可以吃左方上家的牌。')}}>只可以吃上家的牌</button><button onClick={()=>setFeedback('吃只限上家；碰或明槓才不限哪一家。')}>任何一家都可以吃</button></div>}
 {step===4&&meta?.ready&&<><div className="lesson-six-shape">{[...game.you.hand,...h.melds.east.flatMap(m=>m.tiles.slice(0,3)),h.discards.south.at(-1)!].filter(Boolean).map(t=><img key={t.id} src={completeTileUrl(t.face,!!t.red)} alt={t.face}/>)}</div><div className="lesson-three-answers"><button onClick={()=>setFeedback('牌形完成仍要有役；這個吃牌例子沒有役。')}>牌形齊就能和</button><button onClick={()=>{setCorrect(true);setFeedback('答對：先有役才能和。')}}>無役不能和</button></div></>}
 {step===12&&<div className="lesson-six-kan-count">指示牌：1 → <b>{h.doraIndicators.length}</b> 張　{meta?.discarded?'九索已打出 ✓':'請打出補入的九索'}</div>}
 {step===13&&<><h3>{questions[q]!.title}　{q+1}/3</h3><div className="lesson-three-answers">{questions[q]!.choices.map((text,i)=><button key={i} aria-label={'鳴牌答案 '+(i+1)} disabled={correct} onClick={()=>choose(i)}>{text}</button>)}</div></>}
 <div className="lesson-feedback" role="status">{feedback||([2,6,11].includes(step)?meta?.ready?'現在可以按右下鳴牌按鈕。':'等候對手打出教學牌…':step===12&&meta?.discarded?'補牌及出牌已完成，可以繼續。':discardStep?'請短按標亮的'+(step===12?'九索':'北')+'。':step===8?meta?.ready?'現在可以按「和」榮和。':'等候下家打出四索…':'')}</div>
 {step===14?<><div className="lesson-reward">{claimed?reward?'🥕 已領取 100 體驗紅蘿蔔':'複習完成，不重複派獎':'首次完成：100 體驗紅蘿蔔'}<small>本瀏覽器的體驗獎勵，並非正式錢包入帳。</small></div><footer>{claimed?<><a href="/design/lobby/index.html?screen=academy">返回學堂</a><a className="lesson-primary" href="/?mode=bot&lesson=7">前往第七課 →</a></>:<button className="lesson-primary" onClick={()=>{const r=api()?.completeLessonSix();if(!r?.ok){setFeedback('未能保存，請重試。');return}setReward(r.awarded);setClaimed(true)}}>{api()?.read().lessonSix.completed?'完成複習':'完成第六課・領取獎勵'}</button>}</footer></>:manual?<footer><span>完成本步操作後自動繼續</span></footer>:<footer><span>{report&&!done?'役種計算中…':'已完成小節會保存'}</span><button className="lesson-primary" disabled={!ready} onClick={()=>move(step+1)}>{step===0?'開始第六課 →':step===13?'完成第六課 →':'下一步 →'}</button></footer>}
 </section></div>
}
