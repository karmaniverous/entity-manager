import type { Entity } from '@karmaniverous/entity-tools';

import type { ShardQueryFunction } from './ShardQueryFunction';

export type ShardQueryMap<Item extends Entity> = Record<
  string,
  ShardQueryFunction<Item>
>;
