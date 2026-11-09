import {prepareImages} from './asset-cache.js?v=quiet-mix-v1';
const symbols=['J','Q','K','A','S','H','C','D'];
const paths=symbols.flatMap(s=>['normal','gold'].map(t=>`assets/art/card-${t}-${s}.png`)).concat(['assets/art/carrot-bonus.png','assets/art/wild-angel-fitted.svg','assets/art/wild-devil-fitted.svg','assets/art/card-gold-overlay.png','assets/back.png']);
export function prepareCardAssets(){return prepareImages(paths)}
export function preparePlanAssets(plan){const cards=[...plan.initialBoard,...plan.finalBoard,...plan.steps.flatMap(s=>[...s.board,...(s.next?.board??[])])],urls=new Set(cards.map(c=>c.symbol==='CARROT'?'assets/art/carrot-bonus.png':c.symbol==='ANGEL'?'assets/art/wild-angel-fitted.svg':c.symbol==='DEVIL'?'assets/art/wild-devil-fitted.svg':`assets/art/card-${c.gold?'gold':'normal'}-${c.symbol}.png`));return prepareImages([...urls])}
