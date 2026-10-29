import {translate} from './language';
import React,{useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import {yakuCatalog} from './yaku-catalog.js';
import {completeTileUrl} from './approved-tile-art.js';
import {rankArt} from './rank-art.js';
export function YakuGuide({onClose}:{onClose:()=>void}){
 const [filter,setFilter]=useState('全部'),[search,setSearch]=useState('');
 useEffect(()=>{const key=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose()};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[onClose]);
 const entries=yakuCatalog.filter(y=>(filter==='全部'||filter==='門前限定'&&y.closed||filter==='役滿'&&y.value==='役滿'||filter==='一般役'&&y.value!=='役滿')&&(!search||translate(y.name).toLowerCase().includes(search.toLowerCase())||translate(y.condition).toLowerCase().includes(search.toLowerCase())));
 return createPortal(<><div className="yaku-guide-scrim" onClick={onClose} aria-hidden="true"/><section className="yaku-guide" role="dialog" aria-modal="true" aria-label="役種與和牌圖鑑"><header><div><small>BUNNY GALA · RIICHI GUIDE</small><h2>役種與和牌圖鑑</h2></div><button onClick={onClose} aria-label="關閉役種圖鑑">關閉 ×</button></header><div className="yaku-guide-body">
  <section className="yaku-basics"><h3>先認識如何和牌</h3><p>一般和牌是「四組面子＋一對將牌」。面子可為同花色連續三張的順子，或三張相同牌的刻子；槓子四張視為一組。七對子、國士無雙是另外兩種結構。</p><div className="basic-tile-example">{'1m 2m 3m 4p 5p 6p 7s 8s 9s P P P E E'.split(' ').map((f,i)=><img key={i} src={completeTileUrl(f)} alt={f}/> )}</div><p>和牌至少要有一個役。寶牌、赤寶牌、裏寶牌會加番，但本身不能代替役。自摸是自己摸到和牌張；榮和是和別人打出的牌。</p><p>門前＝沒有吃、碰、明槓，暗槓仍屬門前。振聽時不能榮和，但仍可自摸；自己曾打過任何目前的和牌張亦會形成振聽。放過可榮和的牌會有同巡振聽；立直後放過則維持至本局結束。</p><p>下方圖例展示完成牌型；一發、海底、天和等情境役，亦須同時符合文字所列條件。同一牌型可同時成立多個役，實際以遊戲判定為準。</p></section>
  <section className="yaku-basics"><h3>本桌特殊規則</h3><p>四人東風戰；允許雙響，三家實際宣告榮和則流局。榮和優先於碰／明槓，碰／明槓優先於吃；先按吃碰仍須等待其他人的回應。</p><p>採大三元、大四喜包牌：已公開兩組三元牌或三組風牌，再打出最後一組供對手碰／明槓，須對該役滿負責。自摸由責任者負擔該役滿全部；第三者放銃則兩人各半。其他疊加役滿照常支付。</p><p>採流局滿貫：荒牌時，自己全局捨牌全為么九、沒有被吃碰槓，且自己沒有吃碰槓（包括暗槓），按滿貫自摸計付；不需聽牌、不收不聽罰符。多人成立全部計付，供託給從莊家起首位成立者；成立莊家連莊，否則輪莊。本場自摸每家另付 100，包牌自摸由責任者付本場 300；榮和本場由放銃者付 300。</p><p>真正役滿可疊加；累計役滿固定一倍。國士十三面、純正九蓮、四暗刻單騎、大四喜不額外加倍；不採國士搶暗槓與切上滿貫。任何人結算後零點或負分即終局。</p></section>
  <div className="yaku-filter"><nav aria-label="役種分類">{['全部','一般役','門前限定','役滿'].map(f=><button key={f} aria-pressed={filter===f} onClick={()=>setFilter(f)}>{f}</button>)}</nav><input aria-label="搜尋役種" placeholder="搜尋役種或條件" value={search} onChange={e=>setSearch(e.target.value)}/><span>{entries.length} 項</span></div>
  <div className="yaku-catalog">{entries.map(y=><details key={y.id} data-yaku={y.id}><summary><b>{y.name}</b><span>{y.closed?'門前限定':'可副露'}</span><strong>{y.value}</strong></summary><div className="yaku-description"><p>{y.condition}</p><div className="yaku-example" aria-label={y.name+'牌型例子'}>{y.example.split(' ').map((face,i)=><img key={i} src={completeTileUrl(face)} alt={face}/>)}</div>{y.note&&<p className="yaku-note">{y.note}</p>}</div></details>)}</div>
  <details className="yaku-ranks"><summary>段位圖鑑</summary><div className="rank-art-gallery">{rankArt.map(rank=><figure key={rank.id}><img src={'/art/library-v1/ranks/neutral/'+rank.id+'.png'} alt=""/><figcaption><img className="rank-nameplate" src={'/art/library-v1/rank-nameplates/zh/'+rank.id+'.png'} alt={rank.name}/></figcaption></figure>)}</div></details>
 </div></section></>,document.body);
}
