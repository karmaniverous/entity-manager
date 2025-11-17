// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityMap, TranscodeRegistry } from '@karmaniverous/entity-tools'; // imported to support API docs
import { mapValues } from 'radash';

import type { BaseEntityClient } from '../BaseEntityClient';
import type {
  BaseConfigMap,
  EntityToken,
  ShardQueryFunction,
  ShardQueryMap,
} from '../EntityManager';
import type { BaseQueryBuilderOptions } from './BaseQueryBuilderOptions';
import type { QueryBuilderQueryOptions } from './QueryBuilderQueryOptions';

/**
 * Abstract base class supporting a fluent API for building a {@link ShardQueryMap | `ShardQueryMap`} using a database client.
 *
 * @typeParam C - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeMap | `TranscodeMap`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 * @typeParam EntityClient - {@link BaseEntityClient | `BaseEntityClient`} derived class instance.
 * @typeParam IndexParams - Database platform-specific, index-specific query parameters.
 *
 * @category QueryBuilder
 */
export abstract class BaseQueryBuilder<
  C extends BaseConfigMap,
  EntityClient extends BaseEntityClient<C>,
  IndexParams,
> {
  /** {@link BaseEntityClient | `EntityClient`} instance. */
  readonly entityClient: EntityClient;

  /** Entity token. */
  readonly entityToken: EntityToken<C>;

  /** Hash key token. */
  readonly hashKeyToken: C['HashKey'] | C['ShardedKeys'];

  /** Dehydrated page key map. */
  readonly pageKeyMap?: string;

  /**
   * Maps `indexToken` values to database platform-specific query parameters.
   *
   * @protected
   */
  readonly indexParamsMap: Record<string, IndexParams> = {};

  /** BaseQueryBuilder constructor. */
  constructor(options: BaseQueryBuilderOptions<C, EntityClient>) {
    const { entityClient, entityToken, hashKeyToken, pageKeyMap } = options;

    this.entityClient = entityClient;
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
    const {
      entityClient: { entityManager },
      entityToken,
      pageKeyMap,
    } = this;
    const shardQueryMap = this.build();

    return await entityManager.query({
      ...options,
      entityToken,
      pageKeyMap,
      shardQueryMap,
    });
  }
}
