import { describe,it,expect } from 'vitest';
import { createMatchState,calculateNotenPayments,advanceMatch,rankScores } from '../src/match.js';
describe('match lifecycle',()=>{
 it('splits 3000 noten payment for one tenpai player',()=>{expect(calculateNotenPayments(['east'])).toEqual({east:3000,south:-1000,west:-1000,north:-1000})});
 it('splits 3000 for two and three tenpai players',()=>{expect(calculateNotenPayments(['east','south'])).toEqual({east:1500,south:1500,west:-1500,north:-1500});expect(calculateNotenPayments(['east','south','west'])).toEqual({east:1000,south:1000,west:1000,north:-3000})});
 it('dealer continuation increments honba',()=>{const m=createMatchState();advanceMatch(m,true);expect(m.honba).toBe(1);expect(m.handNumber).toBe(1);expect(m.dealer).toBe('east')});
 it('advances east 4 to south 1',()=>{const m=createMatchState();m.handNumber=4;advanceMatch(m,false);expect(m.roundWind).toBe('south');expect(m.handNumber).toBe(1)});
 it('finishes after south 4 when dealer does not continue',()=>{const m=createMatchState();m.roundWind='south';m.handNumber=4;advanceMatch(m,false);expect(m.finished).toBe(true)});
 it('ranks with seat order as stable tie break',()=>{expect(rankScores({east:25000,south:30000,west:20000,north:25000})).toEqual(['south','east','north','west'])});
});
