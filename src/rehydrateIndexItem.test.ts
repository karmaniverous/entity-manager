import { expect } from 'chai';

import { entityManager, type Item } from '../test/config';
import { getUsers } from '../test/users';
import { addKeys } from './addKeys';
import { dehydrateIndexItem } from './dehydrateIndexItem';
import { rehydrateIndexItem } from './rehydrateIndexItem';

describe('rehydrateIndexItem', function () {
  it('should rehydrate item by index', function () {
    const [item] = getUsers() as Item[];
    addKeys(entityManager, 'user', item);

    const rehydrated = rehydrateIndexItem(
      entityManager,
      'user',
      'firstName',
      dehydrateIndexItem(entityManager, 'user', 'firstName', item),
    );

    expect(item).to.deep.include(rehydrated);
  });

  it('should rehydrate item by index with missing component', function () {
    const [item] = getUsers() as Item[];
    addKeys(entityManager, 'user', item);
    delete item.phone;

    const rehydrated = rehydrateIndexItem(
      entityManager,
      'user',
      'phone',
      dehydrateIndexItem(entityManager, 'user', 'phone', item),
    );

    expect(item).to.deep.include(rehydrated);
  });
});
