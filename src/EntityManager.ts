import {
  alphabetical,
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

export interface Logger {
  debug: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

/**
 * EntityManager constructor options.
 */
export interface EntityManagerOptions {
  config?: RawConfig;
  logger?: Logger;
}

/**
 * A result returned by an individual shard query.
 */
interface ShardQueryResult {
  count: number;
  items: EntityItem[];
  pageKey?: EntityIndexItem;
}

/**
 * A function that queries an individual shard.
 */
export type ShardQueryFunction = (
  /** The key of the individual shard being queries. */
  shardedKey: string,

  /** The page key returned by the previous query on this shard. */
  pageKey?: EntityIndexItem,

  /** The maximum number of items to return from this query. */
  limit?: number,
) => Promise<ShardQueryResult>;

interface QueryResult {
  count: number;
  items: EntityItem[];
  pageKeys: Record<string, EntityIndexItem | undefined>;
}

export interface QueryOptions {
  entityToken: string;
  keyToken?: string;
  item?: EntityItem;
  shardQuery: ShardQueryFunction;
  limit?: number;
  pageKeys?: Record<string, EntityIndexItem | undefined>;
  pageSize?: number;

  /**
   * Lower limit to query shard space.
   *
   * @defaultValue `0`
   */
  timestampFrom?: number;

  /**
   * Lower limit to query shard space.
   *
   * @defaultValue `Date.now()`
   */
  timestampTo?: number;
}

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
   * Get the current config.
   *
   * @returns Current config.
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
   * @returns Decorated entity item.
   */
  addKeys(entityToken: string, item: EntityItem, overwrite = false) {
    // Validate item.
    validateEntityItem(item);

    // Get tokens.
    const { entity, shardKey } = this.config.tokens;

    // Clone item.
    const newItem = { ...item, [entity]: entityToken };

    // Add shardKey.
    if (overwrite || isNil(newItem[shardKey])) {
      newItem[shardKey] = getShardKey(this.config, entityToken, newItem);
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
   * Condense an index object into a delimited string.
   *
   * @param entityToken - Entity token.
   * @param index - Index token or array of entity key tokens.
   * @param item - Entity item.
   * @param delimiter - Delimiter.
   * @returns  Dehydrated index.
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
   * Return an array of sharded keys valid for a given entity token & timestamp.
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
   * Remove sharded keys from an entity item. Does not mutate original item.
   *
   * @param entityToken - Entity token.
   * @param item - Entity item.
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
   * Query an entity across shards.
   *
   * @param options - Query options.
   * @returns Query result.
   */
  async query({
    entityToken,
    keyToken = 'entityPK',
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
   * Convert a delimited string into a named index key.
   *
   * @param entityToken - Entity token.
   * @param indexToken - Index token or array of key tokens.
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
