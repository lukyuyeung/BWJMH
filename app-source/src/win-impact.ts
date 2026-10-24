import type {Game} from './main';
export type WinImpactTier='mangan'|'haneman'|'baiman'|'sanbaiman'|'yakuman';
export const WIN_FLIP_LEAD=700,WIN_FLIP_DURATION=650,WIN_LIGHT_END=4100;
export function winImpactTier(game:Game):WinImpactTier|null{
 const r=game.hand.result;if(!r)return null;
 const limit=r.score.limit.toLowerCase().replaceAll('_',' ').replaceAll('-',' ');
 if(r.evaluation.yakuman>0||limit.includes('yakuman'))return 'yakuman';
 return ['mangan','haneman','baiman','sanbaiman'].includes(limit)?limit as WinImpactTier:null;
}
/** Decorative geometry is bounded to projected winner tiles; never a table-wide overlay. */
export function createWinnerLight(){
 const node=document.createElement('div');node.className='winner-tile-light';node.setAttribute('aria-hidden','true');
 node.innerHTML='<div class="wtl-atmosphere"></div><div class="wtl-beams">'+[0,1,2].map(i=>`<i class="wtl-beam beam-${i}"></i>`).join('')+'</div><div class="wtl-bed"></div><div class="wtl-rim"></div><div class="wtl-sweep sweep-a"></div><div class="wtl-sweep sweep-b"></div>'+[0,1,2].map(i=>`<i class="wtl-ring ring-${i}"></i>`).join('')+'<div class="wtl-motes">'+Array.from({length:18},(_,i)=>`<i style="--x:${5+(i*37)%91}%;--delay:${i%6*65}ms;--drift:${(i%5-2)*13}px"></i>`).join('')+'</div><div class="wtl-crown"></div>';
 return node;
}
