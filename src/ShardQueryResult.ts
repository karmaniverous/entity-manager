import type { Entity } from '@karmaniverous/entity-tools';

/**
 * A result returned by a {@link ShardQueryFunction | `ShardQueryFunction`} querying an individual shard.
 *
 * @typeParam Item - The {@link Item | `Item`} type being queried. 

* @category Query
 */
export interface ShardQueryResult<Item extends Entity> {
  /** The number of records returned. */
  count: number;

  /** The returned records. */
  items: Item[];

  /** The page key for the next query on this shard. */
  pageKey?: Item;
}
