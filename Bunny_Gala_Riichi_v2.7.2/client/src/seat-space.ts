/** +X table right, +Y away, +Z above felt. Common tile size; only poses differ. */
export function seatYaw(relative:number):number{return [0,Math.PI/2,Math.PI,-Math.PI/2][relative]??0;}
export function uprightPose(relative:number,height:number,tableZ=0){return{yaw:seatYaw(relative),pitch:Math.PI/2,centerZ:tableZ+height/2,up:[0,0,1] as const,bottomZ:tableZ};}
/** Slightly lean the local rack towards the table for readable faces at 60°.
 * Include the rotated thickness when grounding the model's lowest corner. */
export function localHandPose(height:number,depth:number){
 const pitch=75*Math.PI/180;
 return{yaw:0,pitch,centerZ:(height*Math.sin(pitch)+depth*Math.cos(pitch))/2,bottomZ:0};
}
