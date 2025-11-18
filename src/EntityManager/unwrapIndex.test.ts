import { describe, expect, it } from 'vitest';

import { entityManager } from '../../test/config';
import { unwrapIndex } from './unwrapIndex';

describe('unwrapIndex', function () {
  it('should unwrap index with global hash key & simple range key', function () {
    const unwrapped = unwrapIndex(entityManager, 'user', 'phone');

    expect(unwrapped).to.deep.equal(['created', 'phone', 'userId']);
  });

  it('should unwrap index with global hash key & generated range key', function () {
    const unwrapped = unwrapIndex(entityManager, 'user', 'firstName');

    expect(unwrapped).to.deep.equal([
      'created',
      'firstNameCanonical',
      'lastNameCanonical',
      'userId',
    ]);
  });

  it('should unwrap index with generated hash key & simple range key', function () {
    const unwrapped = unwrapIndex(entityManager, 'user', 'beneficiaryCreated');

    expect(unwrapped).to.deep.equal(['beneficiaryId', 'created', 'userId']);
  });

  it('should exclude a generated hash key', function () {
    const unwrapped = unwrapIndex(entityManager, 'user', 'beneficiaryCreated', [
      'beneficiaryPK',
    ]);

    expect(unwrapped).to.deep.equal(['created', 'userId']);
  });

  it('should exclude an ungenerated element', function () {
    const unwrapped = unwrapIndex(entityManager, 'user', 'firstName', [
      'firstNameCanonical',
    ]);

    expect(unwrapped).to.deep.equal(['created', 'lastNameCanonical', 'userId']);
  });
});
