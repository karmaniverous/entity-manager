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
        /** Default max number of items returned by {@link EntityManager.query | `query`} for this entity (across all shards). */
        defaultLimit?: number;
        /** Default per-shard page size used by {@link EntityManager.query | `query`} for this entity. */
        defaultPageSize?: number;
        /** Shard bump schedule for this entity (time-based sharding scale-up). */
        shardBumps?: ShardBump[];
        /** Property token whose value selects the active shard bump (must be a transcoded numeric property). */
        timestampProperty: Extract<
          Extract<
            C['TranscodedProperties'],
            PropertiesOfType<C['EntityMap'][E], number>
          >,
          TranscodableProperties<C['EntityMap'], C['TranscodeRegistry']>
        >;
        /** Property token used as the logical unique identifier for this entity (must be a transcoded scalar). */
        uniqueProperty: Extract<
          Extract<C['TranscodedProperties'], keyof C['EntityMap'][E]>,
          TranscodableProperties<C['EntityMap'], C['TranscodeRegistry']>
        >;
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
      /** Delimiter between generated key elements (default `|`). Must not collide with other delimiters. */
      generatedKeyDelimiter?: string;
      /** Delimiter between a generated property key and its encoded value (default `#`). Must not collide with other delimiters. */
      generatedValueDelimiter?: string;
      /** Global hash key property name. */
      hashKey: C['HashKey'];
      /**
       * Index token map. Keys are index names; values define the index hash/range key tokens and optional projections.
       *
       * @remarks
       * This is provider-agnostic metadata used for page-key narrowing and (de)hydration; provider adapters map this to platform-specific indexes.
       */
      indexes?: Record<
        string,
        {
          /** Index hash key token (global hash key or a sharded generated key token). */
          hashKey: C['HashKey'] | C['ShardedKeys'];
          /** Index range key token (global range key, an unsharded generated key token, or a transcoded scalar property token). */
          rangeKey:
            | C['RangeKey']
            | C['UnshardedKeys']
            | (C['TranscodedProperties'] &
                TranscodableProperties<C['EntityMap'], C['TranscodeRegistry']>);
          /** Optional list of projected attribute names (validated to exclude key tokens). */
          projections?: string[];
        }
      >;
      /** Global range key property name. */
      rangeKey: C['RangeKey'];
      /** Delimiter between entity token and shard suffix in the global hash key value (default `!`). */
      shardKeyDelimiter?: string;
      /** Maximum number of shard queries to execute concurrently during {@link EntityManager.query | `query`}. */
      throttle?: number;
    };
