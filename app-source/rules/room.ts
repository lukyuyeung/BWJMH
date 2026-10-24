import {canDeclareNineTerminals,declareNineTerminals,publicWallSlots,type PublicWallSlot} from '@bunny/riichi-engine';
import { CINEMATIC_ASSETS, cinematicTrigger, type CinematicState } from './presentation.js';
import { chooseBotAction, type BotDifficulty, type BotProfile } from './bot.js';
import { visibleCounts, waitPreview } from './assistance.js';
import { limitPresentation, type PresentationEvent, type PresentationKind } from './presentation.js';
import { randomInt, randomUUID } from 'node:crypto';
import { DEFAULT_RULESET, normalizeRuleset, type Ruleset } from './rules.js';
import {getLegalDiscardIds,createStandardWall} from '@bunny/riichi-engine';
import { createMatchState, advanceMatch, calculateNotenPayments, rankScores, type MatchState } from './match.js';
import { createShuffledWall, dealInitialHands, createHandState, drawTile, discardTile, declareTsumo, declareRon, passRon, getTsumoEvaluation, getRiichiDiscardIds, getPlayerWaits, isFuriten, declareRiichiAndDiscard, getClaimOptions, claimChi, claimPon, claimKan, passClaim, declareAnkan, declareKakan, getAnkanTileIds, getKakanTileIds, getVisibleDora, getBonusDoraForSeat, SEATS, type HandState, type Seat } from '@bunny/riichi-engine';

export interface Player {
  id: string;
  name: string;
  seat: Seat;
  ready: boolean;
  connected: boolean;
  resumeToken: string;
  isBot?: boolean;
  botProfile?:BotProfile;
  botDifficulty?:BotDifficulty;
}

export type RoomPhase = 'lobby' | 'playing';

export interface Room {
  code: string;
  hostPlayerId: string;
  phase: RoomPhase;
  players: Player[];
  game?: HandState;
  scores: Record<Seat, number>;
  pendingRiichi?:{seat:Seat;discardId:string};
  riichiPot: number;
  settled: boolean;
  match: MatchState;
  finalRanking?: Seat[];
  rules: Ruleset;
  revision:number;
  handMatch?:MatchState;
  disconnectedAt?:number;
  actionDeadline?:number;
  events?:PresentationEvent[];
  eventSequence?:number;
  handStartingScores?:Record<Seat,number>;
  awardedPot?:number;
  cinematic?:CinematicState;
}

export interface PublicPlayer {
  id: string;
  name: string;
  seat: Seat;
  ready: boolean;
  connected: boolean;
  isHost: boolean;
  isBot: boolean;
  botProfile?:BotProfile;
  botDifficulty?:BotDifficulty;
}

export interface PublicRoomState {
  code: string;
  phase: RoomPhase;
  players: PublicPlayer[];
  canStart: boolean;
  scores: Record<Seat, number>;
  riichiPot: number;
  match: MatchState;
  finalRanking?: Seat[];
  rules: Ruleset;
}

export interface PlayerGameState {
  room: PublicRoomState;
  you: { playerId: string; seat: Seat; hand: import('@bunny/riichi-engine').Tile[]; drawnTileId?:string|undefined };
  hand: {
    currentSeat: Seat;
    abortiveReason?:import('@bunny/riichi-engine').AbortiveReason;
    phase: HandState['phase'];
    turnNumber: number;
    revision:number;
    match:MatchState;
    discardTileIds:string[];
    wallRemaining: number;
    wallSlots:PublicWallSlot[];
    timeout:{deadline:number|null;serverNow:number};
    events:PresentationEvent[];
    cinematic?:CinematicState;
    assistance:{waits:{face:import("@bunny/riichi-engine").TileFace;remaining:number}[];riichi:Record<string,{face:import("@bunny/riichi-engine").TileFace;remaining:number}[]>};
    settlement?:{awardedPot?:number;scoreChanges:Record<Seat,number>;winningHand?:import("@bunny/riichi-engine").Tile[];tenpai:Seat[];tenpaiHands?:Partial<Record<Seat,import("@bunny/riichi-engine").Tile[]>>};
    doraIndicators: import('@bunny/riichi-engine').Tile[];
    yourDora: { indicatorDora:number; akaDora:number; total:number };
    rinshanRemaining: number;
    discards: Record<Seat, import('@bunny/riichi-engine').Tile[]>;
    concealedCounts: Record<Seat, number>;
    actions: { canAbortiveDraw?:boolean;canDraw:boolean; canDiscard:boolean; canTsumo:boolean; canRon:boolean; canWinClaim:boolean; canPassClaim:boolean; canPon:boolean; canKan:boolean; ankanTileIds:string[]; kakanTileIds:string[]; chiSequences:import('@bunny/riichi-engine').TileFace[][]; riichiDiscardIds:string[] };
    melds: Record<Seat, import('@bunny/riichi-engine').Meld[]>;
    riichi: Record<Seat, boolean>;
    waits: import('@bunny/riichi-engine').TileFace[];
    furiten: boolean;
    claim?: { discarder: Seat; tile: import('@bunny/riichi-engine').Tile };
    result?: HandState['result'];
  };
}

