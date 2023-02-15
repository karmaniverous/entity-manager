import { createHash } from 'crypto';
import { validate } from 'jsonschema';
import _ from 'lodash';

/**
 * ShardKeyManager config validation schema.
 */
const configSchema = {
  type: 'object',
  patternProperties: {
    '^\\w+$': {
      type: 'object',
      properties: {
        nibbles: {
          type: 'integer',
          minimum: 0,
          maximum: 40,
        },
        bumps: {
          type: 'object',
          patternProperties: {
            '^\\d+$': { type: 'integer', minimum: 0, maximum: 40 },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};

/**
 * Configuration object for a single sharded entity
 *
 * @typedef {object} ShardEntityConfig
 * @property {number} [nibbles] - Hex digits in initial shard key.
 * @property {Object<number, number>} [bumps] - Timestamp-keyed increases in nibbles.
 */

/**
 * ShardKeyManager configuration object.
 *
 * @typedef {Object<string, ShardEntityConfig>} ShardKeyManagerConfig
 */

/**
 * Configurably generate and scale partition shards over time.
 */
export class ShardKeyManager {
  #config;
  #logger;

  /**
   * Create a ShardKeyManager instance.
   *
   * @param {object} options - Options object.
   * @param {ShardKeyManagerConfig} [options.config] - ShardKeyManager configuration object.
   * @param {object} [options.logger] - Logger instance (defaults to console, must support error & debug methods).
   */
  constructor({ config = {}, logger = console } = {}) {
    // Validate logger.
    if (!logger.error || !logger.debug)
      throw new Error('logger must implement error & debug methods.');

    this.#logger = logger;
    this.#config = this.constructor.conformConfig(config, logger);
  }

  /**
   * Conform & validate config to schema.
   *
   * @param {ShardKeyManagerConfig} [config] - ShardKeyManager configuration object.
   * @param {object} [logger] - ShardKeyManager configuration object.
   * @returns {ShardKeyManagerConfig} Conformed & validated config.
   */
  static conformConfig(config = {}, logger = console) {
    // Validate logger.
    if (!logger.error) throw new Error('logger must implement error method.');

    // Validate config against schema.
    const validatorResult = validate(config, configSchema);
    if (!validatorResult.valid) {
      validatorResult.errors.forEach((error) => logger.error(error.message));
      throw new Error(validatorResult.errors);
    }

    // Conform config.
    const conformedConfig = _.mapValues(
      config,
      ({ nibbles = 0, bumps = {} }) => ({
        nibbles,
        bumps: _.fromPairs(_.sortBy(_.toPairs(bumps), 0)),
      })
    );

    // Validate bump values increase monotonically with keys.
    _.some(conformedConfig, ({ bumps }, entityToken) =>
      _.some(_.toPairs(bumps), ([bump, value], i, c) => {
        const [lastBump, lastValue] = i ? c[i - 1] : [];
        const result = value <= lastValue;
        if (result) {
          const message = `${entityToken} bumps do not monotonically increase from '${lastBump}: ${lastValue}' to '${bump}: ${value}'.)`;
          logger.error(message);
          throw new Error(message);
        } else return result;
      })
    );

    // Validate nibbles must be less than first bump value.
    _.some(conformedConfig, ({ nibbles, bumps }, entityToken) => {
      const firstBumpValue = _.map(bumps)[0];
      const result = nibbles >= firstBumpValue;
      if (result) {
        const message = `${entityToken} nibbles (${nibbles}) not less than minimum bump value (${firstBumpValue})`;
        logger.error(message);
        throw new Error(message);
      } else return result;
    });

    return conformedConfig;
  }

  /**
   * Get config.
   *
   * @returns {ShardKeyManagerConfig} ShardKeyManager configuration object.
   */
  get config() {
    return this.#config;
  }

  /**
   * Bump nibbles for a given entityToken.
   *
   * @param {string} entityToken - Entity token.
   * @param {number} timestamp - Timestamp in milliseconds. Must be after current timestamp.
   * @param {number} value - Number of nibbles to bump (defaults to 1).
   */
  bump(entityToken, timestamp, value) {
    if (!_.isString(entityToken)) throw new Error('invalid entityToken');
    if (!_.isInteger(timestamp) || timestamp <= Date.now())
      throw new Error('timestamp must be an integer greater than current time');

    const config = _.cloneDeep(this.#config);
    _.set(config, `[${entityToken}].bumps[${timestamp}]`, value);
    this.#config = this.constructor.conformConfig(config, this.#logger);
  }

  /**
   * Get the number of nibbles for a given entityToken at a given timestamp.
   *
   * @param {string} entityToken - Entity token.
   * @param {number} [timestamp] - Timestamp in milliseconds (defaults to current time).
   * @returns {number} Nibbles for entity token at timestamp.
   */
  getNibbles(entityToken, timestamp = Date.now()) {
    if (!_.isString(entityToken)) throw new Error('invalid entityToken');

    const { nibbles, bumps } = this.#config[entityToken] ?? {};
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

    // Validate entityKey.
    if (!_.isString(entityKey) || !entityKey.length)
      throw new Error('invalid entityKey');

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
    if (!_.isString(entityToken)) throw new Error('invalid entityToken');
    if (!_.isInteger(timestamp))
      throw new Error('invalid timestamp (must be an integer)');

    this.#logger.debug(
      `getting shard key space for ${entityToken} at timestamp ${timestamp}...`
    );

    const { nibbles, bumps } = this.#config[entityToken] ?? {};
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
