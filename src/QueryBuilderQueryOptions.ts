import type { BaseConfigMap } from './BaseConfigMap';
import type { QueryOptions } from './QueryOptions';

export type QueryBuilderQueryOptions<C extends BaseConfigMap> = Omit<
  QueryOptions<C>,
  'entityToken' | 'pageKeyMap' | 'shardQueryMap'
>;
