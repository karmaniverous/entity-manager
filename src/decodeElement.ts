import type { EntityMap, TranscodeMap } from '@karmaniverous/entity-tools';

import { EntityItem } from './EntityItem';
import { EntityManager } from './EntityManager';
import { validateTranscodedProperty } from './validateTranscodedProperty';

/**
 * Decode an {@link EntityItem | `EntityItem`} generated property element or ungenerated index component using the associated {@link Transcodes | Transcodes} `encode` function.
 *
 * Returns all `undefined` values.
 *
 * If `element` is the {@link Config.hashKey | `hashKey`} or {@link Config.rangeKey | `rangeKey`}, returns the value as-is.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param element - The {@link Entity | `Entity`} generated property element or ungenerated index component to encode.
 * @param value - Encoded entity element.
 *
 * @returns Decoded value.
 *
 * @throws `Error` if `entityToken` is invalid.
 */
export function decodeElement<
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
  element: TranscodedProperties,
  value: string | undefined,
): Item[TranscodedProperties] | undefined {
  try {
    // Validate params.
    validateTranscodedProperty(entityManager, element);

    if (!value) return;

    const { propertyTranscodes, transcodes } = entityManager.config;

    const decoded = transcodes[propertyTranscodes[element]].decode(
      value,
    ) as Item[TranscodedProperties];

    entityManager.logger.debug('decoded entity element', {
      element,
      value,
      decoded,
    });

    return decoded;
  } catch (error) {
    if (error instanceof Error)
      entityManager.logger.error(error.message, {
        element,
        value,
      });

    throw error;
  }
}
