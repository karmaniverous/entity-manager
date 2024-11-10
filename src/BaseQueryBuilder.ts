import { mapValues } from 'radash';

import type { BaseConfigMap } from './BaseConfigMap';
import type { BaseEntityClient } from './BaseEntityClient';
import type { BaseQueryBuilderOptions } from './BaseQueryBuilderOptions';
import type { EntityManager } from './EntityManager';
import type { EntityToken } from './EntityToken';
import type { QueryBuilderQueryOptions } from './QueryBuilderQueryOptions';
import type { ShardQueryFunction } from './ShardQueryFunction';
import type { ShardQueryMap } from './ShardQueryMap';

/**
 * Abstract base class supporting a fluent API for building a {@link ShardQueryMap | `ShardQueryMap`} using a database client.
 *
 * @category QueryBuilder
 */
export abstract class BaseQueryBuilder<
  C extends BaseConfigMap,
  EntityClient extends BaseEntityClient,
  IndexParams,
> {
  /** {@link BaseEntityClient | `EntityClient`} instance. */
  public readonly entityClient: EntityClient;

  /** {@link EntityManager | `EntityManager`} instance. */
  public readonly entityManager: EntityManager<C>;

  /** Entity token. */
  public readonly entityToken: EntityToken<C>;

  /** Hash key token. */
  public readonly hashKeyToken: C['HashKey'] | C['ShardedKeys'];

  /** Dehydrated page key map. */
  public readonly pageKeyMap?: string;

  /**
   * Maps `indexToken` values to database platform-specific query parameters.
   *
   * @protected
   */
  readonly indexParamsMap: Record<string, IndexParams> = {};

  /** BaseQueryBuilder constructor. */
  constructor(options: BaseQueryBuilderOptions<C, EntityClient>) {
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
  ): ShardQueryFunction<C>;

  /**
   * Builds a {@link ShardQueryMap | `ShardQueryMap`} object.
   *
   * @returns - The {@link ShardQueryMap | `ShardQueryMap`} object.
   */
  build(): ShardQueryMap<C> {
    return mapValues(this.indexParamsMap, (indexConfig, indexToken) =>
      this.getShardQueryFunction(indexToken),
    );
  }

  async query(options: QueryBuilderQueryOptions<C>) {
    const { entityManager, entityToken, pageKeyMap } = this;
    const shardQueryMap = this.build();

    return await entityManager.query({
      ...options,
      entityToken,
      pageKeyMap,
      shardQueryMap,
    });
  }
}
