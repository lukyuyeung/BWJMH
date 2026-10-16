/** One physical model for every hand, river, meld and wall tile. */
export const TABLE_TILE={width:100,height:136,depth:64} as const;
export const TABLE_SIZE=2500;
/** A real camera: elevation is measured from the horizontal felt plane. */
export const TABLE_VIEW={elevation:Math.PI/3,distance:4500,verticalFov:35,artAspect:1850/850} as const;
export const TABLE_LAYOUT={wallRadius:990,handRadius:1180,riverInner:340} as const;
