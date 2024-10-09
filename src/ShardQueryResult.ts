import type {
  DefaultTranscodeMap,
  Entity,
  Exactify,
  PartialTranscodable,
  TranscodeMap,
} from '@karmaniverous/entity-tools';

import type { EntityMap, ItemMap } from './Config';

/**
 * A result returned by a {@link ShardQueryFunction | `ShardQueryFunction`} querying an individual shard.
 *
 * @typeParam Item - The {@link ItemMap | `ItemMap`} type being queried. 
 * @typeParam T - The {@link TranscodeMap | `TranscodeMap`} identifying property types that can be indexed.

* @category Query
 */
export interface ShardQueryResult<
  Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string = 'hashKey',
  RangeKey extends string = 'rangeKey',
  T extends TranscodeMap = DefaultTranscodeMap,
> {
  /** The number of records returned. */
  count: number;

  /** The returned records. */
  items: Item[];

  /** The page key for the next query on this shard. */
  pageKey?: PartialTranscodable<Item, T>;
}

export interface ClientShardQueryResult {
  count: number;
  items: Entity[];
  pageKey?: Entity;
}
