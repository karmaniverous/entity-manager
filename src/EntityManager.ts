import { type Stringifiable } from '@karmaniverous/string-utilities';
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

import { Config } from './types';
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
  EntityMap,
  HashKey extends string,
  UniqueKey extends string,
> {
  #config: Required<Config<EntityMap, HashKey, UniqueKey>>;
  #logger: Logger;
  #throttle: number;

  /**
   * Create an EntityManager instance.
   *
   * @param options - EntityManager options.
   */
  constructor(
    config: Config<EntityMap, HashKey, UniqueKey>,
    { logger = console, throttle = 10 }: EntityManagerOptions = {},
  ) {
    this.#config = config;
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
   * Generates an array of sharded keys from an {@link EntityItem | `EntityItem`} valid across a given timestamp range.
   *
   * @param entityToken - Entity token.
   * @param keyToken - Key token.
   * @param item - Entity item sufficiently populated to generate property keyToken.
   * @param timestampFrom - Lower timestamp limit of shard key space. Defaults to `0`.
   * @param timestampTo - Upper timestamp limit of shard key space. Defaults to `Date.now()`.
   * @returns Array of keys.
   */
  getKeySpace(
    entityToken: string,
    keyToken: string,
    item: EntityItem = {},
    timestampFrom = 0,
    timestampTo = Date.now(),
  ) {
    const shardKeySpace = getShardKeySpace(
      this.config,
      entityToken,
      timestampFrom,
      timestampTo,
    );

    const { entity, shardKey: shardKeyToken } = this.config.tokens;

    const result = unique(
      shardKeySpace.map((shardKey) =>
        getEntityKeyConfig(this.config, entityToken, keyToken).encode({
          ...item,
          [entity]: entityToken,
          [shardKeyToken]: shardKey,
        }),
      ),
    ) as string[];

    this.#logger.debug('got shard key space for entity item', {
      entityToken,
      keyToken,
      item,
      timestampFrom,
      timestampTo,
      result,
    });

    return result;
  }

  /**
   * Add sharded keys to an entity item. Does not mutate original item.
   *
   * @param entityToken - Entity token.
   * @param item - Entity item.
   * @param overwrite - Overwrite existing properties.
   *
   * @returns Decorated clone of {@link EntityItem | `EntityItem`}.
   */
  addKeys<T extends EntityItem>(
    entityToken: string,
    item: T,
    overwrite = false,
  ): T {
    // Validate item.
    validateEntityItem(item);

    // Get tokens.
    const { entity, shardKey: shardKeyToken } = this.config.tokens;

    // Clone item.
    const newItem = {
      ...construct(crush(item)),
      [entity]: entityToken,
    } as T;

    // Add shardKey.
    if (overwrite || isNil(newItem[shardKeyToken])) {
      // @ts-expect-error Type 'string | undefined' is not assignable to type 'T[keyof T]'.
      newItem[shardKeyToken as keyof T] = getShardKey(
        this.config,
        entityToken,
        newItem,
      );
    }

    // Add keys.
    const { keys } = getEntityConfig(this.config, entityToken);

    for (const [keyToken, { encode }] of Object.entries(keys))
      if (overwrite || isNil(newItem[keyToken]))
        // @ts-expect-error Type 'string | undefined' is not assignable to type 'T[keyof T]'.
        newItem[keyToken as keyof T] = encode(newItem);

    // Remove shaken item.
    const result = shake(omit(newItem, [entity]), isNil);

    this.#logger.debug('added sharded index keys to entity item', {
      entityToken,
      item,
      overwrite,
      result,
    });

    return result as T;
  }

  /**
   * Reverses {@link EntityManager.addKeys | `EntityManager.addKeys `}.
   *
   * Remove sharded keys from an entity item. Does not mutate original item or
   * remove keys marked with `retain = true`.
   *
   * @param entityToken - Entity token.
   * @param item - Entity item.
   *
   * @returns Stripped entity item.
   */
  removeKeys(entityToken: string, item: EntityItem) {
    // Validate item.
    validateEntityItem(item);

    // Remove keys.
    const { keys } = this.config.entities[entityToken];
    const unretainedKeys = Object.keys(keys).filter((key) => !keys[key].retain);
    const result = omit(item, [...unretainedKeys, this.config.tokens.shardKey]);

    this.#logger.debug('removed sharded index keys from entity item', {
      entityToken,
      item,
      result,
    });

    return result as EntityItem;
  }

  /**
   * Condense a partial {@link EntityItem | `EntityItem`} into a delimited string representing an index.
   *
   * @remarks
   * `index` can either be an array of {@link Config | entity keys} or a string representing a {@link Config | named entity index}.
   *
   * The create the output value, this method:
   *
   * * Dedupes the provided index keys & sorts them alphabetically.
   * * Runs each key's encode function on `item` to generate index component values.
   * * Joins the index component values with `delimiter`.
   *
   * @param entityToken - Entity token.
   * @param index - Index token or array of entity key tokens.
   * @param item - Entity item.
   * @param delimiter - Delimiter.
   *
   * @returns  Dehydrated index.
   *
   * @throws Error if a provided index component is not a valid entity key.
   * @throws Error if a named index is not a valid entity index.
   */
  dehydrateIndex(
    entityToken: string,
    index: string | string[],
    item: EntityItem,
    delimiter = '~',
  ) {
    // Validate item.
    validateEntityItem(item);

    // Get index components.
    const indexComponents = Array.isArray(index)
      ? index
      : getIndexComponents(this.config, entityToken, index);

    // Construct index item.
    const indexItem = indexComponents.reduce(
      (indexItem, component) => ({
        ...indexItem,
        ...getEntityKeyConfig(this.config, entityToken, component).decode(
          item[component],
        ),
      }),
      {},
    );

    // Sort keys & join values.
    const dehydrated = alphabetical(Object.entries(indexItem), ([key]) => key)
      .map(([, value]) => value)
      .join(delimiter);

    this.#logger.debug('dehydrated index', {
      entityToken,
      index,
      item,
      delimiter,
      indexComponents,
      dehydrated,
    });

    return dehydrated;
  }

  /**
   * Convert a delimited string into a named index key. Reverses {@link EntityManager.dehydrateIndex | `EntityManager.dehydrateIndex`}.
   *
   * @remarks
   * {@link EntityManager.dehydrateIndex | `EntityManager.dehydrateIndex`} alphebetically sorts index component keys
   * during the dehydration process. This method assumes dehydrated index
   * component values are presented in the same order.
   *
   * @param entityToken - Entity token.
   * @param index - Index token or array of key tokens.
   * @param value - Dehydrated index value.
   * @param delimiter - Delimiter.
   * @returns Rehydrated index key.
   */
  rehydrateIndex(
    entityToken: string,
    index: string | string[],
    value = '',
    delimiter = '~',
  ) {
    // Get index components.
    const indexComponents = Array.isArray(index)
      ? index
      : getIndexComponents(this.config, entityToken, index);

    const indexTokens = alphabetical(
      unique(
        indexComponents.reduce<string[]>(
          (keys, component) => [
            ...keys,
            ...getEntityKeyConfig(this.config, entityToken, component).elements,
          ],
          [],
        ),
      ),
      (key) => key,
    );

    const indexValues = value.split(delimiter);

    if (indexTokens.length !== indexValues.length)
      throw new Error('index rehydration key-value mismatch');

    const indexProperties = zipToObject(indexTokens, indexValues);

    const rehydrated = indexComponents.reduce<EntityIndexItem>(
      (index, component) => ({
        ...index,
        [component]: getEntityKeyConfig(
          this.config,
          entityToken,
          component,
        ).encode(indexProperties) as Stringifiable,
      }),
      {},
    );

    this.#logger.debug('rehydrated index', {
      entityToken,
      index,
      value,
      delimiter,
      indexComponents,
      indexTokens,
      indexValues,
      indexProperties,
      rehydrated,
    });

    return rehydrated;
  }

  /**
   * Dehydrate a {@link PageKeyMap | `PageKeyMap`} object into an array of dehydrated pageKeys, then
   * stringify & compress the array.
   *
   * @param entityToken - Entity token.
   * @param pageKeyMap - PageKeyMap object to dehydrate.
   *
   * @returns  Dehydrated {@link PageKeyMap | `PageKeyMap`} object or compressed empty array if all
   * pageKeys are undefined.
   */
  compressPageKeyMap(entityToken: string, pageKeyMap: PageKeyMap) {
    // Extract & sort index tokens.
    const indexTokens = alphabetical(Object.keys(pageKeyMap), (key) => key);

    // Extract & sort shard key space.
    const shardKeySpace = alphabetical(
      Object.keys(pageKeyMap[indexTokens[0]]),
      (key) => key,
    );

    // Dehydrate page keys.
    const dehydrated: string[] = [];
    for (const indexToken of indexTokens) {
      for (const shardedKey of shardKeySpace) {
        const pageKey = pageKeyMap[indexToken][shardedKey];

        dehydrated.push(
          pageKey ? this.dehydrateIndex(entityToken, indexToken, pageKey) : '',
        );
      }
    }

    // Compress dehydrated page keys.
    const compressed = lzstring.compressToEncodedURIComponent(
      JSON.stringify(
        dehydrated.some((pageKey) => pageKey !== '') ? dehydrated : [],
      ),
    );

    this.#logger.debug('compressed page key map', {
      entityToken,
      pageKeyMap,
      indexTokens,
      shardKeySpace,
      dehydrated,
      compressed,
    });

    // Dehydrate page keys.
    return compressed;
  }

  /**
   * Decompress & rehydrate a compressed array of pageKeys into a {@link PageKeyMap | `PageKeyMap`}
   * object.
   *
   * @param queryOptions - {@link QueryOptions | `QueryOptions`} object (which includes compressed
   * `pageKeys` string).
   * @param indexTokens - Array of index tokens.
   *
   * @returns Decompressed {@link PageKeyMap | `PageKeyMap`} object.
   */
  decompressPageKeyMap(
    queryOptions: Omit<
      QueryOptions,
      'limit' | 'pageSize' | 'queryMap' | 'throttle'
    >,
    indexTokens: string[],
  ) {
    const {
      entityToken,
      item,
      keyToken,
      pageKeyMap,
      timestampFrom,
      timestampTo,
    } = queryOptions;

    const decompressed = pageKeyMap
      ? (JSON.parse(
          lzstring.decompressFromEncodedURIComponent(pageKeyMap),
        ) as string[])
      : undefined;

    if (decompressed && !decompressed.length) return {};

    const sortedIndexTokens = alphabetical(indexTokens, (key) => key);

    const sortedShardKeys = alphabetical(
      this.getKeySpace(entityToken, keyToken, item, timestampFrom, timestampTo),
      (key) => key,
    );

    const rehydrated = sortedIndexTokens.reduce<PageKeyMap>(
      (rehydrated, indexToken, i) => ({
        ...rehydrated,
        [indexToken]: sortedShardKeys.reduce(
          (indexPageMap, shardKey, j) => ({
            ...indexPageMap,
            [shardKey]: decompressed
              ? this.rehydrateIndex(
                  entityToken,
                  indexToken,
                  decompressed[i * sortedShardKeys.length + j],
                )
              : undefined,
          }),
          {},
        ),
      }),
      {},
    );

    this.#logger.debug('decompressed page key map', {
      entityToken,
      indexTokens,
      item,
      keyToken,
      pageKeyMap,
      timestampFrom,
      timestampTo,
      decompressed,
      sortedIndexTokens,
      sortedShardKeys,
      rehydrated,
    });

    return rehydrated;
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
