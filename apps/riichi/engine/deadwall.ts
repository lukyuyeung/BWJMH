import type { Tile, TileFace } from './tiles.js';

/** Standard Riichi dead wall: 14 tiles, including four rinshan draws and indicator slots. */
export interface DeadWallState {
  tiles: Tile[];
  rinshan: Tile[];
  doraIndicators: Tile[];
  uraIndicators: Tile[];
  revealedDoraCount: number;
}

export function createDeadWall(tiles: readonly Tile[]): DeadWallState {
  if (tiles.length !== 14) throw new Error(`Expected 14 dead-wall tiles, received ${tiles.length}`);
  const copy=[...tiles];
  // MVP logical layout. Physical table positions can be represented later without changing rules APIs.
  return {
    tiles: copy,
    rinshan: copy.slice(0,4),
    doraIndicators: copy.slice(4,9),
    uraIndicators: copy.slice(9,14),
    revealedDoraCount: 1,
  };
}

export function visibleDoraIndicators(dead: DeadWallState): Tile[] {
  return dead.doraIndicators.slice(0, dead.revealedDoraCount);
}

export function drawRinshan(dead: DeadWallState): Tile {
  const tile=dead.rinshan.shift();
  if(!tile) throw new Error('No Rinshan tiles remain.');
  return tile;
}

export function revealKanDora(dead: DeadWallState): void {
  if(dead.revealedDoraCount < dead.doraIndicators.length) dead.revealedDoraCount += 1;
}

export function doraFromIndicator(face: TileFace): TileFace {
  if(face.length===2){
    const rank=Number(face[0]); const suit=face[1];
    return `${rank===9?1:rank+1}${suit}` as TileFace;
  }
  const winds:TileFace[]=['E','S','W','N']; const dragons:TileFace[]=['P','F','C'];
  const group=winds.includes(face)?winds:dragons;
  const i=group.indexOf(face);
  return group[(i+1)%group.length]!;
}

export function countDora(tiles: readonly Tile[], indicators: readonly Tile[]): {indicatorDora:number;akaDora:number;total:number} {
  const doraFaces=indicators.map(x=>doraFromIndicator(x.face));
  const indicatorDora=tiles.reduce((n,t)=>n+doraFaces.filter(f=>f===t.face).length,0);
  const akaDora=tiles.filter(t=>t.red).length;
  return {indicatorDora,akaDora,total:indicatorDora+akaDora};
}

export function visibleUraIndicators(dead: DeadWallState): Tile[] {
  return dead.uraIndicators.slice(0, dead.revealedDoraCount);
}
