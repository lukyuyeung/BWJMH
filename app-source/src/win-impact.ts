import type {Game} from './main';
export type WinImpactTier='mangan'|'haneman'|'baiman'|'sanbaiman'|'yakuman'|'double-yakuman';
export const WIN_FLIP_LEAD=1800,WIN_FLIP_DURATION=650,WIN_LIGHT_END=4700;
export function winImpactTier(game:Game):WinImpactTier|null{
 const r=game.hand.result;if(!r)return null;
 const limit=r.score.limit.toLowerCase().replaceAll('_',' ').replaceAll('-',' ');
 if(r.evaluation.yakuman>=2)return 'double-yakuman';
 if(r.evaluation.yakuman>0||limit.includes('yakuman'))return 'yakuman';
 return ['mangan','haneman','baiman','sanbaiman'].includes(limit)?limit as WinImpactTier:null;
}
/** Decorative geometry is bounded to projected winner tiles; never a table-wide overlay. */
export function createWinnerLight(){
 const node=document.createElement('div');node.className='winner-tile-light';node.setAttribute('aria-hidden','true');
 node.innerHTML='<div class="wtl-beams">'+[0,1,2].map(i=>`<i class="wtl-beam beam-${i}"></i>`).join('')+'</div><div class="wtl-reflection"></div><div class="wtl-sweep"></div><div class="wtl-dust">'+Array.from({length:8},(_,i)=>`<i style="--x:${8+i*12}%;--delay:${i*70}ms"></i>`).join('')+'</div>';
 return node;
}

const TIER_LEADS={mangan:1800,haneman:2000,baiman:2300,sanbaiman:2600,yakuman:3100,'double-yakuman':3600};
export function winTiming(game:Game){const wins=game.hand.results??(game.hand.result?[game.hand.result]:[]),slots=wins.map(result=>{const tier=winImpactTier({...game,hand:{...game.hand,result}});return tier?TIER_LEADS[tier]-180:900;});const lead=180+slots.reduce((a,b)=>a+b,0);return {slots,lead,flipEnd:lead+WIN_FLIP_DURATION,end:lead+WIN_FLIP_DURATION+2250};}
