import {Shape,ShapeGeometry,ExtrudeGeometry} from 'three';
/** A continuous rounded gold seam. Its XY corner radius stays correct even
 * though the band is thin; RoundedBoxGeometry clamps that radius to its depth. */
export function goldSeamGeometry(width:number,height:number){
 // Keep bevels inside the common physical tile dimensions.
 width-=.7;height-=.7;
 const x=-width/2,y=-height/2,r=6.3,s=new Shape();
 s.moveTo(x+r,y);s.lineTo(x+width-r,y);s.quadraticCurveTo(x+width,y,x+width,y+r);
 s.lineTo(x+width,y+height-r);s.quadraticCurveTo(x+width,y+height,x+width-r,y+height);
 s.lineTo(x+r,y+height);s.quadraticCurveTo(x,y+height,x,y+height-r);
 s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
 const geo=new ExtrudeGeometry(s,{depth:4.2,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.35,bevelThickness:.35,curveSegments:12});
 geo.translate(0,0,-2.1);return geo;
}

/** Gold inlay on the black cap remains visible from the elevated camera.
 * Flat ring rather than a thick box, so the common tile body stays unchanged. */
export function goldBackInlayGeometry(width:number,height:number){
 const outer=roundedRect(width-8,height-8,6),inner=roundedRect(width-14,height-14,3);
 outer.holes.push(inner);const geometry=new ShapeGeometry(outer,12);geometry.rotateY(Math.PI);return geometry;
}
function roundedRect(width:number,height:number,r:number){
 const x=-width/2,y=-height/2,s=new Shape();
 s.moveTo(x+r,y);s.lineTo(x+width-r,y);s.quadraticCurveTo(x+width,y,x+width,y+r);
 s.lineTo(x+width,y+height-r);s.quadraticCurveTo(x+width,y+height,x+width-r,y+height);
 s.lineTo(x+r,y+height);s.quadraticCurveTo(x,y+height,x,y+height-r);
 s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;
}
