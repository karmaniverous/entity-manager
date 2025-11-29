import type { MyConfigMap } from './Config.types';
import type { StorageItem } from './StorageItem';

export type MyEntityItem = StorageItem<MyConfigMap>;

export type keys = keyof MyEntityItem;

// Support undefined properties.
export const item: MyEntityItem = { userId: 'abc', foo: 'bar' };
