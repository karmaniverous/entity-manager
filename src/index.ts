/**
 * @module entity-manager
 */
export { BaseShardQueryMapBuilder } from './BaseShardQueryMapBuilder';
export { conditionalize } from './conditionalize';
export type {
  Config,
  ConfigEntities,
  ConfigEntity,
  ConfigEntityGenerated,
  ConfigEntityIndexComponent,
  ConfigKeys,
  ConfigTranscodes,
  EntityMap,
  ExclusiveKey,
  ItemMap,
  ShardBump,
  Unwrap,
} from './Config';
export { EntityManager } from './EntityManager';
export type { ParsedConfig } from './ParsedConfig';
export type { QueryOptions } from './QueryOptions';
export type { QueryResult } from './QueryResult';
export type { ShardQueryFunction } from './ShardQueryFunction';
export type { ShardQueryMap } from './ShardQueryMap';
export type { ShardQueryResult } from './ShardQueryResult';
