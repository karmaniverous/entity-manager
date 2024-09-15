import { Exactify, isNil, TypeMap } from '@karmaniverous/entity-tools';

import type { EntityItem, EntityMap } from './Config';
import { EntityManager } from './EntityManager';

/**
 * Encode a generated property value. Returns a string or undefined if atomicity requirement not met.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param item - Partial {@link EntityItem | `EntityItem`} object.
 * @param entityToken - `entityManager.config.entities` key.
 * @param property - {@link ConfigEntityGenerated | `entityManager.config.entities.<entityToken>.generated`} key.
 *
 * @returns Encoded generated property value.
 *
 * @throws `Error` if `entityToken` is invalid.
 * @throws `Error` if `property` is invalid.
 */
export function encodeGeneratedProperty<
  Item extends EntityItem<EntityToken, M, HashKey, RangeKey>,
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  IndexableTypes extends TypeMap,
>(
  entityManager: EntityManager<M, HashKey, RangeKey, IndexableTypes>,
  item: Partial<Item>,
  entityToken: EntityToken,
  property: keyof M[EntityToken] & string,
): string | undefined {
  try {
    // Validate params.
    entityManager.validateEntityGeneratedProperty(entityToken, property);

    const { atomic, elements, sharded } =
      entityManager.config.entities[entityToken].generated[property]!;

    // Map elements to [element, value] pairs.
    const elementMap = elements.map((element) => [
      element,
      item[element as keyof Item],
    ]);

    // Validate atomicity requirement.
    if (atomic && elementMap.some(([, value]) => isNil(value))) return;

    // Encode property value.
    const encoded = [
      ...(sharded ? [item[entityManager.config.hashKey as keyof Item]] : []),
      ...elementMap.map(([element, value]) =>
        [element, (value ?? '').toString()].join(
          entityManager.config.generatedValueDelimiter,
        ),
      ),
    ].join(entityManager.config.generatedKeyDelimiter);

    console.debug('encoded generated property', {
      item,
      entityToken,
      property,
      encoded,
    });

    return encoded;
  } catch (error) {
    if (error instanceof Error)
      console.error(error.message, { item, entityToken, property });

    throw error;
  }
}
