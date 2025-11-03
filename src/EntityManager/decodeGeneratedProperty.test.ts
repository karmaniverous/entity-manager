import { describe, expect, it } from 'vitest';

import { entityManager } from '../../test/config';
import { decodeGeneratedProperty } from './decodeGeneratedProperty';

describe('decodeGeneratedProperty', function () {
  it('should decode empty string to empty object', function () {
    const decoded = decodeGeneratedProperty(entityManager, '');

    expect(decoded).to.deep.equal({});
  });

  it('should fail on no value delimiters', function () {
    expect(() => decodeGeneratedProperty(entityManager, 'abc')).to.throw(
      'invalid generated property value',
    );
  });

  it('should fail on too many value delimiters', function () {
    expect(() =>
      decodeGeneratedProperty(entityManager, 'abc#def#ghi'),
    ).to.throw('invalid generated property value');
  });

  it('should decode hash key', function () {
    const decoded = decodeGeneratedProperty(entityManager, 'user!q');

    expect(decoded).to.deep.equal({ hashKey2: 'user!q' });
  });

  it('should decode generated property', function () {
    const decoded = decodeGeneratedProperty(
      entityManager,
      'firstNameCanonical#lilian|lastNameCanonical#fahey',
    );

    expect(decoded).to.deep.equal({
      firstNameCanonical: 'lilian',
      lastNameCanonical: 'fahey',
    });
  });

  it('should decode generated property with hash key', function () {
    const decoded = decodeGeneratedProperty(
      entityManager,
      'user!q|firstNameCanonical#lilian|lastNameCanonical#fahey',
    );

    expect(decoded).to.deep.equal({
      hashKey2: 'user!q',
      firstNameCanonical: 'lilian',
      lastNameCanonical: 'fahey',
    });
  });

  it('should fail on misplaced hash key', function () {
    expect(() =>
      decodeGeneratedProperty(
        entityManager,
        'firstNameCanonical#lilian|user!q|lastNameCanonical#fahey',
      ),
    ).to.throw('invalid generated property value');
  });
});
