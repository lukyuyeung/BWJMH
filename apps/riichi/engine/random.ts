import { randomInt } from 'node:crypto';

export type RandomInt = (maxExclusive: number) => number;

/** Cryptographically strong integer source for server-side shuffling. */
export const secureRandomInt: RandomInt = (maxExclusive) => {
  if (!Number.isSafeInteger(maxExclusive) || maxExclusive <= 0) {
    throw new RangeError('maxExclusive must be a positive safe integer');
  }
  return randomInt(maxExclusive);
};
