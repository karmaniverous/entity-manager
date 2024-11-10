import type {
  EntityMap,
  Exactify,
  TranscodeMap,
} from '@karmaniverous/entity-tools';
import { unique } from 'radash';

import { EntityManager } from './EntityManager';
import { getIndexComponents } from './getIndexComponents';
import { validateEntityToken } from './validateEntityToken';
import { validateIndexToken } from './validateIndexToken';

/**
 * Unwraps an {@link Config.indexes | index} into deduped, sorted, ungenerated index component elements.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link Config.entities | `entityManager.config.entities`} key.
 * @param indexToken - {@link ConfigEntity.indexes | `entityManager.config.entities.<entityToken>.indexes`} key.
 * @param omit - Array of index components or elements to omit from the output value.
 *
 * @returns Deduped, sorted array of ungenerated index component elements.
 *
 * @throws `Error` if `entityToken` is invalid.
 * @throws `Error` if `indexToken` is invalid.
 */
export function unwrapIndex<
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  ShardedKeys extends string,
  UnshardedKeys extends string,
  TranscodedProperties extends string,
  T extends TranscodeMap,
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
  indexToken: string,
  omit: string[] = [],
): TranscodedProperties[] {
  try {
    // Validate params.
    validateEntityToken(entityManager, entityToken);
    validateIndexToken(entityManager, indexToken);

    const { sharded, unsharded } = entityManager.config.generatedProperties;

    const unwrapped = unique(
      getIndexComponents(entityManager, indexToken)
        .filter((component) => !omit.includes(component))
        .map((component) =>
          component === entityManager.config.hashKey
            ? entityManager.config.entities[entityToken].timestampProperty
            : component === entityManager.config.rangeKey
              ? entityManager.config.entities[entityToken].uniqueProperty
              : component in sharded
                ? sharded[component]
                : component in unsharded
                  ? unsharded[component]
                  : component,
        )
        .flat()
        .filter((element) => !omit.includes(element)),
    ).sort() as TranscodedProperties[];

    entityManager.logger.debug('unwrapped index', {
      entityToken,
      indexToken,
      omit,
      unwrapped,
    });

    return unwrapped;
  } catch (error) {
    if (error instanceof Error)
      entityManager.logger.error(error.message, {
        entityToken,
        indexToken,
        omit,
      });

    throw error;
  }
}
