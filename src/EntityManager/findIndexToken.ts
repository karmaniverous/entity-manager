import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityManager } from './EntityManager';

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
export function findIndexToken<C extends BaseConfigMap>(
  entityManager: EntityManager<C>,
  hashKeyToken: string,
  rangeKeyToken: string,
  suppressError?: boolean,
): string | undefined {
  const indexToken = Object.entries(entityManager.config.indexes).find(
    ([, index]) =>
      index.hashKey === hashKeyToken && index.rangeKey === rangeKeyToken,
  )?.[0];

  if (!indexToken && !suppressError)
    throw new Error(
      `No index token found for hashKey '${hashKeyToken}' & rangeKey '${rangeKeyToken}'.`,
    );

  return indexToken;
}
