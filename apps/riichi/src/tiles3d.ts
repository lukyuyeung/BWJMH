import * as THREE from 'three';
import {uprightPose} from './seat-space.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const W=1536,H=1024;
const backPath='/art/v5/TILE_BACK_MASTER__BLACK_GOLD_NO_LOGO.png';
const glyphs:Record<string,string>={E:'東',S:'南',W:'西',N:'北',F:'發',C:'中'};
const pips:Record<number,number[][]>={1:[[30,42]],2:[[30,20],[30,64]],3:[[15,18],[30,42],[45,66]],4:[[16,20],[44,20],[16,64],[44,64]],5:[[16,18],[44,18],[30,42],[16,66],[44,66]],6:[[16,18],[44,18],[16,42],[44,42],[16,66],[44,66]],7:[[16,16],[30,26],[44,16],[16,48],[44,48],[16,68],[44,68]],8:[[16,14],[44,14],[16,32],[44,32],[16,50],[44,50],[16,68],[44,68]],9:[[14,18],[30,18],[46,18],[14,42],[30,42],[46,42],[14,66],[30,66],[46,66]]};

function faceCanvas(face:string,red:boolean){
 const canvas=document.createElement('canvas');canvas.width=240;canvas.height=336;
 const c=canvas.getContext('2d')!;
 const ivory=c.createLinearGradient(0,0,240,336);ivory.addColorStop(0,'#fff9eb');ivory.addColorStop(.5,'#fff0d9');ivory.addColorStop(1,'#ead5b2');c.fillStyle=ivory;c.fillRect(0,0,240,336);
 // Small material variation is deterministic, independent of any game information.
 c.fillStyle='#8f754305';for(let i=0;i<350;i++)c.fillRect((i*73)%240,(i*97)%336,1,1);
 c.textAlign='center';c.textBaseline='middle';c.shadowColor='#66513255';c.shadowBlur=1;c.shadowOffsetY=1;
 if(glyphs[face]){c.font='700 172px "LXGW WenKai TC"';c.fillStyle=face==='C'?'#a32425':face==='F'?'#1b613e':'#26261f';c.fillText(glyphs[face]!,120,176);c.strokeStyle=c.fillStyle;c.lineWidth=2;c.strokeText(glyphs[face]!,120,176);}
 else if(face!=='P'){
  const rank=Number(face[0]);
  if(face[1]==='m'){c.font='700 106px "LXGW WenKai TC"';c.fillStyle=red?'#b42328':'#29271f';c.fillText('一二三四五六七八九'[rank-1]!,120,98);c.fillStyle='#a72428';c.font='700 120px "LXGW WenKai TC"';c.fillText('萬',120,235);c.strokeStyle=c.fillStyle;c.lineWidth=2;c.strokeText('萬',120,235);}
  else {c.save();c.scale(4,4);for(const [x,y] of pips[rank]??[]){if(face[1]==='p'){c.strokeStyle=red?'#b32228':x===30&&y===42?'#a72428':'#214b3e';const r=rank===1?18:rank<4?8:6;c.lineWidth=rank===1?2:1.7;c.beginPath();c.arc(x!,y!,r,0,Math.PI*2);c.stroke();c.lineWidth=1.2;c.beginPath();c.arc(x!,y!,r*.62,0,Math.PI*2);c.stroke();for(let petal=0;petal<8;petal++){const a=petal*Math.PI/4;c.beginPath();c.arc(x!+Math.cos(a)*r*.39,y!+Math.sin(a)*r*.39,r*.18,0,Math.PI*2);c.stroke();}}else{c.fillStyle=red?'#b32228':'#20633d';c.beginPath();c.roundRect(x!-2.5,y!-6,5,12,1.5);c.fill();c.fillRect(x!-4,y!-5,8,2);c.fillRect(x!-4,y!+3,8,2);}}c.restore();}
 }
 return canvas;
}

