import stringHash from 'string-hash';

import type {
  Config,
  EntityItem,
  EntityMap,
  PropertiesOfType,
  Stringifiable,
} from './Config';
import { configSchema, type ParsedConfig } from './ParsedConfig';
import { objectify } from 'radash';

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
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
> {
  #config: ParsedConfig;
  // eslint-disable-next-line no-unused-private-class-members
  #logger: Logger;
  // eslint-disable-next-line no-unused-private-class-members
  #throttle: number;

  /**
   * Create an EntityManager instance.
   *
   * @param options - EntityManager options.
   */
  constructor(
    config: Config<M, HashKey, RangeKey>,
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

  /**
   * Get first entity shard bump before timestamp.
   *
   * @param entity - Entity token.
   * @param timestamp - Timestamp in milliseconds.
   *
   * @returns Shard bump object.
   */
  getShardBump(entity: keyof EntityMap, timestamp: number) {
    return [...this.config.entities[entity].shardBumps]
      .reverse()
      .find((bump) => bump.timestamp <= timestamp)!;
  }

  /**
   * Update the hash key on an entity item. Mutates item.
   *
   * @param entity - Entity token.
   * @param item - Entity item.
   * @param overwrite - Overwrite existing shard key (default `false`).
   * @returns Mutated item with updated hash key.
   */
  updateItemHashKey<
    Entity extends keyof EntityMap,
    Item extends EntityItem<Entity, EntityMap, HashKey, RangeKey>,
  >(entity: Entity, item: Item, overwrite = false): Item {
    // Return current item if hashKey exists and overwrite is false.
    if (item[this.config.hashKey as keyof Item] && !overwrite) {
      this.#logger.debug('did not update entity item hash key', {
        entity,
        overwrite,
        item,
      });

      return item;
    }

    // Get item timestamp.
    const timestamp: number = item[
      this.config.entities[entity].timestampProperty as keyof Item
    ] as unknown as number;

    // Find first entity sharding bump before timestamp.
    const { nibbleBits, nibbles } = this.getShardBump(entity, timestamp);

    let hashKey = `${entity}${this.config.shardKeyDelimiter}`;

    if (nibbles) {
      // Radix is the numerical base of the shardKey.
      const radix = 2 ** nibbleBits;

      hashKey += (
        stringHash(
          item[
            this.config.entities[entity].uniqueProperty as keyof Item
          ] as unknown as string,
        ) %
        (nibbles * radix)
      )
        .toString(radix)
        .padStart(nibbles, '0');
    }

    Object.assign(item, { [this.config.hashKey]: hashKey });

    this.#logger.debug('updated entity item hash key', {
      entity,
      overwrite,
      item,
    });

    return item;
  }

  encodeGeneratedProperty<
    Entity extends keyof EntityMap,
    Item extends EntityItem<Entity, EntityMap, HashKey, RangeKey>,
  >(
    entity: Entity,
    item: Item,
    property: PropertiesOfType<EntityMap[Entity], never>,
  ): string {
    const { elements, sharded } =
      this.config.entities[entity].generated[property];

    return [
      ...(sharded ? [item[this.config.hashKey as keyof Item]] : []),
      ...elements.map((element) =>
        [
          element,
          (item[element as keyof Item] as Stringifiable).toString(),
        ].join(this.config.generatedValueDelimiter),
      ),
    ].join(this.config.generatedKeyDelimiter);
  }

  decodeGeneratedProperty<
    Entity extends keyof EntityMap,
    Item extends EntityItem<Entity, EntityMap, HashKey, RangeKey>,
  >(entity: Entity, value: string): Partial<Item> {
    const parts = value.split(this.config.generatedKeyDelimiter);

    const result = parts[0].includes(this.config.shardKeyDelimiter)
      ? { [this.config.hashKey]: parts.shift() }
      : {};

    return Object.assign(
      result,
      objectify(
        parts.map((part) => part.split(this.config.generatedValueDelimiter)),
        ([key]) => key,
        ([, value]) => value,
      ),
    ) as Partial<Item>;
  }
}
