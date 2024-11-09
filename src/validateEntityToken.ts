import type {
  EntityMap,
  Exactify,
  TranscodableProperties,
  TranscodeMap,
} from '@karmaniverous/entity-tools';

import { EntityManager } from './EntityManager';

/**
 * Validate that an entity is defined in the EntityManager config.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - `entityManager.config.entities` key.
 *
 * @throws `Error` if `entityToken` is invalid.
 */
export function validateEntityToken<
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  ShardedKeys extends string,
  UnshardedKeys extends string,
  TranscodedProperties extends TranscodableProperties<M, T>,
  T extends TranscodeMap,
>(
  entityManager: EntityManager<
    M,
    HashKey,
    RangeKey,
    ShardedKeys,
    UnshardedKeys,
    TranscodedProperties,
    T
  >,
  entityToken: keyof Exactify<M> & string,
): void {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!entityManager.config.entities[entityToken])
    throw new Error('invalid entity token');
}
