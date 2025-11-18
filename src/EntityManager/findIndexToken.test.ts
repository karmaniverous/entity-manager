import { describe, expect, it } from 'vitest';

import { entityManager } from '../../test/config';
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

  it('fails for nonexistent index', function () {
    expect(() => findIndexToken(entityManager, 'hashKey2', 'rangeKey')).to
      .throw;
  });

  it('returns undefined for nonexistent index if error suppressed', function () {
    const indexToken = findIndexToken(
      entityManager,
      'hashKey2',
      'rangeKey',
      true,
    );

    expect(indexToken).to.be.undefined;
  });
});
