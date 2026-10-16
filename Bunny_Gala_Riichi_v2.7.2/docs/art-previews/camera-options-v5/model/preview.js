import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {loadTileArt,tileFaceCanvas} from '/src/tile-art.ts';
await loadTileArt();await document.fonts.ready;
const W=772,tw=100,th=136,td=64,models=[],checks=[];
const ivory=new T.MeshPhysicalMaterial({color:'#fff2d9',roughness:.4,clearcoat:.25});
const back=new T.MeshStandardMaterial({color:'#111315',roughness:.38});
const gold=new T.MeshStandardMaterial({color:'#d0a150',metalness:.55,roughness:.35});
const bodyGeo=new RoundedBoxGeometry(tw,th,td-11,4,6.5),capGeo=new RoundedBoxGeometry(tw,th,11,3,4.5),trimGeo=new RoundedBoxGeometry(tw-.4,th-.4,.8,2,.3);
const frontGeo=bodyGeo.clone(),draw=bodyGeo.groups[4];frontGeo.clearGroups();frontGeo.setDrawRange(draw.start,draw.count);
const mats=new Map();function face(f){if(!mats.has(f)){const tx=new T.CanvasTexture(tileFaceCanvas(f));tx.colorSpace=T.SRGBColorSpace;tx.anisotropy=8;mats.set(f,new T.MeshBasicMaterial({map:tx,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));}return mats.get(f);}
function tile(scene,x,y,{f='2m',standing=false,down=false,z=td/2,sideways=false,kind='meld'}={}){const group=new T.Group();const b=new T.Mesh(bodyGeo,ivory);b.position.z=5.5;group.add(b);const s=new T.Mesh(frontGeo,face(f));s.position.z=5.5;group.add(s);const cap=new T.Mesh(capGeo,back);cap.position.z=-td/2+5.5;group.add(cap);const trim=new T.Mesh(trimGeo,gold);trim.position.z=-td/2+11;group.add(trim);group.rotation.z=Math.PI+(sideways?Math.PI/2:0);if(standing)group.rotateX(Math.PI/2);else if(down)group.rotateX(Math.PI);group.position.set(x,y,standing?th/2:z);scene.add(group);models.push({kind,x,y,standing,down,z:group.position.z});return group;}
function scene(){const s=new T.Scene();s.background=new T.Color('#092c25');s.add(new T.AmbientLight('#fff8eb',1.5));const key=new T.DirectionalLight('#fff5df',2);key.position.set(-800,-400,2200);s.add(key);const floor=new T.Mesh(new T.PlaneGeometry(2700,1800),new T.MeshStandardMaterial({color:'#075441',roughness:1}));floor.position.set(0,-150,-.3);s.add(floor);
// Thin gold area lines on the felt establish the same physical depth in each view.
for(const y of [-690,490]){const line=new T.Mesh(new T.BoxGeometry(2400,4,1),new T.MeshBasicMaterial({color:'#a6894f'}));line.position.set(0,y,.3);s.add(line);}
for(let i=0;i<17;i++)for(let level=0;level<2;level++)tile(s,(i-8)*104,0,{down:true,z:td/2+level*td,kind:'wall'});
const groups=[['1m','2m','3m'],['F','F','F'],['5p','5p','5p','5p'],['C','C','C','C']];
let x=-820;const labels=[];for(let g=0;g<groups.length;g++){const start=x;for(let i=0;i<groups[g].length;i++){const sideways=g<2&&i===0,half=sideways?68:50;tile(s,x+half,180,{f:groups[g][i],down:g===3&&(i===0||i===3),sideways,kind:'meld'});x+=half*2+4;}labels.push({name:['吃','碰','明槓','暗槓'][g],x:(start+x)/2,y:360});x+=40;}
for(let i=0;i<2;i++)tile(s,975+i*104,185,{standing:true,kind:'hand'});
for(let row=0;row<4;row++)for(let col=0;col<6;col++)tile(s,(col-2.5)*104,-180-row*140,{f:['1m','2m','3m','4p','5p','6s','7s','8s','9s','E','S','W'][((row*6)+col)%12],kind:'river'});
return{s,labels};}
function renderView(host,angle,close=false){const H=close?350:510,{s,labels}=scene(),a=angle*Math.PI/180;const camera=new T.PerspectiveCamera(33,W/H,1,12000);camera.up.set(0,0,1);const target=new T.Vector3(0,close?125:-95,0);const distance=close?1800:3600;camera.position.set(0,target.y-distance*Math.cos(a),distance*Math.sin(a));camera.lookAt(target);camera.updateMatrixWorld(true);
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(W,H);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;host.append(renderer.domElement);renderer.render(s,camera);
function label(name,x,y){const p=new T.Vector3(x,y,0).project(camera);const el=document.createElement('div');el.className='label';el.textContent=name;el.style.left=(p.x+1)*W/2+'px';el.style.top=(1-p.y)*H/2+'px';host.append(el);}
for(const l of labels)label(l.name,l.x,l.y);if(!close){label('17 幢 × 2 層牌山',0,-94);label('牌河 24 張',0,-795);}
// At the tile face height (64), the back edge of a 128-high wall projects
// an occluded span of 64/tan(elevation) into the area behind it.
const occlusionEnd=68+64/Math.tan(a),meldNearEdge=112;return{angleDegrees:angle,occlusionEndAtFaceHeight:occlusionEnd,meldNearEdge,frontFaceOcclusionDepth:Math.max(0,occlusionEnd-meldNearEdge),cameraDistance:distance,fieldOfView:33};}
for(const [letter,angle,title,note] of [['A',40,'較低視角','保留較強坐位感，但牌山會遮住副露靠前部分。'],['B',60,'較高斜俯視','副露牌面露出更多，仍保留牌身厚度。建議先選這個方向。'],['C',75,'接近俯視','最容易看清桌面分區，但坐位感較弱。']]){const panel=document.createElement('section');panel.className='option';panel.innerHTML=`<div class="title"><b>${letter} · ${angle}° ${title}</b><p>鏡頭視線與桌面的夾角</p></div><div class="view overview"></div><div class="view close"></div><div class="note">${note}</div>`;document.querySelector('#options').append(panel);checks.push(renderView(panel.querySelector('.overview'),angle),renderView(panel.querySelector('.close'),angle,true));}
window.__cameraExamples={checks,tileDimensions:[100,136,64],walls:17*2,meldGroups:4,riverTiles:24,angleDefinition:'view direction above tabletop, degrees',sharedScene:true,previewOnly:true};window.__ready=true;
