import { validate } from 'jsonschema';

/**
 * ShardManager config validation schema.
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
        },
        bumps: {
          type: 'object',
          patternProperties: {
            '^\\d+$': { type: 'integer', minimum: 0 },
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
 * @property {number} [nibbles] - Hex digits in initial shard id.
 * @property {Object<number, number>} [bumps] - Timestamp-keyed increases in nibbles.
 */

/**
 * ShardManager configuration object.
 *
 * @typedef {Object<string, ShardEntityConfig>} ShardManagerConfig
 */

/**
 * Configurably generate and scale partition shards over time.
 */
export class ShardManager {
  #config;
  #logger;

  /**
   * Create a ShardManager instance.
   *
   * @param {ShardManagerConfig} config - ShardManager configuration object.
   */
  constructor({ config = {}, logger = console } = {}) {
    // Validate config against schema.
    const validatorResult = validate(config, configSchema);
    if (!validatorResult.valid)
      validatorResult.errors.forEach((error) => logger.error(error.message));

    // Validate bump values increase monotonically with keys.

    this.#config = config;
  }

  get config() {
    return this.#config;
  }
}
