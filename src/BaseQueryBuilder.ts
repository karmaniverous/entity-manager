import type {
  EntityMap,
  Exactify,
  TranscodeMap,
} from '@karmaniverous/entity-tools';
import { mapValues } from 'radash';

import { BaseEntityClient } from './BaseEntityClient';
import type { BaseQueryBuilderOptions } from './BaseQueryBuilderOptions';
import type { EntityItem } from './EntityItem';
import { EntityManager } from './EntityManager';
import type { QueryBuilderQueryOptions } from './QueryBuilderQueryOptions';
import type { ShardQueryFunction } from './ShardQueryFunction';
import type { ShardQueryMap } from './ShardQueryMap';

/**
 * Abstract base class supporting a fluent API for building a {@link ShardQueryMap | `ShardQueryMap`} using a database client.
 *
 * @category QueryBuilder
 */
export abstract class BaseQueryBuilder<
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  ShardedKeys extends string,
  UnshardedKeys extends string,
  TranscodedProperties extends string,
  T extends TranscodeMap,
  Item extends EntityItem<M, HashKey, RangeKey, ShardedKeys, UnshardedKeys>,
  IndexParams,
  EntityClient extends BaseEntityClient,
> {
  /** {@link BaseEntityClient | `EntityClient`} instance. */
  public readonly entityClient: EntityClient;

  /** {@link EntityManager | `EntityManager`} instance. */
  public readonly entityManager: EntityManager<
    M,
    HashKey,
    RangeKey,
    ShardedKeys,
    UnshardedKeys,
    TranscodedProperties,
    T
  >;

  /** Entity token. */
  public readonly entityToken: keyof Exactify<M> & string;

  /** Hash key token. */
  public readonly hashKeyToken: HashKey | ShardedKeys;

  /** Dehydrated page key map. */
  public readonly pageKeyMap?: string;

  /**
   * Maps `indexToken` values to database platform-specific query parameters.
   *
   * @protected
   */
  readonly indexParamsMap: Record<string, IndexParams> = {};

  /** BaseQueryBuilder constructor. */
  constructor(
    options: BaseQueryBuilderOptions<
      M,
      HashKey,
      RangeKey,
      ShardedKeys,
      UnshardedKeys,
      TranscodedProperties,
      T,
      EntityClient
    >,
  ) {
    const {
      entityClient,
      entityManager,
      entityToken,
      hashKeyToken,
      pageKeyMap,
    } = options;

    this.entityClient = entityClient;
    this.entityManager = entityManager;
    this.entityToken = entityToken;
    this.hashKeyToken = hashKeyToken;
    this.pageKeyMap = pageKeyMap;
  }

  protected abstract getShardQueryFunction(
    indexToken: string,
  ): ShardQueryFunction<Item>;

  /**
   * Builds a {@link ShardQueryMap | `ShardQueryMap`} object.
   *
   * @returns - The {@link ShardQueryMap | `ShardQueryMap`} object.
   */
  build(): ShardQueryMap<Item> {
    return mapValues(this.indexParamsMap, (indexConfig, indexToken) =>
      this.getShardQueryFunction(indexToken),
    );
  }

  async query(
    options: QueryBuilderQueryOptions<
      M,
      HashKey,
      RangeKey,
      ShardedKeys,
      UnshardedKeys,
      Item
    >,
  ) {
    const { entityManager, entityToken, pageKeyMap } = this;
    const shardQueryMap = this.build();

    return await entityManager.query<Item>({
      ...options,
      entityToken,
      pageKeyMap,
      shardQueryMap,
    });
  }
}
