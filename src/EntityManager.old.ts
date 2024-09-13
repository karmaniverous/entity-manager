import lzstring from 'lz-string';
import {
  alphabetical,
  construct,
  crush,
  diff,
  isInt,
  omit,
  parallel,
  shake,
  unique,
  zipToObject,
} from 'radash';

import { Config, EntityMap, PropertiesOfType, Stringifiable } from './Config';
import { configSchema, ParsedConfig } from './ParsedConfig';
import {
  type EntityIndexItem,
  type EntityItem,
  getEntityConfig,
  getEntityKeyConfig,
  getIndexComponents,
  getShardKey,
  getShardKeySpace,
  isNil,
  validateEntityItem,
} from './util';

/**
 * A compressed, two-layer map of page keys, used to query the next page of
 * data for a given sort key on each shard of a given hash key.
 *
 * The keys of the outer object are the keys of the `queryMap` object passed to
 * the `query` method. Each should correspond to an index for the given
 * `entityToken`. This is the sort key of an individual query.
 *
 * The keys of the inner object are the `shardedKey` value passed to each
 * {@link ShardQueryFunction | `ShardQueryFunction`}. This is the hash key of an individual query.
 *
 * The values are the `pageKey` returned by the previous query on that shard.
 *
 * An empty object indicates that there were no more pages to query on any
 * shard, for any index.
 *
 * The resulting object is stringified & compressed using {@link https://github.com/pieroxy/lz-string/blob/master/src/encodedURIComponent/compressToEncodedURIComponent.ts | `lzstring`}.
 */
export type PageKeyMap = Record<
  string,
  Record<string, EntityIndexItem | undefined>
>;

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
export interface ShardQueryResult<Entity> {
  /** The number of records returned. */
  count: number;

  /** The returned records. */
  items: Entity[];

  /** The page key for the next query on this shard. */
  pageKey?: EntityIndexItem;
}

/**
 * A query function that returns a single page of results from an individual
 * shard. This function will typically be composed dynamically to express a
 * specific query index & logic. The arguments to this function will be
 * provided by the {@link EntityManager.query | `EntityManager.query`} method, which assembles many returned
 * pages queried across multiple shards into a single query result.
 *
 * @param shardedKey - The key of the individual shard being queried.
 * @param pageKey - The page key returned by the previous query on this shard.
 * @param pageSize - The maximum number of items to return from this query.
 *
 * @category Query
 */
export type ShardQueryFunction<Entity> = (
  shardedKey: string,
  pageKey?: EntityIndexItem,
  pageSize?: number,
) => Promise<ShardQueryResult<Entity>>;

/**
 * A result returned by a query across multiple shards, where each shard may
 * receive multiple page queries via a dynamically-generated {@link ShardQueryFunction | `ShardQueryFunction`}.
 *
 * @category Query
 */
export interface QueryResult<Entity> {
  /** Total number of records returned across all shards. */
  count: number;

  /** The returned records. */
  items: Entity[];

  /**
   * A compressed, two-layer map of page keys, used to query the next page of
   * data for a given sort key on each shard of a given hash key.
   */
  pageKeyMap: string;
}

type UncompressedQueryResult<Entity> = Omit<
  QueryResult<Entity>,
  'pageKeyMap'
> & {
  pageKeyMap: PageKeyMap;
};

/**
 * Options passed to the {@link EntityManager.query | `EntityManager.query`} method.
 *
 * @category Query
 */
export interface QueryOptions {
  /** Identifies the entity to be queried. Key of {@link Config | `EntityManager.config.entities`}. */
  entityToken: string;

  /**
   * Identifies the entity key across which the query will be sharded. Key of
   * {@link Config | `EntityManager.config.entities.<entityToken>.keys`}.
   */
  keyToken: string;

