import type {
  EntityMap,
  Exactify,
  TranscodableProperties,
  TranscodeMap,
} from '@karmaniverous/entity-tools';

import { EntityManager } from './EntityManager';
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
export function getShardBump<
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
  timestamp: number,
): ShardBump {
  // Validate params.
  validateEntityToken(entityManager, entityToken);

  return [...entityManager.config.entities[entityToken].shardBumps]
    .reverse()
    .find((bump) => bump.timestamp <= timestamp)!;
}
