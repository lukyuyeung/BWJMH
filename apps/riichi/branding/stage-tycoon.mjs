import{cpSync,rmSync,readFileSync}from'node:fs';
const profile=JSON.parse(readFileSync('dist/tycoon/brand-profile.json','utf8'));if(profile.id!=='tycoon'||profile.realMoney!==false)throw Error('Invalid deploy profile');rmSync('dist/client',{recursive:true,force:true});cpSync('dist/tycoon','dist/client',{recursive:true});console.log('Staged TYCOON-only static deployment at dist/client.');
