import type {RoomManager,PlayerGameState} from './room';
/** Transport calls this only with an authenticated player id, or null for a spectator. */
export function privateTableView(manager:RoomManager,code:string,playerId:string|null){
 const room=manager.getPublicState(code);
 if(playerId!==null)return structuredClone(manager.getPlayerGameState(code,playerId));
 const sample=manager.getPlayerGameState(code,room.players[0]!.id),{claimResponse:_ownResponse,...hand}=sample.hand;
 return structuredClone({room,you:null,hand:{...hand,assistance:{waits:[],riichi:{}},actions:{canAbortiveDraw:false,canDraw:false,canDiscard:false,canTsumo:false,canRon:false,canWinClaim:false,canPassClaim:false,canPon:false,canKan:false,ankanTileIds:[],kakanTileIds:[],chiSequences:[],riichiDiscardIds:[]},discardTileIds:[],waits:[],furiten:false,yourDora:{indicatorDora:0,akaDora:0,total:0}}});
}
