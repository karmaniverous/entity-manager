import { describe, expect, it } from 'vitest';

import { entityManager } from '../../test/config';
import { getIndexComponents } from './getIndexComponents';

describe('getIndexComponents', function () {
  it('gets components of index with global hash key & simple range key', function () {
    const components = getIndexComponents(entityManager, 'phone');

    expect(components).to.deep.equal(['hashKey2', 'rangeKey', 'phone']);
  });

  it('gets components of index with global hash key & generated range key', function () {
    const components = getIndexComponents(entityManager, 'firstName');

    expect(components).to.deep.equal(['hashKey2', 'rangeKey', 'firstNameRK']);
  });

  it('gets components of index with generated hash key & simple range key', function () {
    const components = getIndexComponents(entityManager, 'beneficiaryCreated');

    expect(components).to.deep.equal([
      'hashKey2',
      'rangeKey',
      'beneficiaryPK',
      'created',
    ]);
  });
});
