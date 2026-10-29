import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import type {Game} from './main';import type {RiichiReveal} from './riichi-reveal';import {RiichiScratch} from './riichi-scratch';import {ActionArt} from './action-art';import {WinBanner} from './win-banner';import {ScoreTransition} from './score-transition';import {seatCharacter} from './seat-character';import './lesson-nine.css';
const api=()=> (window as any).BunnyAcademy;
const titles=['第九課：這次自己來','先保護自己的點數','現物只對指定玩家安全','換你找聽牌與役','自己宣告立直','立直棒與鎖定的手牌','刮開第一張摸入牌','等到自己的自摸','看懂這次的役與寶牌','真正的點數轉移','恭喜完成新手學堂！'];
const descriptions=[
 '兩段短實戰，串起前八課：先防守，再立直自摸。教學牌局預先安排、無倒數；需要時才按提示。',
 '右方下家已立直。先看他的牌河，從自己手中找一張現物並打出；不必猜下一張牌。',
 '你已打出九筒。這位立直者自己也打過九筒，因此不能榮和它；其他玩家仍需分別判斷。',
 '換一副接近聽牌的手牌。按住掃牌、看看打出甚麼後能聽牌；也要想清楚怎樣取得一個役。寶牌只加番，不能代替役。',
 '先按立直，再選擇打出後仍聽牌的手牌。這段練習操作；實戰仍要比較牌值與放銃風險。',
 '立直已支付1,000點。橫放的宣告牌與立直棒都留在桌上；之後一般不能自由更換原來的手牌。',
 '其他三家依序行動，輪到你會自動摸牌。親手刮開這張牌；不能和時，就會把剛摸的牌打出。',
 '再等其他三家行動，刮開新的摸入牌。牌面揭曉後，若能和牌才按自摸。教學安排了和牌機會，實戰不保證會贏。',
 '這是剛才真實成立的役、寶牌與裏寶牌，番符及點數由規則引擎計算。等計算完成，再查看四家點數轉移。',
 '觀看四家實際點數變化，再完成本課。',
 '你已完成防守、立直、刮牌摸切、自摸及結算。首次完成可領300體驗紅蘿蔔；下一步到新手場選角色，準備正式電腦局。'
];
type Box={x:number;y:number;w:number;h:number};
export function LessonNine({game,send,busy,reportReady,reveal,reduce}:{game:Game;send:(e:string,p:any)=>void;busy:boolean;reportReady:boolean;reveal:RiichiReveal;reduce:boolean}){
 const [step,setStep]=useState(()=>{const s=api()?.read().lessonNine;return s?.completed?0:s?.step??0}),[hint,setHint]=useState(0),[correct,setCorrect]=useState(false),[feedback,setFeedback]=useState(''),[reportDone,setReportDone]=useState(false),[claimed,setClaimed]=useState(false),[reward,setReward]=useState(0),[boxes,setBoxes]=useState<Box[]>([]),[pos,setPos]=useState({left:20,top:65});
 const root=useRef<HTMLDivElement>(null),card=useRef<HTMLElement>(null),latest=useRef(send);latest.current=send;const h=game.hand,meta=(h as any).academyNine,manual=[1,4].includes(step),overview=[0,10].includes(step),scratch=[6,7].includes(step)&&reveal.active,report=step===8;
 const move=(n:number)=>{if(!api()?.saveLessonNineStep(n)){setFeedback('未能保存進度，請再試一次。');return}setStep(n)};
 useEffect(()=>{latest.current('academy:nine-stage',{stage:step});setHint(0);setCorrect(false);setFeedback('');setReportDone(false)},[step]);
 useEffect(()=>{if(meta?.stage!==step)return;if(step===1&&meta.phase==='defended')move(2);if(step===4&&h.riichi[game.you.seat])move(5);if(step===6&&h.discards[game.you.seat].length===2)move(7);if(step===7&&h.result?.method==='tsumo')move(8)},[step,meta?.stage,meta?.phase,h.riichi[game.you.seat],h.discards[game.you.seat].length,h.result?.method]);
 useEffect(()=>{if(step!==6||!meta?.ready||meta?.running||reveal.active||busy||h.currentSeat!==game.you.seat||h.phase!=='awaiting_discard')return;const timer=setTimeout(()=>latest.current('academy:nine-tsumogiri',{}),700);return()=>clearTimeout(timer)},[step,meta?.ready,meta?.running,reveal.active,busy,h.currentSeat,h.phase]);
 useLayoutEffect(()=>{if(!hint||overview||report||step===9){setBoxes([]);return}const stage=root.current?.closest<HTMLElement>('.phone-stage');if(!stage)return;const measure=()=>{const a=stage.getBoundingClientRect(),scale=1125/a.width,out:Box[]=[];const dom=(selector:string)=>{const rs=[...stage.querySelectorAll(selector)].map(e=>e.getBoundingClientRect()).filter(r=>r.width&&r.height);if(!rs.length)return;out.push({x:Math.min(...rs.map(r=>r.left-a.left))*scale-6,y:Math.min(...rs.map(r=>r.top-a.top))*scale-6,w:(Math.max(...rs.map(r=>r.right))-Math.min(...rs.map(r=>r.left)))*scale+12,h:(Math.max(...rs.map(r=>r.bottom))-Math.min(...rs.map(r=>r.top)))*scale+12})};
 if(step===1){let layout:any[]=[];try{layout=JSON.parse(stage.querySelector<HTMLElement>('.physical-renderer')?.dataset.teachingLayout??'[]')}catch{}const rs=layout.filter(b=>b.seat==='south'&&b.id===meta?.evidenceId);if(rs.length)out.push({x:Math.min(...rs.map(r=>r.left))-6,y:Math.min(...rs.map(r=>r.top))-6,w:Math.max(...rs.map(r=>r.right))-Math.min(...rs.map(r=>r.left))+12,h:Math.max(...rs.map(r=>r.bottom))-Math.min(...rs.map(r=>r.top))+12});if(hint>1)dom('.phone-hand-tiles>button:has([data-face="9p"])')}
 if(step===3){if(hint>1)dom('.phone-hand-tiles>button:has([data-face="N"])');else dom('.phone-hand')}
 if(step===4){dom('[data-action=academy-nine-riichi]');if(hint>1)dom('.phone-hand-tiles>button:has([data-face="N"])')}
 if(step===5)dom('.soul-counters>span:last-child');
 if([6,7].includes(step)&&scratch)dom('.lesson-nine .riichi-scratch-modal .rs-tile');
 if(step===7&&!scratch)dom('[data-action=academy-nine-tsumo]');
 setBoxes(old=>JSON.stringify(old)===JSON.stringify(out)?old:out);const height=card.current?.offsetHeight??350,width=330;const p=[{left:20,top:65},{left:775,top:65},{left:20,top:155},{left:775,top:155}].find(p=>p.top+height<520&&out.every(b=>p.left+width+12<b.x||p.left>b.x+b.w+12||p.top+height+12<b.y||p.top>b.y+b.h+12));if(p)setPos(old=>old.left===p.left&&old.top===p.top?old:p)};measure();const t=setInterval(measure,150);return()=>clearInterval(t)},[step,hint,meta?.evidenceId,scratch,overview,report]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key!=='Tab'||!root.current)return;const els=[...root.current.querySelectorAll<HTMLElement>('button:not(:disabled),a[href]')];if(manual||step===3)els.push(...root.current.closest('.phone-stage')!.querySelectorAll<HTMLElement>('.phone-hand-tiles>button'));if(!els.length)return;e.preventDefault();els[(els.indexOf(document.activeElement as HTMLElement)+(e.shiftKey?-1:1)+els.length)%els.length]?.focus({preventScroll:true})};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[step,manual]);
 if((report||step===9)&&(!h.result||!reportReady))return <div className="lesson-one lesson-nine"><div className="lesson-top"><strong>第九課 · 和牌演出中</strong><span>接著查看真正的役種與點數轉移</span></div><div className="lesson-block" style={{inset:0}}/></div>;
 const ready=meta?.stage===step&&!busy&&(step===3?correct:report?reportDone:true);
 return <div className={'lesson-one lesson-nine '+(overview?'lesson-solid':'')+(report?' lesson-three-result':'')+(step===9?' lesson-nine-scores':'')} role="dialog" aria-modal="true" aria-label="新手學堂第九課" data-step={step} ref={root}>
 <div className="lesson-top"><strong>新手學堂 · 第九課</strong><span>{step===9?descriptions[9]:'畢業小實戰 · 約2分鐘 · 無倒數'}</span><a href="/design/lobby/index.html?screen=academy">離開・保存已完成小節 ×</a></div>
 {hint>0&&<svg className="lesson-shade" viewBox="0 0 1125 634" aria-hidden="true">{boxes.map((b,i)=><rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="7" fill="none" stroke="#efd18c" strokeWidth="3"/>)}</svg>}
 {report?<WinBanner game={game} character={seatCharacter(game,game.you.seat)} name="玩家" level="normal" allowScores={false} reduce={reduce} onScores={()=>{}} onComplete={()=>setReportDone(true)}/>:step===9?<ScoreTransition game={{...game,room:{...game.room,resultFlow:undefined}}} ranking={false} reduce={reduce} onRanking={()=>{}} onClose={()=>{}} onNext={()=>move(10)} onRestart={()=>{}} nextLabel="完成第九課 →"/>:manual||step===3?<><div className="lesson-block" style={{left:0,top:0,right:0,height:525}}/><div className="lesson-block" style={{left:0,top:525,width:110,bottom:0}}/><div className="lesson-block" style={{left:1090,top:525,right:0,bottom:0}}/></>:<div className="lesson-block" style={{inset:0}}/>}
 {step===4&&<button className="lesson-win-action" data-action="academy-nine-riichi" aria-label={meta?.armed?'取消立直':'立直'} disabled={busy||meta?.stage!==4} onClick={()=>latest.current('academy:nine-arm',{})}><ActionArt kind={meta?.armed?'cancel':'riichi'}/></button>}
 {step===7&&!scratch&&meta?.ready&&!meta?.running&&h.actions.canTsumo&&<button className="lesson-win-action" data-action="academy-nine-tsumo" aria-label="自摸" disabled={busy} onClick={()=>latest.current('academy:nine-win',{})}><ActionArt kind="tsumo"/></button>}
 {step!==9&&<section ref={card} className={'lesson-card '+(overview?'lesson-hero':'lesson-nine-side')} style={overview?undefined:report?{left:20,top:65,width:300,height:'auto',maxHeight:410}:{...(scratch?{left:20,top:65}:pos),width:330,height:'auto',maxHeight:440}}>
 <small>{'第九課 · '+(step+1)+' / 11'}</small><h2>{titles[step]}</h2><p>{descriptions[step]}</p>
 {step===0&&<div className="lesson-reward">🥕 首次完成：300 體驗紅蘿蔔<small>教學進度獨立保存，不改動電腦局存檔。</small></div>}
 {step===3&&<><h3>這次怎樣取得一個役？</h3><div className="lesson-three-answers"><button aria-label="畢業答案 1" onClick={()=>setFeedback('寶牌只加番，不能單獨作為役。')}>只靠寶牌</button><button aria-label="畢業答案 2" onClick={()=>{setCorrect(true);setFeedback('答對了：符合條件時，立直本身就是一個役。')}}>符合條件時宣告立直</button></div></>}
 {[1,3,4,5,6,7].includes(step)&&<button className="lesson-nine-hint" onClick={()=>setHint(n=>Math.min(2,n+1))}>{hint===0?'給我提示':hint===1?'再給一點提示':'提示已顯示'}</button>}
 {hint>0&&<p className="lesson-nine-tip">{step===1?(hint===1?'先看右方立直者橫放的宣告牌。':'他打過九筒；你的手中也有九筒。'):step===3?'試看孤立的北，打出後聽八筒／東。':step===4?'先按右下立直，再打出北。':step===5?'左上可見立直棒，自己的北已橫放。':'在右方按住刮開牌面，也可按直接揭曉。'}</p>}
 <div className="lesson-feedback" role="status">{feedback||meta?.feedback|| (scratch?'先揭開牌面，再決定和牌。':meta?.running?'其他三家依序行動中…':'')}</div>
 {step===10?<><div className="lesson-reward">{claimed?reward?'🥕 已領取300體驗紅蘿蔔':'複習完成，不重複派獎':'首次完成：300體驗紅蘿蔔'}<small>本瀏覽器體驗獎勵，並非正式錢包入帳。</small></div><footer>{claimed?<><a href="/design/lobby/index.html?screen=academy">返回學堂</a><a className="lesson-primary" href="/design/lobby/ready/index.html?difficulty=low">挑戰新手電腦場 →</a></>:<button className="lesson-primary" onClick={()=>{const r=api()?.completeLessonNine();if(!r?.ok){setFeedback('未能保存，請再試一次。');return}setReward(r.awarded);setClaimed(true)}}>{api()?.read().lessonNine.completed?'完成複習':'完成第九課・領取獎勵'}</button>}</footer></>:manual||[6,7].includes(step)?<footer><span>完成本步操作後自動繼續</span></footer>:<footer><span>{report&&!reportDone?'役種計算中…':'已完成小節會保存'}</span><button className="lesson-primary" disabled={!ready} onClick={()=>move(step+1)}>{step===0?'開始第九課 →':report?'查看點數轉移 →':'下一步 →'}</button></footer>}
 </section>}
 {scratch&&<RiichiScratch key={reveal.key} reveal={reveal} canTsumo={h.actions.canTsumo} reduce={reduce}/>}
 </div>;
}
