import type { Seat, ScoreResult } from '@bunny/riichi-engine';
export const PRESENTATION_EVENTS=['CHI','PON','KAN','RIICHI','RON','TSUMO','MANGAN','HANEMAN','BAIMAN','SANBAIMAN','YAKUMAN','DOUBLE_YAKUMAN'] as const;
export type PresentationKind=typeof PRESENTATION_EVENTS[number];
export interface PresentationEvent {id:number;kind:PresentationKind;seat:Seat;}
export function limitPresentation(score:Pick<ScoreResult,'limit'|'yakuman'>):PresentationKind|null {
 if(score.yakuman>=2)return 'DOUBLE_YAKUMAN';
 return ({mangan:'MANGAN',haneman:'HANEMAN',baiman:'BAIMAN',sanbaiman:'SANBAIMAN',yakuman:'YAKUMAN',none:null} as const)[score.limit];
}

export const CINEMATIC_TRIGGERS=['CHINITSU','KOKUSHI_MUSOU','SUUANKOU','DAISANGEN','CHUUREN_POUTOU','OTHER_YAKUMAN','DOUBLE_YAKUMAN'] as const;
export type CinematicTrigger=typeof CINEMATIC_TRIGGERS[number];
export interface CinematicState {id:number;trigger:CinematicTrigger;winner:Seat;character:'yellow'|'king'|'ninja'|'wizard';startedAt:number;endsAt:number;phase:'playing'|'results';video?:string;voice?:string;sound?:string;image?:string;particles?:boolean;serverNow:number;}
/** Immutable official clip duration + decode grace; never waits for client acknowledgements. */
export const CINEMATIC_ASSETS:Partial<Record<CinematicTrigger,{video:string;durationMs:number;voice?:string;sound?:string;image?:string;particles?:boolean}>>={CHINITSU:{video:'/cinematics/chinitsu.mp4',durationMs:7500}};
export function cinematicTrigger(e:{yakuman:number;yaku:{id:string}[]}):CinematicTrigger|null {
 if(e.yakuman>=2)return 'DOUBLE_YAKUMAN';
 const ids=new Set(e.yaku.map(y=>y.id));
 if(ids.has('kokushi'))return 'KOKUSHI_MUSOU';if(ids.has('suuankou'))return 'SUUANKOU';if(ids.has('daisangen'))return 'DAISANGEN';if(ids.has('chuuren'))return 'CHUUREN_POUTOU';
 if(e.yakuman)return 'OTHER_YAKUMAN';if(ids.has('chinitsu'))return 'CHINITSU';return null;
}
