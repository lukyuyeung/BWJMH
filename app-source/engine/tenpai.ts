import { detectAgariFaces } from './agari.js';
import { createStandardWall, type Tile, type TileFace } from './tiles.js';

export const ALL_TILE_FACES: TileFace[] = [...new Set(createStandardWall().map(t => t.face))];

export function getWaits(tiles: readonly Tile[]): TileFace[] {
  if (tiles.length % 3 !== 1) return [];
  const faces = tiles.map(t => t.face);
  return ALL_TILE_FACES.filter(face => {
    const count = faces.filter(f => f === face).length;
    return count < 4 && detectAgariFaces([...faces, face]).winning;
  });
}
export function isTenpai(tiles: readonly Tile[]): boolean { return getWaits(tiles).length > 0; }
