import {pref,usePreferences} from './preferences';
import {useReadyImage} from './art-loading';
import {characterPortrait,characterAvatar} from './character-art';
import {characterCutin} from './character-art';
import React,{useEffect,useRef,useState} from 'react';
import preset from './ribbon-preset.json';
import type {Character} from './presentation.js';
export type RibbonAction=keyof typeof preset.actions;
const rect=(r:{x:number;y:number;width:number;height:number})=>({left:r.x/15.36+'%',top:r.y/6.4+'%',width:r.width/15.36+'%',height:r.height/6.4+'%'});
export function RibbonCutin({action,character,relative,reduce=false,onComplete}:{action:RibbonAction;character:Character;relative:number;reduce?:boolean;onComplete?:()=>void}){
 usePreferences();const enabled=pref(action==='ron'||action==='tsumo'?'winCall':'calls');
 const portrait=characterPortrait(character),portraitReady=useReadyImage(portrait),pose=characterCutin(character,action),poseReady=useReadyImage(pose),a=preset.actions[action],root=useRef<HTMLElement>(null),done=useRef(onComplete),[ready,setReady]=useState(false);done.current=onComplete;
 useEffect(()=>{let live=true,frame=0,animation:Animation|undefined;setReady(true);const el=root.current!;
  frame=requestAnimationFrame(()=>{if(!live)return;animation=el.animate(reduce?[{opacity:1},{opacity:1}]:[{opacity:.6,offset:0},{opacity:1,offset:100/720},{opacity:1,offset:600/720},{opacity:0,offset:1}],{duration:reduce?675:preset.durationMs*1.5,easing:'linear'});void animation.finished.then(()=>{if(live)done.current?.()}).catch(()=>{});});
  return()=>{live=false;cancelAnimationFrame(frame);animation?.cancel()};
 },[action,character,reduce]);

 return <aside ref={root} data-ready={ready} data-pose-ready={poseReady} className={enabled?'fixed-ribbon-cutin'+(reduce?' reduce-effects':''):'plain-call-status'} data-relative={relative} data-action={action} data-character={character} data-layers="01+02+03+04" role="status" aria-label={a.label}>
  {!enabled&&<strong>{a.label}</strong>}{enabled&&<><div className="ribbon-fixed-group" data-fixed-layers="01+03+04">
   <img data-layer="01" style={{...rect(preset.ribbon.rect),filter:a.ribbonFilter}} src="/art/ribbon-v2/01-ribbon.png" alt=""/>
   <img data-layer="03" style={rect(a.rect)} src={'/art/ribbon-v2/03-'+action+'.png'} alt={a.label}/>
   <img data-layer="04" style={rect(preset.fx.rect)} src="/art/ribbon-v2/04-fx.png" alt=""/>
  </div>
  {!poseReady&&<img className="ribbon-pose-backup" style={rect(preset.characterRect)} src={portraitReady?portrait:characterAvatar(character)} onError={e=>{const url=characterAvatar(character);if(e.currentTarget.getAttribute('src')!==url)e.currentTarget.src=url}} alt=""/>}
  <img data-layer="02" style={{...rect(preset.characterRect),opacity:poseReady?1:0}} src={pose} decoding="async" alt=""/>
 </>}</aside>;
}
