/**
 * @module entity-manager
 */
export { conditionalize } from './conditionalize';
export type {
  Config,
  ConfigEntities,
  ConfigEntity,
  ConfigEntityGenerated,
  ConfigKeys,
  ConfigTranscodes,
  EntityMap,
  ExclusiveKey,
  ItemMap,
  ShardBump,
  Unwrap,
} from './Config';
export { EntityManager } from './EntityManager';
export {
  EntityManagerClient,
  type EntityManagerClientOptions,
} from './EntityManagerClient';
export type { EntityManagerClientBatchOptions } from './EntityManagerClientBatchOptions';
export type { Logger, LoggerEndpoint, LoggerOptions } from './Logger';
export type { ParsedConfig } from './ParsedConfig';
export type { QueryOptions } from './QueryOptions';
export type { QueryResult } from './QueryResult';
export type { ShardQueryFunction } from './ShardQueryFunction';
export type { ShardQueryResult } from './ShardQueryResult';
export type { WithRequiredAndNonNullable } from './WithRequiredAndNonNullable';
export type {
  DefaultTranscodeMap,
  defaultTranscodes,
  Entity,
  PropertiesOfType,
  SortOrder,
  TranscodableProperties,
  TranscodeMap,
  Transcodes,
} from '@karmaniverous/entity-tools';
