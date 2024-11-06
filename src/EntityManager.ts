import type { Exactify, TranscodeMap } from '@karmaniverous/entity-tools';

import { addKeys } from './addKeys';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Config, ConfigEntity, EntityMap, ItemMap } from './Config';
import { configSchema, type ParsedConfig } from './ParsedConfig';
import { query } from './query';
import type { QueryOptions } from './QueryOptions';
import type { QueryResult } from './QueryResult';
import { removeKeys } from './removeKeys';

/**
 * The EntityManager class applies a configuration-driven sharded data model &
 * query strategy to NoSql data.
 *
 * @category Entity Manager
 */
export class EntityManager<
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  T extends TranscodeMap,
> {
  #config: ParsedConfig;
  logger: Pick<Console, 'debug' | 'error'>;

  /**
   * Create an EntityManager instance.
   *
   * @param config - EntityManager {@link Config | `Config`} object.
   * @param logger - Logger object (defaults to `console`, must support `debug` & `error` methods).
   */
  constructor(
    config: Config<M, HashKey, RangeKey, T>,
    logger: Pick<Console, 'debug' | 'error'> = console,
  ) {
    this.#config = configSchema.parse(config);
    this.logger = logger;
  }

  /**
   * Get the current EntityManager {@link Config | `Config`} object.
   *
   * @returns Current {@link Config | `Config`} object.
   */
  get config(): ParsedConfig {
    return this.#config;
  }

  /**
   * Set the current EntityManager {@link Config | `Config`} object.
   *
   * @param value - {@link Config | `Config`} object.
   */
  set config(value) {
    this.#config = configSchema.parse(value);
  }

  /**
   * Update generated properties, hash key, and range key on an {@link ItemMap | `ItemMap`} object.
   *
   * @param entityToken - {@link ConfigKeys.entities | `this.config.entities`} key.
   * @param item - {@link ItemMap | `ItemMap`} object.
   * @param overwrite - Overwrite existing properties (default `false`).
   *
   * @returns Shallow clone of `item` with updated properties.
   *
   * @throws `Error` if `entityToken` is invalid.
   */
  addKeys<
    Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
    EntityToken extends keyof Exactify<M> & string,
  >(
    entityToken: EntityToken,
    item: Partial<Item>,
    overwrite = false,
  ): Partial<Item> {
    return addKeys(this, entityToken, item, overwrite);
  }

  /**
   * Strips generated properties, hash key, and range key from an {@link ItemMap | `ItemMap`} object.
   *
   * @param entityToken - {@link ConfigKeys.entities | `this.config.entities`} key.
   * @param item - {@link ItemMap | `ItemMap`} object.
   *
   * @returns Shallow clone of `item` without generated properties, hash key or range key.
   *
   * @throws `Error` if `entityToken` is invalid.
   */
  removeKeys<
    Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
    EntityToken extends keyof Exactify<M> & string,
  >(entityToken: EntityToken, item: Partial<Item>): Partial<Item> {
    return removeKeys(this, entityToken, item);
  }

  /**
   * Query a database entity across shards in a provider-generic fashion.
   *
   * @remarks
   * The provided `shardQueryMap` performs the actual query of individual data pages on individual index/shard combinations.
   *
   * Individual shard query results will be combined, deduped by {@link ConfigEntity.uniqueProperty} property value, and sorted by {@link QueryOptions.sortOrder | `sortOrder`}.
   *
   * In queries on sharded data, expect the leading and trailing edges of returned data pages to interleave somewhat with preceding & following pages.
   *
   * Unsharded query results should sort & page as expected.
   *
   * @param options - {@link QueryOptions | `QueryOptions`} object.
   *
   * @returns {@link QueryResult} object.
   *
   * @throws Error if {@link QueryOptions.shardQueryMapBuilder | `shardQueryMapBuilder`} `pageKeyMap` keys do not match its `shardQueryMap` keys.
   */
  async query<
    IndexParams,
    Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
    EntityToken extends keyof Exactify<M> & string,
  >(
    options: QueryOptions<
      IndexParams,
      Item,
      EntityToken,
      M,
      HashKey,
      RangeKey,
      T
    >,
  ): Promise<QueryResult<Item, EntityToken, M, HashKey, RangeKey>> {
    const { shardQueryMapBuilder, ...baseOptions } = options;
    const { entityToken, pageKeyMap } = shardQueryMapBuilder;
    const shardQueryMap = shardQueryMapBuilder.build();

    return await query(this, {
      entityToken,
      pageKeyMap,
      shardQueryMap,
      ...baseOptions,
    });
  }
}
