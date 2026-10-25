import {winClockKey,winClockAge} from './win-visual-clock';
import {createWinnerLight,winImpactTier,WIN_FLIP_LEAD,WIN_FLIP_DURATION,WIN_LIGHT_END,winTiming} from './win-impact';
import {doraFromIndicator} from '../engine/deadwall.js';
import {publishTableMotion,presentTableMotion,cancelTableMotion} from './motion-state.js';
import React,{useEffect,useRef} from 'react';
import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import type {Game,Seat,Tile} from './main.js';
import {calledPosition} from './gameplay.js';
import {loadTableHands} from './table-hands.js';
import {sortResultTiles} from './result-tiles.js';
import {tileFaceUrl,completeTileUrl,approvedTileFaces} from './approved-tile-art.js';

type Snapshot={game:Game;hover:string|null;riichiTiles:Partial<Record<Seat,string>>;opening:boolean;concealedDrawId?:string};
const seats:Seat[]=['east','south','west','north'];
const W=1125,H=634;
// One projective camera for the table, all four rivers, concealed tiles and melds.
// XY is the felt plane; positive Z is actual tile thickness above that plane.
function tableCamera(){
 const camera=new T.Camera(),a=.90625,b=-.234806,c=200,d=.460492,g=-.000417477,h=-.00024;
 const clip=new T.Matrix4().set(2*a/W,-(2*b/W-g),-h,2*c/W-1,0,-(g-2*d/H),h+2*.91/H,1-130/H,0,-.00006,-.0006,0,0,-g,h,1);
 camera.position.set(400,-1150,1050);camera.up.set(0,0,1);camera.lookAt(400,-325,0);camera.updateMatrixWorld();
 camera.projectionMatrix.copy(clip).multiply(camera.matrixWorld);camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
 return camera;
}
function screenCamera(){
 const camera=new T.Camera();
 const clip=new T.Matrix4().set(2/W,0,2*.14/W,-1,0,2/H,2*.42/H,1,0,0,-.002,0,0,0,0,1);
 camera.position.set(560,-1050,1500);camera.up.set(0,1,0);camera.lookAt(560,-317,0);camera.updateMatrixWorld();
 camera.projectionMatrix.copy(clip).multiply(camera.matrixWorld);camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();return camera;
}
export function PhysicalTable({game,hover,riichiTiles,opening,concealedDrawId}:{game:Game;hover:string|null;riichiTiles:Partial<Record<Seat,string>>;opening:boolean;concealedDrawId?:string}){
 const node=useRef<HTMLDivElement>(null),latest=useRef<Snapshot>({game,hover,riichiTiles,opening,concealedDrawId}),redraw=useRef<()=>void>(()=>{});
 latest.current={game,hover,riichiTiles,opening,concealedDrawId};
 useEffect(()=>{redraw.current()},[game,hover,riichiTiles,opening,concealedDrawId]);
 useEffect(()=>{
  const root=node.current,stage=root?.closest<HTMLElement>('.phone-stage');if(!root||!stage)return;
  let disposed=false,contextLost=false,renderWidth=W,renderer:T.WebGLRenderer|undefined,armRenderer:T.WebGLRenderer|undefined,env:T.WebGLRenderTarget|undefined,frame=0;
  const scene=new T.Scene(),handScene=new T.Scene(),armScene=new T.Scene(),camera=tableCamera(),handCamera=screenCamera(),boardTiles=new T.Group(),handTiles=new T.Group();
  scene.add(boardTiles);handScene.add(handTiles);scene.scale.y=-1;handScene.scale.y=-1;armScene.scale.y=-1;
  const tableBase=new T.Group();tableBase.position.x=400;scene.add(tableBase);
  const projection=camera.projectionMatrix.clone(),handProjection=handCamera.projectionMatrix.clone();
  const armLayer=document.createElement('div');armLayer.className='physical-hand-overlay';stage.append(armLayer);
  const marker=document.createElement('span');marker.className='physical-last-marker';marker.style.display='none';root.append(marker);
  const winnerLight=createWinnerLight();stage.append(winnerLight);const meldLights:HTMLDivElement[]=[],extraWinnerLights:HTMLDivElement[]=[];
  let hands:Awaited<ReturnType<typeof loadTableHands>>|undefined,previousCounts:number[]|undefined;
  const lastHandPositions=new Map<string,T.Vector3>(),placedRiichi=new Set<string>(),drawMotions=new Map<Seat,string>();
  let stickMaterial:T.MeshBasicMaterial|undefined;
  let revealKey='',revealStart=0;let shineFrame=0;let shimmerTimer:number|undefined,haloTimer:number|undefined,lastHaloId='',lastHaloAt=0;let doraFaces=new Set<string>(),reduceShine=false;
  let historyKey='',historyRevision=-1,previousDiscards=new Set<string>(),lastDiscardId:string|undefined;
  const geometries:T.BufferGeometry[]=[],materials:T.Material[]=[],textures:T.Texture[]=[];
  const geoCache=new Map<string,T.BufferGeometry>(),faceMaterials=new Map<string,T.Material>(),handArtMaterials=new Map<string,T.Material>();
  const makeMaterial=<M extends T.Material>(m:M)=>{materials.push(m);return m};
  const ivory=makeMaterial(new T.MeshPhysicalMaterial({color:'#fff0d9',roughness:.38,metalness:0,clearcoat:.22,clearcoatRoughness:.4}));
  const gold=makeMaterial(new T.MeshStandardMaterial({color:'#cda152',roughness:.27,metalness:.85}));
  const tableRose=makeMaterial(new T.MeshPhysicalMaterial({color:'#996c67',roughness:.19,metalness:.92,clearcoat:1,clearcoatRoughness:.12,envMapIntensity:1.2}));
  const tableGold=makeMaterial(new T.MeshStandardMaterial({color:'#c6ab86',roughness:.22,metalness:.9}));
  const leather=makeMaterial(new T.MeshStandardMaterial({color:'#201820',roughness:.55,metalness:.08}));
  let back:T.Material,felt:T.Material;
  function boxGeometry(w:number,h:number,depth:number,r=2){const key=[w,h,depth,r].join(':');let geo=geoCache.get(key);if(!geo){geo=new RoundedBoxGeometry(w,h,depth,2,r);geoCache.set(key,geo);geometries.push(geo)}return geo}
  function planeGeometry(w:number,h:number){const key='p:'+w+':'+h;let geo=geoCache.get(key);if(!geo){geo=new T.PlaneGeometry(w,h);geoCache.set(key,geo);geometries.push(geo)}return geo}
  function roundedFaceGeometry(w:number,h:number){
   const key='rounded-face:'+w+':'+h;let geo=geoCache.get(key);if(!geo){
    const r=Math.min(w,h)*.065,x=-w/2,y=-h/2,shape=new T.Shape();
    shape.moveTo(x+r,y);shape.lineTo(x+w-r,y);shape.quadraticCurveTo(x+w,y,x+w,y+r);shape.lineTo(x+w,y+h-r);shape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);shape.lineTo(x+r,y+h);shape.quadraticCurveTo(x,y+h,x,y+h-r);shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);
    geo=new T.ShapeGeometry(shape,8);const pos=geo.getAttribute('position'),uv=geo.getAttribute('uv');for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)+w/2)/w,(pos.getY(i)+h/2)/h);
    geoCache.set(key,geo);geometries.push(geo);
   }return geo;
  }

  function solid(parent:T.Object3D,w:number,h:number,depth:number,x:number,y:number,z:number,material:T.Material,r=2){const mesh=new T.Mesh(boxGeometry(w,h,depth,r),material);mesh.position.set(x,y,z);mesh.receiveShadow=true;mesh.castShadow=true;parent.add(mesh);return mesh}
  function lighting(s:T.Scene){s.add(new T.AmbientLight('#fff2dd',1.05));const key=new T.DirectionalLight('#fff1da',2.2);key.position.set(50,70,800);key.target.position.set(400,325,0);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-700,right:700,top:700,bottom:-700,near:1,far:1800});key.shadow.bias=-.0005;key.shadow.normalBias=.4;s.add(key,key.target);const fill=new T.DirectionalLight('#d1e8df',.7);fill.position.set(1000,750,550);s.add(fill);const pink=new T.DirectionalLight('#df76a3',.15);pink.position.set(-300,600,150);s.add(pink)}
  lighting(scene);lighting(handScene);lighting(armScene);
  const faceLamp=makeMaterial(new T.MeshBasicMaterial({color:'#ff74bd',transparent:true,opacity:.55,depthWrite:false,toneMapped:false}));
  const shine=makeMaterial(new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{clock:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform float clock;varying vec2 vUv;void main(){float t=mod(clock,2.8);float progress=clamp(t/.95,0.0,1.0);float center=-.25+1.5*progress;float stripe=1.0-smoothstep(0.035,0.16,abs(vUv.x*.72+vUv.y*.28-center));float edge=smoothstep(0.0,.045,vUv.x)*smoothstep(0.0,.045,vUv.y)*smoothstep(0.0,.045,1.0-vUv.x)*smoothstep(0.0,.045,1.0-vUv.y);gl_FragColor=vec4(1.0,.88,.76,stripe*edge*.46*sin(3.14159265*progress));}'}));
  const haloMaterial=makeMaterial(new T.MeshBasicMaterial({color:'#eaa4bd',transparent:true,depthWrite:false,toneMapped:false,side:T.DoubleSide,opacity:.85}));
  function addShine(group:T.Group,t:Tile|undefined,w:number,h:number,depth:number){if(!t||reduceShine||!doraFaces.has(t.face))return;const strip=new T.Mesh(planeGeometry(w-3,h-3),shine);strip.position.z=depth/2+.24;strip.renderOrder=3;group.add(strip);group.userData.dora=true;group.userData.doraFace=t.face}
  const ringGold=makeMaterial(new T.MeshBasicMaterial({color:'#b7f5bd',transparent:true,opacity:.9,toneMapped:false})),ringBlue=makeMaterial(new T.MeshBasicMaterial({color:'#7acbdf',transparent:true,opacity:.8,toneMapped:false}));
  function loadImage(src:string){return new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=src})}
  function canvasTexture(canvas:HTMLCanvasElement,face=false){const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
   // The shared camera already maps table +Y downward. Invert V only for face art;
   // a 180-degree UV rotation also inverts U and mirrors every character.
   if(face){texture.flipY=false;texture.minFilter=T.LinearMipmapLinearFilter;texture.generateMipmaps=true;}
   textures.push(texture);return texture}
  async function prepare(){
   const identities=[...approvedTileFaces.map(face=>({face,red:false})),...['5m','5p','5s'].map(face=>({face,red:true}))];
   const [backImage,tableImage,...faceImages]=await Promise.all([loadImage('/art/v5/TILE_BACK_MASTER__BLACK_GOLD_NO_LOGO.png'),loadImage('/art/v5/TABLE_MATERIAL_MASTER__NOT_GEOMETRY.png'),...identities.map(t=>loadImage(tileFaceUrl(t.face,t.red))),...identities.map(t=>loadImage(completeTileUrl(t.face,t.red))),loadImage('/art/tiles/complete/back.svg')]);
   if(disposed)return;
   const backCanvas=document.createElement('canvas');backCanvas.width=240;backCanvas.height=336;
   // Use only the front-on material inset of the locked master, never its photographed body.
   backCanvas.getContext('2d')!.drawImage(backImage,184/1536*backImage.width,122/1024*backImage.height,342/1536*backImage.width,400/1024*backImage.height,0,0,240,336);
   back=makeMaterial(new T.MeshBasicMaterial({map:canvasTexture(backCanvas),side:T.DoubleSide,toneMapped:false}));
   const fabricCanvas=document.createElement('canvas');fabricCanvas.width=512;fabricCanvas.height=512;
   // The master is material guidance, not the table's photographed oval geometry or logo.
   fabricCanvas.getContext('2d')!.drawImage(tableImage,820,15,180,60,0,0,512,512);
   const fc=fabricCanvas.getContext('2d')!,pixels=fc.getImageData(0,0,512,512);for(let i=0;i<pixels.data.length;i+=4){const value=224+((pixels.data[i]!+pixels.data[i+1]!+pixels.data[i+2]!)/3-128)*.65;pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=value}fc.putImageData(pixels,0,0);
   const fabric=canvasTexture(fabricCanvas);fabric.wrapS=fabric.wrapT=T.MirroredRepeatWrapping;fabric.repeat.set(4,4);
   felt=makeMaterial(new T.MeshLambertMaterial({map:fabric,bumpMap:fabric,bumpScale:.045,color:'#00443c',toneMapped:false}));
   for(const [i,t] of identities.entries()){
    const c=document.createElement('canvas');c.width=352;c.height=480;c.getContext('2d')!.drawImage(faceImages[i]!,0,0,352,480);
    faceMaterials.set(t.face+':'+t.red,makeMaterial(new T.MeshBasicMaterial({map:canvasTexture(c,true),toneMapped:false})));
   }
   for(const [i,t] of [...identities,{face:'back',red:false}].entries()){
    const c=document.createElement('canvas');c.width=376;c.height=556;c.getContext('2d')!.drawImage(faceImages[identities.length+i]!,0,0,376,556);
    handArtMaterials.set(t.face+':'+t.red,makeMaterial(new T.MeshBasicMaterial({map:canvasTexture(c,true),transparent:true,depthWrite:false,toneMapped:false})));
   }
   const stickImage=await loadImage('/art/update-26/carrot-riichi.png'),stickCanvas=document.createElement('canvas');stickCanvas.width=512;stickCanvas.height=128;stickCanvas.getContext('2d')!.drawImage(stickImage,0,0,512,128);stickMaterial=makeMaterial(new T.MeshBasicMaterial({map:canvasTexture(stickCanvas,true),transparent:true,side:T.DoubleSide,depthWrite:false,toneMapped:false}));
   root!.dataset.handArt='complete-art-master';
   root!.dataset.tileArt='approved-atlases';
   renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});const gl=renderer.getContext(),debug=gl.getExtension('WEBGL_debug_renderer_info'),software=/swiftshader|llvmpipe|softpipe|software/i.test(String(gl.getParameter(debug?.UNMASKED_RENDERER_WEBGL??gl.RENDERER))),quality=localStorage.getItem('bunny-graphics')??'auto',lowQuality=quality==='low'||quality==='auto'&&software;root!.dataset.quality=lowQuality?'low':'high';renderer.setSize(W,H);renderer.setPixelRatio(Math.min(Math.max(devicePixelRatio,1.5),lowQuality?1.5:2.5));for(const texture of textures){texture.anisotropy=Math.min(16,renderer.capabilities.getMaxAnisotropy());texture.needsUpdate=true;}root!.dataset.faceSampling='anisotropic-mipmaps-large-glyphs';root!.dataset.renderPixelRatio=String(renderer.getPixelRatio());renderer.autoClear=false;renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=!lowQuality;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.domElement.setAttribute('aria-hidden','true');root!.append(renderer.domElement);renderer.domElement.addEventListener('webglcontextlost',onLost);renderer.domElement.addEventListener('webglcontextrestored',onRestored);
   armRenderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});armRenderer.setSize(W,H);armRenderer.setPixelRatio(Math.min(devicePixelRatio,1.25));armRenderer.setClearColor(0,0);armRenderer.outputColorSpace=T.SRGBColorSpace;armRenderer.toneMapping=T.ACESFilmicToneMapping;armRenderer.domElement.setAttribute('aria-hidden','true');armLayer.append(armRenderer.domElement);
   const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment();env=pmrem.fromScene(room,.04);room.dispose();pmrem.dispose();scene.environment=env.texture;handScene.environment=env.texture;armScene.environment=null;armScene.environmentIntensity=.5;scene.environmentIntensity=.5;handScene.environmentIntensity=.3;
   solid(tableBase,1106,986,30,0,325,-44,leather,12);
   solid(tableBase,1092,972,20,0,325,-30,tableRose,10);
   solid(tableBase,1080,960,15,0,325,-22,tableGold,8);
   solid(tableBase,1069,949,13,0,325,-16,tableRose,7);
   solid(tableBase,1036,916,9,0,325,-10,leather,5);
   solid(tableBase,1018,898,8,0,325,-7,tableGold,4);
   solid(tableBase,1000,880,6,0,325,-3,felt,3);
   // Polished rose-metal seam beneath the champagne bevel.
   const accent=makeMaterial(new T.MeshStandardMaterial({color:'#bc8f84',roughness:.18,metalness:.95}));
   solid(tableBase,1091,971,2,0,325,-30,accent,1);
   // Inverse-project the photographed master back onto the existing felt plane.
   // The camera, tile positions and table aspect stay identical on every device.
   const master=await loadImage('/art/table/rose-gold-v1/table-master.png');
   if(disposed)return;
   const masterCanvas=document.createElement('canvas');masterCanvas.width=master.width;masterCanvas.height=master.height;masterCanvas.getContext('2d')!.drawImage(master,0,0);
   const masterMap=canvasTexture(masterCanvas,true);masterMap.anisotropy=Math.min(16,renderer.capabilities.getMaxAnisotropy());
   const artGeo=new T.PlaneGeometry(1,1,96,64),pos=artGeo.getAttribute('position'),uv=artGeo.getAttribute('uv');
   const left=300,right=1370,top=122,bottom=733,lowerLeft=170,lowerRight=1500,g=(right-left)/(lowerRight-lowerLeft)-1,d=bottom*(g+1)-top,b=lowerLeft*(g+1)-left;
   const edge=(n:number,factor:number)=>n<0?n*factor:n>1?1+(n-1)*factor:n;
   for(let i=0;i<pos.count;i++){
    const px=uv.getX(i)*master.width,py=(1-uv.getY(i))*master.height,v=(top-py)/(py*g-d),u=(px*(1+g*v)-b*v-left)/(right-left);
    pos.setXYZ(i,-100+1000*edge(u,.45),-115+880*edge(v,.35),-2);
    uv.setY(i,1-uv.getY(i));
   }
   artGeo.computeVertexNormals();geometries.push(artGeo);
   const tableArt=new T.Mesh(artGeo,makeMaterial(new T.MeshBasicMaterial({map:masterMap,transparent:true,side:T.DoubleSide,toneMapped:false,depthWrite:false})));tableArt.name='approved-table-master';scene.add(tableArt);tableBase.visible=false;
   root!.dataset.tableMaster='rose-gold-v1';root!.dataset.tableAspect='fixed-camera-no-stretch';
   void loadTableHands(armScene,schedule,(point,margin)=>{const p=new T.Vector3(point.x,-point.y,point.z).project(camera),x=(p.x+1)*renderWidth/2,y=(1-p.y)*H/2;return Number.isFinite(x)&&Number.isFinite(y)&&(x< -margin||x>renderWidth+margin||y< -margin||y>H+margin)},id=>stage!.dispatchEvent(new CustomEvent(id.startsWith('riichi:')?'bunny:riichi-placed':'bunny:tile-settled',{bubbles:true,detail:{id}})),id=>stage!.dispatchEvent(new CustomEvent('bunny:tile-drawn',{bubbles:true,detail:{id}}))).then(value=>{if(disposed)value.dispose();else{hands=value;root!.dataset.handRig='approved-round-paw';root!.dataset.handMotion='discard-0.72s';root!.dataset.tablePalette='rose-gold-deep-emerald';root!.dataset.handTriangles=String(value.triangles);schedule()}}).catch(()=>{root!.dataset.handRig='unavailable';window.dispatchEvent(new Event('bunny:motion-unavailable'))});
   redraw.current=schedule;observer.observe(stage!,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','disabled']});stage!.addEventListener('pointerover',interaction);stage!.addEventListener('pointerout',interaction);window.addEventListener('resize',schedule);schedule();
  }
  function faceMaterial(tile?:Tile){return tile?(faceMaterials.get(tile.face+':'+tile.red)??faceMaterials.get(tile.face+':false')!):back}
  function addInspection(group:T.Group,w:number,h:number,depth:number,rim=true){const lamp=new T.Mesh(roundedFaceGeometry(w-1,h-1),faceLamp);lamp.position.z=depth/2+.2;lamp.renderOrder=3;group.add(lamp);group.userData.faceLit=true;if(rim)for(const [rw,rh,rx,ry] of [[w,2.2,0,h/2-1],[w,2.2,0,-h/2+1],[2.2,h,w/2-1,0],[2.2,h,-w/2+1,0]]){const edge=new T.Mesh(planeGeometry(rw!,rh!),inspectionRim);edge.position.set(rx!,ry!,depth/2+.3);edge.renderOrder=4;group.add(edge)}}
  const inspectionRim=makeMaterial(new T.MeshBasicMaterial({color:'#ffe5fa',toneMapped:false}));
  function tile(parent:T.Group,x:number,y:number,z:number,t?:Tile,yaw=0,standing=false,w=31,h=43,depth=13.6,highlight?:T.Material,completeArt=false,faceLit=false){
   const lampOnly=faceLit;faceLit=faceLit||!!t&&t.face===latest.current.hover;const group=new T.Group();group.position.set(x,y,z);group.rotation.z=yaw;parent.add(group);if(completeArt){
    const art=new T.Mesh(planeGeometry(w,h),handArtMaterials.get(t?t.face+':'+!!t.red:'back:false')!);art.position.z=depth/2+.03;group.add(art);group.userData.completeArt=true;if(faceLit)addInspection(group,w,h,depth,!lampOnly);addShine(group,t,w,h,depth);return group;
   }if(standing)group.rotateX(Math.PI/2);
   const body=new T.Mesh(boxGeometry(w,h,depth,2.1),ivory);body.castShadow=true;body.receiveShadow=true;group.add(body);
   // Ivory volume, gold seam, and separate original-art surfaces: not flat cards with drop shadows.
   const belt=new T.Mesh(boxGeometry(w+.15,h+.15,1.1,.48),gold);belt.position.z=-depth/2+1.2;group.add(belt);
   const face=new T.Mesh(t?roundedFaceGeometry(w-3,h-3):planeGeometry(w-3,h-3),faceMaterial(t));face.position.z=depth/2+.03;group.add(face);
   const rear=new T.Mesh(planeGeometry(w-3,h-3),back);rear.position.z=-depth/2-.03;rear.rotation.y=Math.PI;group.add(rear);
   if(!t){const trim=new T.Mesh(boxGeometry(w-.5,h-.5,1,.45),gold);trim.position.z=depth/2-.55;group.add(trim)}
   if(faceLit)addInspection(group,w,h,depth)
   addShine(group,t,w,h,depth);
   if(highlight){for(const [rw,rh,rx,ry] of [[w+4,1.5,0,h/2+1.5],[w+4,1.5,0,-h/2-1.5],[1.5,h+4,w/2+1.5,0],[1.5,h+4,-w/2-1.5,0]]){const edge=new T.Mesh(planeGeometry(rw!,rh!),highlight);edge.position.set(rx!,ry!,depth/2+.3);group.add(edge)}}
   return group;
  }
  const anchors=[[302,470],[508,425],[496,201],[291,192]],yaws=[0,-Math.PI/2,Math.PI,Math.PI/2];
  function place(relative:number,u:number,v:number){const [x,y]=anchors[relative]!,angle=yaws[relative]!;return [x!+u*Math.cos(angle)-v*Math.sin(angle),y!+u*Math.sin(angle)+v*Math.cos(angle)] as const}
  function riverPoint(relative:number,tiles:Tile[],index:number,riichiId?:string){const start=Math.floor(index/6)*6,u=tiles.slice(start,index).reduce((sum,t)=>sum+(t.id===riichiId?38:28)+1.5,0),advance=tiles[index]?.id===riichiId?38:28;return place(relative,u+advance/2,Math.floor(index/6)*40+19)}
  function meld(parent:T.Group,m:Game['hand']['melds'][Seat][number],seat:Seat,x:number,y:number,yaw:number,scale=1){
   const closed=m.open===false,added=m.type==='kan'&&!closed&&m.tiles.findIndex(t=>t.id===m.calledTile.id)<3,main=added?m.tiles.slice(0,3):m.tiles,ordered=main.filter(t=>t.id!==m.calledTile.id);if(!closed)ordered.splice(calledPosition(seat,m.from)===2?ordered.length:calledPosition(seat,m.from),0,m.calledTile);
   let cursor=0;for(const [i,t] of (closed?main:ordered).entries()){const sideways=!closed&&t.id===m.calledTile.id,advance=(sideways?43:31)*scale;const center=cursor+advance/2,px=x+center*Math.cos(yaw)-(sideways?6*scale:0)*Math.sin(yaw),py=y+center*Math.sin(yaw)+(sideways?6*scale:0)*Math.cos(yaw);const physical=tile(parent,px,py,7*scale,closed&&(i===1||i===2)?undefined:t,yaw+(sideways?Math.PI/2:0),false,31*scale,43*scale,13.6*scale);physical.name='meld';physical.userData.seat=seat;if(added&&sideways){const extra=tile(parent,px,py,21*scale,m.tiles[3],yaw+Math.PI/2,false,31*scale,43*scale,13.6*scale);extra.name='meld';extra.userData.seat=seat;}cursor+=advance+1.5*scale}return cursor;
  }
  function render(){frame=0;if(disposed||contextLost||!renderer||!back)return;
   const {game,hover,riichiTiles,opening,concealedDrawId}=latest.current,h=game.hand,order=Array.from({length:4},(_,i)=>seats[(seats.indexOf(game.you.seat)+i)%4]!);
   const base=stage!.getBoundingClientRect(),scale=base.width/W,width=Math.max(W,innerWidth/scale),panorama=(width-W)/2;tableBase.scale.x=1;
   if(Math.abs(width-renderWidth)>.5){renderWidth=width;renderer.setSize(renderWidth,H);root!.style.left=-panorama+'px';root!.style.right='auto';root!.style.width=renderWidth+'px';armLayer.style.left=-panorama+'px';armLayer.style.width=renderWidth+'px';armRenderer?.setSize(renderWidth,H);for(const [cam,original] of [[camera,projection],[handCamera,handProjection]] as const){cam.projectionMatrix.copy(original);for(const index of [0,4,8,12])cam.projectionMatrix.elements[index]*=W/renderWidth;cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert()}}
   doraFaces=new Set(h.doraIndicators.map(t=>doraFromIndicator(t.face as Parameters<typeof doraFromIndicator>[0])));reduceShine=localStorage.getItem('bunny-options')?.includes('\"reduceEffects\":true')===true||matchMedia('(prefers-reduced-motion:reduce)').matches;shine.uniforms.clock!.value=(Date.now()%2800)/1000;
   const key=[game.room.code,h.match.roundWind,h.match.handNumber,h.match.honba].join(':'),publicIds=new Set(Object.values(h.discards).flat().map(t=>t.id));
   if(historyKey!==key){hands?.stop();lastHandPositions.clear();previousCounts=undefined;placedRiichi.clear();drawMotions.clear();for(const seat of order)if(h.riichi[seat]&&riichiTiles[seat])placedRiichi.add('riichi:'+seat+':'+riichiTiles[seat]);historyKey=key;lastDiscardId=h.claim?.tile.id;previousDiscards=publicIds;historyRevision=h.revision}
   else if(historyRevision!==h.revision){const added=[...publicIds].filter(id=>!previousDiscards.has(id));if(added.length===1){lastDiscardId=added[0];if(!opening&&localStorage.getItem('bunny-options')?.includes('\"reduceEffects\":true')!==true){const relative=order.findIndex(seat=>h.discards[seat].some(t=>t.id===lastDiscardId)),index=h.discards[order[relative]!]!.findIndex(t=>t.id===lastDiscardId),[x,y]=riverPoint(relative,h.discards[order[relative]!]!,index,riichiTiles[order[relative]!]);root!.dataset.handGesture=relative+':Discard';hands?.play(relative,'Discard',x,y,{id:lastDiscardId!,from:lastHandPositions.get(lastDiscardId!)??new T.Vector3(...([[400,735,7],[755,340,7],[400,-35,7],[45,340,7]][relative] as [number,number,number]))})}}if(lastDiscardId&&!publicIds.has(lastDiscardId))lastDiscardId=undefined;previousDiscards=publicIds;historyRevision=h.revision}
   if(h.claim?.tile.id)lastDiscardId=h.claim.tile.id;if(lastDiscardId!==lastHaloId){lastHaloId=lastDiscardId??'';lastHaloAt=0}haloMaterial.opacity=Date.now()-lastHaloAt<400?.8:.42;
   for(const [relative,seat] of order.entries()){
    const id=riichiTiles[seat],gesture='riichi:'+seat+':'+id;if(!h.riichi[seat]||!id||placedRiichi.has(gesture))continue;placedRiichi.add(gesture);
    if(localStorage.getItem('bunny-options')?.includes('"reduceEffects":true'))continue;
    const tray=stage!.querySelector<HTMLElement>('.tray-'+relative)?.getBoundingClientRect();if(!tray)continue;
    const sx=(tray.left-base.left+tray.width/2)/scale,sy=(tray.top-base.top+tray.height/2)/scale,a=new T.Vector3((sx+panorama)/renderWidth*2-1,1-sy/H*2,-1).unproject(camera),b=new T.Vector3((sx+panorama)/renderWidth*2-1,1-sy/H*2,1).unproject(camera),q=a.clone().lerp(b,(7.2-a.z)/(b.z-a.z));
    hands?.play(relative,'Riichi',q.x,-q.y,{id:gesture,from:new T.Vector3(...([[400,735,7],[755,340,7],[400,-12,7],[45,340,7]][relative] as [number,number,number]))});
   }
   const counts=order.map(seat=>h.concealedCounts[seat]);
   const reduce=localStorage.getItem('bunny-options')?.includes('"reduceEffects":true')===true||matchMedia('(prefers-reduced-motion: reduce)').matches;
   if(reduce||opening)hands?.stop();else if(previousCounts)for(let i=0;i<4;i++)if(counts[i]!>previousCounts[i]!){const point=i===2?[620-(counts[i]!-1)*31,-12]:i===1?[755,79]:i===3?[45,120+(counts[i]!-1)*31]:[655,720],id=i===0?(game.you.drawnTileId??'draw-0'):'draw-'+i+'-'+h.revision;drawMotions.set(order[i]!,id);root!.dataset.handGesture=i+':Draw';if(i===1)root!.dataset.rightDrawTarget=JSON.stringify(point);hands?.play(i,'Draw',point[0]!,point[1]!,{id,from:new T.Vector3(point[0]!,point[1]!,7)})}

   previousCounts=counts;
   const wins=h.results??(h.result?[h.result]:[]),winningSeats=wins.map(r=>r.winner);
   const winner=h.result?.winner,rawWinningHand=h.settlement?.winningHand??[],winningHand=rawWinningHand.length?[...sortResultTiles(rawWinningHand.slice(0,-1)),rawWinningHand.at(-1)!]:[];
   const winnerHands=Object.fromEntries(wins.map(r=>{const tiles=h.settlement?.winningHands?.[r.winner]??(r.winner===winner?winningHand:[]);return[r.winner,tiles.length?[...sortResultTiles(tiles.slice(0,-1)),tiles.at(-1)!]:[]]})) as Partial<Record<Seat,Tile[]>>;
   const drawHands=h.phase==='exhaustive_draw'?h.settlement?.tenpaiHands:undefined;const drawReveal=!!drawHands&&Object.keys(drawHands).length>0;
   const canReveal=!h.demoPresentation&&!!winner&&winningHand.length>0&&h.cinematic?.phase!=='playing'||drawReveal;
   const revealIdentity=canReveal?key+':'+(drawReveal?'tenpai':winner):'';
   if(revealIdentity!==revealKey){revealKey=revealIdentity;revealStart=performance.now()}
   const impactTier=!drawReveal&&!reduce&&!localStorage.getItem('bunny-options')?.includes('"skipAnimation":true')&&canReveal?wins.map(result=>winImpactTier({...game,hand:{...h,result}})).find(Boolean)??null:null;
   const timing=winTiming(game),revealLead=impactTier?timing.lead:900;
   const revealAge=canReveal?(impactTier?winClockAge(winClockKey(game)):performance.now()-revealStart):0;
   const revealProgress=(_i:number)=>reduce?1:Math.max(0,Math.min(1,(revealAge-(drawReveal?200:revealLead))/WIN_FLIP_DURATION));
   const revealing=canReveal&&!reduce&&revealAge<(impactTier?timing.end:2300);
   const impactPhase=!impactTier?'none':revealAge<revealLead?'anticipation':revealAge<revealLead+WIN_FLIP_DURATION?'flip':revealAge<timing.end?'landing':'done';
   stage!.dataset.winImpact=impactPhase;
   root!.dataset.winnerReveal=canReveal?(revealAge<revealLead&&!reduce?'waiting':revealing?'flipping':'shown'):'none';
   root!.dataset.revealedWinner=winner??'';
   const movingHands=hands?.update()??false;
   marker.style.display='none';boardTiles.clear();handTiles.clear();
   // Wall counts remain authoritative game data, without drawing a physical wall.
   root!.dataset.wallTiles='0';root!.dataset.inspectedFace=hover??'';root!.dataset.doraShineCount=String([...boardTiles.children,...handTiles.children].filter(o=>o.userData.dora).length);root!.dataset.faceLitCount=String(Object.values(h.discards).flat().filter(t=>hover&&t.face===hover).length);
   for(const [relative,seat] of order.entries()){
    if(relative>0){
     const revealed=!!drawHands?.[seat]||canReveal&&winningSeats.includes(seat),tiles=drawHands?.[seat]?sortResultTiles(drawHands[seat]!):(revealed?winnerHands[seat]??[]:[]),count=revealed?tiles.length:h.concealedCounts[seat];
     for(let i=0;i<count;i++){
      if(!revealed&&hands?.drawPending(drawMotions.get(seat)??'')&&i===(relative===2||relative===1?0:count-1))continue;
      const finalGap=revealed&&i===count-1?11:0,x=relative===2?620-(count-1-i)*31+finalGap:relative===1?755:45,y=relative===2?-12:relative===1&&!revealed&&count%3===2?(i===0?79:120+(i-1)*31):120+i*31+finalGap;
      const progress=revealed?revealProgress(i):0,angle=(revealed?-1:1)*Math.PI/2*(1-progress);
      const mesh=tile(boardTiles,x,y,21.5*Math.abs(Math.sin(angle))+7.2*Math.cos(angle),revealed?tiles[i]:undefined,yaws[relative]!,false);
      mesh.rotateX(angle);
      if(relative===2){const z=mesh.position.z,screenX=(.90625*x-.234806*y+200)/(1-.000417477*y-.00024*z),shear=-.00024/.90625*screenX*(1-progress);mesh.updateMatrix();mesh.matrix.premultiply(new T.Matrix4().set(1,0,shear,-shear*z,0,1,0,0,0,0,1,0,0,0,0,1));mesh.matrixAutoUpdate=false;}
      mesh.name=revealed?(drawReveal?'tenpai-hand':'winning-hand'):'concealed';mesh.userData.seat=seat;mesh.userData.flipProgress=progress;mesh.userData.flipAngle=angle;
     }
    }
    if(!opening){for(let row=0;row<Math.ceil(h.discards[seat].length/6);row++){let cursor=0;for(const [col,t] of h.discards[seat].slice(row*6,row*6+6).entries()){
     const sideways=riichiTiles[seat]===t.id,advance=sideways?38:28,[x,y]=place(relative,cursor+advance/2,row*40+19);cursor+=advance+1.5;
     const carried=hands?.discardPose(t.id);tile(boardTiles,carried?.x??x,carried?.y??y,carried?.z??7.2,t,yaws[relative]!+(sideways?Math.PI/2:0),false,28,38,13.6,undefined,false,!!hover&&t.face===hover).name='river';
     if(lastDiscardId===t.id){root!.dataset.discardCarried=String(!!carried)}
     if(lastDiscardId===t.id&&!carried){if(!lastHaloAt){lastHaloAt=Date.now();clearTimeout(haloTimer);haloTimer=window.setTimeout(schedule,420)}haloMaterial.opacity=!reduceShine&&Date.now()-lastHaloAt<400?1:.78;const markYaw=yaws[relative]!+(sideways?Math.PI/2:0),glow=new T.Mesh(roundedFaceGeometry(13,3.2),haloMaterial);glow.position.set(x-Math.sin(markYaw)*24,y+Math.cos(markYaw)*24,.5);glow.rotation.z=markYaw;glow.name='last-discard-marker';glow.renderOrder=1;boardTiles.add(glow)}
    }}
    // Each caller's right-hand corner, not the nearest avatar's screen corner.
    let cursor=0;for(const m of relative===0?[]:h.melds[seat]){const closed=!m.open,added=m.type==='kan'&&!closed&&m.tiles.findIndex(t=>t.id===m.calledTile.id)<3,count=added?3:m.tiles.length,width=count*32.5+(closed?0:12);const [mx,my,yaw]=relative===1?[850,-35+cursor+width,-Math.PI/2]:relative===2?[cursor+width,-55,Math.PI]:[0,725-cursor-width,Math.PI/2];meld(boardTiles,m,seat,mx!,my!,yaw!);cursor+=width+10}

    }
   }
   // Oldest set stays at the right edge; subsequent calls accumulate toward the left.
   let ownCursor=0;const ownMelds=h.melds[game.you.seat];
   if(!opening)for(const m of ownMelds){const closed=!m.open,added=m.type==='kan'&&m.open&&m.tiles.findIndex(t=>t.id===m.calledTile.id)<3,count=added?3:m.tiles.length,width=count*32.5+(closed?0:12);ownCursor+=width;meld(boardTiles,m,game.you.seat,785-ownCursor,725,0,1);ownCursor+=10;}
   root!.dataset.oppositeHandAngle='upright-compensated-3d';
   // Independent foreground camera keeps the 3D hand exactly under its accessible hit targets.
   const ownWin=canReveal&&winningSeats.includes(game.you.seat);
   if(ownWin){
    const first=stage!.querySelector<HTMLButtonElement>('.phone-hand-tiles>button')?.getBoundingClientRect();
    const sx=first?(first.left-base.left+first.width/2)/scale:150,sy=first?(first.top-base.top+first.height/2)/scale:575;
    const a=new T.Vector3((sx+panorama)/renderWidth*2-1,1-sy/H*2,-1).unproject(camera),b=new T.Vector3((sx+panorama)/renderWidth*2-1,1-sy/H*2,1).unproject(camera),q=a.clone().lerp(b,(7-a.z)/(b.z-a.z));
    for(const [i,t] of (winnerHands[game.you.seat]??[]).entries()){
     const progress=revealProgress(i),angle=-Math.PI/2*(1-progress),mesh=tile(boardTiles,q.x+i*32.5+(i===(winnerHands[game.you.seat]?.length??0)-1?11:0),-q.y,21.5*Math.abs(Math.sin(angle))+7.2*Math.cos(angle),t);
     mesh.rotateX(angle);mesh.name='winning-hand';mesh.userData.seat=game.you.seat;mesh.userData.flipProgress=progress;mesh.userData.flipAngle=angle;
    }
   }
   for(const button of ownWin?[]:stage!.querySelectorAll<HTMLButtonElement>('.phone-hand-tiles>button')){
    if(getComputedStyle(button).visibility==='hidden')continue;const element=button.querySelector<HTMLElement>('.phone-tile'),rect=button.getBoundingClientRect();if(!element?.dataset.face||hands?.drawPending(button.dataset.tileId??''))continue;
    const sx=(rect.left-base.left+rect.width/2)/scale,sy=(rect.top-base.top+rect.height/2)/scale,a=new T.Vector3((sx+panorama)/renderWidth*2-1,1-sy/H*2,-1).unproject(camera),b=new T.Vector3((sx+panorama)/renderWidth*2-1,1-sy/H*2,1).unproject(camera),q=a.clone().lerp(b,(7-a.z)/(b.z-a.z));if(button.dataset.tileId)lastHandPositions.set(button.dataset.tileId,new T.Vector3(q.x,-q.y,7));
    tile(handTiles,(rect.left-base.left+rect.width/2)/scale,(rect.top-base.top+rect.height/2)/scale,-rect.width/scale*.22,button.dataset.tileId===concealedDrawId||h.phase==='exhaustive_draw'&&!h.settlement?.tenpai.includes(game.you.seat)?undefined:{id:button.dataset.tileId??'',face:element.dataset.face,red:element.dataset.red==='true'},0,false,rect.width/scale,rect.height/scale,rect.width/scale*.44,undefined,true,button.classList.contains('riichi-choice'));
   }
   // Project only winner tile meshes, including their actual seat orientation.
   const litTiles=boardTiles.children.filter(o=>o.name==='winning-hand'&&o.userData.seat===winner);
   const bounds=(objects:T.Object3D[])=>{const points:{x:number;y:number}[]=[];for(const object of objects){object.updateWorldMatrix(true,true);const box=new T.Box3().setFromObject(object);for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const v=new T.Vector3(x,y,z).project(camera);points.push({x:(v.x+1)*renderWidth/2-panorama,y:(1-v.y)*H/2})}}if(!points.length)return null;return {left:Math.min(...points.map(p=>p.x)),right:Math.max(...points.map(p=>p.x)),top:Math.min(...points.map(p=>p.y)),bottom:Math.max(...points.map(p=>p.y))}};
   for(let index=0;index<Math.max(wins.length,1+extraWinnerLights.length);index++){
    if(index>0&&!extraWinnerLights[index-1]){const light=createWinnerLight();stage!.append(light);extraWinnerLights.push(light)}
    const light=index===0?winnerLight:extraWinnerLights[index-1]!,win=wins[index],tier=impactTier&&win?winImpactTier({...game,hand:{...h,result:win}}):null;
    const area=tier?bounds(boardTiles.children.filter(o=>o.name==='winning-hand'&&o.userData.seat===win!.winner)):null;
    light.dataset.active=String(!!area&&impactPhase!=='done');light.dataset.phase=impactPhase;light.dataset.tier=tier??'';light.dataset.seat=win?.winner??'';
    if(area){const vertical=order.indexOf(win!.winner)%2===1,w=area.right-area.left,h=area.bottom-area.top,long=vertical?h:w,short=vertical?w:h,height=short+100;Object.assign(light.style,{left:(area.left+area.right)/2+'px',top:(area.top+area.bottom)/2+'px',width:long+50+'px',height:height+'px',transform:`translate(-50%,-50%) rotate(${vertical?90:0}deg)`});light.style.setProperty('--tile-top',(50-short/height*50)+'%');light.style.setProperty('--tile-height',short/height*100+'%');}
   }
   const winnerMelds=impactTier?boardTiles.children.filter(o=>o.name==='meld'&&winningSeats.includes(o.userData.seat)):[];
   for(let i=0;i<Math.max(winnerMelds.length,meldLights.length);i++){if(!meldLights[i]){const el=document.createElement('div');el.className='winner-meld-light';el.setAttribute('aria-hidden','true');stage!.append(el);meldLights.push(el)}const el=meldLights[i]!,b=winnerMelds[i]?bounds([winnerMelds[i]!]):null;el.dataset.active=String(!!b&&impactPhase==='landing');el.dataset.seat=winnerMelds[i]?.userData.seat??'';if(b){Object.assign(el.style,{left:b.left-3+'px',top:b.top-3+'px',width:b.right-b.left+6+'px',height:b.bottom-b.top+6+'px'});el.style.setProperty('--light',impactTier==='yakuman'?'#fff0c0':'#e9c98d')}}
   root!.dataset.doraShineCount=String([...boardTiles.children,...handTiles.children].filter(o=>o.userData.dora).length);root!.dataset.faceLitCount=String(boardTiles.children.filter(group=>group.userData.faceLit).length);root!.dataset.riichiLampCount=String(stage!.querySelectorAll('.phone-hand-tiles>button.riichi-choice').length);root!.dataset.handArtCount=String(handTiles.children.filter(group=>group.name!=='opposite-concealed').length);root!.dataset.handMoving=String(movingHands);if(import.meta.env.DEV){root!.dataset.doraFaces=JSON.stringify([...boardTiles.children,...handTiles.children].filter(o=>o.userData.dora).map(o=>o.userData.doraFace));root!.dataset.shinePhase=String(shine.uniforms.clock!.value)}if(import.meta.env.DEV)root!.dataset.handPose=JSON.stringify(hands?.debug()??[]);
   for(const object of [...armScene.children])if(object.name==='carried-riichi')armScene.remove(object);
   let carriedSticks=0;for(const [relative,seat] of order.entries()){const id=riichiTiles[seat];if(!id||!stickMaterial)continue;const pose=hands?.riichiPose('riichi:'+seat+':'+id);if(!pose)continue;const stick=new T.Mesh(planeGeometry(72,18),stickMaterial);stick.name='carried-riichi';stick.position.copy(pose);stick.rotation.z=yaws[relative]!;armScene.add(stick);carriedSticks++}root!.dataset.riichiCarried=String(carriedSticks);
   renderer.shadowMap.needsUpdate=true;renderer.clear();renderer.render(scene,camera);renderer.clearDepth();renderer.render(handScene,handCamera);armRenderer?.clear();armRenderer?.render(armScene,camera);presentTableMotion(game.room.code,h.revision,movingHands);root!.dataset.handOverlay='above-table-hud';root!.dataset.handLayer='above-foreground-tiles';
   if(import.meta.env.DEV){
    root!.dataset.oppositeVerticalEdges=JSON.stringify(boardTiles.children.filter(o=>o.name==='concealed'&&o.userData.seat===order[2]).map(o=>[-15.5,15.5].map(x=>[-21.5,21.5].map(y=>{const p=o.localToWorld(new T.Vector3(x,y,6.83)).project(camera);return[(p.x+1)*renderWidth/2-panorama,(1-p.y)*H/2]}))));
    root!.dataset.winningTiles=JSON.stringify([...boardTiles.children,...handTiles.children].filter(o=>o.name==='winning-hand').map(o=>({seat:o.userData.seat,angle:o.userData.flipAngle,progress:o.userData.flipProgress})));

    root!.dataset.layout=JSON.stringify(boardTiles.children.filter(o=>o.name).map(o=>{
     const box=new T.Box3().setFromObject(o),points=[];
     for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){const p=new T.Vector3(x,y,z).project(camera);points.push([(p.x+1)*renderWidth/2-panorama,(1-p.y)*H/2])}
     return {kind:o.name,seat:o.userData.seat,left:Math.min(...points.map(p=>p[0]!)),right:Math.max(...points.map(p=>p[0]!)),top:Math.min(...points.map(p=>p[1]!)),bottom:Math.max(...points.map(p=>p[1]!)),insideFelt:box.min.x>=-100&&box.max.x<=900&&box.min.y>=-765&&box.max.y<=115};
    }));
   }
   stage!.classList.add('physical-ready');stage!.dataset.tileRenderer='webgl';root!.dataset.ready='true';root!.dataset.tileThickness='13.6';root!.dataset.tileWidth='31';root!.dataset.boardTiles=String(boardTiles.children.length);root!.dataset.camera='shared-projective';root!.dataset.panorama=String(Math.round((renderWidth-W)/2));root!.dataset.lastDiscard=lastDiscardId??'';if(movingHands||revealing)schedule();clearTimeout(shimmerTimer);cancelAnimationFrame(shineFrame);shineFrame=0;if(!reduceShine&&[...boardTiles.children,...handTiles.children].some(o=>o.userData.dora))scheduleShine();
  }
  function scheduleShine(){if(disposed||contextLost||!renderer)return;const phase=Date.now()%2800;if(phase>=950){shimmerTimer=window.setTimeout(()=>{shineFrame=requestAnimationFrame(tickShine)},2800-phase);return}shineFrame=requestAnimationFrame(tickShine)}
  function tickShine(){shineFrame=0;if(disposed||contextLost||!renderer||reduceShine)return;if(import.meta.env.DEV)root!.dataset.shineFrames=String(Number(root!.dataset.shineFrames??0)+1);shine.uniforms.clock!.value=(Date.now()%2800)/1000;if(!frame){renderer.clear();renderer.render(scene,camera);renderer.clearDepth();renderer.render(handScene,handCamera);armRenderer?.clear();armRenderer?.render(armScene,camera)}scheduleShine()}
  function cancelMotion(){hands?.stop();cancelTableMotion();schedule()}
  window.addEventListener('bunny:cancel-motion',cancelMotion);
  function onLost(event:Event){event.preventDefault();hands?.stop();publishTableMotion(false);window.dispatchEvent(new Event('bunny:motion-unavailable'));contextLost=true;stage!.classList.remove('physical-ready');stage!.dataset.tileRenderer='fallback';root!.dataset.ready='false';fallbackFrame()}
  function onRestored(){contextLost=false;schedule()}
  function schedule(){if(!disposed&&!frame)frame=requestAnimationFrame(render)}
  function interaction(){schedule();for(const ms of [60,130])setTimeout(()=>{if(!disposed)schedule()},ms)}
  const observer=new MutationObserver(mutations=>{if(mutations.some(m=>{const e=m.target instanceof HTMLElement?m.target:m.target.parentElement;return e&&!e.closest('.winner-tile-light,.winner-meld-light,.phone-clock,.physical-renderer,.score-transition,.phone-result,.gala-result,.automatic-panel,.phone-panel,.phone-menu,.phone-options')&&!(e===stage&&m.attributeName==='data-tile-renderer')&&(m.type==='childList'||m.attributeName!=='class'||e!==stage)}))schedule()});
  function fallbackFrame(){if(disposed)return;requestAnimationFrame(()=>{if(disposed)return;const g=latest.current.game;presentTableMotion(g.room.code,g.hand.revision,false);fallbackTimer=window.setTimeout(fallbackFrame,50)})}
  let fallbackTimer:number|undefined;
  void prepare().catch(()=>{if(!disposed){stage.dataset.tileRenderer='fallback';stage.classList.remove('physical-ready');fallbackFrame()}});
  return()=>{cancelAnimationFrame(shineFrame);clearTimeout(haloTimer);clearTimeout(shimmerTimer);clearTimeout(fallbackTimer);window.removeEventListener('bunny:cancel-motion',cancelMotion);publishTableMotion(false);disposed=true;cancelAnimationFrame(frame);observer.disconnect();stage.removeEventListener('pointerover',interaction);stage.removeEventListener('pointerout',interaction);window.removeEventListener('resize',schedule);delete stage.dataset.winImpact;stage.classList.remove('physical-ready');marker.remove();winnerLight.remove();extraWinnerLights.forEach(el=>el.remove());meldLights.forEach(el=>el.remove());armLayer.remove();armRenderer?.dispose();armRenderer?.forceContextLoss();if(renderer){renderer.domElement.removeEventListener('webglcontextlost',onLost);renderer.domElement.removeEventListener('webglcontextrestored',onRestored);renderer.domElement.remove();renderer.dispose();renderer.forceContextLoss()}hands?.dispose();env?.dispose();for(const geo of geometries)geo.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();for(const s of [scene,handScene,armScene])s.traverse(o=>{if(o instanceof T.DirectionalLight)o.shadow.dispose()});redraw.current=()=>{}};
 },[]);
 return <div className="physical-renderer" ref={node} aria-hidden="true"/>;
}
