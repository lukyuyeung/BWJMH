import {useReadyImage,warmImagesInOrder} from './art-loading';
import {characterAvatar} from './character-art';
import React,{useEffect,useRef,useState} from 'react';
import type {Character} from './presentation';
import {useLanguage} from './language';
import './emotes.css';
const zh=['開心','憤怒','哭泣','驚訝','思考','抱歉','勝利','無語','調皮'];
const en=['Happy','Angry','Crying','Surprised','Thinking','Sorry','Victory','Speechless','Playful'];
/** Local seat reactions. No network delivery is implied by the Bot demo. */
export function Emotes({character,handKey,disabled,reduce}:{character:Character;handKey:string;disabled:boolean;reduce:boolean}){
 useEffect(()=>{if(character==='yellow')void warmImagesInOrder(Array.from({length:9},(_,i)=>'/art/hoodie-v3/emotes/'+i+'.png'))},[character]);
 const language=useLanguage(),labels=language==='en'?en:zh;
 const [open,setOpen]=useState(false),[sent,setSent]=useState<{index:number;id:number}|null>(null),[cooldown,setCooldown]=useState(false);
 const root=useRef<HTMLDivElement>(null),lastSent=useRef(0);
 useEffect(()=>{setOpen(false);setSent(null);setCooldown(false);lastSent.current=0},[handKey]);
 useEffect(()=>{if(disabled)setOpen(false)},[disabled]);
 useEffect(()=>{if(!sent)return;const timer=setTimeout(()=>{setSent(null);setCooldown(false)},3000);return()=>clearTimeout(timer)},[sent]);
 useEffect(()=>{if(!open)return;const pointer=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false)};const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);root.current?.querySelector<HTMLButtonElement>('.emote-toggle')?.focus()}};document.addEventListener('pointerdown',pointer);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',pointer);document.removeEventListener('keydown',key)}},[open]);
 const src=(index:number)=>character==='yellow'?`/art/hoodie-v3/emotes/${index}.png`:`/art/emotes/${character}/${index}.webp`;
 return <><div className="seat-emotes" ref={root} data-reduce={reduce||undefined}>
 <button className="emote-toggle" aria-label={language==='en'?'Emotes':'表情'} aria-expanded={open} aria-controls="emote-picker" disabled={disabled||cooldown} onClick={()=>setOpen(v=>!v)}><EmoteImage src={src(0)} character={character} label=""/></button>
 {open&&<section id="emote-picker" className="emote-picker" aria-label={language==='en'?'Your character emotes':'自己角色表情'}><span>{language==='en'?'Emotes · Bot match':'表情 · Bot 對局'}</span><div>{labels.map((label,index)=><button key={index} aria-label={label} title={label} onClick={()=>{if(Date.now()-lastSent.current<3000)return;lastSent.current=Date.now();setSent({index,id:Date.now()});setCooldown(true);setOpen(false);root.current?.querySelector<HTMLButtonElement>('.emote-toggle')?.focus()}}><EmoteImage src={src(index)} character={character} label={label}/></button>)}</div></section>}
 </div>{sent&&<div className="seat-reaction" key={sent.id} data-reduce={reduce||undefined} role="status" aria-label={labels[sent.index]}><EmoteImage src={src(sent.index)} character={character} label={labels[sent.index]}/></div>}</>;
}

function EmoteImage({src,character,label}:{src:string;character:Character;label:string}){const ready=useReadyImage(src,'low');return <img src={ready?src:characterAvatar(character)} data-emote-src={src} data-loaded={ready} alt={label} decoding="async"/>}
