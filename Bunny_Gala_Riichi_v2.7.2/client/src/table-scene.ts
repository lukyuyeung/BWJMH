import * as THREE from 'three';
import {TABLE_SIZE,TABLE_VIEW} from './table-metrics.js';
/** Preserve the original art design; only depth occlusion and seated actors are 3D. */
export function createTableScene(scene:THREE.Scene,onReady:()=>void){
 const geometries:THREE.BufferGeometry[]=[],materials:THREE.Material[]=[],textures:THREE.Texture[]=[];
 // The selected artwork owns the table's appearance. Depth-only felt hides
 // lower character bodies without painting a replacement table over it.
 const n=TABLE_SIZE,actorScale=n/1800,geo=new THREE.PlaneGeometry(n+256,n+128);geometries.push(geo);
 const depth=new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:true});materials.push(depth);
 const floor=new THREE.Mesh(geo,depth);floor.position.set(n/2,-n/2,0);floor.renderOrder=-1;scene.add(floor);
 const actors:THREE.Mesh[]=[];
 const loader=new THREE.TextureLoader();loader.load('/art/gala-seated-rabbits.png',sheet=>{
  if(disposed){sheet.dispose();return;}sheet.colorSpace=THREE.SRGBColorSpace;
  for(const [column,x,y,h,z] of [[0,-25,-n/2,700,100],[1,n/2,80,500,100],[2,n+25,-n/2,700,100]]){
   const map=sheet.clone();map.repeat.set(1/3,1);map.offset.set(column!/3,0);map.needsUpdate=true;textures.push(map);
   const mat=new THREE.MeshBasicMaterial({map,transparent:true,alphaTest:.06,depthWrite:true,toneMapped:false});materials.push(mat);
   const geo=new THREE.PlaneGeometry(h!*.724245*actorScale,h!*actorScale);geometries.push(geo);const actor=new THREE.Mesh(geo,mat);actor.position.set(column===0?x!*actorScale:column===2?n+25*actorScale:x!,column===1?y!*actorScale:y!,z!*actorScale);actor.rotation.x=Math.PI/2-TABLE_VIEW.elevation;actor.userData.actor=true;scene.add(actor);actors.push(actor);
  }sheet.dispose();onReady();
 });let disposed=false;
 return {actors,dispose(){disposed=true;for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();}};
}
/** Voxel carrot riichi deposit, built as a real mesh rather than a baked UI icon. */
export function createCarrot(){
 const group=new THREE.Group();const orange=new THREE.MeshStandardMaterial({color:'#ff821b',roughness:.46});const orangeShade=new THREE.MeshStandardMaterial({color:'#db610d',roughness:.5});const leaf=new THREE.MeshStandardMaterial({color:'#80bf32',roughness:.7});const darkLeaf=new THREE.MeshStandardMaterial({color:'#347c29',roughness:.8});
 for(let i=0;i<8;i++){const h=40-i*4.4;const m=new THREE.Mesh(new THREE.BoxGeometry(12,h,h*.66),i%3===1?orangeShade:orange);m.position.set(-32+i*11,0,h*.33);m.castShadow=true;group.add(m);}
 for(const [x,y,z,w,h,d] of [[-42,-13,18,15,18,13],[-48,8,24,18,18,15],[-38,18,22,12,17,13],[-51,-3,37,16,13,18],[-36,1,39,12,12,22]]){const m=new THREE.Mesh(new THREE.BoxGeometry(w!,h!,d!),z!>30?leaf:darkLeaf);m.position.set(x!,y!,z!);m.castShadow=true;group.add(m);}
 group.scale.setScalar(1.3);
 group.userData.dispose=()=>{for(const child of group.children)(child as THREE.Mesh).geometry.dispose();orange.dispose();orangeShade.dispose();leaf.dispose();darkLeaf.dispose();};return group;
}
