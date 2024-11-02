import type { Exactify, TranscodeMap } from '@karmaniverous/entity-tools';
import { unique } from 'radash';

import type { EntityMap } from './Config';
import { EntityManager } from './EntityManager';
import { validateEntityIndexToken } from './validateEntityIndexToken';

/**
 * Get the index components of an entity index. Adds the hash and range keys to the index components.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link ConfigKeys.entities | `entityManager.config.entities`} key.
 * @param indexToken - {@link ConfigEntity.indexes | `entityManager.config.entities.<entityToken>.indexes`} key.
 *
 * @returns Array of index components.
 *
 * @throws `Error` if `entityToken` is invalid.
 * @throws `Error` if `indexToken` is invalid.
 */
export function getIndexComponents<
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  T extends TranscodeMap,
>(
  entityManager: EntityManager<M, HashKey, RangeKey, T>,
  entityToken: keyof Exactify<M> & string,
  indexToken: string,
): string[] {
  validateEntityIndexToken(entityManager, entityToken, indexToken);

  const { hashKey, rangeKey, entities } = entityManager.config;
  const { hashKey: indexHashKey, rangeKey: indexRangeKey } =
    entities[entityToken].indexes[indexToken];

  return unique([hashKey, rangeKey, indexHashKey, indexRangeKey]);
}
