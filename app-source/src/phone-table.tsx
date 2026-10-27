import {LessonOne,inLessonOne} from './lesson-one';
import {BeginnerGuide,GUIDE_KEY} from './beginner-guide';
import {characterAvatar,characterPortrait} from './character-art';
import {SpecialWinSequence,SpecialDraw} from './special-results';
import {winClockKey,winClockAge} from './win-visual-clock';
import {winTiming,winImpactTier} from './win-impact';
import {DEMO_LABELS} from '../rules/demo-hands';
import {WinArtSequence} from './mangan-art';
import {usesWinArtwork,ART_CHARACTERS,ART_CHARACTER_NAMES} from './win-art-config';

import {Emotes} from './emotes';
import './win-impact.css';
import {discardWaits} from './discard-waits';
import './tile-indicators64.css';
import {createPortal} from 'react-dom';
import {LanguageButton} from './language';
import {RiichiScratch} from './riichi-scratch';
import {useHandInspection} from './hand-inspection';
import {TableAudio,AudioSettings} from './game-audio';
import {seatCharacter} from './seat-character';
import {useTableMotionBusy,tableMotionBusy} from './motion-state.js';
import React,{useEffect,useRef,useState,useMemo} from 'react';
import {flushSync} from 'react-dom';
import type {Game,Tile,Seat} from './main.js';
import {calledPosition,type AutomaticOptions} from './gameplay.js';
import {CharacterPerformance,GlobalCinematic,type Character,unlockPerformanceAudio} from './presentation.js';
import './phone-table.css';
import './soul-table.css';
import './physical-table.css';
import {PhysicalTable} from './physical-table.js';
import {ActionArt} from './action-art.js';
import {AutomaticPanel} from './automatic-panel.js';
import {MultiWinResultOverlay} from './multi-win-results';
import {AssetDigits} from './asset-digits.js';
import './video-reference.css';
import './asset-integration.css';
import './table-corrections.css';
import './art-update-26.css';
import './visual-fixes-22.css';
import './clarity-23.css';
import './polish-24.css';
import './refinement-25.css';
import './timing-layout-26.css';
import './responsive-27.css';
import './ui-polish-32.css';
import './ui-polish-33.css';
import {YakuGuide} from './yaku-guide.js';
import {CenterHub} from './center-hub.js';
import {rankArt} from './rank-art.js';
import {preloadEventArt,preloadAvailableArt} from './preload-art.js';
import type {RiichiReveal} from './riichi-reveal.js';
import {completeTileUrl} from './approved-tile-art.js';
const seats:Seat[]=['east','south','west','north'];
const winds=['東','南','西','北'];
const names=['自己','下家','對家','上家'];
const limits:Record<string,string>={mangan:'滿貫',haneman:'跳滿',baiman:'倍滿',sanbaiman:'三倍滿',yakuman:'役滿','counted yakuman':'累計役滿',none:''};
export function ArtworkTile({tile,back=false,className=''}:{tile?:Tile|undefined;back?:boolean;className?:string}){
 return <span className={'phone-tile '+className+(back?' phone-back':'')} data-face={tile?.face} data-red={tile?.red||undefined} aria-label={back?'牌背':tile?.face}>{(back||tile)&&<img src={back?'/art/tiles/complete/back.svg':completeTileUrl(tile!.face,!!tile!.red)} alt={back?'牌背':tile!.face} draggable={false}/>}</span>;
}
function Meld({meld,seat}:{meld:Game['hand']['melds'][Seat][number];seat:Seat}){
 const closed=!meld.open,added=meld.type==='kan'&&!closed&&meld.tiles.findIndex(t=>t.id===meld.calledTile.id)<3;
 const main=added?meld.tiles.slice(0,3):meld.tiles;
 const ordered=main.filter(t=>t.id!==meld.calledTile.id);if(!closed)ordered.splice(calledPosition(seat,meld.from)===2?ordered.length:calledPosition(seat,meld.from),0,meld.calledTile);
 return <div className="phone-meld" data-type={closed?'ankan':added?'kakan':meld.type} aria-label={closed?'暗槓':added?'加槓':meld.type==='pon'?'碰牌':'副露'}>{(closed?main:ordered).map((t,i)=><span className={'phone-meld-slot'+(!closed&&t.id===meld.calledTile.id?' sideways':'')} key={t.id}><ArtworkTile tile={t} back={closed&&(i===1||i===2)}/>{added&&t.id===meld.calledTile.id&&<ArtworkTile tile={meld.tiles[3]} className="phone-added-kan"/>}</span>)}</div>;
}
export function PhoneTable({riichiReveal,game,pending,options,onOptions,call,error,sorted,riichiTiles,yakuNames,standalone=false}:{riichiReveal:RiichiReveal;standalone?:boolean;game:Game;pending:boolean;options:AutomaticOptions;onOptions:React.Dispatch<React.SetStateAction<AutomaticOptions>>;call:(event:string,payload:any)=>void;error:string;sorted:Tile[];riichiTiles:Partial<Record<Seat,string>>;yakuNames:Record<string,string>}){
 const lessonOne=inLessonOne();
 const [firstGuide,setFirstGuide]=useState(false);
 const [demoMenu,setDemoMenu]=useState(false),[demoCharacter,setDemoCharacter]=useState<Character>(()=>seatCharacter(game,game.you.seat));
 const host=useRef<HTMLDivElement>(null),[scale,setScale]=useState(1),[extension,setExtension]=useState(0),[now,setNow]=useState(Date.now()),[riichi,setRiichi]=useState(false),[hover,setHover]=useState<string|null>(null),[inspectedId,setInspectedId]=useState<string|null>(null),[panel,setPanel]=useState<'settings'|'rules'|'automatic'|'guide'|null>(null);
 useEffect(()=>{const resize=()=>{const value=Math.min(innerWidth/1125,innerHeight/634,2);setScale(value);setExtension(Math.max(0,(innerWidth/value-1125)/2))};const onResize=()=>flushSync(resize);resize();window.addEventListener('resize',onResize);const timer=setInterval(()=>setNow(Date.now()),100);return()=>{clearInterval(timer);window.removeEventListener('resize',onResize)}},[]);
 useEffect(()=>{let live=true;void preloadEventArt().then(()=>{if(live&&host.current)host.current.dataset.eventArt='decoded'}).catch(()=>{if(live&&host.current)host.current.dataset.eventArt='unavailable'});return()=>{live=false}},[]);
 useEffect(()=>{preloadAvailableArt(game)},[game]);
 const motionBusy=useTableMotionBusy();
 const h=game.hand,r=game.room,order=Array.from({length:4},(_,i)=>seats[(seats.indexOf(game.you.seat)+i)%4]!);
 const autoPlay=!!r.players.find(p=>p.seat===game.you.seat)?.autoPlay;
 const handKey=[r.code,h.match.roundWind,h.match.handNumber,h.match.honba,h.match.dealer].join(':');
 useEffect(()=>{setRiichi(false)},[h.revision]);

 const clockOffset=useMemo(()=>h.timeout.serverNow-Date.now(),[h.timeout.serverNow]);const clockNow=now+clockOffset;
 const opening=false;
 const ended=['won','exhaustive_draw','abortive_draw'].includes(h.phase)||r.match.finished;
 const loading=!!window.__bunnyLoading;
 const [resultReady,setResultReady]=useState(false),artDemo=usesWinArtwork(game),showResult=resultReady||r.resultFlow?.phase==='scores'||r.resultFlow?.phase==='ranking';
 useEffect(()=>setResultReady(false),[handKey]);
 useEffect(()=>{if(h.winSequence||loading)return;setResultReady(false);if(!ended||artDemo||h.settlement?.nagashi?.length||h.cinematic?.phase==='playing')return;let timer:ReturnType<typeof setTimeout>;const reveal=()=>{if(h.result&&!h.cinematic?.video&&winImpactTier(game)&&!options.reduceEffects&&winClockAge(winClockKey(game))<winTiming(game).end+200){timer=setTimeout(reveal,80);return;}setResultReady(true)};timer=setTimeout(reveal,options.reduceEffects||h.cinematic?.video?0:h.result?5000:h.phase==='exhaustive_draw'?2400:850);return()=>clearTimeout(timer)},[ended,handKey,artDemo,h.cinematic?.phase,options.skipAnimation,options.reduceEffects,loading]);
 const remaining=Math.max(0,Math.ceil(((h.timeout.deadline??clockNow)-clockNow)/1000));
 const wind=(seat:Seat)=>winds[(seats.indexOf(seat)-seats.indexOf(h.match.dealer)+4)%4];
 const awaitingClaim=h.phase==='awaiting_claim';
 const yourDecision=!autoPlay&&!opening&&!ended&&(h.currentSeat===game.you.seat&&h.phase==='awaiting_discard'||awaitingClaim&&(h.actions.canPassClaim||h.actions.canRon||h.actions.canPon||h.actions.canKan||h.actions.chiSequences.length>0));
 const active=!opening&&!ended&&!awaitingClaim?order.indexOf(h.currentSeat):-1;
 const turnLabel=opening?'開局配牌':ended?'本局結束':awaitingClaim?'等待鳴牌':wind(h.currentSeat)+'家回合';
 const doAction=(event:string,payload:any={})=>{if(lessonOne)return;if(riichiReveal.active&&event==='game:tsumo')return;if(tableMotionBusy()&&event!=='game:next-hand'&&event!=='game:resume-control')return;unlockPerformanceAudio();call(event,payload)};
 useEffect(()=>{if(lessonOne||!standalone||opening||ended||loading)return;try{if(localStorage.getItem(GUIDE_KEY))return}catch{}setFirstGuide(true);setPanel('guide')},[standalone,opening,loading,ended,handKey]);
 const helpOpen=panel==='guide'||panel==='rules';
 useEffect(()=>{if(!standalone)return;window.dispatchEvent(new CustomEvent('bunny:guide',{detail:{open:helpOpen}}));return()=>{if(helpOpen)window.dispatchEvent(new CustomEvent('bunny:guide',{detail:{open:false}}))}},[standalone,helpOpen]);
 const legal=new Set(h.discardTileIds),riichiLegal=new Set(h.actions.riichiDiscardIds);
 const discard=(id:string)=>{if(!lessonOne&&!autoPlay&&!pending&&!ended&&!opening&&!riichiReveal.active&&!tableMotionBusy()&&legal.has(id)&&(!riichi||riichiLegal.has(id))){doAction(riichi?'game:riichi-discard':'game:discard',{tileId:id});setRiichi(false)}};
 useHandInspection(host,setHover,discard,setInspectedId);
 const characters=Object.fromEntries(order.map((s,i)=>[s,seatCharacter(game,s)])) as Record<Seat,Character>;
 const result=h.result;
 const possibleWaits=useMemo(()=>discardWaits(game),[game]);
 const hoverPreview=hover&&possibleWaits[hover]?.length?possibleWaits[hover]:undefined;
 const preview=hoverPreview??h.assistance.waits;
 const previewFuriten=h.furiten||!!hoverPreview?.some(w=>h.discards[game.you.seat].some(t=>t.face===w.face)||w.face===hover);
 const claims=[...(h.actions.canRon?[['ron','胡']]:[]),...(h.actions.canTsumo?[['tsumo','胡']]:[]),...(h.actions.canPon?[['pon','碰']]:[]),...(h.actions.canKan?[['kan','槓']]:[])];
 return <main className="phone-shell"><div className="phone-stage" ref={host} style={{transform:`translate(-50%,-50%) scale(${scale})`,'--side-extension':extension+'px','--hud-left-shift':(lessonOne?0:Math.max(0,extension-35))+'px','--hud-right-shift':(lessonOne?0:Math.max(0,extension-35))+'px','--hud-top-shift':(lessonOne?0:extension*.1)+'px'} as React.CSSProperties} aria-label="Bunny Gala 立直麻雀牌桌">
  <div className="phone-scene scene-viewport gala-v9-ready soul-felt" aria-hidden="true"><svg viewBox="0 0 1125 634" preserveAspectRatio="none"><defs><radialGradient id="felt"><stop stopColor="#006054"/><stop offset="1" stopColor="#003e38"/></radialGradient><linearGradient id="rail"><stop stopColor="#140f13"/><stop offset=".45" stopColor="#d39a90"/><stop offset=".55" stopColor="#a97178"/><stop offset="1" stopColor="#100d12"/></linearGradient><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".045"/></feComponentTransfer><feBlend in="SourceGraphic" mode="soft-light"/></filter></defs><path fill="url(#rail)" d="M0 0h1125v634H0z"/><path fill="url(#felt)" filter="url(#grain)" stroke="#a48a4a" strokeWidth="2" d="M210-15H941l222 665H-37Z"/><g fill="none" stroke="#102f29" strokeWidth="2" opacity=".65"><path d="M296 86H827l105 409H210Z"/><path d="M210 66l722 429M941 66 210 495M175 66h789M64 499h1020"/></g><path d="M175 66 6 568M967 66l152 494" stroke="#c4a35b" strokeWidth="2" opacity=".4"/></svg></div>
  {!window.__bunnyLoading&&<TableAudio riichiTiles={riichiTiles} game={game} remaining={remaining} yourDecision={yourDecision} quiet={options.reduceEffects}/>}
  <PhysicalTable game={game} hover={hover} riichiTiles={riichiTiles} opening={opening} concealedDrawId={riichiReveal.active?riichiReveal.tile?.id:undefined}/>
  <div className="soul-room-name"><span>{lessonOne?'教學場':r.players.filter(p=>!p.isBot).length>1?'真人場':'單人場'}</span><b>四人東</b></div>
  {order.slice(1).map((seat,j)=><div className={'jade-concealed concealed-'+(j+1)} aria-label={names[j+1]+'手牌'} key={seat}>{Array.from({length:h.concealedCounts[seat]},(_,i)=><ArtworkTile back key={i}/>)}</div>)}
  <section className="phone-dora" aria-label="寶牌指示牌"><div>{Array.from({length:5},(_,i)=>h.doraIndicators[i]?<ArtworkTile key={i} tile={h.doraIndicators[i]}/>:<ArtworkTile back key={i}/>)}</div><div className="soul-counters"><span aria-label={'本場 '+h.match.honba}><small>本場</small><svg viewBox="0 0 40 12" aria-hidden="true"><rect x="1" y="1" width="38" height="10" rx="3" fill="#f6ead1"/><g fill="#4d3e45">{[13,17,21,25].map(x=><React.Fragment key={x}><circle cx={x} cy="4" r="1"/><circle cx={x} cy="8" r="1"/></React.Fragment>)}</g></svg><b>{h.match.honba}</b></span><span aria-label={'立直棒 '+r.riichiPot/1000}><small>立直棒</small><svg viewBox="0 0 40 12" aria-hidden="true"><rect x="1" y="1" width="38" height="10" rx="3" fill="#f6ead1"/><circle cx="20" cy="6" r="2.6" fill="#ce6682"/></svg><b>{r.riichiPot/1000}</b></span></div></section>
  <nav className="phone-menu" aria-label="遊戲選單"><LanguageButton/><button aria-label="新手教學與役種" title="截圖教學冊" onClick={()=>{setFirstGuide(false);setPanel('guide')}}><img src="/art/library-v1/icons/neutral/help.svg" alt=""/></button><button aria-label="設定" title="遊戲設定" onClick={()=>setPanel('settings')}><img src="/art/library-v1/icons/neutral/settings.svg" alt=""/></button></nav>
  {order.map((seat,i)=><div className={'phone-player player-'+i+(active===i?' current':'')} key={seat} aria-label={names[i]+'分數'}><span className={'jade-avatar avatar-'+i}><img src={characterAvatar(characters[seat])} alt="" onError={event=>{event.currentTarget.style.visibility='hidden'}}/></span><span className="jade-player-info"><b><span className="jade-wind">{wind(seat)}</span>{r.players.find(player=>player.seat===seat)?.name??['玩家','黑帽T兔','忍者兔','魔法兔'][i]}</b></span>{h.responsibilities?.filter(p=>p.liable===seat).map(p=><small className="pao-badge" key={p.yakuId} title={(p.yakuId==='daisangen'?'大三元':'大四喜')+'責任支付'}>責任</small>)}{seat===h.match.dealer&&<img className="player-dealer-art" src="/art/library-v1/badges/zh/dealer.svg" alt="莊家"/>}</div>)}
  <Emotes character={characters[game.you.seat]} handKey={handKey} disabled={ended||!!window.__bunnyLoading} reduce={options.reduceEffects}/>
  {autoPlay&&<div className="autoplay-notice" role="status"><span>逾時 · BOT 正在代你摸切</span><button onClick={()=>doAction('game:resume-control')}>返回自己操作</button></div>}
  {h.claimResponse&&h.phase==='awaiting_claim'&&<div className="claim-waiting" role="status">已收到選擇 · 等待其他玩家回應</div>}
  <CenterHub riichiTiles={riichiTiles} quiet={options.reduceEffects} game={game} order={order} active={active} awaitingClaim={awaitingClaim} yourDecision={yourDecision}/>
  {!opening&&order.map((seat,i)=><section className={'phone-river river-'+i} data-long={h.discards[seat].length>12} key={seat} aria-label={names[i]+'牌河'}>{h.discards[seat].map(t=><ArtworkTile key={t.id} tile={t} className={(riichiTiles[seat]===t.id?'riichi-discard ':'')+(h.claim?.tile.id===t.id?'last-discard ':'')+(hover===t.face?'matching':'')}/>)}</section>)}
  {!opening&&order.slice(1).map((seat,j)=><section className={'phone-opponent-melds melds-'+(j+1)} key={seat} aria-label={names[j+1]+'副露'}>{h.melds[seat].map((m,i)=><Meld meld={m} seat={seat} key={i}/>)}</section>)}
  <section className={'phone-hand'+(opening?' dealing':'')} aria-label="自己手牌"><div className={'phone-hand-label'+(riichi?' visible':'')}>{riichi?'點選手牌 · 直接宣告立直':'點選手牌直接打出'}</div><div className="phone-hand-tiles">{sorted.map((t,i)=><button key={t.id} data-action="discard" data-tile-id={t.id} aria-label={(lessonOne?'查看 ':'打出 ')+t.face} aria-disabled={autoPlay||motionBusy||riichiReveal.active||opening||pending||ended||!legal.has(t.id)||riichi&&!riichiLegal.has(t.id)} onClick={()=>discard(t.id)} className={(t.id===inspectedId?'selected ':'')+(t.id===game.you.drawnTileId?'drawn ':'')+(riichiLegal.has(t.id)&&riichi?'riichi-choice':'')}><ArtworkTile tile={t} back={riichiReveal.active&&t.id===riichiReveal.tile?.id||h.phase==='exhaustive_draw'&&!h.settlement?.tenpai.includes(game.you.seat)}/></button>)}<div className="phone-own-melds" aria-label="自己副露">{h.melds[game.you.seat].map((m,i)=><Meld key={i} meld={m} seat={game.you.seat}/>)}</div></div></section>
  {yourDecision&&!riichiReveal.active&&<div className={'phone-clock'+(remaining<=5?' urgent':'')} role="timer" aria-label="你的操作倒計時"><b><AssetDigits value={remaining} tone={remaining<=5?'rose':'ivory'}/></b><span>秒 · {wind(h.currentSeat)}家{h.phase==='awaiting_claim'?'鳴牌':'回合'}</span></div>}
  {!autoPlay&&!opening&&!ended&&!riichiReveal.active&&<div className="phone-actions" aria-label="合法操作">{claims.map(([action,label])=><button className="claim-action action-art" key={action} aria-label={action==='ron'?'胡（榮和）':action==='tsumo'?'胡（自摸）':label} data-action={action} disabled={pending||riichiReveal.active||motionBusy} onClick={()=>doAction('game:'+action)}><span className="sr-only">{label}</span><ActionArt kind={action as 'pon'|'kan'|'ron'|'tsumo'}/>{h.claim&&['pon','kan'].includes(action!)&&<span className="call-set-preview" aria-label="鳴牌組合預覽">{[...game.you.hand.filter(t=>t.face===h.claim!.tile.face).slice(0,action==='pon'?2:3),h.claim.tile].map(t=><ArtworkTile key={t.id} tile={t}/>)}</span>}</button>)}{h.actions.chiSequences.map((faces,i)=><button key={i} className="action-art chi-action" data-action="chi" aria-label="吃" disabled={pending||riichiReveal.active||motionBusy} onClick={()=>doAction('game:chi',{faces})}><ActionArt kind="chi"/><span className="phone-action-tiles">{faces.map((face,j)=><ArtworkTile key={j} tile={{id:'preview'+j,face,red:false}}/>)}</span></button>)}{h.actions.ankanTileIds.map(id=><button key={id} className="action-art" data-action="ankan" aria-label="暗槓" disabled={pending||riichiReveal.active||motionBusy} onClick={()=>doAction('game:ankan',{tileId:id})}><ActionArt kind="ankan"/></button>)}{h.actions.kakanTileIds.map(id=><button key={id} className="action-art" data-action="kakan" aria-label="加槓" disabled={pending||riichiReveal.active||motionBusy} onClick={()=>doAction('game:kakan',{tileId:id})}><ActionArt kind="kakan"/></button>)}{riichiLegal.size>0&&<button data-action="riichi-select" onClick={()=>setRiichi(v=>!v)}><span className="sr-only">{riichi?'取消立直':'立直'}</span><ActionArt kind={riichi?'cancel':'riichi'}/></button>}{h.actions.canPassClaim&&<button data-action="pass-claim" disabled={pending||riichiReveal.active||motionBusy} onClick={()=>doAction('game:pass-claim')}><span className="sr-only">跳過</span><ActionArt kind="pass"/></button>}{h.actions.canAbortiveDraw&&<button data-action="abortive-draw" disabled={pending||riichiReveal.active||motionBusy} onClick={()=>doAction('game:abortive-draw')}><span className="sr-only">九種九牌</span><ActionArt kind="nine"/></button>}</div>}
  {standalone&&!lessonOne&&<><button className="demo-open" aria-label="和牌演出 Demo" onClick={()=>setDemoMenu(v=>!v)}>DEMO</button>{demoMenu&&<section className="demo-menu" role="dialog" aria-label="和牌演出示範"><h2>和牌演出試玩</h2><p>選擇角色，再選級別或完整牌型。</p><div className="demo-character-select" aria-label="DEMO 角色">{ART_CHARACTERS.map(role=><button key={role} data-demo-character={role} aria-pressed={role===demoCharacter} onClick={()=>setDemoCharacter(role)}>{ART_CHARACTER_NAMES[role]}</button>)}</div><a className="ranking-preview-link" href="/art/hoodie-v3/index.html" target="_blank" rel="noopener">黑帽T兔 · 全套素材總覽 ↗</a><a className="ranking-preview-link" href="/art/final-ranking-v2/index.html" target="_blank" rel="noopener">終局排名設計 · 切換角色預覽 ↗</a>{DEMO_LABELS.map(([kind,label])=><button key={kind} data-demo={kind} onClick={()=>{setDemoMenu(false);window.dispatchEvent(new Event('bunny:cancel-motion'));doAction('game:demo-win',{kind,character:demoCharacter})}}>{label}<span>▶</span></button>)}<button onClick={()=>setDemoMenu(false)}>關閉</button></section>}</>}
  <div className="phone-options" aria-label="自動操作">{(['autoSort','autoRon','disableCalls','autoDiscard'] as const).map(key=><label key={key} title={{autoSort:'自動理牌',autoRon:'自動和牌',disableCalls:'不鳴牌',autoDiscard:'摸切'}[key]}><input aria-label={{autoSort:'自動理牌',autoRon:'自動和牌',disableCalls:'不鳴牌',autoDiscard:'摸切'}[key]} type="checkbox" checked={options[key]} onChange={e=>onOptions(v=>({...v,[key]:e.target.checked}))}/><span>{{autoSort:'理',autoRon:'和',disableCalls:'鳴',autoDiscard:'切'}[key]}</span></label>)}<button aria-label="自動操作說明與設定" aria-haspopup="dialog" aria-controls="automatic-help-panel" aria-expanded={panel==='automatic'} onClick={()=>setPanel(v=>v==='automatic'?null:'automatic')}><img src={'/art/library-v1/icons/neutral/'+'back'+'.svg'} alt=""/></button></div>
  {hover&&inspectedId&&!opening&&!ended&&<div className="hand-inspection-info" role="status" aria-live="polite"><ArtworkTile tile={{id:'inspect',face:hover,red:false}}/><span>牌河已打出 <strong>{Object.values(h.discards).flat().filter(t=>t.face===hover).length}</strong> 隻</span></div>}
  {!!preview?.length&&!opening&&!ended&&<div className="phone-waits" aria-label={hoverPreview?'出牌後聽牌預覽':'聽牌提示'} data-preview={!!hoverPreview||undefined}><small><strong className="hand-state tenpai">{hoverPreview?'聽牌預覽':'聽牌'}</strong>{previewFuriten&&<strong className="hand-state furiten">振聽</strong>}</small>{preview.map(w=><span key={w.face} data-empty={w.remaining===0||undefined}><ArtworkTile tile={{id:'wait',face:w.face,red:false}} className="waiting-face-lamp"/><b>{w.remaining}<i>枚</i></b></span>)}</div>}

  {riichiReveal.active&&riichiReveal.tile&&!motionBusy&&<RiichiScratch key={riichiReveal.key} reveal={riichiReveal} canTsumo={h.actions.canTsumo} reduce={options.reduceEffects}/>}
  <CharacterPerformance relativeSeats={order} kanTypes={Object.fromEntries(seats.map(seat=>{const m=h.melds[seat].at(-1);return[seat,m?.type==='kan'?(!m.open?'Ankan':m.tiles.findIndex(t=>t.id===m.calledTile.id)<3?'Kakan':'Daiminkan'):undefined]}))} events={(h.events??[]).filter(e=>!(['MANGAN','HANEMAN','BAIMAN','SANBAIMAN','YAKUMAN','DOUBLE_YAKUMAN'].includes(e.kind)||(artDemo||!!h.cinematic?.video)&&['RON','TSUMO'].includes(e.kind)))} characters={characters} skip={options.skipAnimation} suspended={h.cinematic?.phase==='playing'} reduce={options.reduceEffects} critical={false} handKey={handKey} settled={ended} onSkip={()=>{}}/>
  {!loading&&artDemo&&!h.winSequence&&!showResult&&h.cinematic?.phase!=='playing'&&<WinArtSequence key={handKey} game={game} onComplete={()=>setResultReady(true)}/>}
  {!loading&&h.winSequence&&!showResult&&<SpecialWinSequence key={handKey} game={game} onComplete={()=>setResultReady(true)} reduce={options.reduceEffects}/>}
  {!loading&&!!h.settlement?.nagashi?.length&&!showResult&&<SpecialDraw key={handKey} game={game} onComplete={()=>setResultReady(true)}/>}
  {!loading&&!h.winSequence&&<GlobalCinematic key={r.code+':'+h.cinematic?.id} state={h.cinematic} skip={options.skipAnimation&&!h.cinematic?.demo} reduce={options.reduceEffects&&!h.cinematic?.demo} winnerName={r.players.find(p=>p.seat===h.cinematic?.winner)?.name??''}/>}
  {ended&&showResult&&(!!h.winSequence||h.cinematic?.phase!=='playing')&&<MultiWinResultOverlay game={game} characters={characters} pending={pending} reduce={options.reduceEffects} renderTile={tile=><ArtworkTile key={tile.id} tile={tile}/>} renderMeld={(meld,seat,index)=><Meld key={index} meld={meld} seat={seat}/>} onReportComplete={()=>call('game:report-complete',{id:r.resultFlow?.id})} onNext={()=>doAction('game:next-hand')} onRestart={()=>window.dispatchEvent(new Event('demo:restart'))}/>}
  {lessonOne&&<LessonOne inspectedId={inspectedId}/>}
  {panel==='automatic'&&<AutomaticPanel options={options} onOptions={onOptions} onClose={()=>setPanel(null)}/>}
  {panel==='guide'&&<BeginnerGuide initialTour={firstGuide} localBot={standalone} onClose={()=>{try{localStorage.setItem(GUIDE_KEY,'seen')}catch{}setPanel(null);setFirstGuide(false)}} onYaku={()=>{try{localStorage.setItem(GUIDE_KEY,'seen')}catch{}setFirstGuide(false);setPanel('rules')}}/>}
  {panel==='rules'&&<YakuGuide onClose={()=>setPanel(null)}/>}
  {panel==='settings'&&<section className="phone-panel" role="dialog" aria-modal="true" aria-label={panel==='settings'?'設定':'役種'}><button className="phone-close" onClick={()=>setPanel(null)}>關閉</button><h2>{panel==='settings'?'遊戲設定':'役種與玩法'}</h2>{panel==='settings'?<>{(['skipAnimation','reduceEffects'] as const).map(key=><label key={key}><input type="checkbox" checked={options[key]} onChange={e=>onOptions(v=>({...v,[key]:e.target.checked}))}/>{key==='skipAnimation'?'略過全屏演出':'減少動效'}</label>)}<AudioSettings/><p>「理、和、鳴、切」可在左側操作列切換。</p><div className="soul-setting-actions"><button onClick={()=>location.assign('/design/lobby/index.html')}>返回大廳</button><button onClick={()=>document.documentElement.requestFullscreen?.().catch(()=>{})}>全螢幕</button>{standalone&&<button onClick={()=>{setPanel(null);window.dispatchEvent(new Event('demo:restart'))}}>重新開局</button>}</div></>:<><p>點選合法手牌即可直接打出；立直時亦是點選一次即宣告並打出。吃、碰、槓、立直與和牌只會在合法時出現。</p><p>寶牌指示牌在左上角；裏寶牌僅在立直和牌結算時揭示。</p><p>你的打牌回合 {Math.round((r.rules?.actionTimeoutMs??30000)/1000)} 秒；需要你選擇鳴牌時 12 秒。其他玩家回合不顯示倒數。逾時會安全代打或略過。</p><h3>段位圖鑑</h3><div className="rank-art-gallery">{rankArt.map(rank=><figure key={rank.id}><img src={'/art/library-v1/ranks/neutral/'+rank.id+'.png'} alt=""/><figcaption><img className="rank-nameplate" src={'/art/library-v1/rank-nameplates/zh/'+rank.id+'.png'} alt={rank.name}/></figcaption></figure>)}</div></>}</section>}
  {(ended&&resultReady||riichiReveal.active||panel==='rules')&&createPortal(<LanguageButton floating/>,document.body)}
  {error&&<div className="phone-error" role="alert">{error}</div>}
 </div><p className="phone-portrait-note">橫向拿手機，可放大牌桌與操作。</p></main>;
}
