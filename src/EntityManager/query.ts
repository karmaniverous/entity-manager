import { sort } from '@karmaniverous/entity-tools';
import lzString from 'lz-string';
import { isInt, parallel, unique } from 'radash';

import type { BaseConfigMap } from './BaseConfigMap';
import { dehydratePageKeyMap } from './dehydratePageKeyMap';
import type { EntityManager } from './EntityManager';
import type { EntityToken } from './EntityToken';
import type { PageKeyByIndex } from './PageKey';
import type { QueryOptions } from './QueryOptions';
import type { QueryResult } from './QueryResult';
import { rehydratePageKeyMap } from './rehydratePageKeyMap';
import type { EntityItem as DomainItem, EntityItemPartial } from './TokenAware';
import type { WorkingQueryResult } from './WorkingQueryResult';

const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } =
  lzString;

/**
 * Query a database entity across shards in a provider-generic fashion.
 *
 * @remarks
 * The provided {@link ShardQueryFunction | `ShardQueryFunction`} performs the actual query of individual data pages on individual shards. This function is presumed to express provider-specific query logic, including any necessary indexing or search constraints.
 *
 * Individual shard query results will be combined, deduped by {@link Config.uniqueProperty} property value, and sorted by {@link QueryOptions.sortOrder | `sortOrder`}.
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
 * @throws Error if {@link QueryOptions.pageKeyMap | `pageKeyMap`} keys do not match {@link QueryOptions.shardQueryMap | `shardQueryMap`} keys.
 */
export async function query<
  C extends BaseConfigMap,
  ET extends EntityToken<C>,
  ITS extends string,
  CF = unknown,
  K = unknown,
>(
  entityManager: EntityManager<C>,
  options: QueryOptions<C, ET, ITS, CF, K>,
): Promise<QueryResult<C, ET, ITS, K>> {
  try {
    // Get defaults (avoid unsafe destructuring on generic access).
    const entityDefaults = entityManager.config.entities[options.entityToken];
    const defaultLimit = entityDefaults.defaultLimit;
    const defaultPageSize = entityDefaults.defaultPageSize;

    // Extract params.
    const {
      entityToken,
      limit = defaultLimit,
      item,
      pageKeyMap,
      pageSize = defaultPageSize,
      shardQueryMap,
      sortOrder = [],
      timestampFrom = 0,
      timestampTo = Date.now(),
      throttle = entityManager.config.throttle,
    } = options;

    // Validate params.
    if (!(limit === Infinity || (isInt(limit) && limit >= 1)))
      throw new Error('limit must be a positive integer or Infinity.');

    if (!(isInt(pageSize) && pageSize >= 1))
      throw new Error('pageSize must be a positive integer');

    // Rehydrate pageKeyMap.
    const [hashKeyToken, rehydratedPageKeyMap] = rehydratePageKeyMap<
      C,
      ET,
      ITS,
      CF
    >(
      entityManager,
      entityToken,
      Object.keys(shardQueryMap) as ITS[],
      item,
      pageKeyMap
        ? (JSON.parse(
            decompressFromEncodedURIComponent(pageKeyMap),
          ) as string[])
        : undefined,
      timestampFrom,
      timestampTo,
    );

    // Shortcut if pageKeyMap is empty.
    if (!Object.keys(rehydratedPageKeyMap).length)
      return {
        count: 0,
        items: [],
        pageKeyMap: compressToEncodedURIComponent(JSON.stringify([])),
      } as QueryResult<C, ET, ITS>;

    // Iterate search over pages.
    let workingResult = {
      items: [],
      pageKeyMap: rehydratedPageKeyMap,
    } as WorkingQueryResult<C, ET, ITS, K>;

    do {
      // TODO: This loop will blow up as shards scale, since at a minimum it will return shardCount * pageSize
      // items, which may be >> limit. Probably the way to fix entityManager is to limit the number of shards queried per
      // iteration in order to keep shardsQueried * pageSize > (limit - items.length) but only just.

      // TODO: Test for invalid characters (path delimiters) in index keys & shard key values.

      // Build typed tasks (indexToken, hashKey, pageKey).
      const tasks: [ITS, string, PageKeyByIndex<C, ET, ITS, CF> | undefined][] =
        [];
      for (const [indexToken, indexPageKeys] of Object.entries(
        rehydratedPageKeyMap,
      ) as [
        ITS,
        Record<string, PageKeyByIndex<C, ET, ITS, CF> | undefined>,
      ][]) {
        for (const [hashKey, pk] of Object.entries(indexPageKeys)) {
          tasks.push([indexToken, hashKey, pk]);
        }
      }

      // Query every shard on every index in pageKeyMap.
      const shardQueryResults = await parallel(
        throttle,
        tasks,
        async ([indexToken, hashKey, pageKey]: [
          ITS,
          string,
          PageKeyByIndex<C, ET, ITS, CF> | undefined,
        ]) => ({
          indexToken,
          queryResult: await shardQueryMap[indexToken](
            hashKey,
            pageKey,
            pageSize,
          ),
          hashKey,
        }),
      );

      // Reduce shardQueryResults & update working result.
      workingResult = shardQueryResults.reduce<
        WorkingQueryResult<C, ET, ITS, K>
      >(({ items, pageKeyMap }, { indexToken, queryResult, hashKey }) => {
        Object.assign(rehydratedPageKeyMap[indexToken], {
          [hashKey]: queryResult.pageKey,
        });

        return {
          items: [...items, ...queryResult.items],
          pageKeyMap,
        };
      }, workingResult);

      // Repeat while pages remain & limit is not reached.
      let pagesRemain = false;
      for (const idx of Object.keys(workingResult.pageKeyMap) as ITS[]) {
        const inner = workingResult.pageKeyMap[idx];
        for (const h of Object.keys(inner)) {
          if (inner[h] !== undefined) {
            pagesRemain = true;
            break;
          }
        }
        if (pagesRemain) break;
      }

      if (!pagesRemain) break;
    } while (workingResult.items.length < limit);

    // Dedupe & sort working result.
    // Note: when projecting, callers may omit uniqueProperty/sort keys.
    // We perform operations on the full item shape and then cast back.
    const itemsForOps = workingResult.items as unknown as DomainItem<C, ET>[];
    const dedupedSorted = sort(
      unique(itemsForOps, (i) =>
        (
          i[
            entityManager.config.entities[entityToken]
              .uniqueProperty as keyof DomainItem<C, ET>
          ] as string | number
        ).toString(),
      ),
      sortOrder as unknown as import('@karmaniverous/entity-tools').SortOrder<
        DomainItem<C, ET>
      >,
    ) as unknown as EntityItemPartial<C, ET, K>[];
    workingResult.items = dedupedSorted;

    const result = {
      count: workingResult.items.length,
      items: workingResult.items,
      pageKeyMap: compressToEncodedURIComponent(
        JSON.stringify(
          dehydratePageKeyMap<C, ET, ITS, CF>(
            entityManager,
            entityToken,
            workingResult.pageKeyMap,
          ),
        ),
      ),
    } as QueryResult<C, ET, ITS, K>;

    entityManager.logger.debug('queried entityToken across shards', {
      options,
      hashKeyToken,
      rehydratedPageKeyMap,
      workingResult,
      result,
    });

    return result;
  } catch (error) {
    if (error instanceof Error)
      entityManager.logger.error(error.message, options);

    throw error;
  }
}
