import * as T from 'three';
import {runtime as R, runtimeReady} from './rig.js?v=phone-10';
import {faceCanvas} from './tile-art.js';

// This scene is a renderer only. It never invents hands, scores or game actions.
const locations=['bottom','right','top','left'];
const faces=new Map(),tiles=new T.Group();
R.scene.add(tiles);
let snapshot,ready=false,lastRevision='',animation=null;
const gestures=[],wallMeshes=[],concealedMeshes=[];let breakMarker=null;
const outlineMaterials=[new T.LineBasicMaterial({color:'#ffcf68'}),new T.LineBasicMaterial({color:'#f8a6df'})];
function material(tile){
 const key=tile.face+':'+!!tile.red;
 if(!faces.has(key)){
  const map=new T.CanvasTexture(faceCanvas(tile.face,tile.red));
  map.colorSpace=T.SRGBColorSpace;map.center.set(.5,.5);map.rotation=Math.PI;
  faces.set(key,new T.MeshBasicMaterial({map,toneMapped:false}));
 }
 return faces.get(key);
}
function add(p,x,y,z,tile,rotation=0,scale=1){
 const m=R.tile(tiles,p.localToWorld(new T.Vector3(x,y,z)),!!tile);
 m.rotation.y=R.seats[p.id].angle+rotation;m.scale.setScalar(scale);
 if(tile){m.material=m.material.slice();m.material[2]=material(tile);}
 return m;
}
function clear(){for(const m of [...tiles.children]){tiles.remove(m);m.traverse(o=>o.geometry?.dispose());}}
function paint(data){
 const previous=snapshot;snapshot=data;if(!ready)return;
 const key=data.handKey+':'+data.revision+':'+data.hoverFace+':'+data.reduce+':'+data.motion;
 if(data.reduce||!data.motion){for(const g of gestures){R.idle(g.p);if(g.p.id==='bottom')g.p.model.visible=false;}gestures.length=0;animation=null;}
 if(lastRevision===key)return;
 lastRevision=key;clear();animation=null;wallMeshes.length=0;concealedMeshes.length=0;breakMarker=null;
 for(let index=0;index<4;index++){
  const id=locations[index],p=R.players.get(id),seat=data.seats[index];
  if(previous&&previous.handKey===data.handKey&&previous.revision!==data.revision&&data.motion&&!data.reduce){
   const old=previous.seats[index];
   const call=data.events?.filter(e=>e.id>(previous.events?.at(-1)?.id??0)&&e.relative===index).at(-1);
   const name=call?.kind==='RIICHI'?'Riichi':seat.discards.length>old.discards.length?'Discard':seat.concealed>old.concealed||seat.melds.length>old.melds.length?'Draw':null;
   if(name){for(let j=gestures.length-1;j>=0;j--)if(gestures[j].p===p)gestures.splice(j,1);const clip=p.clips.find(c=>c.name===name);if(clip){p.mixer.stopAllAction();const action=p.mixer.clipAction(clip);action.reset().setLoop(T.LoopOnce,1).play();p.model.visible=true;gestures.push({p,remaining:clip.duration});}}
  }
  for(const slot of seat.wall){
   const opening=data.opening,elapsed=Date.now()-(opening?.startedAt??0),intro=opening&&elapsed<6000;
   if(slot.occupied||intro){const m=add(p,(slot.stack-8)*.112,1.073+slot.level*.0472,.88,intro?null:slot.indicator);
    const absolute=['east','south','west','north'][(data.ownSeatIndex+index)%4];
    const absoluteIndex=['east','south','west','north'].indexOf(absolute)*34+slot.stack*2+slot.level;
    const openVector=new T.Vector3(0,0,0);if(opening&&absolute===opening.breakSide)openVector.set(slot.stack>=opening.breakStack?.065:-.065,0,0).applyAxisAngle(new T.Vector3(0,1,0),R.seats[id].angle);
    wallMeshes.push({mesh:m,index:absoluteIndex,occupied:slot.occupied,indicator:slot.indicator,base:m.position.clone(),openVector});
    if(intro&&absolute===opening.breakSide&&slot.stack===opening.breakStack&&slot.level===1){
     const geo=new T.TorusGeometry(.09,.012,8,32),mat=new T.MeshBasicMaterial({color:'#ffdb69'});breakMarker=new T.Mesh(geo,mat);breakMarker.rotation.x=-Math.PI/2;breakMarker.position.copy(m.position).add(new T.Vector3(0,.06,0));tiles.add(breakMarker);
    }
   }
  }
  // Private opponent faces are neither requested nor sent to this frame.
  if(index!==0)for(let i=0;i<seat.concealed;i++){
   const m=add(p,(i-(seat.concealed-1)/2)*.066,1.105,.64,null,0,.65);
   concealedMeshes.push({mesh:m,index:i,seat:index,count:seat.concealed});m.rotation.x=-Math.PI/2;m.material=m.material.slice();m.material[2]=m.material[3];
  }
  if(!data.flatBoard)seat.discards.forEach((tile,i)=>{
   const m=add(p,(2.5-i%6)*.125,1.073,1.73-Math.floor(i/6)*.17,tile,tile.sideways?Math.PI/2:0);
   if(data.lastDiscard===tile.id||(index!==0&&data.hoverFace===tile.face)){
    const edge=new T.LineSegments(new T.EdgesGeometry(m.geometry),outlineMaterials[data.lastDiscard===tile.id?0:1]);edge.scale.setScalar(1.06);m.add(edge);
   }
   if(index!==0&&data.motion&&!data.reduce&&data.lastDiscard===tile.id){
    animation={mesh:m,from:p.localToWorld(new T.Vector3(.24,1.13,.68)),to:m.position.clone(),time:0};
   }
  });
  if(!data.flatBoard)seat.melds.forEach((meld,group)=>meld.tiles.forEach((tile,i)=>{
   const concealedKan=meld.type==='ankan'&&(i===1||i===2);
   const sideways=meld.type!=='ankan'&&tile.id===meld.calledId;
   add(p,-1.20+(i-1.5)*.072,1.073,.73+group*.29,concealedKan?null:tile,sideways?Math.PI/2:0,.6);
   if(sideways&&meld.addedTile)add(p,-1.20+(i-1.5)*.072,1.103,.73+group*.29,meld.addedTile,Math.PI/2,.6);
  }));
 }
}
function fit(){
 const aspect=R.camera.aspect;
 R.camera.fov=T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(29.33348264/2))*Math.max(1,(16/9)/aspect)));
 R.camera.updateProjectionMatrix();
}
window.addEventListener('message',event=>{
 if(event.source!==parent||event.origin!==location.origin||event.data?.type!=='bunny:gala-state')return;
 paint(event.data.snapshot);
});
R.renderer.domElement.addEventListener('webglcontextlost',()=>parent.postMessage({type:'bunny:gala-error'},location.origin));
new ResizeObserver(fit).observe(document.querySelector('#viewport'));
runtimeReady.then(async()=>{
 await document.fonts.load('700 172px "LXGW WenKai TC"','東南西北發中一二三四五六七八九萬').catch(()=>{});
 if(!R.ready)throw new Error('Gala rig did not load');
 R.setSkin('bottom','golden');
 R.controls.enabled=false;R.controls.enableDamping=false;
 R.camera.position.set(0,3.95610332,4.57487068);
 R.controls.target.set(0,1.17875957,.41718362);R.controls.update();fit();
 for(const [id,p] of R.players){
  for(const m of [...p.hand,...p.wall]){m.parent.remove(m);m.geometry.dispose();}
  p.hand=[];p.wall=[];
  if(id==='bottom'){
   p.model.traverse(o=>{if(!o.isSkinnedMesh)return;const g=o.geometry.clone(),idx=g.getIndex(),skin=g.getAttribute('skinIndex'),indices=[];
    for(let i=0;i<idx.count;i+=3){const tri=[idx.getX(i),idx.getX(i+1),idx.getX(i+2)];if(tri.every(v=>/^(Shoulder|UpperArm|Forearm|Hand|Finger|Thumb)/.test(o.skeleton.bones[skin.getX(v)]?.name||'')))indices.push(...tri);}
    g.setIndex(indices);g.clearGroups();g.computeBoundingSphere();o.geometry=g;
   });
   p.model.visible=false;R.furniture?.getObjectByName('Gala_Chair_bottom')?.removeFromParent();}
  else{
   const rel=locations.indexOf(id);p.model.scale.setScalar(.45);
   p.model.position.set(0,.60,.42);p.model.rotation.y=rel===1?.28:rel===3?-.28:0;
   R.snapshotRig(p);
   const chair=R.furniture?.getObjectByName('Gala_Chair_'+id);
   if(chair){chair.scale.setScalar(.5);const front=new T.Vector3(0,0,1).applyAxisAngle(new T.Vector3(0,1,0),R.seats[id].angle);chair.position.set(...R.seats[id].pos).addScaledVector(front,.42);chair.position.y=.58;}
  }
 }
 R.setExternalUpdater(dt=>{
  const opening=snapshot?.opening,elapsed=Date.now()-(opening?.startedAt??0);
  if(opening){
   const count=elapsed<2800?0:Math.min(53,Math.floor((elapsed-2800)/150)*4);
   const removed=new Set(opening.dealSlots.slice(0,count));
   for(const w of wallMeshes){w.mesh.position.copy(w.base).addScaledVector(w.openVector,elapsed<6000?Math.min(1,Math.max(0,(elapsed-1600)/500)):0);w.mesh.visible=elapsed<6000?!removed.has(w.index):w.occupied;
    if(elapsed>=5000&&w.indicator&&!w.faceShown){w.mesh.material=w.mesh.material.slice();w.mesh.material[2]=material(w.indicator);w.mesh.rotation.x=0;w.faceShown=true;}
   }
   if(breakMarker)breakMarker.visible=elapsed>=1600&&elapsed<2800;
   for(const c of concealedMeshes){const visible=elapsed<2800?0:elapsed<6000?Math.min(c.count,Math.floor((elapsed-2800)/600)*4):c.count;c.mesh.visible=c.index<visible;}
  }
  for(let i=gestures.length-1;i>=0;i--){const g=gestures[i];g.remaining-=dt;if(g.remaining<=0){R.idle(g.p);if(g.p.id==='bottom')g.p.model.visible=false;gestures.splice(i,1);}}
  if(!animation)return;
  animation.time+=dt;const t=Math.min(1,animation.time/.30),u=t*t*(3-2*t);
  animation.mesh.position.lerpVectors(animation.from,animation.to,u);
  animation.mesh.position.y+=Math.sin(Math.PI*t)*.12;
  if(t===1)animation=null;
 });
 ready=true;if(snapshot)paint(snapshot);
 parent.postMessage({type:'bunny:gala-ready'},location.origin);
}).catch(error=>{
 console.error(error);parent.postMessage({type:'bunny:gala-error'},location.origin);
});
window.addEventListener('pagehide',()=>{
 R.renderer.setAnimationLoop(null);clear();
 for(const mat of faces.values()){mat.map.dispose();mat.dispose();}
 R.renderer.dispose();
});
