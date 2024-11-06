import type { Exactify, TranscodeMap } from '@karmaniverous/entity-tools';

import type { EntityMap } from './Config';
import { EntityManager } from './EntityManager';
import { validateEntityToken } from './validateEntityToken';

/**
 * Validate that an entity index is defined in EntityManager config.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link ConfigKeys.entities | `this.config.entities`} key.
 * @param indexToken - {@link ConfigEntity.indexes | `this.config.entities.<entityToken>.indexes`} key.
 *
 * @throws `Error` if `entityToken` is invalid.
 * @throws `Error` if `indexToken` is invalid.
 */
export function validateEntityIndexToken<
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  T extends TranscodeMap,
>(
  entityManager: EntityManager<M, HashKey, RangeKey, T>,
  entityToken: EntityToken,
  indexToken: string,
): void {
  validateEntityToken(entityManager, entityToken);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!entityManager.config.entities[entityToken].indexes[indexToken])
    throw new Error('invalid entity index token');
}
