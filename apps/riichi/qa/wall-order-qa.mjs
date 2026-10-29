import assert from 'node:assert/strict';
import {createServer} from 'vite';
const server=await createServer({server:{middlewareMode:true}});
try{
const {constructPhysicalWall,publicWallSlots,createStandardWall,createDeadWall}=await server.ssrLoadModule('/engine/index.ts');
const wall=createStandardWall();let checked=0;
for(const dealer of ['east','south','west','north'])for(let a=1;a<=6;a++)for(let b=1;b<=6;b++){
 const physical=constructPhysicalWall(wall,dealer,[a,b]);assert.equal(new Set(physical.tileIds).size,136);
 for(let i=0;i<122;i+=2){const top=physical.tileIds.indexOf(wall[i].id),bottom=physical.tileIds.indexOf(wall[i+1].id);assert.equal(top%2,1);assert.equal(bottom,top-1,'take upper then lower from the same stack')}
 const deadWall=createDeadWall(wall.slice(122));
 for(const tile of deadWall.doraIndicators)assert.equal(physical.tileIds.indexOf(tile.id)%2,1,'dora lies on top');
 for(const tile of deadWall.uraIndicators)assert.equal(physical.tileIds.indexOf(tile.id)%2,0,'ura lies below');
 for(let consumed=0;consumed<=122;consumed++){
  const slots=publicWallSlots({physicalWall:physical,liveWall:wall.slice(consumed,122),deadWall});
  for(let i=0;i<slots.length;i+=2)assert(!slots[i+1].occupied||slots[i].occupied,'no upper tile floating over a consumed lower tile');
 }checked++;
}
console.log('WALL ORDER PASSED',checked,'dealer/dice combinations; all 123 draw prefixes');
}finally{await server.close()}
