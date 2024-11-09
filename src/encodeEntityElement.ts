import type { Exactify, TranscodeMap } from '@karmaniverous/entity-tools';

import type { EntityMap, ItemMap } from './Config';
import { EntityManager } from './EntityManager';
import { validateEntityToken } from './validateEntityToken';

/**
 * Encode an {@link Entity | `Entity`} generated property element or ungenerated index component using the associated {@link Transcodes | Transcodes} `encode` function.
 *
 * Returns all `undefined` values.
 *
 * If `element` is the {@link Config.hashKey | `hashKey`} or {@link Config.rangeKey | `rangeKey`}, returns the value as-is.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link ConfigKeys.entities | `entityManager.config.entities`} key.
 * @param element - The {@link Entity | `Entity`} generated property element or ungenerated index component to encode.
 * @param item - Partial {@link ItemMap | `ItemMap`} object.
 *
 * @returns Encoded value.
 *
 * @throws `Error` if `entityToken` is invalid.
 */
export function encodeEntityElement<
  Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  T extends TranscodeMap,
>(
  entityManager: EntityManager<M, HashKey, RangeKey, T>,
  entityToken: EntityToken,
  element: keyof Item & string,
  item: Partial<Item>,
): string | undefined {
  try {
    validateEntityToken(entityManager, entityToken);

    const { entities, hashKey, rangeKey, transcodes } = entityManager.config;

    const value = item[element];

    if (value === undefined || [hashKey, rangeKey].includes(element))
      return value;

    const encoded =
      transcodes[entities[entityToken].propertyTranscodes[element]].encode(
        item[element],
      ) || undefined;

    entityManager.logger.debug('encoded entity element', {
      entityToken,
      element,
      item,
      encoded,
    });

    return encoded;
  } catch (error) {
    if (error instanceof Error)
      entityManager.logger.error(error.message, { entityToken, element, item });

    throw error;
  }
}
