import { type DefaultTranscodeMap } from '@karmaniverous/entity-tools';
import { expect } from 'chai';
import { mapValues, pick } from 'radash';

import { entityManager, type UserItem } from '../test/config';
import { getUsers } from '../test/users';
import { addKeys } from './addKeys';
import { dehydratePageKeyMap } from './dehydratePageKeyMap';
import { getIndexComponents } from './getIndexComponents';
import { type PageKeyMap } from './PageKeyMap';

describe('dehydratePageKeyMep', function () {
  let item, item0, item1: UserItem;
  let pageKeyMap: PageKeyMap<UserItem, DefaultTranscodeMap>;

  beforeEach(function () {
    [item, item0, item1] = getUsers(3) as UserItem[];

    item.hashKey2 = 'user!';
    item0.hashKey2 = 'user!0';
    item1.hashKey2 = 'user!1';

    addKeys(entityManager, item, 'user');
    addKeys(entityManager, item0, 'user');
    addKeys(entityManager, item1, 'user');

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
        'user!': pick(item, firstNameIndexComponents),
        'user!0': pick(item0, firstNameIndexComponents),
        'user!1': pick(item1, firstNameIndexComponents),
      },
      lastName: {
        'user!': pick(item, lastNameIndexComponents),
        'user!0': pick(item0, lastNameIndexComponents),
        'user!1': pick(item1, lastNameIndexComponents),
      },
    };
  });

  it('should dehydrate page key map', function () {
    const dehydrated = dehydratePageKeyMap(entityManager, pageKeyMap, 'user');

    expect(dehydrated.length).to.equal(6);
    expect(dehydrated[0]).to.be.a('string');
  });

  it('should dehydrate page key map with undefined page key', function () {
    pageKeyMap.firstName['user!0'] = undefined;

    const dehydrated = dehydratePageKeyMap(entityManager, pageKeyMap, 'user');

    expect(dehydrated.length).to.equal(6);
    expect(dehydrated[0]).to.be.a('string');
    expect(dehydrated[1]).to.equal('');
  });

  it('should dehydrate page key map with all undefined page keys', function () {
    pageKeyMap = mapValues(pageKeyMap, (indexMap) =>
      mapValues(indexMap, () => undefined),
    );

    const dehydrated = dehydratePageKeyMap(entityManager, pageKeyMap, 'user');

    expect(dehydrated).to.deep.equal([]);
  });
});
