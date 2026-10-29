/** Stable identity keys; yellow is the bare-headed Black Hoodie Bunny. */
export const CHARACTERS=['yellow','king','ninja','wizard'] as const;
export type CharacterId=typeof CHARACTERS[number];
export const CHARACTER_NAMES:Record<CharacterId,string>={yellow:'黑帽T兔',king:'國王兔',ninja:'忍者兔',wizard:'巫師兔'};
export const CHARACTER_ART:Record<CharacterId,string>={yellow:'/art/hoodie-v3/character.png',king:'/art/ribbon-v2/king-character.png',ninja:'/art/ribbon-v2/ninja-character.png',wizard:'/art/ribbon-v2/wizard-character.png'};
export function isCharacter(value:unknown):value is CharacterId{return typeof value==='string'&&(CHARACTERS as readonly string[]).includes(value)}
export function botCharacters(selected:CharacterId):CharacterId[]{return (['ninja','king','wizard','yellow'] as const).filter(role=>role!==selected)}
