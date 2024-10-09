import {
  type Exactify,
  isNil,
  type TranscodeMap,
} from '@karmaniverous/entity-tools';
import stringHash from 'string-hash';

import type { EntityMap, ItemMap } from './Config';
import { EntityManager } from './EntityManager';
import { getShardBump } from './getShardBump';
import { validateEntityToken } from './validateEntityToken';

/**
 * Update the hash key on a partial {@link ItemMap | `ItemMap`} object. Mutates `item`.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param item - Partial {@link ItemMap | `ItemMap`} object.
 * @param entityToken - {@link ConfigKeys.entities | `this.config.entities`} key.
 * @param overwrite - Overwrite existing {@link ConfigKeys.hashKey | `this.config.hashKey`} property value (default `false`).
 *
 * @returns Mutated `item` with updated hash key.
 *
 * @throws `Error` if `entityToken` is invalid.
 */
export function updateItemHashKey<
  Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  T extends TranscodeMap,
>(
  entityManager: EntityManager<M, HashKey, RangeKey, T>,
  item: Partial<Item>,
  entityToken: EntityToken,
  overwrite = false,
): Partial<Item> {
  try {
    // Validate params.
    validateEntityToken(entityManager, entityToken);

    // Return current item if hashKey exists and overwrite is false.
    if (item[entityManager.config.hashKey as keyof Item] && !overwrite) {
      console.debug('did not overwrite existing entity item hash key', {
        item,
        entityToken,
        overwrite,
      });

      return item;
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

    Object.assign(item, { [entityManager.config.hashKey]: hashKey });

    console.debug('updated entity item hash key', {
      entityToken,
      overwrite,
      item,
    });

    return item;
  } catch (error) {
    if (error instanceof Error)
      console.error(error.message, { item, entityToken, overwrite });

    throw error;
  }
}
