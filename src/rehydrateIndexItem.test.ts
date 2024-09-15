import { expect } from 'chai';

import { entityManager, type UserItem } from '../test/config';
import { getUsers } from '../test/users';
import { dehydrateIndexItem } from './dehydrateIndexItem';
import { rehydrateIndexItem } from './rehydrateIndexItem';

describe('rehydrateIndexItem', function () {
  it('should rehydrate item by index', function () {
    const [item] = getUsers() as UserItem[];

    const rehydrated = rehydrateIndexItem(
      entityManager,
      dehydrateIndexItem(entityManager, item, 'user', 'firstName'),
      'user',
      'firstName',
    );

    expect(item).to.deep.include(rehydrated);
  });

  it('should rehydrate item by index with missing component', function () {
    const [item] = getUsers() as UserItem[];
    delete item.phone;

    const rehydrated = rehydrateIndexItem(
      entityManager,
      dehydrateIndexItem(entityManager, item, 'user', 'phone'),
      'user',
      'phone',
    );

    expect(item).to.deep.include(rehydrated);
  });
});