// Keep React's existing accessible elements and authoritative action handlers.
// Their layout supplies poses only; faces come exclusively from private/public payloads.
function layoutMatrix(el:HTMLElement,root:HTMLElement,depth:number):DOMMatrix{
 let result=new DOMMatrix();let node:HTMLElement|null=el;
 while(node&&node!==root){
  const style=getComputedStyle(node),origin=style.transformOrigin.split(' ').map(parseFloat);
  let transform=style.transform==='none'?new DOMMatrix():new DOMMatrix(style.transform);
  if(node===el){
   if(el.closest('.concealed'))transform=new DOMMatrix().translate(0,0,depth);
   else if(el.closest('.wall-stack'))transform=new DOMMatrix().translate(0,0,el.closest('.wall-indicator')?0:el.classList.contains('wall-lower')?depth:depth*2+1);
   else transform=new DOMMatrix().translate(0,0,depth).rotate(0,0,el.classList.contains('sideways')?90:0);
  }
  const local=new DOMMatrix().translate(node.offsetLeft,node.offsetTop).translate(origin[0]??0,origin[1]??0,origin[2]??0).multiply(transform).translate(-(origin[0]??0),-(origin[1]??0),-(origin[2]??0));
  result=local.multiply(result);node=node.offsetParent as HTMLElement|null;
 }
 return result.translate(el.offsetWidth/2,el.offsetHeight/2,-depth/2);
}

