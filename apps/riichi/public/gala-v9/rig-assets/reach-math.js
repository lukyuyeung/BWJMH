import * as THREE from 'three';
export function solveTwoBone(start,target,L1,L2,pole){
 const delta=target.clone().sub(start),distance=delta.length();
 const direction=distance>1e-7?delta.clone().divideScalar(distance):new THREE.Vector3(0,0,1);
 const d=THREE.MathUtils.clamp(distance,Math.abs(L1-L2)+1e-5,(L1+L2)*.985);
 const out=pole.clone().sub(direction.clone().multiplyScalar(pole.dot(direction)));
 if(out.lengthSq()<1e-8)out.copy(new THREE.Vector3(1,0,0).cross(direction));
 out.normalize();const along=(L1*L1-L2*L2+d*d)/(2*d),bend=Math.sqrt(Math.max(0,L1*L1-along*along));
 return {elbow:start.clone().addScaledVector(direction,along).addScaledVector(out,bend),wrist:start.clone().addScaledVector(direction,d),reachable:distance<=(L1+L2)*.985,distance,maxReach:(L1+L2)*.985};
}
export function classifyReach(restShoulder,leanShoulder,wristGoal,L1,L2){
 const maxReach=(L1+L2)*.985,rest=restShoulder.distanceTo(wristGoal),lean=leanShoulder.distanceTo(wristGoal);
 return {kind:rest<=maxReach?'direct':lean<=maxReach?'lean':'far',distance:rest,maxReach,leanDistance:lean};
}
export function worldAimQuaternion(start,end){
 const y=end.clone().sub(start).normalize(),reference=Math.abs(y.z)>.98?new THREE.Vector3(1,0,0):new THREE.Vector3(0,0,1),x=new THREE.Vector3().crossVectors(y,reference).normalize(),z=new THREE.Vector3().crossVectors(x,y).normalize();
 return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x,y,z));
}
