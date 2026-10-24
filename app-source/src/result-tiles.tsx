import React from 'react';
import type {Game,Seat,Tile} from './main.js';
import {calledPosition} from './gameplay.js';
import {completeTileUrl} from './approved-tile-art.js';
const order=['m','p','s'];
export function sortResultTiles(tiles:Tile[]){const rank=(t:Tile)=>/^[1-9][mps]$/.test(t.face)?order.indexOf(t.face[1]!)*9+Number(t.face[0])-1:27+['E','S','W','N','P','F','C'].indexOf(t.face);return [...tiles].sort((a,b)=>rank(a)-rank(b)||Number(b.red)-Number(a.red))}
export function ResultTile({tile,back=false,delay=0}:{tile:Tile;back?:boolean;delay?:number}){return <span className="result-art-tile" style={{'--tile-delay':delay+'ms'} as React.CSSProperties} data-face={tile.face} data-tile-id={tile.id} data-red={tile.red||undefined}><img src={back?'/art/tiles/complete/back.svg':completeTileUrl(tile.face,!!tile.red)} alt={back?'牌背':tile.face} draggable={false}/></span>}
export function ResultMeld({meld,seat,delay=0}:{delay?:number;meld:Game['hand']['melds'][Seat][number];seat:Seat}){
 const closed=!meld.open,added=meld.type==='kan'&&!closed&&meld.tiles.findIndex(t=>t.id===meld.calledTile.id)<3,main=added?meld.tiles.slice(0,3):meld.tiles;
 const ordered=main.filter(t=>t.id!==meld.calledTile.id);if(!closed)ordered.splice(calledPosition(seat,meld.from)===2?ordered.length:calledPosition(seat,meld.from),0,meld.calledTile);
 return <div className="result-art-meld" data-type={closed?'ankan':added?'kakan':meld.type}>{(closed?main:ordered).map((tile,i)=>{const sideways=!closed&&tile.id===meld.calledTile.id;return <span className={'result-art-slot'+(sideways?' result-sideways':'')+(added&&sideways?' result-stacked':'')} key={tile.id}><ResultTile tile={tile} delay={delay+i*35} back={closed&&(i===1||i===2)}/>{added&&sideways&&<span className="result-added-kan"><ResultTile tile={meld.tiles[3]!} delay={delay+105}/></span>}</span>})}</div>
}
