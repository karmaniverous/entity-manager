import type { Exactify, TranscodeMap } from '@karmaniverous/entity-tools';

import type { EntityMap, ItemMap } from './Config';
import { decodeGeneratedProperty } from './decodeGeneratedProperty';
import { dehydrateIndexItem } from './dehydrateIndexItem';
import { EntityManager } from './EntityManager';
import type { PageKeyMap } from './PageKeyMap';
import { validateEntityIndexToken } from './validateEntityIndexToken';
import { validateEntityToken } from './validateEntityToken';

/**
 * Dehydrate a {@link PageKeyMap | `PageKeyMap`} object into an array of dehydrated page keys.
 *
 * Reverses {@link EntityManager.rehydratePageKeyMap | `rehydratePageKeyMap`}.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param pageKeyMap - {@link PageKeyMap | `PageKeyMap`} object to dehydrate.
 * @param entityToken - {@link ConfigKeys.entities | `entityManager.config.entities`} key.
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
export function dehydratePageKeyMap<
  Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  IndexableTypes extends TranscodeMap,
>(
  entityManager: EntityManager<M, HashKey, RangeKey, IndexableTypes>,
  pageKeyMap: PageKeyMap<Item, IndexableTypes>,
  entityToken: EntityToken,
): string[] {
  try {
    // Validate params.
    validateEntityToken(entityManager, entityToken);

    // Shortcut empty pageKeyMap.
    if (!Object.keys(pageKeyMap).length) {
      const dehydrated: string[] = [];

      console.debug('dehydrated empty page key map', {
        pageKeyMap,
        entityToken,
        dehydrated,
      });

      return dehydrated;
    }

    // Extract, sort & validate indexs.
    const indexes = Object.keys(pageKeyMap).sort();
    indexes.map((index) =>
      validateEntityIndexToken(entityManager, entityToken, index),
    );

    // Extract & sort hash keys.
    const hashKeys = Object.keys(pageKeyMap[indexes[0]]);

    // Dehydrate page keys.
    let dehydrated: string[] = [];

    for (const index of indexes) {
      for (const hashKey of hashKeys) {
        // Undefineed pageKey.
        if (!pageKeyMap[index][hashKey]) {
          dehydrated.push('');
          continue;
        }

        // Compose item from page key
        const item = Object.entries(pageKeyMap[index][hashKey]).reduce<
          Partial<ItemMap<M, HashKey, RangeKey>[EntityToken]>
        >((item, [property, value]) => {
          if (
            property in entityManager.config.entities[entityToken].generated ||
            property === entityManager.config.rangeKey
          )
            Object.assign(
              item,
              decodeGeneratedProperty(
                entityManager,
                value as string,
                entityToken,
              ),
            );
          else Object.assign(item, { [property]: value });

          return item;
        }, {});

        // Dehydrate index from item.
        dehydrated.push(
          dehydrateIndexItem(entityManager, item, entityToken, index, [
            entityManager.config.hashKey,
          ]),
        );
      }
    }

    // Replace with empty array if all pageKeys are empty strings.
    if (dehydrated.every((pageKey) => pageKey === '')) dehydrated = [];

    console.debug('dehydrated page key map', {
      pageKeyMap,
      entityToken,
      indexes,
      hashKeys,
      dehydrated,
    });

    return dehydrated;
  } catch (error) {
    if (error instanceof Error)
      console.error(error.message, { entityToken, pageKeyMap });

    throw error;
  }
}
