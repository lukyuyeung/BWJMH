import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {createCarrot} from '/src/table-scene.ts';
const W=3600,H=1654,N=3000,D=56,tw=88,tl=120;
await document.fonts.load('700 100px "LXGW WenKai TC"','二萬一三四五六七八九東中');
await document.fonts.load('400 30px "Noto Sans TC"','玩家手牌牌山河立直棒預留層幢對上下一轉格容量厚度');
const geo=new RoundedBoxGeometry(tw,tl,D,2,6), baseGeo=new RoundedBoxGeometry(tw+.2,tl+.2,7,2,5),seamGeo=new RoundedBoxGeometry(tw+.3,tl+.3,1,2,5);
const ivory=new T.MeshStandardMaterial({color:'#fff3db',roughness:.68}),black=new T.MeshStandardMaterial({color:'#111111',roughness:.6}),gold=new T.MeshStandardMaterial({color:'#bb9352',metalness:.45,roughness:.5});
function canvasTexture(draw){const c=document.createElement('canvas');c.width=264;c.height=360;draw(c.getContext('2d'));const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;return tx;}
const faceCache=new Map();function front(face='2m',ghost=false){const key=face+ghost;if(faceCache.has(key))return faceCache.get(key);const tx=canvasTexture(c=>{c.fillStyle='#fff7e6';c.fillRect(0,0,264,360);c.textAlign='center';c.textBaseline='middle';c.font='700 126px "LXGW WenKai TC"';if(face.endsWith('m')){c.fillStyle='#27211d';c.fillText('一二三四五六七八九'[Number(face[0])-1],132,99);c.fillStyle='#ac2025';c.font='700 145px "LXGW WenKai TC"';c.fillText('萬',132,255);}else if(face==='E'||face==='C'){c.fillStyle=face==='C'?'#a31c22':'#24211c';c.font='700 220px "LXGW WenKai TC"';c.fillText(face==='E'?'東':'中',132,192);}else{const n=Number(face[0]);c.strokeStyle='#1f5446';c.lineWidth=10;for(let i=0;i<n;i++){c.beginPath();c.arc(132,85+i*86,24,0,Math.PI*2);c.stroke();}}});const m=new T.MeshBasicMaterial({map:tx,toneMapped:false,transparent:ghost,opacity:ghost?.31:1,depthWrite:!ghost});faceCache.set(key,m);return m;}
const backs=new Map();function back(index){const key=index??'';if(backs.has(key))return backs.get(key);const tx=canvasTexture(c=>{c.fillStyle='#121110';c.fillRect(0,0,264,360);c.strokeStyle='#c29c5d';c.lineWidth=5;c.beginPath();c.roundRect(9,9,246,342,20);c.stroke();if(index!==undefined){c.font='70px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#ddc18b';c.fillText(String(index).padStart(2,'0'),132,180);}});const m=new T.MeshBasicMaterial({map:tx,toneMapped:false});backs.set(key,m);return m;}
const ghostIvory=ivory.clone();ghostIvory.transparent=true;ghostIvory.opacity=.24;ghostIvory.depthWrite=false;const ghostBlack=black.clone();ghostBlack.transparent=true;ghostBlack.opacity=.24;ghostBlack.depthWrite=false;const ghostGold=gold.clone();ghostGold.transparent=true;ghostGold.opacity=.24;ghostGold.depthWrite=false;
const counts={rivers:[0,0,0,0],wallStacks:[0,0,0,0],wallTiles:[0,0,0,0],hands:[0,0,0,0],riichiSpaces:0};
const scene=new T.Scene(),camera=new T.Camera();camera.matrixAutoUpdate=false;camera.matrixWorldAutoUpdate=false;camera.matrixWorld.identity();camera.matrixWorldInverse.identity();
const r=.4368/.7286,a=W*.4368/N,g=(r-1)/N,tx=W*(1-.4368)/2,b=(W*(1-.7286)/2*r-tx)/N,ty=H*.1953,d=(H*.8906*r-ty)/N,E=55*Math.PI/180,cy=(d-a*Math.sin(E))/g,zW=g*Math.tan(E),zX=W/2*zW,zY=cy*zW-a*Math.cos(E);
camera.projectionMatrix.set(2*a/W,-2*b/W+g,2*zX/W-zW,2*tx/W-1,0,-g+2*d/H,zW-2*zY/H,1-2*ty/H,0,-g,zW,.98,0,-g,zW,1);camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
function point(u,v,z=0){const q=1+g*v+zW*z;return{x:(a*u+b*v+zX*z+tx)/q,y:(d*v+zY*z+ty)/q};}
function tag(text,u,v,{z=0,kind=''}={}){const p=point(u,v,z),el=document.createElement('div');el.className='tag '+kind;el.textContent=text;el.style.left=p.x+'px';el.style.top=p.y+'px';document.querySelector('#scene').append(el);return el;}
function light(s){s.add(new T.AmbientLight('#fff5e8',1.4));const k=new T.DirectionalLight('#fff4df',2);k.position.set(-900,-2300,4000);s.add(k);const f=new T.DirectionalLight('#d7e9ec',.6);f.position.set(3500,0,1800);s.add(f);}
light(scene);
const items=[];function tile(s,u,v,z,yaw=0,{face='2m',ghost=false,wall=false,index,standing=false}={}){const group=new T.Group();const ib=ghost?ghostIvory:ivory;const mats=[ib,ib,ib,ib,front(face,ghost),back(index)];const body=new T.Mesh(geo,mats);body.castShadow=!ghost;group.add(body);const bb=ghost?ghostBlack:black;const base=new T.Mesh(baseGeo,wall?[bb,bb,bb,bb,bb,back(index)]:bb);base.position.z=-D/2+3.5;group.add(base);const seam=new T.Mesh(seamGeo,ghost?ghostGold:gold);seam.position.z=-D/2+7;group.add(seam);group.position.set(u,-v,z);const q=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),yaw);if(wall)q.multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),Math.PI));if(standing)q.multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),Math.PI/2));group.quaternion.copy(q);s.add(group);items.push({u,v,z,yaw,standing,wall,ghost});return group;}
// Rivers: four rows of six identical physical blocks, never separate per-seat scaling.
for(let seat=0;seat<4;seat++)for(let row=0;row<4;row++)for(let col=0;col<6;col++){let u,v,yaw;if(seat===0){u=1500+(col-2.5)*92;v=1860+row*124;yaw=0;}if(seat===2){u=1500-(col-2.5)*92;v=1140-row*124;yaw=Math.PI;}if(seat===3){u=1140-row*124;v=1500+(col-2.5)*92;yaw=-Math.PI/2;}if(seat===1){u=1860+row*124;v=1500-(col-2.5)*92;yaw=Math.PI/2;}tile(scene,u,v,D/2,yaw,{ghost:false});counts.rivers[seat]++;}
// Each complete maximum wall has 17 real two-tile stacks. The three other
// seats' individual blocks are quarter-turned relative to the local block.
for(let seat=0;seat<4;seat++)for(let i=0;i<17;i++){let u,v;if(seat===0){u=1500+(i-8)*92;v=2580;}if(seat===2){u=1500+(i-8)*124;v=420;}if(seat===3){u=420;v=1500+(i-8)*92;}if(seat===1){u=2580;v=1500+(i-8)*92;}for(let level=0;level<2;level++){tile(scene,u,v,D/2+level*D,seat===0?0:Math.PI/2,{wall:true,index:level===1?i+1:undefined});counts.wallTiles[seat]++;}counts.wallStacks[seat]++;}
const ownFaces=['1m','2m','3m','4m','5m','6m','7m','8m','9m','1p','2p','3p','E','C'];
for(let seat=0;seat<4;seat++)for(let i=0;i<(seat===0?14:13);i++){let u,v,yaw;if(seat===0){u=1500+(i-6.5)*92+(i===13?28:0);v=2850;yaw=0;}if(seat===2){u=1500-(i-6)*92;v=150;yaw=Math.PI;}if(seat===3){u=150;v=1500+(i-6)*92;yaw=-Math.PI/2;}if(seat===1){u=2850;v=1500-(i-6)*92;yaw=Math.PI/2;}tile(scene,u,v,tl/2,yaw,{standing:true,face:seat===0?ownFaces[i]:'2m'});counts.hands[seat]++;}
// All four reservations sit between maximum wall and maximum river bounds.
for(const [u,v,yaw] of [[2400,2770,0],[2400,1500,Math.PI/2],[1500,600,Math.PI],[600,1500,-Math.PI/2]]){const hw=150,hh=48;const corners=[[-hw,-hh],[hw,-hh],[hw,hh],[-hw,hh],[-hw,-hh]].map(([x,y])=>new T.Vector3(u+x*Math.cos(yaw)-y*Math.sin(yaw),-(v+x*Math.sin(yaw)+y*Math.cos(yaw)),.5));const outline=new T.Line(new T.BufferGeometry().setFromPoints(corners),new T.LineDashedMaterial({color:'#ff7fc1',dashSize:16,gapSize:12,depthTest:false}));outline.computeLineDistances();scene.add(outline);const carrot=createCarrot();carrot.scale.setScalar(1.8);carrot.rotation.z=yaw;carrot.position.set(u,-v,1);scene.add(carrot);counts.riichiSpaces++;}
const floor=new T.Mesh(new T.PlaneGeometry(N,N),new T.ShadowMaterial({opacity:.22,depthWrite:false}));floor.position.set(N/2,-N/2,-.5);floor.receiveShadow=true;scene.add(floor);
function render(s,c,host,w,h){const rr=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});rr.setSize(w,h);rr.setPixelRatio(1);rr.setClearColor(0,0);rr.outputColorSpace=T.SRGBColorSpace;rr.toneMapping=T.ACESFilmicToneMapping;rr.toneMappingExposure=.9;host.append(rr.domElement);rr.render(s,c);return rr;}
render(scene,camera,document.querySelector('#scene'),W,H);
// Labels remain outside the reserved tile footprints.
tag('玩家 · 手牌在綠色枱面',1500,2980,{kind:'seat'});tag('對家',1500,-70,{kind:'seat'});tag('上家',-150,1500,{kind:'seat'});tag('下家',3150,1500,{kind:'seat'});
tag('17 幢 × 2 層',2420,2580);tag('其他三家：每幢已轉 90°',1500,-260);
tag('6 × 4 ＝ 24 格',1500,1730);tag('6 × 4 ＝ 24 格',1500,1270);tag('24 格',950,1910);tag('24 格',2050,1910);
tag('立直棒預留',2400,2910,{kind:'pink'});tag('立直棒預留',1900,600,{kind:'pink'});tag('立直棒預留',600,1890,{kind:'pink'});tag('立直棒預留',2400,1890,{kind:'pink'});
tag('四家牌河：同厚度、同模型',1500,1460);tag('四家均以 24 張滿格驗證容量',1500,1570);
// Three detail cameras use the exact same shared geometry, not an illustration.
function detail(id,make,position,look){const s=new T.Scene();light(s);const p=new T.Mesh(new T.PlaneGeometry(1200,900),new T.MeshStandardMaterial({color:'#075044',roughness:1}));p.position.z=-.2;s.add(p);make(s);const c=new T.PerspectiveCamera(38,1150/285,1,6000);c.up.set(0,0,1);c.position.set(...position);c.lookAt(...look);c.zoom=id==='rotation'?1.9:2.7;c.updateProjectionMatrix();render(s,c,document.querySelector('#'+id),1150,285);return c;}
detail('thickness',s=>{tile(s,-100,0,D/2,0);tile(s,0,0,D/2,0);tile(s,100,0,D/2,0);},[340,-480,230],[0,0,20]);
detail('upright',s=>{tile(s,-48,0,60,0,{standing:true});tile(s,48,0,60,0,{standing:true});},[170,-460,400],[0,0,60]);
detail('rotation',s=>{for(const [u,yaw] of [[-145,0],[145,Math.PI/2]])for(let level=0;level<2;level++)tile(s,u,0,D/2+D*level,yaw,{wall:true,index:level?17:undefined});},[300,-540,410],[0,0,60]);
window.__diagram={counts,dimensions:[tw,tl,D],privateHandVertical:true,otherWallYawDegrees:90,wallBaseLayers:[0,D],maxRiverRows:4,maxRiverColumns:6,allRiverCapacitySlotsSolid:true,mainModels:285};
for(const n of counts.rivers)if(n!==24)throw Error('river capacity count');for(const n of counts.wallStacks)if(n!==17)throw Error('wall stack count');for(const n of counts.wallTiles)if(n!==34)throw Error('wall physical tile count');if(counts.riichiSpaces!==4)throw Error('stick reservations');
// Numeric checks cover real mesh placement, not just the captions.
for(const item of items){const base=item.standing?item.z-tl/2:item.z-D/2;if(item.wall){if(base!==0&&base!==D)throw Error('bad wall layer');}else if(base!==0)throw Error('ungrounded tile');}
const regions={
 river0:[1226,1800,1774,2292],river1:[1800,1226,2292,1774],river2:[1226,708,1774,1200],river3:[708,1226,1200,1774],
 wall0:[720,2520,2280,2640],wall1:[2520,720,2640,2280],wall2:[448,376,2552,464],wall3:[360,720,480,2280],
 stick0:[2250,2722,2550,2818],stick1:[2352,1350,2448,1650],stick2:[1350,552,1650,648],stick3:[552,1350,648,1650],
 hand0:[858,2822,2167,2878],hand1:[2822,904,2878,2096],hand2:[904,122,2096,178],hand3:[122,904,178,2096]
};
const entries=Object.entries(regions);for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){const [ka,a]=entries[i],[kb,b]=entries[j];if(a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1])throw Error('overlapping reserved zones '+ka+' '+kb);}
Object.assign(window.__diagram,{groundedMeshes:true,allReservedRegionsNonOverlapping:true,regions,riverThicknessAllSeats:D,privateHandAngleToFeltDegrees:90,oneMainCamera:true,gameIntegration:false});
const picture=new Image();picture.src='/art/gala-original-table-raised-view.png';await picture.decode();await document.fonts.ready;await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);window.__diagramReady=true;
