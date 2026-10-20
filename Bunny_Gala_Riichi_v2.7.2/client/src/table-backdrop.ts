/** The approved V11 plate already contains the chairs and rabbits. */
export const TABLE_BACKDROP='/art/empty-plate.png';
export function backdropTransform(height:number){const x=1536/1850,y=height/850;return{css:`scale(${x},${y})`,point(a:number,b:number){return{x:a*x,y:b*y}}};}
