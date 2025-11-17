import type {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  EntityMap, // imported to support API docs
  SortOrder,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TranscodeRegistry, // imported to support API docs
} from '@karmaniverous/entity-tools';

import type { BaseConfigMap } from './BaseConfigMap';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityManager } from './EntityManager'; // imported to support API docs
import type { EntityToken } from './EntityToken';
import type { ShardQueryMap } from './ShardQueryMap';
import type { EntityItemByToken } from './TokenAware';

/**
 * Options passed to the {@link EntityManager.query | `EntityManager.query`} method.
 *
 * @typeParam CC - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeRegistry | `TranscodeRegistry`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 * @typeParam ET - Entity token narrowing the item types.
 * @typeParam ITS - Index token subset (inferred from shardQueryMap keys).
 *
 * @category EntityManager
 * @protected
 */
export interface QueryOptions<
  CC extends BaseConfigMap,
  ET extends EntityToken<CC> = EntityToken<CC>,
  ITS extends string = string,
> {
  /** Identifies the entity to be queried. Key of {@link Config | `Config`} `entities`. */
  entityToken: ET;

  /**
   * Partial item object sufficiently populated to generate index hash keys.
   */
  item: EntityItemByToken<CC, ET>;

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
  shardQueryMap: ShardQueryMap<CC, ET, ITS>;

  /**
   * A {@link SortOrder | `SortOrder`} object specifying the sort order of the result set. Defaults to `[]`.
   */
  sortOrder?: SortOrder<EntityItemByToken<CC, ET>>;

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
