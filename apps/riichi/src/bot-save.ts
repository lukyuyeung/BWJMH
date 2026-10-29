import type {Room} from '../rules/room';
export type SavedBotGame={version:1;savedAt:number;playerId:string;room:Room};
export interface BotSaveApi{key:string;ownerKey:string;read:()=>SavedBotGame|null;write:(s:SavedBotGame)=>boolean;archiveInvalid:()=>void;summary:()=>{character:string;difficulty:string;round:string;hand:number;honba:number;finished:boolean;savedAt:number}|null;claim:(id:string)=>boolean;owns:(id:string)=>boolean}
declare global{interface Window{BunnyBotSave?:BotSaveApi}}
/** Freeze all single-player deadlines while the page is closed/loading. */
export function shiftBotClocks(room:Room,delta:number){
 if(room.actionDeadline!==undefined)room.actionDeadline+=delta;
 if(room.cinematic){room.cinematic.startedAt+=delta;room.cinematic.endsAt+=delta;room.cinematic.serverNow+=delta}
 if(room.winSequence){room.winSequence.startedAt+=delta;room.winSequence.endsAt+=delta;room.winSequence.serverNow+=delta}
 if(room.drawPresentation){room.drawPresentation.startedAt+=delta;room.drawPresentation.endsAt+=delta}
 if(room.resultFlow?.deadline)room.resultFlow.deadline+=delta;
}
