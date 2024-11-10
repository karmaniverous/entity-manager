import type { BaseConfigMap } from './BaseConfigMap';
import type { EntityItem } from './EntityItem';
import type { PageKeyMap } from './PageKeyMap';

/**
 * A QueryResult object with rehydrated pageKeyMap.
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
