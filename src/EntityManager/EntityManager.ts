/* eslint-disable @typescript-eslint/no-unused-vars */
import type { EntityMap, TranscodeRegistry } from '@karmaniverous/entity-tools'; // imported to support API docs

import { addKeys } from './addKeys';
import type { BaseConfigMap } from './BaseConfigMap';
import type { Config } from './Config';
import { encodeGeneratedProperty } from './encodeGeneratedProperty';
import type { EntityKey } from './EntityKey';
import type { EntityToken } from './EntityToken';
import type { EntityToken as ETToken } from './EntityToken';
import { findIndexToken } from './findIndexToken';
import { getPrimaryKey } from './getPrimaryKey';
import type { IndexTokensOf } from './PageKey';
import { configSchema, type ParsedConfig } from './ParsedConfig';
import { query } from './query';
import type { QueryOptions } from './QueryOptions';
import type { QueryResult } from './QueryResult';
import { removeKeys } from './removeKeys';
import type { StorageRecord } from './StorageRecord';
import type {
  EntityItem as DomainItem,
  EntityItemPartial,
  EntityRecord as DbRecord,
  EntityRecordPartial,
} from './TokenAware';

/**
 * The EntityManager class applies a configuration-driven sharded data model &
 * query strategy to NoSql data.
 *
 * @typeParam CC - {@link ConfigMap | `ConfigMap`} that defines the configuration's {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeRegistry | `TranscodeRegistry`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 * @typeParam CF - Values-first config literal type captured at construction
 *                 time (phantom generic; type-only). This is used by downstream
 *                 adapters to infer index-token unions (ITS) and per-index page
 *                 key shapes.
 *
 * @remarks
 * While the {@link EntityManager.query | `query`} method is `public`, normally it should not be called directly. The `query` method is used by a platform-specific {@link BaseQueryBuilder.query | `QueryBuilder.query`} method to provide a fluent query API.
 *
 * @category EntityManager
 */
export class EntityManager<CC extends BaseConfigMap, CF = unknown> {
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
    // Accept a compile-time-only `entitiesSchema` key on values-first configs.
    // We strip it here so the same literal config can be used with either the
    // factory or the direct constructor without tripping Zod's strict parser.
    //
    // This keeps runtime semantics unchanged and avoids widening ParsedConfig.
    const cfgWithOptionalES = config as Config<CC> & {
      entitiesSchema?: unknown;
    };
    const { entitiesSchema: _ignored, ...configForParse } = cfgWithOptionalES;

