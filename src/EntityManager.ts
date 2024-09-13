import { objectify, shake, zipToObject } from 'radash';
import stringHash from 'string-hash';

import type {
  Config,
  EntityItem,
  EntityMap,
  ShardBump,
  Stringifiable,
  StringifiableTypes,
} from './Config';
import { configSchema, type ParsedConfig } from './ParsedConfig';

/**
 * A two-layer map of page keys, used to query the next page of data for a
 * given index on each shard of a given hash key.
 *
 * The keys of the outer object are the keys of the QueryMap object passed to
 * the `query` method. Each should correspond to an index for the given entity.
 * This index contains the range key of an individual query.
 *
 * The keys of the inner object are the hashKey value passed to each
 * ShardQueryFunction. This is the hash key of an individual query.
 *
 * The values are the `pageKey` returned by the previous query on the related
 * index & shard. An `undefined` value indicates that there are no more pages to
 * query for that index & shard.
 */
export type PageKeyMap = Record<
  string,
  Record<string, Record<string, Stringifiable> | undefined>
>;

const toStringifiable = (
  type: StringifiableTypes,
  value?: string,
): Stringifiable | undefined => {
  if (!value) return;

  switch (type) {
    case 'string':
      return value;
    case 'number':
      return Number(value);
    case 'boolean':
      return value === 'true';
    case 'bigint':
      return BigInt(value);
    default:
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      throw new Error(
        `unknown stringifiable type '${(type as string | undefined) ?? ''}'`,
      );
  }
};

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
  get config(): ParsedConfig {
    return this.#config;
  }

  /**
   * Set the current config.
   *
   * @param value - ParsedConfig object.
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
  getShardBump(entity: keyof EntityMap, timestamp: number): ShardBump {
    return [...this.config.entities[entity].shardBumps]
      .reverse()
      .find((bump) => bump.timestamp <= timestamp)!;
  }

  /**
   * Encode a generated property value. Returns a string or undefined if atomicity requirement not met.
   *
   * @param entity - Entity token.
   * @param item - Entity item.
   * @param property - Generated property name.
   *
   * @returns Encoded generated property value.
   */
  encodeGeneratedProperty<
    Entity extends keyof EntityMap,
    Item extends EntityItem<Entity, EntityMap, HashKey, RangeKey>,
  >(
    entity: Entity,
    item: Item,
    property: keyof EntityMap[Entity],
  ): string | undefined {
    try {
      // Validate entity property.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!this.config.entities[entity].generated[property])
        throw new Error(`unknown generated property`);

      const { atomic, elements, sharded } =
        this.config.entities[entity].generated[property];

      // Map elements to [element, value] pairs.
      const elementMap = elements.map((element) => [
        element,
        item[element as keyof Item],
      ]);

      // Validate atomicity requirement.
      if (atomic && elementMap.some(([, value]) => isNil(value))) return;

      // Encode property value.
      const encoded = [
        ...(sharded ? [item[this.config.hashKey as keyof Item]] : []),
        ...elementMap.map(([element, value]) =>
          [element, (value ?? '').toString()].join(
            this.config.generatedValueDelimiter,
          ),
        ),
      ].join(this.config.generatedKeyDelimiter);

      this.#logger.debug('encoded generated property', {
        entity,
        item,
        property,
        encoded,
      });

      return encoded;
    } catch (error) {
      if (error instanceof Error)
        this.#logger.debug(error.message, { entity, item, property });

      throw error;
    }
  }

  /**
   * Decode a generated property value. Returns a partial EntityItem.
   *
   * @param entity - Entity token.
   * @param value - Encoded generated property value.
   *
   * @returns Partial EntityItem with decoded properties decoded from `value`.
   */
  decodeGeneratedProperty<
    Entity extends keyof EntityMap,
    Item extends EntityItem<Entity, EntityMap, HashKey, RangeKey>,
  >(entity: Entity, value: string): Partial<Item> {
    try {
      // Handle degenerate case.
      if (!value) return {};

      // Split value into keys.
      const keys = value.split(this.config.generatedKeyDelimiter);

      // Initiate result with hashKey if sharded.
      const decoded = keys[0].includes(this.config.shardKeyDelimiter)
        ? { [this.config.hashKey]: keys.shift() }
        : {};

      // Split keys into values & validate.
      const values = keys.map((key) => {
        const pair = key.split(this.config.generatedValueDelimiter);

        if (pair.length !== 2)
          throw new Error(`invalid generated property value '${key}'`);

        return pair;
      });

      // Assign decoded properties.
      Object.assign(
        decoded,
        objectify(
          values,
          ([key]) => key,
          ([key, value]) =>
            toStringifiable(this.config.entities[entity].types[key], value),
        ),
      );

      this.#logger.debug('decoded generated property', {
        entity,
        value,
        decoded,
      });

      return decoded as Partial<Item>;
    } catch (error) {
      if (error instanceof Error)
        this.#logger.debug(error.message, { entity, value });

      throw error;
    }
  }

  /**
   * Update the hash key on an EntityItem. Mutates `item`.
   *
   * @param entity - Entity token.
   * @param item - EntityItem.
   * @param overwrite - Overwrite existing shard key (default `false`).
   *
   * @returns Mutated `item` with updated hash key.
   */
  updateItemHashKey<
    Entity extends keyof EntityMap,
    Item extends EntityItem<Entity, EntityMap, HashKey, RangeKey>,
  >(entity: Entity, item: Item, overwrite = false): Item {
    try {
      // Return current item if hashKey exists and overwrite is false.
      if (item[this.config.hashKey as keyof Item] && !overwrite) {
        this.#logger.debug('did not overwrite existing entity item hash key', {
          entity,
          item,
          overwrite,
        });

        return item;
      }

      // Get item timestamp property & validate.
      const timestamp: number = item[
        this.config.entities[entity].timestampProperty as keyof Item
      ] as unknown as number;

      if (isNil(timestamp)) throw new Error(`missing item timestamp property`);

      // Find first entity sharding bump before timestamp.
      const { nibbleBits, nibbles } = this.getShardBump(entity, timestamp);

      let hashKey = `${entity}${this.config.shardKeyDelimiter}`;

      if (nibbles) {
        // Radix is the numerical base of the shardKey.
        const radix = 2 ** nibbleBits;

        // Get item unique property & validate.
        const uniqueId = item[
          this.config.entities[entity].uniqueProperty as keyof Item
        ] as unknown as string;

        if (isNil(timestamp)) throw new Error(`missing item unique property`);

        hashKey += (stringHash(uniqueId) % (nibbles * radix))
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
    } catch (error) {
      if (error instanceof Error)
        this.#logger.debug(error.message, { entity, item, overwrite });

      throw error;
    }
  }

  /**
   * Update the range key on an EntityItem. Mutates `item`.
   *
   * @param entity - Entity token.
   * @param item - EntityItem.
   * @param overwrite - Overwrite existing shard key (default `false`).
   *
   * @returns Mutated `item` with updated range key.
   */
  updateItemRangeKey<
    Entity extends keyof EntityMap,
    Item extends EntityItem<Entity, EntityMap, HashKey, RangeKey>,
  >(entity: Entity, item: Item, overwrite = false): Item {
    try {
      // Return current item if rangeKey exists and overwrite is false.
      if (item[this.config.rangeKey as keyof Item] && !overwrite) {
        this.#logger.debug('did not overwrite existing entity item range key', {
          entity,
          item,
          overwrite,
        });

        return item;
      }

      // Get item unique property & validate.
      const uniqueProperty =
        item[this.config.entities[entity].uniqueProperty as keyof Item];

      if (isNil(uniqueProperty))
        throw new Error(`missing item unique property`);

      // Update range key.
      Object.assign(item, {
        [this.config.rangeKey]: [
          this.config.entities[entity].uniqueProperty,
          uniqueProperty,
        ].join(this.config.generatedValueDelimiter),
      });

      this.#logger.debug('updated entity item range key', {
        entity,
        overwrite,
        item,
      });

      return item;
    } catch (error) {
      if (error instanceof Error)
        this.#logger.debug(error.message, { entity, item, overwrite });

      throw error;
    }
  }

  /**
   * Update generated properties on an EntityItem. Mutates `item`.
   *
   * @param entity - Entity token.
   * @param item - EntityItem.
   * @param overwrite - Overwrite existing generated properties (default `false`).
   *
   * @returns Mutated `item` with updated generated properties.
   */
  updateItemGeneratedProperties<
    Entity extends keyof EntityMap,
    Item extends EntityItem<Entity, EntityMap, HashKey, RangeKey>,
  >(entity: Entity, item: Item, overwrite = false): Item {
    try {
      // Update hash key.
      this.updateItemHashKey(entity, item, overwrite);

      // Update range key.
      this.updateItemRangeKey(entity, item, overwrite);

      // Update generated properties.
      for (const property in this.config.entities[entity].generated) {
        if (overwrite || isNil(item[property as keyof Item])) {
          const encoded = this.encodeGeneratedProperty(entity, item, property);

          if (encoded) Object.assign(item, { [property]: encoded });
          else delete item[property as keyof Item];
        }
      }

      this.#logger.debug('updated entity item generated properties', {
        entity,
        overwrite,
        item,
      });

      return item;
    } catch (error) {
      if (error instanceof Error)
        this.#logger.debug(error.message, { entity, item, overwrite });

      throw error;
    }
  }

  /**
   * Strips generated properties from an EntityItem. Mutates `item`.
   *
   * @param entity - Entity token.
   * @param item - EntityItem.
   *
   * @returns Mutated `item` without generated properties.
   */
  stripItemGeneratedProperties<
    Entity extends keyof EntityMap,
    Item extends EntityItem<Entity, EntityMap, HashKey, RangeKey>,
  >(entity: Entity, item: Item): Item {
    try {
      // Delete hash & range keys.
      delete item[this.config.hashKey as keyof Item];
      delete item[this.config.rangeKey as keyof Item];

      // Delete generated properties.
      for (const property in this.config.entities[entity].generated)
        delete item[property as keyof Item];

      this.#logger.debug('stripped entity item generated properties', {
        entity,
        item,
      });

      return item;
    } catch (error) {
      if (error instanceof Error)
        this.#logger.debug(error.message, { entity, item });

      throw error;
    }
  }

  /**
   * Unwraps an entity index into deduped, sorted, ungenerated elements.
   *
   * @param entity - Entity token.
   * @param index - Index token.
   * @returns Deduped, sorted array of ungenerated index component elements.
   */
  unwrapIndex<Entity extends keyof EntityMap>(entity: Entity, index: string) {
    try {
      // Validate index.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!this.config.entities[entity].indexes[index])
        throw new Error(`unknown entity index`);

      const generated = this.config.entities[entity].generated;
      const generatedKeys = Object.keys(generated);

      return this.config.entities[entity].indexes[index]
        .map((component) =>
          component === this.config.hashKey
            ? this.config.hashKey
            : component === this.config.rangeKey
              ? this.config.entities[entity].uniqueProperty
              : generatedKeys.includes(component)
                ? generated[component].elements
                : component,
        )
        .flat()
        .sort();
    } catch (error) {
      if (error instanceof Error)
        this.#logger.debug(error.message, { entity, index });

      throw error;
    }
  }

  /**
   * Condense a partial EntityItem into a delimited string representing the ungenerated component elements of a Config entity index.
   *
   * @remarks
   * Reverses {@link EntityManager.rehydrateIndexItem | `rehydrateIndexItem`}.
   *
   * To create the output value, this method:
   *
   * * Unwraps `index` components into deduped, sorted, ungenerated elements.
   * * Joins index component values from `item` with generated key delimiter.
   *
   * `item` must be populated with all required index component elements!
   *
   * @param entity - Entity token.
   * @param index - Entity index token.
   * @param item - EntityItem object.
   *
   * @returns Dehydrated index.
   */
  dehydrateIndexItem<
    Entity extends keyof EntityMap,
    Item extends EntityItem<Entity, EntityMap, HashKey, RangeKey>,
  >(entity: Entity, index: string, item?: Partial<Item>): string {
    try {
      // Handle degenerate case.
      if (!item) return '';

      // Unwrap index elements.
      const elements = this.unwrapIndex(entity, index);

      // Join index element values.
      const dehydrated = elements
        .map((element) => item[element as keyof Item]?.toString() ?? '')
        .join(this.config.generatedKeyDelimiter);

      this.#logger.debug('dehydrated index', {
        entity,
        index,
        item,
        elements,
        dehydrated,
      });

      return dehydrated;
    } catch (error) {
      if (error instanceof Error)
        this.#logger.debug(error.message, { entity, index, item });

      throw error;
    }
  }

  /**
   * Convert a delimited string into a partial EntityItem representing the ungenerated component elements of a Config entity index.
   *
   * @remarks
   * Reverses {@link EntityManager.dehydrateIndexItem | `dehydrateIndexItem`}.
   *
   * {@link EntityManager.dehydrateIndexItem | `dehydrateIndexItem`} alphebetically sorts unwrapped index elements during
   * the dehydration process. This method assumes delimited element values are
   * presented in the same order.
   *
   * @param entity - Entity token.
   * @param index - Entity index token.
   * @param value - Dehydrated index.
   *
   * @returns Rehydrated index.
   */
  rehydrateIndexItem<
    Entity extends keyof EntityMap,
    Item extends EntityItem<Entity, EntityMap, HashKey, RangeKey>,
  >(entity: Entity, index: string, value: string): Partial<Item> {
    try {
      // Unwrap index elements.
      const elements = this.unwrapIndex(entity, index);

      // Split dehydrated value & validate.
      const values = value.split(this.config.generatedKeyDelimiter);

      if (elements.length !== values.length)
        throw new Error('index rehydration key-value mismatch');

      // Assign values to elements.
      const rehydrated = shake(
        zipToObject(
          elements,
          values.map((value, i) =>
            toStringifiable(
              this.config.entities[entity].types[elements[i]],
              value,
            ),
          ),
        ),
      ) as Partial<Item>;

      this.#logger.debug('rehydrated index', {
        entity,
        index,
        value,
        elements,
        values,
        rehydrated,
      });

      return rehydrated;
    } catch (error) {
      if (error instanceof Error)
        this.#logger.debug(error.message, { entity, index, value });

      throw error;
    }
  }

  /**
   * Dehydrate a {@link PageKeyMap | `PageKeyMap`} object into an array of dehydrated page keys.
   *
   * @param entity - Entity token.
   * @param pageKeyMap - PageKeyMap object to dehydrate.
   *
   * @returns  Array of dehydrated page keys.
   *
   * @remarks
   * In the returned array, an empty string member indicates the corresponding
   * page key is `undefined`.
   *
   * An empty returned array indicates all page keys are `undefined`.
   */
  dehydratePageKeyMap<Entity extends keyof EntityMap>(
    entity: Entity,
    pageKeyMap: PageKeyMap,
  ): string[] {
    try {
      // Extract & sort index.
      const indexes = Object.keys(pageKeyMap).sort();

      // Extract & sort hash keys.
      const hashKeys = Object.keys(pageKeyMap[indexes[0]]).sort();

      // Dehydrate page keys.
      let dehydrated: string[] = [];

      for (const index of indexes) {
        for (const hashKey of hashKeys) {
          // Undefineed pageKey.
          if (!pageKeyMap[index][hashKey]) {
            dehydrated.push('');
            continue;
          }

          // Compose item from page key
          const item = Object.entries(pageKeyMap[index][hashKey]).reduce<
            Partial<EntityItem<Entity, M, HashKey, RangeKey>>
          >((item, [property, value]) => {
            if (property === this.config.rangeKey)
              Object.assign(item, {
                [this.config.entities[entity].uniqueProperty]: value,
              });

            if (property in this.config.entities[entity].generated)
              Object.assign(
                item,
                this.decodeGeneratedProperty(entity, value as string),
              );
            else Object.assign(item, { [property]: value });

            return item;
          }, {});

          // Dehydrate index from item.
          dehydrated.push(this.dehydrateIndexItem(entity, index, item));
        }
      }

      // Replace with empty array if all pageKeys are empty strings.
      if (dehydrated.every((pageKey) => pageKey === '')) dehydrated = [];

      this.#logger.debug('dehydrated page key map', {
        entity,
        pageKeyMap,
        indexes,
        hashKeys,
        dehydrated,
      });

      return dehydrated;
    } catch (error) {
      if (error instanceof Error)
        this.#logger.debug(error.message, { entity, pageKeyMap });

      throw error;
    }
  }
}
