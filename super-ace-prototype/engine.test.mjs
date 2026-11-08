import {readFile} from 'node:fs/promises';
import test from 'node:test';
import assert from 'node:assert/strict';
const source=await readFile(new URL('./dist/engine.js',import.meta.url),'utf8');
const {evaluate,createEngine,createRng,freeSpinAward,allowedBets,maxBet}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const board=symbol=>Array.from({length:20},()=>({symbol,gold:false}));
test('five reel ways use count product and longest run only',()=>{
 const result=evaluate(board('A'),2,3);
 assert.equal(result.wins.length,1);assert.equal(result.wins[0].ways,1024);assert.equal(result.total,15360);
});
test('ways need consecutive leftmost reels; wild matches normal but never carrot',()=>{
 const b=board('CARROT');b[0]={symbol:'A'};b[6]={symbol:'ANGEL',gold:true};b[12]={symbol:'A'};
 assert.equal(evaluate(b,10).total,5);b[6]={symbol:'CARROT'};assert.equal(evaluate(b,10).total,0);
});
test('deterministic dealing and gold placement; random wilds never occur',()=>{
 const a=createEngine({rng:createRng('bunny')}),b=createEngine({rng:createRng('bunny')});
 for(let n=0;n<100;n++) {const cards=a.deal();assert.deepEqual(cards,b.deal());cards.forEach((c,i)=>{assert.ok(!['ANGEL','DEVIL'].includes(c.symbol));if(c.gold)assert.ok(i%5>=1&&i%5<=3);});}
});
test('gold winners convert, other winners refill from top, other cards stay fixed',()=>{
 const b=board('CARROT');b[0]={symbol:'A',gold:false};b[1]={symbol:'A',gold:true};b[2]={symbol:'A',gold:false};
 const before=structuredClone(b),r=createEngine({rng:()=>.9,carrotChance:0,goldChance:0,devilChance:0}).resolveStep(b,10);
 assert.deepEqual(b,before);assert.deepEqual(r.convertedPositions,[1]);assert.equal(r.board[1].symbol,'ANGEL');assert.deepEqual(r.replacements.map(c=>c.index),[0,2]);assert.ok(r.replacements.every(c=>c.fromRow===-1));
 for(let i=3;i<20;i++)assert.deepEqual(r.board[i],b[i]);
});
test('new devil spreads at most four copies, preserves source, avoids first reel and special symbols',()=>{
 const b=board('K');[5,10,15].forEach(i=>b[i]={symbol:'CARROT'});b[0]={symbol:'A'};b[1]={symbol:'A',gold:true};b[2]={symbol:'A'};b[3]={symbol:'CARROT'};b[4]={symbol:'ANGEL',gold:true};
 const r=createEngine({rng:()=>.01,carrotChance:0,goldChance:0,devilChance:1}).resolveStep(b,1);
 assert.equal(r.board[1].symbol,'DEVIL');assert.ok(r.copies.length>=1&&r.copies.length<=4);
 assert.ok(r.copies.every(c=>c.index%5!==0&&c.index!==3&&c.index!==4));assert.equal(r.board[3].symbol,'CARROT');
});
test('free award and 10 percent balance ceiling',()=>{
 const b=board('J');[0,3,9].forEach(i=>b[i]={symbol:'CARROT'});
 assert.equal(freeSpinAward(b),10);assert.equal(freeSpinAward(b,true),5);
 assert.equal(maxBet(123.45),12.2);assert.deepEqual(allowedBets(123.45),[1,2,5,10]);assert.deepEqual(allowedBets(9),[]);
});
test('invalid board and invalid random values fail clearly',()=>{
 assert.throws(()=>evaluate([],1),TypeError);assert.throws(()=>createEngine({rng:()=>1}).deal(),RangeError);
});
test('released model uses fixed reel-specific weights and configured special-symbol rates',()=>{
 const engine=createEngine({rng:createRng(39291)}),fav=['S','H','C','D','J'],normal=Array(5).fill(0),preferred=Array(5).fill(0);let carrots=0,gold=0,eligible=0;
 for(let n=0;n<10000;n++)for(const[c,i]of engine.deal().map((c,i)=>[c,i])){const col=i%5;if(c.symbol==='CARROT'){carrots++;continue}normal[col]++;if(c.symbol===fav[col])preferred[col]++;if(col>=1&&col<=3){eligible++;if(c.gold)gold++}}
 for(let col=0;col<5;col++)assert(Math.abs(preferred[col]/normal[col]-.32625)<.015);assert(Math.abs(carrots/200000-.02)<.002);assert(Math.abs(gold/eligible-.03)<.003);
});
test('supported minimum stake preserves winning positions and payout scaling',()=>{
 const small=createEngine({rng:createRng(8231)}),large=createEngine({rng:createRng(8231)});
 for(let n=0;n<300;n++){let a=small.deal(),b=large.deal();assert.deepEqual(a,b);for(let step=0;step<100;step++){const m=[1,2,3,5][Math.min(step,3)],x=small.evaluate(a,.2,m),y=large.evaluate(b,20,m);assert.deepEqual(x.positions,y.positions);assert(Math.abs(x.total*100-y.total)<1e-6);if(!x.total)break;a=small.resolveStep(a,.2,m).board;b=large.resolveStep(b,20,m).board;assert.deepEqual(a,b)}}
});
