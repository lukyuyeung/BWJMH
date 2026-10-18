import {describe,it,expect} from 'vitest';
import {galaSnapshot} from '../../client/src/gala-state.js';
import type {GalaGame} from '../../client/src/gala-state.js';

describe('V9 presentation receives authoritative public state',()=>{
 const tile=(id:string,face='1m',red=false)=>({id,face,red});
 function game(){
  const discards={east:[tile('east-river')],south:[tile('south-river','5p',true)],west:[],north:[]};
  return {room:{code:'PUBLIC'},you:{seat:'south',hand:[tile('PRIVATE_HAND','C')]},hand:{revision:7,
   match:{roundWind:'east',handNumber:1,honba:0,dealer:'east'},concealedCounts:{east:13,south:14,west:10,north:13},
   discards,melds:{east:[],south:[],west:[],north:[]},wallSlots:[{side:'east',stack:2,level:1,occupied:true,dead:true,indicator:tile('dora','3s')}],
   claim:{tile:discards.east[0]},events:[],actions:{secret:'DO_NOT_FORWARD'}}} as unknown as GalaGame;
 }
 it('rotates seats for the local player, preserves red tiles and dora, and omits private hands/actions',()=>{
  const result=galaSnapshot(game(),false,true,{south:'south-river'});
  expect(result.seats[0]!.discards[0]).toMatchObject({face:'5p',red:true,sideways:true});
  expect(result.seats[3]!.wall[0]?.indicator?.face).toBe('3s');
  expect(result.seats.map(s=>s.concealed)).toEqual([14,10,13,13]);
  expect(JSON.stringify(result)).not.toMatch(/PRIVATE_HAND|DO_NOT_FORWARD/);
 });
 it('keeps added kan stacked on the called tile, and closed kan distinct',()=>{
  const g=game(),called=tile('called','P');
  g.hand.melds.west=[{type:'kan',open:true,calledTile:called,from:'south',tiles:[called,tile('b','P'),tile('c','P'),tile('added','P')]},
   {type:'kan',open:false,calledTile:tile('closed'),from:'west',tiles:[tile('closed'),tile('2'),tile('3'),tile('4')]}];
  const melds=galaSnapshot(g,true,false,{}).seats[1]!.melds;
  expect(melds[0]).toMatchObject({type:'kakan',addedTile:{id:'added'}});
  expect(melds[0]!.tiles).toHaveLength(3);
  expect(melds[1]!.type).toBe('ankan');
 });
});
