import { isNil } from '@karmaniverous/entity-tools';
import stringHash from 'string-hash';

import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityManager } from './EntityManager';
import type { EntityToken } from './EntityToken';
import { getShardBump } from './getShardBump';
import type { EntityItemPartial, EntityRecordPartial } from './TokenAware';
import { validateEntityToken } from './validateEntityToken';

/**
 * Update the hash key on an {@link EntityItemPartial | `EntityItemPartial`} object.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link Config.entities | `this.config.entities`} key.
 * @param item - {@link StorageItem | `StorageItem`} object.
 * @param overwrite - Overwrite existing {@link ConfigKeys.hashKey | `this.config.hashKey`} property value (default `false`).
 *
 * @returns Shallow clone of `item` with updated hash key.
 *
 * @throws `Error` if `entityToken` is invalid.
 */
export function updateItemHashKey<
  C extends BaseConfigMap,
  T extends EntityToken<C>,
>(
  entityManager: EntityManager<C>,
  entityToken: T,
  item: EntityItemPartial<C, T>,
  overwrite = false,
): EntityRecordPartial<C, T> {
  try {
    // Validate params.
    validateEntityToken(entityManager, entityToken);

    // Return current item if hashKey exists and overwrite is false.
    if (
      item[entityManager.config.hashKey as keyof StorageItem<C>] &&
      !overwrite
    ) {
      entityManager.logger.debug(
        'did not overwrite existing entity item hash key',
        {
          item,
          entityToken,
          overwrite,
        },
      );

      return { ...item };
    }

    // Get item timestamp property & validate.
    const timestamp: number = (item as Record<string, unknown>)[
      entityManager.config.entities[entityToken].timestampProperty
    ] as number;

    if (isNil(timestamp)) throw new Error(`missing item timestamp property`);

    // Find first entity sharding bump before timestamp.
    const { charBits, chars } = getShardBump(
      entityManager,
      entityToken,
      timestamp,
    );

    let hashKey = `${String(entityToken)}${entityManager.config.shardKeyDelimiter}`;

    if (chars) {
      // Radix is the numerical base of the shardKey.
      const radix = 2 ** charBits;

      // Compute the full shard space for this bump. Use radix ** chars to ensure
      // all placeholders are utilized (e.g., chars=2, charBits=2 => 16 combos).
      const space = radix ** chars;
      // Get item unique property & validate.
      const uniqueId = (item as Record<string, unknown>)[
        entityManager.config.entities[entityToken].uniqueProperty
      ];

      if (isNil(uniqueId)) throw new Error(`missing item unique property`);

      hashKey += (stringHash(uniqueId) % space)
        .toString(radix)
        .padStart(chars, '0');
    }

    const newItem = Object.assign(
      { ...item },
      { [entityManager.config.hashKey]: hashKey },
    ) as EntityRecordPartial<C, T>;

    entityManager.logger.debug('updated entity item hash key', {
      entityToken,
      overwrite,
      item,
      newItem,
    });

    return newItem;
  } catch (error) {
    if (error instanceof Error)
      entityManager.logger.error(error.message, {
        entityToken,
        item,
        overwrite,
      });

    throw error;
  }
}
