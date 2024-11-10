import type { BaseConfigMap } from './BaseConfigMap';
import type { BaseEntityClient } from './BaseEntityClient';
import type { EntityManager } from './EntityManager';
import type { EntityToken } from './EntityToken';

/**
 * Constructor options for {@link BaseQueryBuilder | `BaseQueryBuilder`}.
 *
 * @category QueryBuilder
 */
export interface BaseQueryBuilderOptions<
  C extends BaseConfigMap,
  EntityClient extends BaseEntityClient,
> {
  /** {@link BaseEntityClient | `EntityClient`} instance. */
  entityClient: EntityClient;

  /** {@link EntityManager | `EntityManager`} instance. */
  entityManager: EntityManager<C>;

  /** Entity token. */
  entityToken: EntityToken<C>;

  /** Hash key token. */
  hashKeyToken: C['HashKey'] | C['ShardedKeys'];

  /** Dehydrated page key map. */
  pageKeyMap?: string;
}
