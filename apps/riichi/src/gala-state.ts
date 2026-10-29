import {calledPosition} from './gameplay.js';
type Seat='east'|'south'|'west'|'north';
type Tile={id:string;face:string;red:boolean};
export type GalaGame={room:{code:string};you:{seat:Seat};hand:{revision:number;
 match:{roundWind:string;handNumber:number;honba:number;dealer:Seat};
 concealedCounts:Record<Seat,number>;wallSlots:{side:Seat;stack:number;level:0|1;occupied:boolean;dead:boolean;indicator?:Tile}[];
 discards:Record<Seat,Tile[]>;melds:Record<Seat,{type:string;open?:boolean;tiles:Tile[];calledTile:Tile;from:Seat}[]>;
 claim?:{tile:Tile}|undefined;
 opening?:{startedAt:number;dice:[number,number];breakSide:Seat;breakStack:number;dealer:Seat;dealSlots:number[]};
 events?:{id:number;kind:string;seat:string}[];
}};

export function galaSnapshot(game:GalaGame,reduce:boolean,motion:boolean,riichiTiles:Partial<Record<Seat,string>>){
  const seats=['east','south','west','north'] as const,start=seats.indexOf(game.you.seat);
  const handKey=[game.room.code,game.hand.match.roundWind,game.hand.match.handNumber,game.hand.match.honba,game.hand.match.dealer].join(':');
  return {handKey,ownSeatIndex:start,opening:game.hand.opening,events:(game.hand.events??[]).map(e=>({...e,relative:(seats.indexOf(e.seat as Seat)-start+4)%4})),revision:game.hand.revision,reduce,motion,lastDiscard:game.hand.claim?.tile.id,
   seats:Array.from({length:4},(_,i)=>{
    const seat=seats[(start+i)%4]!;
    return {concealed:game.hand.concealedCounts[seat],wall:game.hand.wallSlots.filter(s=>s.side===seat),
     discards:game.hand.discards[seat].map(t=>({...t,sideways:riichiTiles[seat]===t.id})),melds:game.hand.melds[seat].map(m=>{
      const closed=!m.open,added=m.type==='kan'&&!closed&&m.tiles.findIndex(t=>t.id===m.calledTile.id)<3;
      const main=added?m.tiles.slice(0,3):m.tiles,ordered=main.filter(t=>t.id!==m.calledTile.id);
      if(!closed)ordered.splice(calledPosition(seat,m.from)===2?ordered.length:calledPosition(seat,m.from),0,m.calledTile);
      return {type:closed?'ankan':added?'kakan':m.type,tiles:closed?main:ordered,calledId:m.calledTile.id,addedTile:added?m.tiles[3]:undefined};
     })};
   })};
}
