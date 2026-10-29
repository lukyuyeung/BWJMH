import React,{useEffect,useRef,useState} from 'react';
import './beginner-guide.css';
import {completeTileUrl} from './approved-tile-art';
export const GUIDE_KEY='bunny-interface-guide-v1';
type Page={title:string;image:string;box:[number,number,number,number];text:string;target?:string};
const pages:Page[]=[
 {title:'你的手牌',image:'table',box:[110,515,855,115],target:'.phone-hand',text:'下方是只有你看得到的手牌。輪到你時摸一張、打出一張，朝能和牌的組合前進。'},
 {title:'短按出牌，按住查看',image:'inspection',box:[100,515,865,115],target:'.phone-hand',text:'短按手牌會直接打出；按住再左右掃牌，手牌會抬起，牌河中的同款牌會亮起紫色提示。放手不會出牌。'},
 {title:'牌河：大家打過的牌',image:'table',box:[320,105,485,310],target:'.river-0',text:'每家打出的牌會排在面前，合稱牌河。這些是公開資訊，可以幫你判斷哪些牌已經出現。'},
 {title:'輪到誰？還有多少時間？',image:'table',box:[465,170,200,170],target:'.phone-round',text:'中央顯示局數、各家點數及剩餘牌數。輪到你時會另有操作倒數；新手場出牌時間為 30 秒。'},
 {title:'左側的自動操作',image:'table',box:[2,232,70,210],target:'.phone-options',text:'「理」自動整理手牌；「和」自動和牌；「鳴」是不吃碰槓；「切」是摸到便打出。第一次玩先保持預設即可。'},
 {title:'先認識三種數牌與字牌',image:'table',box:[110,515,855,115],text:'萬、筒、索各有一至九；東南西北、白發中是字牌。紅色的五仍當五使用，另外可增加番數。'},
 {title:'和牌：四組，加一對',image:'table',box:[110,515,855,115],text:'一般和牌要四組加一對：同花色連續三張是一組，三張相同也是一組。七對子與國士無雙是例外，日後再學。'},
 {title:'日麻關鍵：至少要有一個役',image:'riichi',box:[780,385,340,175],text:'牌湊齊也不一定能和，還需要至少一個「役」。例如門前立直，或三張白／發／中；寶牌只加番，不能單獨作為役。'},
 {title:'吃、碰、槓與跳過',image:'pon',box:[415,425,535,110],text:'吃是用上家打出的牌湊順子；碰是湊三張相同牌；槓是四張相同牌。不想要就按跳過，系統只會提供合法選項。'},
 {title:'立直與聽牌',image:'riichi',box:[740,425,210,110],text:'只差一張即可和牌叫聽牌；沒有吃、碰、明槓稱為門前，暗槓不影響門前。門前聽牌且符合條件時可按立直，再打出一張合法牌；付 1,000 點後，一般不能再自由換牌。'},
 {title:'自摸、榮和與振聽',image:'furiten',box:[434,338,230,152],text:'自己摸到和牌張叫自摸，和別人打出的牌叫榮和。若你打過目前任何一種和牌張，就會振聽：不能榮和，但仍可自摸。'},
 {title:'寶牌與隨時查看教學',image:'table',box:[2,4,200,110],target:'.phone-dora',text:'左上顯示的是寶牌「指示牌」，真正寶牌是它的下一張。忘了操作就按右上「？」重看本冊；詳細役種也在裡面。'}
];
const tour=[0,2,3,4,11];
export function BeginnerGuide({onClose,onYaku,initialTour=false,localBot=false}:{onClose:()=>void;onYaku:()=>void;initialTour?:boolean;localBot?:boolean}){
 const [zoom,setZoom]=useState(false),[mode,setMode]=useState(initialTour?'tour':'book'),[index,setIndex]=useState(0),[rect,setRect]=useState<[number,number,number,number]>([110,515,855,115]);const root=useRef<HTMLDivElement>(null),close=useRef(onClose);close.current=onClose;
 const page:Page=mode==='tour'&&index===tour.length-1?{title:'隨時重看，不用記住全部',image:'table',box:[960,5,160,75],target:'.phone-menu',text:'右上「？」可以隨時打開截圖教學冊，也能查閱役種。不用一次記住全部，先試著摸牌、出牌就好。'}:pages[mode==='tour'?tour[index]!:index]!;
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null;(root.current?.querySelector<HTMLButtonElement>('.guide-image-zoom button')??root.current?.querySelector<HTMLButtonElement>('button'))?.focus({preventScroll:true});const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();if(zoom)setZoom(false);else close.current()}if(e.key==='Tab'){const buttons=[...(root.current!.querySelector('.guide-image-zoom')??root.current!).querySelectorAll<HTMLElement>('button:not(:disabled)')],first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}};window.addEventListener('keydown',key);return()=>{window.removeEventListener('keydown',key);previous?.focus({preventScroll:true})}},[localBot,zoom]);
 useEffect(()=>{if(mode!=='tour')return;const stage=root.current?.closest('.phone-stage'),el=stage?.querySelector(page.target??'');if(stage&&el){const a=stage.getBoundingClientRect(),b=el.getBoundingClientRect(),s=1125/a.width;setRect([Math.max(5,(b.left-a.left)*s-8),Math.max(5,(b.top-a.top)*s-8),Math.min(1115,b.width*s+16),Math.min(620,b.height*s+16)])}else setRect(page.box)},[index,mode]);
 const changeMode=(value:string)=>{setMode(value);setIndex(0)};
 const total=mode==='tour'?tour.length:pages.length;
 return <div className={'beginner-overlay '+(mode==='tour'?'guide-tour':'guide-book')} ref={root} role="dialog" aria-modal="true" aria-label={mode==='tour'?'首次介面導覽':'截圖教學冊'}>
 {mode==='tour'&&<svg className="guide-spotlight" viewBox="0 0 1125 634" preserveAspectRatio="none" aria-hidden="true"><defs><mask id="guide-hole"><rect width="1125" height="634" fill="white"/><rect x={rect[0]} y={rect[1]} width={rect[2]} height={rect[3]} rx="10" fill="black"/></mask></defs><rect width="1125" height="634" fill="#030b0b" opacity=".84" mask="url(#guide-hole)"/><rect x={rect[0]} y={rect[1]} width={rect[2]} height={rect[3]} rx="10" fill="none" stroke="#f1cf91" strokeWidth="3"/></svg>}
 <section className="beginner-card" style={mode==='tour'?{top:rect[1]>320?55:345}:undefined}>
 <header><div><small>BUNNY GALA · 新手入門</small><h2>{mode==='tour'?'認識你的牌桌':'截圖教學冊'}</h2></div><button onClick={onClose} aria-label="關閉新手教學">{initialTour?'跳過／關閉':'關閉'} ×</button></header>
 {mode==='book'&&<div className="beginner-content"><nav aria-label="教學目錄">{pages.map((p,i)=><button key={p.title} aria-current={index===i?'page':undefined} onClick={()=>setIndex(i)}>{String(i+1).padStart(2,'0')}　{p.title}</button>)}<button onClick={()=>changeMode('tour')}>重新導覽牌桌 →</button><button onClick={onYaku}>役種與和牌圖鑑 →</button></nav><article><button className="guide-zoom-button" aria-label="放大教學截圖" onClick={()=>setZoom(true)}><div className="guide-screenshot"><img src={'/art/beginner-guide-v1/'+page.image+'.jpg'} alt={page.title+'的實際遊戲畫面'}/><svg viewBox="0 0 1125 634" aria-hidden="true"><rect x={page.box[0]} y={page.box[1]} width={page.box[2]} height={page.box[3]} rx="10" fill="#f2cd8620" stroke="#ffe0a0" strokeWidth="4"/></svg><small className="guide-zoom-label">點按放大</small></div></button><h3>{page.title}</h3><p>{page.text}</p>{index===6&&<div className="guide-example" aria-label="四組加一對例子">{['1m 2m 3m','4p 5p 6p','7s 8s 9s','P P P','E E'].map((group,i)=><span key={i}>{group.split(' ').map((face,j)=><img key={j} src={completeTileUrl(face)} alt={face}/>)}<small>{i===4?'一對':i===3?'白：一個役':'一組順子'}</small></span>)}</div>}</article></div>}
 {mode==='tour'&&<article><h3>{page.title}</h3><p>{page.text}</p></article>}
 <footer><span>{index+1} / {total}{localBot?' · 電腦局已暫停':' · 對局計時繼續'}</span><div><button disabled={index===0} onClick={()=>setIndex(i=>i-1)}>上一頁</button>{mode==='tour'&&index===total-1&&<button onClick={onClose}>開始打牌</button>}{index<total-1?<button className="guide-next" onClick={()=>setIndex(i=>i+1)}>下一頁 →</button>:<button className="guide-next" onClick={mode==='tour'?()=>changeMode('book'):onClose}>{mode==='tour'?'打開教學冊':'返回牌桌'}</button>}</div></footer>
 </section>{zoom&&<div className="guide-image-zoom"><button onClick={()=>setZoom(false)} autoFocus>返回教學冊 ×</button><div className="guide-screenshot"><img src={'/art/beginner-guide-v1/'+page.image+'.jpg'} alt={page.title}/><svg viewBox="0 0 1125 634" aria-hidden="true"><rect x={page.box[0]} y={page.box[1]} width={page.box[2]} height={page.box[3]} rx="10" fill="#f2cd8620" stroke="#ffe0a0" strokeWidth="4"/></svg></div></div>}</div>
}
