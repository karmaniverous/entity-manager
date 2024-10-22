import type { TranscodeMap } from '@karmaniverous/entity-tools';
import { range } from 'radash';

import type { EntityMap } from './Config';
import { EntityManager } from './EntityManager';
import { validateEntityToken } from './validateEntityToken';

/**
 * Return an array of {@link ConfigKeys.hashKey | `entityManager.config.hashKey`} property values covering the shard space bounded by `timestampFrom` & `timestampTo`.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link ConfigKeys.entities | `entityManager.config.entities`} key.
 * @param timestampFrom - Lower timestanp limit. Defaults to `0`.
 * @param timestampTo - Upper timestamp limit. Defaults to `Date.now()`.
 *
 * @returns Array of {@link ConfigKeys.hashKey | `entityManager.config.hashKey`} property values covering the indicated shard space.
 *
 * @throws `Error` if `entityToken` is invalid.
 */
export function getHashKeySpace<
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  T extends TranscodeMap,
>(
  entityManager: EntityManager<M, HashKey, RangeKey, T>,
  entityToken: keyof M & string,
  timestampFrom = 0,
  timestampTo = Date.now(),
): string[] {
  try {
    // Validate params.
    validateEntityToken(entityManager, entityToken);

    const { shardBumps } = entityManager.config.entities[entityToken];

    const hashKeySpace = shardBumps
      .filter(
        (bump, i) =>
          (i === shardBumps.length - 1 ||
            shardBumps[i + 1].timestamp > timestampFrom) &&
          bump.timestamp <= timestampTo,
      )
      .flatMap(({ charBits, chars }) => {
        const radix = 2 ** charBits;

        return chars
          ? [...range(0, radix ** chars - 1)].map((char) =>
              char.toString(radix).padStart(chars, '0'),
            )
          : '';
      })
      .map(
        (shardKey) =>
          `${entityToken}${entityManager.config.shardKeyDelimiter}${shardKey}`,
      );

    entityManager.logger.debug('generated hash key space', {
      entityToken,
      timestampFrom,
      timestampTo,
      hashKeySpace,
    });

    return hashKeySpace;
  } catch (error) {
    if (error instanceof Error)
      entityManager.logger.error(error.message, {
        entityToken,
        timestampFrom,
        timestampTo,
      });

    throw error;
  }
}
