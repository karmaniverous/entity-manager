/* eslint-env mocha */

import { MockDb } from '@karmaniverous/mock-db';
import { expect } from 'chai';

import { config, day, MyEntityMap, now, type UserItem } from '../test/config';
import { getUsers } from '../test/users';
import { addKeys } from './addKeys';
import { EntityManager } from './EntityManager';
import type { ShardQueryFunction } from './ShardQueryFunction';
import type { ShardQueryResult } from './ShardQueryResult';

const entityManager = new EntityManager(config);

describe('query', function () {
  let users: UserItem[];
  let mockDb: MockDb<UserItem>;
  let lastNameQuery: ShardQueryFunction<UserItem, 'user', MyEntityMap>;
  let firstNameQuery: ShardQueryFunction<UserItem, 'user', MyEntityMap>;

  before(function () {
    users = getUsers(1000, 0, 2).map((user) =>
      addKeys(entityManager, user as UserItem, 'user'),
    );

    mockDb = new MockDb(users);

    lastNameQuery = async (shardedKey, pageKey, pageSize) =>
      (await mockDb.query({
        hashKey: 'hashKey2',
        hashValue: shardedKey,
        indexComponents: entityManager.config.entities.user.indexes
          .lastName as (keyof UserItem)[],
        limit: pageSize,
        pageKey,
        sortOrder: [{ property: 'lastNameCanonical' }],
      })) as ShardQueryResult<UserItem, 'user', MyEntityMap>;

    firstNameQuery = async (shardedKey, pageKey, pageSize) =>
      (await mockDb.query({
        hashKey: 'hashKey2',
        hashValue: shardedKey,
        indexComponents: entityManager.config.entities.user.indexes
          .firstName as (keyof UserItem)[],
        limit: pageSize,
        pageKey,
        sortOrder: [{ property: 'firstNameCanonical' }],
      })) as ShardQueryResult<UserItem, 'user', MyEntityMap>;
  });

  it('simple query', async function () {
    let result = await entityManager.query({
      entityToken: 'user',
      hashKey: 'hashKey2',
      queryMap: { lastName: lastNameQuery },
    });

    expect(result.count).to.equal(
      entityManager.config.entities.user.defaultLimit,
    );

    result = await entityManager.query({
      entityToken: 'user',
      hashKey: 'hashKey2',
      pageKeyMap: result.pageKeyMap,
      queryMap: { lastName: lastNameQuery },
    });

    expect(result.count).to.equal(
      entityManager.config.entities.user.defaultLimit,
    );
  });

  it('simple sharded query', async function () {
    let result = await entityManager.query({
      entityToken: 'user',
      hashKey: 'hashKey2',
      queryMap: { lastName: lastNameQuery },
      timestampFrom: now,
      timestampTo: now + day,
    });

    expect(result.count).to.equal(
      entityManager.config.entities.user.defaultLimit * 5,
    );

    result = await entityManager.query({
      entityToken: 'user',
      hashKey: 'hashKey2',
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
      entityToken: 'user',
      hashKey: 'hashKey2',
      queryMap: { lastName: lastNameQuery, firstName: firstNameQuery },
    });

    expect(result.count).to.be.greaterThan(
      entityManager.config.entities.user.defaultLimit,
    );

    result = await entityManager.query({
      entityToken: 'user',
      hashKey: 'hashKey2',
      pageKeyMap: result.pageKeyMap,
      queryMap: { lastName: lastNameQuery, firstName: firstNameQuery },
    });

    expect(result.count).to.be.greaterThan(
      entityManager.config.entities.user.defaultLimit,
    );
  });

  it('complex sharded query', async function () {
    let result = await entityManager.query({
      entityToken: 'user',
      hashKey: 'hashKey2',
      queryMap: { lastName: lastNameQuery, firstName: firstNameQuery },
      timestampFrom: now,
      timestampTo: now + day,
    });

    expect(result.count).to.be.greaterThan(
      entityManager.config.entities.user.defaultLimit * 5,
    );

    result = await entityManager.query({
      entityToken: 'user',
      hashKey: 'hashKey2',
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
