import type { EntityMap, TranscodeMap } from '@karmaniverous/entity-tools';

import { EntityItem } from './EntityItem';
import type { PageKeyMap } from './PageKeyMap';

/**
 * A QueryResult object with rehydrated pageKeyMap.
 */
export interface WorkingQueryResult<
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  ShardedKeys extends string,
  UnshardedKeys extends string,
  T extends TranscodeMap,
  Item extends EntityItem<M, HashKey, RangeKey, ShardedKeys, UnshardedKeys>,
> {
  /** The returned records. */
  items: Item[];

  /**
   * A compressed, two-layer map of page keys, used to query the next page of
   * data for a given sort key on each shard of a given hash key.
   */
  pageKeyMap: PageKeyMap<Item, T>;
}
