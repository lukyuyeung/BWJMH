import type { RandomInt } from './random.js';
import { secureRandomInt } from './random.js';
import { createStandardWall, type Tile } from './tiles.js';

/** Fisher-Yates shuffle. Returns a new array and never mutates the input. */
export function shuffleTiles<T>(tiles: readonly T[], randomInt: RandomInt = secureRandomInt): T[] {
  const result = [...tiles];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    if (!Number.isInteger(j) || j < 0 || j > i) throw new RangeError('randomInt returned an invalid index');
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

export function createShuffledWall(randomInt: RandomInt = secureRandomInt, akaDora = true): Tile[] {
  return shuffleTiles(createStandardWall(akaDora), randomInt);
}
