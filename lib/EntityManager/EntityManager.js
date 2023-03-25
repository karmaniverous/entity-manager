/**
 * @module entity-manager
 */

import _ from 'lodash';

import { PrivateEntityManager } from './PrivateEntityManager.js';

/**
 * Manage DynamoDb entities.
 *
 * @class
 */
export class EntityManager {
  #entityManager;

  /**
   * Create an EntityManager instance.
   *
   * @param {object} options - Options object.
   * @param {object} [options.config] - EntityManager configuration object (see {@link https://github.com/karmaniverous/entity-manager#configuration README} for a breakdown).
   * @param {object} [options.logger] - Logger instance (defaults to console, must support error & debug methods).
   * @returns {EntityManager} EntityManager instance.
   * @throws {Error} If config is invalid.
   * @throws {Error} If logger is invalid.
   */
  constructor({ config, logger }) {
    this.#entityManager = new PrivateEntityManager({ config, logger });
  }

  /**
   * Add sharded keys to an entity item. Does not mutate original item.
   *
   * @param {string} entityToken - Entity token.
   * @param {object} item - Entity item.
   * @param {boolean} [overwrite=false] - Overwrite existing properties.
   * @returns {object} Decorated entity item.
   * @throws {Error} If entityToken is invalid.
   * @throws {Error} If item is invalid.
   */
  addKeys(entityToken, item, overwrite = false) {
    this.#entityManager.logger.debug(
      `adding sharded index keys to ${entityToken}${
        overwrite ? ' with overwrite' : ''
      }...`,
      item
    );

    // Validate item.
    this.#entityManager.validateItem(item);

    // Clone item.
    const newItem = _.cloneDeep(item);

    // Get entity config.
    const { shardKeyToken } = this.#entityManager;
    const { keys, sharding } = this.#entityManager.getEntityConfig(entityToken);

    // Add shardKey.
    if (overwrite || _.isNil(newItem[shardKeyToken])) {
      const entityKey = sharding.entityKey(newItem);
      const timestamp = sharding.timestamp(newItem);
      newItem[shardKeyToken] = this.#entityManager.getShardKey(
        entityToken,
        entityKey,
        timestamp
      );
    }

    // Add keys.
    _.forEach(keys, (getValue, key) => {
      if (overwrite || _.isNil(newItem[key])) newItem[key] = getValue(newItem);
    });
    this.#entityManager.logger.debug('done', newItem);

    // Remove undefined shardKey.
    if (_.isNil(newItem[shardKeyToken])) delete newItem[shardKeyToken];

    return newItem;
  }

  /**
   * Return an array of sharded keys valid for a given entity token & timestamp.
   *
   * @param {string} entityToken - Entity token.
   * @param {string} keyToken - Key token.
   * @param {object} item - Entity item sufficiently populated to generate property keyToken.
   * @param {number} timestamp - Timestamp.
   * @returns {string[]} Array of keys.
   * @throws {Error} If entityToken is invalid.
   * @throws {Error} If item is invalid.
   * @throws {Error} If keyToken is invalid.
   * @throws {Error} If timestamp is invalid.
   */
  getKeySpace(entityToken, keyToken, item, timestamp = Date.now()) {
    this.#entityManager.logger.debug(
      `getting shard key space for ${entityToken} on key '${keyToken}' at timestamp ${timestamp}...`,
      item
    );

    const shardKeySpace = this.#entityManager.getShardKeySpace(
      entityToken,
      timestamp
    );

    const result = _.sortedUniq(
      shardKeySpace.map((shardKey) =>
        this.#entityManager.getKeyGenerator(
          entityToken,
          keyToken
        )({
          ...item,
          [this.#entityManager.shardKeyToken]: shardKey,
        })
      )
    );
    this.#entityManager.logger.debug('done', result);

    return result;
  }

  /**
   * @typedef {object} ShardQueryResult
   * @property {any[]} items - Query result array.
   * @property {*} pageKey - Shard page key.
   */

  /**
   * Shard query function
   *
   * @callback ShardQueryFunction
   * @param {string} shardedKey - Sharded key.
   * @param {*} [pageKey] - Page key.
   * @returns {Promise<ShardQueryResult>} Sharded query result.
   */

  /**
   * @typedef {object} ShardedQueryResult
   * @property {any[]} items - Query result array.
   * @property {object} pageKeys - Shard page keys.
   */

  /**
   * Query an entity across shards.
   *
   * @param {string} entityToken - Entity token.
   * @param {string} keyToken - Key token.
   * @param {object} item - Entity item sufficiently populated to generate property keyToken.
   * @param {ShardQueryFunction} shardQuery - Sharded query function.
   * @param {object} [pageKeys] - Map of shard page keys.
   * @returns {Promise<ShardedQueryResult>} Sharded query result.
   */
  async query(entityToken, keyToken, item, shardQuery, pageKeys) {
    // Generate default pageKeys if not provided
    pageKeys ??= _.fromPairs(
      this.getKeySpace(entityToken, keyToken, item).map((shardedKey) => [
        shardedKey,
        undefined,
      ])
    );

    // Query every shard in pageKeys.
    const shardQueryResults = await Promise.all(
      _.map(
        pageKeys,
        (pageKey, shardedKey) =>
          new Promise((resolve) =>
            shardQuery(shardedKey, pageKey).then(({ items, pageKey }) => {
              console.log('shardQueryResult', { shardedKey, items, pageKey });
              return resolve({ shardedKey, items, pageKey });
            })
          )
      )
    );

    console.log('shardQueryResults', shardQueryResults);

    // Reduce shardQueryResults into a single result.
    const result = shardQueryResults.reduce(
      (shardedQueryResult, { shardedKey, items, pageKey }) => ({
        items: [...shardedQueryResult.items, ...items],
        pageKeys: {
          ...shardedQueryResult.pageKeys,
          ...(_.isUndefined(pageKey) ? {} : { [shardedKey]: pageKey }),
        },
      }),
      { items: [], pageKeys: {} }
    );

    return result;
  }

  /**
   * Remove sharded keys from an entity item. Does not mutate original item.
   *
   * @param {string} entityToken - Entity token.
   * @param {object} item - Entity item.
   * @returns {object} Stripped entity item.
   * @throws {Error} If entityToken is invalid.
   * @throws {Error} If item is invalid.
   */
  removeKeys(entityToken, item) {
    this.#entityManager.logger.debug(
      `removing sharded index keys from ${entityToken}...`,
      item
    );

    // Validate item.
    this.#entityManager.validateItem(item);

    // Clone item.
    const newItem = _.cloneDeep(item);

    // Get entity config.
    const { shardKeyToken } = this.#entityManager;
    const { keys } = this.#entityManager.getEntityConfig(entityToken);

    // Remove shardKey.
    delete newItem[shardKeyToken];

    // Remove keys.
    _.forEach(keys, (getValue, key) => {
      delete newItem[key];
    });
    this.#entityManager.logger.debug('done', newItem);

    return newItem;
  }
}
