import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {loadTileArt,tileFaceCanvas} from '/src/tile-art.ts';
import {createCarrot} from '/src/table-scene.ts';
await loadTileArt();await document.fonts.ready;
const host=document.querySelector('#stage'),W=host.clientWidth,H=host.clientHeight,N=2700,C=N/2;
const tw=100,th=136,td=64,gap=4,handRadius=1265,wallRadius=1050,riverInner=340;
const params=new URLSearchParams(location.search),annotated=params.has('zones'),melded=params.has('melds');
if(!annotated)document.body.classList.add('hide-labels');
if(melded)document.querySelector('#caption').textContent='副露排位示意：展示吃、碰、明槓及暗槓；沿用同一鏡頭及同一牌身，並非實戰牌局。';
const scene=new T.Scene(),camera=new T.Camera();camera.matrixAutoUpdate=false;camera.matrixWorldAutoUpdate=false;
const ratio=.4368/.7286,a=W*.4368/N,g=(ratio-1)/N,tx=W*(1-.4368)/2,b=(W*(1-.7286)/2*ratio-tx)/N;
const ty=H*.1953,d=(H*.8906*ratio-ty)/N,E=59*Math.PI/180;
const ay=a*H/(W*850/1850),cy=(d-ay*Math.sin(E))/g,zW=g*Math.tan(E),zX=W/2*zW,zY=cy*zW-ay*Math.cos(E);
camera.projectionMatrix.set(2*a/W,-2*b/W+g,2*zX/W-zW,2*tx/W-1,0,-g+2*d/H,zW-2*zY/H,1-2*ty/H,0,-g,zW,.98,0,-g,zW,1);camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
const render=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});render.setSize(W,H);render.setPixelRatio(1);render.outputColorSpace=T.SRGBColorSpace;render.toneMapping=T.ACESFilmicToneMapping;render.toneMappingExposure=1.05;render.setClearColor(0,0);host.append(render.domElement);
const pm=new T.PMREMGenerator(render);scene.environment=pm.fromScene(new RoomEnvironment(),.04).texture;scene.environmentIntensity=.35;
scene.add(new T.AmbientLight('#fff7ed',.85));for(const [color,intensity,x,y,z] of [['#fff2de',1.5,100,50,800],['#e685b3',.22,1200,-400,400],['#d7e6e3',.65,600,-900,400]]){const light=new T.DirectionalLight(color,intensity);light.position.set(x,y,z);light.target.position.set(500,-300,0);scene.add(light,light.target);}
const ivory=new T.MeshPhysicalMaterial({color:'#fff2d9',roughness:.28,clearcoat:.45,clearcoatRoughness:.3,envMapIntensity:.18});
const black=new T.MeshPhongMaterial({color:'#101112',specular:'#292726',shininess:55});
const gold=new T.MeshStandardMaterial({color:'#eeb64b',metalness:.85,roughness:.22});
const bodyGeo=new RoundedBoxGeometry(tw,th,td-11,4,6.5),capGeo=new RoundedBoxGeometry(tw,th,11,3,4.5),seamGeo=new RoundedBoxGeometry(tw-.4,th-.4,.8,2,.3);
const faceGeo=bodyGeo.clone(),range=bodyGeo.groups[4];faceGeo.clearGroups();faceGeo.setDrawRange(range.start,range.count);
const faceMaterials=new Map(),records=[],regions=[];
function faceMaterial(face,red=false){const key=face+red;if(!faceMaterials.has(key)){const map=new T.CanvasTexture(tileFaceCanvas(face,red));map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;faceMaterials.set(key,new T.MeshBasicMaterial({map,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));}return faceMaterials.get(key);}
// Seat-local +t runs along the player's row, +r runs towards that player's table edge.
function xy(seat,t,r){return [[C+t,C+r],[C+r,C-t],[C-t,C-r],[C-r,C+t]][seat];}
const yaw=[0,Math.PI/2,Math.PI,-Math.PI/2];
function tile(seat,t,r,{face='2m',red=false,kind='river',standing=false,down=false,level=0,sideways=false}={}){
 const [u,v]=xy(seat,t,r),mesh=new T.Group();
 const body=new T.Mesh(bodyGeo,ivory);body.position.z=5.5;mesh.add(body);
 const surface=new T.Mesh(faceGeo,faceMaterial(face,red));surface.position.z=5.5;mesh.add(surface);
 const cap=new T.Mesh(capGeo,black);cap.position.z=-td/2+5.5;mesh.add(cap);
 const seam=new T.Mesh(seamGeo,gold);seam.position.z=-td/2+11;mesh.add(seam);
 mesh.rotation.z=yaw[seat]+(sideways?Math.PI/2:0);if(standing)mesh.rotateX(Math.PI/2);else if(down)mesh.rotateX(Math.PI);
 mesh.position.set(u,-v,standing?th/2:td/2+level*td);scene.add(mesh);mesh.updateMatrixWorld(true);
 const box=new T.Box3().setFromObject(mesh);records.push({seat,kind,t,r,standing,down,face:down?null:face,dimensions:[tw,th,td],base:box.min.z,box:[box.min.x,-box.max.y,box.min.z,box.max.x,-box.min.y,box.max.z],mesh});return mesh;
}
const allFaces=[...['m','p','s'].flatMap(s=>Array.from({length:9},(_,i)=>({face:`${i+1}${s}`}))),...['E','S','W','N','P','F','C'].map(face=>({face})),...['m','p','s'].map(s=>({face:`5${s}`,red:true}))];
for(let seat=0;seat<4;seat++){
 for(let index=0;index<(melded?(seat===0?9:8):24);index++){
  const row=Math.floor(index/6),col=index%6;
  const side=row===0&&col===2,t=(col-2.5)*104+(row===0?(col===2?18:col>2?36:0):0);
  tile(seat,t,riverInner+th/2+row*(th+gap),{...allFaces[(seat*24+row*6+col)%37],sideways:side});
 }
 for(let i=0;i<(melded?6:17);i++)for(let level=0;level<2;level++)tile(seat,(i-8)*104,wallRadius,{kind:'wall',down:true,level});
 const count=melded?(seat===0?11:10):(seat===0?14:13),own=['1m','2m','3m','4m','5m','6m','7m','8m','9m','1s','5p','F','C','E'];
 for(let i=0;i<count;i++)tile(seat,(i-(count-1)/2)*104+(melded?-180:0)+(seat===0&&i===count-1?24:0),handRadius,{standing:true,kind:'hand',face:seat===0?own[i]:'2m'});
 if(melded){const faces=seat===0?['3m','4m','5m']:seat===1?['F','F','F']:seat===2?['5p','5p','5p','5p']:['C','C','C','C'];for(let i=0;i<faces.length;i++)tile(seat,850+i*104+(i>0&&seat<2?18:0),handRadius,{face:faces[i],kind:'meld',sideways:i===0&&seat<2,down:seat===3&&(i===0||i===3)});}
 const stick=createCarrot();const [u,v]=xy(seat,0,riverInner-114);stick.position.set(u,-v,0);stick.rotation.z=yaw[seat];scene.add(stick);
}
// Depth-only table hides the portion of a seated sprite below the tabletop.
const depth=new T.Mesh(new T.PlaneGeometry(N,N),new T.MeshBasicMaterial({colorWrite:false,depthWrite:true}));depth.position.set(C,-C,0);depth.renderOrder=-1;scene.add(depth);
const shadow=new T.Mesh(new T.PlaneGeometry(N,N),new T.ShadowMaterial({opacity:.22}));shadow.position.set(C,-C,-.3);scene.add(shadow);
function project(u,v,z=0){const p=new T.Vector3(u,-v,z).project(camera);return{x:(p.x+1)*W/2,y:(1-p.y)*H/2};}
function tag(text,seat,t,r,cls=''){const [u,v]=xy(seat,t,r),p=project(u,v);const el=document.createElement('div');el.className='tag '+cls;el.textContent=text;el.style.left=p.x+'px';el.style.top=p.y+'px';host.append(el);}
function outline(seat,name,t0,r0,t1,r1,color){
 regions.push({seat,name,t0,r0,t1,r1});
 if(!annotated)return;const pts=[[t0,r0],[t1,r0],[t1,r1],[t0,r1],[t0,r0]].map(([t,r])=>{const [u,v]=xy(seat,t,r);return new T.Vector3(u,-v,1);});const line=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineDashedMaterial({color,dashSize:18,gapSize:10,depthTest:false,transparent:true,opacity:.9}));line.computeLineDistances();line.renderOrder=3;scene.add(line);
}
for(let seat=0;seat<4;seat++){
 outline(seat,'river',-310,riverInner,346,riverInner+4*th+3*gap,'#78e3dc');
 outline(seat,'wall',-882,wallRadius-th/2,882,wallRadius+th/2,'#e3c276');
 outline(seat,'hand',-750,handRadius-td/2,750,handRadius+td/2,'#8fc5ff');
 outline(seat,'meld-reserve',780,handRadius-th/2,1260,handRadius+th/2,'#c49cff');
 outline(seat,'riichi-reserve',-120,riverInner-160,120,riverInner-70,'#ff8fba');
 tag('17 幢 × 2 層',seat,0,wallRadius+95);
 tag('牌河 6 × 4',seat,0,riverInner+2*th,'zone');
 tag('副露預留',seat,1040,handRadius,'zone');
}
const center=project(C,C);const c=document.createElement('div');c.className='center';c.style.left=center.x+'px';c.style.top=center.y+'px';c.innerHTML='東一局　自風 東<br><b>剩餘牌數</b>';host.append(c);
const sheet=await new T.TextureLoader().loadAsync('/art/gala-seated-rabbits.png');sheet.colorSpace=T.SRGBColorSpace;
// Each sprite is anchored by its seated hip (77% from the top), not its image centre.
// Coordinates are tied to the visible chair seats in the retained background.
// Render the upper 79% of the existing seated cutout: its lower legs belong
// behind the chair/table occlusion, not on top of the foreground. No asset edit.
const actorRecords=[];
for(const actor of [{column:0,hip:[.115,.495],height:.44,seat:'左家'},{column:1,hip:[.5,.205],height:.25,seat:'對家'},{column:2,hip:[.885,.495],height:.44,seat:'右家'}]){
 const targetX=actor.hip[0]*W,targetY=actor.hip[1]*H,h=actor.height*H,w=h*.724245,screenCenterY=targetY-h*.27;
 const v=(screenCenterY-ty)/(d-screenCenterY*g),u=(targetX*(1+g*v)-b*v-tx)/a;
 const map=sheet.clone();map.repeat.set(1/3,.79);map.offset.set(actor.column/3,.21);map.needsUpdate=true;
 // Billboard world dimensions derive from the same camera's local screen scale.
 const scale=(1+g*v)/a,mesh=new T.Mesh(new T.PlaneGeometry(w*scale,h*.79*scale),new T.MeshBasicMaterial({map,transparent:true,alphaTest:.06,depthWrite:true,toneMapped:false}));
 mesh.rotation.x=Math.PI/2-E;mesh.position.set(u,-v,0);mesh.translateY(h*.105*scale);scene.add(mesh);mesh.updateMatrixWorld(true);
 actorRecords.push({seat:actor.seat,hipScreen:[targetX,targetY],u,v,screenHeight:h});
 if(annotated){const el=document.createElement('div');el.className='tag actor-tag';el.textContent=actor.seat+'・座面基準';el.style.left=targetX+'px';el.style.top=targetY+'px';host.append(el);}
}
sheet.dispose();
await new Promise(requestAnimationFrame);render.render(scene,camera);
const result={viewport:[W,H],tableSize:N,tileSize:[tw,th,td],elevationDegrees:59,handRadius,wallRadius,riverInner,counts:{rivers:[0,1,2,3].map(s=>records.filter(x=>x.seat===s&&x.kind==='river').length),wallStacks:Array(4).fill(melded?6:17),wallTiles:[0,1,2,3].map(s=>records.filter(x=>x.seat===s&&x.kind==='wall').length),hands:[0,1,2,3].map(s=>records.filter(x=>x.seat===s&&x.kind==='hand').length),melds:[0,1,2,3].map(s=>records.filter(x=>x.seat===s&&x.kind==='meld').length)},actors:actorRecords,regions,contactErrors:records.filter(x=>Math.abs(x.base-(x.kind==='wall'&&x.base>1?td:0))>.1).length,allSameModel:records.every(x=>x.dimensions.join()==='100,136,64'),previewOnly:true};
// Assert actual world footprints, not label positions. Touching layers in a wall are allowed.
const overlaps=[];for(let i=0;i<records.length;i++)for(let j=i+1;j<records.length;j++){const a=records[i],b=records[j],aa=a.box,bb=b.box;if(aa[0]<bb[3]-.1&&aa[3]>bb[0]+.1&&aa[1]<bb[4]-.1&&aa[4]>bb[1]+.1&&aa[2]<bb[5]-.1&&aa[5]>bb[2]+.1)overlaps.push([a.seat,a.kind,b.seat,b.kind]);}
result.tileIntersections=overlaps;
result.outsideFelt=records.filter(x=>x.box[0]<0||x.box[1]<0||x.box[3]>N||x.box[4]>N).map(x=>({seat:x.seat,kind:x.kind}));
result.hiddenHandFaceLeaks=records.filter(x=>x.kind==='hand'&&x.seat!==0&&new T.Vector3(0,0,1).transformDirection(x.mesh.matrixWorld).dot(new T.Vector3(C-x.mesh.position.x,-C-x.mesh.position.y,0))>0).length;
window.__layoutReview=result;window.__reviewReady=true;
