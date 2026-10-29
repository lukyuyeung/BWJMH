import {useEffect,useReducer} from 'react';
export type Preference='music'|'voice'|'tileSfx'|'uiSfx'|'winSfx'|'deal'|'handMotion'|'calls'|'winCall'|'eyeCutin'|'winCinematic'|'scoreMotion'|'dim'|'flash'|'doraGlow'|'riverGlow';
declare global{interface Window{BunnyPrefs?:{enabled:(key:string)=>boolean;read:()=>Record<string,boolean>;set:(next:Record<string,boolean>)=>void;open:()=>void;close:()=>void}}}
export const pref=(key:Preference)=>window.BunnyPrefs?.enabled(key)!==false;
export function usePreferences(){const [,refresh]=useReducer(n=>n+1,0);useEffect(()=>{window.addEventListener('bunny:prefs',refresh);return()=>window.removeEventListener('bunny:prefs',refresh)},[])}