export class RoomError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
  }
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function normalizeRoomCode(code: string): string {
  if(typeof code!=='string')throw new RoomError('INVALID_CODE','Room code must be a string.');
  return code.trim().toUpperCase();
}

export class RoomManager {
  constructor(private readonly randomSource?: (max:number)=>number) {}
  private readonly rooms = new Map<string, Room>();

  snapshotRooms():Room[]{return structuredClone([...this.rooms.values()]);}
  restoreRooms(saved:Room[]):void{
    if(!Array.isArray(saved))throw new Error('Invalid room recovery snapshot');
    const codes=new Set<string>();
    for(const room of saved){
      if(!room||typeof room.code!=='string'||normalizeRoomCode(room.code)!==room.code||codes.has(room.code)||!Array.isArray(room.players)||room.players.length<1||room.players.length>4||!room.players.some(p=>p.id===room.hostPlayerId)||new Set(room.players.map(p=>p.seat)).size!==room.players.length||!Number.isInteger(room.revision)||room.revision<0||!room.rules||!room.match||!['lobby','playing'].includes(room.phase))throw new Error('Invalid recovered room');
      codes.add(room.code);
      for(const player of room.players)if(!SEATS.includes(player.seat)||typeof player.id!=='string'||typeof player.resumeToken!=='string'||!player.resumeToken)throw new Error('Invalid recovered player');
      if(!SEATS.every(seat=>Number.isFinite(room.scores[seat]))||Object.values(room.scores).reduce((a,b)=>a+b,0)+room.riichiPot!==100000)throw new Error('Recovered scores do not conserve points');
      if(room.phase==='playing'){
       const g=room.game;if(!g)throw new Error('Recovered hand is missing');
       const physical=[...Object.values(g.hands).flat(),...Object.values(g.melds).flatMap(ms=>ms.flatMap(m=>m.tiles)),...Object.values(g.discards).flat(),...g.liveWall,...g.deadWall.tiles];
       if(physical.length!==136||new Set(physical.map(t=>t.id)).size!==136)throw new Error('Recovered physical wall is invalid');
       const expected=new Map(createStandardWall(room.rules.akaDora).map(t=>[t.id,t]));if(physical.some(t=>{const e=expected.get(t.id);return !e||e.face!==t.face||e.copy!==t.copy||e.red!==t.red;}))throw new Error('Recovered tile identity is invalid');
      }
    }
    this.rooms.clear();
    for(const original of saved){const room=structuredClone(original);for(const player of room.players)if(!player.isBot)player.connected=false;room.disconnectedAt=Date.now();this.rooms.set(room.code,room);}
  }

  createRoom(name: string): { room: Room; player: Player } {
    const playerName = validateName(name);
    const code = this.generateUniqueCode();
    const player: Player = { id: randomUUID(), name: playerName, seat: 'east', ready: false, connected: true, resumeToken: randomUUID() };
    const room: Room = { code, hostPlayerId: player.id, phase: 'lobby', players: [player], scores:{east:25000,south:25000,west:25000,north:25000}, riichiPot:0, settled:false, match:createMatchState(), rules:{...DEFAULT_RULESET},revision:0 };
    this.rooms.set(code, room);
    return { room, player };
  }

