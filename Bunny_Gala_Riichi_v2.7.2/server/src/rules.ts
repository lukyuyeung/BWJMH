export type MatchLength='tonpuusen'|'hanchan';
/** v2.5 exposes only settings that are wired end-to-end. Kuitan=on, atamahane=on and kazoe=yakuman remain fixed. */
export interface Ruleset { matchLength:MatchLength; akaDora:boolean; actionTimeoutMs:number;abortiveDraws:boolean;bankruptcyEnd:boolean;agariYame:boolean }
export const DEFAULT_RULESET:Ruleset={matchLength:'hanchan',akaDora:true,actionTimeoutMs:30000,abortiveDraws:true,bankruptcyEnd:true,agariYame:true};
export function normalizeRuleset(x:Partial<Ruleset>={}):Ruleset{return{bankruptcyEnd:x.bankruptcyEnd!==false,agariYame:x.agariYame!==false,abortiveDraws:x.abortiveDraws!==false,matchLength:x.matchLength==='tonpuusen'?'tonpuusen':'hanchan',akaDora:x.akaDora!==false,actionTimeoutMs:Math.max(5000,Math.min(120000,typeof x.actionTimeoutMs==='number'&&Number.isFinite(x.actionTimeoutMs)?x.actionTimeoutMs:DEFAULT_RULESET.actionTimeoutMs))}}

/** Fixed variant choices are explicit. These are not switchable until implemented. */
export const RULE_POLICY=Object.freeze({ron:'atamahane',kuitan:true,kiriageMangan:false,kazoe:'yakuman',doubleYakumanVariants:false,stackYakuman:true,doubleWindPairFu:4,riichiMinimumLiveTiles:4,postRiichiAnkan:true,kokushiAnkanRobbery:false,abortiveDraws:['nine_terminals','four_winds','four_riichi','four_kans'],tripleRonAbort:false,nagashiMangan:false,pao:false,kuikaeRestriction:true,bankruptcyEnd:true,agariYame:true,finalDrawPot:'retained',initialPoints:25000} as const);
