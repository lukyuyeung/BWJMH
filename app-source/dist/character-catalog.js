// Generated from rules/characters.ts.
/** Stable identity keys; yellow is the bare-headed Black Hoodie Bunny. */
export const CHARACTERS = ['yellow', 'king', 'ninja', 'wizard'];
export const CHARACTER_NAMES = { yellow: '黑帽T兔', king: '國王兔', ninja: '忍者兔', wizard: '巫師兔' };
export const CHARACTER_ART = { yellow: '/art/hoodie-v3/character.png', king: '/art/ribbon-v2/king-character.png', ninja: '/art/ribbon-v2/ninja-character.png', wizard: '/art/ribbon-v2/wizard-character.png' };
export function isCharacter(value) { return typeof value === 'string' && CHARACTERS.includes(value); }
export function botCharacters(selected) { return ['ninja', 'king', 'wizard', 'yellow'].filter(role => role !== selected); }
