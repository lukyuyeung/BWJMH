/** In-process developer fixtures. Never imported by the production server. */
import {createStandardWall,createDeadWall,constructPhysicalWall,createHandState,dealInitialHands,SEATS,type Tile,type TileFace,type Seat,type Meld} from '@bunny/riichi-engine';
import {RoomManager,type Room} from '../src/room.js';
export const SCENARIOS=['chi','pon','daiminkan','ankan','kakan','riichi','riichi-ron','furiten','open-yaku','rinshan','exhaustive','ron','tsumo','chinitsu','kokushi','nine-terminals','timer','reconnect','mobile-result'] as const;
export type Scenario=typeof SCENARIOS[number];
/** Allocate REAL physical tiles once from a single 136-tile wall, including melds/discards.
 * No synthetic IDs, no duplicated tile copies and no phantom future wall tiles. */
export function installScenario(manager:RoomManager,room:Room,name:Scenario):void{
 if(process.env.NODE_ENV==='production')throw Error('Developer scenarios are disabled in production.');
 const pool=createStandardWall(room.rules.akaDora);
 const take=(text:string):Tile[]=>text.trim()?text.trim().split(/\s+/).map(f=>{const i=pool.findIndex(t=>t.face===f);if(i<0)throw Error('More than four copies: '+f);return pool.splice(i,1)[0]!;}):[];
 const h={} as Record<Seat,Tile[]>;const ms:Record<Seat,Meld[]>={east:[],south:[],west:[],north:[]};
 let current:Seat=name==='exhaustive'?'south':'east',claimFace:TileFace|undefined;
 if(['chi','pon','daiminkan','ron','furiten'].includes(name))current='north';
 const own:Partial<Record<Scenario,string>>={
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
 'mobile-result':'2m 3m 4m 3p 4p 5p 4s 5s 6s 6s 7s 8s 5p 5p',
 };
 if(name==='kakan'||name==='open-yaku'||name==='rinshan'){
  const tiles=take(name==='kakan'?'5m 5m 5m':name==='rinshan'?'P P P P':'P P P');ms.east.push({type:name==='rinshan'?'kan':'pon',tiles,calledTile:tiles[0]!,from:'north',open:true});
 }
 h.east=take(own[name]??(name==='exhaustive'?'1m 2m 4m 5m 7m 8m 1p 3p 5p 7p E S W':'1m 2m 4m 5m 7m 8m 1p 3p 5p 7p E S W N'));
 if(name==='riichi-ron')h.south=take('1p 3p 1s 2s 3s 7m 8m 9m P P P C C');
 if(current==='north'){
  claimFace=name==='chi'?'3m':name==='pon'||name==='daiminkan'?'P':'C';h.north=take(claimFace);
 }
 const rivers:Record<Seat,Tile[]>={east:[],south:[],west:[],north:[]};
 if(name==='furiten')rivers.east=take('C');
 // A late-seat draw has the previous seats' initial discards in public history.
 if(current==='north')for(const seat of ['east','south','west'] as const)if(!rivers[seat].length)rivers[seat]=pool.splice(pool.findIndex(t=>t.face.length===1&&t.face!==claimFace&&t.face!=='E'),1);
 for(const seat of SEATS){h[seat]??=[];const count=13-3*ms[seat].length+(seat===current?1:0);while(h[seat].length<count)h[seat].push(pool.shift()!);if(h[seat].length!==count)throw Error('Fixture hand size');}
 let extraDiscards:Tile[]=[];if(name==='exhaustive')extraDiscards=pool.splice(0,pool.length-14);
 for(let i=0;i<extraDiscards.length;i++)rivers[SEATS[i%4]!].push(extraDiscards[i]!);
 const dead=pool.splice(pool.length-14),live=[...pool];
 const physical=[...SEATS.flatMap(s=>h[s]),...SEATS.flatMap(s=>ms[s].flatMap(m=>m.tiles)),...SEATS.flatMap(s=>rivers[s]),...live,...dead];
 const g=createHandState(dealInitialHands(physical));g.hands=h;g.melds=ms;g.discards=rivers;g.discardedFaces=Object.fromEntries(SEATS.map(s=>[s,rivers[s].map(t=>t.face)])) as Record<Seat,TileFace[]>;g.liveWall=live;g.deadWall=createDeadWall(dead);g.physicalWall=constructPhysicalWall(physical,'east',[3,4]);g.currentSeat=current;g.lastDrawSeat=current;g.lastDrawSource=name==='rinshan'?'rinshan':'live';g.turnNumber=1+SEATS.reduce((n,s)=>n+rivers[s].length,0);g.abortiveEnabled=room.rules.abortiveDraws;if(name==='exhaustive')g.lastDrawWasLastLive=true;
 if(name==='rinshan'){g.deadWall.rinshan=g.deadWall.rinshan.slice(1);g.deadWall.revealedDoraCount=2;}
 g.kuikaeEnabled=true;g.postRiichiAnkanEnabled=true;g.doubleRiichiEnabled=true;g.firstTurnYakumanEnabled=false;room.game=g;room.settled=false;room.scores={east:25000,south:25000,west:25000,north:25000};room.riichiPot=0;delete room.awardedPot;room.handStartingScores={...room.scores};room.match={roundWind:'east',handNumber:1,dealer:'east',honba:0,handsPlayed:0,finished:false};room.handMatch={...room.match};room.events=[];delete room.pendingRiichi;delete room.cinematic;delete room.finalRanking;
 if(claimFace){const n=room.players.find(p=>p.seat==='north')!;manager.discard(room.code,n.id,h.north[0]!.id);for(const p of room.players.filter(p=>p.seat!=='east'))if(manager.getPlayerGameState(room.code,p.id).hand.actions.canPassClaim)manager.passClaim(room.code,p.id);}
 if(name==='mobile-result')manager.tsumo(room.code,room.players.find(p=>p.seat==='east')!.id);
 assertPhysical(room);
}
export function assertPhysical(room:Room):void{const g=room.game!;const all=[...Object.values(g.hands).flat(),...Object.values(g.melds).flatMap(ms=>ms.flatMap(m=>m.tiles)),...Object.values(g.discards).flat(),...g.liveWall,...g.deadWall.tiles];if(all.length!==136||new Set(all.map(t=>t.id)).size!==136)throw Error('Fixture physical IDs');const counts=new Map<string,number>();all.forEach(t=>counts.set(t.face,(counts.get(t.face)??0)+1));if(counts.size!==34||[...counts.values()].some(n=>n!==4))throw Error('Fixture face count');}
