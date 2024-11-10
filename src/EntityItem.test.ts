import type {
  MyEntityMap,
  MyHashKey,
  MyRangeKey,
  MyShardedKeys,
  MyUnshardedKeys,
} from './Config.test';
import type { EntityItem } from './EntityItem';

export type MyEntityItem = EntityItem<
  MyEntityMap,
  MyHashKey,
  MyRangeKey,
  MyShardedKeys,
  MyUnshardedKeys
>;

export type keys = keyof MyEntityItem;

// Support undefined properties.
export const item: MyEntityItem = { userId: 'abc', foo: 'bar' };
