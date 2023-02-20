import { validate } from 'jsonschema';
import _ from 'lodash';
import stringHash from 'string-hash';

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
                    '^\\d+$': { type: 'integer', minimum: 0 },
                  },
                  additionalProperties: false,
                },
                entityKey: { type: 'function' },
                nibbleBits: {
                  type: 'integer',
                  minimum: 1,
                  maximum: 5,
                },
                nibbles: {
                  type: 'integer',
                  minimum: 0,
                },
                timestamp: { type: 'function' },
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
        this.logger.error(error.message)
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
          sharding: {
            bumps = {},
            entityKey,
            nibbleBits = 1,
            nibbles = 0,
            timestamp,
          } = {},
        }) => ({
          keys,
          sharding: {
            bumps: _.fromPairs(_.sortBy(_.toPairs(bumps), 0)),
            entityKey,
            nibbleBits,
            nibbles,
            timestamp,
          },
        })
      ),
      shardKeyToken,
    };

    // Validate entity properties.
    _.some(
      conformedConfig.entities,
      (
        {
          keys,
          sharding: { bumps, entityKey, nibbleBits, nibbles, timestamp },
        },
        entityToken
      ) => {
        // Validate entity keys are functions or undefined.
        _.some(keys, (value, key) => {
          if (!_.isNil(value) && !_.isFunction(value)) {
            const message = `${entityToken} key '${key}' must be a function or nil.`;
            this.logger.error(message);
            throw new Error(message);
          } else return false;
        });

        // Validate sharding bump values increase monotonically with keys.
        _.some(_.toPairs(bumps), ([bump, value], i, c) => {
          const [lastBump, lastValue] = i ? c[i - 1] : [];
          if (value <= lastValue) {
            const message = `${entityToken} sharding bumps do not monotonically increase from '${lastBump}: ${lastValue}' to '${bump}: ${value}'.)`;
            this.logger.error(message);
            throw new Error(message);
          } else return false;
        });

        // Validate sharding entityKey is a function or undefined.
        if (!_.isNil(entityKey) && !_.isFunction(entityKey)) {
          const message = `${entityToken} sharding entityKey must be a function or nil`;
          this.logger.error(message);
          throw new Error(message);
        }

        // Validate sharding nibbles do not exceed 32 bits.
        if (nibbles * nibbleBits > 32) {
          const message = `${entityToken} nibbles (${nibbles} nibbles at ${nibbleBits} nibbleBits) exceed 32 bits`;
          this.logger.error(message);
          throw new Error(message);
        }

        // Validate sharding nibbles are less than first bump value.
        const firstBumpValue = _.map(bumps)[0];
        if (nibbles >= firstBumpValue) {
          const message = `${entityToken} nibbles (${nibbles}) not less than minimum bump value (${firstBumpValue})`;
          this.logger.error(message);
          throw new Error(message);
        }

        // Validate last bump value does not exceed 32 bits.
        const lastBumpValue = _.map(bumps).slice(-1);
        if (lastBumpValue * nibbleBits > 32) {
          const message = `${entityToken} maximum bump value (${lastBumpValue} nibbles at ${nibbleBits} nibbleBits) exceed 32 bits`;
          this.logger.error(message);
          throw new Error(message);
        }

        // Validate sharding timestamp is a function or undefined.
        if (!_.isNil(timestamp) && !_.isFunction(timestamp)) {
          const message = `${entityToken} sharding timestamp must be a function or nil.`;
          this.logger.error(message);
          throw new Error(message);
        } else return false;
      }
    );

    this.#config = conformedConfig;
  }

  /**
   * Get logger instance.
   *
   * @returns {object} Logger instance.
   */
  get logger() {
    return this.#logger;
  }

  /**
   * Get shard key token.
   *
   * @returns {string} Shard key token.
   */
  get shardKeyToken() {
    return this.#config.shardKeyToken;
  }

  /**
   * Get entity config.
   *
   * @param {string} entityToken - Entity token.
   * @returns {object} Entity config.
   * @throws {Error} If entityToken is invalid.
   */
  getEntityConfig(entityToken) {
    this.validateEntityToken(entityToken);
    return this.config.entities[entityToken];
  }

  getKeyGenerator(entityToken, keyToken) {
    const { keys } = this.getEntityConfig(entityToken);

    if (!_.has(keys, keyToken)) {
      const message = `Key '${keyToken}' does not exist for entity '${entityToken}'.`;
      this.logger.error(message);
      throw new Error(message);
    }

    return keys[keyToken];
  }

  /**
   * Get the number of nibbles & nibbleBits for a given entityToken at a given timestamp.
   *
   * @param {string} entityToken - Entity token.
   * @param {number} [timestamp] - Timestamp in milliseconds (defaults to current time).
   * @returns {{nibbleBits: number, nibbles: number}} Result object.
   */
  getNibbles(entityToken, timestamp = Date.now()) {
    const { nibbleBits, nibbles, bumps } =
      this.getEntityConfig(entityToken).sharding;

    this.validateTimestamp(timestamp);
    return {
      nibbleBits,
      nibbles: _.findLast(bumps, (value, key) => key <= timestamp) ?? nibbles,
    };
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
    const { nibbleBits, nibbles } = this.getNibbles(entityToken, timestamp);

    // Calculate shardKey.
    const radix = 2 ** nibbleBits;
    const shardKey = nibbles
      ? (stringHash(entityKey) % (nibbles * radix))
          .toString(radix)
          .padStart(nibbles, '0')
      : undefined;

    if (_.isNil(shardKey))
      this.logger.debug(
        `no shard key generated for ${entityToken} id '${entityKey}' at timestamp ${timestamp}.`
      );
    else
      this.logger.debug(
        `generated shard key '${shardKey}' for ${entityToken} id '${entityKey}' at timestamp ${timestamp}.`
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
    const { nibbleBits, nibbles, bumps } =
      this.getEntityConfig(entityToken).sharding;
    if (!nibbles && !_.size(bumps)) return [];

    this.validateTimestamp(timestamp);
    const nibbleSpace = [
      nibbles,
      ..._.map(_.filter(bumps, (value, key) => key <= timestamp)),
    ];

    const radix = 2 ** nibbleBits;
    const shardKeySpace = _.flatten(
      _.map(nibbleSpace, (nibbles) => {
        return nibbles
          ? _.range(0, radix ** nibbles).map((nibble) =>
              nibble.toString(radix).padStart(nibbles, '0')
            )
          : undefined;
      })
    );

    return shardKeySpace;
  }

  /**
   * Tests whether an entityToken is valid.
   *
   * @param {string} entityToken - Entity token.
   * @returns {boolean} true if entityToken is valid.
   */
  validateEntityToken(entityToken) {
    if (!this.config.entities[entityToken]) {
      const message = `Invalid entityToken: ${entityToken}`;
      this.logger.error(message);
      throw new Error(message);
    } else return true;
  }

  /**
   * Tests whether an item is valid.
   *
   * @param {string} item - Entity token.
   * @returns {boolean} true if entityToken is valid.
   */
  validateItem(item) {
    if (!_.isPlainObject(item)) {
      const message = `Invalid item: ${item}`;
      this.logger.error(message);
      throw new Error(message);
    } else return true;
  }

  /**
   * Tests whether a timestamp is valid.
   *
   * @param {number} timestamp - timestamp.
   * @param {boolean} [future=false] - true if timestamp must be in the future.
   * @returns {boolean} true if timestamp is valid.
   */
  validateTimestamp(timestamp, future = false) {
    if (!_.isInteger(timestamp) || (future && timestamp <= Date.now()))
      throw new Error(
        `invalid timestamp (must be an integer${
          future ? ' in the future' : ''
        })`
      );
    else return true;
  }
}
