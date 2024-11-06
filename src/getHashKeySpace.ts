import type { Exactify, TranscodeMap } from '@karmaniverous/entity-tools';
import { range } from 'radash';

import type { EntityMap, ItemMap } from './Config';
import { encodeGeneratedProperty } from './encodeGeneratedProperty';
import { EntityManager } from './EntityManager';
import { validateEntityGeneratedProperty } from './validateEntityGeneratedProperty';

/**
 * Return an array of {@link ConfigKeys.hashKey | `entityManager.config.hashKey`} property values covering the shard space bounded by `timestampFrom` & `timestampTo`.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link ConfigKeys.entities | `entityManager.config.entities`} key.
 * @param hashKeyToken - {@link ParsedConfig | `entityManager.config.hashKey`} or {@link ParsedConfig | `entityManager.config.entities.<entityToken>.generated`} key. If a generated property, must be shardable.
 * @param item - Partial {@link ItemMap | `ItemMap[EntityToken]`} object. Must include all properties required to generate the hash key space.
 * @param timestampFrom - Lower timestanp limit. Defaults to `0`.
 * @param timestampTo - Upper timestamp limit. Defaults to `Date.now()`.
 *
 * @returns Array of {@link ConfigKeys.hashKey | `entityManager.config.hashKey`} property values covering the indicated shard space.
 *
 * @throws `Error` if `entityToken` is invalid.
 */
export function getHashKeySpace<
  Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  T extends TranscodeMap,
>(
  entityManager: EntityManager<M, HashKey, RangeKey, T>,
  entityToken: EntityToken,
  hashKeyToken: string,
  item: Partial<Item>,
  timestampFrom = 0,
  timestampTo = Date.now(),
): string[] {
  try {
    // Validate hashKeyToken is either the global hash key or a sharded generated property.
    if (hashKeyToken !== entityManager.config.hashKey)
      validateEntityGeneratedProperty(
        entityManager,
        entityToken,
        hashKeyToken,
        true,
      );

    const { shardBumps } = entityManager.config.entities[entityToken];

    const hashKeySpace = shardBumps
      // Filter shard bumps by timestamp range.
      .filter(
        (bump, i) =>
          (i === shardBumps.length - 1 ||
            shardBumps[i + 1].timestamp > timestampFrom) &&
          bump.timestamp <= timestampTo,
      )
      // Generate shard key space.
      .flatMap(({ charBits, chars }) => {
        const radix = 2 ** charBits;

        return chars
          ? [...range(0, radix ** chars - 1)].map((char) =>
              char.toString(radix).padStart(chars, '0'),
            )
          : '';
      })
      // Map shard keys to hash keys.
      .map((shardKey) => {
        // Calculate record hash key.
        let hashKey: string | undefined =
          `${entityToken}${entityManager.config.shardKeyDelimiter}${shardKey}`;

        // If hash key space basis is a different property, encode it.
        if (hashKeyToken !== entityManager.config.hashKey)
          hashKey = encodeGeneratedProperty(
            entityManager,
            entityToken,
            hashKeyToken,
            {
              ...item,
              [entityManager.config.hashKey]: hashKey,
            },
          );

        if (!hashKey) throw new Error('item does not support hash key space');

        return hashKey;
      });

    entityManager.logger.debug('generated hash key space', {
      entityToken,
      hashKeyToken,
      item,
      timestampFrom,
      timestampTo,
      hashKeySpace,
    });

    return hashKeySpace;
  } catch (error) {
    if (error instanceof Error)
      entityManager.logger.error(error.message, {
        entityToken,
        hashKeyToken,
        item,
        timestampFrom,
        timestampTo,
      });

    throw error;
  }
}
