import type {
  DefaultTranscodeRegistry,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  EntityMap, // imported to support API docs
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TranscodeRegistry, // imported to support API docs
} from '@karmaniverous/entity-tools';

import type { BaseConfigMap } from './BaseConfigMap';
import type { ValidateConfigMap } from './ValidateConfigMap';

/**
 * Generates & validates the map defining defines an {@link EntityManager | `EntityManager`} configuration's {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeRegistry | `TranscodeRegistry`}.
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
  /** Entity map type (entity token -\> entity shape). */
  EntityMap: 'EntityMap' extends keyof M
    ? NonNullable<M['EntityMap']>
    : Record<string, never>;
  /** Global hash key property name (defaults to `"hashKey"`). */
  HashKey: 'HashKey' extends keyof M ? NonNullable<M['HashKey']> : 'hashKey';
  /** Global range key property name (defaults to `"rangeKey"`). */
  RangeKey: 'RangeKey' extends keyof M
    ? NonNullable<M['RangeKey']>
    : 'rangeKey';
  /** Union of sharded generated key tokens (defaults to `never`). */
  ShardedKeys: 'ShardedKeys' extends keyof M
    ? NonNullable<M['ShardedKeys']>
    : never;
  /** Union of unsharded generated key tokens (defaults to `never`). */
  UnshardedKeys: 'UnshardedKeys' extends keyof M
    ? NonNullable<M['UnshardedKeys']>
    : never;
  /** Union of transcoded property tokens (defaults to `never`). */
  TranscodedProperties: 'TranscodedProperties' extends keyof M
    ? NonNullable<M['TranscodedProperties']>
    : never;
  /** Transcode registry type (defaults to {@link DefaultTranscodeRegistry | `DefaultTranscodeRegistry`}). */
  TranscodeRegistry: 'TranscodeRegistry' extends keyof M
    ? NonNullable<M['TranscodeRegistry']>
    : DefaultTranscodeRegistry;
}>;
