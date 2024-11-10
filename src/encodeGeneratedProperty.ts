import { isNil } from '@karmaniverous/entity-tools';

import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityItem } from './EntityItem';
import type { EntityManager } from './EntityManager';
import { validateGeneratedProperty } from './validateGeneratedProperty';

/**
 * Encode a generated property value. Returns a string or undefined if atomicity requirement of sharded properties not met.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param property - {@link Config.generatedProperties | Generated property} key.
 * @param item - Partial {@link ItemMap | `ItemMap`} object.
 *
 * @returns Encoded generated property value.
 *
 * @throws `Error` if `property` is not a {@link Config.generatedProperties | generated property}.
 */
export function encodeGeneratedProperty<C extends BaseConfigMap>(
  entityManager: EntityManager<C>,
  property: C['ShardedKeys'] | C['UnshardedKeys'],
  item: EntityItem<C>,
): string | undefined {
  try {
    // Validate params.
    validateGeneratedProperty(entityManager, property);

    const sharded =
      property in entityManager.config.generatedProperties.sharded;

    const elements =
      entityManager.config.generatedProperties[
        sharded ? 'sharded' : 'unsharded'
      ][property];

    // Map elements to [element, value] pairs.
    const elementMap = elements.map((element) => [
      element,
      item[element as keyof EntityItem<C>],
    ]);

    // Return undefined if sharded & atomicity requirement fails.
    if (sharded && elementMap.some(([, value]) => isNil(value))) return;

    // Encode property value.
    const encoded = [
      ...(sharded
        ? [item[entityManager.config.hashKey as keyof EntityItem<C>]]
        : []),
      ...elementMap.map(([element, value]) =>
        [element, (value ?? '').toString()].join(
          entityManager.config.generatedValueDelimiter,
        ),
      ),
    ].join(entityManager.config.generatedKeyDelimiter);

    entityManager.logger.debug('encoded generated property', {
      property,
      item,
      encoded,
    });

    return encoded;
  } catch (error) {
    if (error instanceof Error)
      entityManager.logger.error(error.message, {
        property,
        item,
      });

    throw error;
  }
}
