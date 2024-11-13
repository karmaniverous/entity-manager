import { expect } from 'chai';

import { entityManager } from '../test/config';
import { findIndexToken } from './findIndexToken';

describe('findIndexToken', function () {
  it('finds existing index', function () {
    const indexToken = findIndexToken(
      entityManager,
      'beneficiaryPK',
      'created',
    );

    expect(indexToken).to.equal('beneficiaryCreated');
  });

  it('returns undefined for nonexistent index', function () {
    const indexToken = findIndexToken(entityManager, 'hashKey2', 'rangeKey');

    expect(indexToken).to.be.undefined;
  });
});
