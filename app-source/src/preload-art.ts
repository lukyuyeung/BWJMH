const retained:HTMLImageElement[]=[];
let loading:Promise<void>|undefined;
/** Decode event art on table entry, rather than on the first claim or win. */
export function preloadEventArt(){return loading??=Promise.all([
 ...['yellow','king','ninja','wizard'].map(role=>role==='yellow'?'/art/hoodie-v3/tiers/mangan.png':'/art/win-cinematic-v4/'+role+'/mangan.png'),
 '/art/library-v1/motion/neutral/win-burst.webp',
 ...['yellow','king','ninja','wizard'].map(n=>n==='yellow'?'/art/hoodie-v3/character.png':'/art/results/'+n+'-presentation.png'),
 ...['chi','pon','kan','riichi','ron','tsumo'].map(n=>'/art/hoodie-v3/cutins/'+n+'.png'),
 ...['01-ribbon','04-fx',...['chi','pon','kan','ron','riichi','tsumo'].map(n=>'03-'+n),...['king','ninja','wizard'].map(n=>n+'-character')].map(n=>'/art/ribbon-v2/'+n+'.png'),
 ...['chi','pon','kan','ron','riichi','tsumo'].map(n=>'/art/ribbon-v2/en/03-'+n+'.svg'),
 '/art/update-26/carrot-riichi.png'
].map(async url=>{const image=new Image();retained.push(image);image.src=url;await image.decode()})).then(()=>{})}
