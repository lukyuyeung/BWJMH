import {describe,it,expect} from 'vitest';
import {automaticIntent,defaultOptions,discardedFaceCount} from '../../client/src/gameplay.js';
import {RoomManager} from '../src/room.js';
import {installScenario,assertPhysical} from '../qa/scenarios.js';
describe('riichi interaction and public face lights',()=>{
 const state={finished:false,canRon:false,canPassClaim:false,canDiscard:true,canTsumo:false,drawnTileId:'actual-drawn',discardTileIds:['actual-drawn'],riichi:true};
 it('automatically discards the real drawn ID after riichi without enabling blanket auto discard',()=>expect(automaticIntent(defaultOptions,state)).toEqual({event:'game:discard',payload:{tileId:'actual-drawn'}}));
 it('retains tsumo, valid kan and ron decisions; never guesses a missing or illegal drawn ID',()=>{
  for(const change of [{canTsumo:true},{ankanTileIds:['legal-kan']},{kakanTileIds:['legal-kakan']},{drawnTileId:undefined},{discardTileIds:['different']},{finished:true},{canDiscard:false}])expect(automaticIntent(defaultOptions,{...state,...change})).toBeNull();
  expect(automaticIntent({...defaultOptions,disableCalls:true},{...state,canRon:true,canPassClaim:true,canDiscard:false})).toBeNull();
 });
 it('counts all four rivers and called tiles once, excluding concealed kan tiles',()=>{
  const tile={id:'river',face:'5m'},called={id:'called',face:'5m'};
  expect(discardedFaceCount('5m',{east:[tile],south:[{id:'other',face:'5m'}],west:[],north:[]},{east:[{open:true,calledTile:called}],south:[{open:true,calledTile:tile}],west:[{open:false,calledTile:{id:'closed',face:'5m'}}],north:[]})).toBe(3);
 });
 it('publishes the declaration tile ID to every player and preserves it on recovery',()=>{
  const manager=new RoomManager();const {room,player}=manager.createRoom('立直測試');manager.fillWithBots(room.code,player.id);manager.setReady(room.code,player.id,true);manager.startGame(room.code,player.id);installScenario(manager,room,'riichi');
  const id=manager.getPlayerGameState(room.code,player.id).hand.actions.riichiDiscardIds[0]!;manager.riichiDiscard(room.code,player.id,id);
  for(const p of room.players)expect(manager.getPlayerGameState(room.code,p.id).hand.riichiDeclarationTileIds?.east).toBe(id);
  const recovered=new RoomManager();recovered.restoreRooms(manager.snapshotRooms());expect(recovered.getPlayerGameState(room.code,player.id).hand.riichiDeclarationTileIds?.east).toBe(id);assertPhysical(room);
 });
});
