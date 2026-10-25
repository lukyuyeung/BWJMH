export type MatchLength='tonpuusen'|'hanchan';
/** v2.5 exposes only settings that are wired end-to-end. Kuitan=on, double-Ron/triple-Ron-draw and kazoe=yakuman remain fixed. */
export interface Ruleset { matchLength:MatchLength; akaDora:boolean; actionTimeoutMs:number;abortiveDraws:boolean;bankruptcyEnd:boolean;agariYame:boolean }
export const DEFAULT_RULESET:Ruleset={matchLength:'tonpuusen',akaDora:true,actionTimeoutMs:30000,abortiveDraws:true,bankruptcyEnd:true,agariYame:true};
export function normalizeRuleset(x:Partial<Ruleset>={}):Ruleset{return{bankruptcyEnd:true,agariYame:x.agariYame!==false,abortiveDraws:x.abortiveDraws!==false,matchLength:'tonpuusen',akaDora:x.akaDora!==false,actionTimeoutMs:Math.max(5000,Math.min(120000,typeof x.actionTimeoutMs==='number'&&Number.isFinite(x.actionTimeoutMs)?x.actionTimeoutMs:DEFAULT_RULESET.actionTimeoutMs))}}

/** Fixed variant choices are explicit. These are not switchable until implemented. */
export const RULE_POLICY=Object.freeze({ron:'double-ron',kuitan:true,kiriageMangan:false,kazoe:'yakuman',doubleYakumanVariants:false,stackYakuman:true,doubleWindPairFu:4,riichiMinimumLiveTiles:4,postRiichiAnkan:true,kokushiAnkanRobbery:false,abortiveDraws:['nine_terminals','four_winds','four_riichi','four_kans','triple_ron'],tripleRonAbort:true,nagashiMangan:false,pao:false,kuikaeRestriction:true,bankruptcyEnd:true,agariYame:true,finalDrawPot:'first-place',initialPoints:25000} as const);
