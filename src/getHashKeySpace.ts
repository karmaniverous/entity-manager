import { range } from 'radash';

import type { BaseConfigMap } from './BaseConfigMap';
import { encodeGeneratedProperty } from './encodeGeneratedProperty';
import type { EntityItem } from './EntityItem';
import type { EntityManager } from './EntityManager';
import type { EntityToken } from './EntityToken';
import { validateGeneratedProperty } from './validateGeneratedProperty';

/**
 * Return an array of {@link ConfigKeys.hashKey | `entityManager.config.hashKey`} property values covering the shard space bounded by `timestampFrom` & `timestampTo`.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link Config.entities | `entityManager.config.entities`} key.
 * @param hashKeyToken - {@link ParsedConfig | `entityManager.config.hashKey`} or {@link ParsedConfig | `entityManager.config.generatedProperties.sharded`} key.
 * @param item - {@link EntityItem | `EntityItem`} object. Must include all properties required to generate the hash key space.
 * @param timestampFrom - Lower timestanp limit. Defaults to `0`.
 * @param timestampTo - Upper timestamp limit. Defaults to `Date.now()`.
 *
 * @returns Array of {@link ConfigKeys.hashKey | `entityManager.config.hashKey`} property values covering the indicated shard space.
 *
 * @throws `Error` if `entityToken` is invalid.
 */
export function getHashKeySpace<C extends BaseConfigMap>(
  entityManager: EntityManager<C>,
  entityToken: EntityToken<C>,
  hashKeyToken: C['HashKey'] | C['ShardedKeys'],
  item: EntityItem<C>,
  timestampFrom = 0,
  timestampTo = Date.now(),
): string[] {
  try {
    // Validate hashKeyToken is either the global hash key or a sharded generated property.
    if (hashKeyToken !== entityManager.config.hashKey)
      validateGeneratedProperty(
        entityManager,
        hashKeyToken as C['ShardedKeys'],
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
            hashKeyToken as C['ShardedKeys'],
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
