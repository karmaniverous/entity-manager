import lzstring from 'lz-string';
import {
  alphabetical,
  construct,
  crush,
  diff,
  isInt,
  omit,
  parallel,
  shake,
  unique,
  zipToObject,
} from 'radash';

import { Config, EntityMap, PropertiesOfType, Stringifiable } from './Config';
import { configSchema, ParsedConfig } from './ParsedConfig';
import {
  type EntityIndexItem,
  type EntityItem,
  getEntityConfig,
  getEntityKeyConfig,
  getIndexComponents,
  getShardKey,
  getShardKeySpace,
  isNil,
  validateEntityItem,
} from './util';

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

/**
 * The EntityManager class applies a configuration-driven sharded data model &
 * query strategy to NoSql data.
 *
 * @category Entity Manager
 */
export class EntityManager<
  C extends Config<M, HashKey, RangeKey>,
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
> {
  #config: ParsedConfig;
  #logger: Logger;
  // eslint-disable-next-line no-unused-private-class-members
  #throttle: number;

  /**
   * Create an EntityManager instance.
   *
   * @param options - EntityManager options.
   */
  constructor(
    config: C,
    { logger = console, throttle = 10 }: EntityManagerOptions = {},
  ) {
    this.#config = configSchema.parse(config);
    this.#logger = logger;
    this.#throttle = throttle;
  }

  /**
   * Get the current EntityManager Config object.
   *
   * @returns Current config object.
   */
  get config() {
    return this.#config;
  }

  /**
   * Set the current config.
   *
   * @param value - RawConfig object.
   */
  set config(value) {
    this.#config = configSchema.parse(value);
  }

  encodeGeneratedProperty<Entity extends keyof EntityMap>(
    entity: Entity,
    property: PropertiesOfType<EntityMap[Entity], never>,
    item: EntityMap[Entity],
  ): string {
    const { elements, sharded } =
      this.config.entities[entity as keyof ParsedConfig].generated[property];

    return [
      ...(sharded ? [item[this.config.hashKey] as string] : []),
      ...elements.map((element) =>
        [element, (item[element] as Stringifiable).toString()].join(
          this.config.generatedValueDelimiter,
        ),
      ),
    ].join(this.config.generatedKeyDelimiter);
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  decodeGeneratedProperty<Entity extends keyof EntityMap>(
    entity: Entity,
    value: string,
  ): Partial<EntityMap[Entity]> {
    const parts = value.split(this.config.generatedKeyDelimiter);

    const result: Partial<EntityMap[Entity]> = {};

    if (parts[0].includes(this.config.shardKeyDelimiter))
      result[this.config.hashKey] = parts.shift();

    return parts.reduce((result, part) => {
      const [key, value] = part.split(this.config.generatedValueDelimiter);

      return {
        ...result,
        [key]: value,
      };
    }, result);
  }

  /**
   * Add sharded keys to an entity item. Does not mutate original item.
   *
   * @param entityToken - Entity token.
   * @param item - Entity item.
   * @param overwrite - Overwrite existing properties.
   *
   * @returns Decorated clone of {@link EntityItem | `EntityItem`}.
   */
  addKeys<T extends EntityItem>(
    entityToken: string,
    item: T,
    overwrite = false,
  ): T {
    // Validate item.
    validateEntityItem(item);

    // Get tokens.
    const { entity, shardKey: shardKeyToken } = this.config.tokens;

    // Clone item.
    const newItem = {
      ...construct(crush(item)),
      [entity]: entityToken,
    } as T;

    // Add shardKey.
    if (overwrite || isNil(newItem[shardKeyToken])) {
      // @ts-expect-error Type 'string | undefined' is not assignable to type 'T[keyof T]'.
      newItem[shardKeyToken as keyof T] = getShardKey(
        this.config,
        entityToken,
        newItem,
      );
    }

    // Add keys.
    const { keys } = getEntityConfig(this.config, entityToken);

    for (const [keyToken, { encode }] of Object.entries(keys))
      if (overwrite || isNil(newItem[keyToken]))
        // @ts-expect-error Type 'string | undefined' is not assignable to type 'T[keyof T]'.
        newItem[keyToken as keyof T] = encode(newItem);

    // Remove shaken item.
    const result = shake(omit(newItem, [entity]), isNil);

    this.#logger.debug('added sharded index keys to entity item', {
      entityToken,
      item,
      overwrite,
      result,
    });

    return result as T;
  }

  /**
   * Reverses {@link EntityManager.addKeys | `EntityManager.addKeys `}.
   *
   * Remove sharded keys from an entity item. Does not mutate original item or
   * remove keys marked with `retain = true`.
   *
   * @param entityToken - Entity token.
   * @param item - Entity item.
   *
   * @returns Stripped entity item.
   */
  removeKeys(entityToken: string, item: EntityItem) {
    // Validate item.
    validateEntityItem(item);

    // Remove keys.
    const { keys } = this.config.entities[entityToken];
    const unretainedKeys = Object.keys(keys).filter((key) => !keys[key].retain);
    const result = omit(item, [...unretainedKeys, this.config.tokens.shardKey]);

    this.#logger.debug('removed sharded index keys from entity item', {
      entityToken,
      item,
      result,
    });

    return result as EntityItem;
  }
}
