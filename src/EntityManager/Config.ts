import type {
  ConditionalProperty,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  EntityMap, // imported to support API docs
  Exactify,
  FlattenEntityMap,
  PropertiesOfType,
  TranscodableProperties,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TranscodeRegistry, // imported to support API docs
  Transcodes,
} from '@karmaniverous/entity-tools';

import type { BaseConfigMap } from './BaseConfigMap';
import type { ShardBump } from './ShardBump';

/**
 * Configuration object for an {@link EntityManager | `EntityManager`} instance.
 *
 * @typeParam C - {@link ConfigMap | `ConfigMap`} that defines the configuration's {@link EntityMap | `EntityMap`}, key properties, and {@link TranscodeRegistry | `TranscodeRegistry`}. If omitted, defaults to {@link BaseConfigMap | `BaseConfigMap`}.
 *
 * @category EntityManager
 */
export type Config<C extends BaseConfigMap = BaseConfigMap> =
  ConditionalProperty<
    'entities',
    keyof Exactify<C['EntityMap']>,
    {
      [E in keyof Exactify<C['EntityMap']>]: {
        defaultLimit?: number;
        defaultPageSize?: number;
        shardBumps?: ShardBump[];
        timestampProperty: C['TranscodedProperties'] &
          PropertiesOfType<C['EntityMap'][E], number> &
          TranscodableProperties<C['EntityMap'], C['TranscodeRegistry']>;
        uniqueProperty: C['TranscodedProperties'] &
          keyof C['EntityMap'][E] &
          TranscodableProperties<C['EntityMap'], C['TranscodeRegistry']>;
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
            TranscodableProperties<C['EntityMap'], C['TranscodeRegistry']>)[]
        >
      > &
        ConditionalProperty<
          'unsharded',
          C['UnshardedKeys'],
          Record<
            C['UnshardedKeys'],
            (C['TranscodedProperties'] &
              TranscodableProperties<C['EntityMap'], C['TranscodeRegistry']>)[]
          >
        >
    > &
    ConditionalProperty<
      'propertyTranscodes',
      C['TranscodedProperties'] &
        TranscodableProperties<C['EntityMap'], C['TranscodeRegistry']>,
      {
        [P in C['TranscodedProperties'] &
          TranscodableProperties<
            C['EntityMap'],
            C['TranscodeRegistry']
          >]: PropertiesOfType<
          C['TranscodeRegistry'],
          FlattenEntityMap<C['EntityMap']>[P]
        >;
      }
    > &
    ConditionalProperty<
      'transcodes',
      keyof C['TranscodeRegistry'],
      Transcodes<C['TranscodeRegistry']>
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
                TranscodableProperties<C['EntityMap'], C['TranscodeRegistry']>);
          projections?: string[];
        }
      >;
      rangeKey: C['RangeKey'];
      shardKeyDelimiter?: string;
      throttle?: number;
    };
