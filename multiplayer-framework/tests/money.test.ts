import { beforeEach, describe, expect, it } from 'vitest';
import * as money from '../platform/src/tables/money.js';
import { playerFromHeaders, resetPlayer } from '../platform/src/players.js';

const opening = (tableId = 't1'): money.HandOpening => ({
  tableId,
  gameId: 'demo',
  mode: 'casual',
  room: 'beginner',
  handNo: 0,
  commit: null,
  draw: null,
});

beforeEach(() => money.resetLedger());

describe('memory ledger', () => {
  it('lock takes only the difference', async () => {
    money.setBalance('u', 1000);
    const hand = await money.openHand(opening());
    expect(await money.lock(hand, 'demo', 'u', 0, 100, 3000)).toEqual({ carrots: 900 });
    expect(await money.lock(hand, 'demo', 'u', 0, 250, 3000)).toEqual({ carrots: 750 });
    expect(money.handRecords()[0].stakes.get('u')?.staked).toBe(250);
  });

  it('lock refuses over the cap and over the balance', async () => {
    money.setBalance('u', 1000);
    const hand = await money.openHand(opening());
    expect(await money.lock(hand, 'demo', 'u', 0, 500, 300)).toMatchObject({ refused: 'LIMIT' });
    expect(await money.lock(hand, 'demo', 'u', 0, 2000, 3000)).toMatchObject({ refused: 'INSUFFICIENT' });
    expect(await money.balance('u')).toBe(1000);
  });

  it('settle pays once and caps the payout', async () => {
    money.setBalance('u', 1000);
    const hand = await money.openHand(opening());
    await money.lock(hand, 'demo', 'u', 0, 100, 3000);
    const paid = await money.settle(hand, 'demo', [{ userId: 'u', payout: 99_999 }], { done: true }, 41);
    expect(paid.get('u')).toBe(900 + 4100);
    expect((await money.settle(hand, 'demo', [{ userId: 'u', payout: 50 }], {})).size).toBe(0);
    expect(await money.balance('u')).toBe(5000);
    expect(money.handRecords()[0]).toMatchObject({ status: 'settled', state: { done: true } });
  });

  it('voidHand refunds once', async () => {
    money.setBalance('u', 1000);
    const hand = await money.openHand(opening());
    await money.lock(hand, 'demo', 'u', 0, 300, 3000);
    expect((await money.voidHand(hand, 'demo')).get('u')).toBe(1000);
    expect((await money.voidHand(hand, 'demo')).size).toBe(0);
    expect(await money.balance('u')).toBe(1000);
  });

  // Production writes each move as a whole-number ledger entry and saves states as JSON: the same mistakes must fail here.
  it.each([2.5, Number.NaN])('lock refuses a stake of %s, as the production ledger does', async (need) => {
    money.setBalance('u', 1000);
    const hand = await money.openHand(opening());
    await expect(money.lock(hand, 'demo', 'u', 0, need, 3000)).rejects.toThrow('LEDGER_ZERO');
    expect(await money.balance('u')).toBe(1000);
  });

  it('saving a state that is not JSON fails, as it does in production', async () => {
    const hand = await money.openHand(opening());
    const loop: Record<string, unknown> = {};
    loop.self = loop;
    await expect(money.saveState(hand, loop)).rejects.toThrow();
    await expect(money.settle(hand, 'demo', [], loop)).rejects.toThrow();
    await expect(money.openHand({ ...opening(), draw: { seed: 1n } })).rejects.toThrow();
  });

  it('refundUnfinishedHands voids every open hand', async () => {
    money.setBalance('u', 1000);
    const hand = await money.openHand(opening());
    await money.lock(hand, 'demo', 'u', 0, 300, 3000);
    expect(await money.refundUnfinishedHands()).toBe(1);
    expect(await money.balance('u')).toBe(1000);
  });
});

describe('practice players', () => {
  it('reads the dev sign-in the game pages send', async () => {
    const alice = playerFromHeaders({ authorization: 'Bearer dev', 'x-dev-did': 'did:privy:dev-alice' });
    expect(alice).toMatchObject({ id: 'p-alice', name: 'alice', displayName: 'alice' });
    expect(await money.balance('p-alice')).toBe(1_000_000);
  });

  it('refuses a missing or malformed sign-in', () => {
    expect(playerFromHeaders({})).toBeNull();
    expect(playerFromHeaders({ authorization: 'Bearer dev', 'x-dev-did': 'did:privy:dev-a b' })).toBeNull();
    expect(playerFromHeaders({ authorization: 'Bearer xyz', 'x-dev-did': 'did:privy:dev-alice' })).toBeNull();
  });

  it('resetPlayer sets the balance', async () => {
    resetPlayer('alice', 50);
    expect(await money.balance('p-alice')).toBe(50);
  });
});
