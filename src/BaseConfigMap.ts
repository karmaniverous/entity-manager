import type { EntityMap, TranscodeMap } from '@karmaniverous/entity-tools';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ConfigMap } from './ConfigMap';

/**
 * Default type parameter for {@link ConfigMap | `ConfigMap`}.
 *
 * @category EntityManager
 */
export interface BaseConfigMap {
  EntityMap: EntityMap;
  HashKey: string;
  RangeKey: string;
  ShardedKeys: string;
  UnshardedKeys: string;
  TranscodedProperties: string;
  TranscodeMap: TranscodeMap;
}
