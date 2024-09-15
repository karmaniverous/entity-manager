import { type StringifiableTypes } from '@karmaniverous/entity-tools';
import { expect } from 'chai';
import { mapValues, pick } from 'radash';

import { day, entityManager, now, type UserItem } from '../test/config';
import { getUsers } from '../test/users';
import { addKeys } from './addKeys';
import { dehydratePageKeyMap } from './dehydratePageKeyMap';
import { type PageKeyMap } from './PageKeyMap';
import { rehydratePageKeyMap } from './rehydratePageKeyMap';

describe('rehydratePageKeyMep', function () {
  let item0, item1, item2, item3: UserItem;
  let pageKeyMap: PageKeyMap<UserItem, StringifiableTypes>;

  beforeEach(function () {
    [item0, item1, item2, item3] = getUsers(4) as UserItem[];

    item0.hashKey2 = 'user!0';
    item1.hashKey2 = 'user!1';
    item2.hashKey2 = 'user!2';
    item3.hashKey2 = 'user!3';

    addKeys(entityManager, item0, 'user');
    addKeys(entityManager, item1, 'user');
    addKeys(entityManager, item2, 'user');
    addKeys(entityManager, item3, 'user');

    pageKeyMap = {
      firstName: {
        'user!0': pick(
          item0,
          entityManager.config.entities.user.indexes
            .firstName as (keyof UserItem)[],
        ),
        'user!1': pick(
          item1,
          entityManager.config.entities.user.indexes
            .firstName as (keyof UserItem)[],
        ),
        'user!2': pick(
          item2,
          entityManager.config.entities.user.indexes
            .firstName as (keyof UserItem)[],
        ),
        'user!3': pick(
          item3,
          entityManager.config.entities.user.indexes
            .firstName as (keyof UserItem)[],
        ),
      },
      lastName: {
        'user!0': pick(
          item0,
          entityManager.config.entities.user.indexes
            .lastName as (keyof UserItem)[],
        ),
        'user!1': pick(
          item1,
          entityManager.config.entities.user.indexes
            .lastName as (keyof UserItem)[],
        ),
        'user!2': pick(
          item2,
          entityManager.config.entities.user.indexes
            .lastName as (keyof UserItem)[],
        ),
        'user!3': pick(
          item3,
          entityManager.config.entities.user.indexes
            .lastName as (keyof UserItem)[],
        ),
      },
    };
  });

  it('should rehydrate page key map', function () {
    const dehydrated = dehydratePageKeyMap(entityManager, pageKeyMap, 'user');
    const rehydrated = rehydratePageKeyMap(
      entityManager,
      dehydrated,
      'user',
      ['firstName', 'lastName'],
      now + day,
      now + day,
    );

    expect(rehydrated).to.deep.equal(pageKeyMap);
  });

  it('should dehydrate page key map with undefined page key', function () {
    pageKeyMap.firstName['user!0'] = undefined;

    const dehydrated = dehydratePageKeyMap(entityManager, pageKeyMap, 'user');
    const rehydrated = rehydratePageKeyMap(
      entityManager,
      dehydrated,
      'user',
      ['firstName', 'lastName'],
      now + day,
      now + day,
    );

    expect(rehydrated).to.deep.equal(pageKeyMap);
  });

  it('should rehydrate page key map with all undefined page keys', function () {
    pageKeyMap = mapValues(pageKeyMap, (indexMap) =>
      mapValues(indexMap, () => undefined),
    );

    const dehydrated = dehydratePageKeyMap(entityManager, pageKeyMap, 'user');
    const rehydrated = rehydratePageKeyMap(
      entityManager,
      dehydrated,
      'user',
      ['firstName', 'lastName'],
      now + day,
      now + day,
    );

    expect(rehydrated).to.deep.equal({});
  });
});
