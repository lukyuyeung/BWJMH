import {warmImage,warmImagesInOrder} from './art-loading';
let loading:Promise<void>|undefined;
/** Eyes/labels first; optional full scenes must never compete with first-frame character art. */
export function preloadEventArt(){return loading??=(async()=>{
 await Promise.all(['/art/hoodie-v3/character.png','/art/hoodie-v3/avatar.jpg','/art/ribbon-v2/01-ribbon.png','/art/ribbon-v2/04-fx.png',...['chi','pon','kan','ron','riichi','tsumo'].map(n=>'/art/ribbon-v2/03-'+n+'.png')].map(url=>warmImage(url,'high')));
 await warmImagesInOrder([...['chi','pon','kan','riichi','ron','tsumo'].map(n=>'/art/hoodie-v3/cutins/'+n+'.png'),...Array.from({length:9},(_,i)=>'/art/hoodie-v3/emotes/'+i+'.png'),...['king','ninja','wizard'].map(n=>'/art/ribbon-v2/'+n+'-character.png'),...['yellow','king','ninja','wizard'].map(role=>role==='yellow'?'/art/hoodie-v3/tiers/mangan.png':'/art/win-cinematic-v4/'+role+'/mangan.png')]);
})()}
