import type {Game} from './main';import type {Character} from './presentation';import {winImpactTier,type WinImpactTier} from './win-impact';
export const ART_CHARACTERS:Character[]=['yellow','king','ninja','wizard'];
export const ART_CHARACTER_NAMES={yellow:'金帽兔',king:'國王兔',ninja:'忍者兔',wizard:'巫師兔'};
export const ART_TIERS:WinImpactTier[]=['mangan','haneman','baiman','sanbaiman','yakuman','double-yakuman'];
export const ART_TIER_NAMES={mangan:'滿貫',haneman:'跳滿',baiman:'倍滿',sanbaiman:'三倍滿',yakuman:'役滿','double-yakuman':'雙倍役滿'};
export const ART_END_MS={mangan:5500,haneman:5700,baiman:5900,sanbaiman:6100,yakuman:6500,'double-yakuman':6900};
export function winArtUrl(role:Character,tier:WinImpactTier){return `/art/win-cinematic-v4/${role}/${tier}.png`}
export function artWinningResults(game:Game){return (game.hand.results??(game.hand.result?[game.hand.result]:[])).filter(result=>winImpactTier({...game,hand:{...game.hand,result}}))}
export function usesWinArtwork(game:Game){return !game.hand.cinematic?.video&&artWinningResults(game).length>0}
