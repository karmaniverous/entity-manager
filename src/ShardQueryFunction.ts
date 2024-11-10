import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityItem } from './EntityItem';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityManager } from './EntityManager';
import type { ShardQueryResult } from './ShardQueryResult';

/**
 * A query function that returns a single page of results from an individual
 * shard. This function will typically be composed dynamically to express a
 * specific query index & logic. The arguments to this function will be
 * provided by the {@link EntityManager.query | `EntityManager.query`} method, which assembles many returned
 * pages queried across multiple shards into a single query result.
 *
 * @typeParam Item - The {@link Item | `Item`} type being queried. 

 * @param hashKey - The hash key value of the shard being queried.
 * @param pageKey - The page key returned by the previous query on this shard.
 * @param pageSize - The maximum number of items to return from this query.
 *
 * @category Query
 */
export type ShardQueryFunction<C extends BaseConfigMap> = (
  hashKey: string,
  pageKey?: EntityItem<C>,
  pageSize?: number,
) => Promise<ShardQueryResult<C>>;
