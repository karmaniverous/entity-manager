import type {
  DefaultTranscodeMap,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  EntityMap,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TranscodeMap,
} from '@karmaniverous/entity-tools';

import type { BaseConfigMap } from './BaseConfigMap';
import type { ValidateConfigMap } from './ValidateConfigMap';

/**
 * Generates & validates the map defining defines an {@link EntityManager | `EntityManager`} configuration's {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeMap | `TranscodeMap`}.
 *
 * Unspecified properties will default to those defined in {@link BaseConfigMap | `BaseConfigMap`}.
 *
 * @typeParam M - {@link BaseConfigMap | `BaseConfigMap`} extension. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 *
 * @category EntityManager
 */
export type ConfigMap<
  M extends Partial<BaseConfigMap> = Partial<BaseConfigMap>,
> = ValidateConfigMap<{
  EntityMap: 'EntityMap' extends keyof M
    ? NonNullable<M['EntityMap']>
    : Record<string, never>;
  HashKey: 'HashKey' extends keyof M ? NonNullable<M['HashKey']> : 'hashKey';
  RangeKey: 'RangeKey' extends keyof M
    ? NonNullable<M['RangeKey']>
    : 'rangeKey';
  ShardedKeys: 'ShardedKeys' extends keyof M
    ? NonNullable<M['ShardedKeys']>
    : never;
  UnshardedKeys: 'UnshardedKeys' extends keyof M
    ? NonNullable<M['UnshardedKeys']>
    : never;
  TranscodedProperties: 'TranscodedProperties' extends keyof M
    ? NonNullable<M['TranscodedProperties']>
    : never;
  TranscodeMap: 'TranscodeMap' extends keyof M
    ? NonNullable<M['TranscodeMap']>
    : DefaultTranscodeMap;
}>;
