import stringHash from 'string-hash';
import { describe, expect, it } from 'vitest';

import { day, entityManager, type Item, now } from '../../test/config';
import { getUsers } from '../../test/users';
import { updateItemHashKey } from './updateItemHashKey';

describe('updateItemHashKey', function () {
  it('should add unsharded entity item hash key', function () {
    let [item] = getUsers() as Partial<Item>[];
    item.created = now;

    item = updateItemHashKey(entityManager, 'user', item);

    expect(item.hashKey2).to.equal('user!');
  });

  it('should add sharded entity item hash key', function () {
    let [item] = getUsers() as Partial<Item>[];
    item.created = now + day;

    item = updateItemHashKey(entityManager, 'user', item);

    expect(item.hashKey2?.length).to.equal(6);
  });

  it('should not overwrite sharded entity item hash key', function () {
    const [item] = getUsers() as Item[];
    item.created = now + day * 2;
    item.hashKey2 = 'user!q';

    updateItemHashKey(entityManager, 'user', item);

    expect(item.hashKey2).to.equal('user!q');
  });

  it('should overwrite sharded entity item hash key', function () {
    let [item] = getUsers() as Partial<Item>[];
    item.created = now + day * 2;
    item.hashKey2 = 'user!q';

    item = updateItemHashKey(entityManager, 'user', item, true);

    expect(item.hashKey2?.length).to.equal(7);
  });

  it('should use full shard space for multi-character shard keys', function () {
    // Target a shard bump with chars=2, charBits=2
    // (configured at now + day * 2 in test/config.ts).
    const radix = 2 ** 2; // 4
    const chars = 2;
    const space = radix ** chars; // 16 combinations (00..33 in base 4)

    // Find a userId whose hash mod space lands in the upper half (>= 8),
    // which would be unreachable if the modulus mistakenly used (chars * radix).
    let chosenId: string | undefined;
    let expectedSuffix = '';

    for (let i = 0; i < 2000; i++) {
      const candidate = `user-${String(i)}`;
      const mod = stringHash(candidate) % space;
      if (mod >= 8) {
        chosenId = candidate;
        expectedSuffix = mod.toString(radix).padStart(chars, '0');
        break;
      }
    }

    expect(chosenId, 'failed to find a suitable candidate userId').to.be.ok;

    const [item] = getUsers() as Partial<Item>[];
    item.userId = chosenId!;
    item.created = now + day * 2; // pick the bump with chars=2

    const updated = updateItemHashKey(entityManager, 'user', item);
    expect(updated.hashKey2?.endsWith(expectedSuffix)).to.be.true;
  });
});
