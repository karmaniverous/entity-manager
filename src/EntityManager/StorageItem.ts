import type {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  EntityMap, // imported to support API docs
  FlattenEntityMap,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TranscodeRegistry, // imported to support API docs
} from '@karmaniverous/entity-tools';

import type { BaseConfigMap } from './BaseConfigMap';

/**
 * Storage-facing partial item type from a {@link BaseConfigMap | `ConfigMap`}.
 *
 * Token-agnostic shape used by encoding/decoding, key updates, and
 * (de)hydration services.
 *
 * @typeParam CC - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeRegistry | `TranscodeRegistry`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 *
 * @category EntityManager
 */
export type StorageItem<CC extends BaseConfigMap> = Partial<
  FlattenEntityMap<CC['EntityMap']> &
    Record<
      CC['HashKey'] | CC['RangeKey'] | CC['ShardedKeys'] | CC['UnshardedKeys'],
      string
    >
> &
  Record<string, unknown>;
