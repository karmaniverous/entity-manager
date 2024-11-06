import { expect } from 'chai';

import { day, entityManager, now } from '../test/config';
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

  it('should get full alternate hash key space', function () {
    const hashKeySpace = getHashKeySpace(
      entityManager,
      'user',
      'userPK',
      { userId: '123' },
      now,
      Infinity,
    );

    expect(hashKeySpace.length).to.equal(21);
    expect(hashKeySpace[0]).to.equal('user!|userId#123');
  });

  it('should fail on unsharded hash key token', function () {
    expect(() =>
      getHashKeySpace(entityManager, 'user', 'firstNameRK', {}, now, Infinity),
    ).to.throw('entity generated property not sharded');
  });

  it('should fail on unsupported hash key token', function () {
    expect(() =>
      getHashKeySpace(entityManager, 'user', 'userPK', {}, now, Infinity),
    ).to.throw('item does not support hash key space');
  });
});
