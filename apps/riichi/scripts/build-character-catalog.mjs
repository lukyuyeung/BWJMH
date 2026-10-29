import fs from 'node:fs';import ts from 'typescript';
fs.writeFileSync('public/character-catalog.js','// Generated from rules/characters.ts.\n'+ts.transpileModule(fs.readFileSync('rules/characters.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