  joinRoom(rawCode: string, name: string): { room: Room; player: Player } {
    const code = normalizeRoomCode(rawCode);
    const room = this.rooms.get(code);
    if (!room) throw new RoomError('ROOM_NOT_FOUND', 'Room not found.');
    if (room.phase !== 'lobby') throw new RoomError('GAME_ALREADY_STARTED', 'This game has already started.');
    if (room.players.length >= 4) throw new RoomError('ROOM_FULL', 'Room is full.');
    const playerName = validateName(name);
    const seat = SEATS.find((candidate) => !room.players.some((p) => p.seat === candidate));
    if (!seat) throw new RoomError('ROOM_FULL', 'Room is full.');
    const player: Player = { id: randomUUID(), name: playerName, seat, ready: false, connected: true, resumeToken: randomUUID() };
    room.players.push(player);
    return { room, player };
  }

  addBot(rawCode:string, playerId:string, name?:string,profile?:BotProfile,difficulty:BotDifficulty='medium'):{room:Room;player:Player}{
    const room=this.requireRoom(rawCode); if(room.phase!=='lobby')throw new RoomError('GAME_ALREADY_STARTED','Bots can only be added in the lobby.');
    if(room.hostPlayerId!==playerId)throw new RoomError('HOST_ONLY','Only the host can add bots.');
    if(room.players.length>=4)throw new RoomError('ROOM_FULL','Room is full.');
    const seat=SEATS.find(s=>!room.players.some(p=>p.seat===s)); if(!seat)throw new RoomError('ROOM_FULL','Room is full.');
    const bot:Player={id:randomUUID(),name:name?.trim()||`Bunny Bot ${room.players.length}`,seat,ready:true,connected:true,resumeToken:randomUUID(),isBot:true,botDifficulty:difficulty,botProfile:profile??(['aggressive','balanced','defensive'] as const)[(room.players.length-1)%3]!}; room.players.push(bot); return{room,player:bot};
  }

  fillWithBots(rawCode:string,playerId:string):Room{let room=this.requireRoom(rawCode);if(room.hostPlayerId!==playerId)throw new RoomError('HOST_ONLY','Only the host can add bots.');if(room.phase!=='lobby')throw new RoomError('GAME_ALREADY_STARTED','Bots can only be added in the lobby.');while(room.players.length<4)room=this.addBot(rawCode,playerId).room;return room;}

  leaveLobby(code:string,playerId:string):Room|null{const room=this.requireRoom(code);if(room.phase!=='lobby')throw new RoomError('GAME_ALREADY_STARTED','Cannot leave a playing room through lobby leave.');const i=room.players.findIndex(p=>p.id===playerId);if(i<0)throw new RoomError('PLAYER_NOT_FOUND','Player not found in room.');room.players.splice(i,1);if(room.players.length===0){this.rooms.delete(room.code);return null;}if(room.players.every(p=>p.isBot)){this.rooms.delete(room.code);return null;}if(room.hostPlayerId===playerId)room.hostPlayerId=(room.players.find(p=>!p.isBot)??room.players[0])!.id;return room;}

  deleteRoom(code:string,playerId:string):void{const room=this.requireRoom(code);if(room.hostPlayerId!==playerId)throw new RoomError('HOST_ONLY','Only the host can close the room.');this.rooms.delete(room.code);}

  setRules(code:string,playerId:string,patch:Partial<Ruleset>):Room{const room=this.requireRoom(code);if(room.phase!=='lobby')throw new RoomError('GAME_ALREADY_STARTED','Rules are locked after start.');if(room.hostPlayerId!==playerId)throw new RoomError('HOST_ONLY','Only the host can change rules.');room.rules=normalizeRuleset({...room.rules,...patch});return room;}

  setReady(code: string, playerId: string, ready: boolean): Room {
    const room = this.requireRoom(code);
    if (room.phase !== 'lobby') throw new RoomError('GAME_ALREADY_STARTED', 'Ready state cannot change after start.');
    const player = this.requirePlayer(room, playerId);
    player.ready = Boolean(ready);
    return room;
  }

