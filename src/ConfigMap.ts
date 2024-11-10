import type {
  DefaultTranscodeMap,
  MakeOptional,
} from '@karmaniverous/entity-tools';

import type { BaseConfigMap } from './BaseConfigMap';
import type { ValidateConfigMap } from './ValidateConfigMap';

export type ConfigMap<
  M extends MakeOptional<
    BaseConfigMap,
    | 'EntityMap'
    | 'ShardedKeys'
    | 'UnshardedKeys'
    | 'TranscodedProperties'
    | 'TranscodeMap'
  >,
> = ValidateConfigMap<{
  EntityMap: 'EntityMap' extends keyof M
    ? NonNullable<M['EntityMap']>
    : Record<string, never>;
  HashKey: M['HashKey'];
  RangeKey: M['RangeKey'];
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
