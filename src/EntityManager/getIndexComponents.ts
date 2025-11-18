import { unique } from 'radash';

import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityManager } from './EntityManager';
import type { IndexComponentTokens } from './PageKey';
import { validateIndexToken } from './validateIndexToken';

/**
 * Get the index components of an entity index. Adds the hash and range keys to the index components.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param indexToken - {@link Config.indexes | `entityManager.config.indexes`} key.
 *
 * @returns Array of index components.
 *
 * @throws `Error` if `indexToken` is invalid.
 */
export function getIndexComponents<
  C extends BaseConfigMap,
  IT extends string = string,
  CF = unknown,
>(
  entityManager: EntityManager<C>,
  indexToken: IT,
): IndexComponentTokens<C, CF, IT>[] {
  validateIndexToken(entityManager, indexToken);

  const { hashKey, rangeKey, indexes } = entityManager.config;
  const { hashKey: indexHashKey, rangeKey: indexRangeKey } =
    indexes[indexToken];

  return unique([
    hashKey,
    rangeKey,
    indexHashKey,
    indexRangeKey,
  ]) as unknown as IndexComponentTokens<C, CF, IT>[];
}
