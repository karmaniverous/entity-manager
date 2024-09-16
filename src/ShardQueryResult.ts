import type {
  Exactify,
  PropertiesOfType,
  StringifiableTypes,
  TypeMap,
} from '@karmaniverous/entity-tools';

import type { EntityMap, ItemMap } from './Config';

/**
 * A result returned by a {@link ShardQueryFunction | `ShardQueryFunction`} querying an individual shard.
 *
 * @typeParam Item - The {@link ItemMap | `ItemMap`} type being queried. 
 * @typeParam IndexableTypes - The {@link TypeMap | `TypeMap`} identifying property types that can be indexed.

* @category Query
 */
export interface ShardQueryResult<
  Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string = 'hashKey',
  RangeKey extends string = 'rangeKey',
  IndexableTypes extends TypeMap = StringifiableTypes,
> {
  /** The number of records returned. */
  count: number;

  /** The returned records. */
  items: Item[];

  /** The page key for the next query on this shard. */
  pageKey?: Partial<
    Pick<Item, PropertiesOfType<Item, IndexableTypes[keyof IndexableTypes]>>
  >;
}
