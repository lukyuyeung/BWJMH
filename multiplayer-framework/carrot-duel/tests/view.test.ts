import { describe, expect, it } from 'vitest';
import { logic } from '../src/game.js';
import { tableHtml } from '../src/view.js';
import { ctx } from './context.js';

describe('carrot-duel view', () => {
  it('escapes player names (on the platform they are free text)', () => {
    const c = ctx();
    const named = { ...c, you: 0, seats: c.seats.map((s, i) => (i === 1 ? { ...s, bot: false, displayName: '<svg onload=alert(1)>' } : s)) };
    const state = logic.reduce(logic.create(c), { type: 'draw' }, c);
    const html = tableHtml(logic.privateView!(state, 0, c), named, null);
    expect(html).not.toContain('<svg');
    expect(html).toContain('&lt;svg onload=alert(1)&gt;');
  });
});
