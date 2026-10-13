export type Suit = 'm' | 'p' | 's';
export type Honor = 'E' | 'S' | 'W' | 'N' | 'P' | 'F' | 'C';
export type TileFace = `${1|2|3|4|5|6|7|8|9}${Suit}` | Honor;

export interface Tile {
  /** Unique physical tile identifier, stable within a generated wall. */
  id: string;
  face: TileFace;
  copy: 0 | 1 | 2 | 3;
  /** Reserved for aka-dora support. False in v0.1. */
  red: boolean;
}

const SUITS: Suit[] = ['m', 'p', 's'];
const HONORS: Honor[] = ['E', 'S', 'W', 'N', 'P', 'F', 'C'];

export function createStandardWall(akaDora = true): Tile[] {
  const faces: TileFace[] = [];
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 9; rank++) faces.push(`${rank}${suit}` as TileFace);
  }
  faces.push(...HONORS);

  return faces.flatMap((face) =>
    ([0, 1, 2, 3] as const).map((copy) => ({
      id: `${face}-${copy}`,
      face,
      copy,
      red: akaDora && (face === '5m' || face === '5p' || face === '5s') ? copy === 0 : false,
    })),
  );
}
