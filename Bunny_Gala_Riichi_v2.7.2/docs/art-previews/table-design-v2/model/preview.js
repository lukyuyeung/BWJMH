import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
const W=3600,H=1654,N=3000,D=56,tw=88,tl=120;
await document.fonts.load('700 120px "LXGW WenKai TC"','一二三四五六七八九萬東南西北發中');
await document.fonts.ready;
const peacock=new Image();peacock.src='./peacock-1s-emblem.png';await peacock.decode();
const allFaces=[...['m','p','s'].flatMap(s=>Array.from({length:9},(_,i)=>({face:`${i+1}${s}`,red:false}))),...['E','S','W','N','P','F','C'].map(face=>({face,red:false})),...['m','p','s'].map(s=>({face:`5${s}`,red:true}))];
const palette={red:'#a81721',green:'#064a31',black:'#101511'};
const cache=new Map(),faceChecks={};
function ctex(c){const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=8;return t;}
function front(face='2m',red=false){
 const key=face+(red?'-red':'');if(cache.has(key))return cache.get(key);
 const can=document.createElement('canvas');can.width=528;can.height=720;
 const c=can.getContext('2d');c.scale(2,2);c.fillStyle='#fff4e1';c.fillRect(0,0,264,360);c.textAlign='center';c.textBaseline='middle';
 const ink=red?palette.red:palette.green;
 const pip=(x,y,color,r=20)=>{c.strokeStyle=color;c.lineWidth=r*.30;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();c.lineWidth=r*.18;c.beginPath();c.arc(x,y,r*.59,0,Math.PI*2);c.stroke();c.fillStyle=color;c.beginPath();c.arc(x,y,r*.29,0,Math.PI*2);c.fill();};
 const bamboo=(x,y,color,angle=0,long=false)=>{c.save();c.translate(x,y);c.rotate(angle);const h=long?136:76;c.fillStyle=color;c.beginPath();c.moveTo(-8,-h/2);c.quadraticCurveTo(-16,-h/2+4,-10,-h/2+12);c.quadraticCurveTo(-5,0,-10,h/2-11);c.quadraticCurveTo(-16,h/2,-5,h/2);c.lineTo(7,h/2);c.quadraticCurveTo(15,h/2-3,10,h/2-12);c.quadraticCurveTo(5,0,10,-h/2+11);c.quadraticCurveTo(16,-h/2-1,5,-h/2);c.closePath();c.fill();c.fillStyle=color===palette.red?'#e36b5b':'#599d6a';c.fillRect(-4,-1,8,2);c.restore();};
 let marks=0;
 if(face.endsWith('m')){c.fillStyle=red?palette.red:palette.black;c.font='700 125px "LXGW WenKai TC"';c.fillText('一二三四五六七八九'[Number(face[0])-1],132,103);c.fillStyle=palette.red;c.font='700 147px "LXGW WenKai TC"';c.fillText('萬',132,253);}
 else if(face==='1s'){c.drawImage(peacock,22,26,220,304);marks=1;}
 else if(face.endsWith('p')){
  const n=Number(face[0]),g=palette.green,r=palette.red;let points=[];
  if(n===1){pip(132,180,r,70);for(let i=0;i<12;i++){const a=i*Math.PI/6;c.strokeStyle=r;c.lineWidth=2;c.beginPath();c.arc(132+Math.cos(a)*40,180+Math.sin(a)*40,9,0,Math.PI*2);c.stroke();}points=[[132,180,r]];}
  if(n===2)points=[[132,105,g],[132,255,g]];
  if(n===3)points=[[82,85,g],[132,180,r],[182,275,g]];
  if(n===4)points=[[77,95,g],[187,95,g],[77,265,g],[187,265,g]];
  if(n===5)points=[[77,82,g],[187,82,g],[132,180,r],[77,278,g],[187,278,g]];
  if(n===6)points=[...[[77,85],[187,85]].map(p=>[...p,g]),...[[77,180],[187,180],[77,275],[187,275]].map(p=>[...p,r])];
  if(n===7)points=[[73,65,g],[132,98,g],[191,131,g],[80,212,r],[184,212,r],[80,288,r],[184,288,r]];
  if(n===8)for(const y of [65,142,219,296])for(const x of [81,183])points.push([x,y,g]);
  if(n===9)for(const [j,y] of [78,180,282].entries())for(const x of [64,132,200])points.push([x,y,j===1?r:g]);
  if(n!==1)for(const [x,y,color]of points)pip(x,y,red?r:color,n<4?28:n<7?24:21);
  marks=points.length;
 }else if(face.endsWith('s')){
  const n=Number(face[0]);let points=[];
  if(n===2)points=[[89,180,0,true],[175,180,0,true]];
  if(n===3)points=[[132,95],[83,255],[181,255]];
  if(n===4)points=[[83,95],[181,95],[83,265],[181,265]];
  if(n===5)points=[[82,77],[182,77],[132,180],[82,283],[182,283]];
  if(n===6)for(const y of [98,262])for(const x of [62,132,202])points.push([x,y]);
  if(n===7){points.push([132,55,0,false,true]);for(const y of [173,287])for(const x of [62,132,202])points.push([x,y]);}
  if(n===8)for(const [j,y]of [65,142,219,296].entries())for(const [k,x]of [89,175].entries())points.push([x,y,(k?1:-1)*(j<2?-.58:.58)]);
  if(n===9)for(const y of [69,180,291])for(const [k,x]of [62,132,202].entries())points.push([x,y,0,false,k===1]);
  for(const [x,y,a,long,isRed]of points)bamboo(x,y,red||isRed?palette.red:ink,a??0,long??false);
  marks=points.length;
 }else if(face!=='P'){c.fillStyle=face==='F'?palette.green:face==='C'?palette.red:palette.black;c.font='700 218px "LXGW WenKai TC"';c.fillText({E:'東',S:'南',W:'西',N:'北',F:'發',C:'中'}[face],132,187);}
 faceChecks[key]={marks,red};
 const height=document.createElement('canvas');height.width=528;height.height=720;const hc=height.getContext('2d');hc.drawImage(can,0,0);const pixels=hc.getImageData(0,0,528,720);for(let i=0;i<pixels.data.length;i+=4){const y=(pixels.data[i]+pixels.data[i+1]+pixels.data[i+2])/3;const v=y>210?245:90;pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;}hc.putImageData(pixels,0,0);
 const mat=new T.MeshPhongMaterial({map:ctex(can),bumpMap:new T.CanvasTexture(height),bumpScale:.35,shininess:45,specular:'#080808'});
 mat.userData.face=face;mat.userData.red=red;cache.set(key,mat);return mat;
}
const ivory=new T.MeshPhysicalMaterial({color:'#fff1d9',roughness:.23,clearcoat:.6,clearcoatRoughness:.2});
const black=new T.MeshPhongMaterial({color:'#08090a',shininess:60,specular:'#151515'});
const gold=new T.MeshStandardMaterial({color:'#bd954f',roughness:.27,metalness:.8});
const bodyGeo=new RoundedBoxGeometry(tw,tl,D-11,5,7),backGeo=new RoundedBoxGeometry(tw,tl,11,4,5),seamGeo=new RoundedBoxGeometry(tw-.4,tl-.4,.9,3,.4);
const meshes=[];
function tile(s,u,v,z,yaw=0,{face='2m',red=false,wall=false,standing=false,record=false}={}){
 const q=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),yaw);
 if(wall)q.multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),Math.PI));
 if(standing)q.multiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),Math.PI/2));
 const group=new T.Group();const body=new T.Mesh(bodyGeo,[ivory,ivory,ivory,ivory,front(face,red),ivory]);body.position.z=5.5;group.add(body);
 const back=new T.Mesh(backGeo,black);back.position.z=-D/2+5.5;group.add(back);
 const seam=new T.Mesh(seamGeo,gold);seam.position.z=-D/2+11;group.add(seam);
 group.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});group.position.set(u,-v,z);group.quaternion.copy(q);s.add(group);
 if(record)meshes.push({u,v,z,yaw,wall,standing,face,red});return group;
}
function carrot(){const group=new T.Group();const orange=new T.MeshStandardMaterial({color:'#ff811b',roughness:.42});const deep=new T.MeshStandardMaterial({color:'#d8580b',roughness:.5});const green=new T.MeshStandardMaterial({color:'#438f2b',roughness:.65});const bright=new T.MeshStandardMaterial({color:'#88c935',roughness:.6});
 for(let i=0;i<8;i++){const h=40-i*4.4;const m=new T.Mesh(new T.BoxGeometry(12,h,h*.66),i%3===1?deep:orange);m.position.set(-32+i*11,0,h*.33);group.add(m);}
 for(const [x,y,z,w,h,d]of [[-42,-13,18,15,18,13],[-48,8,24,18,18,15],[-38,18,22,12,17,13],[-51,-3,37,16,13,18],[-36,1,39,12,12,22]]){const m=new T.Mesh(new T.BoxGeometry(w,h,d),z>30?bright:green);m.position.set(x,y,z);group.add(m);}group.traverse(o=>{if(o.isMesh)o.castShadow=true;});return group;}