export function mountTiles3D(root:HTMLElement):()=>void{
 let softwareRenderer=false,lowQuality=false,renderCount=0;let disposed=false,contextLost=false,frame=0,renderer:THREE.WebGLRenderer|undefined,environment:THREE.WebGLRenderTarget|undefined;
 const geometries=new Map<string,THREE.BufferGeometry>(),materials=new Map<string,THREE.Material>(),textures:THREE.Texture[]=[];
 const tiles=new Map<HTMLElement,THREE.Group>();
 const boardScene=new THREE.Scene(),handScene=new THREE.Scene();
 const camera=new THREE.Camera();
 // Calibrated table homography. Z gives actual volume above the photographed felt.
 const a=.63,b=-.5458172997423638,d=-.002711675706537,g=-.00071367399371967,tx=450,ty=400;
 camera.projectionMatrix.set(2*a/W,-2*b/W+g,0,2*tx/W-1,0,2*d/H-g,2*.65/H,1-2*ty/H,0,.00035,-.001,0,0,-g,0,1);
 camera.position.set(500,-1200,800);camera.lookAt(500,-300,0);camera.updateMatrixWorld();
 // Keep the calibrated felt coordinates while supplying the real viewing direction
 // to material shaders (an origin-level camera caused grazing, washed-out highlights).
 camera.projectionMatrix.multiply(camera.matrixWorld);camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
 const originalProjection=camera.projectionMatrix.clone();
 const handCamera=new THREE.OrthographicCamera(-W/2,W/2,H/2,-H/2,1,2500);handCamera.position.set(W/2,-H/2-1000,900);handCamera.lookAt(W/2,-H/2,0);handCamera.updateMatrixWorld();
 const handPlane=new THREE.Plane(new THREE.Vector3(0,0,1),0),handRay=new THREE.Raycaster();
 const debug=(import.meta as any).env.DEV&&new URLSearchParams(location.search).get('debugCamera')==='side';
 const sideCamera=new THREE.PerspectiveCamera(40,W/H,1,4000);sideCamera.position.set(1700,-1150,520);sideCamera.up.set(0,0,1);sideCamera.lookAt(500,-300,35);sideCamera.updateMatrixWorld();
 const ivory=new THREE.MeshPhysicalMaterial({color:'#fff0d9',roughness:.78,metalness:0,clearcoat:.06,clearcoatRoughness:.8});
  const gold=new THREE.MeshStandardMaterial({color:'#eeb64b',metalness:.85,roughness:.22});
  const shadowMaterial=new THREE.ShadowMaterial({opacity:.35});
 const floorGeometry=new THREE.PlaneGeometry(1200,780),floor=new THREE.Mesh(floorGeometry,shadowMaterial);floor.position.set(500,-350,-.8);floor.receiveShadow=true;boardScene.add(floor);
 function lighting(scene:THREE.Scene,hand=false){
  scene.add(new THREE.AmbientLight('#fff0df',.7));
  const key=new THREE.DirectionalLight('#ffe0bd',1.6);key.position.set(hand?350:100,hand?-150:50,800);key.target.position.set(hand?800:500,hand?-820:-300,0);scene.add(key,key.target);
  if(!hand){key.castShadow=true;key.shadow.mapSize.set(512,512);Object.assign(key.shadow.camera,{left:-750,right:750,top:750,bottom:-750,near:1,far:2000});key.shadow.bias=-.0006;key.shadow.normalBias=.9;}
  const rim=new THREE.DirectionalLight('#e685b3',.22);rim.position.set(1200,-400,400);scene.add(rim);
  const fill=new THREE.DirectionalLight('#d7e6e3',.65);fill.position.set(600,-900,400);scene.add(fill);
 }
 lighting(boardScene);lighting(handScene,true);
 const shadowCanvas=document.createElement('canvas');shadowCanvas.width=64;shadowCanvas.height=64;const sc=shadowCanvas.getContext('2d')!;const sg=sc.createRadialGradient(32,32,4,32,32,32);sg.addColorStop(0,'#000a');sg.addColorStop(1,'#0000');sc.fillStyle=sg;sc.fillRect(0,0,64,64);const shadowTexture=new THREE.CanvasTexture(shadowCanvas);textures.push(shadowTexture);const contactMaterial=new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false});const contacts=new Map<HTMLElement,THREE.Mesh>();const contactGeo=new THREE.PlaneGeometry(1,1);

 const flip=new THREE.Matrix4().makeScale(1,-1,1);
 let back:THREE.MeshStandardMaterial;let highlightSequence=0,lastFrame=0,geometryDirty=true;
 function material(face:string,red:boolean,own:boolean){
  const key=face+':'+red+':'+own;let m=materials.get(key);if(m)return m;
  const map=new THREE.CanvasTexture(faceCanvas(face,red));map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;textures.push(map);
  m=own?new THREE.MeshPhysicalMaterial({map,roughness:.8,envMapIntensity:.05,clearcoat:.04}):new THREE.MeshBasicMaterial({map,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});materials.set(key,m);return m;
 }
 function render(){
  frame=0;if(disposed||contextLost||!renderer||!back)return;
  const layout=getComputedStyle(root),tableScale=Number(layout.getPropertyValue('--table-scale'))||1,tableOffset=parseFloat(layout.getPropertyValue('--table-offset'))||0;
  const reframing=new THREE.Matrix4().makeScale(1,tableScale,1);reframing.elements[13]=1-tableScale-2*tableOffset/H;const projected=originalProjection.clone().multiply(camera.matrixWorldInverse).premultiply(reframing);projected.elements[9]!+=(1-tableScale)*2*.65/H;camera.projectionMatrix.copy(projected).multiply(camera.matrixWorld);camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  const now=performance.now();if(now-lastFrame<(lowQuality?250:80)){schedule(false);return;}lastFrame=now;
  // Pulse-only frames reuse seat transforms, clipping and contact calculations.
  // Rebuild poses only after an actual board/hand/layout mutation.
  if(!geometryDirty&&tiles.size){
   let golden=false;for(const mesh of tiles.values()){const ring=mesh.getObjectByName('highlight') as THREE.Mesh|undefined;if(ring?.visible&&mesh.userData.latest){golden=true;(ring.material as THREE.MeshBasicMaterial).opacity=document.documentElement.dataset.reduceEffects==='true'||matchMedia('(prefers-reduced-motion: reduce)').matches?1:.65+.35*Math.sin(now/300);}}
   renderer.shadowMap.needsUpdate=false;renderer.info.reset();renderer.clear();renderer.render(boardScene,debug?sideCamera:camera);renderer.clearDepth();renderer.render(handScene,handCamera);renderer.domElement.dataset.renderCount=String(++renderCount);
   if(golden&&!document.hidden&&document.documentElement.dataset.reduceEffects!=='true'&&!matchMedia('(prefers-reduced-motion: reduce)').matches)schedule(false);
   return;
  }
  const board=root.querySelector<HTMLElement>('.board');if(!board)return;
  const present=new Set<HTMLElement>();let clippedBodies=0,matching=0,golden=false,uprightErrors=0,contactErrors=0;
  for(const el of root.querySelectorAll<HTMLElement>('.board .tile,.board .tile-back,.board .wall-lower,.hand .tile,.hand .tile-back')){
   present.add(el);const own=!!el.closest('.hand'),w=el.offsetWidth,h=own&&!el.closest('.own-melds')?el.offsetHeight/Math.cos(Math.atan2(900,1000)):el.offsetHeight,depth=own?36:Math.min(22,w*.49);
   const key=[w,h,depth].join(':');let geo=geometries.get(key);if(!geo){geo=new RoundedBoxGeometry(w,h,depth,2,own?8:4.5);geometries.set(key,geo);}
   let mesh=tiles.get(el);if(!mesh){mesh=new THREE.Group();mesh.matrixAutoUpdate=false;for(let j=0;j<4;j++){const part=new THREE.Mesh();part.frustumCulled=false;part.receiveShadow=true;part.castShadow=j===0&&!own;mesh.add(part);}tiles.set(el,mesh);(own?handScene:boardScene).add(mesh);}
   // One solid body draw and two face draws instead of six separate box-face draws.
   // The face meshes share the rounded body's vertex normals/UVs and use depth offset.
   const face=el.dataset.face,front=face?material(face,el.dataset.red==='true',own):back;
   const body=mesh.children[0] as THREE.Mesh;body.geometry=geo;body.material=ivory;
   for(let j=1;j<4;j++){const surfaceKey=key+':surface:'+j;let surface=geometries.get(surfaceKey);if(!surface){surface=geo.clone();const range=geo.groups[j===1?4:5]!;surface.clearGroups();surface.setDrawRange(range.start,range.count);geometries.set(surfaceKey,surface);}const part=mesh.children[j] as THREE.Mesh;part.geometry=surface;part.material=j===1?front:back;}
   const trimKey=key+':trim';let trimGeo=geometries.get(trimKey);if(!trimGeo){const x=-(w+.2)/2,y=-(h+.2)/2,ww=w+.2,hh=h+.2,r=Math.min(w*.11,5);const shape=new THREE.Shape();shape.moveTo(x+r,y);shape.lineTo(x+ww-r,y);shape.quadraticCurveTo(x+ww,y,x+ww,y+r);shape.lineTo(x+ww,y+hh-r);shape.quadraticCurveTo(x+ww,y+hh,x+ww-r,y+hh);shape.lineTo(x+r,y+hh);shape.quadraticCurveTo(x,y+hh,x,y+hh-r);shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);trimGeo=new THREE.ExtrudeGeometry(shape,{depth:2.3,bevelEnabled:false,curveSegments:5});trimGeo.translate(0,0,-1.15);geometries.set(trimKey,trimGeo);}const trim=mesh.children[3] as THREE.Mesh;trim.geometry=trimGeo;trim.material=gold;trim.position.z=face?-depth/2+1.4:depth/2-1.4;
   const standing=!!el.closest('.concealed')||own&&!el.closest('.own-melds');
   if(own){
    const rect=el.getBoundingClientRect(),base=root.getBoundingClientRect(),scale=base.width/W;
    const sx=(rect.left-base.left+rect.width/2)/scale,sy=(rect.top-base.top+rect.height/2)/scale;
    const centerZ=standing?h/2:depth/2;
    handPlane.constant=-centerZ;handRay.setFromCamera(new THREE.Vector2(2*sx/W-1,1-2*sy/H),handCamera);
    const center=new THREE.Vector3();handRay.ray.intersectPlane(handPlane,center);
    mesh.matrix.makeTranslation(center.x,center.y,centerZ).multiply(standing?new THREE.Matrix4().makeRotationX(uprightPose(0,h).pitch):new THREE.Matrix4().makeRotationZ(el.classList.contains('sideways')?Math.PI/2:0));
    let contact=contacts.get(el);if(!contact){contact=new THREE.Mesh(contactGeo,contactMaterial);handScene.add(contact);contacts.set(el,contact);}contact.position.set(center.x,center.y,0);contact.scale.set(w*1.4,depth*1.2,1);
   }else {
    const pose=layoutMatrix(el,board,depth);
    const anchored=flip.clone().multiply(new THREE.Matrix4().fromArray(Array.from(pose.toFloat64Array()))).multiply(flip);
    if(standing){
     const relative=el.closest('.pos-1')?1:el.closest('.pos-3')?3:2;
     const p=uprightPose(relative,h),center=new THREE.Vector3().setFromMatrixPosition(anchored);
     mesh.matrix.makeTranslation(center.x,center.y,p.centerZ).multiply(new THREE.Matrix4().makeRotationZ(p.yaw)).multiply(new THREE.Matrix4().makeRotationX(p.pitch));
    }else mesh.matrix.copy(anchored);
   }
   if(standing){const up=new THREE.Vector3(0,1,0).transformDirection(mesh.matrix);if(up.distanceTo(new THREE.Vector3(0,0,1))>1e-6)uprightErrors++;const foot=new THREE.Vector3(0,-h/2,0).applyMatrix4(mesh.matrix);if(Math.abs(foot.z)>1e-6)contactErrors++;}
   // Regression diagnostic: the calibrated depth interval must contain every tile body.
   const view=own?handCamera:camera;const clip=new THREE.Matrix4().multiplyMatrices(view.projectionMatrix,view.matrixWorldInverse).multiply(mesh.matrix);let clipped=false;
   for(const x of [-w/2,w/2])for(const y of [-h/2,h/2])for(const z of [-depth/2,depth/2]){const v=new THREE.Vector4(x,y,z,1).applyMatrix4(clip);if(v.z < -v.w||v.z>v.w)clipped=true;}
   if(clipped)clippedBodies++;
   const matched=el.classList.contains('matching-discard'),latest=el.classList.contains('latest-discard');mesh.userData.latest=latest;if(matched)matching++;if(latest)golden=true;
   let ring=mesh.getObjectByName('highlight') as THREE.Mesh|undefined;
   if((matched||latest)&&!ring){const shape=new THREE.Shape();shape.moveTo(-w/2-3,-h/2-3);shape.lineTo(w/2+3,-h/2-3);shape.lineTo(w/2+3,h/2+3);shape.lineTo(-w/2-3,h/2+3);shape.closePath();const hole=new THREE.Path();hole.moveTo(-w/2-1,-h/2-1);hole.lineTo(-w/2-1,h/2+1);hole.lineTo(w/2+1,h/2+1);hole.lineTo(w/2+1,-h/2-1);hole.closePath();shape.holes.push(hole);const geom=new THREE.ShapeGeometry(shape);const ringKey=key+':ring:'+(++highlightSequence);geometries.set(ringKey,geom);const mat=new THREE.MeshBasicMaterial({color:matched?'#70e7ff':'#ffce68',transparent:true,depthTest:false,toneMapped:false});materials.set(ringKey,mat);ring=new THREE.Mesh(geom,mat);ring.name='highlight';ring.userData.resourceKey=ringKey;ring.frustumCulled=false;ring.renderOrder=100;ring.position.z=depth/2+3;mesh.add(ring);}
   if(ring){ring.visible=matched||latest;const mat=ring.material as THREE.MeshBasicMaterial;mat.color.set(latest?'#ffce68':'#70e7ff');mat.opacity=latest&&document.documentElement.dataset.reduceEffects!=='true'&&!matchMedia('(prefers-reduced-motion: reduce)').matches ? .65+.35*Math.sin(performance.now()/300):1;}
   let dot=mesh.getObjectByName('matching-dot') as THREE.Mesh|undefined;
   if(matched&&latest&&!dot){const resourceKey=key+':matching-dot:'+(++highlightSequence);const geo=new THREE.CircleGeometry(Math.max(3,w*.13),8);const mat=new THREE.MeshBasicMaterial({color:'#70e7ff',depthTest:false,toneMapped:false});geometries.set(resourceKey,geo);materials.set(resourceKey,mat);dot=new THREE.Mesh(geo,mat);dot.name='matching-dot';dot.userData.resourceKey=resourceKey;dot.renderOrder=101;dot.position.set(w/2-6,h/2-6,depth/2+4);mesh.add(dot);}
   if(dot)dot.visible=matched&&latest;
   mesh.matrixWorldNeedsUpdate=true;
  }
  for(const [el,mesh] of tiles)if(!present.has(el)){for(const name of ['highlight','matching-dot']){const overlay=mesh.getObjectByName(name) as THREE.Mesh|undefined;if(overlay){const resourceKey=overlay.userData.resourceKey as string;overlay.geometry.dispose();(overlay.material as THREE.Material).dispose();geometries.delete(resourceKey);materials.delete(resourceKey);}}mesh.removeFromParent();tiles.delete(el);contacts.get(el)?.removeFromParent();contacts.delete(el);}
  renderer.shadowMap.needsUpdate=geometryDirty;geometryDirty=false;renderer.info.reset();renderer.clear();renderer.render(boardScene,debug?sideCamera:camera);renderer.clearDepth();renderer.render(handScene,handCamera);
  // Expose render diagnostics for browser QA without exposing any game secrets.
  root.dataset.tileRenderer='webgl';const handBounds=root.querySelector<HTMLElement>('.hand')?.getBoundingClientRect();renderer.domElement.dataset.handTop=String(handBounds?.top??-1);renderer.domElement.dataset.tableScale=String(tableScale);renderer.domElement.dataset.tableOffset=String(tableOffset);renderer.domElement.dataset.renderCount=String(++renderCount);renderer.domElement.dataset.quality=lowQuality?'low':'high';renderer.domElement.dataset.meshCount=String(tiles.size);renderer.domElement.dataset.triangles=String(renderer.info.render.triangles);renderer.domElement.dataset.clippedTileBodies=String(clippedBodies);renderer.domElement.dataset.matchingDiscards=String(matching);renderer.domElement.dataset.uprightErrors=String(uprightErrors);renderer.domElement.dataset.contactErrors=String(contactErrors);renderer.domElement.dataset.camera=debug?'side':'gameplay';
  renderer.domElement.style.visibility='visible';root.classList.add('webgl-ready');if(golden&&!document.hidden&&document.documentElement.dataset.reduceEffects!=='true'&&!matchMedia('(prefers-reduced-motion: reduce)').matches)schedule(false);
 }
 function invalidateViewport(){if(renderer){root.classList.remove('webgl-ready');renderer.domElement.style.visibility='hidden';}geometryDirty=true;schedule();}
 function schedule(dirty:unknown=true){geometryDirty ||= Boolean(dirty);if(!disposed&&!frame)frame=requestAnimationFrame(render);}
 const observer=new MutationObserver(changes=>{if(changes.some(c=>c.target===root&&c.attributeName==='style'))invalidateViewport();if(changes.some(c=>{const el=c.target instanceof HTMLElement?c.target:c.target.parentElement;return el&&!(el instanceof HTMLCanvasElement)&&(el!==root||c.attributeName==='style')&&!el.closest('.turn-timer,.scene-actions,.scene-nav,.profile,.automatic-bar,.waiting-preview,.scene-modal,.room-pill');}))schedule();});
 const resize=new ResizeObserver(schedule);
 const onVisibility=()=>{if(!document.hidden)schedule(false);};
 const onLost=(e:Event)=>{e.preventDefault();contextLost=true;root.classList.remove('webgl-ready');root.dataset.tileRenderer='fallback';};
 const onRestored=()=>{contextLost=false;refreshEnvironment();schedule()};
 function refreshEnvironment(){if(!renderer||disposed)return;environment?.dispose();const pmrem=new THREE.PMREMGenerator(renderer);const roomEnvironment=new RoomEnvironment();environment=pmrem.fromScene(roomEnvironment,.04);boardScene.environment=environment.texture;handScene.environment=environment.texture;boardScene.environmentIntensity=.35;handScene.environmentIntensity=.45;roomEnvironment.dispose();pmrem.dispose();}
 function applyQuality(){const requested=document.documentElement.dataset.graphicsQuality??localStorage.getItem('bunny-graphics')??'auto';lowQuality=requested==='low'||requested==='auto'&&(softwareRenderer||matchMedia('(orientation: landscape) and (max-height: 500px)').matches);if(renderer){invalidateViewport();renderer.setPixelRatio(lowQuality?Math.min(devicePixelRatio,.8):Math.min(devicePixelRatio,1.25));renderer.shadowMap.enabled=!lowQuality&&document.documentElement.dataset.reduceEffects!=='true'&&!matchMedia('(prefers-reduced-motion: reduce)').matches;geometryDirty=true;schedule();}}
 async function initialize(){
  applyQuality();
  // Canvas text must use the bundled TC glyphs rather than browser fallback boxes.
  await document.fonts.load('700 106px "LXGW WenKai TC"','一二三四五六七八九萬東南西北發中');
  const image=new Image();image.src=backPath;await image.decode();if(disposed)return;
  const c=document.createElement('canvas');c.width=240;c.height=336;const ctx=c.getContext('2d')!;
  // UV material is the front-on inset of the supplied locked master (1536×1024).
  // Ivory thickness is geometry; do not bake the photographed side/backdrop into it.
  ctx.drawImage(image,184/1536*image.width,122/1024*image.height,342/1536*image.width,400/1024*image.height,0,0,240,336);
  const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;textures.push(map);back=new THREE.MeshStandardMaterial({map,bumpMap:map,bumpScale:.5,color:'#b8a68d',roughness:.6,metalness:0,envMapIntensity:.12,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});const gl=renderer.getContext(),debugInfo=gl.getExtension('WEBGL_debug_renderer_info');softwareRenderer=/swiftshader|llvmpipe|softpipe|software/i.test(String(gl.getParameter(debugInfo?.UNMASKED_RENDERER_WEBGL??gl.RENDERER)));applyQuality();renderer.setSize(W,H);renderer.setPixelRatio(lowQuality?Math.min(devicePixelRatio,.8):Math.min(devicePixelRatio,1.25));renderer.setClearColor(0,0);renderer.autoClear=false;renderer.info.autoReset=false;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=!lowQuality&&document.documentElement.dataset.reduceEffects!=='true'&&!matchMedia('(prefers-reduced-motion: reduce)').matches;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.domElement.className='tile-webgl';renderer.domElement.setAttribute('aria-hidden','true');renderer.domElement.addEventListener('webglcontextlost',onLost);renderer.domElement.addEventListener('webglcontextrestored',onRestored);root.append(renderer.domElement);refreshEnvironment();
  observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','data-face','data-red','disabled']});resize.observe(root);root.addEventListener('pointerover',schedule);root.addEventListener('pointerout',schedule);root.addEventListener('scroll',schedule,true);document.addEventListener('visibilitychange',onVisibility);window.addEventListener('bunny:graphics',applyQuality);window.addEventListener('resize',applyQuality);matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',applyQuality);render();
 }
 void initialize().catch(()=>{if(!disposed)root.dataset.tileRenderer='fallback';});
 return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();resize.disconnect();root.removeEventListener('pointerover',schedule);root.removeEventListener('pointerout',schedule);root.removeEventListener('scroll',schedule,true);document.removeEventListener('visibilitychange',onVisibility);window.removeEventListener('bunny:graphics',applyQuality);window.removeEventListener('resize',applyQuality);matchMedia('(prefers-reduced-motion: reduce)').removeEventListener('change',applyQuality);root.classList.remove('webgl-ready');if(renderer){renderer.domElement.removeEventListener('webglcontextlost',onLost);renderer.domElement.removeEventListener('webglcontextrestored',onRestored);renderer.domElement.remove();renderer.dispose();renderer.forceContextLoss();}for(const geo of geometries.values())geo.dispose();floorGeometry.dispose();contactGeo.dispose();contactMaterial.dispose();for(const m of materials.values())m.dispose();ivory.dispose();gold.dispose();shadowMaterial.dispose();environment?.dispose();back?.dispose();for(const t of textures)t.dispose();for(const scene of [boardScene,handScene])scene.traverse(o=>{if(o instanceof THREE.DirectionalLight)o.shadow.dispose();});};
}
