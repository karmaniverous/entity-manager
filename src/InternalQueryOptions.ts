import type { Exactify } from '@karmaniverous/entity-tools';

import type { BaseQueryOptions } from './BaseQueryOptions';
import type { EntityMap, ItemMap } from './Config';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityManager } from './EntityManager';
import { ShardQueryMap } from './ShardQueryMap';

/**
 * Options passed to the {@link query | `query`} function.
 *
 * @category Query
 */
export interface InternalQueryOptions<
  Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
> extends BaseQueryOptions<Item, EntityToken, M, HashKey, RangeKey> {
  /** Identifies the entity to be queried. Key of {@link Config | `EntityManager.config.entities`}. */
  entityToken: EntityToken;

  /**
   * Identifies the entity key across which the query will be sharded. Key of
   * {@link Config | `EntityManager.config.entities.<entityToken>.keys`}.
   */
  hashKeyToken: string;

  /**
   * {@link QueryResult.pageKeyMap | `pageKeyMap`} returned by the previous iteration of this query.
   */
  pageKeyMap?: string;

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
}
