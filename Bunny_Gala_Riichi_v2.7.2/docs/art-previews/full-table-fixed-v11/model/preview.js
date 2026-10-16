import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {loadTileArt,tileFaceCanvas,tileArtStyle} from '/src/tile-art.ts';
import {goldSeamGeometry,goldBackInlayGeometry} from '/src/tile-geometry.ts';
import {createCarrot} from '/src/table-scene.ts';
await loadTileArt();await document.fonts.ready;
const W=2400,H=1103,N=3400,C=N/2,tw=100,th=136,D=44,wallRadius=1300,riverInner=520;
const params=new URLSearchParams(location.search),melded=params.has('melds'),zones=params.has('zones');
if(!zones)document.body.classList.add('clean');
document.querySelector('#title').textContent=melded?'四家四組副露 · 最大張數排位':'完整手牌 · 四家滿河及完整牌山';
document.querySelector('#mode-note').textContent=melded?'每家 4 組明槓＝16 張＋暗牌；已副露者不能立直，此圖只保留棒區虛線。':'四支蘿蔔棒展示河前位置；手牌與副露會按實際張數共用外側區域。';
const host=document.querySelector('#stage'),scene=new T.Scene(),camera=new T.Camera();camera.matrixAutoUpdate=false;camera.matrixWorldAutoUpdate=false;
// Full-table game projection fitted to the approved V7 composition; not a claim of true 60°.
const far=.56865,near=.9135,ratio=far/near,a=W*far/N,g=(ratio-1)/N,tx=W*(1-far)/2,b=(W*(1-near)/2*ratio-tx)/N;
const ty=H*.1941,d=(H*.953*ratio-ty)/N;
// Raise tile visibility while keeping the approved broad tabletop footprint.
// A game-oriented anamorphic lens is intentional; no physical 60° claim.
const eyeV=C+4500*Math.cos(65*Math.PI/180),eyeZ=4500*Math.sin(65*Math.PI/180);
const zW=0,zX=0,zY=-.30;
camera.projectionMatrix.set(2*a/W,-2*b/W+g,2*zX/W-zW,2*tx/W-1,0,-g+2*d/H,zW-2*zY/H,1-2*ty/H,0,-g,zW,.98,0,-g,zW,1);camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
function project(u,v,z=0){const p=new T.Vector3(u,-v,z).project(camera);return{x:(p.x+1)*W/2,y:(1-p.y)*H/2,ndc:p};}
function xy(seat,t,r){return[[C+t,C+r],[C+r,C-t],[C-t,C-r],[C-r,C+t]][seat];}
const yaws=[0,Math.PI/2,Math.PI,-Math.PI/2],records=[],regions=[],carrots=[];
const renderer=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.setSize(W,H);renderer.setPixelRatio(1);renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;host.append(renderer.domElement);
const pm=new T.PMREMGenerator(renderer);scene.environment=pm.fromScene(new RoomEnvironment(),.04).texture;scene.environmentIntensity=.35;scene.add(new T.AmbientLight('#fff7ed',.85));
for(const [color,intensity,x,y,z]of [['#fff2de',1.5,100,50,800],['#d7e6e3',.65,600,-900,400]]){const light=new T.DirectionalLight(color,intensity);light.position.set(x,y,z);light.target.position.set(500,-300,0);scene.add(light,light.target);}
const ivory=new T.MeshPhysicalMaterial({color:'#fff2d9',roughness:.22,clearcoat:.65,clearcoatRoughness:.3,envMapIntensity:.18}),black=new T.MeshPhongMaterial({color:'#101112',specular:'#292726',shininess:55}),gold=new T.MeshPhysicalMaterial({color:'#e9b34b',metalness:.5,roughness:.2,clearcoat:.15,envMapIntensity:.5}),inlay=new T.MeshBasicMaterial({color:'#f1bd55',toneMapped:false});
const bodyGeo=new RoundedBoxGeometry(tw,th,D-11,4,6.5),capGeo=new RoundedBoxGeometry(tw,th,11,3,4.5),trimGeo=goldSeamGeometry(tw,th),inlayGeo=goldBackInlayGeometry(tw,th),faceGeo=bodyGeo.clone(),range=bodyGeo.groups[4];faceGeo.clearGroups();faceGeo.setDrawRange(range.start,range.count);
const mats=new Map();function faceMat(f,red=false){if(!f)return ivory;const key=f+red;if(!mats.has(key)){const texture=new T.CanvasTexture(tileFaceCanvas(f,red));texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;mats.set(key,new T.MeshBasicMaterial({map:texture,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));}return mats.get(key);}
function tile(seat,t,r,{face,red=false,kind='river',standing=false,down=false,level=0,sideways=false}={}){
 const mesh=new T.Group();for(const [geo,mat,z]of [[bodyGeo,ivory,5.5],[faceGeo,faceMat(face,red),5.5],[capGeo,black,-D/2+5.5],[trimGeo,gold,-D/2+11],[inlayGeo,inlay,-D/2-.03]]){const part=new T.Mesh(geo,mat);part.position.z=z;mesh.add(part);}
 const edge=new T.Mesh(inlayGeo.clone().rotateY(Math.PI),inlay);edge.position.z=D/2+.04;mesh.add(edge);
 mesh.rotation.z=yaws[seat]+(standing?(seat===1?.25:seat===3?-.25:0):0)+(sideways?Math.PI/2:0);if(standing)mesh.rotateX((seat===0?50:90)*Math.PI/180);else if(down)mesh.rotateX(Math.PI);
 const [u,v]=xy(seat,t,r);mesh.position.set(u,-v,0);scene.add(mesh);mesh.updateMatrixWorld(true);
 let box=new T.Box3().setFromObject(mesh);mesh.position.z+=level*D-box.min.z;mesh.updateMatrixWorld(true);box=new T.Box3().setFromObject(mesh);
 if(!standing&&level===0){const shadow=new T.Mesh(new T.PlaneGeometry(sideways?th:tw,sideways?tw:th),new T.MeshBasicMaterial({color:'#091711',transparent:true,opacity:.22,depthWrite:false}));shadow.rotation.z=yaws[seat];shadow.position.set(u+3,-v-5,.05);scene.add(shadow);}
 const record={seat,t,r,face:down?null:face,red,kind,standing,down,sideways,level,u,v,mesh,box:[box.min.x,-box.max.y,box.min.z,box.max.x,-box.min.y,box.max.z]};records.push(record);return record;
}
const allFaces=[...['m','p','s'].flatMap(s=>Array.from({length:9},(_,i)=>({face:`${i+1}${s}`}))),...['E','S','W','N','P','F','C'].map(face=>({face})),...['m','p','s'].map(s=>({face:`5${s}`,red:true}))];
function label(text,seat,t,r,color='#dec08a'){const [u,v]=xy(seat,t,r),p=project(u,v);const el=document.createElement('div');el.className='tag';el.textContent=text;el.style.left=p.x+'px';el.style.top=p.y+'px';el.style.setProperty('--color',color);host.append(el);}
function outline(seat,name,t0,r0,t1,r1,color){regions.push({seat,name,t0,r0,t1,r1});if(!zones)return;const pts=[[t0,r0],[t1,r0],[t1,r1],[t0,r1],[t0,r0]].map(([t,r])=>{const [u,v]=xy(seat,t,r);return new T.Vector3(u,-v,1);});const line=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineDashedMaterial({color,dashSize:18,gapSize:11,depthTest:false,transparent:true,opacity:.85}));line.computeLineDistances();line.renderOrder=3;scene.add(line);}
for(let seat=0;seat<4;seat++){
 for(let row=0;row<4;row++)for(let col=0;col<6;col++){const sideways=!melded&&row===0&&col===2;const t=(col-2.5)*104+(sideways?18:!melded&&row===0&&col>2?36:0);tile(seat,t,riverInner+th/2+row*140,{...allFaces[(seat*24+row*6+col)%37],sideways});}
 const wallR=seat===0?1320:wallRadius;
 for(let i=0;i<17;i++)for(let level=0;level<2;level++)tile(seat,(i-8)*104,wallR,{kind:'wall',down:true,level});
 const handR=1600,count=melded?(seat===0?2:1):(seat===0?14:13);
 const own=['1m','2m','3m','4m','5m','6m','7m','8m','9m','1s','5p','F','C','E'];
 const handWidth=count*100+(count-1)*12,groupWidth=4*100+3*4+36,total=melded?handWidth+84+4*groupWidth+3*24:handWidth+(seat===0?24:0);
 let t=-total/2;
 for(let i=0;i<count;i++){tile(seat,t+50+(melded&&seat!==0?-220:0)+(seat===0&&!melded&&i===count-1?24:0),handR,{face:seat===0?(melded?'E':own[i]):undefined,kind:'hand',standing:true});t+=112;}
 if(melded){t+=80;for(let group=0;group<4;group++){const start=t;for(let i=0;i<4;i++){const sideways=i===[0,1,3,2][group],half=sideways?68:50;tile(seat,t+half,handR,{face:['1m','5p','7s','C'][group],kind:'meld',sideways});t+=half*2+4;}outline(seat,'meld-'+group,start,handR-68,t-4,handR+68,'#caa5ff');t+=20;}}
 outline(seat,'hand-and-meld-band',-1080,handR-70,1080,handR+70,'#8dcaff');
 outline(seat,'river',-310,riverInner,346,riverInner+556,'#80e1d5');outline(seat,'wall',-882,wallR-68,882,wallR+68,'#e6be72');outline(seat,'riichi',-125,365,125,475,'#ff96bd');
 label('17 幢 × 2 層',seat,0,wallR+84,'#e6be72');label('牌河 6 × 4＝24',seat,0,riverInner+280,'#80e1d5');
 label(melded?'暗牌＋四組副露（16 張）':'手牌／副露共用帶',seat,0,handR+80,'#caa5ff');
 if(!melded){const [u,v]=xy(seat,0,420),carrot=createCarrot();carrot.position.set(u,-v,.1);carrot.rotation.z=yaws[seat];scene.add(carrot);carrots.push({seat,mesh:carrot,u,v});}
}
const center=project(C,C),hud=document.querySelector('#center');hud.style.left=center.x+'px';hud.style.top=(center.y-13)+'px';
const dora=document.querySelector('#dora');for(const name of ['寶牌','裏寶牌']){const row=document.createElement('div');row.className='dora-row';const text=document.createElement('b');text.textContent=name;row.append(text);for(let i=0;i<5;i++){const tile=document.createElement('span');tile.className='hud-tile';if(i===0&&name==='寶牌'){tile.classList.add('front');Object.assign(tile.style,tileArtStyle('F'));}row.append(tile);}dora.append(row);}
scene.updateMatrixWorld(true);renderer.render(scene,camera);
const counts={rivers:[0,1,2,3].map(s=>records.filter(r=>r.seat===s&&r.kind==='river').length),wallStacks:[17,17,17,17],walls:[0,1,2,3].map(s=>records.filter(r=>r.seat===s&&r.kind==='wall').length),hands:[0,1,2,3].map(s=>records.filter(r=>r.seat===s&&r.kind==='hand').length),melds:[0,1,2,3].map(s=>records.filter(r=>r.seat===s&&r.kind==='meld').length),riichiCarrots:carrots.length};
const outside=records.filter(r=>r.box[0]<-.1||r.box[1]<-.1||r.box[3]>N+.1||r.box[4]>N+.1).map(r=>({seat:r.seat,kind:r.kind}));
const overlaps=[];for(let i=0;i<records.length;i++)for(let j=i+1;j<records.length;j++){const a=records[i],b=records[j],aa=a.box,bb=b.box;if(aa[0]<bb[3]-.15&&aa[3]>bb[0]+.15&&aa[1]<bb[4]-.15&&aa[4]>bb[1]+.15&&aa[2]<bb[5]-.15&&aa[5]>bb[2]+.15)overlaps.push([a.seat,a.kind,b.seat,b.kind]);}
// Inspect the actual nine central points of every public face against other tile meshes.
const ray=new T.Raycaster(),objects=records.map(r=>r.mesh),blocked=[];
for(const r of records.filter(r=>r.face&&(r.kind==='river'||r.kind==='meld'))){let visible=0;for(const x of [-.34,0,.34])for(const y of [-.34,0,.34]){const point=new T.Vector3(x*tw,y*th,D/2+.1).applyMatrix4(r.mesh.matrixWorld),p=point.clone().project(camera),origin=new T.Vector3(p.x,p.y,-1).unproject(camera);ray.set(origin,point.clone().sub(origin).normalize());ray.far=origin.distanceTo(point)-.15;const hit=ray.intersectObjects(objects,true).find(h=>h.object.parent!==r.mesh);if(!hit)visible++;else { const blocker=records.find(q=>q.mesh===hit.object.parent);window.__lastBlocker={seat:blocker?.seat,kind:blocker?.kind,t:blocker?.t,r:blocker?.r};}}if(visible<9)blocked.push({seat:r.seat,kind:r.kind,face:r.face,visible,blocker:window.__lastBlocker});}
const boundsOf=object=>{const box=new T.Box3().setFromObject(object),points=[];for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])points.push(project(x,-y,z));return{x:Math.min(...points.map(p=>p.x)),y:Math.min(...points.map(p=>p.y)),right:Math.max(...points.map(p=>p.x)),bottom:Math.max(...points.map(p=>p.y))};};
const h=hud.getBoundingClientRect(),stage=host.getBoundingClientRect(),hudBounds={x:h.x-stage.x,y:h.y-stage.y,right:h.right-stage.x,bottom:h.bottom-stage.y};
const faceBounds=records.filter(r=>r.face&&['river','meld'].includes(r.kind)).map(r=>{const p=[];for(const x of [-tw/2,tw/2])for(const y of [-th/2,th/2]){const v=new T.Vector3(x,y,D/2).applyMatrix4(r.mesh.matrixWorld);p.push(project(v.x,-v.y,v.z));}return{x:Math.min(...p.map(q=>q.x)),y:Math.min(...p.map(q=>q.y)),right:Math.max(...p.map(q=>q.x)),bottom:Math.max(...p.map(q=>q.y))};});
const intersect=(a,b)=>a.x<b.right&&a.right>b.x&&a.y<b.bottom&&a.bottom>b.y;
const carrotHUDConflicts=carrots.flatMap(c=>c.mesh.children.map(boundsOf).map(b=>({seat:c.seat,...b}))).filter(b=>intersect(b,hudBounds));
const uiBounds=[...host.querySelectorAll('.score,.dora,.menus,.action-reserve')].filter(el=>getComputedStyle(el).display!=='none').map(el=>{const b=el.getBoundingClientRect();return{x:b.x-stage.x,y:b.y-stage.y,right:b.right-stage.x,bottom:b.bottom-stage.y};});
const uiFaceOverlaps=faceBounds.filter(b=>uiBounds.some(h=>intersect(b,h))).length;
const carrotRiverOverlaps=carrots.flatMap(c=>c.mesh.children.map(boundsOf)).filter(b=>faceBounds.some(f=>intersect(b,f))).length;
const riichiZoneErrors=carrots.filter(c=>{const box=new T.Box3().setFromObject(c.mesh);for(const x of [box.min.x,box.max.x])for(const v of [-box.min.y,-box.max.y]){const [t,r]=[[x-C,v-C],[C-v,x-C],[C-x,C-v],[v-C,C-x]][c.seat];if(t< -125||t>125||r<365||r>475)return true;}return false;}).length;
const hudOverlaps=faceBounds.filter(b=>intersect(b,hudBounds)).length,carrotHudOverlaps=carrots.flatMap(c=>c.mesh.children.map(boundsOf)).filter(b=>intersect(b,hudBounds)).length;
window.__capacity={mode:melded?'four-kans':'full-hands',counts,dimensions:[tw,th,D],tableSize:N,windPositions:{bottom:'東（自風）',right:'南',top:'西',left:'北'},regions,outside,overlaps,blocked,hudOverlaps,carrotHudOverlaps,carrotHUDConflicts,hudBounds,uiFaceOverlaps,carrotRiverOverlaps,riichiZoneErrors,groundErrors:records.filter(r=>Math.abs(r.box[2]-r.level*D)>.1).length,previewOnly:true,notA136TileSnapshot:true};
// Local hand is a separate display projection: full portrait faces, slight top reveal.
const handScene=new T.Scene();handScene.environment=scene.environment;
handScene.add(new T.AmbientLight('#ffffff',.8));
const handLight=new T.DirectionalLight('#fff4df',2.8);handLight.position.set(-300,300,1000);handScene.add(handLight);
const handCamera=new T.OrthographicCamera(-W/2,W/2,H/2,-H/2,.1,3000);handCamera.position.z=1500;
const local=records.filter(r=>r.seat===0&&r.kind==='hand');
for(let i=0;i<local.length;i++){
 const r=local[i];r.mesh.visible=false;
 const shown=r.mesh.clone();shown.visible=true;shown.rotation.set(-8*Math.PI/180,0,0);
 shown.scale.setScalar(.86);shown.position.set((melded?-850:0)+(i-(local.length-1)/2)*90+(i===local.length-1?18:0),-442,0);handScene.add(shown);
}
renderer.autoClear=true;renderer.render(scene,camera);renderer.autoClear=false;renderer.clearDepth();renderer.render(handScene,handCamera);
window.__capacity.localHandPresentation='independent near-front portrait projection; not table lens';
window.__capacity.localHandBoundsCheck='table-space checks apply to reserved world band; independent overlay requires visual review';
document.querySelector('#title').textContent=melded?'滿載檢查 B · 每家四組明槓':'滿載檢查 A · 完整手牌與四家滿河';
document.querySelector('#mode-note').textContent='已修正：立面投影、44 厚牌身、分離副露帶、金邊及角色等比例展示。';
const bg=new Image();bg.src='./empty-plate.png';await bg.decode();await new Promise(requestAnimationFrame);window.__ready=true;
