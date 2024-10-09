import { expect } from 'chai';

import { day, entityManager, now, type UserItem } from '../test/config';
import { getUsers } from '../test/users';
import { updateItemHashKey } from './updateItemHashKey';

describe('updateItemHashKey', function () {
  it('should add unsharded entity item hash key', function () {
    let [item] = getUsers() as Partial<UserItem>[];
    item.created = now;

    item = updateItemHashKey(entityManager, item, 'user');

    expect(item.hashKey2).to.equal('user!');
  });

  it('should add sharded entity item hash key', function () {
    let [item] = getUsers() as Partial<UserItem>[];
    item.created = now + day;

    item = updateItemHashKey(entityManager, item, 'user');

    expect(item.hashKey2?.length).to.equal(6);
  });

  it('should not overwrite sharded entity item hash key', function () {
    const [item] = getUsers() as UserItem[];
    item.created = now + day * 2;
    item.hashKey2 = 'user!q';

    updateItemHashKey(entityManager, item, 'user');

    expect(item.hashKey2).to.equal('user!q');
  });

  it('should overwrite sharded entity item hash key', function () {
    let [item] = getUsers() as Partial<UserItem>[];
    item.created = now + day * 2;
    item.hashKey2 = 'user!q';

    item = updateItemHashKey(entityManager, item, 'user', true);

    expect(item.hashKey2?.length).to.equal(7);
  });
});
