import { Stringifiable } from '@karmaniverous/string-utilities';
import { isInt, isObject, range } from 'radash';
import stringHash from 'string-hash';

import { type Config } from './ParsedConfig';
import { ShardBump } from './Config';

/**
 * Tests whether an entityToken is valid.
 *
 * @param config - Config object.
 * @param entityToken - Entity token.
 * @returns true if entityToken is valid.
 */
export const validateEntityToken = (config: Config, entityToken: string) => {
  if (!(entityToken in config.entities))
    throw new Error(`invalid entity ${entityToken}`);
  else return true;
};

/**
 * Get entity config.
 *
 * @param config - Config object.
 * @param entityToken - Entity token.
 * @returns Entity config.
 */
export const getEntityConfig = (config: Config, entityToken: string) => {
  validateEntityToken(config, entityToken);
  return config.entities[entityToken];
};

/**
 * Tests whether an entity key token is valid.
 *
 * @param config - Config object.
 * @param entityToken - Entity token.
 * @param keyToken - Key token.
 * @returns true if keyToken is valid.
 */
export const validateEntityKeyToken = (
  config: Config,
  entityToken: string,
  keyToken: string,
) => {
  validateEntityToken(config, entityToken);

  if (!(keyToken in config.entities[entityToken].keys))
    throw new Error(`invalid entity ${entityToken} key ${keyToken}`);
  else return true;
};

/**
 * Get entity config.
 *
 * @param config - Config object.
 * @param entityToken - Entity token.
 * @param keyToken - Key token.
 * @returns Entity key config.
 */
export const getEntityKeyConfig = (
  config: Config,
  entityToken: string,
  keyToken: string,
) => {
  validateEntityKeyToken(config, entityToken, keyToken);

  return config.entities[entityToken].keys[keyToken];
};

/**
 * Get index components.
 *
 * @param config - Config object.
 * @param entityToken - Entity token.
 * @param indexToken - Index token.
 * @returns Entity config.
 */
export const getIndexComponents = (
  config: Config,
  entityToken: string,
  indexToken: string,
) => {
  const { indexes } = getEntityConfig(config, entityToken);

  if (!(indexToken in indexes))
    throw new Error(`invalid index ${indexToken} on entity ${entityToken}`);

  return indexes[indexToken];
};

/**
 * Tests whether a timestamp is valid.
 *
 * @param timestamp - timestamp.
 * @returns true if timestamp is valid.
 */
export const validateTimestamp = (timestamp: number) => {
  if (!isInt(timestamp) || timestamp < 0)
    throw new Error(`timestamp must be a non-negative integer`);
  else return true;
};

/**
 * Find first entity sharding bump before timestamp.
 *
 * @param config - Config object.
 * @param entityToken - Entity token.
 * @param timestamp - Timestamp in milliseconds (defaults to current time).
 * @returns Result object.
 */
export const findBump = (
  config: Config,
  entityToken: string,
  timestamp = Date.now(),
) => {
  validateTimestamp(timestamp);

  return [...getEntityConfig(config, entityToken).sharding.bumps]
    .reverse()
    .find((bump) => bump.timestamp <= timestamp)!;
};

/**
 * Return a shard key for a given entity item.
 *
 * @param config - Config object.
 * @param entityToken - Entity token.
 * @param item - Entity item.
 * @returns shard key.
 */
export const getShardKey = (
  config: Config,
  entityToken: string,
  item: EntityItem,
) => {
  // Get item timestamp.
  const { sharding } = getEntityConfig(config, entityToken);

  const timestamp = sharding.timestamp(item);

  // Find first entity sharding bump before timestamp.
  const { nibbleBits, nibbles } = findBump(config, entityToken, timestamp);

  // If no nibbles shortcut calculation.
  if (!nibbles) return undefined;

  // Get item entity key.
  const entityKey = sharding.entityKey(item);

  // Radix is the numerical base of the shardKey.
  const radix = 2 ** nibbleBits;

  // Calculate & return the shard key.
  if (entityKey)
    return (stringHash(entityKey) % (nibbles * radix))
      .toString(radix)
      .padStart(nibbles, '0');
  else throw new Error('entityKey required for positive-nibble bumps');
};

/**
 * Return an array of shard keys valid for a given shardBumps array & timestamp
 * range.
 *
 * @param shardBumps - Array of ShardBump.
 * @param timestampFrom - Lower timestamp limit of shard key space. Defaults to `0`.
 * @param timestampTo - Upper timestamp limit of shard key space Defaults to `Date.now()`.
 * @returns Shard key space.
 */
export const getShardKeySpace = (
  shardBumps: ShardBump[],
  timestampFrom = 0,
  timestampTo = Date.now(),
) => {
  if (!shardBumps.length) throw new Error('no shardBumps defined');

  validateTimestamp(timestampFrom);
  validateTimestamp(timestampTo);

  const lastBump = shardBumps.length - 1;

  return shardBumps
    .filter(
      (bump, i) =>
        (i === lastBump || shardBumps[i + 1].timestamp > timestampFrom) &&
        bump.timestamp <= timestampTo,
    )
    .flatMap(({ nibbleBits, nibbles }) => {
      const radix = 2 ** nibbleBits;

      return nibbles
        ? [...range(0, radix ** nibbles - 1)].map((nibble) =>
            nibble.toString(radix).padStart(nibbles, '0'),
          )
        : undefined;
    });
};

/**
 * Entity item type.
 *
 * @category Items
 */
export type EntityItem = Record<string, unknown>;

/**
 * Tests whether an item is valid.
 *
 * @param item - Entity token.
 * @returns true if entityToken is valid.
 */
export const validateEntityItem = (item: EntityItem) => {
  if (!isObject(item))
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    throw new Error(`invalid item: ${(item as Stringifiable).toString()}`);
  else return true;
};

/**
 * Entity index item type.
 *
 * @category Items
 */
export type EntityIndexItem = Record<string, Stringifiable>;

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
