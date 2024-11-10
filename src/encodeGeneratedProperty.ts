import {
  type EntityMap,
  isNil,
  type TranscodableProperties,
  type TranscodeMap,
} from '@karmaniverous/entity-tools';

import type { EntityItem } from './EntityItem';
import { EntityManager } from './EntityManager';
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
export function encodeGeneratedProperty<
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
  property: ShardedKeys | UnshardedKeys,
  item: Item,
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
      item[element as keyof Item],
    ]);

    // Return undefined if sharded & atomicity requirement fails.
    if (sharded && elementMap.some(([, value]) => isNil(value))) return;

    // Encode property value.
    const encoded = [
      ...(sharded ? [item[entityManager.config.hashKey as keyof Item]] : []),
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
