/**
 * @module PrivateEntityManager
 */

import { createHash } from 'crypto';
import { validate } from 'jsonschema';
import _ from 'lodash';

/**
 * EntityManager config validation schema.
 *
 * @private
 */
const configSchema = {
  type: 'object',
  properties: {
    entities: {
      type: 'object',
      patternProperties: {
        '^\\w+$': {
          type: 'object',
          properties: {
            keys: {
              type: 'object',
            },
            sharding: {
              type: 'object',
              properties: {
                bumps: {
                  type: 'object',
                  patternProperties: {
                    '^\\d+$': { type: 'integer', minimum: 0, maximum: 40 },
                  },
                  additionalProperties: false,
                },
                nibbles: {
                  type: 'integer',
                  minimum: 0,
                  maximum: 40,
                },
                source: { type: 'function' },
              },
              additionalProperties: false,
            },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    shardKeyToken: {
      type: 'string',
      pattern: '^\\w+$',
    },
  },
  additionalProperties: false,
};

/**
 * Private EntityManager implementation.
 *
 * @private
 */
export class PrivateEntityManager {
  #config;
  #logger;

  /**
   * Create a PrivateEntityManager instance.
   *
   * @param {object} options - Options object.
   * @param {object} [options.config] - EntityManager configuration object.
   * @param {object} [options.logger] - Logger instance (defaults to console, must support error & debug methods).
   * @throws {Error} If config is invalid.
   * @throws {Error} If logger is invalid.
   */
  constructor({ config = {}, logger = console } = {}) {
    // Validate logger.
    if (!logger.error || !logger.debug)
      throw new Error('logger must implement error & debug methods.');

    this.#logger = logger;
    this.config = config;
  }

  /**
   * Get the current config.
   *
   * @returns {object} Current config.
   */
  get config() {
    return this.#config;
  }

  /**
   * Set the current config.
   *
   * @param {object} value - Config object.
   * @throws {Error} If config is invalid.
   * @throws {Error} If entity bumps do not monotonically increase.
   * @throws {Error} If entity nibbles are greater than minimum bump value.
   */
  set config(value) {
    // Validate config against schema.
    const validatorResult = validate(value, configSchema);
    if (!validatorResult.valid) {
      validatorResult.errors.forEach((error) =>
        this.#logger.error(error.message)
      );
      throw new Error(validatorResult.errors);
    }

    // Conform config.
    const { entities = {}, shardKeyToken = 'shardId' } = value;
    const conformedConfig = {
      entities: _.mapValues(
        entities,
        ({
          keys = {},
          sharding: { bumps = {}, nibbles = 0, source } = {},
        }) => ({
          keys,
          sharding: {
            bumps: _.fromPairs(_.sortBy(_.toPairs(bumps), 0)),
            nibbles,
            source,
          },
        })
      ),
      shardKeyToken,
    };

    // Validate entity properties.
    _.some(
      conformedConfig.entities,
      ({ keys, sharding: { nibbles, bumps, source } }, entityToken) => {
        // Validate entity keys are functions or undefined.
        _.some(keys, (value, key) => {
          if (!_.isNil(value) && !_.isFunction(value)) {
            const message = `${entityToken} key '${key}' must be a function or nil.`;
            this.#logger.error(message);
            throw new Error(message);
          } else return false;
        });

        // Validate sharding bump values increase monotonically with keys.
        _.some(_.toPairs(bumps), ([bump, value], i, c) => {
          const [lastBump, lastValue] = i ? c[i - 1] : [];
          if (value <= lastValue) {
            const message = `${entityToken} sharding bumps do not monotonically increase from '${lastBump}: ${lastValue}' to '${bump}: ${value}'.)`;
            this.#logger.error(message);
            throw new Error(message);
          } else return false;
        });

        // Validate sharding nibbles are less than first bump value.
        const firstBumpValue = _.map(bumps)[0];
        if (nibbles >= firstBumpValue) {
          const message = `${entityToken} nibbles (${nibbles}) not less than minimum bump value (${firstBumpValue})`;
          this.#logger.error(message);
          throw new Error(message);
        }

        // Validate sharding source is a function or undefined.
        if (!_.isNil(source) && !_.isFunction(source)) {
          const message = `${entityToken} sharding source must be a function or nil.`;
          this.#logger.error(message);
          throw new Error(message);
        } else return false;
      }
    );

    this.#config = conformedConfig;
  }

  /**
   * Bump nibbles for a given entityToken.
   *
   * @param {string} entityToken - Entity token.
   * @param {number} timestamp - Timestamp in milliseconds. Must be after current timestamp.
   * @param {number} value - Number of nibbles to bump (defaults to 1).
   */
  bumpNibbles(entityToken, timestamp, value) {
    if (
      !_.isString(entityToken) ||
      _.isUndefined(this.config.entities[entityToken])
    )
      throw new Error('invalid entityToken');

    if (!_.isInteger(timestamp) || timestamp <= Date.now())
      throw new Error('timestamp must be an integer greater than current time');

    this.config = _.set(
      _.cloneDeep(this.config),
      `entities[${entityToken}].sharding.bumps[${timestamp}]`,
      value
    );
  }

  /**
   * Get the number of nibbles for a given entityToken at a given timestamp.
   *
   * @param {string} entityToken - Entity token.
   * @param {number} [timestamp] - Timestamp in milliseconds (defaults to current time).
   * @returns {number} Nibbles for entity token at timestamp.
   */
  getNibbles(entityToken, timestamp = Date.now()) {
    if (
      !_.isString(entityToken) ||
      _.isUndefined(this.config.entities[entityToken])
    )
      throw new Error('invalid entityToken');

    const { nibbles, bumps } = this.config.entities[entityToken].sharding ?? {};
    return _.findLast(bumps, (value, key) => key <= timestamp) ?? nibbles ?? 0;
  }

  /**
   * Return a shard key for a given entity token, entity id & timestamp.
   *
   * @param {string} entityToken - Entity token.
   * @param {string} entityKey - Entity id.
   * @param {number} [timestamp] - Timestamp in milliseconds (defaults to current time).
   * @returns {string} shard key.
   */
  getShardKey(entityToken, entityKey, timestamp = Date.now()) {
    // Get nibbles for entityToken at timestamp (validates entityToken)
    const nibbles = this.getNibbles(entityToken, timestamp);

    // Calculate shardKey.
    const shardKey = nibbles
      ? createHash('sha1').update(entityKey).digest('hex').slice(0, nibbles)
      : '';

    this.#logger.debug(
      `generated shard key '${shardKey}' for ${entityToken} id '${entityKey}'.`
    );

    return shardKey;
  }

  /**
   * Return an array of shard keys valid for a given entity token & timestamp.
   *
   * @param {string} entityToken - Entity token.
   * @param {number} [timestamp] - Timestamp in milliseconds (defaults to current time).
   * @returns {string[]} shard key space.
   */
  getShardKeySpace(entityToken, timestamp = Date.now()) {
    if (
      !_.isString(entityToken) ||
      _.isUndefined(this.config.entities[entityToken])
    )
      throw new Error('invalid entityToken');
    if (!_.isInteger(timestamp))
      throw new Error('invalid timestamp (must be an integer)');

    this.#logger.debug(
      `getting shard key space for ${entityToken} at timestamp ${timestamp}...`
    );

    const { nibbles, bumps } = this.config.entities[entityToken].sharding ?? {};
    if (!bumps) return [];

    const nibbleSpace = [
      nibbles,
      ..._.map(_.filter(bumps, (value, key) => key <= timestamp)),
    ];
    this.#logger.debug('nibbleSpace', nibbleSpace);

    const shardKeySpace = _.flatten(
      _.map(nibbleSpace, (nibbles) =>
        nibbles
          ? _.range(0, Math.pow(2, nibbles * 4)).map((nibble) =>
              nibble.toString(16).padStart(nibbles, '0')
            )
          : undefined
      )
    );

    this.#logger.debug('shardKeySpace', shardKeySpace);

    return shardKeySpace;
  }
}
