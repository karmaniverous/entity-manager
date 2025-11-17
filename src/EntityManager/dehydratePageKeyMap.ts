import type { BaseConfigMap } from './BaseConfigMap';
import { decodeGeneratedProperty } from './decodeGeneratedProperty';
import { dehydrateIndexItem } from './dehydrateIndexItem';
import type { EntityItem } from './EntityItem';
import type { EntityManager } from './EntityManager';
import type { EntityToken } from './EntityToken';
import type { PageKeyMap } from './PageKeyMap';
import { validateEntityToken } from './validateEntityToken';
import { validateIndexToken } from './validateIndexToken';

/**
 * Dehydrate a {@link PageKeyMap | `PageKeyMap`} object into an array of dehydrated page keys.
 *
 * Reverses {@link EntityManager.rehydratePageKeyMap | `rehydratePageKeyMap`}.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link Config.entities | `entityManager.config.entities`} key.
 * @param pageKeyMap - {@link PageKeyMap | `PageKeyMap`} object to dehydrate.
 *
 * @returns  Array of dehydrated page keys.
 *
 * @throws `Error` if `entityToken` is invalid.
 * @throws `Error` if any `pageKeyMap` key is an invalid indexToken is invalid {@link ConfigEntity.indexes | `entityManager.config.entities.<entityToken>.indexes`} key.
 *
 * @remarks
 * In the returned array, an empty string member indicates the corresponding page key is `undefined`.
 *
 * An empty returned array indicates all page keys are `undefined`.
 */
export function dehydratePageKeyMap<C extends BaseConfigMap>(
  entityManager: EntityManager<C>,
  entityToken: EntityToken<C>,
  pageKeyMap: PageKeyMap<C>,
): string[] {
  try {
    // Validate params.
    validateEntityToken(entityManager, entityToken);

    // Shortcut empty pageKeyMap.
    if (!Object.keys(pageKeyMap).length) {
      const dehydrated: string[] = [];

      entityManager.logger.debug('dehydrated empty page key map', {
        entityToken,
        pageKeyMap,
        dehydrated,
      });

      return dehydrated;
    }

    // Extract, sort & validate indexs.
    const indexes = Object.keys(pageKeyMap).sort();
    indexes.map((index) => {
      validateIndexToken(entityManager, index);
    });

    // Extract & sort hash keys.
    const hashKeys = Object.keys(pageKeyMap[indexes[0]]);

    // Dehydrate page keys.
    let dehydrated: string[] = [];

    for (const index of indexes) {
      for (const hashKey of hashKeys) {
        // Undefined pageKey.
        if (!pageKeyMap[index][hashKey]) {
          dehydrated.push('');
          continue;
        }

        // Compose item from page key
        const item = Object.entries(pageKeyMap[index][hashKey]).reduce(
          (item, [property, value]) => {
            if (
              property === entityManager.config.rangeKey ||
              property in entityManager.config.generatedProperties.sharded ||
              property in entityManager.config.generatedProperties.unsharded
            )
              Object.assign(
                item,
                decodeGeneratedProperty(
                  entityManager,
                  entityToken,
                  value as string,
                ),
              );
            else Object.assign(item, { [property]: value });

            return item;
          },
          // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
          {} as EntityItem<C>,
        );

        // Dehydrate index from item.
        dehydrated.push(
          dehydrateIndexItem(entityManager, entityToken, index, item),
        );
      }
    }

    // Replace with empty array if all pageKeys are empty strings.
    if (dehydrated.every((pageKey) => pageKey === '')) dehydrated = [];

    entityManager.logger.debug('dehydrated page key map', {
      entityToken,
      pageKeyMap,
      indexes,
      hashKeys,
      dehydrated,
    });

    return dehydrated;
  } catch (error) {
    if (error instanceof Error)
      entityManager.logger.error(error.message, { entityToken, pageKeyMap });

    throw error;
  }
}
