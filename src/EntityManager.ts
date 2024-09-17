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

  /**
   * Create an EntityManager instance.
   *
   * @param config - EntityManager {@link Config | `Config`} object.
   */
  constructor(config: Config<M, HashKey, RangeKey, T>) {
    this.#config = configSchema.parse(config);
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
   * Update generated properties, hash key, and range key on an {@link ItemMap | `ItemMap`} object. Mutates `item`.
   *
   * @param item - {@link ItemMap | `ItemMap`} object.
   * @param entityToken - {@link ConfigKeys.entities | `this.config.entities`} key.
   * @param overwrite - Overwrite existing properties (default `false`).
   *
   * @returns Mutated `item` with updated properties.
   *
   * @throws `Error` if `entityToken` is invalid.
   */
  addKeys<
    Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
    EntityToken extends keyof Exactify<M> & string,
  >(item: Item, entityToken: EntityToken, overwrite = false): Item {
    return addKeys(this, item, entityToken, overwrite);
  }

  /**
   * Strips generated properties, hash key, and range key from an {@link ItemMap | `ItemMap`} object. Mutates `item`.
   *
   * @param item - {@link ItemMap | `ItemMap`} object.
   * @param entityToken - {@link ConfigKeys.entities | `this.config.entities`} key.
   *
   * @returns Mutated `item` without generated properties, hash key or range key.
   *
   * @throws `Error` if `entityToken` is invalid.
   */
  removeKeys<
    Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
    EntityToken extends keyof Exactify<M> & string,
  >(item: Item, entityToken: EntityToken): Item {
    return removeKeys(this, item, entityToken);
  }

  /**
   * Query a database entity across shards in a provider-generic fashion.
   *
   * @remarks
   * The provided {@link ShardQueryFunction | `ShardQueryFunction`} performs the actual query of individual data pages on individual shards. This function is presumed to express provider-specific query logic, including any necessary indexing or search constraints.
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
   * @throws Error if {@link QueryOptions.pageKeyMap | `pageKeyMap`} keys do not match {@link QueryOptions.queryMap | `queryMap`} keys.
   */
  async query<
    Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
    EntityToken extends keyof Exactify<M> & string,
  >(
    options: QueryOptions<Item, EntityToken, M, HashKey, RangeKey, T>,
  ): Promise<QueryResult<Item, EntityToken, M, HashKey, RangeKey>> {
    return await query(this, options);
  }
}