  startGame(code: string, playerId: string): Room {
    const room = this.requireRoom(code);
    if (room.phase !== 'lobby') throw new RoomError('GAME_ALREADY_STARTED', 'Game has already started.');
    if (room.hostPlayerId !== playerId) throw new RoomError('HOST_ONLY', 'Only the host can start the game.');
    if (room.players.length !== 4) throw new RoomError('NEED_FOUR_PLAYERS', 'Exactly four players are required.');
    if (!room.players.every((player) => player.ready&&(player.connected||player.isBot))) throw new RoomError('NOT_ALL_READY', 'All four players must be ready.');
    room.match=createMatchState();
    room.game = createHandState(dealInitialHands(createShuffledWall(this.randomSource,room.rules.akaDora),room.match.dealer,[1+(this.randomSource?.(6)??randomInt(6)),1+(this.randomSource?.(6)??randomInt(6))]),room.match.dealer,'E');
    room.game.abortiveEnabled=room.rules.abortiveDraws;room.game.kuikaeEnabled=true;room.game.postRiichiAnkanEnabled=true;room.game.doubleRiichiEnabled=true;room.game.firstTurnYakumanEnabled=true;room.handStartingScores={...room.scores};room.events=[];room.handMatch={...room.match};room.phase = 'playing'; room.settled=false;
    return room;
  }


  abortiveDraw(code:string,playerId:string):Room{const room=this.requirePlayingRoom(code),player=this.requirePlayer(room,playerId);declareNineTerminals(room.game!,player.seat);this.settleIfExhaustive(room);return room;}

  draw(code: string, playerId: string): Room {
    const room = this.requirePlayingRoom(code);
    const player = this.requirePlayer(room, playerId);
    drawTile(room.game!, player.seat); return room;
  }

  riichiDiscard(code: string, playerId: string, tileId: string): Room { const room=this.requirePlayingRoom(code); const player=this.requirePlayer(room,playerId); if((room.scores[player.seat]??0)<1000) throw new RoomError('INSUFFICIENT_POINTS','At least 1,000 points are required to declare Riichi.'); declareRiichiAndDiscard(room.game!,player.seat,tileId); room.scores[player.seat]=room.scores[player.seat]!-1000; room.riichiPot+=1000;if(room.game!.claim&&SEATS.some(s=>room.game!.claim!.options[s].ron))room.pendingRiichi={seat:player.seat,discardId:tileId};this.record(room,'RIICHI',player.seat); this.settleIfExhaustive(room); return room; }

  discard(code: string, playerId: string, tileId: string): Room {
    const room = this.requirePlayingRoom(code);
    const player = this.requirePlayer(room, playerId);
    discardTile(room.game!, player.seat, tileId); this.settleIfExhaustive(room);
    return room;
  }

  tsumo(code: string, playerId: string): Room { const room=this.requirePlayingRoom(code); const player=this.requirePlayer(room,playerId); declareTsumo(room.game!,player.seat); this.settleWin(room); return room; }
  ron(code: string, playerId: string): Room { const room=this.requirePlayingRoom(code); const player=this.requirePlayer(room,playerId); declareRon(room.game!,player.seat); this.settleWin(room); return room; }
  passRon(code:string,playerId:string):Room{return this.passClaim(code,playerId)}
  passClaim(code:string,playerId:string):Room{const room=this.requirePlayingRoom(code);const player=this.requirePlayer(room,playerId);passClaim(room.game!,player.seat);this.settleIfExhaustive(room);return room;}
  chi(code:string,playerId:string,faces:import('@bunny/riichi-engine').TileFace[]):Room{const room=this.requirePlayingRoom(code);const player=this.requirePlayer(room,playerId);claimChi(room.game!,player.seat,faces);delete room.pendingRiichi;this.record(room,'CHI',player.seat);return room;}
  pon(code:string,playerId:string):Room{const room=this.requirePlayingRoom(code);const player=this.requirePlayer(room,playerId);claimPon(room.game!,player.seat);delete room.pendingRiichi;this.record(room,'PON',player.seat);return room;}
  kan(code:string,playerId:string):Room{const room=this.requirePlayingRoom(code);const player=this.requirePlayer(room,playerId);claimKan(room.game!,player.seat);delete room.pendingRiichi;this.record(room,'KAN',player.seat);return room;}
  ankan(code:string,playerId:string,tileId:string):Room{const room=this.requirePlayingRoom(code);const player=this.requirePlayer(room,playerId);declareAnkan(room.game!,player.seat,tileId);this.record(room,'KAN',player.seat);return room;}
  kakan(code:string,playerId:string,tileId:string):Room{const room=this.requirePlayingRoom(code);const player=this.requirePlayer(room,playerId);declareKakan(room.game!,player.seat,tileId);this.record(room,'KAN',player.seat);return room;}

