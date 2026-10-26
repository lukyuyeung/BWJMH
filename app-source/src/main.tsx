import {useStartupLoading} from './startup-loading';
import {useLanguage} from './language';
import {useTableMotionBusy,tableMotionBusy} from './motion-state.js';
import {sceneFrame} from './viewport.js';
import './fonts.css';
import './tile-font.css';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import {createPortal} from 'react-dom';
import { createRoot } from 'react-dom/client';
import { io, type Socket } from './demo-transport';
import './styles.css';
import './scene.css';
import './product.css';
import './table-design.css';
import './gala-v9.css';
import {GalaScene} from './gala-scene.js';
import {useRiichiReveal} from './riichi-reveal.js';
import {PhoneTable} from './phone-table.js';
import {GlobalCinematic,type SharedCinematic,CharacterPerformance,unlockPerformanceAudio,characterAssets,type Character,type PerformanceEvent} from './presentation.js';
import {automaticIntent,defaultOptions,matchingOpponentDiscard,calledPosition,type AutomaticOptions} from './gameplay.js';

export type Seat='east'|'south'|'west'|'north';
export type Tile={id:string;face:string;red:boolean};
type Player={id:string;name:string;seat:Seat;ready:boolean;connected:boolean;isHost:boolean;isBot:boolean;autoPlay?:boolean;botProfile?:'aggressive'|'balanced'|'defensive'};
type Room={resultFlow?:{id:string;phase:'report'|'hold'|'scores'|'ranking';deadline:number};rules?:{actionTimeoutMs:number};code:string;phase:'lobby'|'playing';players:Player[];canStart:boolean;scores:Record<Seat,number>;riichiPot:number;match:{roundWind:'east'|'south';handNumber:number;dealer:Seat;honba:number;finished:boolean};finalRanking?:Seat[]};
export type Game={
 room:Room;
 you:{playerId:string;seat:Seat;hand:Tile[];drawnTileId?:string};
 hand:{
  currentSeat:Seat;phase:'awaiting_discard'|'awaiting_draw'|'awaiting_claim'|'won'|'exhaustive_draw'|'abortive_draw';abortiveReason?:string;turnNumber:number;match:Room['match'];revision:number;discardTileIds:string[];wallRemaining:number;
  responsibilities?:import('../rules/special-settlement').Responsibility[];winSequence?:import('../rules/win-sequence').WinSequence;drawPresentation?:{startedAt:number;endsAt:number;serverNow:number};demoPresentation?:'mangan-art';demoCharacter?:Character;cinematic?:SharedCinematic;wallSlots:{side:Seat;stack:number;level:0|1;occupied:boolean;dead:boolean;indicator?:Tile}[];timeout:{deadline:number|null;serverNow:number};events:PerformanceEvent[];assistance:{waits:{face:string;remaining:number}[];riichi:Record<string,{face:string;remaining:number}[]>};settlement?:{kind?:'win'|'nagashi_mangan'|'exhaustive_draw'|'abortive_draw';transfers?:import('../rules/special-settlement').PointTransfer[];nagashi?:Seat[];awardedPot?:number;scoreChanges:Record<Seat,number>;winningHand?:Tile[];winningHands?:Partial<Record<Seat,Tile[]>>;tenpai:Seat[];tenpaiHands?:Partial<Record<Seat,Tile[]>>};
  opening?:{startedAt:number;dice:[number,number];breakSide:Seat;breakStack:number;dealer:Seat;dealSlots:number[]};uraIndicators?:Tile[];
  doraIndicators:Tile[];yourDora:{indicatorDora:number;akaDora:number;total:number};rinshanRemaining:number;
  discards:Record<Seat,Tile[]>;concealedCounts:Record<Seat,number>;
  actions:{canAbortiveDraw?:boolean;canDraw:boolean;canDiscard:boolean;canTsumo:boolean;canRon:boolean;canWinClaim:boolean;canPassClaim:boolean;canPon:boolean;canKan:boolean;ankanTileIds:string[];kakanTileIds:string[];chiSequences:string[][];riichiDiscardIds:string[]};
  melds:Record<Seat,Meld[]>;riichi:Record<Seat,boolean>;waits:string[];furiten:boolean;
  claimResponse?:{kind:'pass'|'ron'|'pon'|'kan'|'chi';faces?:string[]};
  results?:NonNullable<Game['hand']['result']>[];
  claim?:{discarder:Seat;tile:Tile};
  result?:{winner:Seat;method:'tsumo'|'ron';from?:Seat;evaluation:{han:number;yakuman:number;yaku:{name:string;han:number;yakuman?:number}[]};dora:{total:number;indicatorDora:number;akaDora:number;uraDora:number};score:{han:number;fu:number;limit:string;payment:{total:number;ron?:number;eachTsumo?:number;dealerTsumo?:number;nonDealerTsumo?:number}}};
 }
};
type Ack={ok:true;data:any}|{ok:false;error:{code:string;message:string}};
const SERVER=(import.meta as any).env?.VITE_SERVER_URL ?? 'http://localhost:3001';
const seats:Seat[]=['east','south','west','north'];
const seatLabel:Record<Seat,string>={east:'東',south:'南',west:'西',north:'北'};
const honor:Record<string,string>={E:'東',S:'南',W:'西',N:'北',P:'白',F:'發',C:'中'};
function tileText(face:string){return honor[face]?`${honor[face]} ${face}`:face;}

