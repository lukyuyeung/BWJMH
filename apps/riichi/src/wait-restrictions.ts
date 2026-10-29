import {ronWaitsWithYaku,type FuritenReason,type Tile,type Meld,type TileFace} from '../engine/index';import type {Game} from './main';
export const FURITEN_NAMES:Record<FuritenReason,string>={discard:'自家牌河',temporary:'同巡','riichi-pass':'立直後'};
/** Owner hand and public information only; a preview includes the prospective discard history. */
export function waitRestrictions(game:Game,preview:{face:string}[]|undefined,hoverFace:string|null,declaringRiichi=false){
 const h=game.hand,status=h.winStatus,base=status?.furitenReasons??(h.furiten?['discard' as const]:[]);if(!preview||!hoverFace)return{reasons:base,noYakuWaits:declaringRiichi?[]:status?.noYakuWaits??[]};
 const waits=preview.map(t=>t.face as TileFace),discarded=new Set([...(status?.discardedFaces??h.discards[game.you.seat].map(t=>t.face)),hoverFace]),reasons:FuritenReason[]=[...(waits.some(f=>discarded.has(f))?['discard' as const]:[]),...base.filter(r=>r!=='discard')];
 const removed=game.you.hand.find(t=>t.face===hoverFace),hand=game.you.hand.filter(t=>t.id!==removed?.id) as Tile[],seats=['east','south','west','north'],index=(seats.indexOf(game.you.seat)-seats.indexOf(h.match.dealer)+4)%4,roles=ronWaitsWithYaku(hand,h.melds[game.you.seat] as Meld[],waits,{seatWind:(['E','S','W','N'] as TileFace[])[index]!,roundWind:h.match.roundWind==='east'?'E':'S',riichi:h.riichi[game.you.seat]||declaringRiichi});
 return{reasons,noYakuWaits:waits.filter(f=>!roles.includes(f))};
}