  /**
   * A partial {@link EntityItem | `EntityItem`} object containing at least the properties specified in
   * {@link Config | `EntityManager.config.entities.<entityToken>.keys.<keyToken>.elements`}, except for the properties specified in {@link Config | `EntityManager.config.tokens`}.
   *
   * This data will be used to generate query keys across all shards.
   */
  item?: EntityItem;

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
  queryMap: Record<string, ShardQueryFunction>;

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

export const emptyPageKeyMap = lzstring.compressToEncodedURIComponent(
  JSON.stringify([]),
);

const emptyQueryResult: QueryResult = {
  count: 0,
  items: [],
  pageKeyMap: emptyPageKeyMap,
};

/**
 * The EntityManager class applies a configuration-driven sharded data model &
 * query strategy to NoSql data.
 *
 * @category Entity Manager
 */
export class EntityManager<
  C extends Config<M, HashKey, RangeKey>,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
> {
  #config: ParsedConfig;
  #logger: Logger;
  #throttle: number;

  /**
   * Create an EntityManager instance.
   *
   * @param options - EntityManager options.
   */
  constructor(
    config: C,
    { logger = console, throttle = 10 }: EntityManagerOptions = {},
  ) {
    this.#config = configSchema.parse(config);
    this.#logger = logger;
    this.#throttle = throttle;
  }

  /**
   * Get the current EntityManager Config object.
   *
   * @returns Current config object.
   */
  get config() {
    return this.#config;
  }

  /**
   * Set the current config.
   *
   * @param value - RawConfig object.
   */
  set config(value) {
    this.#config = configSchema.parse(value);
  }

  /**
   * Query an entity across shards in a provider-generic fashion.
   *
   * @remarks
   * The provided {@link ShardQueryFunction | `ShardQueryFunction`} performs the actual query of individual
   * data pages on individual shards. This function is presumed to express
   * provider-specific query logic, including any necessary indexing or search
   * constraints.
   *
   * Shards will generally not be in alignment with provided sort
   * indexes. The resulting data set will therefore NOT be sorted despite any
   * sort imposed by `shardQuery`, and will require an additional sort to
   * present a sorted result to the end user.
   *
   * As a result, returned data pages will also be somewhat unordered. Expect
   * the leading and trailing edges of returned data pages to interleave
   * somewhat with preceding & following pages.
   *
   * Unsharded query results should sort & page as expected.
   *
   * @param options - Query options.
   *
   * @returns Query results combined across shards.
   *
   * @throws Error if `pageKeyMap` keys do not match `queryMap` keys.
   */
  async query(options: QueryOptions): Promise<QueryResult> {
    // Get defaults.
    const { defaultLimit, defaultPageSize } = getEntityConfig(
      this.config,
      options.entityToken,
    );

    const {
      entityToken,
      keyToken,
      item = {},
      limit = defaultLimit,
      pageSize = defaultPageSize,
      queryMap,
      timestampFrom = 0,
      timestampTo = Date.now(),
      throttle = this.#throttle,
    } = options;

    // Validate item.
    validateEntityItem(item);

    // Validate limit.
    if (!(limit === Infinity || (isInt(limit) && limit >= 1)))
      throw new Error('limit must be a positive integer or Infinity.');

    // Validate pageSize.
    if (!(isInt(pageSize) && pageSize >= 1))
      throw new Error('pageSize must be a positive integer');

    // Decompress pageKeyMap.
    const pageKeyMap = this.decompressPageKeyMap(
      options,
      Object.keys(queryMap),
    );

    // Shortcut if pageKeyMap is empty.
    const indexTokens = Object.keys(pageKeyMap);

    if (!indexTokens.length) return emptyQueryResult;

    // Validate pageKeyMap against queryMap.
    if (diff(indexTokens, Object.keys(queryMap)).length)
      throw new Error('pageKeyMap keys must match queryMap keys.');

    // Iterate search over pages.
    let result: UncompressedQueryResult = { count: 0, items: [], pageKeyMap };

    do {
      // TODO: This loop will blow up as shards scale, since at a minimum it will return shardCount * pageSize
      // items, which may be >> limit. Probably the way to fix this is to limit the number of shards queried per
      // iteration in order to keep shardsQueried * pageSize > (limit - items.length) but only just.

      // TODO: Test for invalid characters (path delimiters) in index keys & shard key values.

      // Query every shard on every index in pageKeyMap.
      const shardQueryResults = await parallel(
        throttle,
        Object.entries(pageKeyMap).flatMap(([indexToken, indexPageKeys]) =>
          Object.entries(indexPageKeys).map(([shardedKey, pageKey]) => [
            indexToken,
            shardedKey,
            pageKey,
          ]),
        ) as [string, string, EntityIndexItem | undefined][],
        async ([indexToken, shardedKey, pageKey]: [
          string,
          string,
          PageKeyMap[string][string],
        ]) => ({
          indexToken,
          queryResult: await queryMap[indexToken](
            shardedKey,
            pageKey,
            pageSize,
          ),
          shardedKey,
        }),
      );

      // Reduce shardQueryResults & update result.
      result = shardQueryResults.reduce<UncompressedQueryResult>(
        (
          { count, items, pageKeyMap },
          { indexToken, queryResult, shardedKey },
        ) => {
          pageKeyMap[indexToken][shardedKey] = queryResult.pageKey;

          return {
            count: count + queryResult.count,
            items: [...items, ...queryResult.items],
            pageKeyMap,
          };
        },
        result,
      );
    } while (
      // Repeat while pages remain & limit is not reached.
      Object.values(result.pageKeyMap).some((indexPageKeys) =>
        Object.values(indexPageKeys).some((pageKey) => pageKey !== undefined),
      ) &&
      result.items.length < limit
    );

    const compressed = {
      ...result,
      pageKeyMap: this.compressPageKeyMap(entityToken, result.pageKeyMap),
    };

    this.#logger.debug('queried entity across shards', {
      entityToken,
      keyToken,
      item,
      limit,
      pageKeyMap,
      pageSize,
      timestampFrom,
      timestampTo,
      throttle,
      result,
      compressed,
    });

    return compressed;
  }
}
