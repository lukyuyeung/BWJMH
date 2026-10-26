import {createStandardWall,createDeadWall,createHandState,dealInitialHands,constructPhysicalWall,SEATS,type Tile,type Seat} from '@bunny/riichi-engine';
import type {Room,RoomManager} from './room.js';
export const DEMO_HANDS={pao:'P P P F F F C C C 2m 3m 4m 5p 5p','triple-yakuman':'E E E S S S W W W N N N P P',nagashi:'1m 2m 3m 2m 3m 4m 5m 6m 7m 6m 7m 8m 9m 9m','double-video':'1m 2m 3m 4m 5m 6m 2m 3m 4m 6m 7m 8m 9m 9m',mangan:'1m 2m 3m 2m 3m 4m 5m 6m 7m 6m 7m 8m 9m 9m',haneman:'1m 2m 3m 4m 5m 6m 7m 8m 9m P P P F F',baiman:'1m 2m 3m 2m 3m 4m 4m 5m 6m 7m 8m 9m 5m 5m',sanbaiman:'1m 2m 3m 1m 2m 3m 4m 5m 6m 7m 8m 9m 5m 5m',yakuman:'P P P F F F C C C 2m 3m 4m 5p 5p','double-yakuman':'E E E S S S W W W N N N 5p 5p',daisangen:'P P P F F F C C C 2m 3m 4m 5p 5p',suuankou:'2m 2m 2m 3p 3p 3p 4s 4s 4s 6s 6s 6s 5p 5p',daisuushi:'E E E S S S W W W N N N 5p 5p',kokushi:'1m 9m 1p 9p 1s 9s E S W N P F C C',chinitsu:'1m 2m 3m 1m 2m 3m 4m 5m 6m 7m 8m 9m 5m 5m'} as const;
export type DemoHand=keyof typeof DEMO_HANDS;
/** Standalone demo only: allocate a complete, unique 136-tile wall, then use the real win/settlement path. */
export function installDemoWin(manager:RoomManager,room:Room,playerId:string,kind:DemoHand){
 if(kind==='nagashi'){installNagashiDemo(manager,room,playerId);return;}
 if(kind==='double-video'){installDoubleVideo(manager,room,playerId);return;}
 if(!Object.hasOwn(DEMO_HANDS,kind))throw Error('未知示範牌型');
 const tierDemo=['mangan','haneman','baiman','sanbaiman','yakuman','double-yakuman'].includes(kind);
 const pool=createStandardWall(tierDemo?false:room.rules.akaDora),take=(face:string)=>{const i=pool.findIndex(t=>t.face===face);if(i<0)throw Error('示範牌數錯誤');return pool.splice(i,1)[0]!};
 const winner=room.players.find(p=>p.id===playerId)!.seat,hands={} as Record<Seat,Tile[]>;hands[winner]=DEMO_HANDS[kind].split(' ').map(take);
 const indicator=tierDemo?take('E'):undefined,ura=tierDemo?take('9s'):undefined;
 for(const seat of SEATS)if(seat!==winner)hands[seat]=pool.splice(0,13);
 const dead=tierDemo?[...pool.splice(-4),indicator!,...pool.splice(-4),ura!,...pool.splice(-4)]:pool.splice(-14),wall=[...SEATS.flatMap(s=>hands[s]),...pool,...dead],game=createHandState(dealInitialHands(wall,winner),winner,'E');
 game.hands=hands;game.liveWall=pool;game.deadWall=createDeadWall(dead);game.physicalWall=constructPhysicalWall(wall,winner,[3,4]);game.currentSeat=winner;game.lastDrawSeat=winner;game.lastDrawSource='live';game.firstTurnYakumanEnabled=false;game.turnNumber=12;if(kind==='mangan'){const tiles=game.hands[winner].splice(0,3);game.melds[winner].push({type:'chi',tiles,calledTile:tiles[0]!,from:'north',open:true});}
 if(kind==='pao'){for(let i=0;i<3;i++){const tiles=game.hands[winner].splice(0,3);game.melds[winner].push({type:'pon',tiles,calledTile:tiles[2]!,from:'north',open:true})}}
 if(['baiman','sanbaiman'].includes(kind)){game.riichi[winner].declared=true;game.riichi[winner].declarationTurn=1;}
 room.game=game;room.settled=false;room.scores={east:25000,south:25000,west:25000,north:25000};room.riichiPot=0;room.handStartingScores={...room.scores};room.match={roundWind:'east',handNumber:1,dealer:winner,honba:0,handsPlayed:0,finished:false};room.handMatch={...room.match};room.events=[];delete room.resultFlow;delete room.pendingClaims;delete room.pendingRiichi;delete room.cinematic;delete room.finalRanking;delete room.transfers;delete room.nagashi;delete room.drawPresentation;delete room.winSequence;
 if(game.riichi[winner].declared){room.scores[winner]-=1000;room.riichiPot=1000;}
 const settled=manager.tsumo(room.code,playerId);if(kind==='mangan')room.demoPresentation='mangan-art';else delete room.demoPresentation;
 if(tierDemo){delete settled.cinematic;delete settled.winSequence;}else if(settled.cinematic)settled.cinematic.demo=true;
}

