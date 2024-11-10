import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityManager } from './EntityManager';
import type { EntityToken } from './EntityToken';
import type { ShardBump } from './ShardBump';
import { validateEntityToken } from './validateEntityToken';

/**
 * Get first entity shard bump before timestamp.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link Config.entities | `this.config.entities`} key.
 * @param timestamp - Timestamp in milliseconds.
 *
 * @returns {@link ShardBump | `ShardBump`} object.
 *
 * @throws `Error` if `entityToken` is invalid.
 */
export function getShardBump<C extends BaseConfigMap>(
  entityManager: EntityManager<C>,
  entityToken: EntityToken<C>,
  timestamp: number,
): ShardBump {
  // Validate params.
  validateEntityToken(entityManager, entityToken);

  return [...entityManager.config.entities[entityToken].shardBumps]
    .reverse()
    .find((bump) => bump.timestamp <= timestamp)!;
}
