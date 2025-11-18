import { describe, expect, it } from 'vitest';

import { entityManager, type Item, now } from '../../test/config';

describe('getPrimaryKey (always returns array)', function () {
  it('returns multiple keys when timestamp is missing (one per bump)', function () {
    const keys = entityManager.getPrimaryKey('user', {
      userId: 'abc',
    } as Partial<Item> as Item);

    // shardBumps in test config: [0-chars (injected), now+day (1 char), now+2day (2 chars)]
    expect(keys.length).to.equal(3);

    // rangeKey should match uniqueProperty#value
    expect(keys.every((k) => k.rangeKey.startsWith('userId#'))).to.be.true;
  });

  it('returns a single key when timestamp is present', function () {
    const keys = entityManager.getPrimaryKey('user', {
      userId: 'abc',
      created: now, // falls in the zero-timestamp bump
    } as Partial<Item> as Item);

    expect(keys.length).to.equal(1);
  });

  it('flattens keys across an array of items', function () {
    const items = [
      { userId: 'A' },
      { userId: 'B' },
    ] as Partial<Item>[] as Item[];

    const keys = entityManager.getPrimaryKey('user', items);

    // 2 items * 3 bumps each
    expect(keys.length).to.equal(6);
  });

  it('returns existing keys when overwrite=false and keys are present', function () {
    const { hashKey, rangeKey } = entityManager.config;
    const item = {
      [hashKey]: 'user!0',
      [rangeKey]: 'userId#abc',
      userId: 'abc',
    } as unknown as Item;

    const keys = entityManager.getPrimaryKey('user', item, false);
    expect(keys.length).to.equal(1);
    expect(keys[0].hashKey2).to.equal('user!0');
    expect(keys[0].rangeKey).to.equal('userId#abc');
  });

  it('throws when uniqueProperty is missing', function () {
    // uniqueProperty for user is 'userId'
    expect(() => entityManager.getPrimaryKey('user', {} as Item)).to.throw(
      /missing item unique property/i,
    );
  });
});
