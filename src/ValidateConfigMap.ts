import type {
  FlattenEntityMap,
  MutuallyExclusive,
  NotNever,
} from '@karmaniverous/entity-tools';

import type { BaseConfigMap } from './BaseConfigMap';

export type ValidateConfigMap<M extends BaseConfigMap> =
  MutuallyExclusive<
    [
      M['HashKey'],
      M['RangeKey'],
      M['ShardedKeys'],
      M['UnshardedKeys'],
      keyof FlattenEntityMap<M['EntityMap']>,
    ]
  > extends true
    ? NotNever<M, ['HashKey' | 'RangeKey']> extends true
      ? M
      : Exclude<NotNever<M, ['HashKey' | 'RangeKey']>, true>
    : Exclude<
        MutuallyExclusive<
          [
            M['HashKey'],
            M['RangeKey'],
            M['ShardedKeys'],
            M['UnshardedKeys'],
            keyof FlattenEntityMap<M['EntityMap']>,
          ]
        >,
        true
      >;
