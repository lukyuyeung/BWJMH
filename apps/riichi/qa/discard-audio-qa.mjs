import fs from 'node:fs';import ts from 'typescript';import assert from 'node:assert/strict';
const source=fs.readFileSync('src/discard-audio.ts','utf8');const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;const {createDiscardSoundTracker}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const tracker=createDiscardSoundTracker();
for(const seat of ['east','south','west','north']){
 assert.equal(tracker.take('hand1',seat,seat+'normal',seat+'declaration'),'tile_discard');
 assert.equal(tracker.take('hand1',seat,seat+'declaration',seat+'declaration'),'tile_riichi_place');
 assert.equal(tracker.take('hand1',seat,seat+'declaration',seat+'declaration'),null,'No duplicate contact/fallback sound');
 for(let i=0;i<10;i++)assert.equal(tracker.take('hand1',seat,seat+'later'+i,seat+'declaration'),'tile_discard','Later discards remain ordinary');
 assert.equal(tracker.take('hand1',seat,seat+'bad-refresh',seat+'bad-refresh'),'tile_discard','Even a stale remapped declaration cannot repeat special cue');
}
assert.equal(tracker.take('hand2','east','eastdeclaration','eastdeclaration'),'tile_riichi_place','New hand resets declaration cue');
console.log('PASS four players: declaration only once, 40 later ordinary discards, duplicate suppression, stale refresh, new hand reset');
