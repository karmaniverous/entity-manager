import { expect } from 'chai';

import { entityManager, type UserItem } from '../test/config';
import { getUsers } from '../test/users';
import { addKeys } from './addKeys';
import { removeKeys } from './removeKeys';

describe('removeKeys', function () {
  it('should strip item generated properties', function () {
    const [item] = getUsers() as UserItem[];

    removeKeys(entityManager, 'user', addKeys(entityManager, 'user', item));

    expect(item).not.to.haveOwnProperty('hashKey');
    expect(item).not.to.haveOwnProperty('rangeKey');
    expect(item).not.to.haveOwnProperty('firstNameRK');
    expect(item).not.to.haveOwnProperty('lastNameRK');
    expect(item).not.to.haveOwnProperty('phoneRK');
  });
});
