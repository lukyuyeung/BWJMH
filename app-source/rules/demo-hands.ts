import {createStandardWall,createDeadWall,createHandState,dealInitialHands,constructPhysicalWall,SEATS,type Tile,type Seat} from '@bunny/riichi-engine';
import type {Room,RoomManager} from './room.js';
export const DEMO_HANDS={mangan:'2m 3m 4m 2m 3m 4m 3p 4p 5p 6s 6s 6s 7p 7p',haneman:'1m 2m 3m 4m 5m 6m 7m 8m 9m P P P F F',baiman:'1m 2m 3m 2m 3m 4m 4m 5m 6m 7m 8m 9m 5m 5m',sanbaiman:'1m 2m 3m 1m 2m 3m 4m 5m 6m 7m 8m 9m 5m 5m',yakuman:'P P P F F F C C C 2m 3m 4m 5p 5p','double-yakuman':'E E E S S S W W W N N N 5p 5p',daisangen:'P P P F F F C C C 2m 3m 4m 5p 5p',suuankou:'2m 2m 2m 3p 3p 3p 4s 4s 4s 6s 6s 6s 5p 5p',daisuushi:'E E E S S S W W W N N N 5p 5p',kokushi:'1m 9m 1p 9p 1s 9s E S W N P F C C',chinitsu:'1m 2m 3m 1m 2m 3m 4m 5m 6m 7m 8m 9m 5m 5m'} as const;
export type DemoHand=keyof typeof DEMO_HANDS;
/** Standalone demo only: allocate a complete, unique 136-tile wall, then use the real win/settlement path. */
export function installDemoWin(manager:RoomManager,room:Room,playerId:string,kind:DemoHand){
 if(!Object.hasOwn(DEMO_HANDS,kind))throw Error('未知示範牌型');
 const tierDemo=['mangan','haneman','baiman','sanbaiman','yakuman','double-yakuman'].includes(kind);
 const pool=createStandardWall(tierDemo?false:room.rules.akaDora),take=(face:string)=>{const i=pool.findIndex(t=>t.face===face);if(i<0)throw Error('示範牌數錯誤');return pool.splice(i,1)[0]!};
 const winner=room.players.find(p=>p.id===playerId)!.seat,hands={} as Record<Seat,Tile[]>;hands[winner]=DEMO_HANDS[kind].split(' ').map(take);
 const indicator=tierDemo?take('E'):undefined,ura=tierDemo?take('9s'):undefined;
 for(const seat of SEATS)if(seat!==winner)hands[seat]=pool.splice(0,13);
 const dead=tierDemo?[...pool.splice(-4),indicator!,...pool.splice(-4),ura!,...pool.splice(-4)]:pool.splice(-14),wall=[...SEATS.flatMap(s=>hands[s]),...pool,...dead],game=createHandState(dealInitialHands(wall,winner),winner,'E');
 game.hands=hands;game.liveWall=pool;game.deadWall=createDeadWall(dead);game.physicalWall=constructPhysicalWall(wall,winner,[3,4]);game.currentSeat=winner;game.lastDrawSeat=winner;game.lastDrawSource='live';game.firstTurnYakumanEnabled=false;game.turnNumber=12;if(['mangan','baiman','sanbaiman'].includes(kind)){game.riichi[winner].declared=true;game.riichi[winner].declarationTurn=1;if(kind==='mangan')game.riichi[winner].ippatsuEligible=true;}
 room.game=game;room.settled=false;room.scores={east:25000,south:25000,west:25000,north:25000};room.riichiPot=0;room.handStartingScores={...room.scores};room.match={roundWind:'east',handNumber:1,dealer:winner,honba:0,handsPlayed:0,finished:false};room.handMatch={...room.match};room.events=[];delete room.resultFlow;delete room.pendingClaims;delete room.pendingRiichi;delete room.cinematic;delete room.finalRanking;
 if(game.riichi[winner].declared){room.scores[winner]-=1000;room.riichiPot=1000;}
 const settled=manager.tsumo(room.code,playerId);if(tierDemo)delete settled.cinematic;else if(settled.cinematic)settled.cinematic.demo=true;
}

export const DEMO_LABELS=[['mangan','滿貫'],['haneman','跳滿'],['baiman','倍滿'],['sanbaiman','三倍滿'],['yakuman','役滿'],['double-yakuman','雙倍役滿'],['daisangen','大三元 · 完整演出'],['suuankou','四暗刻 · 完整演出'],['daisuushi','大四喜 · 完整演出'],['chinitsu','清一色 · 完整演出'],['kokushi','國士無雙 · 無專屬影片']] as const;
