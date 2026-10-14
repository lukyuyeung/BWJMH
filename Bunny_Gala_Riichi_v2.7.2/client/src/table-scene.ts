import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {TABLE_SIZE,TABLE_TILE} from './table-metrics.js';
/** Opaque felt, raised wood/gold rim and actual chair geometry own all occlusion. */
export function createTableScene(scene:THREE.Scene,camera:THREE.Camera,onReady:()=>void){
 const geometries:THREE.BufferGeometry[]=[],materials:THREE.Material[]=[],textures:THREE.Texture[]=[];
 const feltCanvas=document.createElement('canvas');feltCanvas.width=1024;feltCanvas.height=1024;const c=feltCanvas.getContext('2d')!;
 c.fillStyle='#075e51';c.fillRect(0,0,1024,1024);c.fillStyle='#d2f4c906';for(let i=0;i<18000;i++)c.fillRect(i*37%1024,i*113%1024,1,1);
 c.strokeStyle='#b5914770';c.lineWidth=2;c.strokeRect(24,24,976,976);c.strokeRect(32,32,960,960);
 c.fillStyle='#10151b';c.strokeStyle='#b79859';c.lineWidth=3;c.beginPath();for(let i=0;i<8;i++){const a=(i+.5)*Math.PI/4;const x=512+Math.cos(a)*104,y=512+Math.sin(a)*80;i?c.lineTo(x,y):c.moveTo(x,y);}c.closePath();c.fill();c.stroke();
 const texture=new THREE.CanvasTexture(feltCanvas);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);
 const felt=new THREE.MeshStandardMaterial({map:texture,color:'#c2e5d1',roughness:1});const wood=new THREE.MeshStandardMaterial({color:'#36181c',roughness:.45});const gold=new THREE.MeshStandardMaterial({color:'#c99945',metalness:.7,roughness:.4});const velvet=new THREE.MeshStandardMaterial({color:'#701733',roughness:.95});materials.push(felt,wood,gold,velvet);
 const planeGeo=new THREE.PlaneGeometry(TABLE_SIZE,TABLE_SIZE);geometries.push(planeGeo);const plane=new THREE.Mesh(planeGeo,felt);plane.position.set(TABLE_SIZE/2,-TABLE_SIZE/2,0);plane.receiveShadow=true;scene.add(plane);
 function box(w:number,h:number,d:number,mat:THREE.Material,x:number,y:number,z:number,r=8){const geo=new RoundedBoxGeometry(w,h,d,2,r);geometries.push(geo);const mesh=new THREE.Mesh(geo,mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);return mesh;}
 const n=TABLE_SIZE;box(n+128,n+128,64,wood,n/2,-n/2,-34,18);
 for(const x of [-32,n+32]){box(64,n+128,18,wood,x,-n/2,-9);box(5,n+120,5,gold,x<0?-61:n+61,-n/2,10,2);}
 for(const y of [32,-n-32]){box(n,64,18,wood,n/2,y,-9);box(n+120,5,5,gold,n/2,y>0?61:-n-61,10,2);}
 for(const [x,y,yaw] of [[-95,-n/2,Math.PI/2],[n+95,-n/2,-Math.PI/2],[n/2,85,Math.PI]] as const){
  const seat=box(210,190,28,velvet,x,y,-90,14);seat.rotation.z=yaw;
  const back=box(210,25,180,velvet,x-Math.sin(yaw)*100,y-Math.cos(yaw)*100,-10,12);back.rotation.z=yaw;
  const trim=box(222,30,10,gold,back.position.x,back.position.y,85,4);trim.rotation.z=yaw;
 }
 const actors:THREE.Mesh[]=[];
 const loader=new THREE.TextureLoader();loader.load('/art/gala-seated-rabbits.png',sheet=>{
  if(disposed){sheet.dispose();return;}sheet.colorSpace=THREE.SRGBColorSpace;
  for(const [column,x,y,h,z] of [[0,0,-n/2,350,90],[1,n/2,10,300,40],[2,n,-n/2,350,90]]){
   const map=sheet.clone();map.repeat.set(1/3,1);map.offset.set(column!/3,0);map.needsUpdate=true;textures.push(map);
   const mat=new THREE.MeshBasicMaterial({map,transparent:true,alphaTest:.06,depthWrite:true,toneMapped:false});materials.push(mat);
   const geo=new THREE.PlaneGeometry(h!*.724245,h);geometries.push(geo);const actor=new THREE.Mesh(geo,mat);actor.position.set(x!,y!,z!);actor.quaternion.copy(camera.quaternion);actor.userData.actor=true;scene.add(actor);actors.push(actor);
  }sheet.dispose();onReady();
 });let disposed=false;
 return {actors,update(){for(const actor of actors)actor.quaternion.copy(camera.quaternion)},dispose(){disposed=true;for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();}};
}
/** Voxel carrot riichi deposit, built as a real mesh rather than a baked UI icon. */
export function createCarrot(){
 const group=new THREE.Group();const orange=new THREE.MeshStandardMaterial({color:'#ff861b',roughness:.7});const leaf=new THREE.MeshStandardMaterial({color:'#73c531',roughness:.8});const darkLeaf=new THREE.MeshStandardMaterial({color:'#2d7f36',roughness:.9});
 for(const [x,w,h,d] of [[-16,27,22,20],[7,20,17,16],[25,16,12,12],[38,12,7,7]]){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),orange);m.position.set(x!,0,d!/2);m.castShadow=true;group.add(m);}
 for(const [i,y,z] of [[0,-10,8],[1,10,8],[2,0,18],[3,-6,24],[4,8,22]]){const m=new THREE.Mesh(new THREE.BoxGeometry(13,14,12),i!%2?darkLeaf:leaf);m.position.set(-39,y!,z!);m.rotation.z=i!*.45;m.castShadow=true;group.add(m);}
 group.userData.dispose=()=>{for(const child of group.children)(child as THREE.Mesh).geometry.dispose();orange.dispose();leaf.dispose();darkLeaf.dispose();};return group;
}
