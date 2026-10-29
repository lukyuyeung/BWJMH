import { detectAgariFaces } from './agari.js';
import { createStandardWall, type Tile, type TileFace } from './tiles.js';

export const ALL_TILE_FACES: TileFace[] = [...new Set(createStandardWall().map(t => t.face))];

const waitsCache=new Map<string,TileFace[]>();
export function getWaits(tiles: readonly Tile[]): TileFace[] {
  if (tiles.length % 3 !== 1) return [];
  const faces = tiles.map(t => t.face),key=[...faces].sort().join(',');const cached=waitsCache.get(key);if(cached)return [...cached];
  const waits=ALL_TILE_FACES.filter(face => {
    const count = faces.filter(f => f === face).length;
    return count < 4 && detectAgariFaces([...faces, face]).winning;
  });
  if(waitsCache.size>=2048)waitsCache.clear();waitsCache.set(key,waits);return [...waits];
}
export function isTenpai(tiles: readonly Tile[]): boolean { return getWaits(tiles).length > 0; }
