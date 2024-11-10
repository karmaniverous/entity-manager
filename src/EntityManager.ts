import { addKeys } from './addKeys';
import type { BaseConfigMap } from './BaseConfigMap';
import type { Config } from './Config';
import type { EntityItem } from './EntityItem';
import type { EntityToken } from './EntityToken';
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
export class EntityManager<C extends BaseConfigMap> {
  #config: ParsedConfig;
  readonly logger: Pick<Console, 'debug' | 'error'>;

  /**
   * Create an EntityManager instance.
   *
   * @param config - EntityManager {@link Config | `Config`} object.
   * @param logger - Logger object (defaults to `console`, must support `debug` & `error` methods).
   */
  constructor(
    config: Config<C>,
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
   * Update generated properties, hash key, and range key on an {@link EntityItem | `EntityItem`} object.
   *
   * @param entityToken - {@link Config | `Config`} `entities` key.
   * @param item - {@link EntityItem | `EntityItem`} object.
   * @param overwrite - Overwrite existing properties (default `false`).
   *
   * @returns Shallow clone of `item` with updated properties.
   *
   * @throws `Error` if `entityToken` is invalid.
   */
  addKeys(
    entityToken: EntityToken<C>,
    item: EntityItem<C>,
    overwrite = false,
  ): EntityItem<C> {
    return addKeys(this, entityToken, item, overwrite);
  }

  /**
   * Strips generated properties, hash key, and range key from an {@link EntityItem | `EntityItem`} object.
   *
   * @param entityToken - {@link Config | `Config`} `entities` key.
   * @param item - {@link EntityItem | `EntityItem`} object.
   *
   * @returns Shallow clone of `item` without generated properties, hash key or range key.
   *
   * @throws `Error` if `entityToken` is invalid.
   */
  removeKeys(entityToken: EntityToken<C>, item: EntityItem<C>): EntityItem<C> {
    return removeKeys(this, entityToken, item);
  }

  /**
   * Query a database entity across shards in a provider-generic fashion.
   *
   * @remarks
   * The provided `shardQueryMap` performs the actual query of individual data pages on individual index/shard combinations.
   *
   * Individual shard query results will be combined, deduped by {@link Config | `Config`} `uniqueProperty` value, and sorted by {@link QueryOptions.sortOrder | `sortOrder`}.
   *
   * In queries on sharded data, expect the leading and trailing edges of returned data pages to interleave somewhat with preceding & following pages.
   *
   * Unsharded query results should sort & page as expected.
   *
   * @param options - {@link QueryOptions | `QueryOptions`} object.
   *
   * @returns {@link QueryResult} object.
   *
   * @throws Error if `options` {@link QueryOptions.pageKeyMap | `pageKeyMap`} `pageKeyMap` keys do not match {@link QueryOptions.shardQueryMap | `shardQueryMap`} keys.
   */
  async query(options: QueryOptions<C>): Promise<QueryResult<C>> {
    return await query(this, options);
  }
}
