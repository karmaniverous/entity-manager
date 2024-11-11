// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityMap, TranscodeMap } from '@karmaniverous/entity-tools';

import type { BaseConfigMap } from './BaseConfigMap';
import type { BaseEntityClient } from './BaseEntityClient';
import type { EntityManager } from './EntityManager';
import type { EntityToken } from './EntityToken';

/**
 * Constructor options for {@link BaseQueryBuilder | `BaseQueryBuilder`}.
 *
 * @typeParam C - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeMap | `TranscodeMap`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 * @typeParam EntityClient - {@link BaseEntityClient | `BaseEntityClient`} derived class instance.
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
