// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityMap, TranscodeRegistry } from '@karmaniverous/entity-tools'; // imported to support API docs

import type { BaseConfigMap } from './BaseConfigMap';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityManager } from './EntityManager'; // imported to support API docs
import type { PageKey } from './PageKey';
import type { ShardQueryResult } from './ShardQueryResult';

/**
 * A query function that returns a single page of results from an individual shard.
 *
 * This function will typically be composed dynamically to express a specific query index & logic. The arguments to this function will be provided by the {@link EntityManager.query | `EntityManager.query`} method, which assembles many returned pages queried across multiple shards into a single query result.
 *
 * @param hashKey - The hash key value of the shard being queried.
 * @param pageKey - The {@link PageKey | `PageKey`} returned by the previous query on this shard.
 * @param pageSize - The maximum number of items to return from this query.
 *
 * @typeParam C - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeMap | `TranscodeMap`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 *
 * @category EntityManager
 * @protected
 */
export type ShardQueryFunction<C extends BaseConfigMap> = (
  hashKey: string,
  pageKey?: PageKey<C>,
  pageSize?: number,
) => Promise<ShardQueryResult<C>>;