const art='/art/v5/';
const portraits={yellow:'CHARACTER_PLAYER_YELLOW_BUNNY_MASTER.png',wizard:'CHARACTER_WIZARD_MASTER.jpeg',ninja:'CHARACTER_NINJA_MASTER.jpeg',king:'CHARACTER_KING_MASTER.jpeg'};
const yakuNames:Record<string,string>={Tanyao:'無么九（斷么九）','Double Riichi':'雙立直',Tenhou:'天和',Chiihou:'地和',Riichi:'立直',Ippatsu:'一發','Menzen Tsumo':'門前清自摸',Pinfu:'平和',Yakuhai:'役牌',Iipeikou:'一盃口','Sanshoku Doujun':'三色同順',Ittsu:'一氣通貫',Toitoi:'對對和',Chiitoitsu:'七對子',Honitsu:'混一色',Chinitsu:'清一色',Honroutou:'混老頭',Shousangen:'小三元','Haitei Raoyue':'海底摸月','Houtei Raoyui':'河底撈魚','Rinshan Kaihou':'嶺上開花',Chankan:'搶槓','Kokushi Musou':'國士無雙',Daisangen:'大三元',Tsuuiisou:'字一色',Chinroutou:'清老頭'};
function Face({tile}:{tile:Tile}){
 const face=tile.face;if(honor[face])return <span className={'tile-honor honor-'+face}>{face==='P'?'':honor[face]}</span>;
 const rank=Number(face[0]),suit=face[1];
 if(suit==='m')return <span className="characters"><b>{'一二三四五六七八九'[rank-1]}</b><em>萬</em></span>;
 const positions:Record<number,[number,number][]>={1:[[30,42]],2:[[30,20],[30,64]],3:[[15,18],[30,42],[45,66]],4:[[16,20],[44,20],[16,64],[44,64]],5:[[16,18],[44,18],[30,42],[16,66],[44,66]],6:[[16,18],[44,18],[16,42],[44,42],[16,66],[44,66]],7:[[16,16],[30,26],[44,16],[16,48],[44,48],[16,68],[44,68]],8:[[16,14],[44,14],[16,32],[44,32],[16,50],[44,50],[16,68],[44,68]],9:[[14,18],[30,18],[46,18],[14,42],[30,42],[46,42],[14,66],[30,66],[46,66]]};
 return <svg viewBox="0 0 60 84" aria-hidden="true">{positions[rank]!.map(([cx,cy],i)=>suit==='p'?<g key={i} stroke={tile.red?'#b93232':i===0?'#ad332d':'#1d413a'} fill="none" strokeWidth="2.7"><circle cx={cx} cy={cy} r="6"/><circle cx={cx} cy={cy} r="2.7"/></g>:<g key={i} fill={tile.red?'#b93232':'#28713c'}><rect x={cx-2.5} y={cy-6} width="5" height="12" rx="2"/><rect x={cx-4} y={cy-5} width="8" height="2" rx="1"/><rect x={cx-4} y={cy+3} width="8" height="2" rx="1"/></g>)}</svg>
}
function MiniTile({tile,sideways=false,extra=""}:{tile:Tile;sideways?:boolean;extra?:string}){return <span className={'tile mini '+(tile.red?'red ':'')+(sideways?'sideways ':'')+extra} title={tileText(tile.face)} data-face={tile.face} data-red={tile.red} aria-label={tileText(tile.face)}><Face tile={tile}/></span>}

