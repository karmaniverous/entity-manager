import { cluster, mapValues, range, unique, zipToObject } from 'radash';

import type { BaseConfigMap } from './BaseConfigMap';
import { decodeGeneratedProperty } from './decodeGeneratedProperty';
import { encodeGeneratedProperty } from './encodeGeneratedProperty';
import type { EntityItem } from './EntityItem';
import type { EntityManager } from './EntityManager';
import type { EntityToken } from './EntityToken';
import { getHashKeySpace } from './getHashKeySpace';
import { getIndexComponents } from './getIndexComponents';
import type { PageKeyMap } from './PageKeyMap';
import { rehydrateIndexItem } from './rehydrateIndexItem';
import { updateItemRangeKey } from './updateItemRangeKey';
import { validateEntityToken } from './validateEntityToken';
import { validateIndexToken } from './validateIndexToken';

/**
 * Rehydrate an array of dehydrated page keys into a {@link PageKeyMap | `PageKeyMap`} object.
 *
 * Reverses the {@link EntityManager.dehydratePageKeyMap | `dehydratePageKeyMap`} method.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link Config.entities | `entityManager.config.entities`} key.
 * @param indexTokens - Array of {@link Config.indexes | `entityManager.config.indexes`} keys used as keys of the original {@link PageKeyMap | `PageKeyMap`}.
 * @param item - Partial item object sufficiently populated to generate index hash keys.
 * @param dehydrated - Array of dehydrated page keys or undefined if new query.
 * @param timestampFrom - Lower timestanp limit used to generate the original {@link PageKeyMap | `PageKeyMap`}. Defaults to `0`.
 * @param timestampTo - Upper timestamp limit used to generate the original {@link PageKeyMap | `PageKeyMap`}. Defaults to `Date.now()`.
 *
 * @returns A tuple of `hashKeyToken` and rehydrated {@link PageKeyMap | `PageKeyMap`} object.
 *
 * @throws `Error` if `entityToken` is invalid.
 * @throws `Error` if `indexTokens` is empty.
 * @throws `Error` if any `indexTokens` are invalid.
 * @throws `Error` if `indexTokens` represent indexes with inconsistent hashKeys.
 * @throws `Error` if `dehydrated` has invalid length.
 */
export function rehydratePageKeyMap<C extends BaseConfigMap>(
  entityManager: EntityManager<C>,
  entityToken: EntityToken<C>,
  indexTokens: string[],
  item: EntityItem<C>,
  dehydrated: string[] | undefined,
  timestampFrom = 0,
  timestampTo = Date.now(),
): [C['HashKey'], PageKeyMap<C>] {
  try {
    // Validate params.
    validateEntityToken(entityManager, entityToken);

    // Validate indexTokens populated.
    if (!indexTokens.length) throw new Error('indexTokens empty');

    // Validate indexTokens exist.
    const hashKeys = unique(
      indexTokens.map((indexToken) => {
        validateIndexToken(entityManager, indexToken);
        return entityManager.config.indexes[indexToken].hashKey as C['HashKey'];
      }),
    );

    // Validate hashKeys consistent.
    if (hashKeys.length > 1) throw new Error('inconsistent hashKeys');

    const [hashKeyToken] = hashKeys;

    indexTokens.map((index) => {
      validateIndexToken(entityManager, index);
    });

    // Shortcut empty dehydrated.
    if (dehydrated && !dehydrated.length) return [hashKeyToken, {}];

    // Get hash key space.
    const hashKeySpace = getHashKeySpace(
      entityManager,
      entityToken,
      hashKeyToken,
      item,
      timestampFrom,
      timestampTo,
    );

    // Default dehydrated.
    dehydrated ??= [...range(1, hashKeySpace.length * indexTokens.length, '')];

    // Validate dehydrated length
    if (dehydrated.length !== hashKeySpace.length * indexTokens.length)
      throw new Error('dehydrated length mismatch');

    // Rehydrate pageKeys.
    const uniqueProperty = entityManager.config.entities[entityToken]
      .uniqueProperty as C['TranscodedProperties'];

    const { sharded, unsharded } = entityManager.config.generatedProperties;

    const rehydrated = mapValues(
      zipToObject(indexTokens, cluster(dehydrated, hashKeySpace.length)),
      (dehydratedIndexPageKeyMaps, index) =>
        zipToObject(hashKeySpace, (hashKey, i) => {
          if (!dehydratedIndexPageKeyMaps[i]) return;

          let pageKeyItem: EntityItem<C> = {
            ...decodeGeneratedProperty(entityManager, entityToken, hashKey),
            ...rehydrateIndexItem(
              entityManager,
              entityToken,
              index,
              dehydratedIndexPageKeyMaps[i],
            ),
          };

          pageKeyItem = updateItemRangeKey(
            entityManager,
            entityToken,
            pageKeyItem,
          );

          return zipToObject(
            getIndexComponents(entityManager, index),
            (component) =>
              component === entityManager.config.rangeKey
                ? [uniqueProperty, pageKeyItem[uniqueProperty]].join(
                    entityManager.config.generatedValueDelimiter,
                  )
                : component in sharded || component in unsharded
                  ? encodeGeneratedProperty(
                      entityManager,
                      component as C['ShardedKeys'] | C['UnshardedKeys'],
                      pageKeyItem,
                    )!
                  : pageKeyItem[component],
          );
        }),
    );

    entityManager.logger.debug('rehydrated page key map', {
      entityToken,
      indexTokens,
      dehydrated,
      rehydrated,
    });

    return [hashKeyToken, rehydrated as PageKeyMap<C>];
  } catch (error) {
    if (error instanceof Error)
      entityManager.logger.error(error.message, {
        entityToken,
        indexTokens,
        dehydrated,
      });

    throw error;
  }
}
