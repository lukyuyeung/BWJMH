import {useCallback,useEffect,useRef,useState} from 'react';
import type {Game,Tile} from './main.js';
export type RiichiReveal={active:boolean;tile:Tile|undefined;key:string;duration:number;deadline:number;complete:()=>void};
/** Only the owner's actual drawn tile is exposed. The existing turn deadline stays authoritative. */
export function useRiichiReveal(game:Game|null,_reduce:boolean):RiichiReveal{
 const ready=!!game&&!game.room.match.finished&&game.hand.riichi[game.you.seat]&&game.hand.currentSeat===game.you.seat&&game.hand.phase==='awaiting_discard'&&game.hand.actions.canDiscard;
 const tile=ready?game!.you.hand.find(t=>t.id===game!.you.drawnTileId):undefined;
 const key=tile?[game!.room.code,game!.hand.match.roundWind,game!.hand.match.handNumber,game!.hand.match.honba,tile.id].join(':'):'';
 const clock=useRef({key:'',deadline:0});
 if(clock.current.key!==key){const remaining=game?.hand.timeout.deadline?game.hand.timeout.deadline-game.hand.timeout.serverNow:30000;clock.current={key,deadline:Date.now()+Math.max(0,Math.min(10000,remaining-1200))};}
 const [completed,setCompleted]=useState(''),deadline=clock.current.deadline;
 const complete=useCallback(()=>setCompleted(key),[key]);
 // A separate watchdog survives component changes or a backgrounded browser.
 useEffect(()=>{if(!key)return;const end=()=>{if(Date.now()>=deadline+650)setCompleted(key)};const timer=setTimeout(end,Math.max(0,deadline+650-Date.now()));document.addEventListener('visibilitychange',end);return()=>{clearTimeout(timer);document.removeEventListener('visibilitychange',end)}},[key,deadline]);
 return{active:!!key&&completed!==key,tile,key,duration:10000,deadline,complete};
}
