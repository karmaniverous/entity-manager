import type {
  Exactify,
  StringifiableTypes,
  TypeMap,
} from '@karmaniverous/entity-tools';

import type { EntityItem, EntityMap } from './Config';
import type { PageKeyMap } from './PageKeyMap';

/**
 * A QueryResult object with rehydrated pageKeyMap.
 */
export interface WorkingQueryResult<
  Item extends EntityItem<EntityToken, M, HashKey, RangeKey>,
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  IndexableTypes extends TypeMap = StringifiableTypes,
> {
  /** The returned records. */
  items: Item[];

  /**
   * A compressed, two-layer map of page keys, used to query the next page of
   * data for a given sort key on each shard of a given hash key.
   */
  pageKeyMap: PageKeyMap<Item, IndexableTypes>;
}
