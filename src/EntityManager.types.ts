import type { Stringifiable } from './Config';

/**
 * A two-layer map of page keys, used to query the next page of data for a
 * given index on each shard of a given hash key.
 *
 * The keys of the outer object are the keys of the QueryMap object passed to
 * the `query` method. Each should correspond to an index for the given entity.
 * This index contains the range key of an individual query.
 *
 * The keys of the inner object are the hashKey value passed to each
 * ShardQueryFunction. This is the hash key of an individual query.
 *
 * The values are the `pageKey` returned by the previous query on the related
 * index & shard. An `undefined` value indicates that there are no more pages to
 * query for that index & shard.
 */
export type PageKeyMap = Record<
  string,
  Record<string, Record<string, Stringifiable> | undefined>
>;

/**
 * Null or undefined.
 */
export type Nil = null | undefined;

/**
 * Tests whether a value is Nil.
 *
 * @param value - Value.
 * @returns true if value is null or undefined.
 */
export const isNil = (value: unknown): value is Nil =>
  value === null || value === undefined;

/**
 * Injectable logger interface.
 *
 * @category Options
 */
export interface Logger {
  debug: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

/**
 * EntityManager constructor options.
 *
 * @category Options
 */
export interface EntityManagerOptions {
  /**
   * Logger object.
   *
   * @defaultValue `console`
   */
  logger?: Logger;

  /**
   * Default maximum number of shards to query in parallel.
   *
   * @defaultValue `10`
   */
  throttle?: number;
}
