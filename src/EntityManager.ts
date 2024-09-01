/**
 * EntityManager module.
 *
 * @module
 */

import {
  alphabetical,
  construct,
  crush,
  isInt,
  objectify,
  omit,
  shake,
  unique,
  zipToObject,
} from 'radash';

import { type Config, configSchema, type RawConfig } from './Config';
import {
  EntityIndexItem,
  EntityItem,
  getEntityConfig,
  getEntityKeyConfig,
  getIndexComponents,
  getShardKey,
  getShardKeySpace,
  isNil,
  validateEntityItem,
} from './util';

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
  /** An EntityManager {@link RawConfig | `RawConfig`} object. */
  config?: RawConfig;

  /**
   * Logger object.
   * @defaultValue `console` */
  logger?: Logger;
}

/**
 * A result returned by a {@link ShardQueryFunction | `ShardQueryFunction`} querying an individual shard.
 *
 * @category Query
 */
export interface ShardQueryResult {
  /** The number of records returned. */
  count: number;

  /** The returned records. */
  items: EntityItem[];

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
export type ShardQueryFunction = (
  shardedKey: string,
  pageKey?: EntityIndexItem,
  pageSize?: number,
) => Promise<ShardQueryResult>;

/**
 * A result returned by a query across multiple shards, where each shard may
 * receive multiple page queries via a dynamically-generated {@link ShardQueryFunction | `ShardQueryFunction`}.
 *
 * @category Query
 */
export interface QueryResult {
  /** Total number of records returned across all shards. */
  count: number;

  /** The returned records. */
  items: EntityItem[];

  /**
   * A map of page keys, used to query the next page of data on each shard.
   *
   * The keys of this object are the `shardedKey` value passed to each {@link ShardQueryFunction | `ShardQueryFunction`}.
   *
   * The values are the `pageKey` returned by the previous query on that shard.
   */
  pageKeys: Record<string, EntityIndexItem | undefined>;
}

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
   * {@link Config | `EntityManager.config.entities.<entityToken>.keys.<keyToken>.elements`}, except for the property specified in {@link Config | `EntityManager.config.tokens.shardKey`}.
   *
   * Values may be `undefined` if it makes sense within the context of the data.
   * This data will be used to generate query keys across all shards.
   */
  item?: EntityItem;

  /** A valid {@link ShardQueryFunction | 'ShardQueryFunction'} that specifies the query of a single page of data on a single shard. */
  shardQuery: ShardQueryFunction;

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
   * {@link QueryResult.pageKeys | `pageKeys`} returned by the previous iteration of this query.
   */
  pageKeys?: Record<string, EntityIndexItem | undefined>;

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
}

/**
 * The EntityManager class applies a configuration-driven sharded data model &
 * query strategy to NoSql data.
 *
 * @category Entity Manager
 */
export class EntityManager {
  #config: Config;
  #logger: Logger;

