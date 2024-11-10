import type {
  DefaultTranscodeMap,
  EntityMap,
  Exactify,
  FlattenEntityMap,
  MutuallyExclusive,
  PropertiesOfType,
  TranscodableProperties,
  TranscodeMap,
  Transcodes,
} from '@karmaniverous/entity-tools';

import type { ConditionalProperty } from './ConditionalProperty';
import type { ShardBump } from './ShardBump';

export type Config<
  M extends EntityMap = EntityMap,
  HashKey extends string = 'hashKey',
  RangeKey extends string = 'rangeKey',
  ShardedKeys extends string = never,
  UnshardedKeys extends string = never,
  TranscodedProperties extends string = never,
  T extends TranscodeMap = DefaultTranscodeMap,
> =
  MutuallyExclusive<
    [HashKey, RangeKey, ShardedKeys, UnshardedKeys, keyof FlattenEntityMap<M>]
  > extends true
    ? ConditionalProperty<
        'entities',
        keyof Exactify<M>,
        {
          [E in keyof Exactify<M>]: {
            defaultLimit?: number;
            defaultPageSize?: number;
            shardBumps?: ShardBump[];
            timestampProperty: TranscodedProperties &
              PropertiesOfType<M[E], number> &
              TranscodableProperties<M, T>;
            uniqueProperty: TranscodedProperties &
              keyof M[E] &
              TranscodableProperties<M, T>;
          };
        }
      > &
        ConditionalProperty<
          'generatedProperties',
          ShardedKeys | UnshardedKeys,
          ConditionalProperty<
            'sharded',
            ShardedKeys,
            Record<
              ShardedKeys,
              (TranscodedProperties & TranscodableProperties<M, T>)[]
            >
          > &
            ConditionalProperty<
              'unsharded',
              UnshardedKeys,
              Record<
                UnshardedKeys,
                (TranscodedProperties & TranscodableProperties<M, T>)[]
              >
            >
        > &
        ConditionalProperty<
          'propertyTranscodes',
          TranscodedProperties & TranscodableProperties<M, T>,
          {
            [P in TranscodedProperties &
              TranscodableProperties<M, T>]: PropertiesOfType<
              T,
              FlattenEntityMap<M>[P]
            >;
          }
        > &
        ConditionalProperty<'transcodes', keyof T, Transcodes<T>> & {
          generatedKeyDelimiter?: string;
          generatedValueDelimiter?: string;
          hashKey: HashKey;
          indexes?: Record<
            string,
            {
              hashKey: HashKey | ShardedKeys;
              rangeKey:
                | RangeKey
                | UnshardedKeys
                | (TranscodedProperties & TranscodableProperties<M, T>);
              projections?: string[];
            }
          >;
          rangeKey: RangeKey;
          shardKeyDelimiter?: string;
          throttle?: number;
        }
    : MutuallyExclusive<
        [
          HashKey,
          RangeKey,
          ShardedKeys,
          UnshardedKeys,
          keyof FlattenEntityMap<M>,
        ]
      >;
