import type { Exactify } from '@karmaniverous/entity-tools';

import type { EntityMap, ItemMap } from './Config';
import type { QueryOptions } from './QueryOptions';

export type BuilderQueryOptions<
  Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
> = Omit<
  QueryOptions<Item, EntityToken, M, HashKey, RangeKey>,
  'entityToken' | 'pageKeyMap' | 'shardQueryMap'
>;
