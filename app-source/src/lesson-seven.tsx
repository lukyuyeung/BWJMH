import React,{useEffect,useRef,useState} from 'react';import type {Game} from './main';import {ActionArt} from './action-art';import {WinBanner} from './win-banner';import {seatCharacter} from './seat-character';import './lesson-seven.css';
const api=()=> (window as any).BunnyAcademy;
const titles=['第七課：為甚麼不能和？','無役，不等於振聽','自己打過一索，四索也不能榮和','振聽仍然可以自摸','看懂這次振聽自摸','未立直：親手放過榮和','下一家出牌，暫時不能榮和','等到自己摸牌，限制解除','四索再來，榮和已恢復','立直後，再放過一次榮和','立直後的振聽，會維持本局','副露後，役也會改變','上桌前，先分清原因','第七課完成！'];
const descriptions=[
 '用四個固定牌例分清無役、自家牌河振聽、同巡振聽及立直後振聽。你會親手跳過榮和，再觀察實際規則如何限制和牌。',
 '牌形已齊、寶牌兩枚，卻沒有役，仍不能榮和。寶牌不能代替役。這次不是振聽，而是無役。',
 '自己打過一索，現在聽一索／四索。即使下家打四索，整組聽牌也不能榮和，不是只禁一索；只等下一次摸牌也不會自動解除。',
 '自己打過聽牌，只限制榮和，不禁止自摸。等其他三家輪轉，遊戲會自動摸入四索，請親手按「自摸」。',
 '這次靠自己摸到四索和牌。真正結果有門前清自摸和及役牌白，沒有立直，也不會因為自家牌河振聽而禁止自摸。',
 '換一個沒有立直、也沒打過聽牌的例子。下家的一索本來可以榮和，這次請親手按「跳過」，觀察接下來的變化。',
 '剛放過可榮和的一索，對家再打四索，也暫時不能榮和。這叫同巡振聽，會維持到你下一次摸牌，不是等下一家打完便解除。',
 '其他玩家依序摸打，再自動輪到你摸九索。同巡振聽會在這次自己摸牌時解除；請打出九索，再看下家接著打出的四索。',
 '這次已經輪到自己摸牌，且自己的牌河沒有一索或四索。下家再打四索時，榮和資格便恢復了。',
 '這副牌已正常宣告立直並支付1,000點；下家的一索仍可以榮和。請再按一次「跳過」，比較立直後的後果。',
 '這圈已輪到自己摸切九索，仍不能榮和下家的四索。立直後放過可榮和的牌，本局一直不能榮和，但仍可自摸。',
 '吃、碰或明槓後，有些役會消失，有些會減番，也有些仍成立。暗槓不會破壞門前清。下表是役的規則，不是這手牌的計分。',
 '振聽仍可自摸。自家牌河振聽要改變聽牌，全部避開自己打過的牌；同巡振聽等自己摸牌解除。立直後放過榮和則維持本局。',
 '你已懂得分辨不能和的原因，親手體驗放過榮和及振聽自摸，也知道副露會影響哪些役。下一課會練習出牌與防守。'
];
const checks:Record<number,{question:string;choices:string[];answer:number}>={1:{question:'兩枚寶牌，沒有役，能榮和嗎？',choices:['有番就可以和','沒有役，不能和'],answer:1},2:{question:'自己打過一索，現在的四索呢？',choices:['四索仍可榮和','整組聽牌都振聽'],answer:1},6:{question:'下一家出牌後，同巡振聽解除嗎？',choices:['要等自己摸牌','已經解除'],answer:0},8:{question:'現在下家的四索，可以榮和嗎？',choices:['可以，資格已恢復','仍要等到下一局'],answer:0},10:{question:'自己摸牌，會解除立直後振聽嗎？',choices:['會，與未立直一樣','不會，本局維持'],answer:1},11:{question:'混一色副露後值幾番？',choices:['副露後2番','仍是門前的3番'],answer:0}};
const finalQuestions=[{question:'振聽時，仍可自摸嗎？',choices:['可以自摸','所有和牌都禁止'],answer:0},{question:'自己打過目前任何一種聽牌，會怎樣？',choices:['只禁那一張牌','全部聽牌不能榮和'],answer:1},{question:'想維持平和或立直，能先吃牌嗎？',choices:['可以，牌形齊就好','不可以，要門前清'],answer:1}];
export function LessonSeven({game,send,reportReady,busy,reduce}:{game:Game;send:(e:string,p:any)=>void;reportReady:boolean;busy:boolean;reduce:boolean}){
 const [step,setStep]=useState<number>(()=>{const s=api()?.read().lessonSeven;return s?.completed?0:s?.step??0}),[q,setQ]=useState(0),[correct,setCorrect]=useState(false),[feedback,setFeedback]=useState(''),[reportDone,setReportDone]=useState(false),[claimed,setClaimed]=useState(false),[reward,setReward]=useState(0);const latest=useRef(send);latest.current=send;const root=useRef<HTMLDivElement>(null),h=game.hand,meta=(h as any).academySeven,report=step===4,overview=[0,13].includes(step),quiz=checks[step],manual=[3,5,7,9].includes(step);
 const move=(n:number)=>{if(!api()?.saveLessonSevenStep(n)){setFeedback('未能保存進度，請再試一次。');return}setStep(n)};
 useEffect(()=>{latest.current('academy:seven-stage',{stage:step});setQ(0);setCorrect(false);setFeedback('');setReportDone(false)},[step]);
 useEffect(()=>{if(meta?.stage!==step)return;if(step===3&&h.result?.method==='tsumo')move(4);else if([5,9].includes(step)&&meta.phase==='passed')move(step+1);else if(step===7&&meta.phase==='restored')move(8)},[step,meta?.stage,meta?.phase,h.result?.method]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key!=='Tab'||!root.current)return;const list=[...root.current.querySelectorAll<HTMLElement>('button:not(:disabled):not([hidden]),a[href]')];if(step===7&&meta?.phase==='own-draw')list.push(...root.current.closest('.phone-stage')!.querySelectorAll<HTMLElement>('.phone-hand-tiles>button.lesson-seven-choice'));e.preventDefault();if(!list.length)return;const i=list.indexOf(document.activeElement as HTMLElement);list[(i+(e.shiftKey?-1:1)+list.length)%list.length]?.focus({preventScroll:true})};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[step,meta?.phase]);
 const choose=(i:number)=>{const item=step===12?finalQuestions[q]!:quiz!;if(i!==item.answer){setFeedback(step===11?'混一色副露後由3番減成2番。':'再看看實際狀態：無役與振聽不同，振聽只限制榮和；是否立直也會影響解除時間。');return}if(step===12&&q<2){setQ(q+1);setFeedback('答對了，再試下一題。')}else{setCorrect(true);setFeedback('答對了，可以繼續。')}};
 const ready=meta?.stage===step&&!busy&&(report?reportDone:quiz?correct&&meta.ready:step===12?correct:true);
 const ownBox={x:440,y:330,w:100,h:65},southBox={x:670,y:240,w:80,h:90},westBox={x:618,y:125,w:70,h:53},handBox={x:110,y:525,w:980,h:107},actionBox={x:765,y:430,w:170,h:90};
 const boxes=step===1?[southBox]:step===2?[ownBox,southBox]:step===3?[ownBox,handBox,actionBox]:[5,9].includes(step)?[southBox,actionBox]:step===6?[westBox]:step===7?[handBox]:[8,10].includes(step)?[southBox]:[];
 const cardStyle=report?{left:20,top:60,width:300,height:385}:overview?undefined:{left:20,top:[2,6,8,10,11,12].includes(step)?65:125,width:350,height:'auto',maxHeight:[2,6,8,10,11,12].includes(step)?440:380};
 const status=step===1?'無役：不能榮和':[2,3].includes(step)?'自家牌河振聽：不能榮和，可自摸':[5,9].includes(step)?h.actions.canRon?'現在可以榮和：本步練習跳過':'等待可榮和的一索…':step===6?'同巡振聽：尚未輪到自己摸牌':step===7?meta?.phase==='own-draw'?'已自己摸牌：同巡振聽解除':'等待自己摸牌…':step===8?h.actions.canRon?'榮和資格已恢復 ✓':'等待下家的四索…':step===10?'立直後振聽：摸牌後仍不能榮和':'';
 if(report&&(!h.result||!reportReady))return <div className="lesson-one lesson-seven"><div className="lesson-top"><strong>第七課 · 振聽自摸演出中</strong><span>接著查看真正役種結果</span></div><div className="lesson-block" style={{inset:0}}/></div>;
 return <div className={'lesson-one lesson-seven '+(report?'lesson-three-result':overview?'lesson-solid':'')} ref={root} role="dialog" aria-modal="true" aria-label="新手學堂第七課" data-step={step}>
 <div className="lesson-top"><strong>新手學堂 · 第七課</strong><span>無役・振聽・副露 · 無倒數</span><a href="/design/lobby/index.html?screen=academy">離開・保存已完成小節 ×</a></div>
 {report?<><div className="lesson-block" style={{inset:0}}/><WinBanner game={game} character={seatCharacter(game,game.you.seat)} name="玩家" level="normal" allowScores={false} reduce={reduce} onScores={()=>{}} onComplete={()=>setReportDone(true)}/></>:<>
 {!!boxes.length&&<svg className="lesson-shade" viewBox="0 0 1125 634" aria-hidden="true">{boxes.map((b,i)=><rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="8" fill="none" stroke="#efd18c" strokeWidth="3"/>)}</svg>}
 {step===7&&meta?.phase==='own-draw'?<><div className="lesson-block" style={{left:0,top:0,right:0,height:525}}/><div className="lesson-block" style={{left:0,top:525,width:110,bottom:0}}/><div className="lesson-block" style={{left:1090,top:525,right:0,bottom:0}}/></>:<div className="lesson-block" style={{inset:0}}/>}
 {step===3&&meta?.ready&&h.actions.canTsumo&&!h.result&&<button className="lesson-win-action" data-action="academy-seven-tsumo" aria-label="自摸" disabled={busy} onClick={()=>latest.current('academy:seven-win',{})}><ActionArt kind="tsumo"/></button>}
 {[5,9].includes(step)&&meta?.ready&&h.actions.canRon&&<button className="lesson-win-action" data-action="academy-seven-pass" aria-label="跳過榮和" disabled={busy} onClick={()=>latest.current('academy:seven-pass',{})}><ActionArt kind="pass"/></button>}
 </>}
 <section className={'lesson-card '+(overview?'lesson-hero':!report?'lesson-seven-side':'')} style={cardStyle}>
 <small>{report?'真正的振聽自摸結果':`第七課 · ${step+1} / 14`}</small><h2>{titles[step]}</h2><p>{descriptions[step]}</p>
 {status&&<div className="lesson-seven-status" data-clear={step===8&&h.actions.canRon||step===7&&meta?.phase==='own-draw'||undefined} role="status">{status}</div>}
 {step===0&&<div className="lesson-reward">🥕 首次完成：100 體驗紅蘿蔔<small>獨立教學牌局；不會改動電腦局存檔。</small></div>}
 {step===11&&<table className="lesson-seven-yaku"><thead><tr><th>役</th><th>門前</th><th>失去門前清</th></tr></thead><tbody><tr><td>立直／平和／門清自摸</td><td>可成立</td><td>不成立</td></tr><tr><td>混一色</td><td>3番</td><td>2番</td></tr><tr><td>役牌・白</td><td>1番</td><td>1番</td></tr></tbody></table>}
 {quiz&&<><h3>{quiz.question}</h3><div className="lesson-three-answers">{quiz.choices.map((text,i)=><button key={i} aria-label={'判斷答案 '+(i+1)} disabled={correct||!meta?.ready||busy} onClick={()=>choose(i)}>{text}</button>)}</div></>}
 {step===12&&<><h3>{finalQuestions[q]!.question}　{q+1}/3</h3><div className="lesson-three-answers">{finalQuestions[q]!.choices.map((text,i)=><button key={i} aria-label={'總結答案 '+(i+1)} disabled={correct} onClick={()=>choose(i)}>{text}</button>)}</div></>}
 <div className="lesson-feedback" role="status">{feedback||(step===7&&meta?.phase==='own-draw'?'請短按標亮的九索。':step===3?meta?.ready?'親手自摸四索。':'等待自動摸牌…':[5,9].includes(step)?'這次請練習跳過原本能榮和的牌。':'')}</div>
 {step===13?<><div className="lesson-reward">{claimed?reward?'🥕 已領取100體驗紅蘿蔔':'複習完成，不重複派獎':'首次完成：100體驗紅蘿蔔'}<small>本瀏覽器的體驗獎勵，並非正式錢包入帳。</small></div><footer>{claimed?<><a href="/design/lobby/index.html?screen=academy">返回學堂</a><a className="lesson-primary" href="/design/lobby/index.html?screen=academy#course-8">前往第八課 →</a></>:<button className="lesson-primary" onClick={()=>{const r=api()?.completeLessonSeven();if(!r?.ok){setFeedback('未能保存，請重試。');return}setReward(r.awarded);setClaimed(true)}}>{api()?.read().lessonSeven.completed?'完成複習':'完成第七課・領取獎勵'}</button>}</footer></>:manual?<footer><span>完成本步操作後自動繼續</span></footer>:<footer><span>{report&&!reportDone?'役種計算中…':'已完成小節會保存'}</span><button className="lesson-primary" disabled={!ready} onClick={()=>move(step+1)}>{step===0?'開始第七課 →':step===12?'完成第七課 →':'下一步 →'}</button></footer>}
 </section></div>
}
