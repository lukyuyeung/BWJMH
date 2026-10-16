import * as THREE from 'three';
import {TABLE_SIZE,TABLE_VIEW} from './table-metrics.js';
/** Preserve the original art design; only depth occlusion and seated actors are 3D. */
export function createTableScene(scene:THREE.Scene,onReady:()=>void){
 const geometries:THREE.BufferGeometry[]=[],materials:THREE.Material[]=[],textures:THREE.Texture[]=[];
 // The selected artwork owns the table's appearance. Depth-only felt hides
 // lower character bodies without painting a replacement table over it.
 const n=TABLE_SIZE,geo=new THREE.PlaneGeometry(n+256,n+128);geometries.push(geo);
 const depth=new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:true});materials.push(depth);
 const floor=new THREE.Mesh(geo,depth);floor.position.set(n/2,-n/2,0);floor.renderOrder=-1;scene.add(floor);
 const actors:THREE.Mesh[]=[];
 const loader=new THREE.TextureLoader();loader.load('/art/gala-seated-rabbits.png',sheet=>{
  if(disposed){sheet.dispose();return;}sheet.colorSpace=THREE.SRGBColorSpace;
  for(const [column,x,y,h,z] of [[0,-25,-n/2,700,100],[1,n/2,80,500,100],[2,n+25,-n/2,700,100]]){
   const map=sheet.clone();map.repeat.set(1/3,1);map.offset.set(column!/3,0);map.needsUpdate=true;textures.push(map);
   const mat=new THREE.MeshBasicMaterial({map,transparent:true,alphaTest:.06,depthWrite:true,toneMapped:false});materials.push(mat);
   const geo=new THREE.PlaneGeometry(h!*.724245,h);geometries.push(geo);const actor=new THREE.Mesh(geo,mat);actor.position.set(x!,y!,z!);actor.rotation.x=Math.PI/2-TABLE_VIEW.elevation;actor.userData.actor=true;scene.add(actor);actors.push(actor);
  }sheet.dispose();onReady();
 });let disposed=false;
 return {actors,dispose(){disposed=true;for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();}};
}
/** Voxel carrot riichi deposit, built as a real mesh rather than a baked UI icon. */
export function createCarrot(){
 const group=new THREE.Group();const orange=new THREE.MeshStandardMaterial({color:'#ff861b',roughness:.7});const leaf=new THREE.MeshStandardMaterial({color:'#73c531',roughness:.8});const darkLeaf=new THREE.MeshStandardMaterial({color:'#2d7f36',roughness:.9});
 for(const [x,w,h,d] of [[-16,27,22,20],[7,20,17,16],[25,16,12,12],[38,12,7,7]]){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),orange);m.position.set(x!,0,d!/2);m.castShadow=true;group.add(m);}
 for(const [i,y,z] of [[0,-10,8],[1,10,8],[2,0,18],[3,-6,24],[4,8,22]]){const m=new THREE.Mesh(new THREE.BoxGeometry(13,14,12),i!%2?darkLeaf:leaf);m.position.set(-39,y!,z!);m.rotation.z=i!*.45;m.castShadow=true;group.add(m);}
 group.userData.dispose=()=>{for(const child of group.children)(child as THREE.Mesh).geometry.dispose();orange.dispose();leaf.dispose();darkLeaf.dispose();};return group;
}
