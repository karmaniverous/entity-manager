import type { Exactify, TranscodeMap } from '@karmaniverous/entity-tools';

import type { EntityMap, ItemMap } from './Config';
import type {
  ClientShardQueryFunction,
  ShardQueryFunction,
} from './ShardQueryFunction';

export type ShardQueryMap<
  Item extends ItemMap<M, HashKey, RangeKey>[EntityToken],
  EntityToken extends keyof Exactify<M> & string,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  T extends TranscodeMap,
> = Record<
  string,
  ShardQueryFunction<Item, EntityToken, M, HashKey, RangeKey, T>
>;

export type ClientShardQueryMap = Record<string, ClientShardQueryFunction>;
