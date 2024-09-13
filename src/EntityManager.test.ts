/* eslint-disable mocha/no-setup-in-describe */
/* eslint-env mocha */

import { expect } from 'chai';
import { mapValues, pick } from 'radash';
import { inspect } from 'util';

import { config, day, now, type UserItem } from '../test/config';
import { getUsers } from '../test/users';
import { EntityManager, PageKeyMap } from './EntityManager';

const entityManager = new EntityManager(config, {
  logger: {
    ...console,
    debug: (...args: unknown[]) => {
      console.debug(...args.map((arg) => inspect(arg, false, null)));
    },
  },
});

describe('EntityManager', function () {
  describe('encodeGeneratedProperty', function () {
    it('should encode generated property', function () {
      const [item] = getUsers() as UserItem[];

      const encoded = entityManager.encodeGeneratedProperty(
        'user',
        item,
        'firstNameRK',
      );

      expect(encoded).to.match(
        /^firstNameCanonical#\w+\|lastNameCanonical#\w+$/,
      );
    });

    it('should encode sharded generated property', function () {
      const [item] = getUsers() as UserItem[];
      item.hashKey = 'user!q';

      const encoded = entityManager.encodeGeneratedProperty(
        'user',
        item,
        'lastNameRK',
      );

      expect(encoded).to.match(
        /^user!q\|lastNameCanonical#\w+\|firstNameCanonical#\w+$/,
      );
    });

    it('should encode atomic generated property', function () {
      const [item] = getUsers() as UserItem[];

      const encoded = entityManager.encodeGeneratedProperty(
        'user',
        item,
        'phoneRK',
      );

      expect(encoded).to.match(/^phone#\+\d+\|created#\d+$/);
    });

    it('should not encode atomic generated property with undefined', function () {
      const [item] = getUsers() as UserItem[];
      item.phone = undefined;

      const encoded = entityManager.encodeGeneratedProperty(
        'user',
        item,
        'phoneRK',
      );

      expect(encoded).to.be.undefined;
    });

    it('should fail on unknown generated property', function () {
      const [item] = getUsers() as UserItem[];

      expect(() =>
        entityManager.encodeGeneratedProperty('user', item, 'foo'),
      ).to.throw('unknown');
    });
  });

  describe('decodeGeneratedProperty', function () {
    it('should decode empty string to empty object', function () {
      const decoded = entityManager.decodeGeneratedProperty('user', '');

      expect(decoded).to.deep.equal({});
    });

    it('should fail on no value delimiters', function () {
      expect(() =>
        entityManager.decodeGeneratedProperty('user', 'abc'),
      ).to.throw('invalid generated property value');
    });

    it('should fail on too many value delimiters', function () {
      expect(() =>
        entityManager.decodeGeneratedProperty('user', 'abc#def#ghi'),
      ).to.throw('invalid generated property value');
    });

    it('should decode hash key', function () {
      const decoded = entityManager.decodeGeneratedProperty('user', 'user!q');

      expect(decoded).to.deep.equal({ hashKey: 'user!q' });
    });

    it('should decode generated property', function () {
      const decoded = entityManager.decodeGeneratedProperty(
        'user',
        'firstNameCanonical#lilian|lastNameCanonical#fahey',
      );

      expect(decoded).to.deep.equal({
        firstNameCanonical: 'lilian',
        lastNameCanonical: 'fahey',
      });
    });

    it('should decode generated property with hash key', function () {
      const decoded = entityManager.decodeGeneratedProperty(
        'user',
        'user!q|firstNameCanonical#lilian|lastNameCanonical#fahey',
      );

      expect(decoded).to.deep.equal({
        hashKey: 'user!q',
        firstNameCanonical: 'lilian',
        lastNameCanonical: 'fahey',
      });
    });

    it('should fail on misplaced hash key', function () {
      expect(() =>
        entityManager.decodeGeneratedProperty(
          'user',
          'firstNameCanonical#lilian|user!q|lastNameCanonical#fahey',
        ),
      ).to.throw('invalid generated property value');
    });
  });

  describe('updateItemHashKey', function () {
    it('should add unsharded entity item hash key', function () {
      const [item] = getUsers() as UserItem[];
      item.created = now;

      entityManager.updateItemHashKey('user', item);

      expect(item.hashKey).to.equal('user!');
    });

    it('should add sharded entity item hash key', function () {
      const [item] = getUsers() as UserItem[];
      item.created = now + day;

      entityManager.updateItemHashKey('user', item);

      expect(item.hashKey?.length).to.equal(6);
    });

    it('should not overwrite sharded entity item hash key', function () {
      const [item] = getUsers() as UserItem[];
      item.created = now + day * 2;
      item.hashKey = 'user!q';

      entityManager.updateItemHashKey('user', item);

      expect(item.hashKey).to.equal('user!q');
    });

    it('should overwrite sharded entity item hash key', function () {
      const [item] = getUsers() as UserItem[];
      item.created = now + day * 2;
      item.hashKey = 'user!q';

      entityManager.updateItemHashKey('user', item, true);

      expect(item.hashKey.length).to.equal(7);
    });
  });

  describe('updateItemGeneratedProperties', function () {
    it('should add item generated properties', function () {
      const [item] = getUsers() as UserItem[];

      entityManager.updateItemGeneratedProperties('user', item);

      expect(item).to.haveOwnProperty('hashKey');
      expect(item).to.haveOwnProperty('rangeKey');
      expect(item).to.haveOwnProperty('firstNameRK');
      expect(item).to.haveOwnProperty('lastNameRK');
      expect(item).to.haveOwnProperty('phoneRK');
    });

    it('should not overwrite item generated properties', function () {
      const [item] = getUsers() as UserItem[];

      const newItem = entityManager.updateItemGeneratedProperties('user', {
        ...item,
        firstNameCanonical: 'foo',
      });

      expect(newItem.firstNameRK).to.equal(newItem.firstNameRK);
    });

    it('should overwrite item generated properties', function () {
      const [item] = getUsers() as UserItem[];

      const newItem = entityManager.updateItemGeneratedProperties(
        'user',
        {
          ...item,
          firstNameCanonical: 'foo',
        },
        true,
      );

      expect(newItem.firstNameRK).not.to.equal(item.firstNameRK);
    });
  });

  describe('stripItemGeneratedProperties', function () {
    it('should strip item generated properties', function () {
      const [item] = getUsers() as UserItem[];

      entityManager.stripItemGeneratedProperties(
        'user',
        entityManager.updateItemGeneratedProperties('user', item),
      );

      expect(item).not.to.haveOwnProperty('hashKey');
      expect(item).not.to.haveOwnProperty('rangeKey');
      expect(item).not.to.haveOwnProperty('firstNameRK');
      expect(item).not.to.haveOwnProperty('lastNameRK');
      expect(item).not.to.haveOwnProperty('phoneRK');
    });
  });

  describe('dehydrateIndexItem', function () {
    it('should dehydrate item by index', function () {
      const [item] = getUsers() as UserItem[];
      entityManager.updateItemGeneratedProperties('user', item);

      const dehydrated = entityManager.dehydrateIndexItem(
        'user',
        'firstName',
        item,
      );

      expect(dehydrated).to.match(/\w+\|[\w!]+\|\w+\|[\w-]+/);
    });

    it('should dehydrate item by index with missing component', function () {
      const [item] = getUsers() as UserItem[];
      delete item.phone;
      entityManager.updateItemGeneratedProperties('user', item);

      const dehydrated = entityManager.dehydrateIndexItem(
        'user',
        'phone',
        item,
      );

      expect(dehydrated).to.match(/[\w!]+\|\|[\w-]+/);
    });
  });

  describe('rehydrateIndexItem', function () {
    it('should rehydrate item by index', function () {
      const [item] = getUsers() as UserItem[];

      const rehydrated = entityManager.rehydrateIndexItem(
        'user',
        'firstName',
        entityManager.dehydrateIndexItem('user', 'firstName', item),
      );

      expect(item).to.deep.include(rehydrated);
    });

    it('should rehydrate item by index with missing component', function () {
      const [item] = getUsers() as UserItem[];
      delete item.phone;

      const rehydrated = entityManager.rehydrateIndexItem(
        'user',
        'phone',
        entityManager.dehydrateIndexItem('user', 'phone', item),
      );

      expect(item).to.deep.include(rehydrated);
    });
  });

  describe('dehydratePageKeyMep', function () {
    let item, item0, item1: UserItem;
    let pageKeyMap: PageKeyMap;

    beforeEach(function () {
      [item, item0, item1] = getUsers(3) as UserItem[];

      item.hashKey = 'user!';
      item0.hashKey = 'user!0';
      item1.hashKey = 'user!1';

      entityManager.updateItemGeneratedProperties('user', item);
      entityManager.updateItemGeneratedProperties('user', item0);
      entityManager.updateItemGeneratedProperties('user', item1);

      pageKeyMap = {
        firstName: {
          'user!': pick(
            item,
            entityManager.config.entities.user.indexes
              .firstName as (keyof UserItem)[],
          ),
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
        },
        lastName: {
          'user!': pick(
            item,
            entityManager.config.entities.user.indexes
              .lastName as (keyof UserItem)[],
          ),
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
        },
      };
    });

    it('should dehydrate page key map', function () {
      const dehydrated = entityManager.dehydratePageKeyMap('user', pageKeyMap);

      expect(dehydrated.length).to.equal(6);
      expect(dehydrated[0]).to.be.a('string');
    });

    it('should dehydrate page key map with undefined page key', function () {
      pageKeyMap.firstName['user!0'] = undefined;

      const dehydrated = entityManager.dehydratePageKeyMap('user', pageKeyMap);

      expect(dehydrated.length).to.equal(6);
      expect(dehydrated[0]).to.be.a('string');
      expect(dehydrated[1]).to.equal('');
    });

    it('should dehydrate page key map with all undefined page keys', function () {
      pageKeyMap = mapValues(pageKeyMap, (indexMap) =>
        mapValues(indexMap, () => undefined),
      );

      const dehydrated = entityManager.dehydratePageKeyMap('user', pageKeyMap);

      expect(dehydrated).to.deep.equal([]);
    });
  });
});
