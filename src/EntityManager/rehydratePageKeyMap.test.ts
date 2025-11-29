import { pick, zipToObject } from 'radash';
import { beforeEach, describe, expect, it } from 'vitest';

import { day, entityManager, type Item, now } from '../../test/config';
import { getUsers } from '../../test/users';
import { addKeys } from './addKeys';
import type { MyConfigMap } from './Config.types';
import { decodeGeneratedProperty } from './decodeGeneratedProperty';
import { dehydratePageKeyMap } from './dehydratePageKeyMap';
import { getHashKeySpace } from './getHashKeySpace';
import { getIndexComponents } from './getIndexComponents';
import type { PageKeyMap } from './PageKeyMap';
import { rehydratePageKeyMap } from './rehydratePageKeyMap';

describe('rehydratePageKeyMep', function () {
  let item0, item1, item2, item3: Item;
  let pageKeyMap: PageKeyMap<MyConfigMap>;

  beforeEach(function () {
    [item0, item1, item2, item3] = getUsers(4) as Item[];

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
      'firstName',
    ) as (keyof Item)[];

    const lastNameIndexComponents = getIndexComponents(
      entityManager,
      'lastName',
    ) as (keyof Item)[];

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
      {},
      dehydrated,
      now + day,
      now + day,
    );

    expect(rehydrated).to.deep.equal(['hashKey2', pageKeyMap]);
  });

  it('should rehydrate undefined page key map', function () {
    const dehydrated = undefined;
    const rehydrated = rehydratePageKeyMap(
      entityManager,
      'user',
      ['firstName', 'lastName'],
      {},
      dehydrated,
      now + day,
      now + day,
    );

    expect(rehydrated).to.deep.equal([
      'hashKey2',
      {
        firstName: {
          'user!0': undefined,
          'user!1': undefined,
          'user!2': undefined,
          'user!3': undefined,
        },
        lastName: {
          'user!0': undefined,
          'user!1': undefined,
          'user!2': undefined,
          'user!3': undefined,
        },
      },
    ]);
  });

  it('should dehydrate page key map with one undefined page key', function () {
    pageKeyMap.firstName['user!0'] = undefined;

    const dehydrated = dehydratePageKeyMap(entityManager, 'user', pageKeyMap);
    const rehydrated = rehydratePageKeyMap(
      entityManager,
      'user',
      ['firstName', 'lastName'],
      {},
      dehydrated,
      now + day,
      now + day,
    );

    expect(rehydrated).to.deep.equal(['hashKey2', pageKeyMap]);
  });

  it('should rehydrate empty page key map', function () {
    const dehydrated = [] as string[];
    const rehydrated = rehydratePageKeyMap(
      entityManager,
      'user',
      ['firstName', 'lastName'],
      {},
      dehydrated,
      now + day,
      now + day,
    );

    expect(rehydrated).to.deep.equal(['hashKey2', {}]);
  });

  it('should rehydrate complex alternate hash key index', function () {
    const items = (getUsers(21) as Item[]).map((item) =>
      addKeys(entityManager, 'user', item),
    );

    const beneficiaryCreatedIndexComponents = getIndexComponents(
      entityManager,
      'beneficiaryCreated',
    ) as (keyof Item)[];

    pageKeyMap = {
      beneficiaryCreated: zipToObject(
        getHashKeySpace(
          entityManager,
          'user',
          'beneficiaryPK',
          { beneficiaryId: 'abc123' },
          now,
          Infinity,
        ),
        (beneficiaryPK, i) =>
          pick(
            {
              ...items[i],
              ...decodeGeneratedProperty(entityManager, 'user', beneficiaryPK),
              beneficiaryPK,
            },
            beneficiaryCreatedIndexComponents,
          ),
      ),
    };

    const dehydrated = dehydratePageKeyMap(entityManager, 'user', pageKeyMap);
    const rehydrated = rehydratePageKeyMap(
      entityManager,
      'user',
      ['beneficiaryCreated'],
      { beneficiaryId: 'abc123' },
      dehydrated,
      now,
      Infinity,
    );

    expect(rehydrated).to.deep.equal(['beneficiaryPK', pageKeyMap]);
  });
});
