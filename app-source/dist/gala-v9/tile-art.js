// Ported from the supplied Bunny_Gala_Riichi_v2.7.2/client/src/tiles3d.ts.
const glyphs={E:'東',S:'南',W:'西',N:'北',F:'發',C:'中'};
const pips={1:[[30,42]],2:[[30,20],[30,64]],3:[[15,18],[30,42],[45,66]],4:[[16,20],[44,20],[16,64],[44,64]],5:[[16,18],[44,18],[30,42],[16,66],[44,66]],6:[[16,18],[44,18],[16,42],[44,42],[16,66],[44,66]],7:[[16,16],[30,26],[44,16],[16,48],[44,48],[16,68],[44,68]],8:[[16,14],[44,14],[16,32],[44,32],[16,50],[44,50],[16,68],[44,68]],9:[[14,18],[30,18],[46,18],[14,42],[30,42],[46,42],[14,66],[30,66],[46,66]]};

export function faceCanvas(face,red=false){
 const canvas=document.createElement('canvas');canvas.width=240;canvas.height=336;
 const c=canvas.getContext('2d');
 const ivory=c.createLinearGradient(0,0,240,336);ivory.addColorStop(0,'#fff9eb');ivory.addColorStop(.5,'#fff0d9');ivory.addColorStop(1,'#ead5b2');c.fillStyle=ivory;c.fillRect(0,0,240,336);
 // Small material variation is deterministic, independent of any game information.
 c.fillStyle='#8f754305';for(let i=0;i<350;i++)c.fillRect((i*73)%240,(i*97)%336,1,1);
 c.textAlign='center';c.textBaseline='middle';c.shadowColor='#66513255';c.shadowBlur=1;c.shadowOffsetY=1;
 if(glyphs[face]){c.font='700 172px "LXGW WenKai TC"';c.fillStyle=face==='C'?'#a32425':face==='F'?'#1b613e':'#26261f';c.fillText(glyphs[face],120,176);c.strokeStyle=c.fillStyle;c.lineWidth=2;c.strokeText(glyphs[face],120,176);}
 else if(face==='1s'){
  // Peacock one-bamboo motif reconstructed from the supplied gameplay reference.
  c.save();c.scale(4,4);for(let i=-3;i<=3;i++){const a=i*.25,x=30+Math.sin(a)*22,y=46-Math.cos(a)*24;c.strokeStyle='#23563d';c.lineWidth=3;c.beginPath();c.moveTo(30,58);c.lineTo(x,y);c.stroke();c.fillStyle='#3e8850';c.beginPath();c.ellipse(x,y,5,8,-a,0,Math.PI*2);c.fill();c.fillStyle='#d0b658';c.beginPath();c.ellipse(x,y,2.8,4.7,-a,0,Math.PI*2);c.fill();c.fillStyle='#245268';c.beginPath();c.arc(x,y,1.8,0,Math.PI*2);c.fill();}c.fillStyle='#2c693c';c.beginPath();c.ellipse(30,56,9,12,0,0,Math.PI*2);c.fill();c.strokeStyle='#315952';c.lineWidth=5;c.beginPath();c.moveTo(32,55);c.lineTo(38,39);c.stroke();c.fillStyle='#315952';c.beginPath();c.arc(38,36,4,0,Math.PI*2);c.fill();c.fillStyle='#ab4b2f';c.fillRect(41,35,4,2);c.fillStyle='#fff5d9';c.fillRect(38,34,1,1);c.strokeStyle='#9d773f';c.lineWidth=1.5;for(const x of [27,33]){c.beginPath();c.moveTo(x,65);c.lineTo(x,72);c.lineTo(x-4,73);c.stroke();}c.restore();
 }
 else if(face!=='P'){
  const rank=Number(face[0]);
  if(face[1]==='m'){c.font='700 106px "LXGW WenKai TC"';c.fillStyle=red?'#b42328':'#29271f';c.fillText('一二三四五六七八九'[rank-1],120,98);c.fillStyle='#a72428';c.font='700 120px "LXGW WenKai TC"';c.fillText('萬',120,235);c.strokeStyle=c.fillStyle;c.lineWidth=2;c.strokeText('萬',120,235);}
  else {c.save();c.scale(4,4);for(const [x,y] of pips[rank]??[]){if(face[1]==='p'){c.strokeStyle=red?'#b32228':x===30&&y===42?'#a72428':'#214b3e';const r=rank===1?18:rank<4?8:6;c.lineWidth=rank===1?2:1.7;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();c.lineWidth=1.2;c.beginPath();c.arc(x,y,r*.62,0,Math.PI*2);c.stroke();for(let petal=0;petal<8;petal++){const a=petal*Math.PI/4;c.beginPath();c.arc(x+Math.cos(a)*r*.39,y+Math.sin(a)*r*.39,r*.18,0,Math.PI*2);c.stroke();}}else{c.fillStyle=red?'#b32228':'#20633d';c.beginPath();c.roundRect(x-2.5,y-6,5,12,1.5);c.fill();c.fillRect(x-4,y-5,8,2);c.fillRect(x-4,y+3,8,2);}}c.restore();}
 }
 return canvas;
}

