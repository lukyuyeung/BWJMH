import React,{useEffect} from 'react';
import type {Game,Seat} from './main';
import {RibbonCutin} from './ribbon-cutin';
import {seatCharacter} from './seat-character';
import {audioHandKey,gameAudio} from './game-audio';
import './win-call.css';
import {winEventKey} from './win-art-audio';
const seats:Seat[]=['east','south','west','north'];
/** The shared win timeline owns duration. A declaration never advances the table itself. */
export function WinCall({game,reduce=false}:{game:Game;reduce?:boolean}){
 const result=game.hand.result!,role=seatCharacter(game,result.winner),scope=audioHandKey(game)+':win-declaration:'+result.winner+':'+winEventKey(game),relative=(seats.indexOf(result.winner)-seats.indexOf(game.you.seat)+4)%4;
 useEffect(()=>{const a=gameAudio();const release=a?.claimVoiceScope(scope,role);a?.once(scope,()=>{void a.speak(role,result.method,scope,{cinematic:true})});return()=>release?.()},[scope,role,result.method]);
 return <section className="win-call-announcement" role="status" aria-label="和牌宣告" data-method={result.method} data-winner={result.winner}><RibbonCutin action={result.method} character={role} relative={relative} reduce={reduce}/><div className="win-call-player">{game.room.players.find(p=>p.seat===result.winner)?.name}<span>{result.method==='ron'?'榮和':'自摸'}</span></div></section>;
}
