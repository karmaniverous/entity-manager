// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityMap, TranscodeRegistry } from '@karmaniverous/entity-tools'; // imported to support API docs

import { addKeys } from './addKeys';
import type { BaseConfigMap } from './BaseConfigMap';
import type { Config } from './Config';
import { encodeGeneratedProperty } from './encodeGeneratedProperty';
import type { EntityItem } from './EntityItem';
import type { EntityKey } from './EntityKey';
import type { EntityRecord } from './EntityRecord';
import type { EntityToken } from './EntityToken';
import { findIndexToken } from './findIndexToken';
import { getPrimaryKey } from './getPrimaryKey';
import { configSchema, type ParsedConfig } from './ParsedConfig';
import { query } from './query';
import type { QueryOptions } from './QueryOptions';
import type { QueryResult } from './QueryResult';
import { removeKeys } from './removeKeys';
import type { EIBT, ERBT } from './TokenAware';

/**
 * The EntityManager class applies a configuration-driven sharded data model &
 * query strategy to NoSql data.
 *
 * @typeParam CC - {@link ConfigMap | `ConfigMap`} that defines the configuration's {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeRegistry | `TranscodeRegistry`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 *
 * @remarks
 * While the {@link EntityManager.query | `query`} method is `public`, normally it should not be called directly. The `query` method is used by a platform-specific {@link BaseQueryBuilder.query | `QueryBuilder.query`} method to provide a fluent query API.
 *
 * @category EntityManager
 */
export class EntityManager<CC extends BaseConfigMap> {
  #config: ParsedConfig;

  /** Logger object (defaults to `console`, must support `debug` & `error` methods). */
  readonly logger: Pick<Console, 'debug' | 'error'>;

