import { expect } from 'chai';

import { entityManager, type UserItem } from '../test/config';
import { getUsers } from '../test/users';
import { addKeys } from './addKeys';

describe('addKeys', function () {
  it('should add item generated properties', function () {
    let [item] = getUsers() as Partial<UserItem>[];

    item = addKeys(entityManager, 'user', item);

    expect(item).to.haveOwnProperty('hashKey2');
    expect(item).to.haveOwnProperty('rangeKey');
    expect(item).to.haveOwnProperty('firstNameRK');
    expect(item).to.haveOwnProperty('lastNameRK');
    expect(item).to.haveOwnProperty('phoneRK');
  });

  it('should not overwrite item generated properties', function () {
    const [item] = getUsers() as UserItem[];

    const newItem = addKeys(entityManager, 'user', {
      ...item,
      firstNameCanonical: 'foo',
    });

    expect(newItem.firstNameRK).to.equal(newItem.firstNameRK);
  });

  it('should overwrite item generated properties', function () {
    const [item] = getUsers() as UserItem[];

    const newItem = addKeys(
      entityManager,
      'user',
      {
        ...item,
        firstNameCanonical: 'foo',
      },
      true,
    );

    expect(newItem.firstNameRK).not.to.equal(item.firstNameRK);
  });
});
