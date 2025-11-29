// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityMap, TranscodeRegistry } from '@karmaniverous/entity-tools'; // imported to support API docs

import type { BaseConfigMap } from './BaseConfigMap';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { EntityManager } from './EntityManager'; // imported to support API docs
import type { EntityToken } from './EntityToken';
import type { PageKeyByIndex } from './PageKey';
import type { ShardQueryResult } from './ShardQueryResult';

/**
 * A query function that returns a single page of results from an individual shard.
 *
 * This function will typically be composed dynamically to express a specific query index & logic. The arguments to this function will be provided by the {@link EntityManager.query | `EntityManager.query`} method, which assembles many returned pages queried across multiple shards into a single query result.
 *
 * @param hashKey - The hash key value of the shard being queried.
 * @param pageKey - The typed page key for the index being queried.
 * @param pageSize - The maximum number of items to return from this query.
 *
 * @typeParam CC - {@link ConfigMap | `ConfigMap`}.
 * @typeParam ET - Entity token narrowing the item/record types.
 * @typeParam IT - Index token (inferred from shardQueryMap keys).
 * @typeParam CF - Optional values-first config literal type for narrowing.
 * @typeParam K - Optional projection keys; narrows item shape when provided.
 *
 * @category EntityManager
 * @protected
 */
export type ShardQueryFunction<
  CC extends BaseConfigMap,
  ET extends EntityToken<CC>,
  IT extends string,
  CF = unknown,
  K = unknown,
> =
  // When CF carries an `indexes` map, only permit IT values that are keys of
  // that map. Invalid IT resolves the type to `never`, producing a compile-time
  // error at annotation sites.
  CF extends { indexes?: infer I }
    ? I extends Record<string, unknown>
      ? IT extends Extract<keyof I, string>
        ? (
            hashKey: string,
            pageKey?: PageKeyByIndex<CC, ET, IT, CF>,
            pageSize?: number,
          ) => Promise<ShardQueryResult<CC, ET, IT, CF, K>>
        : never
      : (
          hashKey: string,
          pageKey?: PageKeyByIndex<CC, ET, IT, CF>,
          pageSize?: number,
        ) => Promise<ShardQueryResult<CC, ET, IT, CF, K>>
    : (
        hashKey: string,
        pageKey?: PageKeyByIndex<CC, ET, IT, CF>,
        pageSize?: number,
      ) => Promise<ShardQueryResult<CC, ET, IT, CF, K>>;
