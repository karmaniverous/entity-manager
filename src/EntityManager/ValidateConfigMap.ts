import type {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  EntityMap, // imported to support API docs
  FlattenEntityMap,
  MutuallyExclusive,
  NotNever,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TranscodeRegistry, // imported to support API docs
} from '@karmaniverous/entity-tools';

import type { BaseConfigMap } from './BaseConfigMap';

/**
 * Validates a type derived from {@link BaseConfigMap | `BaseConfigMap`} to ensure HashKey and RangeKey are both defined and that all sets of special keys are mutually exclusive.
 *
 * @typeParam CC - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeRegistry | `TranscodeRegistry`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 *
 * @category EntityManager
 * @protected
 */
export type ValidateConfigMap<CC extends BaseConfigMap> =
  MutuallyExclusive<
    [
      CC['HashKey'],
      CC['RangeKey'],
      CC['ShardedKeys'],
      CC['UnshardedKeys'],
      keyof FlattenEntityMap<CC['EntityMap']>,
    ]
  > extends true
    ? NotNever<CC, ['HashKey' | 'RangeKey']> extends true
      ? CC
      : Exclude<NotNever<CC, ['HashKey' | 'RangeKey']>, true>
    : Exclude<
        MutuallyExclusive<
          [
            CC['HashKey'],
            CC['RangeKey'],
            CC['ShardedKeys'],
            CC['UnshardedKeys'],
            keyof FlattenEntityMap<CC['EntityMap']>,
          ]
        >,
        true
      >;
