import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityManager } from './EntityManager';
import type { IndexTokensOf } from './PageKey';

/**
 * Find an index token in a {@link Config | `Config`} object based on the index `hashKey` and `rangeKey`.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param hashKeyToken - Index hash key.
 * @param rangeKeyToken - Index range key.
 * @param suppressError - Suppress error if no match found.
 *
 * @returns  Index token if found.
 *
 * @throws `Error` if no match found and `suppressError` is not `true`.
 */
export function findIndexToken<C extends BaseConfigMap, CF = unknown>(
  entityManager: EntityManager<C, CF>,
  hashKeyToken: C['HashKey'] | C['ShardedKeys'],
  rangeKeyToken: C['RangeKey'] | C['UnshardedKeys'] | C['TranscodedProperties'],
  suppressError?: false,
): IndexTokensOf<CF>;
export function findIndexToken<C extends BaseConfigMap, CF = unknown>(
  entityManager: EntityManager<C, CF>,
  hashKeyToken: C['HashKey'] | C['ShardedKeys'],
  rangeKeyToken: C['RangeKey'] | C['UnshardedKeys'] | C['TranscodedProperties'],
  suppressError: true,
): IndexTokensOf<CF> | undefined;
export function findIndexToken<C extends BaseConfigMap, CF = unknown>(
  entityManager: EntityManager<C, CF>,
  hashKeyToken: C['HashKey'] | C['ShardedKeys'],
  rangeKeyToken: C['RangeKey'] | C['UnshardedKeys'] | C['TranscodedProperties'],
  suppressError?: boolean,
): IndexTokensOf<CF> | undefined {
  const indexToken = (Object.entries(entityManager.config.indexes).find(
    ([, index]) =>
      index.hashKey === (hashKeyToken as string) &&
      index.rangeKey === (rangeKeyToken as string),
  )?.[0] ?? undefined) as IndexTokensOf<CF> | undefined;

  if (!indexToken && !suppressError)
    throw new Error(
      `No index token found for hashKey '${hashKeyToken}' & rangeKey '${rangeKeyToken}'.`,
    );

  return indexToken;
}
