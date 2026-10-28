import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import type {Game} from './main';
import './lesson-eight.css';
const api=()=> (window as any).BunnyAcademy;
type Box={x:number;y:number;w:number;h:number;label:string};
const titles=['第八課：出牌與防守入門','先留容易組合的牌','孤張打出，搭子保留','按住掃牌，比較聽牌','親手打出六索','未見的牌，不一定在牌山','有人立直，先看他的牌河','找出立直者的現物','親手打一張現物','只對這位玩家安全','離聽牌遠，先考慮防守','已聽牌，也要比較風險','上桌前，再想一想','第八課完成！'];
const descriptions=[
 '練習保留搭子、查看聽牌，再觀察對手立直後的牌河。這是獨立教學牌局，不計時，也不會改動你的電腦局存檔。',
 '二、三萬相鄰，容易與一萬或四萬組成順子。九筒在這手牌沒有同花色搭子；這次請短按九筒，把它打出。',
 '九筒已進入自己的牌河，二、三萬仍留在手上。這是這副練習牌的選擇，不代表任何時候都要先打九筒。',
 '按住二索，再滑到六索，分別看聽牌提示。手機放手不會出牌；桌面可把游標移到牌上。請查看這兩張牌，並閱讀下方問題。',
 '這次打六索，留下二、三、四、五索，可以聽二索／五索。另一種打法不一定錯；本例先比較可見資訊，請短按六索出牌。',
 '現在真的聽二索與五索，手上三張白也提供役。提示枚數扣除了自己手牌及公開牌；未見的牌也可能在別人手上或王牌裡。',
 '右方下家已支付1,000點並立直，橫放的是宣告牌九筒。不要只看自己的手牌，先看這位玩家打過甚麼。',
 '現物是這位玩家自己打過的牌。他受自家牌河振聽限制，不能榮和同一種牌。請點一下框內、右方牌河橫放的九筒。',
 '你手上也有九筒。這次請把九筒打出，作為對右方立直者的現物；一索等其他牌並沒有這個保證。',
 '九筒已打出。現物只保證這位立直者不能榮和；其他兩家仍須分別判斷，不能把它當作全桌安全牌。',
 '這副手牌還未聽牌，對手已立直。這個入門例子先選現物防守，避免只顧湊牌；也不用為了出牌就強行吃碰。',
 '換成已聽一索／四索、並有役牌白的例子。對手仍立直：可以考慮進攻，但要比較自己的牌值、可和機會與放銃風險，不是聽牌就一定衝。',
 '先看自己的組合與聽牌，再觀察對手牌河。現物只對指定玩家安全；筋與壁留待進階學習，它們也不是保證安全。',
 '你已親手出牌、比較聽牌提示、找出現物並練習防守。第九課會把前八課串成一場引導實戰。'
];
const checks:Record<number,{q:string;choices:string[];answer:number}>={3:{q:'提示的剩餘枚數，代表甚麼？',choices:['這些牌全部在牌山','還沒看見，不保證能摸到'],answer:1},9:{q:'這張九筒，對誰有安全保證？',choices:['四家都不能榮和','這位已打過九筒的立直者'],answer:1},10:{q:'本例未聽牌、對手已立直，先怎樣做？',choices:['先找現物，考慮防守','不看牌河，一直進攻'],answer:0},11:{q:'已聽牌、有役，就一定要進攻嗎？',choices:['一定，聽牌就要衝','仍要比較牌值與風險'],answer:1}};
const finals=[{q:'二三萬與孤立九筒，哪個較容易接成順子？',choices:['二三萬搭子','孤立九筒'],answer:0},{q:'現物保證對全桌都安全嗎？',choices:['保證全桌安全','只對打過它的玩家'],answer:1},{q:'未見的四張牌，都一定在牌山嗎？',choices:['一定在牌山','也可能在對手手上或王牌'],answer:1}];
export function LessonEight({game,send,busy,inspectedId,hoverFace}:{game:Game;send:(e:string,p:any)=>void;busy:boolean;inspectedId:string|null;hoverFace:string|null}){
 const [step,setStep]=useState<number>(()=>{const s=api()?.read().lessonEight;return s?.completed?0:s?.step??0}),[correct,setCorrect]=useState(false),[feedback,setFeedback]=useState(''),[seen,setSeen]=useState<string[]>([]),[q,setQ]=useState(0),[claimed,setClaimed]=useState(false),[reward,setReward]=useState(0),[boxes,setBoxes]=useState<Box[]>([]),[cardPos,setCardPos]=useState({left:20,top:65});
 const root=useRef<HTMLDivElement>(null),card=useRef<HTMLElement>(null),latest=useRef(send);latest.current=send;const meta=(game.hand as any).academyEight,manual=[1,4,8].includes(step),overview=[0,13].includes(step),quiz=checks[step],question=step===12?finals[q]:quiz;
 const move=(n:number)=>{if(!api()?.saveLessonEightStep(n)){setFeedback('未能保存進度，請再試一次。');return}setStep(n)};
 useEffect(()=>{latest.current('academy:eight-stage',{stage:step});setCorrect(false);setFeedback('');setSeen([]);setQ(0)},[step]);
 useEffect(()=>{if(meta?.stage!==step)return;if(manual&&meta.phase==='discarded')move(step+1)},[meta?.stage,meta?.phase,step]);
 useEffect(()=>{if(step!==3)return;const face=hoverFace??game.you.hand.find(t=>t.id===inspectedId)?.face;if(face&&['2s','6s'].includes(face))setSeen(s=>s.includes(face)?s:[...s,face])},[step,hoverFace,inspectedId]);
 useLayoutEffect(()=>{const stage=root.current?.closest<HTMLElement>('.phone-stage');if(!stage)return;let last='';const measure=()=>{
  const a=stage.getBoundingClientRect(),scale=1125/a.width,out:Box[]=[];
  const dom=(selector:string,label:string)=>{const els=[...stage.querySelectorAll<HTMLElement>(selector)];if(!els.length)return;const rs=els.map(e=>e.getBoundingClientRect());out.push({x:Math.min(...rs.map(r=>r.left-a.left))*scale-6,y:Math.min(...rs.map(r=>r.top-a.top))*scale-6,w:(Math.max(...rs.map(r=>r.right))-Math.min(...rs.map(r=>r.left)))*scale+12,h:(Math.max(...rs.map(r=>r.bottom))-Math.min(...rs.map(r=>r.top)))*scale+12,label})};
  const river=(seat:string,id:string|undefined,label:string)=>{let data:any[]=[];try{data=JSON.parse(stage.querySelector<HTMLElement>('.physical-renderer')?.dataset.teachingLayout??'[]')}catch{}const rs=data.filter(b=>b.seat===seat&&(!id||b.id===id));if(rs.length)out.push({x:Math.min(...rs.map(r=>r.left))-7,y:Math.min(...rs.map(r=>r.top))-7,w:Math.max(...rs.map(r=>r.right))-Math.min(...rs.map(r=>r.left))+14,h:Math.max(...rs.map(r=>r.bottom))-Math.min(...rs.map(r=>r.top))+14,label});else dom('.river-'+(['east','south','west','north'].indexOf(seat))+' .phone-tile'+(id?'[data-face="9p"]':''),label)};
  if([1,2].includes(step)){dom('.phone-hand-tiles>button:has([data-face="2m"]),.phone-hand-tiles>button:has([data-face="3m"])','二三萬搭子');if(step===1)dom('.phone-hand-tiles>button:has([data-face="9p"])','孤立九筒');else river('east',undefined,'已打出的九筒')}
  if([3,4].includes(step)){dom('.phone-hand-tiles>button:has([data-face="2s"])','查看二索');dom('.phone-hand-tiles>button:has([data-face="6s"])','查看六索')}
  if([3,5,11].includes(step))dom('.phone-waits','聽牌提示');
  if(step===6)river('south',undefined,'立直者的牌河');
  if([7,8,9,10,11].includes(step))river('south',meta?.evidenceId,'立直者打過的九筒');
  if(step===8)dom('.phone-hand-tiles>button:has([data-face="9p"])','手上的現物九筒');
  if(step===9)river('east',undefined,'你打出的九筒');
  const serialized=JSON.stringify(out);if(serialized!==last){last=serialized;setBoxes(out)}
  const height=card.current?.offsetHeight??350,width=330,positions=[{left:20,top:65},{left:775,top:65},{left:20,top:160},{left:775,top:160}];const good=positions.find(p=>p.top+height<520&&out.every(b=>p.left+width+14<b.x||p.left>b.x+b.w+14||p.top+height+14<b.y||p.top>b.y+b.h+14));if(good)setCardPos(old=>old.left===good.left&&old.top===good.top?old:good);
 };measure();const timer=setInterval(measure,120);window.addEventListener('resize',measure);return()=>{clearInterval(timer);window.removeEventListener('resize',measure)}},[step,meta?.stage,meta?.evidenceId]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key!=='Tab'||!root.current)return;const list=[...root.current.querySelectorAll<HTMLElement>('button:not(:disabled),a[href]')];if(manual||step===3)list.push(...root.current.closest('.phone-stage')!.querySelectorAll<HTMLElement>('.phone-hand-tiles>button'));e.preventDefault();if(list.length)list[(list.indexOf(document.activeElement as HTMLElement)+(e.shiftKey?-1:1)+list.length)%list.length]?.focus({preventScroll:true})};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[manual,step]);
 const choose=(i:number)=>{if(!question)return;if(i!==question.answer){setFeedback(step===9?'現物只對打過它的那家安全。':step===10?'本例離聽牌仍遠，先觀察立直者的現物。':'再看提示：未見枚數不是牌山保證，聽牌也不代表必須進攻。');return}if(step===12&&q<2){setQ(q+1);setFeedback('答對了，再試下一題。')}else{setCorrect(true);setFeedback('答對了，可以繼續。')}};
 const ready=meta?.stage===step&&!busy&&(step===3?correct&&seen.length===2:step===7?meta.phase==='found':question?correct:true),riverBox=boxes.find(b=>b.label==='立直者打過的九筒');
 return <div className={'lesson-one lesson-eight'+(overview?' lesson-solid':'')} ref={root} role="dialog" aria-modal="true" aria-label="新手學堂第八課" data-step={step}>
 <div className="lesson-top"><strong>新手學堂 · 第八課</strong><span>出牌・聽牌提示・現物 · 無倒數</span><a href="/design/lobby/index.html?screen=academy">離開・保存已完成小節 ×</a></div>
 {!overview&&<svg className="lesson-shade" viewBox="0 0 1125 634" aria-hidden="true">{boxes.map((b,i)=><rect key={i} data-target={b.label} x={b.x} y={b.y} width={b.w} height={b.h} rx="7" fill="none" stroke="#efd18c" strokeWidth="3"/>)}</svg>}
 {manual||step===3?<><div className="lesson-block" style={{left:0,top:0,right:0,height:525}}/><div className="lesson-block" style={{left:0,top:525,width:110,bottom:0}}/><div className="lesson-block" style={{left:1090,top:525,right:0,bottom:0}}/></>:<div className="lesson-block" style={{inset:0}}/>}
 {step===7&&riverBox&&<button className="lesson-target lesson-eight-evidence" style={{left:riverBox.x-4,top:riverBox.y-4,width:riverBox.w+8,height:riverBox.h+8}} aria-label="指出立直者的九筒" disabled={busy||meta?.phase==='found'} onClick={()=>latest.current('academy:eight-evidence',{tileId:meta.evidenceId})}/>}
 <section ref={card} className={'lesson-card '+(overview?'lesson-hero':'lesson-eight-side')} style={overview?undefined:{...cardPos,width:330,height:'auto',maxHeight:445}}>
 <small>第八課 · {step+1} / 14</small><h2>{titles[step]}</h2><p>{descriptions[step]}</p>
 {step===0&&<div className="lesson-reward">🥕 首次完成：300 體驗紅蘿蔔<small>四個固定牌例；進度保存在本瀏覽器。</small></div>}
 {step===3&&<div className="lesson-eight-seen" role="status">二索 {seen.includes('2s')?'已查看 ✓':'待查看'}　六索 {seen.includes('6s')?'已查看 ✓':'待查看'}</div>}
 {step===7&&meta?.phase==='found'&&<div className="lesson-eight-seen" role="status">已找到立直者的現物 ✓</div>}
 {step===11&&<div className="lesson-eight-seen">已聽牌：一索／四索 · 有役牌白</div>}
 {question&&<><h3>{question.q}{step===12?`　${q+1}/3`:''}</h3><div className="lesson-three-answers">{question.choices.map((text,i)=><button key={i} aria-label={'學習答案 '+(i+1)} disabled={correct||busy||meta?.stage!==step} onClick={()=>choose(i)}>{text}</button>)}</div></>}
 <div className="lesson-feedback" role="status">{feedback||meta?.feedback|| (manual?'請在框內觀察後，短按手牌出牌。':step===3?'長按掃牌只查看，不會出牌。':'')}</div>
 {step===13?<><div className="lesson-reward">{claimed?reward?'🥕 已領取300體驗紅蘿蔔':'複習完成，不重複派獎':'首次完成：300體驗紅蘿蔔'}<small>本瀏覽器體驗獎勵，並非正式錢包入帳。</small></div><footer>{claimed?<><a href="/design/lobby/index.html?screen=academy">返回學堂</a><a className="lesson-primary" href="/design/lobby/index.html?screen=academy#course-9">前往第九課 →</a></>:<button className="lesson-primary" onClick={()=>{const r=api()?.completeLessonEight();if(!r?.ok){setFeedback('未能保存，請再試一次。');return}setReward(r.awarded);setClaimed(true)}}>{api()?.read().lessonEight.completed?'完成複習':'完成第八課・領取獎勵'}</button>}</footer></>:manual?<footer><span>完成本步出牌後自動繼續</span></footer>:<footer><span>已完成小節會保存</span><button className="lesson-primary" disabled={!ready} onClick={()=>move(step+1)}>{step===0?'開始第八課 →':step===12?'完成第八課 →':'下一步 →'}</button></footer>}
 </section></div>
}