  /**
   * Create an EntityManager instance.
   *
   * @param options - EntityManager options.
   */
  constructor({ config = {}, logger = console }: EntityManagerOptions = {}) {
    this.#config = configSchema.parse(config);
    this.#logger = logger;
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
   * Add sharded keys to an entity item. Does not mutate original item.
   *
   * @param entityToken - Entity token.
   * @param item - Entity item.
   * @param overwrite - Overwrite existing properties.
   *
   * @returns Decorated clone of {@link EntityItem | `EntityItem`}.
   */
  addKeys(entityToken: string, item: EntityItem, overwrite = false) {
    // Validate item.
    validateEntityItem(item);

    // Get tokens.
    const { entity, shardKey: shardKeyToken } = this.config.tokens;

    // Clone item.
    const newItem = {
      ...construct(crush(item)),
      [entity]: entityToken,
    } as EntityItem;

    // Add shardKey.
    if (overwrite || isNil(newItem[shardKeyToken])) {
      newItem[shardKeyToken] = getShardKey(this.config, entityToken, newItem);
    }

    // Add keys.
    const { keys } = getEntityConfig(this.config, entityToken);

    for (const [keyToken, { encode }] of Object.entries(keys))
      if (overwrite || isNil(newItem[keyToken]))
        newItem[keyToken] = encode(newItem);

    // Remove shaken item.
    const result = shake(omit(newItem, [entity]), isNil);

    this.#logger.debug('added sharded index keys to entity item', {
      entityToken,
      item,
      overwrite,
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
    item: EntityItem,
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
   */
  async query({
    entityToken,
    keyToken,
    item = {},
    shardQuery,
    limit,
    pageKeys,
    pageSize,
    timestampFrom = 0,
    timestampTo = Date.now(),
  }: QueryOptions): Promise<QueryResult> {
    // Validate item.
    validateEntityItem(item);

    // Default pageKeys.
    pageKeys ??= objectify(
      this.getKeySpace(entityToken, keyToken, item, timestampFrom, timestampTo),
      (key) => key,
      () => undefined,
    );

    // Return empty result if no pageKeys.
    if (!Object.keys(pageKeys).length)
      return { count: 0, items: [], pageKeys: {} };

    // Get defaults.
    const { defaultLimit, defaultPageSize } = getEntityConfig(
      this.config,
      entityToken,
    );

    // Default & validate limit.
    limit ??= defaultLimit;

    if (!(limit === Infinity || (isInt(limit) && limit >= 1)))
      throw new Error('limit must be a positive integer or Infinity.');

    // Default & validate pageSize.
    pageSize ??= defaultPageSize;

    // Validate pageSize.
    if (!(isInt(pageSize) && pageSize >= 1))
      throw new Error('pageSize must be a positive integer');

    // Iterate search over pages.
    const result: QueryResult = { count: 0, items: [], pageKeys };

    do {
      // TODO: This loop will blow up as shards scale, since at a minimum it will return shardCount * pageSize
      // items, which may be >> limit. Probably the way to fix this is to limit the number of shards queried per
      // iteration in order to keep shardsQueried * pageSize > (limit - items.length) but only just.

      // Query every shard in pageKeys.
      const shardQueryResults = (await Promise.all(
        Object.entries(result.pageKeys).map(
          ([shardedKey, pageKey]) =>
            new Promise((resolve) => {
              shardQuery(shardedKey, pageKey, pageSize)
                .then(({ count, items, pageKey }) => {
                  resolve({ count, items, pageKey, shardedKey });
                })
                .catch((error: unknown) => {
                  throw error;
                });
            }),
        ),
      )) as (ShardQueryResult & { shardedKey: string })[];

      // Reduce shardQueryResults into a single result.
      const pageResult = shardQueryResults.reduce<QueryResult>(
        (shardedQueryResult, { count, items, pageKey, shardedKey }) => ({
          count: shardedQueryResult.count + count,
          items: [...shardedQueryResult.items, ...items],
          pageKeys: {
            ...shardedQueryResult.pageKeys,
            ...(pageKey === undefined ? {} : { [shardedKey]: pageKey }),
          },
        }),
        { count: 0, items: [], pageKeys: {} },
      );

      result.count += pageResult.count;
      result.items = [...result.items, ...pageResult.items];
      result.pageKeys = pageResult.pageKeys;
    } while (
      Object.keys(result.pageKeys).length &&
      result.items.length < limit
    );

    this.#logger.debug('queried entity across shards', {
      entityToken,
      keyToken,
      item,
      limit,
      pageKeys,
      pageSize,
      result,
    });

    return result;
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

    const indexKeys = alphabetical(
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

    if (indexKeys.length !== indexValues.length)
      throw new Error('index rehydration key-value mismatch');

    const indexProperties = zipToObject(indexKeys, indexValues);

    const rehydrated = indexComponents.reduce(
      (index, component) => ({
        ...index,
        [component]: getEntityKeyConfig(
          this.config,
          entityToken,
          component,
        ).encode(indexProperties),
      }),
      {},
    );

    this.#logger.debug('rehydrated index', {
      entityToken,
      index,
      value,
      delimiter,
      indexComponents,
      indexKeys,
      indexValues,
      indexProperties,
      rehydrated,
    });

    return rehydrated;
  }
}
