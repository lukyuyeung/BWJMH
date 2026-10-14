/** One physical model for the entire table, including concealed hands and walls. */
export const TABLE_TILE={width:64,height:88,depth:26} as const;
export const TABLE_SIZE=1800;
export const TABLE_VIEW={elevation:23*Math.PI/180,spanHeight:960,centerY:.52} as const;
/** Keep the full table and character heads inside compact landscape screens. */
export function tableSpanHeight(stageHeight:number){return Math.max(TABLE_VIEW.spanHeight,(TABLE_SIZE+270)*stageHeight/1536);}
