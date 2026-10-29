export const randomUUID=()=>crypto.randomUUID();
export function randomInt(max:number){if(!Number.isSafeInteger(max)||max<=0)throw new RangeError("Invalid random bound");const limit=Math.floor(4294967296/max)*max;const data=new Uint32Array(1);do{crypto.getRandomValues(data);}while(data[0]>=limit);return data[0]%max;}
