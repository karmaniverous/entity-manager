import type {
  PropertiesOfType,
  TranscodeMap,
} from '@karmaniverous/entity-tools';

/**
 * A two-layer map of page keys, used to query the next page of data across a set of indexes and on each shard of a given hash key.
 *
 * The keys of the outer object are the keys of the {@link QueryOptions.queryMap | `QueryMap`} object passed with the {@link EntityManager.query | `query`} method {@link QueryOptions.queryMap | options}. Each should correspond to a {@link ConfigEntity.indexes | `Config` entity index} for the given {@link Entity | `Entity`}.
 *
 * The keys of the inner object are the shard space for `hashKey` as constrained by the {@link QueryOptions | query options} timestamps.
 *
 * The values of the inner object are the page key objects returned by the previous database query on the related index & shard. An `undefined` value indicates that there are no more pages to query for that index & shard.
 *
 * @typeParam Item - The item type being queried. This will geerally be an {@link ItemMap | `ItemMap`} object.
 * @typeParam T - The {@link TranscodeMap | `TranscodeMap`} identifying property types that can be indexed.
 */
export type PageKeyMap<
  Item extends Record<string, unknown>,
  T extends TranscodeMap,
> = Record<
  string,
  Record<
    string,
    Partial<Pick<Item, PropertiesOfType<Item, T[keyof T]>>> | undefined
  >
>;
