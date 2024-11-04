import { expect } from 'chai';

import { entityManager, type UserItem } from '../test/config';
import { getUsers } from '../test/users';
import { addKeys } from './addKeys';
import { dehydrateIndexItem } from './dehydrateIndexItem';

describe('dehydrateIndexItem', function () {
  it('should dehydrate item by index', function () {
    let [item] = getUsers() as Partial<UserItem>[];
    item = addKeys(entityManager, 'user', item);

    const dehydrated = dehydrateIndexItem(
      entityManager,
      'user',
      'firstName',
      item,
    );

    expect(dehydrated).to.match(/\w+\|[\w!]+\|\w+\|[\w-]+/);
  });

  it('should dehydrate item by index with missing component', function () {
    let [item] = getUsers() as Partial<UserItem>[];
    delete item.phone;
    item = addKeys(entityManager, 'user', item);

    const dehydrated = dehydrateIndexItem(entityManager, 'user', 'phone', item);

    expect(dehydrated).to.match(/[\w!]+\|\|[\w-]+/);
  });
});
