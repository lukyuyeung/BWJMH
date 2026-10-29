export const ROOM_TIERS=['low','medium','high','master'] as const;
export type RoomTier=typeof ROOM_TIERS[number];
export type MatchLength='tonpuusen'|'hanchan';
/** v2.5 exposes only settings that are wired end-to-end. Kuitan=on, double-Ron/triple-Ron-draw and kazoe=yakuman remain fixed. */
export interface Ruleset { tier?:RoomTier; matchLength:MatchLength; akaDora:boolean; actionTimeoutMs:number;abortiveDraws:boolean;bankruptcyEnd:boolean;agariYame:boolean }
export const DEFAULT_RULESET:Ruleset={matchLength:'tonpuusen',akaDora:true,actionTimeoutMs:30000,abortiveDraws:true,bankruptcyEnd:true,agariYame:true};
export function normalizeRuleset(x:Partial<Ruleset>={}):Ruleset{return{...(ROOM_TIERS.includes(x.tier as RoomTier)?{tier:x.tier}:{}),bankruptcyEnd:true,agariYame:x.agariYame!==false,abortiveDraws:x.abortiveDraws!==false,matchLength:'tonpuusen',akaDora:x.akaDora!==false,actionTimeoutMs:Math.max(5000,Math.min(120000,typeof x.actionTimeoutMs==='number'&&Number.isFinite(x.actionTimeoutMs)?x.actionTimeoutMs:DEFAULT_RULESET.actionTimeoutMs))}}

/** Fixed variant choices are explicit. These are not switchable until implemented. */
export const RULE_POLICY=Object.freeze({ron:'double-ron',kuitan:true,kiriageMangan:false,kazoe:'yakuman',doubleYakumanVariants:false,stackYakuman:true,doubleWindPairFu:4,riichiMinimumLiveTiles:4,postRiichiAnkan:true,kokushiAnkanRobbery:false,abortiveDraws:['nine_terminals','four_winds','four_riichi','four_kans','triple_ron'],tripleRonAbort:true,nagashiMangan:true,pao:true,kuikaeRestriction:true,bankruptcyEnd:true,agariYame:true,finalDrawPot:'first-place',initialPoints:25000,targetPoints:30000,eastMatchExtension:'south',dealerRepeatPriority:true,extensionCap:'south4'} as const);

export const TIER_TURN_MS={low:30000,medium:20000,high:10000,master:10000} as const;
export function turnMsForEntry(entry:number){const i=[1000,10000,100000,1000000].indexOf(entry);if(i<0)throw new Error('Unsupported carrot entry');return [30000,20000,10000,10000][i]!;}

/** Explicit tier distinguishes high/master even though both allow ten seconds. Old saves infer their former tier. */
export function roomTier(r:Partial<Ruleset>):RoomTier{return ROOM_TIERS.includes(r.tier as RoomTier)?r.tier!:r.actionTimeoutMs===10000?'high':r.actionTimeoutMs===20000?'medium':'low'}
export const TIER_ENTRY={low:1000,medium:10000,high:100000,master:1000000} as const;
export const TIER_NAME={low:'新手場',medium:'中級場',high:'高級場',master:'雀聖場'} as const;
