import {
  type EntityMap,
  type Exactify,
  isNil,
  type TranscodeMap,
} from '@karmaniverous/entity-tools';
import stringHash from 'string-hash';

import type { EntityItem } from './EntityItem';
import { EntityManager } from './EntityManager';
import { getShardBump } from './getShardBump';
import { validateEntityToken } from './validateEntityToken';

/**
 * Update the hash key on a partial {@link ItemMap | `ItemMap`} object.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link Config.entities | `this.config.entities`} key.
 * @param item - Partial {@link ItemMap | `ItemMap`} object.
 * @param overwrite - Overwrite existing {@link ConfigKeys.hashKey | `this.config.hashKey`} property value (default `false`).
 *
 * @returns Shallow clone of `item` with updated hash key.
 *
 * @throws `Error` if `entityToken` is invalid.
 */
export function updateItemHashKey<
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  ShardedKeys extends string,
  UnshardedKeys extends string,
  TranscodedProperties extends string,
  T extends TranscodeMap,
  Item extends EntityItem<M, HashKey, RangeKey, ShardedKeys, UnshardedKeys>,
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
  item: Item,
  overwrite = false,
): Item {
  try {
    // Validate params.
    validateEntityToken(entityManager, entityToken);

    // Return current item if hashKey exists and overwrite is false.
    if (item[entityManager.config.hashKey as keyof Item] && !overwrite) {
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
    const timestamp: number = item[
      entityManager.config.entities[entityToken].timestampProperty as keyof Item
    ] as unknown as number;

    if (isNil(timestamp)) throw new Error(`missing item timestamp property`);

    // Find first entity sharding bump before timestamp.
    const { charBits, chars } = getShardBump(
      entityManager,
      entityToken,
      timestamp,
    );

    let hashKey = `${entityToken}${entityManager.config.shardKeyDelimiter}`;

    if (chars) {
      // Radix is the numerical base of the shardKey.
      const radix = 2 ** charBits;

      // Get item unique property & validate.
      const uniqueId =
        item[
          entityManager.config.entities[entityToken]
            .uniqueProperty as keyof Item
        ];

      if (isNil(uniqueId)) throw new Error(`missing item unique property`);

      hashKey += (stringHash(uniqueId.toString()) % (chars * radix))
        .toString(radix)
        .padStart(chars, '0');
    }

    const newItem = Object.assign(
      { ...item },
      { [entityManager.config.hashKey]: hashKey },
    );

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
