import { expect } from 'chai';

import { day, entityManager, now } from '../test/config';
import { getHashKeySpace } from './getHashKeySpace';

describe('getHashKeySpace', function () {
  it('should get lowest hash key space', function () {
    const hashKeySpace = getHashKeySpace(entityManager, 'user', now, now);

    expect(hashKeySpace).to.deep.equal(['user!']);
  });

  it('should get full hash key space', function () {
    const hashKeySpace = getHashKeySpace(entityManager, 'user', now, Infinity);

    expect(hashKeySpace.length).to.equal(21);
  });

  it('should get middle hash key space', function () {
    const hashKeySpace = getHashKeySpace(
      entityManager,
      'user',
      now + day,
      now + day,
    );

    expect(hashKeySpace.length).to.equal(4);
  });

  it('should get empty hash key space', function () {
    const hashKeySpace = getHashKeySpace(entityManager, 'user', now + day, now);

    expect(hashKeySpace.length).to.equal(0);
  });
});
