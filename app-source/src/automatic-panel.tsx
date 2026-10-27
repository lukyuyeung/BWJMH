import React,{useEffect,useRef} from 'react';
import type {AutomaticOptions} from './gameplay.js';
import './automatic-help.css';
const rows=[
 ['autoSort','理','自動理牌','按花色及數字整理手牌。'],
 ['autoRon','和','自動和牌','可和牌時稍候自動和牌，期間可手動跳過。'],
 ['disableCalls','鳴','不鳴牌','略過吃碰槓，保留和牌。'],
 ['autoDiscard','切','摸切','新摸即打，和牌時保留。'],
] as const;
export function AutomaticPanel({options,onOptions,onClose}:{options:AutomaticOptions;onOptions:React.Dispatch<React.SetStateAction<AutomaticOptions>>;onClose:()=>void}){
 const node=useRef<HTMLElement>(null),close=useRef(onClose);close.current=onClose;
 useEffect(()=>{const previous=document.activeElement as HTMLElement|null;let restoreFocus=true;node.current?.querySelector<HTMLButtonElement>('button')?.focus();const key=(event:KeyboardEvent)=>{if(event.key==='Escape')close.current();};const outside=(event:PointerEvent)=>{const target=event.target as Element;if(!node.current?.contains(target)&&!target.closest('[aria-controls="automatic-help-panel"]')){restoreFocus=false;close.current();}};document.addEventListener('keydown',key);document.addEventListener('pointerdown',outside);return()=>{document.removeEventListener('keydown',key);document.removeEventListener('pointerdown',outside);if(restoreFocus)previous?.focus();}},[]);
 return <section id="automatic-help-panel" className="automatic-panel automatic-help" ref={node} role="dialog" aria-modal="false" aria-label="自動操作設定"><header><span>操作設定</span><button className="automatic-close" onClick={onClose} aria-label="關閉自動操作設定">×</button></header><div className="automatic-rows">{rows.map(([key,glyph,title,description])=><label key={key} className={options[key]?'enabled':''}><input type="checkbox" role="switch" aria-label={title} aria-describedby={'automatic-'+key+'-description'} checked={options[key]} onChange={e=>onOptions(v=>({...v,[key]:e.target.checked}))}/><strong className="automatic-help-glyph" aria-hidden="true">{glyph}</strong><span className="automatic-help-copy"><strong>{title}</strong><span id={'automatic-'+key+'-description'}>{description}</span></span><span className="automatic-help-toggle" aria-hidden="true"><i/></span></label>)}</div></section>;
}
