import { describe, expect, it } from 'vitest';
import { RoomManager } from '../src/room.js';

describe('RoomManager', () => {
  it('creates a six-character private room with host in East', () => {
    const manager = new RoomManager();
    const { room, player } = manager.createRoom('Bunny');
    expect(room.code).toMatch(/^[A-Z2-9]{6}$/);
    expect(player.seat).toBe('east');
    expect(room.hostPlayerId).toBe(player.id);
  });

  it('fills seats East, South, West, North and rejects a fifth player', () => {
    const manager = new RoomManager();
    const created = manager.createRoom('P1');
    manager.joinRoom(created.room.code, 'P2');
    manager.joinRoom(created.room.code, 'P3');
    manager.joinRoom(created.room.code, 'P4');
    expect(created.room.players.map((p) => p.seat)).toEqual(['east', 'south', 'west', 'north']);
    expect(() => manager.joinRoom(created.room.code, 'P5')).toThrow(/full/i);
  });

  it('requires all four players ready before host can start', () => {
    const manager = new RoomManager();
    const { room, player: host } = manager.createRoom('P1');
    const p2 = manager.joinRoom(room.code, 'P2').player;
    const p3 = manager.joinRoom(room.code, 'P3').player;
    const p4 = manager.joinRoom(room.code, 'P4').player;
    for (const p of [host, p2, p3]) manager.setReady(room.code, p.id, true);
    expect(() => manager.startGame(room.code, host.id)).toThrow(/ready/i);
    manager.setReady(room.code, p4.id, true);
    manager.startGame(room.code, host.id);
    expect(room.phase).toBe('playing');
    expect(room.game?.hands.east).toHaveLength(14);
  });

  it('prevents non-host players from starting', () => {
    const manager = new RoomManager();
    const { room, player: host } = manager.createRoom('P1');
    const p2 = manager.joinRoom(room.code, 'P2').player;
    const p3 = manager.joinRoom(room.code, 'P3').player;
    const p4 = manager.joinRoom(room.code, 'P4').player;
    for (const p of [host, p2, p3, p4]) manager.setReady(room.code, p.id, true);
    expect(() => manager.startGame(room.code, p2.id)).toThrow(/host/i);
  });

  it('never exposes concealed hands or wall through public room state', () => {
    const manager = new RoomManager();
    const { room, player: host } = manager.createRoom('P1');
    const players = [host];
    players.push(manager.joinRoom(room.code, 'P2').player, manager.joinRoom(room.code, 'P3').player, manager.joinRoom(room.code, 'P4').player);
    for (const p of players) manager.setReady(room.code, p.id, true);
    manager.startGame(room.code, host.id);
    const serialized = JSON.stringify(manager.getPublicState(room.code));
    expect(serialized).not.toContain('initialDeal');
    expect(serialized).not.toContain('liveWall');
    expect(serialized).not.toContain('"hands":');
    for(const hand of Object.values(room.game!.hands))for(const tile of hand)expect(serialized).not.toContain(tile.id);
  });
});


describe('game state privacy and turns', () => {
  function startedRoom() {
    const manager = new RoomManager();
    const { room, player: host } = manager.createRoom('P1');
    const players = [host, manager.joinRoom(room.code, 'P2').player, manager.joinRoom(room.code, 'P3').player, manager.joinRoom(room.code, 'P4').player];
    for (const p of players) manager.setReady(room.code, p.id, true);
    manager.startGame(room.code, host.id);
    return { manager, room, players };
  }

  it('serializes only the requesting player concealed hand', () => {
    const { manager, room, players } = startedRoom();
    const east = manager.getPlayerGameState(room.code, players[0]!.id);
    const southSecretId = room.game!.hands.south[0]!.id;
    expect(east.you.hand).toHaveLength(14);
    expect(JSON.stringify(east)).not.toContain(southSecretId);
    expect(east.hand.concealedCounts.south).toBe(13);
    expect(east.hand.wallRemaining).toBe(69);
  });

  it('allows East to discard then only South to draw', () => {
    const { manager, room, players } = startedRoom();
    const eastTile = room.game!.hands.east[0]!.id;
    manager.discard(room.code, players[0]!.id, eastTile);
    if(room.game!.claim)for(const p of players){if(room.game!.claim){const o=room.game!.claim.options[p.seat];if(o.ron||o.pon||o.kan||o.chiSequences.length)manager.passClaim(room.code,p.id);}}
    expect(room.game!.currentSeat).toBe('south');
    expect(() => manager.draw(room.code, players[2]!.id)).toThrow(/south's turn/i);
    manager.draw(room.code, players[1]!.id);
    expect(room.game!.hands.south).toHaveLength(14);
  });
});

describe('v2.5 room hardening',()=>{
  it('host can fill lobby with bots',()=>{const m=new RoomManager();const h=m.createRoom('Host');m.fillWithBots(h.room.code,h.player.id);const r=m.getRoomForTesting(h.room.code)!;expect(r.players).toHaveLength(4);expect(r.players.filter(p=>p.isBot)).toHaveLength(3);expect(r.players.filter(p=>p.isBot).every(p=>p.ready)).toBe(true);});
  it('transfers host when lobby host leaves',()=>{const m=new RoomManager();const h=m.createRoom('Host');const p=m.joinRoom(h.room.code,'Next').player;m.leaveLobby(h.room.code,h.player.id);expect(m.getRoomForTesting(h.room.code)!.hostPlayerId).toBe(p.id);});
  it('locks rules after start',()=>{const m=new RoomManager();const h=m.createRoom('Host');m.setRules(h.room.code,h.player.id,{matchLength:'tonpuusen'});m.fillWithBots(h.room.code,h.player.id);m.setReady(h.room.code,h.player.id,true);m.startGame(h.room.code,h.player.id);expect(()=>m.setRules(h.room.code,h.player.id,{matchLength:'hanchan'})).toThrow();});
  it('private serialization never exposes wall or opponent concealed tiles',()=>{const m=new RoomManager();const h=m.createRoom('Host');m.fillWithBots(h.room.code,h.player.id);m.setReady(h.room.code,h.player.id,true);m.startGame(h.room.code,h.player.id);const state:any=m.getPlayerGameState(h.room.code,h.player.id);const json=JSON.stringify(state);expect(json).not.toContain('liveWall');expect(json).not.toContain('deadWall');for(const s of ['south','west','north'])expect(state.hand[s]).toBeUndefined();expect(state.you.hand.length).toBeGreaterThan(0);});

});

describe('private drawn tile presentation',()=>{
 it('exposes only the local drawn tile, clears it for calls and restores it for Rinshan',()=>{
  const m=new RoomManager();const {room,player}=m.createRoom('Player');m.fillWithBots(room.code,player.id);m.setReady(room.code,player.id,true);m.startGame(room.code,player.id);
  const own=m.getPlayerGameState(room.code,player.id);expect(own.you.drawnTileId).toBe(own.you.hand.at(-1)!.id);
  for(const p of room.players.filter(p=>p.id!==player.id))expect(m.getPlayerGameState(room.code,p.id).you.drawnTileId).toBeUndefined();
  delete room.game!.lastDrawSeat;expect(m.getPlayerGameState(room.code,player.id).you.drawnTileId).toBeUndefined();
  room.game!.lastDrawSeat='east';room.game!.lastDrawSource='rinshan';expect(m.getPlayerGameState(room.code,player.id).you.drawnTileId).toBe(own.you.hand.at(-1)!.id);
  room.game!.phase='won';expect(m.getPlayerGameState(room.code,player.id).you.drawnTileId).toBeUndefined();
 });
});
