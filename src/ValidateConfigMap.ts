import type {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  EntityMap, // imported to support API docs
  FlattenEntityMap,
  MutuallyExclusive,
  NotNever,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TranscodeMap, // imported to support API docs
} from '@karmaniverous/entity-tools';

import type { BaseConfigMap } from './BaseConfigMap';

/**
 * Validates a type derived from {@link BaseConfigMap | `BaseConfigMap`} to ensure HashKey and RangeKey are both defined and that all sets of special keys are mutually exclusive.
 *
 * @typeParam C - {@link ConfigMap | `ConfigMap`} that defines an {@link Config | `EntityManager configuration`}'s {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeMap | `TranscodeMap`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 *
 * @category EntityManager
 * @protected
 */
export type ValidateConfigMap<C extends BaseConfigMap> =
  MutuallyExclusive<
    [
      C['HashKey'],
      C['RangeKey'],
      C['ShardedKeys'],
      C['UnshardedKeys'],
      keyof FlattenEntityMap<C['EntityMap']>,
    ]
  > extends true
    ? NotNever<C, ['HashKey' | 'RangeKey']> extends true
      ? C
      : Exclude<NotNever<C, ['HashKey' | 'RangeKey']>, true>
    : Exclude<
        MutuallyExclusive<
          [
            C['HashKey'],
            C['RangeKey'],
            C['ShardedKeys'],
            C['UnshardedKeys'],
            keyof FlattenEntityMap<C['EntityMap']>,
          ]
        >,
        true
      >;
