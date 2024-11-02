import type { Exactify, TranscodeMap } from '@karmaniverous/entity-tools';
import { shake } from 'radash';

import type { EntityMap, ItemMap } from './Config';
import { EntityManager } from './EntityManager';
import { validateEntityIndexToken } from './validateEntityIndexToken';

/**
 * Unwraps an {@link ConfigEntity.indexes | Entity index} into deduped, sorted, ungenerated index component elements.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link ConfigKeys.entities | `entityManager.config.entities`} key.
 * @param indexToken - {@link ConfigEntity.indexes | `entityManager.config.entities.<entityToken>.indexes`} key.
 *
 * @returns Deduped, sorted array of ungenerated index component elements.
 *
 * @throws `Error` if `entityToken` is invalid.
 * @throws `Error` if `indexToken` is invalid.
 */
export function unwrapIndex<
  Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  T extends TranscodeMap,
>(
  entityManager: EntityManager<M, HashKey, RangeKey, T>,
  entityToken: EntityToken,
  indexToken: string,
): (keyof Item & string)[] {
  try {
    // Validate params.
    validateEntityIndexToken(entityManager, entityToken, indexToken);

    const generated = entityManager.config.entities[entityToken].generated;
    const generatedKeys = Object.keys(shake(generated));

    return entityManager.config.entities[entityToken].indexes[
      indexToken
    ].components
      .map((component) =>
        component === entityManager.config.hashKey
          ? entityManager.config.hashKey
          : component === entityManager.config.rangeKey
            ? entityManager.config.entities[entityToken].uniqueProperty
            : generatedKeys.includes(component)
              ? generated[component]!.elements
              : component,
      )
      .flat()
      .sort() as (keyof Item & string)[];
  } catch (error) {
    if (error instanceof Error)
      entityManager.logger.error(error.message, { indexToken, entityToken });

    throw error;
  }
}
