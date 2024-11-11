import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityItem } from './EntityItem';

/**
 * A two-layer map of page keys, used to query the next page of data across a set of indexes and on each shard of a given hash key.
 *
 * The keys of the outer object are the keys of the {@link QueryOptions.shardQueryMap | `QueryMap`} object passed with the {@link EntityManager.query | `query`} method {@link QueryOptions.shardQueryMap | options}. Each should correspond to a {@link ConfigEntity.indexes | `Config` entity index} for the given {@link Entity | `Entity`}.
 *
 * The keys of the inner object are the shard space for `hashKey` as constrained by the {@link QueryOptions | query options} timestamps.
 *
 * The values of the inner object are the page key objects returned by the previous database query on the related index & shard. An `undefined` value indicates that there are no more pages to query for that index & shard.
 *
 * @typeParam C - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeMap | `TranscodeMap`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 *
 * @category QueryBuilder
 * @protected
 */
export type PageKeyMap<C extends BaseConfigMap> = Record<
  string,
  Record<
    string,
    | Pick<
        EntityItem<C>,
        | C['HashKey']
        | C['RangeKey']
        | C['ShardedKeys']
        | C['UnshardedKeys']
        | C['TranscodedProperties']
      >
    | undefined
  >
>;
