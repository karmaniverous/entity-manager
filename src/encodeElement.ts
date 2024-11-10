import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityItem } from './EntityItem';
import type { EntityManager } from './EntityManager';

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
export function encodeElement<C extends BaseConfigMap>(
  entityManager: EntityManager<C>,
  element: C['HashKey'] | C['RangeKey'] | C['TranscodedProperties'],
  item: EntityItem<C>,
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
