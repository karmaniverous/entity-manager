import type { Exactify, TranscodeMap } from '@karmaniverous/entity-tools';

import type { EntityMap, ItemMap } from './Config';
import { EntityManager } from './EntityManager';
import { validateEntityToken } from './validateEntityToken';

/**
 * Strips generated properties, hash key, and range key from an {@link ItemMap | `ItemMap`} object. Mutates `item`.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param item - {@link ItemMap | `ItemMap`} object.
 * @param entityToken - {@link ConfigKeys.entities | `entityManager.config.entities`} key.
 *
 * @returns Mutated `item` without generated properties, hash key or range key.
 *
 * @throws `Error` if `entityToken` is invalid.
 */
export function removeKeys<
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
): Partial<Item> {
  try {
    // Validate params.
    validateEntityToken(entityManager, entityToken);

    // Delete hash & range keys.
    delete item[entityManager.config.hashKey as keyof Item];
    delete item[entityManager.config.rangeKey as keyof Item];

    // Delete generated properties.
    for (const property in entityManager.config.entities[entityToken].generated)
      delete item[property as keyof Item];

    console.debug('stripped entity item generated properties', {
      entityToken,
      item,
    });

    return item;
  } catch (error) {
    if (error instanceof Error)
      console.error(error.message, { item, entityToken });

    throw error;
  }
}
