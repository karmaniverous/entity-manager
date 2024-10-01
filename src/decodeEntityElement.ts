import type { Exactify, TranscodeMap } from '@karmaniverous/entity-tools';

import type { EntityMap, ItemMap } from './Config';
import { EntityManager } from './EntityManager';
import { validateEntityToken } from './validateEntityToken';

/**
 * Decode an {@link Entity | `Entity`} generated property element or ungenerated index component using the associated {@link Transcodes | Transcodes} `encode` function.
 *
 * Returns all `undefined` values.
 *
 * If `element` is the {@link Config.hashKey | `hashKey`} or {@link Config.rangeKey | `rangeKey`}, returns the value as-is.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param item - Partial {@link ItemMap | `ItemMap`} object.
 * @param entityToken - {@link ConfigKeys.entities | `entityManager.config.entities`} key.
 * @param element - The {@link Entity | `Entity`} generated property element or ungenerated index component to encode.
 *
 * @returns Decoded value.
 *
 * @throws `Error` if `entityToken` is invalid.
 */
export function decodeEntityElement<
  Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  T extends TranscodeMap,
>(
  entityManager: EntityManager<M, HashKey, RangeKey, T>,
  value: string | undefined,
  entityToken: EntityToken,
  element: (keyof Item & string) | HashKey | RangeKey,
): Item[keyof Item] | string | undefined {
  try {
    validateEntityToken(entityManager, entityToken);

    const { entities, hashKey, rangeKey, transcodes } = entityManager.config;

    if (!value) return;

    if ([hashKey, rangeKey].includes(element)) return value;

    const decoded = transcodes[
      entities[entityToken].elementTranscodes[element]
    ].decode(value) as Item[keyof Item];

    console.debug('decoded entity element', {
      value,
      entityToken,
      element,
      decoded,
    });

    return decoded;
  } catch (error) {
    if (error instanceof Error)
      console.error(error.message, { value, entityToken, element });

    throw error;
  }
}
