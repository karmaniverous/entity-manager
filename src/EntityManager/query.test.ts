import { MockDb } from '@karmaniverous/mock-db';
import { beforeAll, describe, expect, it } from 'vitest';

import { day, entityManager, type Item, now } from '../../test/config';
import { getUsers } from '../../test/users';
import { addKeys } from './addKeys';
import type { MyConfigMap } from './Config.types';
import { getIndexComponents } from './getIndexComponents';
import type { PageKey } from './PageKey';
import { query } from './query';
import type { ShardQueryFunction } from './ShardQueryFunction';

describe('query', function () {
  let users: Item[];
  let mockDb: MockDb<Item>;
  let lastNameQuery: ShardQueryFunction<MyConfigMap, 'user', 'lastName'>;
  let firstNameQuery: ShardQueryFunction<MyConfigMap, 'user', 'firstName'>;

  beforeAll(function () {
    users = getUsers(1000, 0, 2).map((user) =>
      addKeys(entityManager, 'user', user as Item),
    );

    mockDb = new MockDb(users);

    const firstNameIndexComponents = getIndexComponents(
      entityManager,
      'firstName',
    );

    const lastNameIndexComponents = getIndexComponents(
      entityManager,
      'lastName',
    );

    lastNameQuery = async (
      shardedKey: string,
      pageKey?: PageKey<MyConfigMap>,
      pageSize?: number,
    ) =>
      await mockDb.query({
        hashKey: 'hashKey2',
        hashValue: shardedKey,
        indexComponents: lastNameIndexComponents,
        limit: pageSize,
        pageKey,
        sortOrder: [{ property: 'lastNameCanonical' }],
      });

    firstNameQuery = async (
      shardedKey: string,
      pageKey?: PageKey<MyConfigMap>,
      pageSize?: number,
    ) =>
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
    let result = await query(entityManager, {
      entityToken: 'user',
      item: {},
      shardQueryMap: { lastName: lastNameQuery },
    });

    expect(result.count).to.equal(
      entityManager.config.entities.user.defaultLimit,
    );

    result = await query(entityManager, {
      entityToken: 'user',
      item: {},
      pageKeyMap: result.pageKeyMap,
      shardQueryMap: { lastName: lastNameQuery },
    });

    expect(result.count).to.equal(
      entityManager.config.entities.user.defaultLimit,
    );
  });

  it('simple sharded query', async function () {
    let result = await query(entityManager, {
      entityToken: 'user',
      item: {},
      shardQueryMap: { lastName: lastNameQuery },
      timestampFrom: now,
      timestampTo: now + day,
    });

    expect(result.count).to.equal(
      entityManager.config.entities.user.defaultLimit * 5,
    );

    result = await query(entityManager, {
      entityToken: 'user',
      item: {},
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
    let result = await query(entityManager, {
      entityToken: 'user',
      item: {},
      shardQueryMap: { lastName: lastNameQuery, firstName: firstNameQuery },
    });

    expect(result.count).to.be.greaterThan(
      entityManager.config.entities.user.defaultLimit,
    );

    result = await query(entityManager, {
      entityToken: 'user',
      item: {},
      pageKeyMap: result.pageKeyMap,
      shardQueryMap: { lastName: lastNameQuery, firstName: firstNameQuery },
    });

    expect(result.count).to.be.greaterThan(
      entityManager.config.entities.user.defaultLimit,
    );
  });

  it('complex sharded query', async function () {
    let result = await query(entityManager, {
      entityToken: 'user',
      item: {},
      shardQueryMap: { lastName: lastNameQuery, firstName: firstNameQuery },
      timestampFrom: now,
      timestampTo: now + day,
    });

    expect(result.count).to.be.greaterThan(
      entityManager.config.entities.user.defaultLimit * 5,
    );

    result = await query(entityManager, {
      entityToken: 'user',
      item: {},
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
