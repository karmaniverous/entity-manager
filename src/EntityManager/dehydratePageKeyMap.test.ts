import { mapValues, pick } from 'radash';
import { beforeEach, describe, expect, it } from 'vitest';

import type { MyConfigMap } from '../../test/config';
import { entityManager, type Item } from '../../test/config';
import { getUsers } from '../../test/users';
import { dehydratedPattern } from '../../test/util';
import { addKeys } from './addKeys';
import { dehydratePageKeyMap } from './dehydratePageKeyMap';
import { getIndexComponents } from './getIndexComponents';
import type { PageKeyMap } from './PageKeyMap';

describe('dehydratePageKeyMap', function () {
  let item: Item;
  let item0: Item;
  let item1: Item;

  let pageKeyMap: PageKeyMap<MyConfigMap>;

  beforeEach(function () {
    [item, item0, item1] = getUsers(3);

    item.hashKey2 = 'user!';
    item0.hashKey2 = 'user!0';
    item1.hashKey2 = 'user!1';

    item = addKeys(entityManager, 'user', item);
    item0 = addKeys(entityManager, 'user', item0);
    item1 = addKeys(entityManager, 'user', item1);
  });

  describe('multi-index', function () {
    beforeEach(function () {
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
          [item.hashKey2!]: pick(item, firstNameIndexComponents),
          [item0.hashKey2!]: pick(item0, firstNameIndexComponents),
          [item1.hashKey2!]: pick(item1, firstNameIndexComponents),
        },
        lastName: {
          [item.hashKey2!]: pick(item, lastNameIndexComponents),
          [item0.hashKey2!]: pick(item0, lastNameIndexComponents),
          [item1.hashKey2!]: pick(item1, lastNameIndexComponents),
        },
      };
    });

    it('should dehydrate page key map', function () {
      const dehydrated = dehydratePageKeyMap(entityManager, 'user', pageKeyMap);

      expect(dehydrated.length).to.equal(6);
      expect(dehydrated.every((d) => dehydratedPattern(3).test(d))).to.be.true;
    });

    it('should dehydrate page key map with undefined page key', function () {
      pageKeyMap.firstName[item0.hashKey2!] = undefined;

      const dehydrated = dehydratePageKeyMap(entityManager, 'user', pageKeyMap);

      expect(dehydrated.length).to.equal(6);
      expect(dehydrated[0]).to.match(dehydratedPattern(3));
      expect(dehydrated[1]).to.equal('');
    });

    it('should dehydrate page key map with all undefined page keys', function () {
      pageKeyMap = mapValues(pageKeyMap, (indexMap) =>
        mapValues(indexMap, () => undefined),
      );

      const dehydrated = dehydratePageKeyMap(entityManager, 'user', pageKeyMap);

      expect(dehydrated).to.deep.equal([]);
    });
  });

  describe('alternate hask key index', function () {
    beforeEach(function () {
      const userCreatedIndexComponents = getIndexComponents(
        entityManager,
        'userCreated',
      ) as (keyof Item)[];

      pageKeyMap = {
        userCreated: {
          [item.userPK!]: pick(item, userCreatedIndexComponents),
          [item0.userPK!]: pick(item0, userCreatedIndexComponents),
          [item1.userPK!]: pick(item1, userCreatedIndexComponents),
        },
      };
    });

    it('should dehydrate page key map', function () {
      const dehydrated = dehydratePageKeyMap(entityManager, 'user', pageKeyMap);

      expect(dehydrated.length).to.equal(3);
      expect(dehydrated.every((d) => dehydratedPattern(2).test(d))).to.be.true;
    });

    it('should dehydrate page key map with undefined page key', function () {
      pageKeyMap.userCreated[item0.userPK!] = undefined;

      const dehydrated = dehydratePageKeyMap(entityManager, 'user', pageKeyMap);

      expect(dehydrated.length).to.equal(3);
      expect(dehydrated[0]).to.match(dehydratedPattern(2));
      expect(dehydrated[1]).to.equal('');
    });

    it('should dehydrate page key map with all undefined page keys', function () {
      pageKeyMap = mapValues(pageKeyMap, (indexMap) =>
        mapValues(indexMap, () => undefined),
      );

      const dehydrated = dehydratePageKeyMap(entityManager, 'user', pageKeyMap);

      expect(dehydrated).to.deep.equal([]);
    });
  });
});
