// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityMap, TranscodeRegistry } from '@karmaniverous/entity-tools'; // imported to support API docs

import type {
  BaseConfigMap,
  EntityToken,
  QueryOptions,
} from '../EntityManager';

/**
 * Options for {@link BaseQueryBuilder.query | `query`} method on all derived classes.
 *
 * Same as {@link QueryOptions | `QueryOptions`} for {@link EntityManager.query | `EntityManager.query`}, excluding `entityToken`, `pageKeyMap`, and `shardQueryMap`.
 *
 * @typeParam CC - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeRegistry | `TranscodeRegistry`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 * @typeParam ET - Entity token narrowing the item types for options.item.
 *
 * @category QueryBuilder
 */
export type QueryBuilderQueryOptions<
  CC extends BaseConfigMap,
  ET extends EntityToken<CC>,
  CF = unknown,
> = Omit<
  QueryOptions<CC, ET, string, CF>,
  'entityToken' | 'pageKeyMap' | 'shardQueryMap'
>;
