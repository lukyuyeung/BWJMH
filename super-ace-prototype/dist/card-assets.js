import {prepareImages} from './asset-cache.js?v=carrot-suspense-v1';
const symbols=['J','Q','K','A','S','H','C','D'];
const paths=symbols.flatMap(s=>['normal','gold'].map(t=>`assets/art/card-${t}-${s}.png`)).concat(['assets/art/carrot-bonus.png','assets/art/wild-angel-fitted.svg','assets/art/wild-devil-fitted.svg','assets/art/card-gold-overlay.png','assets/back.png']);
export function prepareCardAssets(){return prepareImages(paths)}
export function preparePlanAssets(plan){const cards=[...plan.initialBoard,...plan.finalBoard,...plan.steps.flatMap(s=>[...s.board,...(s.next?.board??[])])],urls=new Set(cards.map(c=>c.symbol==='CARROT'?'assets/art/carrot-bonus.png':c.symbol==='ANGEL'?'assets/art/wild-angel-fitted.svg':c.symbol==='DEVIL'?'assets/art/wild-devil-fitted.svg':`assets/art/card-${c.gold?'gold':'normal'}-${c.symbol}.png`));return prepareImages([...urls])}
const repairs=new WeakMap();
async function decodeCard(img){let timer;try{await Promise.race([img.decode(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Card decode timeout')),2500)})])}catch(error){if(!img.complete||!img.naturalWidth)throw error}finally{clearTimeout(timer)}}
export function ensureCardImage(img){
 if(repairs.has(img))return repairs.get(img);delete img.dataset.cardRepairFailed;
 const task=(async()=>{const source=img.dataset.cardSource||img.getAttribute('src');for(let attempt=0;attempt<3;attempt++){try{if(attempt){img.src=source+(attempt>1?(source.includes('?')?'&':'?')+'cardRetry=1':'')}await decodeCard(img);if(!img.naturalWidth)throw new Error('Card image empty');return}catch(error){if(attempt===2)throw error}}})().catch(error=>{img.dataset.cardRepairFailed='true';throw error});repairs.set(img,task);task.finally(()=>{if(repairs.get(img)===task)repairs.delete(img)}).catch(()=>{});return task;
}
export function ensureBoardImages(root=document.querySelector('#board')){return Promise.all([...root.querySelectorAll('.art-card,.gold-frame-art')].map(ensureCardImage))}