export const DEMO_LABELS=[['pao','大三元 · 包牌支付'],['nagashi','流局滿貫 · 河牌演出'],['double-video','雙響 · 兩家清一色影片'],['triple-yakuman','三倍役滿 · 完整演出'],['mangan','滿貫'],['haneman','跳滿'],['baiman','倍滿'],['sanbaiman','三倍滿'],['yakuman','役滿'],['double-yakuman','雙倍役滿'],['daisangen','大三元 · 完整演出'],['suuankou','四暗刻 · 完整演出'],['daisuushi','大四喜 · 完整演出'],['chinitsu','清一色 · 完整演出'],['kokushi','國士無雙 · 無專屬影片']] as const;

function installDoubleVideo(manager:RoomManager,room:Room,playerId:string){
 const pool=createStandardWall(false),take=(face:string)=>{const i=pool.findIndex(t=>t.face===face);if(i<0)throw Error('Double demo tile exhausted');return pool.splice(i,1)[0]!};
 const first=room.players.find(p=>p.id===playerId)!.seat,second=SEATS[(SEATS.indexOf(first)+1)%4]!,discarder=SEATS[(SEATS.indexOf(first)+3)%4]!,other=SEATS.find(s=>s!==first&&s!==second&&s!==discarder)!,hands={} as Record<Seat,Tile[]>;
 for(const s of [first,second])hands[s]='1m 2m 3m 4m 5m 6m 2m 3m 4m 6m 7m 8m 9m'.split(' ').map(take);
 const tile=take('9m'),dead=pool.splice(-14);for(const s of [discarder,other])hands[s]=pool.splice(0,13);
 const wall=[...SEATS.flatMap(s=>hands[s]),tile,...pool,...dead],game=createHandState(dealInitialHands(wall,first),first,'E');
 game.hands=hands;game.liveWall=pool;game.deadWall=createDeadWall(dead);game.physicalWall=constructPhysicalWall(wall,first,[3,4]);game.melds={east:[],south:[],west:[],north:[]};game.discards[discarder]=[tile];game.discardedFaces[discarder]=[tile.face];game.phase='awaiting_claim';game.firstTurnYakumanEnabled=false;delete game.lastDrawSeat;
 game.claim={discarder,tile,passed:[],options:Object.fromEntries(SEATS.map(s=>[s,{ron:s===first||s===second,pon:false,kan:false,chiSequences:[]}])) as unknown as NonNullable<typeof game.claim>['options']};
 room.game=game;room.settled=false;room.scores={east:25000,south:25000,west:25000,north:25000};room.riichiPot=0;room.handStartingScores={...room.scores};room.match={roundWind:'east',handNumber:1,dealer:first,honba:0,handsPlayed:0,finished:false};room.handMatch={...room.match};room.events=[];
 for(const key of ['resultFlow','pendingClaims','pendingRiichi','cinematic','winSequence','nagashi','transfers','drawPresentation','finalRanking'] as const)delete room[key];
 manager.ron(room.code,room.players.find(p=>p.seat===second)!.id);manager.ron(room.code,playerId);
}

function installNagashiDemo(manager:RoomManager,room:Room,playerId:string){
 const winner=room.players.find(p=>p.id===playerId)!.seat,pool=createStandardWall(false),take=(face:string)=>{const i=pool.findIndex(t=>t.face===face);if(i<0)throw Error('Nagashi demo exhausted');return pool.splice(i,1)[0]!},river='1m 1m 1m 1m 9m 9m 9m 9m 1p 1p 1p 1p 9p 9p 9p 9p E'.split(' ').map(take),others=SEATS.filter(s=>s!==winner),rivers={} as Record<Seat,Tile[]>;
 rivers[winner]=river;for(const s of others)rivers[s]=[take('2s')];
 const hands=Object.fromEntries(SEATS.map(s=>[s,pool.splice(0,13)])) as Record<Seat,Tile[]>,dead=pool.splice(-14);
 let i=0;while(pool.length)rivers[others[i++%3]!].push(pool.shift()!);
 const wall=[...SEATS.flatMap(s=>hands[s]),...SEATS.flatMap(s=>rivers[s]),...dead],game=createHandState(dealInitialHands(wall,winner),winner,'E');game.hands=hands;game.discards=rivers;game.discardedFaces=Object.fromEntries(SEATS.map(s=>[s,rivers[s].map(t=>t.face)])) as typeof game.discardedFaces;game.liveWall=[];game.deadWall=createDeadWall(dead);game.physicalWall=constructPhysicalWall(wall,winner,[3,4]);game.phase='exhaustive_draw';game.turnNumber=71;delete game.lastDrawSeat;
 room.game=game;room.settled=false;room.scores={east:25000,south:25000,west:25000,north:25000};room.riichiPot=0;room.handStartingScores={...room.scores};room.match={roundWind:'east',handNumber:1,dealer:winner,honba:0,handsPlayed:0,finished:false};room.handMatch={...room.match};room.events=[];
 for(const key of ['resultFlow','pendingClaims','pendingRiichi','cinematic','winSequence','nagashi','transfers','drawPresentation','finalRanking'] as const)delete room[key];
 manager.settleCompletedDraw(room.code);
}
