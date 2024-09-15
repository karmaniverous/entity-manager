import type {
  Exactify,
  PropertiesOfType,
  StringifiableTypes,
  TypeMap,
} from '@karmaniverous/entity-tools';

import type { EntityItem, EntityMap } from './Config';
import type { ShardQueryResult } from './ShardQueryResult';

/**
 * A query function that returns a single page of results from an individual
 * shard. This function will typically be composed dynamically to express a
 * specific query index & logic. The arguments to this function will be
 * provided by the {@link EntityManager.query | `EntityManager.query`} method, which assembles many returned
 * pages queried across multiple shards into a single query result.
 *
 * @typeParam Item - The {@link EntityItem | `EntityItem`} type being queried. 
 * @typeParam IndexableTypes - The {@link TypeMap | `TypeMap`} identifying property types that can be indexed. Defaults to {@link StringifiableTypes | `StringifiableTypes`}.

 * @param hashKey - The {@link ConfigKeys.hashKey | `this.config.hashKey`} property value of the shard being queried.
 * @param pageKey - The page key returned by the previous query on this shard.
 * @param pageSize - The maximum number of items to return from this query.
 *
 * @category Query
 */
export type ShardQueryFunction<
  Item extends EntityItem<EntityToken, M, HashKey, RangeKey>,
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string = 'hashKey',
  RangeKey extends string = 'rangeKey',
  IndexableTypes extends TypeMap = StringifiableTypes,
> = (
  hashKey: string,
  pageKey?: Partial<
    Pick<Item, PropertiesOfType<Item, IndexableTypes[keyof IndexableTypes]>>
  >,
  pageSize?: number,
) => Promise<
  ShardQueryResult<Item, EntityToken, M, HashKey, RangeKey, IndexableTypes>
>;