  getPlayerGameState(code: string, playerId: string): PlayerGameState {
    const room = this.requirePlayingRoom(code);
    const player = this.requirePlayer(room, playerId);
    const game = room.game!;
    const claimOptions=getClaimOptions(game,player.seat);
    const own=game.hands[player.seat],counts=visibleCounts(own,game.discards,game.melds,getVisibleDora(game));
    const riichiIds=room.scores[player.seat]>=1000?getRiichiDiscardIds(game,player.seat):[];
    const assistance={waits:own.length%3===1?waitPreview(own,game.melds[player.seat].length,counts,game.melds[player.seat]):[],riichi:Object.fromEntries(riichiIds.map(id=>[id,waitPreview(own.filter(t=>t.id!==id),game.melds[player.seat].length,counts,game.melds[player.seat])]))};
    return {
      room: toPublicRoomState(room),
      you: { playerId: player.id, seat: player.seat, hand: [...game.hands[player.seat]], drawnTileId: game.lastDrawSeat===player.seat&&game.phase==='awaiting_discard'?game.hands[player.seat].at(-1)?.id:undefined },
      hand: {
        ...(game.abortiveReason?{abortiveReason:game.abortiveReason}:{}),currentSeat: game.currentSeat, phase: game.phase, turnNumber: game.turnNumber,revision:room.revision,match:{...(room.handMatch??room.match)},discardTileIds:getLegalDiscardIds(game,player.seat),
        wallRemaining: game.liveWall.length,wallSlots:publicWallSlots(game),
        timeout:{deadline:room.actionDeadline??null,serverNow:Date.now()},
        events:(room.events??[]).map(e=>({...e})),assistance,
        ...(room.cinematic?{cinematic:{...room.cinematic,serverNow:Date.now()}}:{}),
        ...(room.settled?{settlement:{awardedPot:room.awardedPot??0,scoreChanges:Object.fromEntries(SEATS.map(s=>[s,room.scores[s]-(room.handStartingScores?.[s]??25000)])) as Record<Seat,number>,tenpai:game.phase==='exhaustive_draw'?SEATS.filter(s=>getPlayerWaits(game,s).length>0):[],...(game.phase==='exhaustive_draw'?{tenpaiHands:Object.fromEntries(SEATS.filter(s=>getPlayerWaits(game,s).length>0).map(s=>[s,[...game.hands[s]]]))}:{}),...(game.result?{winningHand:game.result.method==='ron'?[...game.hands[game.result.winner],game.result.winningTile]:[...game.hands[game.result.winner]]}:{})}}:{}),
        doraIndicators: getVisibleDora(game),
        yourDora: getBonusDoraForSeat(game, player.seat),
        rinshanRemaining: game.deadWall.rinshan.length,
        discards: {
          east: [...game.discards.east], south: [...game.discards.south],
          west: [...game.discards.west], north: [...game.discards.north],
        },
        concealedCounts: {
          east: game.hands.east.length, south: game.hands.south.length,
          west: game.hands.west.length, north: game.hands.north.length,
        },
        actions: {
          canAbortiveDraw:canDeclareNineTerminals(game,player.seat),
          canDraw: game.currentSeat === player.seat && game.phase === 'awaiting_draw',
          canDiscard: game.currentSeat === player.seat && game.phase === 'awaiting_discard',
          canTsumo: Boolean(getTsumoEvaluation(game, player.seat)?.legal),
          canRon:Boolean(claimOptions?.ron),canWinClaim:Boolean(claimOptions&&game.claim?.options[player.seat]?.ron),
          canPassClaim:Boolean(claimOptions),
          canPon:Boolean(claimOptions?.pon),
          canKan:Boolean(claimOptions?.kan),
          ankanTileIds:getAnkanTileIds(game,player.seat),
          kakanTileIds:getKakanTileIds(game,player.seat),
          chiSequences:claimOptions?.chiSequences??[],
          riichiDiscardIds: room.scores[player.seat]>=1000?getRiichiDiscardIds(game, player.seat):[],
        },
        melds:{east:[...game.melds.east],south:[...game.melds.south],west:[...game.melds.west],north:[...game.melds.north]},
        riichi: { east:game.riichi.east.declared, south:game.riichi.south.declared, west:game.riichi.west.declared, north:game.riichi.north.declared },
        waits: getPlayerWaits(game, player.seat),
        furiten: isFuriten(game, player.seat),
        ...(game.phase === 'awaiting_claim' && game.claim ? {claim:{ discarder: game.claim.discarder, tile: game.claim.tile }} : {}),
        ...(game.result ? {result:game.result} : {}),
      },
    };
  }


