import {useEffect,useState} from 'react';
// Reserve before publishing state: input cannot sneak in before the renderer's RAF.
let ticket:{room:string;revision:number}|undefined,animating=false;
export const tableMotionBusy=()=>!!ticket||animating;
function notify(){if(document.documentElement.dataset.tableMotionBusy===String(tableMotionBusy()))return;document.documentElement.dataset.tableMotionBusy=String(tableMotionBusy());window.dispatchEvent(new CustomEvent('bunny:table-motion',{detail:{busy:tableMotionBusy()}}))}
export function reserveTableMotion(room:string,revision:number){ticket={room,revision};notify()}
export function presentTableMotion(room:string,revision:number,busy:boolean){if(ticket&&(ticket.room!==room||revision<ticket.revision))return;animating=busy;if(!busy)ticket=undefined;notify()}
export function publishTableMotion(busy:boolean){animating=busy;notify()}
export function cancelTableMotion(){ticket=undefined;animating=false;notify()}
export function useTableMotionBusy(){const [busy,setBusy]=useState(tableMotionBusy);useEffect(()=>{const update=()=>setBusy(tableMotionBusy());window.addEventListener('bunny:table-motion',update);update();return()=>window.removeEventListener('bunny:table-motion',update)},[]);return busy}
