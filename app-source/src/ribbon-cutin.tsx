import React,{useEffect,useRef,useState} from 'react';
import preset from './ribbon-preset.json';
import type {Character} from './presentation.js';
export type RibbonAction=keyof typeof preset.actions;
const rect=(r:{x:number;y:number;width:number;height:number})=>({left:r.x/15.36+'%',top:r.y/6.4+'%',width:r.width/15.36+'%',height:r.height/6.4+'%'});
export function RibbonCutin({action,character,relative,reduce=false,onComplete}:{action:RibbonAction;character:Character;relative:number;reduce?:boolean;onComplete?:()=>void}){
 const a=preset.actions[action],root=useRef<HTMLElement>(null),done=useRef(onComplete),[ready,setReady]=useState(false);done.current=onComplete;
 useEffect(()=>{let live=true,frame=0,animation:Animation|undefined;setReady(false);const el=root.current!;
  void Promise.all(Array.from(el.querySelectorAll('img')).map(im=>im.decode().catch(()=>{}))).then(()=>{if(!live)return;setReady(true);frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>{if(!live)return;animation=el.animate(reduce?[{opacity:1},{opacity:1}]:[{opacity:.6,offset:0},{opacity:1,offset:100/720},{opacity:1,offset:600/720},{opacity:0,offset:1}],{duration:reduce?675:preset.durationMs*1.5,easing:'linear'});void animation.finished.then(()=>{if(live)done.current?.()}).catch(()=>{});})})});
  return()=>{live=false;cancelAnimationFrame(frame);animation?.cancel()};
 },[action,reduce]);
 return <aside ref={root} data-ready={ready} className={'fixed-ribbon-cutin'+(reduce?' reduce-effects':'')} data-relative={relative} data-action={action} data-character={character} data-layers="01+02+03+04" role="status" aria-label={a.label}>
  <div className="ribbon-fixed-group" data-fixed-layers="01+03+04">
   <img data-layer="01" style={{...rect(preset.ribbon.rect),filter:a.ribbonFilter}} src="/art/ribbon-v2/01-ribbon.png" alt=""/>
   <img data-layer="03" style={rect(a.rect)} src={'/art/ribbon-v2/03-'+action+'.png'} alt={a.label}/>
   <img data-layer="04" style={rect(preset.fx.rect)} src="/art/ribbon-v2/04-fx.png" alt=""/>
  </div>
  <img data-layer="02" style={rect(preset.characterRect)} src={character==='yellow'?'/art/results/yellow-presentation.png':'/art/ribbon-v2/'+character+'-character.png'} alt=""/>
 </aside>;
}
