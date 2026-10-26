import type {Character} from './presentation';
export const HOODIE_ROOT='/art/hoodie-v3';
/** yellow remains the saved role/voice key; its visible character is now the bare-headed hoodie rabbit. */
export function characterPortrait(role:Character){return role==='yellow'?HOODIE_ROOT+'/character.png':'/art/ribbon-v2/'+role+'-character.png'}
export function characterAvatar(role:Character){return role==='yellow'?HOODIE_ROOT+'/avatar.jpg':'/art/results/'+role+'-avatar.png'}
export function characterCutin(role:Character,action:string){return role==='yellow'?HOODIE_ROOT+'/cutins/'+(['ankan','kakan'].includes(action)?'kan':action)+'.png':characterPortrait(role)}
