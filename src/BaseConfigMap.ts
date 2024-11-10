import type { EntityMap, TranscodeMap } from '@karmaniverous/entity-tools';

export interface BaseConfigMap {
  EntityMap: EntityMap;
  HashKey: string;
  RangeKey: string;
  ShardedKeys: string;
  UnshardedKeys: string;
  TranscodedProperties: string;
  TranscodeMap: TranscodeMap;
}
