import {TABLE_SIZE,TABLE_TILE} from './table-metrics.js';
/** Felt coordinates (+u right, +v towards local player). Rivers grow away from
 * the center; their first row never moves as another row is added. */
export const RIVER_COLUMNS=6;
export const RIVER_ROWS=4;
export const RIVER_HALF_WIDTH=(RIVER_COLUMNS*TABLE_TILE.width+(RIVER_COLUMNS-1)*4)/2;
export const RIVER_INNER_EDGE=RIVER_HALF_WIDTH+6;
export const RIICHI_DISTANCE=RIVER_INNER_EDGE-116;
export function riichiStickPose(relative:number){
 const c=TABLE_SIZE/2,d=RIICHI_DISTANCE;
 const points=[[c,c+d],[c+d,c],[c,c-d],[c-d,c]];
 const [u,v]=points[relative]??points[0]!;
 return{u:u!,v:v!,yaw:[0,Math.PI/2,Math.PI,-Math.PI/2][relative]??0};
}
