// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityMap, TranscodeMap } from '@karmaniverous/entity-tools';
import { pick } from 'radash';

import { addKeys } from './addKeys';
import type { BaseConfigMap } from './BaseConfigMap';
import type { Config } from './Config';
import { encodeGeneratedProperty } from './encodeGeneratedProperty';
import type { EntityItem } from './EntityItem';
import type { EntityKey } from './EntityKey';
import type { EntityRecord } from './EntityRecord';
import type { EntityToken } from './EntityToken';
import { findIndexToken } from './findIndexToken';
import { configSchema, type ParsedConfig } from './ParsedConfig';
import { query } from './query';
import type { QueryOptions } from './QueryOptions';
import type { QueryResult } from './QueryResult';
import { removeKeys } from './removeKeys';

/**
 * The EntityManager class applies a configuration-driven sharded data model &
 * query strategy to NoSql data.
 *
 * @typeParam C - {@link ConfigMap | `ConfigMap`} that defines the configuration's {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeMap | `TranscodeMap`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 *
 * @remarks
 * While the {@link EntityManager.query | `query`} method is `public`, normally it should not be called directly. The `query` method is used by a platform-specific {@link BaseQueryBuilder.query | `QueryBuilder.query`} method to provide a fluent query API.
 *
 * @category EntityManager
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
   * Encode a generated property value. Returns a string or undefined if atomicity requirement of sharded properties not met.
   *
   * @param property - {@link Config.generatedProperties | Generated property} key.
   * @param item - Partial {@link ItemMap | `ItemMap`} object.
   *
   * @returns Encoded generated property value.
   *
   * @throws `Error` if `property` is not a {@link Config.generatedProperties | generated property}.
   */
  encodeGeneratedProperty<C extends BaseConfigMap>(
    property: C['ShardedKeys'] | C['UnshardedKeys'],
    item: EntityItem<C>,
  ): string | undefined {
    return encodeGeneratedProperty(this, property, item);
  }

  /**
   * Update generated properties, hash key, and range key on an {@link EntityItem | `EntityItem`} object.
   *
   * @param entityToken - {@link Config | `Config`} `entities` key.
   * @param item - {@link EntityItem | `EntityItem`} object.
   * @param overwrite - Overwrite existing properties (default `false`).
   *
   * @returns {@link EntityRecord | `EntityRecord`} object with updated properties.
   *
   * @throws `Error` if `entityToken` is invalid.
   */
  addKeys(
    entityToken: EntityToken<C>,
    item: EntityItem<C>,
    overwrite = false,
  ): EntityRecord<C> {
    return addKeys(this, entityToken, item, overwrite);
  }

  /**
   * Convert an {@link EntityItem | `EntityItem`} into an {@link EntityKey | `EntityKey`}.
   *
   * @param entityToken - {@link Config | `Config`} `entities` key.
   * @param item - {@link EntityItem | `EntityItem`} object.
   * @param overwrite - Overwrite existing properties (default `false`).
   *
   * @returns {@link EntityKey | `EntityKey`} extracted from shallow clone of `item` with updated properties.
   *
   * @throws `Error` if `entityToken` is invalid.
   */
  getPrimaryKey(
    entityToken: EntityToken<C>,
    item: EntityItem<C>,
    overwrite = false,
  ): EntityKey<C> {
    const { hashKey, rangeKey } = this.config;
    return pick(
      !overwrite && item[hashKey] && item[rangeKey]
        ? item
        : addKeys(this, entityToken, item, overwrite),
      [this.config.hashKey, this.config.rangeKey],
    ) as unknown as EntityKey<C>;
  }

  /**
   * Strips generated properties, hash key, and range key from an {@link EntityRecord | `EntityRecord`} object.
   *
   * @param entityToken - {@link Config | `Config`} `entities` key.
   * @param item - {@link EntityRecord | `EntityRecord`} object.
   *
   * @returns {@link EntityItem | `EntityItem`} with generated properties, hash key & range key removed.
   *
   * @throws `Error` if `entityToken` is invalid.
   */
  removeKeys(
    entityToken: EntityToken<C>,
    item: EntityRecord<C>,
  ): EntityItem<C> {
    return removeKeys(this, entityToken, item);
  }

  /**
   * Find an index token in a {@link Config | `Config`} object based on the index `hashKey` and `rangeKey`.
   *
   * @param hashKeyToken - Index hash key.
   * @param rangeKeyToken - Index range key.
   *
   * @returns  Index token if found.
   */
  findIndexToken(
    hashKeyToken: string,
    rangeKeyToken: string,
  ): string | undefined {
    return findIndexToken(this, hashKeyToken, rangeKeyToken);
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
   * **Normally this method should not be called directly!** It is used by a platform-specific {@link BaseQueryBuilder.query | `QueryBuilder.query`} method to provide a fluent query API.
   *
   * @param options - {@link QueryOptions | `QueryOptions`} object.
   *
   * @returns {@link QueryResult} object.
   *
   * @throws Error if `options` {@link QueryOptions.pageKeyMap | `pageKeyMap`} `pageKeyMap` keys do not match {@link QueryOptions.shardQueryMap | `shardQueryMap`} keys.
   *
   * @protected
   */
  async query(options: QueryOptions<C>): Promise<QueryResult<C>> {
    return await query(this, options);
  }
}
