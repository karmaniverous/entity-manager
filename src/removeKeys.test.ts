import { expect } from 'chai';

import { entityManager, type UserItem } from '../test/config';
import { getUsers } from '../test/users';
import { addKeys } from './addKeys';

describe('removeKeys', function () {
  it('should strip item generated properties', function () {
    const [item] = getUsers() as UserItem[];

    entityManager.removeKeys(addKeys(entityManager, item, 'user'), 'user');

    expect(item).not.to.haveOwnProperty('hashKey');
    expect(item).not.to.haveOwnProperty('rangeKey');
    expect(item).not.to.haveOwnProperty('firstNameRK');
    expect(item).not.to.haveOwnProperty('lastNameRK');
    expect(item).not.to.haveOwnProperty('phoneRK');
  });
});
