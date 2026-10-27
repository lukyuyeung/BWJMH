import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import './lesson-one.css';
export const inAcademyLesson=()=>['1','2','3','4','5','6'].includes(new URLSearchParams(location.search).get('lesson')??'');
export const inLessonOne=()=>new URLSearchParams(location.search).get('lesson')==='1';
type Box={x:number;y:number;w:number;h:number};
const steps=[
 {title:'第一課：認識你的牌桌',text:'這裡可以放心試，不計時，也不會真的出牌。完成找區域及長按掃牌練習，再領取本課獎勵。',selector:''},
 {title:'找出自己的手牌',text:'下方正面朝你的，是只有你看得到的手牌。點一下框內的手牌區。',selector:'.phone-hand'},
 {title:'找出牌河',text:'大家打出的牌會排在面前，這些公開的牌叫牌河。點一下框內自己的牌河。',selector:'.river-0'},
 {title:'找出中央局況',text:'中央可查看局數、四家的點數和剩餘牌數。點一下中央資訊區。',selector:'.phone-round'},
 {title:'找出自動操作列',text:'左側「理、和、鳴、切」是自動操作設定，旁邊箭嘴可看說明。先點一下框內的操作列認識位置，本課不會改動設定。',selector:'.phone-options'},
 {title:'按住，再左右掃牌',text:'按住下方任一張手牌，滑到另一張牌，再放手。牌會抬起，並顯示四家牌河已打出多少張同款牌。',selector:'.phone-hand'},
 {title:'最後一題：在哪裡看大家打過的牌？',text:'不用背規則，先記住牌桌各區的位置。選出正確答案即可完成第一課。',selector:''},
 {title:'第一課完成！',text:'你已找到牌桌的重要區域，也親手試過按住掃牌。下一課再學摸牌、出牌與基本組合。',selector:''}
];
const api=()=> (window as any).BunnyAcademy;
export function LessonOne({inspectedId}:{inspectedId:string|null}){
 const [step,setStep]=useState(()=>{const s=api()?.read();return s?.lessonOne.completed?0:s?.lessonOne.step??0}),[correct,setCorrect]=useState(false),[feedback,setFeedback]=useState(''),[claimed,setClaimed]=useState(false),[awarded,setAwarded]=useState(0),[box,setBox]=useState<Box|null>(null),[card,setCard]=useState({x:252,y:60});
 const root=useRef<HTMLDivElement>(null),cardRef=useRef<HTMLElement>(null),gesture=useRef<{id:number;started:number;ids:Set<string>}|null>(null);const current=steps[step]!;
 const advance=()=>{const next=Math.min(7,step+1);if(!api()?.saveStep(next)){setFeedback('未能保存進度，請再試一次。');return}setCorrect(false);setFeedback('');setStep(next)};
 useLayoutEffect(()=>{const el=root.current?.closest<HTMLElement>('.phone-stage');if(!el)return;const update=()=>{const target=current.selector?el.querySelector(current.selector):null;if(!target){setBox(null);return}const a=el.getBoundingClientRect(),b=target.getBoundingClientRect(),s=1125/a.width;const r={x:Math.max(0,(b.left-a.left)*s-9),y:Math.max(2,(b.top-a.top)*s-9),w:0,h:0};r.w=Math.min(1123,(b.right-a.left)*s+9)-r.x;r.h=Math.min(632,(b.bottom-a.top)*s+9)-r.y;if(step===2){r.x=434;r.y=338;r.w=230;r.h=152}setBox(r);const positions=[{x:252,y:60},{x:252,y:365},{x:480,y:60},{x:35,y:60}];const chosen=positions.find(c=>c.x+620+12<=r.x||c.x>=r.x+r.w+12||c.y+232+12<=r.y||c.y>=r.y+r.h+12);if(chosen)setCard(chosen)};update();const observer=new ResizeObserver(update);observer.observe(el);return()=>observer.disconnect()},[step]);
 useEffect(()=>{gesture.current=null;if(step!==5)return;const el=root.current?.closest<HTMLElement>('.phone-stage');if(!el)return;const down=(e:PointerEvent)=>{if(!(e.target as Element).closest('.phone-hand-tiles>button')||!e.isPrimary)return;gesture.current={id:e.pointerId,started:e.timeStamp,ids:new Set([(e.target as Element).closest<HTMLElement>('.phone-hand-tiles>button')!.dataset.tileId!])};setFeedback('保持按住，滑到另一張牌。')};const up=(e:PointerEvent)=>{const g=gesture.current;if(!g||g.id!==e.pointerId)return;gesture.current=null;if(e.type==='pointerup'&&e.timeStamp-g.started>=300&&g.ids.size>=2){setCorrect(true);setFeedback('做到了！牌會跟著手指切換，放手不會出牌。')}else setFeedback('再試一次：按住片刻，掃過至少兩張不同位置的牌，再放手。')};el.addEventListener('pointerdown',down,true);el.addEventListener('pointerup',up,true);el.addEventListener('pointercancel',up,true);return()=>{el.removeEventListener('pointerdown',down,true);el.removeEventListener('pointerup',up,true);el.removeEventListener('pointercancel',up,true);gesture.current=null}},[step]);
 useEffect(()=>{if(step===5&&inspectedId&&gesture.current)gesture.current.ids.add(inspectedId)},[inspectedId,step]);
 useEffect(()=>{root.current?.querySelector<HTMLButtonElement>('.lesson-card button')?.focus({preventScroll:true})},[step]);
 const hit=()=>{setCorrect(true);setFeedback('找對了！按下一步繼續。')};
 const complete=()=>{const result=api()?.complete();if(!result?.ok){setFeedback('未能保存完成紀錄，請重試。');return}setAwarded(result.awarded);setClaimed(true);setFeedback('')};
 const solid=step===0||step>=6;
 return <div className={'lesson-one '+(solid?'lesson-solid':'')} ref={root} role="dialog" aria-modal="true" aria-label="新手學堂第一課">
 <div className="lesson-top"><strong>新手學堂 · 第一課</strong><span>獨立教學牌桌 · 不計時</span><a href="/design/lobby/index.html?screen=academy">離開並保存進度 ×</a></div>
 {!solid&&box&&<><svg className="lesson-shade" viewBox="0 0 1125 634" aria-hidden="true"><rect x={box.x} y={box.y} width={box.w} height={box.h} rx="10" fill="none" stroke={correct?'#b8e3ad':'#f4d595'} strokeWidth="3"/></svg>
 <div className="lesson-block" style={{left:0,top:0,width:'100%',height:box.y}}/><div className="lesson-block" style={{left:0,top:box.y+box.h,width:'100%',bottom:0}}/><div className="lesson-block" style={{left:0,top:box.y,width:box.x,height:box.h}}/><div className="lesson-block" style={{left:box.x+box.w,top:box.y,right:0,height:box.h}}/>
 {step!==5&&<button className="lesson-target" aria-label={'選擇'+current.title.replace('找出','')} onClick={hit} style={{left:box.x,top:box.y,width:box.w,height:box.h}}/>}</>}
 <section ref={cardRef} className={'lesson-card '+(solid?'lesson-hero':'')} style={solid?undefined:{left:card.x,top:card.y}}>
 <small>{step===0?'歡迎來到第一課':step>=7?'LESSON COMPLETE':`練習 ${step} / 6`}</small><h2>{current.title}</h2><p>{current.text}</p>
 {step===0&&<div className="lesson-reward">🥕 首次完成：100 體驗紅蘿蔔<small>課程進度與體驗獎勵保存在此瀏覽器，正式錢包尚未開放。</small></div>}
 {step===6&&<div className="lesson-answers">{['自己的手牌','四家牌河','中央局況'].map((answer,i)=><button key={answer} onClick={()=>{if(i===1){setCorrect(true);setFeedback('答對了！牌河就是大家已打出的牌。')}else{setCorrect(false);setFeedback(i===0?'手牌是自己持有的牌；請找公開打出牌的位置。':'中央顯示局況與點數；已打出的牌在牌河。')}}}>{answer}</button>)}</div>}
 <div className="lesson-feedback" role="status" data-correct={correct}>{feedback|| (step===5?'按住後掃過兩張牌，再放手。':step>0&&step<6?'點一下金框內的區域。':'')}</div>
 {step===7?<><div className="lesson-reward">{claimed?awarded?`🥕 已領取 ${awarded} 體驗紅蘿蔔`:'已完成複習 · 獎勵不會重複領取':'🥕 首次完成獎勵：100 體驗紅蘿蔔'}<small>體驗紅蘿蔔保存在此瀏覽器，並非正式錢包餘額。</small></div><footer>{claimed?<><a href="/design/lobby/index.html?screen=academy">返回新手學堂</a><a className="lesson-primary" href="/?mode=bot&lesson=2">前往第二課 →</a></>:<button className="lesson-primary" onClick={complete}>{api()?.read().lessonOne.completed?'完成複習':'完成本課・領取獎勵'}</button>}</footer></>:<footer><span>{step===5?'查看手牌不會打出':'本課不會改動你的電腦對局'}</span><button className="lesson-primary" disabled={step!==0&&!correct} onClick={advance}>{step===0?'開始學習 →':step===6?'完成第一課 →':'下一步 →'}</button></footer>}
 </section></div>
}
