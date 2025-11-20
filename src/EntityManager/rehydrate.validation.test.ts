import { describe, expect, it } from 'vitest';

import { day, entityManager, now } from '../../test/config';
import { rehydrateIndexItem } from './rehydrateIndexItem';
import { rehydratePageKeyMap } from './rehydratePageKeyMap';

describe('rehydration validations', function () {
  it('rehydratePageKeyMap throws on empty indexTokens', function () {
    expect(() =>
      rehydratePageKeyMap(entityManager, 'user', [], {}, undefined),
    ).toThrow(/indexTokens empty/i);
  });

  it('rehydratePageKeyMap throws on inconsistent hashKeys across indexes', function () {
    // 'firstName' uses global hashKey; 'userCreated' uses 'userPK'
    expect(() =>
      rehydratePageKeyMap(
        entityManager,
        'user',
        ['firstName', 'userCreated'],
        {},
        undefined,
      ),
    ).toThrow(/inconsistent hashKeys/i);
  });

  it('rehydratePageKeyMap throws on dehydrated length mismatch', function () {
    // With a single-index and tight time window, we expect exactly 1 entry.
    expect(() =>
      rehydratePageKeyMap(
        entityManager,
        'user',
        ['firstName'],
        {},
        ['too', 'many'],
        now + day,
        now + day,
      ),
    ).toThrow(/dehydrated length mismatch/i);
  });

  it('rehydrateIndexItem throws on key-value mismatch count', function () {
    // 'firstName' unwrapped elements are 4; providing 3 should fail.
    expect(() =>
      rehydrateIndexItem(entityManager, 'user', 'firstName', 'a|b'),
    ).toThrow(/index rehydration key-value mismatch/i);
  });
});
