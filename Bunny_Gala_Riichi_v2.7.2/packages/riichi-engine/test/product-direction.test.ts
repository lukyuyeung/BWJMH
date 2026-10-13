import {describe,it,expect} from 'vitest';
import {calculateShanten,improvingTiles,createStandardWall,dealInitialHands,createHandState,publicWallSlots,constructPhysicalWall,SEATS,type TileFace} from '../src/index.js';
const f=(s:string)=>s.split(' ') as TileFace[];
describe('exact strategic hand analysis',()=>{
 it.each(['1m 2m 3m 4m 5m 6m 2p 3p 4p 6s 7s 8s P P','1m 1m 2m 2m 3p 3p 5p 5p 7s 7s E E C C','1m 9m 1p 9p 1s 9s E S W N P F C C'])('recognizes complete standard and special shapes %s',hand=>expect(calculateShanten(f(hand))).toBe(-1));
 it('handles open hands and legal improving faces',()=>{expect(calculateShanten(f('4m 5m 6m 2p 3p 4p 6s 7s 8s P'),1)).toBe(0);expect(improvingTiles(f('4m 5m 6m 2p 3p 4p 6s 7s 8s P'),1)).toEqual(['P']);expect(calculateShanten(f('1m 9m 1p 9p 1s 9s E S W N P F C'))).toBe(0);});
 it('cannot treat four identical tiles as two chiitoitsu pairs',()=>expect(calculateShanten(f('1m 1m 1m 1m 3p 3p 5p 5p 7s 7s E E C C'))).toBeGreaterThan(-1));
});
describe('public physical wall',()=>{
 it.each(SEATS)('constructs 17 two-high stacks per side for dealer %s',dealer=>{const wall=createStandardWall();const g=createHandState(dealInitialHands(wall,dealer,[3,4]),dealer);const slots=publicWallSlots(g);expect(slots).toHaveLength(136);for(const seat of SEATS)expect(slots.filter(s=>s.side===seat)).toHaveLength(34);expect(slots.filter(s=>s.occupied)).toHaveLength(83);expect(slots.filter(s=>s.dead)).toHaveLength(14);expect(slots.filter(s=>s.indicator)).toHaveLength(1);expect(g.hands[dealer]).toHaveLength(14);expect(JSON.stringify(slots)).not.toContain('tileIds');expect(new Set(g.physicalWall!.tileIds).size).toBe(136);});
 it('draw changes exactly its original wall slot, including dead boundary refill',()=>{const g=createHandState(dealInitialHands(createStandardWall()));const id=g.liveWall[0]!.id,idx=g.physicalWall!.tileIds.indexOf(id);g.liveWall.shift();expect(publicWallSlots(g)[idx]!.occupied).toBe(false);const rinshan=g.deadWall.rinshan.shift()!;g.deadWall.tiles=g.deadWall.tiles.filter(t=>t.id!==rinshan.id);const refill=g.liveWall.pop()!;g.deadWall.tiles.push(refill);g.deadWall.revealedDoraCount++;const slots=publicWallSlots(g);expect(slots.filter(s=>s.dead)).toHaveLength(14);expect(slots.filter(s=>s.indicator)).toHaveLength(2);expect(slots[g.physicalWall!.tileIds.indexOf(refill.id)]!.dead).toBe(true);expect(slots[g.physicalWall!.tileIds.indexOf(rinshan.id)]!.occupied).toBe(false);});
 it('rejects duplicate physical tiles and invalid dice',()=>{const wall=createStandardWall();expect(()=>constructPhysicalWall([...wall.slice(1),wall[1]!],'east')).toThrow();expect(()=>constructPhysicalWall(wall,'east',[0,7])).toThrow();});
});


it('draws the upper tile before the lower tile of a physical stack',()=>{
 const wall=createStandardWall();const physicalWall=constructPhysicalWall(wall,'east',[3,4]);
 const state={physicalWall,liveWall:[...wall.slice(0,122)],deadWall:{tiles:wall.slice(122),doraIndicators:[],revealedDoraCount:0}};
 const first=physicalWall.tileIds.indexOf(wall[0]!.id),second=physicalWall.tileIds.indexOf(wall[1]!.id);
 const before=publicWallSlots(state);expect(before[first]!.level).toBe(1);expect(before[second]!.level).toBe(0);expect(before[first]!.stack).toBe(before[second]!.stack);expect(before[first]!.side).toBe(before[second]!.side);
 state.liveWall.shift();const after=publicWallSlots(state);expect(after[first]!.occupied).toBe(false);expect(after[second]!.occupied).toBe(true);
 const game=createHandState(dealInitialHands(wall));expect(publicWallSlots(game).filter(s=>s.indicator).every(s=>s.level===1)).toBe(true);
});
