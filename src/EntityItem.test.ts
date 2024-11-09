import type {
  MyEntityMap,
  MyHashKey,
  MyRangeKey,
  MyShardedKeys,
  MyUnshardedKeys,
} from './Config.test';
import type { EntityItem } from './EntityItem';
import type { Unwrap } from './Unwrap';

export type MyEntityItem = Unwrap<
  EntityItem<MyEntityMap, MyHashKey, MyRangeKey, MyShardedKeys, MyUnshardedKeys>
>;

export type keys = keyof MyEntityItem;
