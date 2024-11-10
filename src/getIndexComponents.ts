import type { EntityMap, TranscodeMap } from '@karmaniverous/entity-tools';
import { unique } from 'radash';

import { EntityManager } from './EntityManager';
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
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  ShardedKeys extends string,
  UnshardedKeys extends string,
  TranscodedProperties extends string,
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
): (HashKey | RangeKey | ShardedKeys | UnshardedKeys | TranscodedProperties)[] {
  validateIndexToken(entityManager, indexToken);

  const { hashKey, rangeKey, indexes } = entityManager.config;
  const { hashKey: indexHashKey, rangeKey: indexRangeKey } =
    indexes[indexToken];

  return unique([hashKey, rangeKey, indexHashKey, indexRangeKey]) as (
    | HashKey
    | RangeKey
    | ShardedKeys
    | UnshardedKeys
    | TranscodedProperties
  )[];
}
