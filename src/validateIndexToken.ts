import type {
  EntityMap,
  TranscodableProperties,
  TranscodeMap,
} from '@karmaniverous/entity-tools';

import { EntityManager } from './EntityManager';

/**
 * Validate that an entity index is defined in EntityManager config.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param indexToken - {@link Config.indexes | `entityManager.config.indexes`} key.
 *
 * @throws `Error` if `indexToken` is invalid.
 */
export function validateIndexToken<
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
  indexToken: string,
): void {
  if (!(indexToken in entityManager.config.indexes))
    throw new Error('invalid index token');
}
