import type { EntityMap } from '@karmaniverous/entity-tools';

import type { EntityItem } from './EntityItem';
import type { QueryOptions } from './QueryOptions';

export type QueryBuilderQueryOptions<
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  ShardedKeys extends string,
  UnshardedKeys extends string,
  Item extends EntityItem<M, HashKey, RangeKey, ShardedKeys, UnshardedKeys>,
> = Omit<
  QueryOptions<M, HashKey, RangeKey, ShardedKeys, UnshardedKeys, Item>,
  'entityToken' | 'pageKeyMap' | 'shardQueryMap'
>;
