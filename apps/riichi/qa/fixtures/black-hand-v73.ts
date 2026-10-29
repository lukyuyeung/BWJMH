import * as T from 'three';
type Motion={kind:'Draw'|'Discard'|'Riichi';id:string;from:T.Vector3;target:T.Vector3;released?:boolean};
type Rig={root:T.Group;paw:T.Group;sleeve:T.Mesh;rear:T.Vector3;age:number;duration:number;relative:number;motion?:Motion};
/** Same round paw, ribbed cuff and discard path as the approved table-motion preview. */
export async function loadTableHands(scene:T.Scene,onFrame:()=>void,outside:(point:T.Vector3,margin:number)=>boolean=(p,m)=>p.x< -m||p.x>1125+m||p.y< -m||p.y>634+m,onSettled:(id:string)=>void=()=>{},onDrawn:(id:string)=>void=()=>{}){
 const config=await fetch('/art/hand-table-motion/motions.json').then(r=>{if(!r.ok)throw Error('Hand motion data unavailable');return r.json()});
 const duration=Math.min(.72,Number(config.actions.find((a:{id:string})=>a.id==='discard')?.duration??.72));
 const geometries:T.BufferGeometry[]=[],materials:T.Material[]=[],rigs:Rig[]=[];
 const fur=new T.MeshStandardMaterial({color:'#e4e4e0',roughness:.85}),cloth=new T.MeshStandardMaterial({color:'#202126',roughness:.85}),cuff=new T.MeshStandardMaterial({color:'#303137',roughness:.85});materials.push(fur,cloth,cuff);
 const sphere=new T.SphereGeometry(1,20,12),cylinder=new T.CylinderGeometry(.37,.38,.24,28);const sleeveGeometry=new T.CylinderGeometry(.52,.43,1,24,4,true);geometries.push(sphere,cylinder,sleeveGeometry);
 function oval(parent:T.Object3D,sx:number,sy:number,sz:number,m:T.Material,x:number,y:number,z:number){const mesh=new T.Mesh(sphere,m);mesh.scale.set(sx,sy,sz);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh)}
 for(let relative=0;relative<4;relative++){
  const root=new T.Group(),paw=new T.Group();root.name='approved-round-paw-'+relative;paw.scale.setScalar(1.15);root.add(paw);scene.add(root);root.visible=false;root.scale.setScalar(76);root.rotation.z=[0,-Math.PI/2,Math.PI,Math.PI/2][relative]!;
  oval(paw,.48,.53,.22,fur,0,0,0);for(let i=0;i<3;i++)oval(paw,.18,.24,.19,fur,(i-1)*.29,-.38,-.015);
  const sleeve=new T.Mesh(sleeveGeometry,cloth);sleeve.name='continuous-open-sleeve';sleeve.castShadow=true;sleeve.receiveShadow=true;root.add(sleeve);
  const wrist=new T.Mesh(cylinder,cuff);wrist.position.set(0,.49,.025);wrist.castShadow=true;paw.add(wrist);
  for(let i=0;i<28;i++){const a=i/28*Math.PI*2;oval(paw,.025,.13,.025,cuff,Math.cos(a)*.375,.49,.025+Math.sin(a)*.375)}
  rigs.push({root,paw,sleeve,rear:new T.Vector3(),age:0,duration,relative});
 }
 const yaws=[0,-Math.PI/2,Math.PI,Math.PI/2];
 const smooth=(t:number)=>{const v=T.MathUtils.clamp(t,0,1);return v*v*(3-2*v)};
 const offset=(r:Rig,y:number)=>new T.Vector3(-Math.sin(yaws[r.relative]!)*y,Math.cos(yaws[r.relative]!)*y,0);
 function exit(r:Rig){const center=new T.Vector3(400,325,80);for(let distance=200;distance<=2600;distance+=50){const p=center.clone().add(offset(r,distance));if(outside(p,160))return p}return center.add(offset(r,2600))}
 function extendSleeve(r:Rig){const frontDistance=.55*87.4,front=r.root.position.clone().add(offset(r,frontDistance));front.z+=.025*87.4;let length=150;for(;length<2600;length+=50){r.rear.copy(front).add(offset(r,length));if(outside(r.rear,140))break}r.sleeve.position.set(0,(frontDistance+length/2)/76,.025*1.15);r.sleeve.scale.set(1,length/76,.85)}
 function point(r:Rig,t:number){const m=r.motion!;if(m.kind==='Draw'){const outer=exit(r),to=m.target.clone().add(offset(r,20)).setZ(48);if(t<.4)return outer.lerp(to,smooth(t/.4));if(t<.65)return to.setZ(48-12*Math.sin((t-.4)/.25*Math.PI));return to.lerp(outer,smooth((t-.65)/.35))}const from=m.from.clone().add(offset(r,20)),to=m.target.clone().add(offset(r,20)),outer=exit(r);const points:[number,T.Vector3][]=[[0,outer],[.22,from.setZ(35)],[.52,to.clone().setZ(62)],[.63,to.clone().setZ(34)],[.77,to.clone().add(offset(r,25)).setZ(65)],[1,outer]];
  for(let i=1;i<points.length;i++){const [b,pb]=points[i]!,[a,pa]=points[i-1]!;if(t<=b)return pa.clone().lerp(pb,smooth((t-a)/(b-a)))}return outer;
 }
 type Request={relative:number;kind:'Draw'|'Discard'|'Riichi';x:number;y:number;discard?:{id:string;from:T.Vector3}};
 const queue:Request[]=[];
 let last=performance.now();
 function start(request:Request){const {relative,kind,x,y,discard}=request,r=rigs[relative]!;r.age=0;r.duration=kind==='Draw'?.52:kind==='Riichi'?.72:duration;r.motion={kind,id:discard?.id??'draw-'+relative,from:discard?.from.clone().setZ(7)??new T.Vector3(x,y,7),target:new T.Vector3(x,y,7.2)};r.root.position.copy(exit(r));r.root.visible=true;extendSleeve(r);last=performance.now();onFrame()}

 return {
  triangles:4*(sphere.index!.count/3*32+cylinder.index!.count/3+sleeveGeometry.index!.count/3),
  play(relative:number,kind:'Draw'|'Discard'|'Riichi',x:number,y:number,discard?:{id:string;from:T.Vector3}){if(kind!=='Draw'&&!discard)return;if(discard&&(queue.some(q=>q.discard?.id===discard.id)||rigs.some(r=>r.motion?.id===discard.id)))return;const request={relative,kind,x,y,discard:discard?{id:discard.id,from:discard.from.clone()}:undefined};if(rigs.some(r=>r.root.visible&&r.motion)){if(queue.length<8)queue.push(request);return}start(request)},
  debug(){return rigs.filter(r=>r.motion).map(r=>({seat:r.relative,kind:r.motion!.kind,age:r.age,position:r.root.position.toArray(),source:r.motion!.from.toArray(),target:r.motion!.target.toArray(),visible:r.root.visible,pawVisible:r.paw.visible,rear:r.rear.toArray(),rearOutside:outside(r.rear,100),palmOutside:outside(r.root.position,90)}))},
  drawPending(id:string){return queue.some(q=>q.kind==='Draw'&&q.discard?.id===id)||rigs.some(r=>r.motion?.kind==='Draw'&&r.motion.id===id&&r.age/r.duration<.63)},
  riichiPose(id:string){const r=rigs.find(r=>r.motion?.kind==='Riichi'&&r.motion.id===id);if(!r||r.age/r.duration>=.63)return undefined;const t=r.age/r.duration,u=smooth((t-.22)/.3),p=r.motion!.from.clone().lerp(r.motion!.target,u);if(t>=.22)p.z=Math.max(7.2,point(r,t).z-28);const palm=point(r,t),attached=palm.clone().add(offset(r,-35)).setZ(Math.max(7.2,palm.z+18));return attached.lerp(p,smooth((t-.5)/.13))},
  discardPose(id:string){const pending=queue.find(q=>q.kind==='Discard'&&q.discard?.id===id);if(pending)return pending.discard!.from.clone();const r=rigs.find(r=>r.motion?.id===id&&r.root.visible);if(!r||!r.motion||r.motion.kind!=='Discard'||r.age/r.duration>=.63)return undefined;const t=r.age/r.duration,u=smooth((t-.22)/(.52-.22)),p=r.motion.from.clone().lerp(r.motion.target,u);if(t>=.22)p.z=Math.max(7.2,point(r,t).z-28);return p},
  update(){const now=performance.now(),dt=Math.max(0,(now-last)/1000);last=now;let active=false;for(const r of rigs){if(!r.root.visible||!r.motion)continue;r.age+=dt;const t=r.age/r.duration;if(t>=.63&&!r.motion.released){r.motion.released=true;if(r.motion.kind==='Draw')onDrawn(r.motion.id);else onSettled(r.motion.id)}if(r.age>=r.duration){r.root.visible=false;delete r.motion;continue}active=true;r.root.position.copy(point(r,t));r.paw.rotation.x=Math.sin(t*Math.PI)*.08;r.paw.visible=true;extendSleeve(r)}if(!active&&queue.length){start(queue.shift()!);active=true}return active},
  stop(){queue.length=0;for(const r of rigs){r.root.visible=false;delete r.motion}},
  dispose(){for(const r of rigs)scene.remove(r.root);for(const g of geometries)g.dispose();for(const m of materials)m.dispose()}
 };
}