type Meld={type:string;tiles:Tile[];calledTile:Tile;from:Seat;open?:boolean};
function MeldView({meld,seat}:{meld:Meld;seat:Seat}){const closed=meld.open===false,added=meld.type==='kan'&&!closed&&meld.tiles.findIndex(t=>t.id===meld.calledTile.id)<3;const main=added?meld.tiles.slice(0,3):meld.tiles;const own=main.filter(t=>t.id!==meld.calledTile.id);if(!closed)own.splice(calledPosition(seat,meld.from)===2?own.length:calledPosition(seat,meld.from),0,meld.calledTile);const tiles=closed?main:own;return <div className={'meld '+(added?'added-kan':'')} data-type={closed?'ankan':added?'kakan':meld.type}>{tiles.map((t,i)=>closed&&(i===1||i===2)?<span className="tile-back" key={t.id} aria-label="Closed Kan tile"/>:<span className="meld-slot" key={t.id}><MiniTile tile={t} sideways={!closed&&t.id===meld.calledTile.id}/>{added&&t.id===meld.calledTile.id&&<MiniTile tile={meld.tiles[3]!} sideways extra="kan-added"/>}</span>)}</div>}
function ActionPreview({tiles,claimed}:{tiles:Tile[];claimed?:string|undefined}){return <span className="action-tiles">{tiles.map((t,i)=><MiniTile key={i} tile={t} extra={t.id===claimed?'claimed-preview':''}/>)}</span>}
function TurnTimer({timeout,seat}:{timeout:Game['hand']['timeout'];seat:string}){const [remaining,setRemaining]=useState(0);useEffect(()=>{const received=performance.now(),duration=(timeout.deadline??timeout.serverNow)-timeout.serverNow;const tick=()=>setRemaining(Math.max(0,Math.ceil((duration-(performance.now()-received))/1000)));tick();const t=setInterval(tick,200);return()=>clearInterval(t);},[timeout.deadline,timeout.serverNow]);return timeout.deadline?<div className={'turn-timer '+(remaining<=5?'urgent':'')} role="timer"><b>{remaining}s</b><span>{seat}</span></div>:null;}

