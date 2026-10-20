import * as THREE from 'three';
import {TABLE_SIZE} from './table-metrics.js';
/** V11 already contains seated characters: only the shared depth plane is 3D. */
export function createTableScene(scene:THREE.Scene,_onReady:()=>void){
 const geometry=new THREE.PlaneGeometry(TABLE_SIZE,TABLE_SIZE);
 const material=new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:true});
 const floor=new THREE.Mesh(geometry,material);floor.position.set(TABLE_SIZE/2,-TABLE_SIZE/2,0);floor.renderOrder=-1;scene.add(floor);
 return{actors:[] as THREE.Mesh[],resize(_height:number){},dispose(){scene.remove(floor);geometry.dispose();material.dispose();}};
}
/** Voxel carrot riichi deposit, built as a real mesh rather than a baked UI icon. */
export function createCarrot(){
 const group=new THREE.Group();const orange=new THREE.MeshBasicMaterial({color:'#ff821b',toneMapped:false});const orangeShade=new THREE.MeshBasicMaterial({color:'#db610d',toneMapped:false});const leaf=new THREE.MeshBasicMaterial({color:'#75bc28',toneMapped:false});const darkLeaf=new THREE.MeshBasicMaterial({color:'#29751e',toneMapped:false});
 for(let i=0;i<8;i++){const h=40-i*4.4;const m=new THREE.Mesh(new THREE.BoxGeometry(12,h,h*.66),i%3===1?orangeShade:orange);m.position.set(-32+i*11,0,h*.33);m.castShadow=true;group.add(m);}
 for(const [x,y,z,w,h,d] of [[-42,-13,18,15,18,13],[-48,8,24,18,18,15],[-38,18,22,12,17,13],[-51,-3,37,16,13,18],[-36,1,39,12,12,22]]){const m=new THREE.Mesh(new THREE.BoxGeometry(w!,h!,d!),z!>30?leaf:darkLeaf);m.position.set(x!,y!,z!);m.castShadow=true;group.add(m);}
 group.scale.setScalar(1.3);
 group.userData.dispose=()=>{for(const child of group.children)(child as THREE.Mesh).geometry.dispose();orange.dispose();orangeShade.dispose();leaf.dispose();darkLeaf.dispose();};return group;
}
