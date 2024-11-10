import type { BaseConfigMap } from './BaseConfigMap';
import type { ShardQueryFunction } from './ShardQueryFunction';

export type ShardQueryMap<C extends BaseConfigMap> = Record<
  string,
  ShardQueryFunction<C>
>;
