import { describe, expect, it } from 'vitest';
import { calculateKnownFu, calculateScore, getBasePoints } from '../src/scoring.js';

describe('riichi scoring core',()=>{
  it('scores 3 han 40 fu non-dealer ron as 5200',()=>expect(calculateScore(3,40,false,'ron').payment.ron).toBe(5200));
  it('scores 4 han 30 fu non-dealer ron as 7700',()=>expect(calculateScore(4,30,false,'ron').payment.ron).toBe(7700));
  it('caps 4 han 40 fu at mangan',()=>{const s=calculateScore(4,40,false,'ron');expect(s.limit).toBe('mangan');expect(s.payment.ron).toBe(8000)});
  it('scores 5 han as mangan',()=>expect(calculateScore(5,30,false,'ron').payment.ron).toBe(8000));
  it('scores dealer mangan ron as 12000',()=>expect(calculateScore(5,30,true,'ron').payment.ron).toBe(12000));
  it('scores non-dealer mangan tsumo as 4000/2000',()=>{const p=calculateScore(5,30,false,'tsumo').payment;expect(p.dealerTsumo).toBe(4000);expect(p.nonDealerTsumo).toBe(2000);expect(p.total).toBe(8000)});
  it('scores dealer mangan tsumo as 4000 each',()=>expect(calculateScore(5,30,true,'tsumo').payment.eachTsumo).toBe(4000));
  it('supports haneman, baiman and sanbaiman',()=>{expect(getBasePoints(6,30).limit).toBe('haneman');expect(getBasePoints(8,30).limit).toBe('baiman');expect(getBasePoints(11,30).limit).toBe('sanbaiman')});
  it('supports yakuman',()=>expect(calculateScore(0,0,false,'ron',1).payment.ron).toBe(32000));
  it('uses fixed 25 fu for chiitoitsu',()=>expect(calculateKnownFu({shape:'chiitoitsu',method:'ron',closed:true})).toBe(25));
  it('does not guess standard-hand fu without decomposition',()=>expect(calculateKnownFu({shape:'standard',method:'ron',closed:true})).toBeNull());
});

describe('independent payment limit matrix',()=>{
 it.each([[6,12000],[8,16000],[11,24000],[13,32000]])('%d han nondealer Ron pays %d',(han,payment)=>{expect(calculateScore(han,30,false,'ron').payment.ron).toBe(payment);expect(calculateScore(han,30,true,'ron').payment.ron).toBe(payment*1.5)});
 it('double Yakuman dealer/nondealer Ron and Tsumo',()=>{expect(calculateScore(0,0,false,'ron',2).payment.total).toBe(64000);expect(calculateScore(0,0,true,'ron',2).payment.total).toBe(96000);expect(calculateScore(0,0,false,'tsumo',2).payment).toEqual({dealerTsumo:32000,nonDealerTsumo:16000,total:64000});expect(calculateScore(0,0,true,'tsumo',2).payment).toEqual({eachTsumo:32000,total:96000})});
 it('normal Tsumo rounds each payment independently',()=>{expect(calculateScore(1,30,false,'tsumo').payment).toEqual({dealerTsumo:500,nonDealerTsumo:300,total:1100});expect(calculateScore(1,30,true,'tsumo').payment).toEqual({eachTsumo:500,total:1500})});
});
