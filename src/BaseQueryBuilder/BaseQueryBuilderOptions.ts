// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityMap, TranscodeMap } from '@karmaniverous/entity-tools'; // imported to support API docs

import type { BaseEntityClient } from '../BaseEntityClient';
import type { BaseConfigMap, EntityToken } from '../EntityManager';

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
  EntityClient extends BaseEntityClient<C>,
> {
  /** {@link BaseEntityClient | `EntityClient`} instance. */
  entityClient: EntityClient;

  /** Entity token. */
  entityToken: EntityToken<C>;

  /** Hash key token. */
  hashKeyToken: C['HashKey'] | C['ShardedKeys'];

  /** Dehydrated page key map. */
  pageKeyMap?: string;
}
