export type {
  Config,
  DecodeFunction,
  EncodeFunction,
  EntityKeyFunction,
  RawConfig,
  TimestampFunction,
} from './Config';
export {
  EntityManager,
  type EntityManagerOptions,
  type Logger,
  type QueryOptions,
  type QueryResult,
  type ShardQueryFunction,
  type ShardQueryResult,
} from './EntityManager';
export type { EntityIndexItem, EntityItem } from './util';
export type { Stringifiable } from '@karmaniverous/string-utilities';