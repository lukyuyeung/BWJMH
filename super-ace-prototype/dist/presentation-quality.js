/** Visual-only budgets. No random draws or game-state input influence results. */
export function createPresentationQuality({cores=globalThis.navigator?.hardwareConcurrency??8,memory=globalThis.navigator?.deviceMemory??8,onChange=()=>{}}={}){
 let level=cores<=4||memory<=4?'medium':'high',samples=[],badWindows=0;const listeners=new Set();
 const publish=()=>{onChange(level);listeners.forEach(fn=>fn(level))};publish();
 return{get level(){return level},budget(mega=false){return(level==='low'?[30,48]:level==='medium'?[64,96]:[110,180])[Number(mega)]},sample(ms){if(!Number.isFinite(ms)||ms<=0||ms>250)return;samples.push(ms);if(samples.length<45)return;const mean=samples.reduce((a,b)=>a+b,0)/samples.length,slow=samples.filter(x=>x>28).length/samples.length;samples=[];badWindows=mean>25||slow>.3?badWindows+1:0;if(badWindows>=2&&level!=='low'){level=level==='high'?'medium':'low';badWindows=0;publish()}},subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)}};
}
