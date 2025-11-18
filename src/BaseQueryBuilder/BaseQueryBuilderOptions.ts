// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityMap, TranscodeRegistry } from '@karmaniverous/entity-tools'; // imported to support API docs

import type { BaseEntityClient } from '../BaseEntityClient';
import type { BaseConfigMap, EntityToken } from '../EntityManager';

/**
 * Constructor options for {@link BaseQueryBuilder | `BaseQueryBuilder`}.
 *
 * @typeParam CC - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeRegistry | `TranscodeRegistry`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 * @typeParam EntityClient - {@link BaseEntityClient | `BaseEntityClient`} derived class instance.
 *
 * @category QueryBuilder
 */
export interface BaseQueryBuilderOptions<
  CC extends BaseConfigMap,
  EntityClient extends BaseEntityClient<CC>,
> {
  /** {@link BaseEntityClient | `EntityClient`} instance. */
  entityClient: EntityClient;

  /** Entity token. */
  entityToken: EntityToken<CC>;

  /** Hash key token. */
  hashKeyToken: CC['HashKey'] | CC['ShardedKeys'];

  /** Dehydrated page key map. */
  pageKeyMap?: string;
}
