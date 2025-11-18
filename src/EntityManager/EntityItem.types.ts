import type { MyConfigMap } from './Config.types';
import type { EntityItem } from './EntityItem';

export type MyEntityItem = EntityItem<MyConfigMap>;

export type keys = keyof MyEntityItem;

// Support undefined properties.
export const item: MyEntityItem = { userId: 'abc', foo: 'bar' };
