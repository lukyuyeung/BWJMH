/** Approved lacquer artwork. Tile identity/red status always come from game data. */
const sources={m:'/art/tiles/characters-atlas.png',p:'/art/tiles/circles-atlas.png',s:'/art/tiles/bamboo-atlas.png',honors:'/art/tiles/honors-red-atlas.png',peacock:'/art/tiles/peacock-1s.png'} as const;
type Source=keyof typeof sources;
const images=new Map<Source,HTMLImageElement>();
let loading:Promise<void>|undefined;
export function loadTileArt(){return loading??=Promise.all(Object.entries(sources).map(async([key,url])=>{const img=new Image();img.src=url;await img.decode();images.set(key as Source,img);})).then(()=>{});}
export function tileArtRegion(face:string,red=false){
 if(face==='1s')return{source:'peacock' as Source,columns:1,rows:1,column:0,row:0,insetX:0};
 if(red&&/^5[mps]$/.test(face))return{source:'honors' as Source,columns:5,rows:2,column:2+'mps'.indexOf(face[1]!),row:1,insetX:0};
 const honors=['E','S','W','N','P','F','C'],honor=honors.indexOf(face);
 if(honor>=0)return{source:'honors' as Source,columns:5,rows:2,column:honor<5?honor:honor-5,row:honor<5?0:1,insetX:0};
 if(!/^[1-9][mps]$/.test(face))throw new Error('Unknown tile artwork '+face);
 const rank=Number(face[0])-1;
 // Narrow the second bamboo cell to keep the adjacent peacock outside its UVs.
 return{source:face[1] as Source,columns:3,rows:3,column:rank%3,row:Math.floor(rank/3),insetX:face==='2s'?.16:0};
}
export function tileArtStyle(face:string,red=false){
 const r=tileArtRegion(face,red),scale=1-2*r.insetX;
 if(r.source==='peacock')return{backgroundImage:`url("${sources.peacock}")`,backgroundSize:'86% 88%',backgroundPosition:'50% 50%'};
 return{backgroundImage:`url("${sources[r.source]}")`,backgroundSize:`${r.columns*100/scale}% ${r.rows*100}%`,backgroundPosition:`${r.columns===1?50:r.column/(r.columns-1)*100}% ${r.rows===1?50:r.row/(r.rows-1)*100}%`};
}
const faces=new Map<string,HTMLCanvasElement>();
export function tileFaceCanvas(face:string,red=false){
 const key=face+':'+red;if(faces.has(key))return faces.get(key)!;
 const r=tileArtRegion(face,red),img=images.get(r.source);if(!img)throw new Error('Tile artwork not loaded');
 const canvas=document.createElement('canvas');canvas.width=352;canvas.height=480;
 const ctx=canvas.getContext('2d')!;ctx.fillStyle='#fff3d9';ctx.fillRect(0,0,352,480);
 if(r.source==='peacock'){ctx.drawImage(img,25,28,302,424);}
 else{const w=img.naturalWidth/r.columns,h=img.naturalHeight/r.rows;ctx.drawImage(img,(r.column+r.insetX)*w,r.row*h,w*(1-2*r.insetX),h,8,8,336,464);}
 faces.set(key,canvas);return canvas;
}
