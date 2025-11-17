import type {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  EntityMap, // imported to support API docs
  FlattenEntityMap,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TranscodeRegistry, // imported to support API docs
} from '@karmaniverous/entity-tools';

import type { BaseConfigMap } from './BaseConfigMap';

/**
 * Extracts a database-facing partial item type from a {@link BaseConfigMap | `ConfigMap`}.
 *
 * @typeParam C - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeMap | `TranscodeMap`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 *
 * @category EntityManager
 * @protected
 */
export type EntityItem<C extends BaseConfigMap> = Partial<
  FlattenEntityMap<C['EntityMap']> &
    Record<
      C['HashKey'] | C['RangeKey'] | C['ShardedKeys'] | C['UnshardedKeys'],
      string
    >
> &
  Record<string, unknown>;
