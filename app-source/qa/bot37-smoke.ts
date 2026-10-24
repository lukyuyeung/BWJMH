import assert from 'node:assert/strict';
import {RoomManager} from '../rules/room';
import {chooseBotAction,type BotDifficulty} from '../rules/bot';
for(const difficulty of ['low','medium','high'] as BotDifficulty[]){
 const m=new RoomManager(),{room,player}=m.createRoom('QA');
 for(const [name,profile] of [['速攻','aggressive'],['均衡','balanced'],['守備','defensive']] as const)m.addBot(room.code,player.id,name,profile,difficulty);
 m.setReady(room.code,player.id,true);m.startGame(room.code,player.id);
 let decisions=0;
 for(let i=0;i<90&&!room.settled;i++){
  const bot=room.players.find(p=>p.isBot&&chooseBotAction(m.getPlayerGameState(room.code,p.id),p.botProfile,p.botDifficulty));
  if(bot){const s=m.getPlayerGameState(room.code,bot.id),action=chooseBotAction(s,bot.botProfile,bot.botDifficulty);if(action){m.actBot(room.code,bot.id);decisions++;}}else m.autoAct(room.code,player.id);
 }
 assert(decisions>10);const bots=m.getPublicState(room.code).players.filter(p=>p.isBot);assert(bots.every(p=>p.botDifficulty===difficulty));assert.equal(new Set(bots.map(p=>p.botProfile)).size,3);console.log('PASS',difficulty,decisions,'legal bot actions; 3 personalities serialized');
}
