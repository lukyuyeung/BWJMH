import {createGameServer} from '../server/src/index.js';
import {installScenario,SCENARIOS,type Scenario} from '../server/qa/scenarios.js';
import {createServer} from 'vite';
if(process.env.NODE_ENV==='production')throw Error('Developer QA launcher is disabled in production.');
const service=createGameServer();await new Promise<void>(r=>service.httpServer.listen(3001,'127.0.0.1',r));
service.io.on('connection',socket=>socket.on('qa:scenario',(payload:any,ack:any)=>{if(typeof ack!=='function')return;try{const room=service.rooms.getRoomForTesting(socket.data.roomCode??'');if(!room||room.hostPlayerId!==socket.data.playerId||room.phase!=='playing')throw Error('Start your own local QA room first.');if(!SCENARIOS.includes(payload?.name))throw Error('Unknown scenario.');installScenario(service.rooms,room,payload.name as Scenario);service.broadcastPrivateGameStates(room.code);ack({ok:true});}catch(error){ack({ok:false,error:{message:String(error)}});}}));
const vite=await createServer({root:'client',server:{host:'127.0.0.1',port:5173,strictPort:true},define:{'import.meta.env.VITE_QA_SCENARIOS':'true'}});await vite.listen();console.log('Developer QA only: http://127.0.0.1:5173; create → fill bots → ready → start → QA scenario.');
async function close(){await vite.close();await service.close();process.exit(0);}process.on('SIGINT',()=>void close());process.on('SIGTERM',()=>void close());
