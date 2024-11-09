import {
  type EntityMap,
  type Exactify,
  isNil,
  type TranscodableProperties,
  type TranscodeMap,
} from '@karmaniverous/entity-tools';

import type { EntityItem } from './EntityItem';
import { EntityManager } from './EntityManager';
import { validateEntityGeneratedProperty } from './validateEntityGeneratedProperty';

/**
 * Encode a generated property value. Returns a string or undefined if atomicity requirement not met.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - `entityManager.config.entities` key.
 * @param property - {@link ConfigEntityGenerated | `entityManager.config.entities.<entityToken>.generated`} key.
 * @param item - Partial {@link ItemMap | `ItemMap`} object.
 *
 * @returns Encoded generated property value.
 *
 * @throws `Error` if `entityToken` is invalid.
 * @throws `Error` if `property` is invalid.
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
  entityToken: keyof Exactify<M> & string,
  property: ShardedKeys | UnshardedKeys,
  item: Partial<Item>,
): string | undefined {
  try {
    // Validate params.
    validateEntityGeneratedProperty(entityManager, entityToken, property);

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

    // Validate atomicity requirement.
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
      entityToken,
      property,
      item,
      encoded,
    });

    return encoded;
  } catch (error) {
    if (error instanceof Error)
      entityManager.logger.error(error.message, {
        entityToken,
        property,
        item,
      });

    throw error;
  }
}
