import type {
  EntityItem,
  EntityMap,
  PropertiesOfType,
  Stringifiable,
} from './Config';

/**
 * A two-layer map of page keys, used to query the next page of data for a
 * given index on each shard of a given hash key.
 *
 * The keys of the outer object are the keys of the QueryMap object passed to
 * the `query` method. Each should correspond to an index for the given entity.
 * This index contains the range key of an individual query.
 *
 * The keys of the inner object are the hashKey value passed to each
 * ShardQueryFunction. This is the hash key of an individual query.
 *
 * The values are the `pageKey` returned by the previous query on the related
 * index & shard. An `undefined` value indicates that there are no more pages to
 * query for that index & shard.
 */
export type PageKeyMap<Item extends Record<string, unknown>> = Record<
  string,
  Record<string, Pick<Item, PropertiesOfType<Item, Stringifiable>> | undefined>
>;

/**
 * Null or undefined.
 */
export type Nil = null | undefined;

/**
 * Tests whether a value is Nil.
 *
 * @param value - Value.
 * @returns true if value is null or undefined.
 */
export const isNil = (value: unknown): value is Nil =>
  value === null || value === undefined;

/**
 * Injectable logger interface.
 *
 * @category Options
 */
export interface Logger {
  debug: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

/**
 * EntityManager constructor options.
 *
 * @category Options
 */
export interface EntityManagerOptions {
  /**
   * Logger object.
   *
   * @defaultValue `console`
   */
  logger?: Logger;

  /**
   * Default maximum number of shards to query in parallel.
   *
   * @defaultValue `10`
   */
  throttle?: number;
}
/**
 * A result returned by a {@link ShardQueryFunction | `ShardQueryFunction`} querying an individual shard.
 *
 * @category Query
 */
export interface ShardQueryResult<
  Item extends EntityItem<Entity, M, HashKey, RangeKey>,
  Entity extends keyof M & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
> {
  /** The number of records returned. */
  count: number;

  /** The returned records. */
  items: Item[];

  /** The page key for the next query on this shard. */
  pageKey?: Record<PropertiesOfType<Item, Stringifiable>, Stringifiable>;
}

/**
 * A query function that returns a single page of results from an individual
 * shard. This function will typically be composed dynamically to express a
 * specific query index & logic. The arguments to this function will be
 * provided by the {@link EntityManager.query | `EntityManager.query`} method, which assembles many returned
 * pages queried across multiple shards into a single query result.
 *
 * @param haskKey - The key of the individual shard being queried.
 * @param pageKey - The page key returned by the previous query on this shard.
 * @param pageSize - The maximum number of items to return from this query.
 *
 * @category Query
 */
export type ShardQueryFunction<
  Item extends EntityItem<Entity, M, HashKey, RangeKey>,
  Entity extends keyof M & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
> = (
  hashKey: string,
  pageKey?: Pick<Item, PropertiesOfType<Item, Stringifiable>>,
  pageSize?: number,
) => Promise<ShardQueryResult<Item, Entity, M, HashKey, RangeKey>>;

/**
 * Options passed to the {@link EntityManager.query | `EntityManager.query`} method.
 *
 * @category Query
 */
export interface QueryOptions<
  Item extends EntityItem<Entity, M, HashKey, RangeKey>,
  Entity extends keyof M & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
> {
  /** Identifies the entity to be queried. Key of {@link Config | `EntityManager.config.entities`}. */
  entity: Entity;

  /**
   * Identifies the entity key across which the query will be sharded. Key of
   * {@link Config | `EntityManager.config.entities.<entityToken>.keys`}.
   */
  hashKey: string;

  /**
   * A partial {@link EntityItem | `EntityItem`} object containing at least the properties specified in
   * {@link Config | `EntityManager.config.entities.<entityToken>.keys.<keyToken>.elements`}, except for the properties specified in {@link Config | `EntityManager.config.tokens`}.
   *
   * This data will be used to generate query keys across all shards.
   */
  item?: Item;

  /**
   * The target maximum number of records to be returned by the query across
   * all shards.
   *
   * The actual number of records returned will be a product of {@link QueryOptions.pageSize | `pageSize`} and the
   * number of shards queried, unless limited by available records in a given
   * shard.
   */
  limit?: number;

  /**
   * {@link QueryResult.pageKeyMap | `pageKeyMap`} returned by the previous iteration of this query.
   */
  pageKeyMap?: string;

  /**
   * The maximum number of records to be returned by each individual query to a
   * single shard (i.e. {@link ShardQueryFunction | `ShardQueryFunction`} execution).
   *
   * Note that, within a given {@link EntityManager.query | `query`} method execution, these queries will be
   * repeated until either available data is exhausted or the {@link QueryOptions.limit | `limit`} value is
   * reached.
   */
  pageSize?: number;

  /**
   * Each key in this object is a valid entity index token. Each value is a valid
   * {@link ShardQueryFunction | 'ShardQueryFunction'} that specifies the query of a single page of data on a
   * single shard for the mapped index.
   *
   * This allows simultaneous queries on multiple sort keys to share a single
   * page key, e.g. to match the same string against `firstName` and `lastName`
   * properties without performing a table scan for either.
   */
  queryMap: Record<
    string,
    ShardQueryFunction<Item, Entity, M, HashKey, RangeKey>
  >;

  /**
   * Lower limit to query shard space.
   *
   * Only valid if the query is constrained along the dimension used by the
   * {@link Config | `EntityManager.config.entities.<entityToken>.sharding.timestamptokens.timestamp`}
   * function to generate `shardKey`.
   *
   * @defaultValue `0`
   */
  timestampFrom?: number;

  /**
   * Upper limit to query shard space.
   *
   * Only valid if the query is constrained along the dimension used by the
   * {@link Config | `EntityManager.config.entities.<entityToken>.sharding.timestamptokens.timestamp`}
   * function to generate `shardKey`.
   *
   * @defaultValue `Date.now()`
   */
  timestampTo?: number;

  /**
   * The maximum number of shards to query in parallel. Overrides constructor `throttle`.
   *
   * @defaultValue `this.throttle`
   */
  throttle?: number;
}

/**
 * A result returned by a query across multiple shards, where each shard may
 * receive multiple page queries via a dynamically-generated {@link ShardQueryFunction | `ShardQueryFunction`}.
 *
 * @category Query
 */
export interface QueryResult<
  Item extends EntityItem<Entity, EntityMap, HashKey, RangeKey>,
  Entity extends keyof M & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
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

/**
 * A QueryResult object with rehydrated pageKeyMap.
 *
 * @category Query
 */
export interface RehydratedQueryResult<
  Item extends EntityItem<Entity, EntityMap, HashKey, RangeKey>,
  Entity extends keyof M & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
> {
  /** Total number of records returned across all shards. */
  count: number;

  /** The returned records. */
  items: Item[];

  /**
   * A compressed, two-layer map of page keys, used to query the next page of
   * data for a given sort key on each shard of a given hash key.
   */
  pageKeyMap: PageKeyMap<Item>;
}
