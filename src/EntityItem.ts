import type { FlattenEntityMap } from '@karmaniverous/entity-tools';

import type { BaseConfigMap } from './BaseConfigMap';

/**
 * Extracts a database-facing partial item type from a {@link BaseConfigMap | `ConfigMap`}.
 *
 * @category Entities
 */
export type EntityItem<C extends BaseConfigMap> = Partial<
  FlattenEntityMap<C['EntityMap']> &
    Record<
      C['HashKey'] | C['RangeKey'] | C['ShardedKeys'] | C['UnshardedKeys'],
      string
    >
> &
  Record<string, unknown>;
