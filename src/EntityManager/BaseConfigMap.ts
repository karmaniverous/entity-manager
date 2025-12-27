import type { EntityMap, TranscodeRegistry } from '@karmaniverous/entity-tools';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ConfigMap } from './ConfigMap'; // imported to support API docs

/**
 * Default type parameter for {@link ConfigMap | `ConfigMap`}.
 *
 * @category EntityManager
 */
export interface BaseConfigMap {
  /** Entity map type (entity token -\> entity shape). */
  EntityMap: EntityMap;

  /** Global hash-key property name used by the storage layer. */
  HashKey: string;

  /** Global range-key property name used by the storage layer. */
  RangeKey: string;

  /** Union of sharded generated key tokens (string-valued generated properties). */
  ShardedKeys: string;

  /** Union of unsharded generated key tokens (string-valued generated properties). */
  UnshardedKeys: string;

  /** Union of transcoded property tokens (domain properties mapped in `propertyTranscodes`). */
  TranscodedProperties: string;

  /** Transcode registry mapping transcode names to value types. */
  TranscodeRegistry: TranscodeRegistry;
}
