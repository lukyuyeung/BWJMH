/** World axes: +X table right, +Y table away, +Z perpendicular above felt.
 * Seat 0 is local. Seat turns change yaw only; standing tile local +Y is world +Z.
 * Flat wall/river/meld local +Z is world +Z. Bottom pivot is always on felt. */
export function seatYaw(relative:number):number{return [0,Math.PI/2,Math.PI,-Math.PI/2][relative]??0;}
export function uprightPose(relative:number,height:number,tableZ=0){return{yaw:seatYaw(relative),pitch:Math.PI/2,centerZ:tableZ+height/2,up:[0,0,1] as const,bottomZ:tableZ};}
