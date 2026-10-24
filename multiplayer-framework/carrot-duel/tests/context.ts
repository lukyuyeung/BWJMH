/** 測試用：自己組一個 RoundContext，像伺服器那樣（四個座位、新手房 minBet 10）。 */
import type { RoundContext } from '@bunny-gala/contract';

export function ctx(overrides: Partial<RoundContext> = {}): RoundContext {
  return {
    mode: 'casual',
    room: 'beginner',
    seats: [0, 1, 2, 3].map((seat) => ({ seat, bot: seat !== 0, displayName: `p${seat}`, vip: 0 })),
    you: -1,
    pveBanker: null,
    chips: [],
    options: { deck: 'full' },
    handNo: 0,
    limits: { unit: 10, minBet: 10, maxBet: 1000, maxStake: 3000 },
    draw: [5, 17, 33, 2, 48, 11, 0, 29, 40, 7, 21, 36, 14, 3, 50, 26],
    ...overrides,
  };
}
