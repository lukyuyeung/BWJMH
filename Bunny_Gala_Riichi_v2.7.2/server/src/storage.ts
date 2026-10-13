import {createHash} from 'node:crypto';
import {existsSync,readFileSync,mkdirSync,openSync,writeFileSync,fsyncSync,closeSync,renameSync,chmodSync} from 'node:fs';
import {dirname,resolve,relative,isAbsolute,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import type {RoomManager} from './room.js';
/** Server-private, single-process recovery checkpoint. Never served over HTTP. */
export class RoomStore{
 readonly path:string;
 constructor(path:string){this.path=resolve(path);const rel=relative(fileURLToPath(new URL('../../client/',import.meta.url)),this.path);if(rel===''||rel!=='..'&&!rel.startsWith('..'+sep)&&!isAbsolute(rel))throw Error('Room recovery storage must be outside the client/static tree.');}
 load(manager:RoomManager):void{
  if(!existsSync(this.path))return;
  const x=JSON.parse(readFileSync(this.path,'utf8'));
  if(x.version!==1||typeof x.payload!=='string'||createHash('sha256').update(x.payload).digest('hex')!==x.sha256)throw Error('Room recovery file is invalid; refusing to overwrite it.');
  manager.restoreRooms(JSON.parse(x.payload));
 }
 save(manager:RoomManager):void{
  const payload=JSON.stringify(manager.snapshotRooms());const bytes=JSON.stringify({version:1,sha256:createHash('sha256').update(payload).digest('hex'),payload});
  mkdirSync(dirname(this.path),{recursive:true,mode:0o700});const temporary=this.path+'.tmp';let fd:number|undefined;
  try{fd=openSync(temporary,'w',0o600);writeFileSync(fd,bytes);fsyncSync(fd);}finally{if(fd!==undefined)closeSync(fd);}
  renameSync(temporary,this.path);chmodSync(this.path,0o600);
 }
}
