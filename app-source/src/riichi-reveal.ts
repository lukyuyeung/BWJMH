import {useCallback,useEffect,useRef,useState} from 'react';
import type {Game,Tile} from './main.js';
export type RiichiReveal={practice?:boolean;active:boolean;tile:Tile|undefined;key:string;duration:number;deadline:number;complete:()=>void};
/** Only the owner's actual drawn tile is exposed. Normal games keep their deadline; academy practice is untimed. */
export function useRiichiReveal(game:Game|null,_reduce:boolean):RiichiReveal{
 const practice=!!(game?.hand as any)?.academyFive;
 const ready=!!game&&!game.room.players.find(p=>p.seat===game.you.seat)?.autoPlay&&!game.room.match.finished&&game.hand.riichi[game.you.seat]&&game.hand.currentSeat===game.you.seat&&game.hand.phase==='awaiting_discard'&&game.hand.actions.canDiscard;
 const tile=ready&&(!practice||[5,7].includes((game!.hand as any).academyFive.stage))?game!.you.hand.find(t=>t.id===game!.you.drawnTileId):undefined;
 const key=tile?[game!.room.code,game!.hand.match.roundWind,game!.hand.match.handNumber,game!.hand.match.honba,tile.id].join(':'):'';
 const clock=useRef({key:'',deadline:0});
 if(clock.current.key!==key){const remaining=game?.hand.timeout.deadline?game.hand.timeout.deadline-game.hand.timeout.serverNow:30000;clock.current={key,deadline:practice?Infinity:Date.now()+Math.max(0,Math.min(10000,remaining-1200))};}
 const [completed,setCompleted]=useState(''),deadline=clock.current.deadline;
 const complete=useCallback(()=>setCompleted(key),[key]);
 // A separate watchdog survives component changes or a backgrounded browser.
 useEffect(()=>{if(!key||practice)return;const end=()=>{if(Date.now()>=deadline+650)setCompleted(key)};const timer=setTimeout(end,Math.max(0,deadline+650-Date.now()));document.addEventListener('visibilitychange',end);return()=>{clearTimeout(timer);document.removeEventListener('visibilitychange',end)}},[key,deadline,practice]);
 return{practice,active:!!key&&completed!==key,tile,key,duration:10000,deadline,complete};
}
