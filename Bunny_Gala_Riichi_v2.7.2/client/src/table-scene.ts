import * as THREE from 'three';
import {TABLE_SIZE,TABLE_VIEW} from './table-metrics.js';
import {feltProjection} from './felt-projection.js';
import {backdropTransform} from './table-backdrop.js';
/** Existing seated rabbit cutouts anchored to the chairs in the new plate. */
export function createTableScene(scene:THREE.Scene,onReady:()=>void){
 const geometries:THREE.BufferGeometry[]=[],materials:THREE.Material[]=[],textures:THREE.Texture[]=[];
 const n=TABLE_SIZE,geo=new THREE.PlaneGeometry(n,n);geometries.push(geo);
 const depth=new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:true});materials.push(depth);
 const floor=new THREE.Mesh(geo,depth);floor.position.set(n/2,-n/2,0);floor.renderOrder=-1;scene.add(floor);
 const actors:THREE.Mesh[]=[];let disposed=false,lastHeight=0;
 // Hips on the chair cushions, in the empty background's pixel coordinates.
 const anchors=[{x:350,y:470,h:340},{x:925,y:124,h:142},{x:1500,y:470,h:340}];
 function resize(height:number){
  if(lastHeight===height&&actors.length===3)return;lastHeight=height;
  const p=feltProjection(height),art=backdropTransform(height);
  for(const [i,actor]of actors.entries()){
   const anchor=anchors[i]!,hip=art.point(anchor.x,anchor.y),top=art.point(anchor.x,anchor.y-anchor.h*.77);
   const h=(hip.y-top.y)/.77,centerY=hip.y-h*.27;
   const v=(centerY-p.ty)/(p.d-centerY*p.g),u=(hip.x*(1+p.g*v)-p.b*v-p.tx)/p.a;
   // Camera-facing plane; derive its true pixel scale along camera-up.
   const k=(1+p.g*v)/p.a;
   actor.scale.set(h*.724245*k,h*.79*k,1);
   actor.position.set(u,-v,0);actor.rotation.x=Math.PI/2-TABLE_VIEW.elevation;
   actor.translateY(h*.105*k);actor.userData.chairHip={x:hip.x,y:hip.y};
  }
 }
 new THREE.TextureLoader().load('/art/gala-seated-rabbits.png',sheet=>{
  if(disposed){sheet.dispose();return;}sheet.colorSpace=THREE.SRGBColorSpace;
  for(let column=0;column<3;column++){
   const map=sheet.clone();map.repeat.set(1/3,.79);map.offset.set(column/3,.21);map.needsUpdate=true;textures.push(map);
   const mat=new THREE.MeshBasicMaterial({map,transparent:true,alphaTest:.06,depthWrite:true,toneMapped:false});materials.push(mat);
   const geo=new THREE.PlaneGeometry(1,1);geometries.push(geo);const actor=new THREE.Mesh(geo,mat);actor.userData.actor=true;scene.add(actor);actors.push(actor);
  }sheet.dispose();const height=lastHeight;lastHeight=0;resize(height||706);onReady();
 });
 return{actors,resize,dispose(){disposed=true;for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();}};
}
/** Voxel carrot riichi deposit, built as a real mesh rather than a baked UI icon. */
export function createCarrot(){
 const group=new THREE.Group();const orange=new THREE.MeshBasicMaterial({color:'#ff821b',toneMapped:false});const orangeShade=new THREE.MeshBasicMaterial({color:'#db610d',toneMapped:false});const leaf=new THREE.MeshBasicMaterial({color:'#75bc28',toneMapped:false});const darkLeaf=new THREE.MeshBasicMaterial({color:'#29751e',toneMapped:false});
 for(let i=0;i<8;i++){const h=40-i*4.4;const m=new THREE.Mesh(new THREE.BoxGeometry(12,h,h*.66),i%3===1?orangeShade:orange);m.position.set(-32+i*11,0,h*.33);m.castShadow=true;group.add(m);}
 for(const [x,y,z,w,h,d] of [[-42,-13,18,15,18,13],[-48,8,24,18,18,15],[-38,18,22,12,17,13],[-51,-3,37,16,13,18],[-36,1,39,12,12,22]]){const m=new THREE.Mesh(new THREE.BoxGeometry(w!,h!,d!),z!>30?leaf:darkLeaf);m.position.set(x!,y!,z!);m.castShadow=true;group.add(m);}
 group.scale.setScalar(1.3);
 group.userData.dispose=()=>{for(const child of group.children)(child as THREE.Mesh).geometry.dispose();orange.dispose();orangeShade.dispose();leaf.dispose();darkLeaf.dispose();};return group;
}