    this.#config = configSchema.parse(configForParse as unknown as Config<CC>);
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
    item: EntityItemPartial<CC, ET>,
    overwrite?: boolean,
  ): EntityRecordPartial<CC, ET>;
  /**
   * @overload
   */
  addKeys<ET extends EntityToken<CC>>(
    entityToken: ET,
    item: EntityItemPartial<CC, ET>[],
    overwrite?: boolean,
  ): EntityRecordPartial<CC, ET>[];

  addKeys<ET extends EntityToken<CC>>(
    entityToken: ET,
    i: EntityItemPartial<CC, ET> | EntityItemPartial<CC, ET>[],
    overwrite = false,
  ): EntityRecordPartial<CC, ET> | EntityRecordPartial<CC, ET>[] {
    if (Array.isArray(i)) {
      return i.map((item) =>
        addKeys(
          this,
          entityToken,
          item as unknown as EntityItem<CC>,
          overwrite,
        ),
      ) as unknown as EntityRecordPartial<CC, ET>[];
    }

    return addKeys(
      this,
      entityToken,
      i as unknown as EntityItem<CC>,
      overwrite,
    ) as unknown as EntityRecordPartial<CC, ET>;
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
    item: EntityItemPartial<CC, ET>,
    overwrite?: boolean,
  ): EntityKey<CC>[];
  /**
   * @overload
   */
  getPrimaryKey<ET extends EntityToken<CC>>(
    entityToken: ET,
    items: EntityItemPartial<CC, ET>[],
    overwrite?: boolean,
  ): EntityKey<CC>[];

  getPrimaryKey<ET extends EntityToken<CC>>(
    entityToken: ET,
    i: EntityItemPartial<CC, ET> | EntityItemPartial<CC, ET>[],
    overwrite = false,
  ): EntityKey<CC>[] {
    if (Array.isArray(i)) {
      return i.flatMap((item) =>
        getPrimaryKey(
          this,
          entityToken,
          item as unknown as EntityItem<CC>,
          overwrite,
        ),
      );
    }

    return getPrimaryKey(
      this,
      entityToken,
      i as unknown as EntityItem<CC>,
      overwrite,
    );
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
   * Overloads:
   */
  removeKeys<ET extends EntityToken<CC>>(
    entityToken: ET,
    item: DbRecord<CC, ET>,
  ): DomainItem<CC, ET>;
  removeKeys<ET extends EntityToken<CC>, K = unknown>(
    entityToken: ET,
    item: EntityRecordPartial<CC, ET, K>,
  ): EntityItemPartial<CC, ET, K>;
  removeKeys<ET extends EntityToken<CC>>(
    entityToken: ET,
    items: DbRecord<CC, ET>[],
  ): DomainItem<CC, ET>[];
  removeKeys<ET extends EntityToken<CC>, K = unknown>(
    entityToken: ET,
    items: EntityRecordPartial<CC, ET, K>[],
  ): EntityItemPartial<CC, ET, K>[];

  removeKeys<ET extends EntityToken<CC>>(
    entityToken: ET,
    i: DbRecord<CC, ET> | DbRecord<CC, ET>[],
  ): DomainItem<CC, ET> | DomainItem<CC, ET>[] {
    if (Array.isArray(i)) {
      return i.map((item) =>
        removeKeys(this, entityToken, item as unknown as StorageRecord<CC>),
      ) as unknown as DomainItem<CC, ET>[];
    }

    return removeKeys(
      this,
      entityToken,
      i as unknown as StorageRecord<CC>,
    ) as unknown as DomainItem<CC, ET>;
  }

  /**
   * Find an index token based on the configured hash and range key tokens.
   *
   * @param hashKeyToken - Index hash key token (global hashKey or a sharded generated key).
   * @param rangeKeyToken - Index range key token (global rangeKey, unsharded generated key, or a transcodable scalar).
   * @param suppressError - When false (default), throws if no match; when true, returns undefined instead.
   *
   * @returns A configured index token (narrowed to the CF.indexes key union) or undefined when allowed.
   *
   * @throws `Error` if no match is found and `suppressError` is not `true`.
   */
  findIndexToken(
    hashKeyToken: CC['HashKey'] | CC['ShardedKeys'],
    rangeKeyToken:
      | CC['RangeKey']
      | CC['UnshardedKeys']
      | CC['TranscodedProperties'],
    suppressError?: false,
  ): IndexTokensOf<CF>;
  findIndexToken(
    hashKeyToken: CC['HashKey'] | CC['ShardedKeys'],
    rangeKeyToken:
      | CC['RangeKey']
      | CC['UnshardedKeys']
      | CC['TranscodedProperties'],
    suppressError: true,
  ): IndexTokensOf<CF> | undefined;
  findIndexToken(
    hashKeyToken: CC['HashKey'] | CC['ShardedKeys'],
    rangeKeyToken:
      | CC['RangeKey']
      | CC['UnshardedKeys']
      | CC['TranscodedProperties'],
    suppressError?: boolean,
  ): IndexTokensOf<CF> | undefined {
    // Dispatch with a literal to satisfy overload selection.
    return suppressError === true
      ? findIndexToken(this, hashKeyToken, rangeKeyToken, true)
      : findIndexToken(this, hashKeyToken, rangeKeyToken, false);
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
  async query<
    ET extends ETToken<CC>,
    ITS extends string,
    CF = unknown,
    K = unknown,
  >(
    options: QueryOptions<CC, ET, ITS, CF, K>,
  ): Promise<QueryResult<CC, ET, ITS, K>> {
    return await query<CC, ET, ITS, CF, K>(this, options);
  }
}
