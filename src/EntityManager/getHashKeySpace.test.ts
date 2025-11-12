import { describe, expect, it } from 'vitest';

import { day, entityManager, now } from '../../test/config';
import { getHashKeySpace } from './getHashKeySpace';

describe('getHashKeySpace', function () {
  it('should get lowest hash key space', function () {
    const hashKeySpace = getHashKeySpace(
      entityManager,
      'user',
      'hashKey2',
      {},
      now,
      now,
    );

    expect(hashKeySpace).to.deep.equal(['user!']);
  });

  it('should get full hash key space', function () {
    const hashKeySpace = getHashKeySpace(
      entityManager,
      'user',
      'hashKey2',
      {},
      now,
      Infinity,
    );

    expect(hashKeySpace.length).to.equal(21);
  });

  it('should get middle hash key space', function () {
    const hashKeySpace = getHashKeySpace(
      entityManager,
      'user',
      'hashKey2',
      {},
      now + day,
      now + day,
    );

    expect(hashKeySpace.length).to.equal(4);
  });

  it('should get empty hash key space', function () {
    const hashKeySpace = getHashKeySpace(
      entityManager,
      'user',
      'hashKey2',
      {},
      now + day,
      now,
    );

    expect(hashKeySpace.length).to.equal(0);
  });

  it('should get constrained alternate hash key space when unique provided', function () {
    const hashKeySpace = getHashKeySpace(
      entityManager,
      'user',
      'userPK',
      { userId: '123' },
      now,
      Infinity,
    );

    // Constrained to one suffix per bump → 3 bumps
    expect(hashKeySpace.length).to.equal(3);
    expect(hashKeySpace[0]).to.equal('user!|userId#123');
  });

  it('should get constrained global hash key space when unique provided', function () {
    const hashKeySpace = getHashKeySpace(
      entityManager,
      'user',
      'hashKey2',
      { userId: 'abc' },
      now,
      Infinity,
    );

    // Constrained to one suffix per bump → 3 bumps
    expect(hashKeySpace.length).to.equal(3);
  });

  it('should fail on unsharded hash key token', function () {
    expect(() =>
      // @ts-expect-error Argument of type '"firstNameRK"' is not assignable to parameter of type '"hashKey2" | MyShardedKeys'.
      getHashKeySpace(entityManager, 'user', 'firstNameRK', {}, now, Infinity),
    ).to.throw('generated property not sharded');
  });

  it('should fail on unsupported hash key token', function () {
    expect(() =>
      getHashKeySpace(entityManager, 'user', 'userPK', {}, now, Infinity),
    ).to.throw('item does not support hash key space');
  });
});
