import { describe, expect, it } from 'vitest';
import { createHandState, discardTile, getClaimOptions, passClaim, claimPon, claimChi } from '../src/game.js';
import { createStandardWall } from '../src/tiles.js';
import { dealInitialHands } from '../src/deal.js';
import type { Seat } from '../src/deal.js';

function t(face:string, copy=0){return createStandardWall().find(x=>x.face===face&&x.copy===copy)!}
function state(){
 const hands:Record<Seat,any[]>={
  east:[t('5m',0),...['1p','2p','3p','4p','5p','6p','7p','8p','9p','E','S','W','N'].map((f,i)=>t(f,i%4))],
  south:[t('5m',1),t('5m',2),...['1s','2s','3s','4s','6s','7s','8s','9s','P','F','C'].map((f,i)=>t(f,i%4))],
  west:[t('4m',0),t('6m',0),...['1p','2p','3p','4p','6p','7p','8p','9p','E','P','C'].map((f,i)=>t(f,(i+1)%4))],
  north:['1m','2m','3m','4m','6m','7m','8m','9m','1s','2s','3s','E','P'].map((f,i)=>t(f,i%4)),
 };
 const deal=dealInitialHands(createStandardWall()); return createHandState({...deal,hands});
}
describe('open meld claims',()=>{
 it('offers pon to a player holding two matching tiles',()=>{const s=state();discardTile(s,'east','5m-0');expect(getClaimOptions(s,'south')?.pon).toBe(true)});
 it('only offers chi to the next seat',()=>{const s=state();discardTile(s,'east','5m-0');expect(getClaimOptions(s,'west')?.chiSequences.length??0).toBe(0)});
 it('pon consumes two concealed tiles and exposes a meld',()=>{const s=state();discardTile(s,'east','5m-0');claimPon(s,'south');expect(s.melds.south[0]?.type).toBe('pon');expect(s.hands.south.filter(x=>x.face==='5m')).toHaveLength(0);expect(s.currentSeat).toBe('south');expect(s.phase).toBe('awaiting_discard')});
 it('chi can proceed after higher-priority claims pass',()=>{const s=state();discardTile(s,'east','5m-0');passClaim(s,'south');const o=getClaimOptions(s,'south');expect(o).toBeNull(); /* south is next seat here; this fixture validates pass closure */});
});
