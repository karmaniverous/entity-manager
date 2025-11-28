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
 * @typeParam CC - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeRegistry | `TranscodeRegistry`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 * @typeParam EntityClient - {@link BaseEntityClient | `BaseEntityClient`} derived class instance.
 * @typeParam IndexParams - Database platform-specific, index-specific query parameters.
 * @typeParam CF - Optional values-first config literal type for page key narrowing.
 * @typeParam K - Optional projection keys; narrows item shape when provided.
 *
 * @category QueryBuilder
 */
export abstract class BaseQueryBuilder<
  CC extends BaseConfigMap,
  EntityClient extends BaseEntityClient<CC, any>,
  IndexParams,
  ET extends EntityToken<CC> = EntityToken<CC>,
  ITS extends string = string,
  CF = unknown,
  K = unknown,
> {
  /** {@link BaseEntityClient | `EntityClient`} instance. */
  readonly entityClient: EntityClient;

  /** Entity token. */
  readonly entityToken: EntityToken<CC>;

  /** Hash key token. */
  readonly hashKeyToken: CC['HashKey'] | CC['ShardedKeys'];

  /** Dehydrated page key map. */
  readonly pageKeyMap?: string;

  /**
   * Maps `indexToken` values to database platform-specific query parameters.
   *
   * @protected
   */
  readonly indexParamsMap: Record<ITS, IndexParams> = {} as Record<
    ITS,
    IndexParams
  >;

  /** BaseQueryBuilder constructor. */
  constructor(options: BaseQueryBuilderOptions<CC, EntityClient>) {
    const { entityClient, entityToken, hashKeyToken, pageKeyMap } = options;

    this.entityClient = entityClient;
    this.entityToken = entityToken;
    this.hashKeyToken = hashKeyToken;
    this.pageKeyMap = pageKeyMap;
  }

  protected abstract getShardQueryFunction(
    indexToken: ITS,
  ): ShardQueryFunction<CC, ET, ITS, CF, K>;

  /**
   * Builds a {@link ShardQueryMap | `ShardQueryMap`} object.
   *
   * @returns - The {@link ShardQueryMap | `ShardQueryMap`} object.
   */
  build(): ShardQueryMap<CC, ET, ITS, CF, K> {
    return mapValues(this.indexParamsMap, (_indexConfig, indexToken) =>
      this.getShardQueryFunction(indexToken),
    ) as ShardQueryMap<CC, ET, ITS, CF, K>;
  }

  async query(options: QueryBuilderQueryOptions<CC, ET, CF>) {
    const {
      entityClient: { entityManager },
      entityToken,
      pageKeyMap,
    } = this;
    const shardQueryMap = this.build();

    return await entityManager.query<ET, ITS, CF, K>({
      ...options,
      entityToken,
      pageKeyMap,
      shardQueryMap,
    });
  }
}
