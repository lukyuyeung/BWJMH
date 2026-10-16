import {TABLE_SIZE} from './table-metrics.js';
import {feltScreenPoint} from './felt-projection.js';
/** Four felt corners measured in the retained-design 1850×850 empty plate. */
const source=[[595,130],[1250,130],[1350,744],[500,744]] as const;
export const TABLE_BACKDROP='/art/gala-table-60-empty.png';
export function backdropTransform(height:number){
 const n=TABLE_SIZE,target=[[0,0],[n,0],[n,n],[0,n]].map(([u,v])=>feltScreenPoint(u!,v!,0,height));
 const rows:number[][]=[];
 for(let i=0;i<4;i++){const [x,y]=source[i]!,p=target[i]!;rows.push([x,y,1,0,0,0,-p.x*x,-p.x*y,p.x],[0,0,0,x,y,1,-p.y*x,-p.y*y,p.y]);}
 for(let col=0;col<8;col++){let pivot=col;for(let j=col+1;j<8;j++)if(Math.abs(rows[j]![col]!)>Math.abs(rows[pivot]![col]!))pivot=j;[rows[col],rows[pivot]]=[rows[pivot]!,rows[col]!];const divisor=rows[col]![col]!;for(let k=col;k<9;k++)rows[col]![k]!/=divisor;for(let j=0;j<8;j++)if(j!==col){const f=rows[j]![col]!;for(let k=col;k<9;k++)rows[j]![k]!-=f*rows[col]![k]!;}}
 const [a,b,c,d,e,f,g,h]=rows.map(row=>row[8]!);
 return{css:`matrix3d(${a},${d},0,${g},${b},${e},0,${h},0,0,1,0,${c},${f},0,1)`,point(x:number,y:number){const q=1+g!*x+h!*y;return{x:(a!*x+b!*y+c!)/q,y:(d!*x+e!*y+f!)/q};}};
}
