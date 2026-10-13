import type { Tile, TileFace } from './tiles.js';

export type AgariShape = 'standard' | 'chiitoitsu' | 'kokushi';

const FACES: TileFace[] = [
  '1m','2m','3m','4m','5m','6m','7m','8m','9m',
  '1p','2p','3p','4p','5p','6p','7p','8p','9p',
  '1s','2s','3s','4s','5s','6s','7s','8s','9s',
  'E','S','W','N','P','F','C',
];
const INDEX = new Map<TileFace, number>(FACES.map((face, i) => [face, i]));
const KOKUSHI = new Set([0,8,9,17,18,26,27,28,29,30,31,32,33]);

export interface AgariResult { winning: boolean; shape?: AgariShape }

export function detectAgari(tiles: readonly Tile[]): AgariResult {
  return detectAgariFaces(tiles.map(t => t.face));
}

export function detectAgariFaces(faces: readonly TileFace[]): AgariResult {
  if (faces.length !== 14) return { winning: false };
  const counts = toCounts(faces);
  if (!counts) return { winning: false };
  if (isKokushi(counts)) return { winning: true, shape: 'kokushi' };
  if (isChiitoitsu(counts)) return { winning: true, shape: 'chiitoitsu' };
  if (isStandard(counts)) return { winning: true, shape: 'standard' };
  return { winning: false };
}

export function canWinWithTile(hand: readonly Tile[], winningTile: Tile): AgariResult {
  return detectAgari([...hand, winningTile]);
}

function toCounts(faces: readonly TileFace[]): number[] | null {
  const counts = Array(34).fill(0) as number[];
  for (const face of faces) {
    const i = INDEX.get(face);
    if (i === undefined) return null;
    counts[i] = counts[i]! + 1;
    if (counts[i] > 4) return null;
  }
  return counts;
}

function isChiitoitsu(c: readonly number[]): boolean {
  return c.filter(n => n === 2).length === 7 && c.every(n => n === 0 || n === 2);
}

function isKokushi(c: readonly number[]): boolean {
  let pair = false;
  for (let i = 0; i < c.length; i++) {
    if (KOKUSHI.has(i)) {
      if (c[i] === 0) return false;
      if (c[i]! >= 2) pair = true;
    } else if (c[i] !== 0) return false;
  }
  return pair;
}

function isStandard(c: readonly number[]): boolean {
  for (let pair = 0; pair < 34; pair++) {
    if (c[pair]! < 2) continue;
    const work = [...c];
    work[pair] = work[pair]! - 2;
    if (removeMelds(work)) return true;
  }
  return false;
}

function removeMelds(c: number[]): boolean {
  const i = c.findIndex(n => n > 0);
  if (i < 0) return true;
  if (c[i]! >= 3) {
    c[i] = c[i]! - 3;
    if (removeMelds(c)) return true;
    c[i] = c[i]! + 3;
  }
  if (i < 27 && i % 9 <= 6 && c[i + 1]! > 0 && c[i + 2]! > 0) {
    c[i] = c[i]! - 1; c[i + 1] = c[i + 1]! - 1; c[i + 2] = c[i + 2]! - 1;
    if (removeMelds(c)) return true;
    c[i] = c[i]! + 1; c[i + 1] = c[i + 1]! + 1; c[i + 2] = c[i + 2]! + 1;
  }
  return false;
}
