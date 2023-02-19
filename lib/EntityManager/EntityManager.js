/**
 * @module EntityManager
 */

import _ from 'lodash';

import { PrivateEntityManager } from './PrivateEntityManager.js';

/**
 * Manage DynamoDb entities.
 */
export class EntityManager {
  #entityManager;

  /**
   * Create an EntityManager instance.
   *
   * @param {object} options - Options object.
   * @param {object} [options.config] - EntityManager configuration object.
   * @param {object} [options.logger] - Logger instance (defaults to console, must support error & debug methods).
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

    console.log(item);

    return item;
  }

  /**
   * Return an array of sharded keys valid for a given entity token & timestamp.
   *
   * @param {string} entityToken - Entity token.
   * @param {object} item - Entity item.
   * @param {string} keyToken - Key token.
   * @param {number} timestamp - Timestamp.
   * @returns {string[]} Array of keys.
   * @throws {Error} If entityToken is invalid.
   * @throws {Error} If item is invalid.
   * @throws {Error} If keyToken is invalid.
   */
  getKeySpace(entityToken, item, keyToken, timestamp) {
    const shardKeySpace = this.#entityManager.getShardKeySpace(
      entityToken,
      timestamp
    );

    return _.sortedUniq(
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
  }
}
