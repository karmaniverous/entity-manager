import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityItem } from './EntityItem';

/**
 * A result returned by a {@link ShardQueryFunction | `ShardQueryFunction`} querying an individual shard.
 *
 * @category Query
 */
export interface ShardQueryResult<C extends BaseConfigMap> {
  /** The number of records returned. */
  count: number;

  /** The returned records. */
  items: EntityItem<C>[];

  /** The page key for the next query on this shard. */
  pageKey?: EntityItem<C>;
}
