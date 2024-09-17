import {
  type Exactify,
  sort,
  type TranscodeMap,
} from '@karmaniverous/entity-tools';
import lzString from 'lz-string';
import { isInt, parallel, unique } from 'radash';

import type { EntityMap, ItemMap } from './Config';
import { dehydratePageKeyMap } from './dehydratePageKeyMap';
import { EntityManager } from './EntityManager';
import type { QueryOptions } from './QueryOptions';
import type { QueryResult } from './QueryResult';
import { rehydratePageKeyMap } from './rehydratePageKeyMap';
import { validateEntityGeneratedProperty } from './validateEntityGeneratedProperty';
import type { WorkingQueryResult } from './WorkingQueryResult';

const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } =
  lzString;

/**
 * Query a database entity across shards in a provider-generic fashion.
 *
 * @remarks
 * The provided {@link ShardQueryFunction | `ShardQueryFunction`} performs the actual query of individual data pages on individual shards. This function is presumed to express provider-specific query logic, including any necessary indexing or search constraints.
 *
 * Individual shard query results will be combined, deduped by {@link ConfigEntity.uniqueProperty} property value, and sorted by {@link QueryOptions.sortOrder | `sortOrder`}.
 *
 * In queries on sharded data, expect the leading and trailing edges of returned data pages to interleave somewhat with preceding & following pages.
 *
 * Unsharded query results should sort & page as expected.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param options - {@link QueryOptions | `QueryOptions`} object.
 *
 * @returns {@link QueryResult} object.
 *
 * @throws Error if {@link QueryOptions.pageKeyMap | `pageKeyMap`} keys do not match {@link QueryOptions.queryMap | `queryMap`} keys.
 */
export async function query<
  Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  T extends TranscodeMap,
>(
  entityManager: EntityManager<M, HashKey, RangeKey, T>,
  {
    entityToken,
    hashKey,
    item,
    limit,
    pageKeyMap,
    pageSize,
    queryMap,
    sortOrder = [],
    timestampFrom = 0,
    timestampTo = Date.now(),
    throttle = entityManager.config.throttle,
  }: QueryOptions<Item, EntityToken, M, HashKey, RangeKey, T>,
): Promise<QueryResult<Item, EntityToken, M, HashKey, RangeKey>> {
  try {
    // Get defaults.
    const { defaultLimit, defaultPageSize } =
      entityManager.config.entities[entityToken];
    limit ??= defaultLimit;
    pageSize ??= defaultPageSize;

    // Validate params.
    validateEntityGeneratedProperty(entityManager, entityToken, hashKey, true);

    if (!(limit === Infinity || (isInt(limit) && limit >= 1)))
      throw new Error('limit must be a positive integer or Infinity.');

    if (!(isInt(pageSize) && pageSize >= 1))
      throw new Error('pageSize must be a positive integer');

    // Rehydrate pageKeyMap.
    const rehydratedPageKeyMap = rehydratePageKeyMap(
      entityManager,
      pageKeyMap
        ? (JSON.parse(
            decompressFromEncodedURIComponent(pageKeyMap),
          ) as string[])
        : undefined,
      entityToken,
      Object.keys(queryMap),
      timestampFrom,
      timestampTo,
    );

    // Shortcut if pageKeyMap is empty.
    if (!Object.keys(rehydratedPageKeyMap).length)
      return {
        count: 0,
        items: [],
        pageKeyMap: compressToEncodedURIComponent(JSON.stringify([])),
      };

    // Iterate search over pages.
    let workingResult = {
      items: [],
      pageKeyMap: rehydratedPageKeyMap,
    } as WorkingQueryResult<Item, EntityToken, M, HashKey, RangeKey>;

    do {
      // TODO: This loop will blow up as shards scale, since at a minimum it will return shardCount * pageSize
      // items, which may be >> limit. Probably the way to fix entityManager is to limit the number of shards queried per
      // iteration in order to keep shardsQueried * pageSize > (limit - items.length) but only just.

      // TODO: Test for invalid characters (path delimiters) in index keys & shard key values.

      // Query every shard on every index in pageKeyMap.
      const shardQueryResults = await parallel(
        throttle,
        Object.entries(rehydratedPageKeyMap).flatMap(([index, indexPageKeys]) =>
          Object.entries(indexPageKeys).map(([hashKey, pageKey]) => [
            index,
            hashKey,
            pageKey,
          ]),
        ) as [string, string, Item | undefined][],
        async ([index, hashKey, pageKey]: [
          string,
          string,
          Item | undefined,
        ]) => ({
          index,
          queryResult: await queryMap[index](hashKey, pageKey, pageSize),
          hashKey,
        }),
      );

      // Reduce shardQueryResults & updateworkingRresult.
      workingResult = shardQueryResults.reduce<
        WorkingQueryResult<Item, EntityToken, M, HashKey, RangeKey>
      >(({ items, pageKeyMap }, { index, queryResult, hashKey }) => {
        Object.assign(rehydratedPageKeyMap[index], {
          [hashKey]: queryResult.pageKey,
        });

        return {
          items: [...items, ...queryResult.items],
          pageKeyMap,
        };
      }, workingResult);
    } while (
      // Repeat while pages remain & limit is not reached.
      Object.values(workingResult.pageKeyMap).some((indexPageKeys) =>
        Object.values(indexPageKeys).some((pageKey) => pageKey !== undefined),
      ) &&
      workingResult.items.length < limit
    );

    // Dedupe & sort working result.
    workingResult.items = sort(
      unique(workingResult.items, (item) =>
        (
          item[
            entityManager.config.entities[entityToken]
              .uniqueProperty as keyof Item
          ] as string | number
        ).toString(),
      ),
      sortOrder,
    );

    const result = {
      count: workingResult.items.length,
      items: workingResult.items,
      pageKeyMap: compressToEncodedURIComponent(
        JSON.stringify(
          dehydratePageKeyMap(
            entityManager,
            workingResult.pageKeyMap,
            entityToken,
          ),
        ),
      ),
    } as QueryResult<Item, EntityToken, M, HashKey, RangeKey>;

    console.debug('queried entityToken across shards', {
      entityToken,
      hashKey,
      item,
      limit,
      pageKeyMap,
      pageSize,
      queryMap,
      timestampFrom,
      timestampTo,
      throttle,
      rehydratedPageKeyMap,
      workingResult,
      result,
    });

    return result;
  } catch (error) {
    if (error instanceof Error)
      console.error(error.message, {
        entityToken,
        hashKey,
        item,
        limit,
        pageKeyMap,
        pageSize,
        queryMap,
        timestampFrom,
        timestampTo,
        throttle,
      });

    throw error;
  }
}
