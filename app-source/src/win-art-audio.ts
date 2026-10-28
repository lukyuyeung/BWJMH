import {useEffect,useRef} from 'react';
import type {Game} from './main';
import type {Character} from './presentation';
import type {WinImpactTier} from './win-impact';
import {audioHandKey,gameAudio} from './game-audio';
const announced=new Set<string>();
export const winEventKey=(game:Game)=>(game.hand.events??[]).filter(e=>e.seat===game.hand.result?.winner&&['RON','TSUMO'].includes(e.kind)).at(-1)?.id??game.hand.winSequence?.id??game.hand.cinematic?.id??game.hand.turnNumber;
export const artAnnouncementKey=(game:Game,role:Character)=>[audioHandKey(game),game.hand.result?.winner,role,winEventKey(game),'art-grade'].join(':');
export function markArtAnnouncement(game:Game,role:Character){announced.add(artAnnouncementKey(game,role));if(announced.size>100)announced.delete(announced.values().next().value!)}
export const hasArtAnnouncement=(game:Game,role:Character)=>announced.has(artAnnouncementKey(game,role));
export const cutinScore=(tier:WinImpactTier)=>tier.includes('yakuman')?'cutin_divine':['baiman','sanbaiman'].includes(tier)?'cutin_gold':'cutin_silver';
/** Seek to the authoritative visual age after decode; never hold back the eye strip. */
export function useCutinScore(name:string,scope:string,elapsed:number,enabled=true){
 const clock=useRef({elapsed,received:performance.now()});clock.current={elapsed,received:performance.now()};
 useEffect(()=>{if(!enabled)return;let canceled=false,stop=()=>{};const a=gameAudio();void a?.ready.then(()=>{if(!canceled){const c=clock.current;stop=a.playCinematic(name,scope,c.elapsed+performance.now()-c.received)}});return()=>{canceled=true;stop()};},[name,scope,enabled]);
}
