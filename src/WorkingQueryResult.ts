import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityItem } from './EntityItem';
import type { PageKeyMap } from './PageKeyMap';

/**
 * A QueryResult object with rehydrated pageKeyMap.
 *
 * @typeParam C - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeMap | `TranscodeMap`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 *
 * @category QueryBuilder
 * @protected
 */
export interface WorkingQueryResult<C extends BaseConfigMap> {
  /** The returned records. */
  items: EntityItem<C>[];

  /**
   * A compressed, two-layer map of page keys, used to query the next page of
   * data for a given sort key on each shard of a given hash key.
   */
  pageKeyMap: PageKeyMap<C>;
}
