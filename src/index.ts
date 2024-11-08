/**
 * @module entity-manager
 */
export { BaseEntityClient } from './BaseEntityClient';
export type { BaseEntityClientOptions } from './BaseEntityClientOptions';
export { BaseQueryBuilder } from './BaseQueryBuilder';
export type { BaseQueryBuilderOptions } from './BaseQueryBuilderOptions';
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
export type { QueryBuilderQueryOptions } from './QueryBuilderQueryOptions';
export type { QueryOptions } from './QueryOptions';
export type { QueryResult } from './QueryResult';
export type { ShardQueryFunction } from './ShardQueryFunction';
export type { ShardQueryMap } from './ShardQueryMap';
export type { ShardQueryResult } from './ShardQueryResult';
