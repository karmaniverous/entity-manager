import type {
  Exactify,
  PropertiesOfType,
  TranscodeMap,
} from '@karmaniverous/entity-tools';
import { mapValues } from 'radash';

import { BaseEntityClient } from './BaseEntityClient';
import type { BaseQueryBuilderOptions } from './BaseQueryBuilderOptions';
import type { EntityMap, ItemMap } from './Config';
import { EntityManager } from './EntityManager';
import type { QueryBuilderQueryOptions } from './QueryBuilderQueryOptions';
import type { ShardQueryFunction } from './ShardQueryFunction';
import type { ShardQueryMap } from './ShardQueryMap';

/**
 * Abstract base class supporting a fluent API for building a {@link ShardQueryMap | `ShardQueryMap`} using a database client.
 *
 * @category ShardQueryMapBuilder
 */
export abstract class BaseQueryBuilder<
  IndexParams,
  EntityClient extends BaseEntityClient,
  Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  T extends TranscodeMap,
> {
  /** {@link BaseEntityClient | `EntityClient`} instance. */
  public readonly entityClient: EntityClient;

  /** {@link EntityManager | `EntityManager`} instance. */
  public readonly entityManager: EntityManager<M, HashKey, RangeKey, T>;

  /** Entity token. */
  public readonly entityToken: EntityToken;

  /** Hash key token. */
  public readonly hashKeyToken:
    | PropertiesOfType<M[EntityToken], never>
    | HashKey;

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
      EntityClient,
      EntityToken,
      M,
      HashKey,
      RangeKey,
      T
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
    options: QueryBuilderQueryOptions<Item, EntityToken, M, HashKey, RangeKey>,
  ) {
    const { entityManager, entityToken, pageKeyMap } = this;
    const shardQueryMap = this.build();

    return await entityManager.query<Item, EntityToken>({
      ...options,
      entityToken,
      pageKeyMap,
      shardQueryMap,
    });
  }
}
