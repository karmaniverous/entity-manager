import { pick } from 'radash';

import { addKeys } from './addKeys';
import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityItem } from './EntityItem';
import type { EntityKey } from './EntityKey';
import type { EntityManager } from './EntityManager';
import type { EntityToken } from './EntityToken';

/**
 * Convert an {@link EntityItem | `EntityItem`} into an {@link EntityKey | `EntityKey`}.
 *
 * @param entityManager - {@link EntityManager | `EntityManager`} instance.
 * @param entityToken - {@link Config | `Config`} `entities` key.
 * @param item - {@link EntityItem | `EntityItem`} object.
 * @param overwrite - Overwrite existing properties (default `false`).
 *
 * @returns {@link EntityKey | `EntityKey`} extracted from shallow clone of `item` with updated properties.
 *
 * @throws `Error` if `entityToken` is invalid.
 */
export function getPrimaryKey<C extends BaseConfigMap>(
  entityManager: EntityManager<C>,
  entityToken: EntityToken<C>,
  item: EntityItem<C>,
  overwrite = false,
): EntityKey<C> {
  const { hashKey, rangeKey } = entityManager.config;
  return pick(
    !overwrite && item[hashKey] && item[rangeKey]
      ? item
      : addKeys(entityManager, entityToken, item, overwrite),
    [entityManager.config.hashKey, entityManager.config.rangeKey],
  ) as unknown as EntityKey<C>;
}
