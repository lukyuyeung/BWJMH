import React from 'react';
export function AssetDigits({value,tone='ivory'}:{value:number;tone?:'ivory'|'gold'|'rose'}){return <span className="asset-digits" aria-label={String(value)}>{String(Math.max(0,value)).split('').map((digit,i)=><img key={i} src={'/art/library-v1/digits/neutral/'+digit+'-'+tone+'.svg'} alt=""/>)}</span>}
