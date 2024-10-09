import type {
  DefaultTranscodeMap,
  Entity,
  Exactify,
  PartialTranscodable,
  TranscodeMap,
} from '@karmaniverous/entity-tools';

import type { EntityMap, ItemMap } from './Config';
import type {
  ClientShardQueryResult,
  ShardQueryResult,
} from './ShardQueryResult';

/**
 * A query function that returns a single page of results from an individual
 * shard. This function will typically be composed dynamically to express a
 * specific query index & logic. The arguments to this function will be
 * provided by the {@link EntityManager.query | `EntityManager.query`} method, which assembles many returned
 * pages queried across multiple shards into a single query result.
 *
 * @typeParam Item - The {@link ItemMap | `ItemMap`} type being queried. 
 * @typeParam T - The {@link TranscodeMap | `TranscodeMap`} identifying property types that can be indexed. Defaults to {@link DefaultTranscodeMap | `DefaultTranscodeMap`}.

 * @param hashKey - The {@link ConfigKeys.hashKey | `this.config.hashKey`} property value of the shard being queried.
 * @param pageKey - The page key returned by the previous query on this shard.
 * @param pageSize - The maximum number of items to return from this query.
 *
 * @category Query
 */
export type ShardQueryFunction<
  Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string = 'hashKey',
  RangeKey extends string = 'rangeKey',
  T extends TranscodeMap = DefaultTranscodeMap,
> = (
  hashKey: string,
  pageKey?: PartialTranscodable<Item, T>,
  pageSize?: number,
) => Promise<ShardQueryResult<Item, EntityToken, M, HashKey, RangeKey, T>>;

export type ClientShardQueryFunction = (
  hashKey: string,
  pageKey?: Entity,
  pageSize?: number,
) => Promise<ClientShardQueryResult>;
