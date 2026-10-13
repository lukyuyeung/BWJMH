import {it,expect} from 'vitest';
import {sceneFrame} from '../../client/src/viewport.js';
it.each([[844,390],[667,375],[915,412],[932,430]])('full-width landscape framing %s×%s preserves art scale and fits the felt frame',(w,h)=>{
 const f=sceneFrame(w,h,true);
 expect(1536*f.scale).toBeCloseTo(w);expect(f.visibleHeight*f.scale).toBeCloseTo(h);
 expect(f.tableScale).toBe(1);expect(f.tableOffset).toBe(0);
});
it('desktop keeps the existing calibrated plane',()=>expect(sceneFrame(1536,1024,false)).toEqual({scale:1,visibleHeight:1024,tableScale:1,tableOffset:0}));
