import {useEffect,useState} from 'react';
import type {Game} from './main';
import type {Character} from './presentation';
import {audioHandKey,gameAudio,resultVoiceEvents} from './game-audio';
type ReportState={revealed:number;activeRow:number;grade:boolean;impact:boolean;points:boolean;stage:'yaku'|'limit'|'complete'};
const initial:ReportState={revealed:0,activeRow:-1,grade:false,impact:false,points:false,stage:'yaku'};
const completed=new Set<string>();
const levels=new Set(['mangan','haneman','baiman','sanbaiman','yakuman','double-yakuman','counted-yakuman']);
function pause(ms:number,signal:AbortSignal){return new Promise<void>(resolve=>{if(signal.aborted){resolve();return;}const finish=()=>{clearTimeout(timer);signal.removeEventListener('abort',finish);resolve();},timer=setTimeout(finish,ms);signal.addEventListener('abort',finish,{once:true});});}
function visible(signal:AbortSignal){if(!document.hidden||signal.aborted)return Promise.resolve();return new Promise<void>(resolve=>{const finish=()=>{if(document.hidden&&!signal.aborted)return;document.removeEventListener('visibilitychange',finish);signal.removeEventListener('abort',finish);resolve();};document.addEventListener('visibilitychange',finish);signal.addEventListener('abort',finish,{once:true});});}
/** Each row waits for its own VO completion, including clips longer than the old fixed timer. */
export function useWinReport(game:Game,character:Character,level:string,rowCount:number,reduce:boolean){
 const key=audioHandKey(game)+':'+character+':'+game.hand.result?.score.payment.total+':'+game.hand.result?.evaluation.yaku.map(y=>y.name).join(','),scope=key+':result',events=resultVoiceEvents(game),eventKey=events.join('|');
 const [state,setState]=useState<ReportState>(initial);
 useEffect(()=>{const controller=new AbortController(),signal=controller.signal,a=gameAudio();let release:(()=>void)|undefined;const update=(patch:Partial<ReportState>)=>{if(!signal.aborted)setState(s=>({...s,...patch}));};
  const run=async()=>{if(completed.has(key)){setState({revealed:rowCount,activeRow:-1,grade:true,impact:false,points:true,stage:'complete'});return;}
   setState(initial);await a?.ready;if(signal.aborted)return;release=a?.claimVoiceScope(scope,character);void a?.warmVoices(character,[...events,level.replaceAll('-','_')]);await pause(650,signal);
   for(let i=0;i<rowCount;i++){await visible(signal);if(signal.aborted)return;let revealedAt=0;const reveal=()=>{if(signal.aborted||revealedAt)return;revealedAt=performance.now();update({revealed:i+1,activeRow:i});};
    const speech=a?.speak(character,events[i]??'',scope,{onStart:reveal});if(speech)await speech;if(signal.aborted)return;if(!revealedAt)reveal();await pause(Math.max(180,850-(performance.now()-revealedAt)),signal);
   }
   if(signal.aborted)return;update({activeRow:-1});await pause(250,signal);if(signal.aborted)return;update({grade:true});await pause(350,signal);await visible(signal);if(signal.aborted)return;
   if(levels.has(level)){update({stage:'limit',impact:false});const began=performance.now();await a?.speak(character,level.replaceAll('-','_'),scope);if(signal.aborted)return;await pause(Math.max(200,1600-(performance.now()-began)),signal);}
   else{await pause(250,signal);}
   if(signal.aborted)return;update({impact:false,points:true,stage:'complete'});completed.add(key);if(completed.size>80)completed.delete(completed.values().next().value!);
  };void run();return()=>{controller.abort();a?.stopVoices(scope);release?.()};
 },[key,level,rowCount,eventKey,reduce]);
 return state;
}
