import type {
  Exactify,
  FlattenEntityMap,
  PropertiesOfType,
  TranscodableProperties,
  Transcodes,
} from '@karmaniverous/entity-tools';

import type { BaseConfigMap } from './BaseConfigMap';
import type { ConditionalProperty } from './ConditionalProperty';
import type { ShardBump } from './ShardBump';

export type Config<C extends BaseConfigMap> = ConditionalProperty<
  'entities',
  keyof Exactify<C['EntityMap']>,
  {
    [E in keyof Exactify<C['EntityMap']>]: {
      defaultLimit?: number;
      defaultPageSize?: number;
      shardBumps?: ShardBump[];
      timestampProperty: C['TranscodedProperties'] &
        PropertiesOfType<C['EntityMap'][E], number> &
        TranscodableProperties<C['EntityMap'], C['TranscodeMap']>;
      uniqueProperty: C['TranscodedProperties'] &
        keyof C['EntityMap'][E] &
        TranscodableProperties<C['EntityMap'], C['TranscodeMap']>;
    };
  }
> &
  ConditionalProperty<
    'generatedProperties',
    C['ShardedKeys'] | C['UnshardedKeys'],
    ConditionalProperty<
      'sharded',
      C['ShardedKeys'],
      Record<
        C['ShardedKeys'],
        (C['TranscodedProperties'] &
          TranscodableProperties<C['EntityMap'], C['TranscodeMap']>)[]
      >
    > &
      ConditionalProperty<
        'unsharded',
        C['UnshardedKeys'],
        Record<
          C['UnshardedKeys'],
          (C['TranscodedProperties'] &
            TranscodableProperties<C['EntityMap'], C['TranscodeMap']>)[]
        >
      >
  > &
  ConditionalProperty<
    'propertyTranscodes',
    C['TranscodedProperties'] &
      TranscodableProperties<C['EntityMap'], C['TranscodeMap']>,
    {
      [P in C['TranscodedProperties'] &
        TranscodableProperties<
          C['EntityMap'],
          C['TranscodeMap']
        >]: PropertiesOfType<
        C['TranscodeMap'],
        FlattenEntityMap<C['EntityMap']>[P]
      >;
    }
  > &
  ConditionalProperty<
    'transcodes',
    keyof C['TranscodeMap'],
    Transcodes<C['TranscodeMap']>
  > & {
    generatedKeyDelimiter?: string;
    generatedValueDelimiter?: string;
    hashKey: C['HashKey'];
    indexes?: Record<
      string,
      {
        hashKey: C['HashKey'] | C['ShardedKeys'];
        rangeKey:
          | C['RangeKey']
          | C['UnshardedKeys']
          | (C['TranscodedProperties'] &
              TranscodableProperties<C['EntityMap'], C['TranscodeMap']>);
        projections?: string[];
      }
    >;
    rangeKey: C['RangeKey'];
    shardKeyDelimiter?: string;
    throttle?: number;
  };
