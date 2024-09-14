/* eslint-env mocha */

import { MockDb } from '@karmaniverous/mock-db';
import { expect } from 'chai';
import { mapValues, pick } from 'radash';
import { inspect } from 'util';

import { config, day, MyEntityMap, now, type UserItem } from '../test/config';
import { getUsers } from '../test/users';
import {
  EntityManager,
  type PageKeyMap,
  type ShardQueryFunction,
  type ShardQueryResult,
} from './EntityManager';

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
        item,
        'user',
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
        item,
        'user',
        'lastNameRK',
      );

      expect(encoded).to.match(
        /^user!q\|lastNameCanonical#\w+\|firstNameCanonical#\w+$/,
      );
    });

    it('should encode atomic generated property', function () {
      const [item] = getUsers() as UserItem[];

      const encoded = entityManager.encodeGeneratedProperty(
        item,
        'user',
        'phoneRK',
      );

      expect(encoded).to.match(/^phone#\+\d+\|created#\d+$/);
    });

    it('should not encode atomic generated property with undefined', function () {
      const [item] = getUsers() as UserItem[];
      item.phone = undefined;

      const encoded = entityManager.encodeGeneratedProperty(
        item,
        'user',
        'phoneRK',
      );

      expect(encoded).to.be.undefined;
    });

    it('should fail on unknown generated property', function () {
      const [item] = getUsers() as UserItem[];

      expect(() =>
        entityManager.encodeGeneratedProperty(item, 'user', 'foo'),
      ).to.throw('unknown');
    });
  });

  describe('decodeGeneratedProperty', function () {
    it('should decode empty string to empty object', function () {
      const decoded = entityManager.decodeGeneratedProperty('', 'user');

      expect(decoded).to.deep.equal({});
    });

    it('should fail on no value delimiters', function () {
      expect(() =>
        entityManager.decodeGeneratedProperty('abc', 'user'),
      ).to.throw('invalid generated property value');
    });

    it('should fail on too many value delimiters', function () {
      expect(() =>
        entityManager.decodeGeneratedProperty('abc#def#ghi', 'user'),
      ).to.throw('invalid generated property value');
    });

    it('should decode hash key', function () {
      const decoded = entityManager.decodeGeneratedProperty('user!q', 'user');

      expect(decoded).to.deep.equal({ hashKey: 'user!q' });
    });

    it('should decode generated property', function () {
      const decoded = entityManager.decodeGeneratedProperty(
        'firstNameCanonical#lilian|lastNameCanonical#fahey',
        'user',
      );

      expect(decoded).to.deep.equal({
        firstNameCanonical: 'lilian',
        lastNameCanonical: 'fahey',
      });
    });

    it('should decode generated property with hash key', function () {
      const decoded = entityManager.decodeGeneratedProperty(
        'user!q|firstNameCanonical#lilian|lastNameCanonical#fahey',
        'user',
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
          'firstNameCanonical#lilian|user!q|lastNameCanonical#fahey',
          'user',
        ),
      ).to.throw('invalid generated property value');
    });
  });

  describe('updateItemHashKey', function () {
    it('should add unsharded entity item hash key', function () {
      const [item] = getUsers() as UserItem[];
      item.created = now;

      entityManager.updateItemHashKey(item, 'user');

      expect(item.hashKey).to.equal('user!');
    });

    it('should add sharded entity item hash key', function () {
      const [item] = getUsers() as UserItem[];
      item.created = now + day;

      entityManager.updateItemHashKey(item, 'user');

      expect(item.hashKey?.length).to.equal(6);
    });

    it('should not overwrite sharded entity item hash key', function () {
      const [item] = getUsers() as UserItem[];
      item.created = now + day * 2;
      item.hashKey = 'user!q';

      entityManager.updateItemHashKey(item, 'user');

      expect(item.hashKey).to.equal('user!q');
    });

    it('should overwrite sharded entity item hash key', function () {
      const [item] = getUsers() as UserItem[];
      item.created = now + day * 2;
      item.hashKey = 'user!q';

      entityManager.updateItemHashKey(item, 'user', true);

      expect(item.hashKey.length).to.equal(7);
    });
  });

  describe('updateItemGeneratedProperties', function () {
    it('should add item generated properties', function () {
      const [item] = getUsers() as UserItem[];

      entityManager.updateItemGeneratedProperties(item, 'user');

      expect(item).to.haveOwnProperty('hashKey');
      expect(item).to.haveOwnProperty('rangeKey');
      expect(item).to.haveOwnProperty('firstNameRK');
      expect(item).to.haveOwnProperty('lastNameRK');
      expect(item).to.haveOwnProperty('phoneRK');
    });

    it('should not overwrite item generated properties', function () {
      const [item] = getUsers() as UserItem[];

      const newItem = entityManager.updateItemGeneratedProperties(
        {
          ...item,
          firstNameCanonical: 'foo',
        },
        'user',
      );

      expect(newItem.firstNameRK).to.equal(newItem.firstNameRK);
    });

    it('should overwrite item generated properties', function () {
      const [item] = getUsers() as UserItem[];

      const newItem = entityManager.updateItemGeneratedProperties(
        {
          ...item,
          firstNameCanonical: 'foo',
        },
        'user',
        true,
      );

      expect(newItem.firstNameRK).not.to.equal(item.firstNameRK);
    });
  });

  describe('stripItemGeneratedProperties', function () {
    it('should strip item generated properties', function () {
      const [item] = getUsers() as UserItem[];

      entityManager.stripItemGeneratedProperties(
        entityManager.updateItemGeneratedProperties(item, 'user'),
        'user',
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
      entityManager.updateItemGeneratedProperties(item, 'user');

      const dehydrated = entityManager.dehydrateIndexItem(
        item,
        'user',
        'firstName',
      );

      expect(dehydrated).to.match(/\w+\|[\w!]+\|\w+\|[\w-]+/);
    });

    it('should dehydrate item by index with missing component', function () {
      const [item] = getUsers() as UserItem[];
      delete item.phone;
      entityManager.updateItemGeneratedProperties(item, 'user');

      const dehydrated = entityManager.dehydrateIndexItem(
        item,
        'user',
        'phone',
      );

      expect(dehydrated).to.match(/[\w!]+\|\|[\w-]+/);
    });
  });

  describe('rehydrateIndexItem', function () {
    it('should rehydrate item by index', function () {
      const [item] = getUsers() as UserItem[];

      const rehydrated = entityManager.rehydrateIndexItem(
        entityManager.dehydrateIndexItem(item, 'user', 'firstName'),
        'user',
        'firstName',
      );

      expect(item).to.deep.include(rehydrated);
    });

    it('should rehydrate item by index with missing component', function () {
      const [item] = getUsers() as UserItem[];
      delete item.phone;

      const rehydrated = entityManager.rehydrateIndexItem(
        entityManager.dehydrateIndexItem(item, 'user', 'phone'),
        'user',
        'phone',
      );

      expect(item).to.deep.include(rehydrated);
    });
  });

  describe('dehydratePageKeyMep', function () {
    let item, item0, item1: UserItem;
    let pageKeyMap: PageKeyMap<UserItem>;

    beforeEach(function () {
      [item, item0, item1] = getUsers(3) as UserItem[];

      item.hashKey = 'user!';
      item0.hashKey = 'user!0';
      item1.hashKey = 'user!1';

      entityManager.updateItemGeneratedProperties(item, 'user');
      entityManager.updateItemGeneratedProperties(item0, 'user');
      entityManager.updateItemGeneratedProperties(item1, 'user');

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
      const dehydrated = entityManager.dehydratePageKeyMap(pageKeyMap, 'user');

      expect(dehydrated.length).to.equal(6);
      expect(dehydrated[0]).to.be.a('string');
    });

    it('should dehydrate page key map with undefined page key', function () {
      pageKeyMap.firstName['user!0'] = undefined;

      const dehydrated = entityManager.dehydratePageKeyMap(pageKeyMap, 'user');

      expect(dehydrated.length).to.equal(6);
      expect(dehydrated[0]).to.be.a('string');
      expect(dehydrated[1]).to.equal('');
    });

    it('should dehydrate page key map with all undefined page keys', function () {
      pageKeyMap = mapValues(pageKeyMap, (indexMap) =>
        mapValues(indexMap, () => undefined),
      );

      const dehydrated = entityManager.dehydratePageKeyMap(pageKeyMap, 'user');

      expect(dehydrated).to.deep.equal([]);
    });
  });

  describe('getHashKeySpace', function () {
    it('should get lowest hash key space', function () {
      const hashKeySpace = entityManager.getHashKeySpace('user', now, now);

      expect(hashKeySpace).to.deep.equal(['user!']);
    });

    it('should get full hash key space', function () {
      const hashKeySpace = entityManager.getHashKeySpace('user', now, Infinity);

      expect(hashKeySpace.length).to.equal(21);
    });

    it('should get middle hash key space', function () {
      const hashKeySpace = entityManager.getHashKeySpace(
        'user',
        now + day,
        now + day,
      );

      expect(hashKeySpace.length).to.equal(4);
    });

    it('should get empty hash key space', function () {
      const hashKeySpace = entityManager.getHashKeySpace(
        'user',
        now + day,
        now,
      );

      expect(hashKeySpace.length).to.equal(0);
    });
  });

  describe('rehydratePageKeyMep', function () {
    let item0, item1, item2, item3: UserItem;
    let pageKeyMap: PageKeyMap<UserItem>;

    beforeEach(function () {
      [item0, item1, item2, item3] = getUsers(4) as UserItem[];

      item0.hashKey = 'user!0';
      item1.hashKey = 'user!1';
      item2.hashKey = 'user!2';
      item3.hashKey = 'user!3';

      entityManager.updateItemGeneratedProperties(item0, 'user');
      entityManager.updateItemGeneratedProperties(item1, 'user');
      entityManager.updateItemGeneratedProperties(item2, 'user');
      entityManager.updateItemGeneratedProperties(item3, 'user');

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
      const dehydrated = entityManager.dehydratePageKeyMap(pageKeyMap, 'user');
      const rehydrated = entityManager.rehydratePageKeyMap(
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

      const dehydrated = entityManager.dehydratePageKeyMap(pageKeyMap, 'user');
      const rehydrated = entityManager.rehydratePageKeyMap(
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

      const dehydrated = entityManager.dehydratePageKeyMap(pageKeyMap, 'user');
      const rehydrated = entityManager.rehydratePageKeyMap(
        dehydrated,
        'user',
        ['firstName', 'lastName'],
        now + day,
        now + day,
      );

      expect(rehydrated).to.deep.equal({});
    });
  });

  describe('query', function () {
    let users: UserItem[];
    let mockDb: MockDb<UserItem>;
    let lastNameQuery: ShardQueryFunction<UserItem, 'user', MyEntityMap>;
    let firstNameQuery: ShardQueryFunction<UserItem, 'user', MyEntityMap>;

    before(function () {
      users = getUsers(1000, 0, 2).map((user) =>
        entityManager.updateItemGeneratedProperties(user as UserItem, 'user'),
      );

      mockDb = new MockDb(users);

      lastNameQuery = async (shardedKey, pageKey, pageSize) =>
        (await mockDb.query({
          hashKey: 'hashKey',
          hashValue: shardedKey,
          indexComponents: entityManager.config.entities.user.indexes.lastName,
          limit: pageSize,
          pageKey,
          sortKey: 'lastName',
        })) as ShardQueryResult<UserItem, 'user', MyEntityMap>;

      firstNameQuery = async (shardedKey, pageKey, pageSize) =>
        (await mockDb.query({
          hashKey: 'hashKey',
          hashValue: shardedKey,
          indexComponents: entityManager.config.entities.user.indexes.firstName,
          limit: pageSize,
          pageKey,
          sortKey: 'firstName',
        })) as ShardQueryResult<UserItem, 'user', MyEntityMap>;
    });

    it('simple query', async function () {
      let result = await entityManager.query({
        entity: 'user',
        hashKey: 'hashKey',
        queryMap: { lastName: lastNameQuery },
      });

      expect(result.count).to.equal(
        entityManager.config.entities.user.defaultLimit,
      );

      result = await entityManager.query({
        entity: 'user',
        hashKey: 'hashKey',
        pageKeyMap: result.pageKeyMap,
        queryMap: { lastName: lastNameQuery },
      });

      expect(result.count).to.equal(
        entityManager.config.entities.user.defaultLimit,
      );
    });

    it('simple sharded query', async function () {
      let result = await entityManager.query({
        entity: 'user',
        hashKey: 'hashKey',
        queryMap: { lastName: lastNameQuery },
        timestampFrom: now,
        timestampTo: now + day,
      });

      expect(result.count).to.equal(
        entityManager.config.entities.user.defaultLimit * 5,
      );

      result = await entityManager.query({
        entity: 'user',
        hashKey: 'hashKey',
        pageKeyMap: result.pageKeyMap,
        queryMap: { lastName: lastNameQuery },
        timestampFrom: now,
        timestampTo: now + day,
      });

      expect(result.count).to.equal(
        entityManager.config.entities.user.defaultLimit * 5,
      );
    });

    it('complex query', async function () {
      let result = await entityManager.query({
        entity: 'user',
        hashKey: 'hashKey',
        queryMap: { lastName: lastNameQuery, firstName: firstNameQuery },
      });

      expect(result.count).to.be.greaterThan(
        entityManager.config.entities.user.defaultLimit,
      );

      result = await entityManager.query({
        entity: 'user',
        hashKey: 'hashKey',
        pageKeyMap: result.pageKeyMap,
        queryMap: { lastName: lastNameQuery, firstName: firstNameQuery },
      });

      expect(result.count).to.be.greaterThan(
        entityManager.config.entities.user.defaultLimit,
      );
    });

    it('complex sharded query', async function () {
      let result = await entityManager.query({
        entity: 'user',
        hashKey: 'hashKey',
        queryMap: { lastName: lastNameQuery, firstName: firstNameQuery },
        timestampFrom: now,
        timestampTo: now + day,
      });

      expect(result.count).to.be.greaterThan(
        entityManager.config.entities.user.defaultLimit * 5,
      );

      result = await entityManager.query({
        entity: 'user',
        hashKey: 'hashKey',
        pageKeyMap: result.pageKeyMap,
        queryMap: { lastName: lastNameQuery, firstName: firstNameQuery },
        sortOrder: [
          { property: 'lastNameCanonical', desc: true },
          { property: 'firstNameCanonical' },
        ],
        timestampFrom: now,
        timestampTo: now + day,
      });

      expect(result.count).to.be.greaterThan(
        entityManager.config.entities.user.defaultLimit * 5,
      );
    });
  });
});
