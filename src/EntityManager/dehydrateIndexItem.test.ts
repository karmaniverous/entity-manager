import { expect } from 'chai';

import { entityManager, type Item } from '../../test/config';
import { getUsers } from '../../test/users';
import { dehydratedPattern } from '../../test/util';
import { addKeys } from './addKeys';
import { dehydrateIndexItem } from './dehydrateIndexItem';

describe('dehydrateIndexItem', function () {
  it('should dehydrate item by index', function () {
    let [item] = getUsers() as Partial<Item>[];
    item = addKeys(entityManager, 'user', item);

    const dehydrated = dehydrateIndexItem(
      entityManager,
      'user',
      'firstName',
      item,
    );

    expect(dehydrated).to.match(dehydratedPattern(3));
  });

  it('should dehydrate item by index with missing component', function () {
    let [item] = getUsers() as Partial<Item>[];
    delete item.phone;
    item = addKeys(entityManager, 'user', item);

    const dehydrated = dehydrateIndexItem(entityManager, 'user', 'phone', item);

    expect(dehydrated).to.match(dehydratedPattern(2));
  });
});
