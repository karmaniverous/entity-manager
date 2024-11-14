import { unique } from 'radash';

import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityManager } from './EntityManager';
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
export function getIndexComponents<C extends BaseConfigMap>(
  entityManager: EntityManager<C>,
  indexToken: string,
): (
  | C['HashKey']
  | C['RangeKey']
  | C['ShardedKeys']
  | C['UnshardedKeys']
  | C['TranscodedProperties']
)[] {
  validateIndexToken(entityManager, indexToken);

  const { hashKey, rangeKey, indexes } = entityManager.config;
  const { hashKey: indexHashKey, rangeKey: indexRangeKey } =
    indexes[indexToken];

  return unique([hashKey, rangeKey, indexHashKey, indexRangeKey]) as (
    | C['HashKey']
    | C['RangeKey']
    | C['ShardedKeys']
    | C['UnshardedKeys']
    | C['TranscodedProperties']
  )[];
}
