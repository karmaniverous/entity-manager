/* eslint-env mocha */

import { MockDb } from '@karmaniverous/mock-db';
import { n2e } from '@karmaniverous/string-utilities';
import { expect } from 'chai';
import { pick } from 'radash';
import { inspect } from 'util';

import { config, day, now } from '../test/config';
import { getUsers, User } from '../test/users';
import {
  emptyPageKeyMap,
  EntityManager,
  PageKeyMap,
  ShardQueryFunction,
  ShardQueryResult,
} from './EntityManager';
import { type EntityIndexItem } from './util';

const entity = 'user';

let entityManager: EntityManager;
let users: User[];
let mockDb: MockDb<User>;

describe('EntityManager', function () {
  beforeEach(function () {
    entityManager = new EntityManager({
      config,
      logger: {
        ...console,
        debug: (...args: unknown[]) => {
          console.debug(...args.map((arg) => inspect(arg, false, null)));
        },
      },
    });

    users = getUsers(100, 0, 2).map((user) =>
      entityManager.addKeys(entity, user),
    );

    mockDb = new MockDb(users);
  });

  describe('addKeys', function () {
    it('should add unsharded keys to item', function () {
      const item = getUsers()[0];

      const result = entityManager.addKeys(entity, item);

      const extendedItem = { ...item, entity };

      expect(result).to.deep.include({
        entityPK:
          entityManager.config.entities.user.keys.entityPK.encode(extendedItem),
        entitySK:
          entityManager.config.entities.user.keys.entitySK.encode(extendedItem),
        firstNameSK:
          entityManager.config.entities.user.keys.firstNameSK.encode(
            extendedItem,
          ),
        lastNameSK:
          entityManager.config.entities.user.keys.lastNameSK.encode(
            extendedItem,
          ),
      });
    });

    it('should add sharded keys to item', function () {
      const item = getUsers(1, 1)[0];

      const result = entityManager.addKeys(entity, item);

      expect(result).to.have.property('shardKey').with.length(1);
      expect(result.entityPK).to.match(/user![0-3]/);
    });

    it('should re-use existing shard key', function () {
      const item = { ...getUsers(1, 1)[0], shardKey: 'q' };

      const result = entityManager.addKeys(entity, item);

      expect(result.shardKey).to.equal('q');
      expect(result.entityPK).to.equal('user!q');
    });

    it('should perform sharded overwrite', function () {
      const item = { ...getUsers(1, 1)[0], shardKey: 'q' };

      const result = entityManager.addKeys(entity, item, true);

      expect(result).to.have.property('shardKey').with.length(1);
      expect(result.entityPK).to.match(/user![0-3]/);
    });
  });

  describe('removeKeys', function () {
    it('should remove unsharded keys from item', function () {
      const item = getUsers()[0];

      const result = entityManager.removeKeys(
        entity,
        entityManager.addKeys(entity, item),
      );

      expect(result).to.deep.equal(item);
    });

    it('should remove sharded keys from item', function () {
      const item = getUsers(1, 1)[0];

      const result = entityManager.removeKeys(
        entity,
        entityManager.addKeys(entity, item),
      );

      expect(result).to.deep.equal(item);
    });
  });

  describe('getKeySpace', function () {
    it('should return unsharded key space', function () {
      const item = getUsers()[0];

      const result = entityManager.getKeySpace(entity, 'entityPK', item);

      const extendedItem = { ...item, entity };

      expect(result).to.deep.equal([
        entityManager.config.entities.user.keys.entityPK.encode(extendedItem),
      ]);
    });

    it('should return sharded key space', function () {
      const item = getUsers()[0];

      const result = entityManager.getKeySpace(
        entity,
        'entityPK',
        item,
        0,
        now + day,
      );

      expect(result.length).to.equal(5);
    });
  });

  describe('dehydrateIndex', function () {
    it('should dehydrate unsharded index', function () {
      const item = getUsers()[0];

      const result = entityManager.dehydrateIndex(
        entity,
        'firstName',
        entityManager.addKeys(entity, item),
      );

      expect(result).to.equal(
        n2e`${entity}~${item.firstNameCanonical}~${item.lastNameCanonical}~~${item.userId}`,
      );
    });

    it('should dehydrate sharded index', function () {
      const item = getUsers(1, 1)[0];

      const result = entityManager.dehydrateIndex(
        entity,
        'firstName',
        entityManager.addKeys(entity, item),
      );

      expect(result).to.match(
        new RegExp(
          n2e`${entity}~${item.firstNameCanonical}~${item.lastNameCanonical}~\\d~${item.userId}`,
        ),
      );
    });
  });

  describe('rehydrateIndex', function () {
    it('should rehydrate unsharded index', function () {
      const item = getUsers()[0];

      const itemWithKeys = entityManager.addKeys(entity, item);

      const dehydrated = entityManager.dehydrateIndex(
        entity,
        'firstName',
        itemWithKeys,
      );

      const rehydrated = entityManager.rehydrateIndex(
        entity,
        'firstName',
        dehydrated,
      );

      expect(itemWithKeys).to.deep.include(rehydrated);
    });

    it('should rehydrate sharded index', function () {
      const item = getUsers(1, 1)[0];

      const itemWithKeys = entityManager.addKeys(entity, item);

      const dehydrated = entityManager.dehydrateIndex(
        entity,
        'firstName',
        itemWithKeys,
      );

      const rehydrated = entityManager.rehydrateIndex(
        entity,
        'firstName',
        dehydrated,
      );

      expect(itemWithKeys).to.deep.include(rehydrated);
    });
  });

  describe('compressPageKeyMap', function () {
    it('should compress simple unsharded page key map', function () {
      const item = entityManager.addKeys(entity, getUsers()[0]);

      const pageKeyMap: PageKeyMap = {
        firstName: {
          [`${entity}!`]: pick(
            item,
            entityManager.config.entities.user.indexes.firstName,
          ) as EntityIndexItem,
        },
      };

      const compressed = entityManager.compressPageKeyMap(entity, pageKeyMap);

      expect(compressed.length).to.be.greaterThan(5);
    });

    it('should compress empty simple unsharded page key map', function () {
      const pageKeyMap: PageKeyMap = {
        firstName: {
          [`${entity}!`]: undefined,
        },
      };

      const compressed = entityManager.compressPageKeyMap(entity, pageKeyMap);

      expect(compressed).to.equal(emptyPageKeyMap);
    });

    it('should compress complex sharded page key map', function () {
      const item = entityManager.addKeys(entity, getUsers(1, 1)[0]);

      const pageKeyMap: PageKeyMap = {
        firstName: {
          [`${entity}!`]: pick(
            item,
            entityManager.config.entities.user.indexes.firstName,
          ) as EntityIndexItem,
          [`${entity}!0`]: pick(
            item,
            entityManager.config.entities.user.indexes.firstName,
          ) as EntityIndexItem,
          [`${entity}!1`]: pick(
            item,
            entityManager.config.entities.user.indexes.firstName,
          ) as EntityIndexItem,
          [`${entity}!2`]: pick(
            item,
            entityManager.config.entities.user.indexes.firstName,
          ) as EntityIndexItem,
          [`${entity}!3`]: pick(
            item,
            entityManager.config.entities.user.indexes.firstName,
          ) as EntityIndexItem,
        },
        lastName: {
          [`${entity}!`]: pick(
            item,
            entityManager.config.entities.user.indexes.lastName,
          ) as EntityIndexItem,
          [`${entity}!0`]: pick(
            item,
            entityManager.config.entities.user.indexes.lastName,
          ) as EntityIndexItem,
          [`${entity}!1`]: pick(
            item,
            entityManager.config.entities.user.indexes.lastName,
          ) as EntityIndexItem,
          [`${entity}!2`]: pick(
            item,
            entityManager.config.entities.user.indexes.lastName,
          ) as EntityIndexItem,
          [`${entity}!3`]: pick(
            item,
            entityManager.config.entities.user.indexes.lastName,
          ) as EntityIndexItem,
        },
      };

      const compressed = entityManager.compressPageKeyMap(entity, pageKeyMap);

      expect(compressed.length).to.be.greaterThan(5);
    });
  });

  describe('decompressPageKeyMap', function () {
    it('should compress simple unsharded page key map', function () {
      const item = entityManager.addKeys(entity, getUsers()[0]);

      const pageKeyMap: PageKeyMap = {
        firstName: {
          [`${entity}!`]: pick(
            item,
            entityManager.config.entities.user.indexes.firstName,
          ) as EntityIndexItem,
        },
      };

      const compressed = entityManager.compressPageKeyMap(entity, pageKeyMap);

      const decompressed = entityManager.decompressPageKeyMap(
        {
          entityToken: entity,
          item,
          keyToken: 'entityPK',
          pageKeyMap: compressed,
        },
        ['firstName'],
      );

      expect(decompressed).to.deep.equal(pageKeyMap);
    });

    it('should decompress empty simple unsharded page key map', function () {
      const item = entityManager.addKeys(entity, getUsers()[0]);

      const pageKeyMap: PageKeyMap = {
        firstName: {
          [`${entity}!`]: undefined,
        },
      };

      const compressed = entityManager.compressPageKeyMap(entity, pageKeyMap);

      const decompressed = entityManager.decompressPageKeyMap(
        {
          entityToken: entity,
          item,
          keyToken: 'entityPK',
          pageKeyMap: compressed,
        },
        ['firstName'],
      );

      expect(decompressed).to.deep.equal({});
    });

    it('should decompress complex sharded page key map', function () {
      const item = entityManager.addKeys(entity, getUsers(1, 1)[0]);

      const pageKeyMap: PageKeyMap = {
        firstName: {
          [`${entity}!`]: pick(
            item,
            entityManager.config.entities.user.indexes.firstName,
          ) as EntityIndexItem,
          [`${entity}!0`]: pick(
            item,
            entityManager.config.entities.user.indexes.firstName,
          ) as EntityIndexItem,
          [`${entity}!1`]: pick(
            item,
            entityManager.config.entities.user.indexes.firstName,
          ) as EntityIndexItem,
          [`${entity}!2`]: pick(
            item,
            entityManager.config.entities.user.indexes.firstName,
          ) as EntityIndexItem,
          [`${entity}!3`]: pick(
            item,
            entityManager.config.entities.user.indexes.firstName,
          ) as EntityIndexItem,
        },
        lastName: {
          [`${entity}!`]: pick(
            item,
            entityManager.config.entities.user.indexes.lastName,
          ) as EntityIndexItem,
          [`${entity}!0`]: pick(
            item,
            entityManager.config.entities.user.indexes.lastName,
          ) as EntityIndexItem,
          [`${entity}!1`]: pick(
            item,
            entityManager.config.entities.user.indexes.lastName,
          ) as EntityIndexItem,
          [`${entity}!2`]: pick(
            item,
            entityManager.config.entities.user.indexes.lastName,
          ) as EntityIndexItem,
          [`${entity}!3`]: pick(
            item,
            entityManager.config.entities.user.indexes.lastName,
          ) as EntityIndexItem,
        },
      };

      const compressed = entityManager.compressPageKeyMap(entity, pageKeyMap);

      const decompressed = entityManager.decompressPageKeyMap(
        {
          entityToken: entity,
          item,
          keyToken: 'entityPK',
          pageKeyMap: compressed,
          timestampFrom: 0,
          timestampTo: now + day,
        },
        ['firstName', 'lastName'],
      );

      expect(decompressed).to.deep.equal(pageKeyMap);
    });
  });

  let firstNameQuery: ShardQueryFunction;
  let lastNameQuery: ShardQueryFunction;

  describe('query', function () {
    beforeEach(function () {
      lastNameQuery = async (shardedKey, pageKey, pageSize) =>
        (await mockDb.query({
          hashKey: 'entityPK',
          hashValue: shardedKey,
          indexComponents: entityManager.config.entities.user.indexes.lastName,
          limit: pageSize,
          pageKey,
          sortKey: 'lastNameSK',
        })) as ShardQueryResult;

      firstNameQuery = async (shardedKey, pageKey, pageSize) =>
        (await mockDb.query({
          hashKey: 'entityPK',
          hashValue: shardedKey,
          indexComponents: entityManager.config.entities.user.indexes.firstName,
          limit: pageSize,
          pageKey,
          sortKey: 'firstNameSK',
        })) as ShardQueryResult;
    });

    it('simple query', async function () {
      let result = await entityManager.query({
        entityToken: entity,
        keyToken: 'entityPK',
        queryMap: { lastName: lastNameQuery },
      });

      expect(result.count).to.equal(
        entityManager.config.entities.user.defaultLimit,
      );

      result = await entityManager.query({
        entityToken: entity,
        keyToken: 'entityPK',
        pageKeyMap: result.pageKeyMap,
        queryMap: { lastName: lastNameQuery },
      });

      expect(result.count).to.equal(
        entityManager.config.entities.user.defaultLimit,
      );
    });

    it('simple sharded query', async function () {
      let result = await entityManager.query({
        entityToken: entity,
        keyToken: 'entityPK',
        queryMap: { lastName: lastNameQuery },
        timestampFrom: now,
        timestampTo: now + day,
      });

      expect(result.count).to.equal(
        entityManager.config.entities.user.defaultLimit * 5,
      );

      result = await entityManager.query({
        entityToken: entity,
        keyToken: 'entityPK',
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
        entityToken: entity,
        keyToken: 'entityPK',
        queryMap: { lastName: lastNameQuery, firstName: firstNameQuery },
      });

      expect(result.count).to.equal(
        entityManager.config.entities.user.defaultLimit * 2,
      );

      result = await entityManager.query({
        entityToken: entity,
        keyToken: 'entityPK',
        pageKeyMap: result.pageKeyMap,
        queryMap: { lastName: lastNameQuery, firstName: firstNameQuery },
      });

      expect(result.count).to.equal(
        entityManager.config.entities.user.defaultLimit * 2,
      );
    });

    it('complex sharded query', async function () {
      let result = await entityManager.query({
        entityToken: entity,
        keyToken: 'entityPK',
        queryMap: { lastName: lastNameQuery, firstName: firstNameQuery },
        timestampFrom: now,
        timestampTo: now + day,
      });

      expect(result.count).to.equal(
        entityManager.config.entities.user.defaultLimit * 10,
      );

      result = await entityManager.query({
        entityToken: entity,
        keyToken: 'entityPK',
        pageKeyMap: result.pageKeyMap,
        queryMap: { lastName: lastNameQuery, firstName: firstNameQuery },
        timestampFrom: now,
        timestampTo: now + day,
      });

      expect(result.count).to.equal(
        entityManager.config.entities.user.defaultLimit * 10,
      );
    });
  });
});
