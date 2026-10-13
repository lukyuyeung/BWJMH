import {it,expect} from 'vitest';
import {runSimulations} from '../scripts/simulate.js';
it.each(['safe','bot','calls'] as const)('deterministic matches preserve all invariants with %s policy',policy=>{const r=runSimulations(10,1,policy);expect(r.matches).toBe(10);expect(r.hands).toBeGreaterThanOrEqual(40)},30000);
