import { MockDb } from '@karmaniverous/mock-db';
import { beforeAll, describe, expect, it } from 'vitest';

import {
  day,
  entityManager,
  type Item,
  type MyConfigMap,
  now,
} from '../../test/config';
import { getUsers } from '../../test/users';
import { addKeys } from './addKeys';
import { getIndexComponents } from './getIndexComponents';
import type { PageKey } from './PageKey';
import { query } from './query';
import type { ShardQueryFunction } from './ShardQueryFunction';
import type { ShardQueryMap } from './ShardQueryMap';

describe('query', function () {
  let users: Item[];
  let mockDb: MockDb<Item>;
  let lastNameQuery: ShardQueryFunction<MyConfigMap, 'user', 'lastName'>;
  let firstNameQuery: ShardQueryFunction<MyConfigMap, 'user', 'firstName'>;
  let mapLN: ShardQueryMap<MyConfigMap, 'user', 'lastName'>;
  let mapBoth: ShardQueryMap<MyConfigMap, 'user', 'lastName' | 'firstName'>;

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

    // Typed shard query maps (single and multi-index)
    mapLN = { lastName: lastNameQuery };
    mapBoth = { lastName: lastNameQuery, firstName: firstNameQuery };
  });

  it('simple query', async function () {
    let result = await query(entityManager, {
      entityToken: 'user',
      item: {},
      shardQueryMap: mapLN,
    });

    expect(result.count).to.equal(
      entityManager.config.entities.user.defaultLimit,
    );

    result = await query(entityManager, {
      entityToken: 'user',
      item: {},
      pageKeyMap: result.pageKeyMap,
      shardQueryMap: mapLN,
    });

    expect(result.count).to.equal(
      entityManager.config.entities.user.defaultLimit,
    );
  });

  it('simple sharded query', async function () {
    let result = await query(entityManager, {
      entityToken: 'user',
      item: {},
      shardQueryMap: mapLN,
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
      shardQueryMap: mapLN,
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
      shardQueryMap: mapBoth,
    });

    expect(result.count).to.be.greaterThan(
      entityManager.config.entities.user.defaultLimit,
    );

    result = await query(entityManager, {
      entityToken: 'user',
      item: {},
      pageKeyMap: result.pageKeyMap,
      shardQueryMap: mapBoth,
    });

    expect(result.count).to.be.greaterThan(
      entityManager.config.entities.user.defaultLimit,
    );
  });

  it('complex sharded query', async function () {
    let result = await query(entityManager, {
      entityToken: 'user',
      item: {},
      shardQueryMap: mapBoth,
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
      shardQueryMap: mapBoth,
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
