import type { Exactify, SortOrder } from '@karmaniverous/entity-tools';

import type { EntityMap, ItemMap } from './Config';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityManager } from './EntityManager';
import { ShardQueryMap } from './ShardQueryMap';

/**
 * Options passed to the {@link query | `query`} function.
 *
 * @category Query
 */
export interface QueryOptions<
  Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
> {
  /** Identifies the entity to be queried. Key of {@link Config | `EntityManager.config.entities`}. */
  entityToken: EntityToken;

  /**
   * Partial item object sufficiently populated to generate index hash keys.
   */
  item: Partial<Item>;

  /**
   * The target maximum number of records to be returned by the query across
   * all shards.
   *
   * The actual number of records returned will be a product of {@link QueryOptions.pageSize | `pageSize`} and the
   * number of shards queried, unless limited by available records in a given
   * shard.
   */
  limit?: number;

  /**
   * {@link QueryResult.pageKeyMap | `pageKeyMap`} returned by the previous iteration of this query.
   */
  pageKeyMap?: string;

  /**
   * The maximum number of records to be returned by each individual query to a
   * single shard (i.e. {@link ShardQueryFunction | `ShardQueryFunction`} execution).
   *
   * Note that, within a given {@link EntityManager.query | `query`} method execution, these queries will be
   * repeated until either available data is exhausted or the {@link QueryOptions.limit | `limit`} value is
   * reached.
   */
  pageSize?: number;

  /**
   * Each key in this object is a valid entity index token. Each value is a valid
   * {@link ShardQueryFunction | 'ShardQueryFunction'} that specifies the query of a single page of data on a
   * single shard for the mapped index.
   *
   * This allows simultaneous queries on multiple sort keys to share a single
   * page key, e.g. to match the same string against `firstName` and `lastName`
   * properties without performing a table scan for either.
   */
  shardQueryMap: ShardQueryMap<Item>;

  /**
   * A {@link SortOrder | `SortOrder`} object specifying the sort order of the result set. Defaults to `[]`.
   */
  sortOrder?: SortOrder<Item>;

  /**
   * Lower limit to query shard space.
   *
   * Only valid if the query is constrained along the dimension used by the
   * {@link Config | `EntityManager.config.entities.<entityToken>.sharding.timestamptokens.timestamp`}
   * function to generate `shardKey`.
   *
   * @defaultValue `0`
   */
  timestampFrom?: number;

  /**
   * Upper limit to query shard space.
   *
   * Only valid if the query is constrained along the dimension used by the
   * {@link Config | `EntityManager.config.entities.<entityToken>.sharding.timestamptokens.timestamp`}
   * function to generate `shardKey`.
   *
   * @defaultValue `Date.now()`
   */
  timestampTo?: number;

  /**
   * The maximum number of shards to query in parallel. Overrides options `throttle`.
   *
   * @defaultValue `options.throttle`
   */
  throttle?: number;
}
