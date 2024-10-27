/**
 * {@link BaseShardQueryMapBuilder | `BaseShardQueryMapBuilder`} options.
 *
 * @category Query
 */
export interface BaseShardQueryMapBuilderOptions {
  /** `entityManager.config.entities` key. */
  entityToken: string;

  /** Either the designated entity hash key or a generated property with `sharded === true`. */
  hashKeyToken: string;

  /** Dehydrated page key from the previous query data page. */
  pageKey?: string;
}
