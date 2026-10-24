/** In-process developer fixtures. Never imported by the production server. */
import {createStandardWall,createDeadWall,constructPhysicalWall,createHandState,dealInitialHands,SEATS,type Tile,type TileFace,type Seat,type Meld} from '@bunny/riichi-engine';
import {RoomManager,type Room} from '../rules/room.js';
export const SCENARIOS=['right-draw','draw-reveal','dora-shine','chi','pon','daiminkan','ankan','kakan','riichi','riichi-ron','furiten','open-yaku','rinshan','exhaustive','ron','tsumo','chinitsu','kokushi','nine-terminals','timer','reconnect','mobile-result','final-ranking','table-layout','meld-layout','riichi-draw','riichi-winning-draw','result-four-melds','result-kakan','result-closed-kan','inspect-idle','result-rank-rise','ninja-seven-pairs'] as const;
export type Scenario=typeof SCENARIOS[number];
/** Allocate REAL physical tiles once from a single 136-tile wall, including melds/discards.
 * No synthetic IDs, no duplicated tile copies and no phantom future wall tiles. */
export function installScenario(manager:RoomManager,room:Room,name:Scenario):void{

 const rankRise=name==='result-rank-rise';if(rankRise)name='mobile-result';
 const finishResult=['result-four-melds','result-kakan','result-closed-kan'].includes(name);if(name==='result-four-melds')name='meld-layout';
 const pool=createStandardWall(room.rules.akaDora);
 const take=(text:string):Tile[]=>text.trim()?text.trim().split(/\s+/).map(f=>{const i=pool.findIndex(t=>t.face===f);if(i<0)throw Error('More than four copies: '+f);return pool.splice(i,1)[0]!;}):[];
 const h={} as Record<Seat,Tile[]>;const ms:Record<Seat,Meld[]>={east:[],south:[],west:[],north:[]};
 let current:Seat=name==='ninja-seven-pairs'?'south':name==='exhaustive'||name==='inspect-idle'||name==='right-draw'?'south':'east',claimFace:TileFace|undefined;
 if(['chi','pon','daiminkan','ron','furiten'].includes(name))current='north';
 if(name==='meld-layout'){for(const [seat,groups] of Object.entries({east:['1m 2m 3m','4m 5m 6m','7m 8m 9m','P P P P'],south:['1p 2p 3p','4p 5p 6p'],west:['7p 8p 9p','1s 2s 3s'],north:['4s 5s 6s','7s 8s 9s']})){for(const text of groups){const tiles=take(text);ms[seat as Seat].push({type:tiles.length===4?'kan':'chi',tiles,calledTile:tiles[0]!,from:seat==='east'?'north':'east',open:true})}}}
 if(name==='result-kakan'){for(const [text,added] of [['5m 5m 5m 5m',true],['P P P P',false]] as const){const tiles=take(text);ms.east.push({type:'kan',tiles,calledTile:tiles[added?0:3]!,from:'north',open:true})}}
 if(name==='result-closed-kan'){const tiles=take('P P P P');ms.east.push({type:'kan',tiles,calledTile:tiles[0]!,from:'east',open:false})}
 const own:Partial<Record<Scenario,string>>={
 'ninja-seven-pairs':'2m 4m 6m 8m 2p 4p 6p 8p S W N P F',
 'draw-reveal':'1m 2m 4m 5m 7m 8m 1p 3p 5p 7p E S W N',
 'dora-shine':'2m 2m 3m 4m 5m 6m 7m 8m 9m 1p 2p 3p E E',
 'right-draw':'1m 2m 4m 5m 7m 8m 1p 3p 5p 7p E S W',
 'inspect-idle':'1m 2m 4m 5m 7m 8m 1p 3p 5p 7p E S W',
 'result-kakan':'2m 3m 4m 6p 7p 8p E E',
 'result-closed-kan':'2m 3m 4m 3p 4p 5p 6s 7s 8s E E',
 'meld-layout':'E E',
 'riichi-draw':'1m 2m 3m 4p 5p 6p 7s 8s 9s E E E C 2p',
 'riichi-winning-draw':'1m 2m 3m 4p 5p 6p 7s 8s 9s E E E C C',
 chi:'2m 4m 5m 6m 6p 7p 8p 2s 3s 4s 6s 7s 8s',
 pon:'P P 2m 3m 4m 3p 4p 5p 6s 7s 8s E S',
 daiminkan:'P P P 2m 3m 4m 3p 4p 5p 6s 7s E S',
 ankan:'2m 2m 2m 2m 4p 5p 6p 7s 8s 9s E E C C',
 kakan:'5m 1p 2p 3p 4p 5p 6p 7s 8s 9s E',
 'riichi-ron':'1m 2m 3m 4p 5p 6p 7s 8s 9s E E E C 2p',
 riichi:'1m 2m 3m 4p 5p 6p 7s 8s 9s E E E C 2p',
 ron:'1m 2m 3m 4p 5p 6p 7s 8s 9s E E E C',
 furiten:'1m 2m 3m 4p 5p 6p 7s 8s 9s E E E C',
 tsumo:'2m 3m 4m 3p 4p 5p 4s 5s 6s 6s 7s 8s 5p 5p',
 chinitsu:'1m 2m 3m 1m 2m 3m 4m 5m 6m 7m 8m 9m 5m 5m',
 kokushi:'1m 9m 1p 9p 1s 9s E S W N P F C C',
 'nine-terminals':'1m 9m 1p 9p 1s 9s E S W N P F C 2p',
 'open-yaku':'2m 3m 4m 3p 4p 5p 6s 7s 8s E E',
 rinshan:'2m 3m 4m 3p 4p 5p 6s 7s 8s E E',
 'final-ranking':'2m 3m 4m 3p 4p 5p 4s 5s 6s 6s 7s 8s 5p 5p',
 'mobile-result':'2m 3m 4m 3p 4p 5p 4s 5s 6s 6s 7s 8s 5p 5p',
 };
 if(name==='kakan'||name==='open-yaku'||name==='rinshan'){
  const tiles=take(name==='kakan'?'5m 5m 5m':name==='rinshan'?'P P P P':'P P P');ms.east.push({type:name==='rinshan'?'kan':'pon',tiles,calledTile:tiles[0]!,from:'north',open:true});
 }
 const reservedDora=name==='dora-shine'?take('1m')[0]:undefined;
 h.east=take(own[name]??(name==='exhaustive'?'1m 2m 4m 5m 7m 8m 1p 3p 5p 7p E S W':'1m 2m 4m 5m 7m 8m 1p 3p 5p 7p E S W N'));
 if(name==='draw-reveal'){h.south=take('1s 2s 3s 4s 5s 6s 7s 8s 9s P P P C');h.west=take('2m 4m 6m 8m 2p 4p 6p 8p E S W N F');h.north=take('3m 5m 7m 9m 3p 5p 7p 9p E S W N F')}
 if(name==='ninja-seven-pairs')h.south=take('1m 1m 3m 3m 5p 5p 7p 7p 2s 2s 8s 8s E E');
 if(name==='riichi-ron')h.south=take('1p 3p 1s 2s 3s 7m 8m 9m P P P C C');
 if(current==='north'){
  claimFace=name==='chi'?'3m':name==='pon'||name==='daiminkan'?'P':'C';h.north=take(claimFace);
 }
 const rivers:Record<Seat,Tile[]>={east:[],south:[],west:[],north:[]};
 if(name==='furiten')rivers.east=take('C');
 if(name==='inspect-idle')for(const seat of ['east','south','west'] as const)rivers[seat]=take('1m');
 // A late-seat draw has the previous seats' initial discards in public history.
 if(current==='north')for(const seat of ['east','south','west'] as const)if(!rivers[seat].length)rivers[seat]=pool.splice(pool.findIndex(t=>t.face.length===1&&t.face!==claimFace&&t.face!=='E'),1);
 for(const seat of SEATS){h[seat]??=[];const count=13-3*ms[seat].length+(seat===current&&name!=='right-draw'?1:0);while(h[seat].length<count)h[seat].push(pool.shift()!);if(h[seat].length!==count)throw Error('Fixture hand size');}
 let extraDiscards:Tile[]=[];if(name==='table-layout')extraDiscards=pool.splice(0,32);if(name==='exhaustive'||name==='draw-reveal')extraDiscards=pool.splice(0,pool.length-14);
 for(let i=0;i<extraDiscards.length;i++)rivers[SEATS[i%4]!].push(extraDiscards[i]!);
 const dead=pool.splice(pool.length-(reservedDora?13:14));if(reservedDora)dead.splice(4,0,reservedDora);const live=[...pool];
 const physical=[...SEATS.flatMap(s=>h[s]),...SEATS.flatMap(s=>ms[s].flatMap(m=>m.tiles)),...SEATS.flatMap(s=>rivers[s]),...live,...dead];
 const g=createHandState(dealInitialHands(physical));g.hands=h;g.melds=ms;g.discards=rivers;g.discardedFaces=Object.fromEntries(SEATS.map(s=>[s,rivers[s].map(t=>t.face)])) as Record<Seat,TileFace[]>;g.liveWall=live;g.deadWall=createDeadWall(dead);g.physicalWall=constructPhysicalWall(physical,'east',[3,4]);g.currentSeat=current;if(name==='right-draw')g.phase='awaiting_draw';g.lastDrawSeat=current;g.lastDrawSource=name==='rinshan'?'rinshan':'live';g.turnNumber=1+SEATS.reduce((n,s)=>n+rivers[s].length,0);g.abortiveEnabled=room.rules.abortiveDraws;if(name==='exhaustive')g.lastDrawWasLastLive=true;
 if(name==='riichi-draw'||name==='riichi-winning-draw'){g.riichi.east.declared=true;g.riichi.east.declarationTurn=0;}
 if(name==='rinshan'){g.deadWall.rinshan=g.deadWall.rinshan.slice(1);g.deadWall.revealedDoraCount=2;}
 if(name==='ninja-seven-pairs'){g.riichi.south.declared=true;g.riichi.south.declarationTurn=0;}
 g.kuikaeEnabled=true;g.postRiichiAnkanEnabled=true;g.doubleRiichiEnabled=true;g.firstTurnYakumanEnabled=false;room.game=g;room.settled=false;room.scores={east:25000,south:25000,west:25000,north:25000};room.riichiPot=0;delete room.awardedPot;room.handStartingScores={...room.scores};room.match={roundWind:'east',handNumber:1,dealer:'east',honba:0,handsPlayed:0,finished:false};room.handMatch={...room.match};room.events=[];delete room.pendingRiichi;delete room.cinematic;delete room.finalRanking;
 if(claimFace){const n=room.players.find(p=>p.seat==='north')!;manager.discard(room.code,n.id,h.north[0]!.id);for(const p of room.players.filter(p=>p.seat!=='east'))if(manager.getPlayerGameState(room.code,p.id).hand.actions.canPassClaim)manager.passClaim(room.code,p.id);}
 if(rankRise){room.scores={east:18000,south:32000,west:27000,north:23000};room.handStartingScores={...room.scores}}
 if(finishResult||name==='mobile-result'||name==='final-ranking')manager.tsumo(room.code,room.players.find(p=>p.seat==='east')!.id);
 if(name==='ninja-seven-pairs')manager.tsumo(room.code,room.players.find(p=>p.seat==='south')!.id);
 if(name==='final-ranking'){room.match.finished=true;room.finalRanking=[...SEATS].sort((a,b)=>room.scores[b]-room.scores[a]||SEATS.indexOf(a)-SEATS.indexOf(b));}
 if(name==='draw-reveal'){manager.discard(room.code,room.players.find(p=>p.seat==='east')!.id,h.east.at(-1)!.id);for(const p of room.players)if(manager.getPlayerGameState(room.code,p.id).hand.actions.canPassClaim)manager.passClaim(room.code,p.id);if(!room.settled||room.game!.phase!=='exhaustive_draw')throw Error('Exhaustive fixture did not settle')}
 assertPhysical(room);
}
export function assertPhysical(room:Room):void{const g=room.game!;const all=[...Object.values(g.hands).flat(),...Object.values(g.melds).flatMap(ms=>ms.flatMap(m=>m.tiles)),...Object.values(g.discards).flat(),...g.liveWall,...g.deadWall.tiles];if(all.length!==136||new Set(all.map(t=>t.id)).size!==136)throw Error('Fixture physical IDs');const counts=new Map<string,number>();all.forEach(t=>counts.set(t.face,(counts.get(t.face)??0)+1));if(counts.size!==34||[...counts.values()].some(n=>n!==4))throw Error('Fixture face count');}
