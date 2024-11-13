// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityMap, TranscodeMap } from '@karmaniverous/entity-tools'; // imported to support API docs

import type { BaseConfigMap } from './BaseConfigMap';
import type { QueryOptions } from './QueryOptions';

/**
 * Options for {@link BaseQueryBuilder.query | `query`} method on all derived classes.
 *
 * Same as {@link QueryOptions | `QueryOptions`} for {@link EntityManager.query | `EntityManager.query`}, excluding `entityToken`, `pageKeyMap`, and `shardQueryMap`.
 *
 * @typeParam C - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeMap | `TranscodeMap`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 *
 * @category QueryBuilder
 */
export type QueryBuilderQueryOptions<C extends BaseConfigMap> = Omit<
  QueryOptions<C>,
  'entityToken' | 'pageKeyMap' | 'shardQueryMap'
>;