  autoAct(code:string,playerId:string):Room{
    const room=this.requirePlayingRoom(code);const player=this.requirePlayer(room,playerId);const g=room.game!;
    const claim=getClaimOptions(g,player.seat);if(claim){passClaim(g,player.seat);this.settleIfExhaustive(room);return room;}
    if(g.currentSeat!==player.seat)return room;
    if(g.phase==='awaiting_draw'){this.draw(code,playerId);return room;}
    if(g.phase==='awaiting_discard'){const tileId=getLegalDiscardIds(g,player.seat).at(-1);if(tileId)discardTile(g,player.seat,tileId);this.settleIfExhaustive(room);return room;}
    return room;
  }

  getBotPlayerIds(code:string):string[]{return this.requireRoom(code).players.filter(p=>p.isBot).map(p=>p.id)}

  actBot(code:string,playerId:string):Room{
    const player=this.requirePlayer(this.requireRoom(code),playerId); if(!player.isBot)throw new RoomError('NOT_BOT','Player is not a bot.');
    const decision=chooseBotAction(this.getPlayerGameState(code,playerId),player.botProfile,player.botDifficulty);if(!decision)return this.requireRoom(code);
    switch(decision.type){
      case 'tsumo':return this.tsumo(code,playerId);case 'ron':return this.ron(code,playerId);case 'pass':return this.passClaim(code,playerId);case 'draw':return this.draw(code,playerId);
      case 'chi':return this.chi(code,playerId,decision.faces);case 'pon':return this.pon(code,playerId);case 'kan':return this.kan(code,playerId);
      case 'riichi':return this.riichiDiscard(code,playerId,decision.tileId);case 'discard':return this.discard(code,playerId,decision.tileId);case 'ankan':return this.ankan(code,playerId,decision.tileId);case 'kakan':return this.kakan(code,playerId,decision.tileId);
    }
  }

  reconnect(rawCode:string, playerId:string, resumeToken:string):{room:Room;player:Player}{ const room=this.requireRoom(rawCode); const player=this.requirePlayer(room,playerId); if(player.resumeToken!==resumeToken) throw new RoomError('INVALID_RESUME_TOKEN','Reconnect token is invalid.'); player.connected=true;delete room.disconnectedAt; return {room,player}; }
  disconnect(rawCode:string,playerId:string):void{ try{const room=this.requireRoom(rawCode);this.requirePlayer(room,playerId).connected=false;if(room.players.every(p=>p.isBot||!p.connected))room.disconnectedAt=Date.now();}catch{} }
  cleanupDisconnectedRooms(ttlMs:number,now=Date.now()):string[]{const deleted:string[]=[];for(const room of this.rooms.values())if(room.disconnectedAt!==undefined&&now-room.disconnectedAt>=ttlMs){this.rooms.delete(room.code);deleted.push(room.code);}return deleted;}
  getResumeToken(code:string,playerId:string):string{return this.requirePlayer(this.requireRoom(code),playerId).resumeToken}
  private settleIfExhaustive(room:Room):void{
    if(room.game?.phase!=='awaiting_claim')delete room.pendingRiichi;
    if(room.settled||!room.game||!['exhaustive_draw','abortive_draw'].includes(room.game.phase))return;if(room.game.phase==='abortive_draw'){room.settled=true;advanceMatch(room.match,true,room.rules.matchLength,true);return;}const tenpai=SEATS.filter(s=>getPlayerWaits(room.game!,s).length>0);const payments=calculateNotenPayments(tenpai);for(const s of SEATS)room.scores[s]=(room.scores[s]??0)+(payments[s]??0);room.settled=true;advanceMatch(room.match,tenpai.includes(room.match.dealer),room.rules.matchLength,true);this.finishOnBankruptcy(room);if(room.match.finished)room.finalRanking=rankScores(room.scores);
  }