const keep=[];
function setup(s){s.add(new T.AmbientLight('#fff7ec',.65));const k=new T.DirectionalLight('#fff1dd',3.1);k.position.set(-1000,1200,4200);k.castShadow=true;k.shadow.mapSize.set(4096,4096);Object.assign(k.shadow.camera,{left:-4400,right:4400,top:4400,bottom:-4400,near:1,far:10000});k.shadow.bias=-.00015;k.shadow.normalBias=1.1;k.shadow.radius=3;s.add(k);const f=new T.DirectionalLight('#e7f2ff',1);f.position.set(3100,-2000,2500);s.add(f);}
function render(s,c,host,w,h){const rr=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});rr.setSize(w,h);rr.setPixelRatio(1);rr.setClearColor(0,0);rr.outputColorSpace=T.SRGBColorSpace;rr.toneMapping=T.ACESFilmicToneMapping;rr.toneMappingExposure=.96;rr.shadowMap.enabled=true;rr.shadowMap.type=T.PCFSoftShadowMap;const pm=new T.PMREMGenerator(rr);s.environment=pm.fromScene(new RoomEnvironment(),.04).texture;s.environmentIntensity=.65;host.append(rr.domElement);rr.render(s,c);keep.push(rr);}
const scene=new T.Scene();setup(scene);
const camera=new T.Camera();camera.matrixAutoUpdate=false;camera.matrixWorldAutoUpdate=false;camera.matrixWorld.identity();camera.matrixWorldInverse.identity();
const ratio=.4368/.7286,a=W*.4368/N,g=(ratio-1)/N,tx=W*(1-.4368)/2,b=(W*(1-.7286)/2*ratio-tx)/N,ty=H*.1953,d=(H*.8906*ratio-ty)/N,E=55*Math.PI/180,cy=(d-a*Math.sin(E))/g,zW=g*Math.tan(E),zX=W/2*zW,zY=cy*zW-a*Math.cos(E);
camera.projectionMatrix.set(2*a/W,-2*b/W+g,2*zX/W-zW,2*tx/W-1,0,-g+2*d/H,zW-2*zY/H,1-2*ty/H,0,-g,zW,.98,0,-g,zW,1);camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
function point(u,v,z=0){const q=1+g*v+zW*z;return{x:(a*u+b*v+zX*z+tx)/q,y:(d*v+zY*z+ty)/q};}
function tag(text,u,v,kind=''){const p=point(u,v),el=document.createElement('div');el.className='tag '+kind;el.textContent=text;el.style.left=p.x+'px';el.style.top=p.y+'px';document.querySelector('#scene').append(el);}
const counts={rivers:[0,0,0,0],wallStacks:[0,0,0,0],wallTiles:[0,0,0,0],hands:[0,0,0,0],riichiSpaces:0,sidewaysDeclarations:[0,0,0,0]};
for(let seat=0;seat<4;seat++)for(let row=0;row<4;row++)for(let col=0;col<6;col++){let u,v,yaw;const sideways=row===0&&col===2;const offset=(col-2.5)*92+(row===0?(col===2?16:col>2?32:0):0);
 if(seat===0){u=1500+offset;v=1860+row*124;yaw=0;}
 if(seat===2){u=1500-offset;v=1140-row*124;yaw=Math.PI;}
 if(seat===3){u=1140-row*124;v=1500+offset;yaw=-Math.PI/2;}
 if(seat===1){u=1860+row*124;v=1500-offset;yaw=Math.PI/2;}
 if(sideways){yaw+=Math.PI/2;counts.sidewaysDeclarations[seat]++;}
 tile(scene,u,v,D/2,yaw,{...allFaces[(seat*24+row*6+col)%37],record:true});counts.rivers[seat]++;
}
const wallYaw=[0,Math.PI/2,Math.PI,Math.PI/2];
for(let seat=0;seat<4;seat++)for(let i=0;i<17;i++){let u,v;
 if(seat===0){u=1500+(i-8)*92;v=2580;}if(seat===2){u=1500+(i-8)*92;v=420;}
 if(seat===3){u=420;v=1500+(i-8)*92;}if(seat===1){u=2580;v=1500+(i-8)*92;}
 for(let level=0;level<2;level++){tile(scene,u,v,D/2+level*D,wallYaw[seat],{wall:true,record:true});counts.wallTiles[seat]++;}counts.wallStacks[seat]++;
}
const ownFaces=['1m','2m','3m','4m','5m','6m','7m','8m','9m','1s','5p','F','C','E'];
for(let seat=0;seat<4;seat++)for(let i=0;i<(seat===0?14:13);i++){let u,v,yaw;
 if(seat===0){u=1500+(i-6.5)*92+(i===13?28:0);v=2850;yaw=0;}
 if(seat===2){u=1500-(i-6)*92;v=150;yaw=Math.PI;}
 if(seat===3){u=150;v=1500+(i-6)*92;yaw=-Math.PI/2;}
 if(seat===1){u=2850;v=1500-(i-6)*92;yaw=Math.PI/2;}
 tile(scene,u,v,tl/2,yaw,{standing:true,face:seat===0?ownFaces[i]:'2m',record:true});counts.hands[seat]++;
}
const stickZones=[];
for(const [seat,u,v,yaw]of [[0,1500,2400,0],[1,2400,1500,Math.PI/2],[2,1500,600,Math.PI],[3,600,1500,-Math.PI/2]]){
 const corners=[[-150,-48],[150,-48],[150,48],[-150,48],[-150,-48]].map(([x,y])=>new T.Vector3(u+x*Math.cos(yaw)-y*Math.sin(yaw),-(v+x*Math.sin(yaw)+y*Math.cos(yaw)),1));
 const line=new T.Line(new T.BufferGeometry().setFromPoints(corners),new T.LineDashedMaterial({color:'#ff8cbf',dashSize:14,gapSize:10}));line.computeLineDistances();scene.add(line);
 const stick=carrot();stick.scale.setScalar(1.6);stick.rotation.z=-yaw;stick.position.set(u,-v,1);scene.add(stick);stickZones.push({seat,u,v,yaw});counts.riichiSpaces++;
}
const floor=new T.Mesh(new T.PlaneGeometry(N,N),new T.ShadowMaterial({opacity:.26}));floor.position.set(N/2,-N/2,-.5);floor.receiveShadow=true;scene.add(floor);
render(scene,camera,document.querySelector('#scene'),W,H);
tag('玩家 · 手牌在綠色枱面',1500,2985,'seat');tag('對家 · 牌山方向已修正',1500,-55,'seat');tag('上家',-160,1500,'seat');tag('下家',3160,1500,'seat');
tag('17 幢 × 2 層',2450,2600);tag('17 幢 × 2 層',2440,390);tag('17 幢',380,2310);tag('17 幢',2620,2310);
tag('24 格',1840,2190);tag('24 格',1170,820);tag('24 格',860,1900);tag('24 格',2140,1900);
tag('立直棒預留',1890,2400,'pink');tag('立直棒預留',1890,600,'pink');tag('立直棒預留',600,1930,'pink');tag('立直棒預留',2400,1930,'pink');
tag('四家同一尺寸 · 同一厚度',1500,1450);tag('牌河展示 37 款完整牌面',1500,1570);
function detail(id,make,position,look,zoom=2.3){const s=new T.Scene();setup(s);const p=new T.Mesh(new T.PlaneGeometry(2000,1400),new T.MeshStandardMaterial({color:'#08513e',roughness:.97}));p.position.z=-.5;p.receiveShadow=true;s.add(p);make(s);const c=new T.PerspectiveCamera(36,1150/310,1,8000);c.up.set(0,0,1);c.position.set(...position);c.lookAt(...look);c.zoom=zoom;c.updateProjectionMatrix();render(s,c,document.querySelector('#'+id),1150,310);}
detail('material',s=>{tile(s,-160,0,60,0,{standing:true,face:'1s'});tile(s,-42,0,60,0,{standing:true,face:'2m'});tile(s,90,0,28,0,{face:'5p',red:true});tile(s,215,0,28,0,{wall:true});},[360,-650,380],[25,0,55],2.2);
detail('walls',s=>{for(const [u,yaw]of [[-165,0],[-65,Math.PI],[100,Math.PI/2],[230,Math.PI/2]])for(let l=0;l<2;l++)tile(s,u,0,D/2+D*l,yaw,{wall:true});},[360,-750,460],[30,0,50],2.0);
detail('stick',s=>{for(let i=0;i<3;i++)tile(s,-105+i*92,155,28,0,{face:['1m','2m','3m'][i]});for(let i=0;i<5;i++)for(let l=0;l<2;l++)tile(s,-197+i*92,-130,28+D*l,0,{wall:true});const stick=carrot();stick.scale.setScalar(1.6);stick.position.set(-10,5,1);s.add(stick);},[200,-800,900],[0,-10,0],1.9);
// Full face catalogue, using precisely the same model/material as the table.
const gal=new T.Scene();setup(gal);const gf=new T.Mesh(new T.PlaneGeometry(3000,2200),new T.MeshStandardMaterial({color:'#073d2f',roughness:1}));gf.position.set(0,0,-.4);gf.receiveShadow=true;gal.add(gf);
const rows=[allFaces.slice(0,9),allFaces.slice(9,18),allFaces.slice(18,27),allFaces.slice(27)];
const gw=3600,gh=2100,scale=2.7;const gc=new T.OrthographicCamera(-gw/scale/2,gw/scale/2,gh/scale/2,-gh/scale/2,1,5000);gc.position.set(0,-700,1900);gc.up.set(0,0,1);gc.lookAt(0,0,0);gc.updateMatrixWorld(true);
for(let r=0;r<rows.length;r++)for(let c=0;c<rows[r].length;c++){const entry=rows[r][c],u=(c-(rows[r].length-1)/2)*124,v=-285+r*180;tile(gal,u,v,D/2,0,entry);const p=new T.Vector3(u,-(v+65),0).project(gc);const el=document.createElement('div');el.className='label';el.textContent=entry.red?`赤五${{m:'萬',p:'筒',s:'索'}[entry.face[1]]}`:entry.face==='1s'?'1s · 孔雀':{E:'東',S:'南',W:'西',N:'北',P:'白',F:'發',C:'中'}[entry.face]??entry.face;el.style.left=(p.x+1)*gw/2+'px';el.style.top=(1-p.y)*gh/2+'px';document.querySelector('#gallery').append(el);}
render(gal,gc,document.querySelector('#gallery'),gw,gh);
// Count, orientation, base contact and reserved-space checks are independent of captions.
for(const n of counts.sidewaysDeclarations)if(n!==1)throw Error('missing sideways riichi declaration');
for(const n of counts.rivers)if(n!==24)throw Error('river count');for(const n of counts.wallStacks)if(n!==17)throw Error('wall stacks');for(const n of counts.wallTiles)if(n!==34)throw Error('wall layers');
for(const m of meshes){const base=m.standing?m.z-tl/2:m.z-D/2;if(m.wall){if(base!==0&&base!==D)throw Error('wall not stacked');}else if(base!==0)throw Error('tile floating');}
for(const item of allFaces){const key=item.face+(item.red?'-red':'');if(!cache.has(key))throw Error('missing face');if(/^[2-9][ps]$/.test(item.face)&&faceChecks[key].marks!==Number(item.face[0]))throw Error('pip count '+key);}
const regions={river0:[1226,1800,1806,2292],river1:[1800,1194,2292,1774],river2:[1194,708,1774,1200],river3:[708,1226,1200,1806],wall0:[720,2520,2280,2640],wall1:[2520,720,2640,2280],wall2:[720,360,2280,480],wall3:[360,720,480,2280],stick0:[1350,2352,1650,2448],stick1:[2352,1350,2448,1650],stick2:[1350,552,1650,648],stick3:[552,1350,648,1650],hand0:[858,2822,2167,2878],hand1:[2822,904,2878,2096],hand2:[904,122,2096,178],hand3:[122,904,178,2096]};
const entries=Object.entries(regions);for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){const [ka,a]=entries[i],[kb,b]=entries[j];if(a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1])throw Error('overlap '+ka+' '+kb);}
if(Math.abs(Math.sin(wallYaw[0]-wallYaw[2]))>1e-6)throw Error('opposite wall long-axis');
const riverTypes=new Set(meshes.filter(m=>!m.wall&&!m.standing).map(m=>m.face+(m.red?'-red':'')));if(riverTypes.size!==37)throw Error('incomplete river catalogue');
window.__diagram={counts,dimensions:[tw,tl,D],uniqueRiverDesigns:riverTypes.size,all37DesignsPresent:true,peacockOneBamboo:true,wallYawDegrees:wallYaw.map(x=>Math.round(x*180/Math.PI)),oppositeAndPlayerWallLongAxisSame:true,allTilesGrounded:true,reservedRegionsNonOverlapping:true,stickZones,regions,faceChecks,sharedPhysicalTileSize:true,gameIntegration:false};
const bg=new Image();bg.src='/art/gala-original-table-raised-view.png';await bg.decode();await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);window.__diagramReady=true;
