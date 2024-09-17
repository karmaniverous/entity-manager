import { expect } from 'chai';

import { entityManager, type UserItem } from '../test/config';
import { getUsers } from '../test/users';
import { encodeGeneratedProperty } from './encodeGeneratedProperty';

describe('encodeGeneratedProperty', function () {
  it('should encode generated property', function () {
    const [item] = getUsers() as UserItem[];

    const encoded = encodeGeneratedProperty(
      entityManager,
      item,
      'user',
      'firstNameRK',
    );

    expect(encoded).to.match(/^firstNameCanonical#\w+\|lastNameCanonical#\w+$/);
  });

  it('should encode sharded generated property', function () {
    const [item] = getUsers() as UserItem[];
    item.hashKey2 = 'user!q';

    const encoded = encodeGeneratedProperty(
      entityManager,
      item,
      'user',
      'lastNameRK',
    );

    expect(encoded).to.match(
      /^user!q\|lastNameCanonical#\w+\|firstNameCanonical#\w+$/,
    );
  });

  it('should encode atomic generated property', function () {
    const [item] = getUsers() as UserItem[];

    const encoded = encodeGeneratedProperty(
      entityManager,
      item,
      'user',
      'phoneRK',
    );

    expect(encoded).to.match(/^phone#\+\d+\|created#\d+$/);
  });

  it('should not encode atomic generated property with undefined', function () {
    const [item] = getUsers() as UserItem[];
    item.phone = undefined;

    const encoded = encodeGeneratedProperty(
      entityManager,
      item,
      'user',
      'phoneRK',
    );

    expect(encoded).to.be.undefined;
  });

  it('should fail on invalid generated property', function () {
    const [item] = getUsers() as UserItem[];

    expect(() =>
      encodeGeneratedProperty(entityManager, item, 'user', 'foo'),
    ).to.throw('invalid');
  });
});