  /**
   * Create an EntityManager instance.
   *
   * @param config - EntityManager {@link Config | `Config`} object.
   * @param logger - Logger object (defaults to `console`, must support `debug` & `error` methods).
   */
  constructor(
    config: Config<CC>,
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
   * @param property - {@link Config | Config} `generatedProperties` key.
   * @param item - {@link EntityItem | `EntityItem`} object.
   *
   * @returns Encoded generated property value.
   *
   * @throws `Error` if `property` is not a {@link Config | Config} `generatedProperties` key.
   */
  encodeGeneratedProperty(
    property: CC['ShardedKeys'] | CC['UnshardedKeys'],
    item: EntityItem<CC>,
  ): string | undefined {
    return encodeGeneratedProperty(this, property as never, item as never);
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
   *
   * @overload
   */
  addKeys<ET extends EntityToken<CC>>(
    entityToken: ET,
    item: EIBT<CC, ET>,
    overwrite?: boolean,
  ): ERBT<CC, ET>;
  /**
   * @overload
   */
  addKeys<ET extends EntityToken<CC>>(
    entityToken: ET,
    item: EIBT<CC, ET>[],
    overwrite?: boolean,
  ): ERBT<CC, ET>[];
  /**
   * @overload
   */
  addKeys(
    entityToken: EntityToken<CC>,
    item: EntityItem<CC>,
    overwrite?: boolean,
  ): EntityRecord<CC>;

  /**
   * Update generated properties, hash key, and range key on an array of {@link EntityItem | `EntityItem`} objects.
   *
   * @param entityToken - {@link Config | `Config`} `entities` key.
   * @param item - Array of {@link EntityItem | `EntityItem`} objects.
   * @param overwrite - Overwrite existing properties (default `false`).
   *
   * @returns An array of {@link EntityRecord | `EntityRecord`} objects with updated properties.
   *
   * @throws `Error` if `entityToken` is invalid.
   *
   * @overload
   */
  addKeys(
    entityToken: EntityToken<CC>,
    item: EntityItem<CC>[],
    overwrite?: boolean,
  ): EntityRecord<CC>[];

  addKeys(
    entityToken: EntityToken<CC>,
    i: EntityItem<CC> | EntityItem<CC>[],
    overwrite = false,
  ): EntityRecord<CC> | EntityRecord<CC>[] {
    if (Array.isArray(i)) {
      return i.map((item) => addKeys(this, entityToken, item, overwrite));
    }

    return addKeys(this, entityToken, i, overwrite);
  }

  /**
   * Convert one or more {@link EntityItem | `EntityItem`} objects into an array of {@link EntityKey | `EntityKey`} values.
   *
   * @param entityToken - {@link Config | `Config`} `entities` key.
   * @param item - {@link EntityItem | `EntityItem`} object, or array of them.
   * @param overwrite - Overwrite existing properties (default `false`).
   *
   * @returns An array of {@link EntityKey | `EntityKey`} values. For a single input item, returns 0..N keys (usually 1).
   *          For an array input, returns a single flattened array of keys across all inputs.
   *
   * @throws `Error` if `entityToken` is invalid.
   */
  getPrimaryKey<ET extends EntityToken<CC>>(
    entityToken: ET,
    item: EIBT<CC, ET>,
    overwrite?: boolean,
  ): EntityKey<CC>[];
  /**
   * @overload
   */
  getPrimaryKey<ET extends EntityToken<CC>>(
    entityToken: ET,
    items: EIBT<CC, ET>[],
    overwrite?: boolean,
  ): EntityKey<CC>[];
  /**
   * @overload
   */
  getPrimaryKey(
    entityToken: EntityToken<CC>,
    item: EntityItem<CC>,
    overwrite?: boolean,
  ): EntityKey<CC>[];
  getPrimaryKey(
    entityToken: EntityToken<CC>,
    items: EntityItem<CC>[],
    overwrite?: boolean,
  ): EntityKey<CC>[];
  getPrimaryKey(
    entityToken: EntityToken<CC>,
    i: EntityItem<CC> | EntityItem<CC>[],
    overwrite = false,
  ): EntityKey<CC>[] {
    if (Array.isArray(i)) {
      return i.flatMap((item) =>
        getPrimaryKey(this, entityToken, item, overwrite),
      );
    }

    return getPrimaryKey(this, entityToken, i, overwrite);
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
   *
   * @overload
   */
  removeKeys<ET extends EntityToken<CC>>(
    entityToken: ET,
    item: ERBT<CC, ET>,
  ): EIBT<CC, ET>;
  /**
   * @overload
   */
  removeKeys<ET extends EntityToken<CC>>(
    entityToken: ET,
    items: ERBT<CC, ET>[],
  ): EIBT<CC, ET>[];
  /**
   * @overload
   */
  removeKeys(
    entityToken: EntityToken<CC>,
    item: EntityRecord<CC>,
  ): EntityItem<CC>;

  /**
   * Strips generated properties, hash key, and range key from an array of {@link EntityRecord | `EntityRecord`} objects.
   *
   * @param entityToken - {@link Config | `Config`} `entities` key.
   * @param items - Array of {@link EntityRecord | `EntityRecord`} objects.
   *
   * @returns Array of {@link EntityItem | `EntityItem`} objects with generated properties, hash key & range key removed.
   *
   * @throws `Error` if `entityToken` is invalid.
   *
   * @overload
   */
  removeKeys(
    entityToken: EntityToken<CC>,
    items: EntityRecord<CC>[],
  ): EntityItem<CC>[];

  removeKeys(
    entityToken: EntityToken<CC>,
    i: EntityRecord<CC> | EntityRecord<CC>[],
  ): EntityItem<CC> | EntityItem<CC>[] {
    if (Array.isArray(i)) {
      return i.map((item) => removeKeys(this, entityToken, item));
    }

    return removeKeys(this, entityToken, i);
  }

  /**
   * Find an index token in a {@link Config | `Config`} object based on the index `hashKey` and `rangeKey`.
   *
   * @param hashKeyToken - Index hash key.
   * @param rangeKeyToken - Index range key.
   * @param suppressError - Suppress error if no match found.
   *
   * @returns  Index token if found.
   *
   * @throws `Error` if no match found and `suppressError` is not `true`.
   */
  findIndexToken(
    hashKeyToken: string,
    rangeKeyToken: string,
    suppressError?: boolean,
  ): string | undefined {
    return findIndexToken(this, hashKeyToken, rangeKeyToken, suppressError);
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
  async query(options: QueryOptions<CC>): Promise<QueryResult<CC>> {
    return await query(this, options);
  }
}