  private finishOnBankruptcy(room:Room):void{if(room.rules.bankruptcyEnd&&Object.values(room.scores).some(score=>score<0))room.match.finished=true;}

  private settleWin(room:Room):void{
    if(room.settled||!room.game?.result)return;
    const pending=room.pendingRiichi,result=room.game.result;
    if(pending&&result.method==='ron'&&result.from===pending.seat&&result.winningTile.id===pending.discardId){room.scores[pending.seat]+=1000;room.riichiPot-=1000;const declaration=room.game.riichi[pending.seat];declaration.declared=false;declaration.doubleRiichi=false;declaration.ippatsuEligible=false;delete declaration.declarationTurn;}
    delete room.pendingRiichi;
    const r=room.game.result,p=r.score.payment,w=r.winner; const honba=room.match.honba;const finalDealerWin=w===room.match.dealer&&room.match.handNumber===4&&(room.rules.matchLength==='tonpuusen'||room.match.roundWind==='south');
    if(r.method==='ron'&&r.from&&p.ron){const amount=p.ron+honba*300;room.scores[r.from]=(room.scores[r.from]??0)-amount;room.scores[w]=(room.scores[w]??0)+amount;}
    else if(r.method==='tsumo'){for(const s of SEATS){if(s===w)continue;const base=w===room.match.dealer?p.eachTsumo:(s===room.match.dealer?p.dealerTsumo:p.nonDealerTsumo);if(base){const amount=base+honba*100;room.scores[s]=(room.scores[s]??0)-amount;room.scores[w]=(room.scores[w]??0)+amount;}}}
    this.record(room,r.method==='ron'?'RON':'TSUMO',w);const limit=limitPresentation(r.score);if(limit)this.record(room,limit,w);
    const trigger=cinematicTrigger(r.evaluation);
    if(trigger){const asset=CINEMATIC_ASSETS[trigger],now=Date.now();room.cinematic={id:room.eventSequence??0,trigger,winner:w,character:({east:'yellow',south:'king',west:'ninja',north:'wizard'} as const)[w],startedAt:now,endsAt:now+(asset?.durationMs??1800),phase:'playing',serverNow:now,...(asset?{video:asset.video,...(asset.voice?{voice:asset.voice}:{}),...(asset.sound?{sound:asset.sound}:{}),...(asset.image?{image:asset.image}:{}),...(asset.particles?{particles:true}:{})}:{})};}
    room.awardedPot=room.riichiPot;room.scores[w]=(room.scores[w]??0)+room.riichiPot; room.riichiPot=0; room.settled=true;
    advanceMatch(room.match,w===room.match.dealer,room.rules.matchLength);
    if(room.rules.agariYame&&finalDealerWin&&room.scores[w]>=30000&&rankScores(room.scores)[0]===w)room.match.finished=true;this.finishOnBankruptcy(room);if(room.match.finished) room.finalRanking=rankScores(room.scores);
  }

  settleExhaustiveDrawForTesting(code:string,tenpai:Seat[]):Room{
    const room=this.requirePlayingRoom(code); if(room.settled) return room;
    const payments=calculateNotenPayments(tenpai); for(const s of SEATS) room.scores[s]=(room.scores[s]??0)+(payments[s]??0);
    room.settled=true; advanceMatch(room.match,tenpai.includes(room.match.dealer),room.rules.matchLength,true);
    if(room.match.finished) room.finalRanking=rankScores(room.scores); return room;
  }

