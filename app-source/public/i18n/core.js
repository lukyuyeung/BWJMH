import {en as baseEn} from './en.js';
import {academyEn} from './academy-en.js?v=101';
const en={...baseEn,...academyEn};
let language='zh';try{language=localStorage.getItem('bunny-language')==='en'?'en':'zh'}catch{}
const listeners=new Set();export const getLanguage=()=>language;export const subscribe=fn=>{listeners.add(fn);return()=>listeners.delete(fn)};
export function setLanguage(next){language=next==='en'?'en':'zh';try{localStorage.setItem('bunny-language',language)}catch{}document.documentElement.lang=language==='en'?'en':'zh-Hant';document.documentElement.dataset.language=language;for(const fn of listeners)fn();window.dispatchEvent(new CustomEvent('bunny:language',{detail:language}))}
const entries=Object.entries(en).sort((a,b)=>b[0].length-a[0].length);const pattern=new RegExp(entries.map(([k])=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');
export function translate(text){if(language!=='en'||typeof text!=='string'||!/[\u3400-\u9fff]/.test(text))return text;if(en[text]!==undefined)return en[text];return text.replace(pattern,match=>en[match]);}
export function localizeProps(type,props){if(!props||typeof type!=='string')return props;const p={...props};for(const key of ['title','aria-label','placeholder','alt'])if(typeof p[key]==='string')p[key]=translate(p[key]);const children=v=>typeof v==='string'?translate(v):Array.isArray(v)?v.map(children):v;if('children'in p)p.children=children(p.children);if(typeof p.src==='string'&&language==='en')p.src=asset(p.src);return p}
let assetMap={};export function registerAssets(map){assetMap=map}export function asset(path){if(language!=='en')return path;const [url,query]=path.split('?');return (assetMap[url]??url)+(query?'?'+query:'')}
setLanguage(language);

window.addEventListener?.('bunny:set-language',event=>setLanguage(event.detail));
