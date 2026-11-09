const symbols=['J','Q','K','A','S','H','C','D'],cache=new Map();
const paths=symbols.flatMap(s=>['normal','gold'].map(t=>`assets/art/card-${t}-${s}.png`)).concat(['assets/art/carrot-bonus.png','assets/art/wild-angel-fitted.svg','assets/art/wild-devil-fitted.svg','assets/art/card-gold-overlay.png','assets/back.png']);
function load(src){if(cache.has(src))return cache.get(src);const task=(async()=>{const img=new Image();img.src=src;await img.decode();return src})().catch(e=>{cache.delete(src);throw e});cache.set(src,task);return task}
export function prepareCardAssets(){return Promise.all(paths.map(load))}
export function preparePlanAssets(plan){const cards=[...plan.initialBoard,...plan.finalBoard,...plan.steps.flatMap(s=>[...s.board,...(s.next?.board??[])])],urls=new Set(cards.map(c=>c.symbol==='CARROT'?'assets/art/carrot-bonus.png':c.symbol==='ANGEL'?'assets/art/wild-angel-fitted.svg':c.symbol==='DEVIL'?'assets/art/wild-devil-fitted.svg':`assets/art/card-${c.gold?'gold':'normal'}-${c.symbol}.png`));return Promise.all([...urls].map(load))}
prepareCardAssets().catch(()=>{});