  startNextHand(code:string):Room{
    const room=this.requirePlayingRoom(code); if(room.cinematic?.phase==='playing')throw new RoomError('CINEMATIC_ACTIVE','Wait for the synchronized result transition.'); if(!room.settled) throw new RoomError('HAND_NOT_SETTLED','Current hand has not ended.');
    if(room.match.finished) throw new RoomError('MATCH_FINISHED','The hanchan has finished.');
    room.game=createHandState(dealInitialHands(createShuffledWall(this.randomSource,room.rules.akaDora),room.match.dealer,[1+(this.randomSource?.(6)??randomInt(6)),1+(this.randomSource?.(6)??randomInt(6))]),room.match.dealer,room.match.roundWind==='east'?'E':'S');room.game.abortiveEnabled=room.rules.abortiveDraws;room.game.kuikaeEnabled=true;room.game.postRiichiAnkanEnabled=true;room.game.doubleRiichiEnabled=true;room.game.firstTurnYakumanEnabled=true;room.handStartingScores={...room.scores};room.events=[];delete room.cinematic;delete room.pendingRiichi;delete room.awardedPot;room.handMatch={...room.match}; room.settled=false; return room;
  }

  completeCinematic(code:string,now=Date.now()):boolean{const room=this.requireRoom(code);if(!room.cinematic||room.cinematic.phase!=='playing'||now<room.cinematic.endsAt)return false;room.cinematic.phase='results';return true;}

  private record(room:Room,kind:PresentationKind,seat:Seat):void{room.eventSequence=(room.eventSequence??0)+1;room.events=[...(room.events??[]),{id:room.eventSequence,kind,seat}].slice(-24);}

  private requirePlayingRoom(rawCode: string): Room {
    const room = this.requireRoom(rawCode);
    if (room.phase !== 'playing' || !room.game) throw new RoomError('GAME_NOT_STARTED', 'Game has not started.');
    return room;
  }
  getPublicState(code: string): PublicRoomState {
    return toPublicRoomState(this.requireRoom(code));
  }

  getRoomForTesting(code: string): Room | undefined {
    return this.rooms.get(normalizeRoomCode(code));
  }

  private requireRoom(rawCode: string): Room {
    const room = this.rooms.get(normalizeRoomCode(rawCode));
    if (!room) throw new RoomError('ROOM_NOT_FOUND', 'Room not found.');
    return room;
  }

  private requirePlayer(room: Room, playerId: string): Player {
    const player = room.players.find((candidate) => candidate.id === playerId);
    if (!player) throw new RoomError('PLAYER_NOT_FOUND', 'Player not found in room.');
    return player;
  }

  private generateUniqueCode(): string {
    for (let attempt = 0; attempt < 100; attempt++) {
      let code = '';
      for (let i = 0; i < 6; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
      if (!this.rooms.has(code)) return code;
    }
    throw new Error('Unable to allocate a unique room code.');
  }
}

export function toPublicRoomState(room: Room): PublicRoomState {
  return {
    code: room.code,
    phase: room.phase,
    players: room.players.map((player) => ({
      id: player.id,
      name: player.name,
      seat: player.seat,
      ready: player.ready,
      connected: player.connected,
      isHost: player.id === room.hostPlayerId,
      isBot: Boolean(player.isBot),
      ...(player.botProfile?{botProfile:player.botProfile}:{}),
      ...(player.botDifficulty?{botDifficulty:player.botDifficulty}:{}),
    })),
    canStart: room.phase === 'lobby' && room.players.length === 4 && room.players.every((p) => p.ready&&(p.connected||p.isBot)),
    scores:{...room.scores}, riichiPot:room.riichiPot, match:{...room.match}, rules:{...room.rules}, ...(room.finalRanking?{finalRanking:[...room.finalRanking]}:{}),
  };
}

function validateName(name: string): string {
  if(typeof name!=='string')throw new RoomError('INVALID_NAME','Name must be a string.');
  const value = name.trim();
  if (value.length < 1 || value.length > 20) throw new RoomError('INVALID_NAME', 'Name must be 1–20 characters.');
  return value;
}
