import type { EntityMap } from '@karmaniverous/entity-tools';

import { EntityItem } from './EntityItem';

/**
 * A result returned by a query across multiple shards, where each shard may
 * receive multiple page queries via a dynamically-generated {@link ShardQueryFunction | `ShardQueryFunction`}.
 *
 * @category Query
 */
export interface QueryResult<
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  ShardedKeys extends string,
  UnshardedKeys extends string,
  Item extends EntityItem<M, HashKey, RangeKey, ShardedKeys, UnshardedKeys>,
> {
  /** Total number of records returned across all shards. */
  count: number;

  /** The returned records. */
  items: Item[];

  /**
   * A compressed, two-layer map of page keys, used to query the next page of
   * data for a given sort key on each shard of a given hash key.
   */
  pageKeyMap: string;
}
