import { describe, expect, it } from 'vitest';

import { entityManager, type MyConfigMap } from '../../test/config';
import { query } from './query';
import type { ShardQueryFunction } from './ShardQueryFunction';

describe('query input validation', function () {
  const sqf: ShardQueryFunction<MyConfigMap, 'user', 'firstName'> = (
    _hashKey,
    pageKey,
    _pageSize,
  ) => {
    // Silence unused-parameter lint for this validation-only SQF.
    void _hashKey;
    void _pageSize;
    return Promise.resolve({ count: 0, items: [], pageKey });
  };

  it('throws on invalid limit', async function () {
    await expect(
      query(entityManager, {
        entityToken: 'user',
        item: {},
        shardQueryMap: { firstName: sqf },
        // invalid: must be positive integer or Infinity
        limit: 0,
      }),
    ).rejects.toThrow(/limit must be a positive integer or Infinity/i);
  });

  it('throws on invalid pageSize', async function () {
    await expect(
      query(entityManager, {
        entityToken: 'user',
        item: {},
        shardQueryMap: { firstName: sqf },
        // invalid: must be positive integer
        pageSize: 0,
      }),
    ).rejects.toThrow(/pageSize must be a positive integer/i);
  });
});
