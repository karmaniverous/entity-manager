import { expect } from 'chai';

import { entityManager, type Item } from '../test/config';
import { getUsers } from '../test/users';
import { encodeGeneratedProperty } from './encodeGeneratedProperty';

describe('encodeGeneratedProperty', function () {
  it('should encode generated property', function () {
    const [item] = getUsers() as Item[];

    const encoded = encodeGeneratedProperty(entityManager, 'firstNameRK', item);

    expect(encoded).to.match(/^firstNameCanonical#\w+\|lastNameCanonical#\w+$/);
  });

  it('should encode sharded generated property', function () {
    const [item] = getUsers() as Item[];
    item.hashKey2 = 'user!q';

    const encoded = encodeGeneratedProperty(entityManager, 'userPK', item);

    expect(encoded).to.match(/^user!q\|userId#[\w-]+$/);
  });

  it('should encode atomic generated property', function () {
    const [item] = getUsers() as Item[];

    const encoded = encodeGeneratedProperty(entityManager, 'phoneRK', item);

    expect(encoded).to.match(/^phone#\+\d+\|created#\d+$/);
  });

  it('should not encode atomic generated property with undefined', function () {
    const [item] = getUsers() as Item[];
    item.beneficiaryId = undefined;

    const encoded = encodeGeneratedProperty(
      entityManager,
      'beneficiaryPK',
      item,
    );

    expect(encoded).to.be.undefined;
  });

  it('should fail on invalid generated property', function () {
    const [item] = getUsers() as Item[];

    expect(() =>
      // @ts-expect-error Argument of type '"foo"' is not assignable to parameter of type 'MyShardedKeys | MyUnshardedKeys'
      encodeGeneratedProperty(entityManager, 'foo', item),
    ).to.throw('invalid');
  });
});
