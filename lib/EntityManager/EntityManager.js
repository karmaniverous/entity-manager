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
   * Decorate an entity item with keys.
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

    // Get entity config.
    const { shardKeyToken } = this.#entityManager;
    const { keys, sharding } = this.#entityManager.getEntityConfig(entityToken);

    // Add shardKey.
    this.#entityManager.validateItem(item);
    if (overwrite || _.isNil(item[shardKeyToken])) {
      const entityKey = sharding.entityKey(item);
      const timestamp = sharding.timestamp(item);
      item[shardKeyToken] = this.#entityManager.getShardKey(
        entityToken,
        entityKey,
        timestamp
      );
    }

    // Add keys.
    _.forEach(keys, (getValue, key) => {
      if (overwrite || _.isNil(item[key])) item[key] = getValue(item);
    });
    this.#entityManager.logger.debug('done', item);

    // Remove undefined shardKey.
    if (_.isNil(item[shardKeyToken])) delete item[shardKeyToken];

    return item;
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
}
