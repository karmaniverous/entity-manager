import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityItem } from './EntityItem';

/**
 * A result returned by a query across multiple shards, where each shard may
 * receive multiple page queries via a dynamically-generated {@link ShardQueryFunction | `ShardQueryFunction`}.
 *
 * @category Query
 */
export interface QueryResult<C extends BaseConfigMap> {
  /** Total number of records returned across all shards. */
  count: number;

  /** The returned records. */
  items: EntityItem<C>[];

  /**
   * A compressed, two-layer map of page keys, used to query the next page of
   * data for a given sort key on each shard of a given hash key.
   */
  pageKeyMap: string;
}
