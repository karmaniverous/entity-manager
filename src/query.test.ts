/* eslint-env mocha */

import { MockDb } from '@karmaniverous/mock-db';
import { expect } from 'chai';

import { config, day, now, type UserItem } from '../test/config';
import { getUsers } from '../test/users';
import { addKeys } from './addKeys';
import { EntityManager } from './EntityManager';
import { getIndexComponents } from './getIndexComponents';
import type { ShardQueryFunction } from './ShardQueryFunction';

const entityManager = new EntityManager(config);

describe('query', function () {
  let users: UserItem[];
  let mockDb: MockDb<UserItem>;
  let lastNameQuery: ShardQueryFunction<UserItem>;
  let firstNameQuery: ShardQueryFunction<UserItem>;

  before(function () {
    users = getUsers(1000, 0, 2).map((user) =>
      addKeys(entityManager, 'user', user as UserItem),
    ) as UserItem[];

    mockDb = new MockDb(users);

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

    lastNameQuery = async (shardedKey, pageKey, pageSize) =>
      await mockDb.query({
        hashKey: 'hashKey2',
        hashValue: shardedKey,
        indexComponents: lastNameIndexComponents,
        limit: pageSize,
        pageKey,
        sortOrder: [{ property: 'lastNameCanonical' }],
      });

    firstNameQuery = async (shardedKey, pageKey, pageSize) =>
      await mockDb.query({
        hashKey: 'hashKey2',
        hashValue: shardedKey,
        indexComponents: firstNameIndexComponents,
        limit: pageSize,
        pageKey,
        sortOrder: [{ property: 'firstNameCanonical' }],
      });
  });

  it('simple query', async function () {
    let result = await entityManager.query({
      entityToken: 'user',
      hashKey: 'hashKey2',
      shardQueryMap: { lastName: lastNameQuery },
    });

    expect(result.count).to.equal(
      entityManager.config.entities.user.defaultLimit,
    );

    result = await entityManager.query({
      entityToken: 'user',
      hashKey: 'hashKey2',
      pageKeyMap: result.pageKeyMap,
      shardQueryMap: { lastName: lastNameQuery },
    });

    expect(result.count).to.equal(
      entityManager.config.entities.user.defaultLimit,
    );
  });

  it('simple sharded query', async function () {
    let result = await entityManager.query({
      entityToken: 'user',
      hashKey: 'hashKey2',
      shardQueryMap: { lastName: lastNameQuery },
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
      shardQueryMap: { lastName: lastNameQuery },
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
      shardQueryMap: { lastName: lastNameQuery, firstName: firstNameQuery },
    });

    expect(result.count).to.be.greaterThan(
      entityManager.config.entities.user.defaultLimit,
    );

    result = await entityManager.query({
      entityToken: 'user',
      hashKey: 'hashKey2',
      pageKeyMap: result.pageKeyMap,
      shardQueryMap: { lastName: lastNameQuery, firstName: firstNameQuery },
    });

    expect(result.count).to.be.greaterThan(
      entityManager.config.entities.user.defaultLimit,
    );
  });

  it('complex sharded query', async function () {
    let result = await entityManager.query({
      entityToken: 'user',
      hashKey: 'hashKey2',
      shardQueryMap: { lastName: lastNameQuery, firstName: firstNameQuery },
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
      shardQueryMap: { lastName: lastNameQuery, firstName: firstNameQuery },
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
