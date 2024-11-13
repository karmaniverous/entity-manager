import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityManager } from './EntityManager';

/**
 * Find an index token in a {@link Config | `Config`} object based on the index `hashKey` and `rangeKey`.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param hashKeyToken - Index hash key.
 * @param rangeKeyToken - Index range key.
 *
 * @returns  Index token if found.
 */
export function findIndexToken<C extends BaseConfigMap>(
  entityManager: EntityManager<C>,
  hashKeyToken: string,
  rangeKeyToken: string,
): string | undefined {
  return Object.entries(entityManager.config.indexes).find(
    ([, index]) =>
      index.hashKey === hashKeyToken && index.rangeKey === rangeKeyToken,
  )?.[0];
}
