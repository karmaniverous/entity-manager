import type {
  EntityMap,
  TranscodableProperties,
  TranscodeMap,
} from '@karmaniverous/entity-tools';

import type { EntityItem } from './EntityItem';
import { EntityManager } from './EntityManager';

/**
 * Encode an {@link EntityItem | `EntityItem`} generated property element or ungenerated index component using the associated {@link Transcodes | Transcodes} `encode` function.
 *
 * Returns all `undefined` values.
 *
 * If `element` is the {@link Config.hashKey | `hashKey`} or {@link Config.rangeKey | `rangeKey`}, returns the value as-is.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param element - The {@link Entity | `Entity`} generated property element or ungenerated index component to encode.
 * @param item - Partial {@link ItemMap | `ItemMap`} object.
 *
 * @returns Encoded value.
 *
 * @throws `Error` if `entityToken` is invalid.
 */
export function encodeElement<
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  ShardedKeys extends string,
  UnshardedKeys extends string,
  TranscodedProperties extends TranscodableProperties<M, T>,
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
  element: HashKey | RangeKey | TranscodedProperties,
  item: Item,
): string | undefined {
  try {
    const { hashKey, rangeKey, propertyTranscodes, transcodes } =
      entityManager.config;

    const value = item[element];

    if (value === undefined || [hashKey, rangeKey].includes(element))
      return value;

    const encoded =
      transcodes[propertyTranscodes[element]].encode(item[element]) ||
      undefined;

    entityManager.logger.debug('encoded entity element', {
      element,
      item,
      encoded,
    });

    return encoded;
  } catch (error) {
    if (error instanceof Error)
      entityManager.logger.error(error.message, { element, item });

    throw error;
  }
}
