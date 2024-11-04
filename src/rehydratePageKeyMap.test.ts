import { type DefaultTranscodeMap } from '@karmaniverous/entity-tools';
import { expect } from 'chai';
import { mapValues, pick } from 'radash';

import { day, entityManager, now, type UserItem } from '../test/config';
import { getUsers } from '../test/users';
import { addKeys } from './addKeys';
import { dehydratePageKeyMap } from './dehydratePageKeyMap';
import { getIndexComponents } from './getIndexComponents';
import { type PageKeyMap } from './PageKeyMap';
import { rehydratePageKeyMap } from './rehydratePageKeyMap';

describe('rehydratePageKeyMep', function () {
  let item0, item1, item2, item3: Partial<UserItem>;
  let pageKeyMap: PageKeyMap<UserItem, DefaultTranscodeMap>;

  beforeEach(function () {
    [item0, item1, item2, item3] = getUsers(4) as Partial<UserItem>[];

    item0.hashKey2 = 'user!0';
    item1.hashKey2 = 'user!1';
    item2.hashKey2 = 'user!2';
    item3.hashKey2 = 'user!3';

    item0 = addKeys(entityManager, 'user', item0);
    item1 = addKeys(entityManager, 'user', item1);
    item2 = addKeys(entityManager, 'user', item2);
    item3 = addKeys(entityManager, 'user', item3);

    const firstNameIndexComponents = getIndexComponents(
      entityManager,
      'user',
      'firstName',
    ) as (keyof UserItem)[];

    const lastNameIndexComponents = getIndexComponents(
      entityManager,
      'user',
      'lastName',
    ) as (keyof UserItem)[];

    pageKeyMap = {
      firstName: {
        'user!0': pick(item0, firstNameIndexComponents),
        'user!1': pick(item1, firstNameIndexComponents),
        'user!2': pick(item2, firstNameIndexComponents),
        'user!3': pick(item3, firstNameIndexComponents),
      },
      lastName: {
        'user!0': pick(item0, lastNameIndexComponents),
        'user!1': pick(item1, lastNameIndexComponents),
        'user!2': pick(item2, lastNameIndexComponents),
        'user!3': pick(item3, lastNameIndexComponents),
      },
    };
  });

  it('should rehydrate page key map', function () {
    const dehydrated = dehydratePageKeyMap(entityManager, 'user', pageKeyMap);
    const rehydrated = rehydratePageKeyMap(
      entityManager,
      'user',
      ['firstName', 'lastName'],
      dehydrated,
      now + day,
      now + day,
    );

    expect(rehydrated).to.deep.equal(pageKeyMap);
  });

  it('should dehydrate page key map with undefined page key', function () {
    pageKeyMap.firstName['user!0'] = undefined;

    const dehydrated = dehydratePageKeyMap(entityManager, 'user', pageKeyMap);
    const rehydrated = rehydratePageKeyMap(
      entityManager,
      'user',
      ['firstName', 'lastName'],
      dehydrated,
      now + day,
      now + day,
    );

    expect(rehydrated).to.deep.equal(pageKeyMap);
  });

  it('should rehydrate page key map with all undefined page keys', function () {
    pageKeyMap = mapValues(pageKeyMap, (indexMap) =>
      mapValues(indexMap, () => undefined),
    );

    const dehydrated = dehydratePageKeyMap(entityManager, 'user', pageKeyMap);
    const rehydrated = rehydratePageKeyMap(
      entityManager,
      'user',
      ['firstName', 'lastName'],
      dehydrated,
      now + day,
      now + day,
    );

    expect(rehydrated).to.deep.equal({});
  });
});