function Avatar({character}:{character:'yellow'|'wizard'|'ninja'|'king'}){return <span className={'avatar '+character}><img src={art+portraits[character]} alt={character==='yellow'?'Yellow Bunny':character}/></span>}
function MenuIcon({kind}:{kind:string}){return <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{kind==='rules'?<><path d="M20 32V10C14 6 7 7 3 9v23c5-3 11-3 17 0Zm0 0V10c6-4 13-3 17-1v23c-5-3-11-3-17 0Z"/><path d="M7 12v15m26-15v15"/></>:kind==='info'?<><circle cx="20" cy="20" r="16"/><path d="M20 18v12m-4 0h8m-5-19h2"/></>:kind==='settings'?<><circle cx="20" cy="20" r="9"/><circle cx="20" cy="20" r="3"/>{Array.from({length:8},(_,i)=><path key={i} d="M18 3h4l1 7h-6Z" transform={'rotate('+i*45+' 20 20)'}/>)}</>:<><path d="M25 10V5H5v30h20v-5M15 20h22m-8-8 8 8-8 8"/></>}</svg>}
function Brand(){return <img className="brand-logo" src={art+'LOGO_MASTER__DO_NOT_REDRAW.png'} alt="Bunny Gala"/>}
function Scene({children,onInspectEnd,game,reduce,motion,riichiTiles,hoverFace}:{children:React.ReactNode;onInspectEnd:()=>void;game:Game;reduce:boolean;motion:boolean;riichiTiles:Partial<Record<Seat,string>>;hoverFace:string|null}){const [galaReady,setGalaReady]=useState(false);const ref=useRef<HTMLDivElement>(null),canvasRef=useRef<HTMLDivElement>(null),[frame,setFrame]=useState(()=>sceneFrame(1536,1024,false));useEffect(()=>{let active=true,cleanup:(()=>void)|undefined;const target=canvasRef.current;if(galaReady)return;void import('./tiles3d.js').then(({mountTiles3D})=>{if(active&&target)cleanup=mountTiles3D(target)}).catch(()=>{if(active&&target)target.dataset.tileRenderer='fallback'});return()=>{active=false;cleanup?.()}},[galaReady]);useEffect(()=>{const resize=new ResizeObserver(entries=>{const r=entries[0]!.contentRect;setFrame(sceneFrame(r.width,r.height,matchMedia('(orientation: landscape) and (max-height: 500px)').matches));});if(ref.current)resize.observe(ref.current);return()=>resize.disconnect()},[]);return <div className="scene-viewport" ref={ref} onPointerDown={e=>{if(!(e.target as HTMLElement).closest(".hand-tile-hit,.discard-confirm"))onInspectEnd();}}><GalaScene hoverFace={hoverFace} game={game} reduce={reduce} motion={motion} riichiTiles={riichiTiles} onReady={setGalaReady}/><div className="scene-canvas" ref={canvasRef} style={{transform:`scale(${frame.scale})`,'--scene-scale':frame.scale,'--view-height':frame.visibleHeight+'px','--table-scale':frame.tableScale,'--table-offset':frame.tableOffset+'px'} as React.CSSProperties}><div className="responsive-table-material" aria-hidden="true"/>{children}<span className="tile-render-fallback" role="status">3D 顯示暫時不可用 · 已保留可操作牌面</span></div></div>}
function ResponsivePanel({compact,children}:{compact:boolean;children:React.ReactNode}){return compact?createPortal(<div className="mobile-panel">{children}</div>,document.body):<>{children}</>;}
function App(){
 useLanguage();
 const startupReady=useStartupLoading();
 const socket=useMemo<Socket>(()=>io(SERVER,{autoConnect:false}),[]);
 const [compact,setCompact]=useState(()=>matchMedia('(orientation: landscape) and (max-height: 500px)').matches);
 const [graphics,setGraphics]=useState<'auto'|'low'|'high'>(()=>{const saved=localStorage.getItem('bunny-graphics');return saved==='low'||saved==='high'?saved:'auto';});
 useEffect(()=>{const media=matchMedia('(orientation: landscape) and (max-height: 500px)');const change=()=>setCompact(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
 useEffect(()=>{localStorage.setItem('bunny-graphics',graphics);document.documentElement.dataset.graphicsQuality=graphics;window.dispatchEvent(new Event('bunny:graphics'));},[graphics]);

 const [name,setName]=useState(''),[code,setCode]=useState(''),[playerId,setPlayerId]=useState(''),[room,setRoom]=useState<Room|null>(null),[game,setGame]=useState<Game|null>(null),[error,setError]=useState(''),[pending,setPending]=useState(false),[riichiTiles,setRiichiTiles]=useState<Partial<Record<Seat,string>>>({});
 const [options,setOptions]=useState<AutomaticOptions>(()=>{try{return {...defaultOptions,...JSON.parse(localStorage.getItem('bunny-options')??'{}')};}catch{return defaultOptions;}}),[hoverFace,setHoverFace]=useState<string|null>(null),[previewId,setPreviewId]=useState<string|null>(null),[selectRiichi,setSelectRiichi]=useState(false);
 const automationRevision=useRef('');const touchFace=useRef<string|null>(null);
 useEffect(()=>{localStorage.setItem('bunny-options',JSON.stringify(options));document.documentElement.dataset.reduceEffects=String(options.reduceEffects);window.dispatchEvent(new Event('bunny:graphics'));},[options]);
 const [panel,setPanel]=useState<'rules'|'info'|'settings'|'exit'|null>(null),[away,setAway]=useState(false),[contrast,setContrast]=useState(false);
 const autoDrawRevision=useRef(''),lastGame=useRef<Game|null>(null),inFlight=useRef(false),finishedRoomCode=useRef('');
 useEffect(()=>{
  const onRoom=(r:Room)=>{if(finishedRoomCode.current===r.code&&!r.match.finished)return;if(r.match.finished)finishedRoomCode.current=r.code;setRoom(r)};
  const clear=()=>{setPanel(null);setAway(false);localStorage.removeItem('bunny-riichi-session');setRoom(null);setGame(null);setPlayerId('');lastGame.current=null;finishedRoomCode.current='';autoDrawRevision.current='';setRiichiTiles({});inFlight.current=false;setPending(false)};
  const resume=()=>{autoDrawRevision.current='';const saved=localStorage.getItem('bunny-riichi-session');if(saved){try{socket.emit('room:reconnect',JSON.parse(saved),(r:Ack)=>{if(r.ok){setPlayerId(r.data.playerId);onRoom(r.data.room);setError('')}else{clear();setError(r.error.message)}})}catch{clear()}}};
  const onGame=(g:Game)=>{if(finishedRoomCode.current===g.room.code&&!g.room.match.finished)return;if(g.room.match.finished)finishedRoomCode.current=g.room.code;const old=lastGame.current;if(old&&g.room.code===old.room.code&&(g.hand.revision<old.hand.revision||old.room.match.finished&&!g.room.match.finished))return;if(!old||g.room.code!==old.room.code||g.hand.turnNumber<old.hand.turnNumber||g.hand.turnNumber===1&&old.hand.result)setRiichiTiles({});if(old&&g.room.code===old.room.code)for(const seat of seats)if(g.hand.riichi[seat]&&!old.hand.riichi[seat]){const tile=g.hand.discards[seat].at(-1);if(tile)setRiichiTiles(v=>({...v,[seat]:tile.id}))}lastGame.current=g;setGame(g);setRoom(g.room);inFlight.current=false;setPending(false)};
  socket.on('connect',resume);socket.on('room:state',onRoom);socket.on('game:state',onGame);socket.on('room:closed',clear);socket.on('session:replaced',()=>{clear();setError('Session opened in another client.')});socket.on('disconnect',()=>{autoDrawRevision.current='';inFlight.current=false;setPending(false);setError('Disconnected — waiting to reconnect.')});socket.on('connect_error',()=>setError('Cannot reach game server. Start the server on port 3001.'));socket.connect();
  return()=>{socket.removeAllListeners();socket.disconnect()}
 },[socket]);
 const call=(event:string,payload:any,onOk?:(d:any)=>void)=>{if(event==='game:report-complete'){if(socket.connected)socket.emit(event,payload);return;}unlockPerformanceAudio();if(!socket.connected){setError('連線中斷，請返回牌桌或等候重連。');return}if(event.startsWith('game:')&&(inFlight.current||(finishedRoomCode.current===room?.code&&event!=='game:demo-win')||(tableMotionBusy()&&event!=='game:demo-win'&&event!=='game:next-hand')))return;if(event.startsWith('game:')){inFlight.current=true;setPending(true)}const sentRevision=game?.hand.revision;setError('');socket.timeout(8000).emit(event,event.startsWith('game:')?{...payload,revision:game?.hand.revision}:payload,(timeoutError:Error|null,r:Ack)=>{inFlight.current=false;setPending(false);if(timeoutError){if(event.startsWith('game:')&&sentRevision!==undefined&&(lastGame.current?.hand.revision??-1)>sentRevision){setError('');return;}setError('伺服器回應逾時；請等候最新牌局後再操作。');return;}if(r.ok)onOk?.(r.data);else setError(r.error.message)})};
 const motionBusy=useTableMotionBusy();
 const riichiReveal=useRiichiReveal(game,options.reduceEffects);
 useEffect(()=>{if(!startupReady||game?.room.players.find(p=>p.seat===game.you.seat)?.autoPlay||!game?.hand.actions.canDraw||game.room.match.finished||finishedRoomCode.current===game.room.code||!socket.connected)return;const key=game.room.code+':'+game.hand.revision;if(autoDrawRevision.current===key)return;let timer:number;const draw=()=>{if(tableMotionBusy()){timer=window.setTimeout(draw,50);return}autoDrawRevision.current=key;call('game:draw',{})};timer=window.setTimeout(draw,50);return()=>clearTimeout(timer)},[game,socket,startupReady]);
 useEffect(()=>{if(!startupReady||!game||game.room.players.find(p=>p.seat===game.you.seat)?.autoPlay||motionBusy||tableMotionBusy()||riichiReveal.active||pending||selectRiichi||panel||away||!socket.connected)return;const key=game.room.code+':'+game.hand.revision+':'+JSON.stringify(options);if(automationRevision.current===key)return;const intent=automaticIntent({...options,autoDiscard:options.autoDiscard||!!game.hand.riichi[game.you.seat]},{finished:game.room.match.finished||['won','exhaustive_draw','abortive_draw'].includes(game.hand.phase),...game.hand.actions,drawnTileId:game.you.drawnTileId,discardTileIds:game.hand.discardTileIds});if(!intent)return;automationRevision.current=key;call(intent.event,intent.payload);},[game,options,pending,selectRiichi,panel,away,socket,riichiReveal.active,motionBusy,startupReady]);
 useEffect(()=>{setSelectRiichi(false);setPreviewId(null);setHoverFace(null);touchFace.current=null;},[game?.hand.revision]);
 const remember=(d:any)=>{finishedRoomCode.current=d.room.match.finished?d.room.code:'';setPlayerId(d.playerId);setRoom(d.room);localStorage.setItem('bunny-riichi-session',JSON.stringify({code:d.room.code,playerId:d.playerId,resumeToken:d.resumeToken}))};
 const me=room?.players.find(p=>p.id===playerId);
 const profile=(seat:Seat,relative=0)=>{const player=room?.players.find(p=>p.seat===seat),characters=['yellow','king','ninja','wizard'] as const;return <div className={'profile '+(game?.hand.currentSeat===seat?'active':'')}><Avatar character={characters[relative]!}/><div><strong title={player?.name??'Empty seat'}>{player?.isBot&&game?['Player','King','Ninja','Wizard'][relative]:player?.name??'Empty seat'}</strong><span>{game?seatLabel[seats[(seats.indexOf(seat)-seats.indexOf(game.hand.match.dealer)+4)%4]!]:seatLabel[seat]} {player?.isHost?'· HOST':''} {player?.isBot?'· BOT':''}</span><b>{(room?.scores[seat]??25000).toLocaleString()} <small>點</small></b></div>{game?.hand.riichi[seat]&&<i className="riichi-badge">立直</i>}</div>};
 if(!room)return <main className="shell welcome"><section className="hero"><Brand/><p className="eyebrow">BUNNY WARRIORS · 立直</p><h1>入座，開局。</h1><p>四位玩家，一席對局。</p><div className="hero-tags"><span>翡翠牌枱</span><span>真人連線</span><span>單人 ＋ Bunny Bots</span></div></section><section className="card home"><h2>Bunny Riichi</h2><p className="hint">v2.7.2 · Gameplay & Cinematic Edition</p><label>玩家名稱<input value={name} maxLength={20} onChange={e=>setName(e.target.value)} placeholder="Bunny"/></label><button disabled={!name.trim()} onClick={()=>call('room:create',{name},remember)}>建立房間</button><div className="or">或加入朋友嘅牌枱</div><label>房間代碼<input value={code} maxLength={6} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="ABC234"/></label><button className="secondary" disabled={!name.trim()||code.trim().length!==6} onClick={()=>call('room:join',{code,name},remember)}>加入房間</button><p className="hint">單人試玩：建立房間 → 加入電腦玩家 → Ready → 開始對局。</p>{error&&<p className="error" role="alert">{error}</p>}</section></main>;
 if(room.phase==='lobby')return <main className="shell lobby"><header><Brand/><div><small>私人房間 · 房間碼</small><h1>{room.code}</h1></div><span className="room-pill">{room.players.length}/4 players</span></header><section className="lobby-intro"><p className="eyebrow">牌桌已準備就緒</p><h2>等齊，開枱。</h2><p>邀請朋友，或者由三隻 Bunny Bots 陪你試玩。</p></section><section className="seats">{seats.map((seat,i)=>{const player=room.players.find(p=>p.seat===seat);return <div className="seat" key={seat}>{profile(seat,player?.id===playerId?0:(i+3)%3+1)}<span className={player?.ready?'ready':'waiting'}>{player?player.ready?'READY':'WAITING':'EMPTY SEAT'}</span></div>})}</section><section className="actions"><button className="secondary" onClick={()=>call('room:leave',{},()=>{localStorage.removeItem('bunny-riichi-session');setRoom(null);setGame(null);setPlayerId('')})}>離開房間</button><button onClick={()=>call('room:ready',{ready:!me?.ready})}>{me?.ready?'取消準備':'準備'}</button>{me?.isHost&&room.players.length<4&&<button className="secondary" onClick={()=>call('room:fill-bots',{})}>加入電腦玩家</button>}{me?.isHost&&<button className="start" disabled={!room.canStart} onClick={()=>call('room:start',{})}>開始對局</button>}</section>{me?.isHost&&!room.canStart&&<p className="hint">Start unlocks when all four seats are filled and Ready.</p>}{error&&<p className="error" role="alert">{error}</p>}</main>;
 if(!game)return <main className="shell"><p>正在開始對局…</p></main>;
 const windLabel=(seat:Seat)=>seatLabel[seats[(seats.indexOf(seat)-seats.indexOf(game.hand.match.dealer)+4)%4]!];
 const canDraw=game.hand.actions.canDraw,canDiscard=game.hand.actions.canDiscard,riichiIds=new Set(game.hand.actions.riichiDiscardIds),myTurn=game.hand.currentSeat===game.you.seat,ended=room.match.finished||game.hand.phase==='won'||game.hand.phase==='exhaustive_draw'||game.hand.phase==='abortive_draw';
 const relativeSeats=Array.from({length:4},(_,i)=>seats[(seats.indexOf(game.you.seat)+i)%4]!);
 const drawnId=myTurn&&canDiscard&&!ended?game.you.drawnTileId:undefined;
 const faceOrder='1m 2m 3m 4m 5m 6m 7m 8m 9m 1p 2p 3p 4p 5p 6p 7p 8p 9p 1s 2s 3s 4s 5s 6s 7s 8s 9s E S W N P F C'.split(' ');
 const sorted=[...game.you.hand];if(options.autoSort)sorted.sort((a,b)=>faceOrder.indexOf(a.face)-faceOrder.indexOf(b.face)||a.id.localeCompare(b.id));if(drawnId){const i=sorted.findIndex(t=>t.id===drawnId);if(i>=0)sorted.push(...sorted.splice(i,1))}
 const characterMap=Object.fromEntries(relativeSeats.map((seat,i)=>[seat,(['yellow','king','ninja','wizard'] as Character[])[i]!])) as Record<Seat,Character>;
 const previews=previewId?game.hand.assistance?.riichi[previewId]:game.hand.assistance?.waits;
 const claim=game.hand.claim;const previewTiles=(faces:string[])=>{const pool=[...game.you.hand];return faces.map((face,i)=>{if(claim&&face===claim.tile.face&&!faces.slice(0,i).includes(face))return claim.tile;const j=pool.findIndex(t=>t.face===face);return j>=0?pool.splice(j,1)[0]!:{id:'preview-'+i,face,red:false};});};
 return <PhoneTable riichiReveal={riichiReveal} standalone game={game} pending={pending} options={options} onOptions={setOptions} call={call} error={error} sorted={sorted} riichiTiles={riichiTiles} yakuNames={yakuNames}/>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
