/**
 * @module entity-manager
 */

import { getParametersNames } from 'inspect-parameters-declaration';
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
    const { keys } = this.#entityManager.getEntityConfig(entityToken);

    // Add shardKey.
    if (overwrite || _.isNil(newItem[shardKeyToken])) {
      newItem[shardKeyToken] = this.calcShardKey(entityToken, newItem);
    }

    // Add keys.
    _.forEach(keys, ({ encode }, key) => {
      if (overwrite || _.isNil(newItem[key])) newItem[key] = encode(newItem);
    });
    this.#entityManager.logger.debug('done', newItem);

    // Remove undefined shardKey.
    if (_.isNil(newItem[shardKeyToken])) delete newItem[shardKeyToken];

    return newItem;
  }

  /**
   * Calculated the shard key for an entity item.
   *
   * @param {string} entityToken - Entity token.
   * @param {object} item - Entity item.
   * @returns {string} Shard key.
   */
  calcShardKey(entityToken, item) {
    const { sharding } = this.#entityManager.getEntityConfig(entityToken);
    const entityKey = sharding.entityKey(item);
    const timestamp = sharding.timestamp(item);

    return this.#entityManager.getShardKey(entityToken, entityKey, timestamp);
  }

  /**
   * Condense an index object into a delimited string.
   *
   * @param {string} entityToken - Entity token.
   * @param {string|string[]} indexToken - Index token or array of key tokens.
   * @param {object} index - Index object.
   * @param {string} [delimiter] - Delimiter.
   * @returns {string} Dehydrated index.
   * @throws {Error} If entityToken is invalid.
   * @throws {Error} If indexToken is invalid.
   * @throws {Error} If item is invalid.
   */
  dehydrateIndex(entityToken, indexToken, index, delimiter = '~') {
    // Validate item.
    this.#entityManager.validateItem(index);

    const indexComponents = _.isArray(indexToken)
      ? indexToken
      : this.#entityManager.getIndexComponents(entityToken, indexToken);

    const indexProperties = indexComponents.reduce((properties, component) => {
      const { decode } = this.getKey(entityToken, component);
      if (!_.isFunction(decode))
        throw new Error(
          `no decode function defined on ${entityToken} entity key '${component}'`
        );

      return {
        ...properties,
        ...(decode(index[component] ?? '') ?? {}),
      };
    }, {});

    return _.sortedUniqBy(
      _.sortBy(_.entries(indexProperties), ([key]) => key),
      ([key]) => key
    )
      .map(([, value]) => value)
      .join(delimiter);
  }

  /**
   * Return the config for a given entity key token.
   *
   * @param {string} entityToken - Entity token.
   * @param {string} keyToken - Key token.
   * @returns {object} Entity key config.
   */
  getKey(entityToken, keyToken) {
    const { keys } = this.#entityManager.getEntityConfig(entityToken);

    if (!_.has(keys, keyToken))
      throw new Error(
        `Key '${keyToken}' does not exist for entity '${entityToken}'.`
      );

    return keys[keyToken];
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
        this.getKey(entityToken, keyToken).encode({
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
   * @param {object} [options] - Options object.
   * @param {number} [options.limit] - Request limit.
   * @param {*} [options.pageKey] - Page key.
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
   * @param {object} [options] - Options object.
   * @param {number} [options.limit] - Request limit.
   * @param {object} [options.pageKeys] - Map of shard page keys.
   * @returns {Promise<ShardedQueryResult>} Sharded query result.
   */
  async query(
    entityToken,
    keyToken,
    item,
    shardQuery,
    { limit, pageKeys } = {}
  ) {
    // Validate params.
    this.#entityManager.validateKeyToken(entityToken, keyToken);
    this.#entityManager.validateItem(item);
    if (!_.isFunction(shardQuery))
      throw new Error('shardQuery must be a function');
    if (!_.isUndefined(limit) && !_.isInteger(limit))
      throw new Error('limit must be an integer');
    if (!_.isUndefined(pageKeys) && !_.isPlainObject(pageKeys))
      throw new Error('pageKeys must be an object');

    // Generate default pageKeys if not provided
    pageKeys ??= _.fromPairs(
      this.getKeySpace(entityToken, keyToken, item).map((shardedKey) => [
        shardedKey,
        undefined,
      ])
    );

    // Return empty result if no pageKeys.
    if (_.isEmpty(pageKeys)) return { items: [], pageKeys: {} };

    // Calculate shard limit.
    const shardLimit = _.isUndefined(limit)
      ? undefined
      : Math.ceil(limit / _.size(pageKeys));

    // Query every shard in pageKeys.
    const shardQueryResults = await Promise.all(
      _.map(
        pageKeys,
        (pageKey, shardedKey) =>
          new Promise((resolve) =>
            shardQuery(shardedKey, { pageKey, limit: shardLimit }).then(
              ({ items, pageKey }) => resolve({ shardedKey, items, pageKey })
            )
          )
      )
    );

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
   * Convert a delimited string into a named index key.
   *
   * @param {string} entityToken - Entity token.
   * @param {string|string[]} indexToken - Index token or array of key tokens.
   * @param {string} value - Dehydrated index value.
   * @param {string} [delimiter] - Delimiter.
   * @returns {object} Rehydrated index key.
   * @throws {Error} If entityToken is invalid.
   * @throws {Error} If indexToken is invalid.
   */
  rehydrateIndex(entityToken, indexToken, value = '', delimiter = '~') {
    const indexComponents = _.isArray(indexToken)
      ? indexToken
      : this.#entityManager.getIndexComponents(entityToken, indexToken);

    const indexKeys = _.sortBy(
      indexComponents.reduce((keys, component) => {
        const { encode } = this.getKey(entityToken, component);
        return [...new Set([...keys, ...getParametersNames(encode)]).values()];
      }, [])
    );

    const indexProperies = _.zipObject(indexKeys, value.split(delimiter));

    return indexComponents.reduce((index, component) => {
      const { encode } = this.getKey(entityToken, component);
      return { ...index, [component]: encode(indexProperies) };
    }, {});
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
