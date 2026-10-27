import {useEffect,useRef,type RefObject} from 'react';

// Touch taps discard; holding or scrubbing is an inspection-only gesture.
export function useHandInspection(host:RefObject<HTMLDivElement>,setHover:(face:string|null)=>void,discard:(id:string)=>void,setSelected:(id:string|null)=>void){
 const latest=useRef(discard);latest.current=discard;
 useEffect(()=>{
  const stage=host.current;if(!stage)return;
  type Gesture={pointer:number;id:string;x:number;y:number;started:number;inspect:boolean};
  let gesture:Gesture|null=null,suppressUntil=0;
  const tileAt=(e:PointerEvent)=>Array.from(stage.querySelectorAll<HTMLElement>('.phone-hand-tiles>button')).find(el=>{const r=el.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom+24});
  const show=(el:HTMLElement|undefined)=>{if(el?.querySelector('.phone-back'))el=undefined;setHover(el?.querySelector<HTMLElement>('.phone-tile')?.dataset.face??null);setSelected(el?.dataset.tileId??null)};
  const down=(e:PointerEvent)=>{
   if(e.pointerType==='mouse'){show(tileAt(e));return;}
   if(gesture){gesture.inspect=true;return;}
   const tile=tileAt(e);if(!tile||!e.isPrimary)return;
   gesture={pointer:e.pointerId,id:tile.dataset.tileId!,x:e.clientX,y:e.clientY,started:e.timeStamp,inspect:false};
   suppressUntil=Infinity;show(tile);stage.setPointerCapture(e.pointerId);
  };
  const move=(e:PointerEvent)=>{
   if(e.pointerType==='mouse'){show(tileAt(e));return;}
   if(!gesture||gesture.pointer!==e.pointerId)return;
   const tile=tileAt(e);
   if(Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>8||tile?.dataset.tileId!==gesture.id)gesture.inspect=true;
   show(tile);
  };
  const finish=(e:PointerEvent)=>{
   if(!gesture||gesture.pointer!==e.pointerId)return;
   const g=gesture;gesture=null;suppressUntil=performance.now()+900;show(undefined);
   if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);
   if(e.type==='pointerup'&&!g.inspect&&e.timeStamp-g.started<300&&tileAt(e)?.dataset.tileId===g.id)latest.current(g.id);
  };
  const click=(e:MouseEvent)=>{if(performance.now()<suppressUntil&&(e.target as Element).closest('.phone-hand-tiles>button')){e.preventDefault();e.stopImmediatePropagation();}};
  const leave=()=>{if(!gesture)show(undefined)};
  const cancel=()=>{gesture=null;suppressUntil=performance.now()+900;show(undefined)};
  stage.addEventListener('pointerdown',down,true);stage.addEventListener('pointermove',move,true);
  stage.addEventListener('pointerup',finish,true);stage.addEventListener('pointercancel',finish,true);stage.addEventListener('lostpointercapture',finish,true);
  stage.addEventListener('click',click,true);stage.addEventListener('pointerleave',leave);stage.addEventListener('contextmenu',context,true);
  function context(e:Event){if(gesture){e.preventDefault();gesture.inspect=true}}
  window.addEventListener('blur',cancel);
  return()=>{stage.removeEventListener('pointerdown',down,true);stage.removeEventListener('pointermove',move,true);stage.removeEventListener('pointerup',finish,true);stage.removeEventListener('pointercancel',finish,true);stage.removeEventListener('lostpointercapture',finish,true);stage.removeEventListener('click',click,true);stage.removeEventListener('pointerleave',leave);stage.removeEventListener('contextmenu',context,true);window.removeEventListener('blur',cancel)};
 },[host,setHover,setSelected]);
}
