import type { Exactify, TranscodeMap } from '@karmaniverous/entity-tools';

import type { EntityMap, ShardBump } from './Config';
import { EntityManager } from './EntityManager';
import { validateEntityToken } from './validateEntityToken';

/**
 * Get first entity shard bump before timestamp.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link ConfigKeys.entities | `this.config.entities`} key.
 * @param timestamp - Timestamp in milliseconds.
 *
 * @returns {@link ShardBump | `ShardBump`} object.
 *
 * @throws `Error` if `entityToken` is invalid.
 */
export function getShardBump<
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  T extends TranscodeMap,
>(
  entityManager: EntityManager<M, HashKey, RangeKey, T>,
  entityToken: keyof Exactify<M> & string,
  timestamp: number,
): ShardBump {
  // Validate params.
  validateEntityToken(entityManager, entityToken);

  return [...entityManager.config.entities[entityToken].shardBumps]
    .reverse()
    .find((bump) => bump.timestamp <= timestamp)!;
}
