import type { Entity } from '@karmaniverous/entity-tools';

/**
 * {@link ShardQueryMapBuilder | `ShardQueryMapBuilder`} options.
 *
 * @category Query
 */
export interface ShardQueryMapBuilderOptions {
  /** `entityManager.config.entities` key. */
  entityToken: string;

  /** Either the designated entity hash key or a generated property with `sharded === true`. */
  hashKeyToken: string;

  /** A partial `Item` sufficiently populated to generate the query hash key & index values. */
  item: Entity;

  /** Dehydrated page key from the previous query data page. */
  pageKey?: string;
}
