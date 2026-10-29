import ts from 'typescript';import fs from 'node:fs';
const output=ts.transpileModule(fs.readFileSync('src/table-hands.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
fs.mkdirSync('public/art/character-hands-v1',{recursive:true});fs.writeFileSync('public/art/character-hands-v1/table-hands.js','// Generated from src/table-hands.ts; run npm run build to refresh.\n'+output);
