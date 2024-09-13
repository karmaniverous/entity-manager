import {
  cluster,
  mapValues,
  objectify,
  range,
  shake,
  zipToObject,
} from 'radash';
import stringHash from 'string-hash';

import type {
  Config,
  EntityItem,
  EntityMap,
  ShardBump,
  Stringifiable,
  StringifiableTypes,
} from './Config';
import {
  type EntityManagerOptions,
  isNil,
  type Logger,
  PageKeyMap,
} from './EntityManager.types';
import { configSchema, type ParsedConfig } from './ParsedConfig';

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
      throw new Error(
        `unknown stringifiable type '${(type as string | undefined) ?? ''}'`,
      );
  }
};

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
   * Validate that an entity is defined in the EntityManager config.
   *
   * @param entity - Entity token.
   *
   * @throws `Error` if `entity` is invalid.
   */
  private validateEntity(entity: string): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!this.config.entities[entity]) throw new Error('unknown entity');
  }

  /**
   * Validate that an entity index is defined in EntityManager config.
   *
   * @param entity - Entity token.
   * @param index - Index token.
   *
   * @throws `Error` if `entity` is invalid.
   * @throws `Error` if `index` is invalid.
   */
  private validateEntityIndex(entity: string, index: string): void {
    this.validateEntity(entity);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!this.config.entities[entity].indexes[index])
      throw new Error('unknown entity index');
  }

  /**
   * Validate that an entity generated property is defined in EntityManager
   * config.
   *
   * @param entity - Entity token.
   * @param property - Entity generated property.
   * @param sharded - Whether the generated property is sharded. `undefined`
   * indicates no constraint.
   *
   * @throws `Error` if `entity` is invalid.
   * @throws `Error` if `property` is invalid.
   * @throws `Error` if `sharded` is specified & does not match `property`
   * sharding.
   */
  private validateEntityGenerated(
    entity: string,
    generated: string,
    sharded?: boolean,
  ): void {
    this.validateEntity(entity);

    if (
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      !this.config.entities[entity].generated[generated] &&
      generated !== this.config.hashKey
    )
      throw new Error('unknown generated property');

    if (
      sharded !== undefined &&
      (sharded !== this.config.entities[entity].generated[generated].sharded ||
        (!sharded && generated === this.config.hashKey))
    )
      throw new Error(
        `entity generated property ${sharded ? 'not ' : ''}sharded`,
      );
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
   *
   * @throws `Error` if `entity` is invalid.
   */
  getShardBump(entity: keyof EntityMap, timestamp: number): ShardBump {
    // Validate params.
    this.validateEntity(entity);

    return [...this.config.entities[entity].shardBumps]
      .reverse()
      .find((bump) => bump.timestamp <= timestamp)!;
  }

  /**
   * Encode a generated property value. Returns a string or undefined if atomicity requirement not met.
   *
   * @param item - Entity item.
   * @param entity - Entity token.
   * @param property - Generated property name.
   *
   * @returns Encoded generated property value.
   *
   * @throws `Error` if `entity` is invalid.
   * @throws `Error` if `property` is invalid.
   *
   */
  encodeGeneratedProperty<
    Item extends EntityItem<Entity, EntityMap, HashKey, RangeKey>,
    Entity extends keyof EntityMap,
  >(
    item: Item,
    entity: Entity,
    property: keyof EntityMap[Entity],
  ): string | undefined {
    try {
      // Validate params.
      this.validateEntityGenerated(entity, property);

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
        item,
        entity,
        property,
        encoded,
      });

      return encoded;
    } catch (error) {
      if (error instanceof Error)
        this.#logger.debug(error.message, { item, entity, property });

      throw error;
    }
  }

  /**
   * Decode a generated property value. Returns a partial EntityItem.
   *
   * @param encoded - Encoded generated property value.
   * @param entity - Entity token.
   *
   * @returns Partial EntityItem with decoded properties decoded from `value`.
   *
   * @throws `Error` if `entity` is invalid.
   */
  decodeGeneratedProperty<
    Item extends EntityItem<Entity, EntityMap, HashKey, RangeKey>,
    Entity extends keyof EntityMap,
  >(encoded: string, entity: Entity): Partial<Item> {
    try {
      // Validate params.
      this.validateEntity(entity);

      // Handle degenerate case.
      if (!encoded) return {};

      // Split encoded into keys.
      const keys = encoded.split(this.config.generatedKeyDelimiter);

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
        encoded,
        entity,
        decoded,
      });

      return decoded as Partial<Item>;
    } catch (error) {
      if (error instanceof Error)
        this.#logger.debug(error.message, { encoded, entity });

      throw error;
    }
  }

  /**
   * Update the hash key on an EntityItem. Mutates `item`.
   *
   * @param item - EntityItem.
   * @param entity - Entity token.
   * @param overwrite - Overwrite existing shard key (default `false`).
   *
   * @returns Mutated `item` with updated hash key.
   *
   * @throws `Error` if `entity` is invalid.
   */
  updateItemHashKey<
    Item extends EntityItem<Entity, EntityMap, HashKey, RangeKey>,
    Entity extends keyof EntityMap,
  >(item: Item, entity: Entity, overwrite = false): Item {
    try {
      // Validate params.
      this.validateEntity(entity);

      // Return current item if hashKey exists and overwrite is false.
      if (item[this.config.hashKey as keyof Item] && !overwrite) {
        this.#logger.debug('did not overwrite existing entity item hash key', {
          item,
          entity,
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
        const uniqueId =
          item[this.config.entities[entity].uniqueProperty as keyof Item];

        if (isNil(uniqueId)) throw new Error(`missing item unique property`);

        hashKey += (stringHash(uniqueId.toString()) % (nibbles * radix))
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
        this.#logger.debug(error.message, { item, entity, overwrite });

      throw error;
    }
  }

  /**
   * Update the range key on an EntityItem. Mutates `item`.
   *
   * @param item - EntityItem.
   * @param entity - Entity token.
   * @param overwrite - Overwrite existing shard key (default `false`).
   *
   * @returns Mutated `item` with updated range key.
   *
   * @throws `Error` if `entity` is invalid.
   * @throws `Error` if `item` unique property is missing.
   */
  updateItemRangeKey<
    Item extends EntityItem<Entity, EntityMap, HashKey, RangeKey>,
    Entity extends keyof EntityMap,
  >(item: Item, entity: Entity, overwrite = false): Item {
    try {
      // Validate params.
      this.validateEntity(entity);

      // Return current item if rangeKey exists and overwrite is false.
      if (item[this.config.rangeKey as keyof Item] && !overwrite) {
        this.#logger.debug('did not overwrite existing entity item range key', {
          item,
          entity,
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
        this.#logger.debug(error.message, { item, entity, overwrite });

      throw error;
    }
  }

  /**
   * Update generated properties on an EntityItem. Mutates `item`.
   *
   * @param item - EntityItem.
   * @param entity - Entity token.
   * @param overwrite - Overwrite existing generated properties (default `false`).
   *
   * @returns Mutated `item` with updated generated properties.
   *
   * @throws `Error` if `entity` is invalid.
   */
  updateItemGeneratedProperties<
    Item extends EntityItem<Entity, EntityMap, HashKey, RangeKey>,
    Entity extends keyof EntityMap,
  >(item: Item, entity: Entity, overwrite = false): Item {
    try {
      // Validate params.
      this.validateEntity(entity);

      // Update hash key.
      this.updateItemHashKey(item, entity, overwrite);

      // Update range key.
      this.updateItemRangeKey(item, entity, overwrite);

      // Update generated properties.
      for (const property in this.config.entities[entity].generated) {
        if (overwrite || isNil(item[property as keyof Item])) {
          const encoded = this.encodeGeneratedProperty(item, entity, property);

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
        this.#logger.debug(error.message, { entity, overwrite, item });

      throw error;
    }
  }

  /**
   * Strips generated properties from an EntityItem. Mutates `item`.
   *
   * @param item - EntityItem.
   * @param entity - Entity token.
   *
   * @returns Mutated `item` without generated properties.
   *
   * @throws `Error` if `entity` is invalid.
   */
  stripItemGeneratedProperties<
    Item extends EntityItem<Entity, EntityMap, HashKey, RangeKey>,
    Entity extends keyof EntityMap,
  >(item: Item, entity: Entity): Item {
    try {
      // Validate params.
      this.validateEntity(entity);

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
        this.#logger.debug(error.message, { item, entity });

      throw error;
    }
  }

  /**
   * Unwraps an entity index into deduped, sorted, ungenerated elements.
   *
   * @param index - Index token.
   * @param entity - Entity token.
   *
   * @returns Deduped, sorted array of ungenerated index component elements.
   *
   * @throws `Error` if `entity` is invalid.
   * @throws `Error` if `index` is invalid.
   */
  unwrapIndex<Entity extends keyof EntityMap>(index: string, entity: Entity) {
    try {
      // Validate params.
      this.validateEntityIndex(entity, index);

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
        this.#logger.debug(error.message, { index, entity });

      throw error;
    }
  }

  /**
   * Condense a partial EntityItem into a delimited string representing the
   * ungenerated component elements of a Config entity index.
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
   * @param item - EntityItem object.
   * @param entity - Entity token.
   * @param index - Entity index token.
   * @param omit - Index components to omit from the output value.
   *
   * @returns Dehydrated index.
   *
   * @throws `Error` if `entity` is invalid.
   * @throws `Error` if `index` is invalid.
   */
  dehydrateIndexItem<
    Item extends EntityItem<Entity, EntityMap, HashKey, RangeKey>,
    Entity extends keyof EntityMap,
  >(
    item: Partial<Item> | undefined,
    entity: Entity,
    index: string,
    omit: string[] = [],
  ): string {
    try {
      // Validate params.
      this.validateEntityIndex(entity, index);

      // Handle degenerate case.
      if (!item) return '';

      // Unwrap index elements.
      const elements = this.unwrapIndex(index, entity).filter(
        (element) => !omit.includes(element),
      );

      // Join index element values.
      const dehydrated = elements
        .map((element) => item[element as keyof Item]?.toString() ?? '')
        .join(this.config.generatedKeyDelimiter);

      this.#logger.debug('dehydrated index', {
        item,
        entity,
        index,
        elements,
        dehydrated,
      });

      return dehydrated;
    } catch (error) {
      if (error instanceof Error)
        this.#logger.debug(error.message, { item, entity, index });

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
   * @param dehydrated - Dehydrated index.
   * @param entity - Entity token.
   * @param index - Entity index token.
   * @param omit - Index components omitted from `dehydrated`.
   *
   * @returns Rehydrated index.
   *
   * @throws `Error` if `entity` is invalid.
   * @throws `Error` if `index` is invalid.
   */
  rehydrateIndexItem<
    Item extends EntityItem<Entity, EntityMap, HashKey, RangeKey>,
    Entity extends keyof EntityMap,
  >(
    dehydrated: string,
    entity: Entity,
    index: string,
    omit: string[] = [],
  ): Partial<Item> {
    try {
      // Validate params.
      this.validateEntityIndex(entity, index);

      // Unwrap index elements.
      const elements = this.unwrapIndex(index, entity).filter(
        (element) => !omit.includes(element),
      );

      // Split dehydrated value & validate.
      const values = dehydrated.split(this.config.generatedKeyDelimiter);

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
        dehydrated,
        entity,
        index,
        elements,
        values,
        rehydrated,
      });

      return rehydrated;
    } catch (error) {
      if (error instanceof Error)
        this.#logger.debug(error.message, { dehydrated, entity, index });

      throw error;
    }
  }

  /**
   * Dehydrate a {@link PageKeyMap | `PageKeyMap`} object into an array of dehydrated page keys.
   *
   * @param pageKeyMap - PageKeyMap object to dehydrate.
   * @param entity - Entity token.
   *
   * @returns  Array of dehydrated page keys.
   *
   * @throws `Error` if `entity` is invalid.
   * @throws `Error` if any `pageKeyMap` index is invalid.
   *
   * @remarks
   * In the returned array, an empty string member indicates the corresponding
   * page key is `undefined`.
   *
   * An empty returned array indicates all page keys are `undefined`.
   */
  dehydratePageKeyMap<
    Item extends EntityItem<Entity, EntityMap, HashKey, RangeKey>,
    Entity extends keyof EntityMap,
  >(
    pageKeyMap: PageKeyMap<Item, Entity, EntityMap, HashKey, RangeKey>,
    entity: Entity,
  ): string[] {
    try {
      // Validate params.
      this.validateEntity(entity);

      // Shortcut empty pageKeyMap.
      if (!Object.keys(pageKeyMap).length) {
        const dehydrated: string[] = [];

        this.#logger.debug('dehydrated empty page key map', {
          pageKeyMap,
          entity,
          dehydrated,
        });

        return dehydrated;
      }

      // Extract, sort & validate indexs.
      const indexes = Object.keys(pageKeyMap).sort();
      indexes.map((index) => this.validateEntityIndex(entity, index));

      // Extract & sort hash keys.
      const hashKeys = Object.keys(pageKeyMap[indexes[0]]);

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
            if (
              property in this.config.entities[entity].generated ||
              property === this.config.rangeKey
            )
              Object.assign(
                item,
                this.decodeGeneratedProperty(value as string, entity),
              );
            else Object.assign(item, { [property]: value });

            return item;
          }, {});

          // Dehydrate index from item.
          dehydrated.push(
            this.dehydrateIndexItem(item, entity, index, [this.config.hashKey]),
          );
        }
      }

      // Replace with empty array if all pageKeys are empty strings.
      if (dehydrated.every((pageKey) => pageKey === '')) dehydrated = [];

      this.#logger.debug('dehydrated page key map', {
        pageKeyMap,
        entity,
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

  /**
   * Return an array of hashKey values covering the shard space bounded by
   * `timestampFrom` & `timestampTo`.
   *
   * @param entity - Entity token.
   * @param timestampFrom - Lower timestanp limit. Defaults to `0`.
   * @param timestampTo - Upper timestamp limit. Defaults to `Date.now()`.
   *
   * @returns Array of hashKey values.
   *
   * @throws `Error` if `entity` is invalid.
   */
  getHashKeySpace<Entity extends keyof EntityMap>(
    entity: Entity,
    timestampFrom = 0,
    timestampTo = Date.now(),
  ): string[] {
    try {
      // Validate params.
      this.validateEntity(entity);

      const { shardBumps } = this.config.entities[entity];

      const hashKeySpace = shardBumps
        .filter(
          (bump, i) =>
            (i === shardBumps.length - 1 ||
              shardBumps[i + 1].timestamp > timestampFrom) &&
            bump.timestamp <= timestampTo,
        )
        .flatMap(({ nibbleBits, nibbles }) => {
          const radix = 2 ** nibbleBits;

          return nibbles
            ? [...range(0, radix ** nibbles - 1)].map((nibble) =>
                nibble.toString(radix).padStart(nibbles, '0'),
              )
            : '';
        })
        .map(
          (shardKey) => `${entity}${this.config.shardKeyDelimiter}${shardKey}`,
        );

      this.#logger.debug('generated hash key space', {
        entity,
        timestampFrom,
        timestampTo,
        hashKeySpace,
      });

      return hashKeySpace;
    } catch (error) {
      if (error instanceof Error)
        this.#logger.debug(error.message, {
          entity,
          timestampFrom,
          timestampTo,
        });

      throw error;
    }
  }

  /**
   * Rehydrate an array of dehydrated page keys into a {@link PageKeyMap | `PageKeyMap`} object.
   *
   * @param dehydrated - Array of dehydrated page keys.
   * @param entity - Entity token.
   * @param indexes - Array of `entity` index tokens.
   * @param timestampFrom - Lower timestanp limit. Defaults to `0`.
   * @param timestampTo - Upper timestamp limit. Defaults to `Date.now()`.
   *
   * @returns Rehydrated {@link PageKeyMap | `PageKeyMap`} object.
   *
   * @throws `Error` if `entity` is invalid.
   * @throws `Error` if `indexes` is empty.
   * @throws `Error` if any `indexes` are invalid.
   * @throws `Error` if `dehydrated` has invalid length.
   */
  rehydratePageKeyMap<
    P extends PageKeyMap<Item, Entity, EntityMap, HashKey, RangeKey>,
    Item extends EntityItem<Entity, EntityMap, HashKey, RangeKey>,
    Entity extends keyof EntityMap,
  >(
    dehydrated: string[],
    entity: Entity,
    indexes: string[],
    timestampFrom = 0,
    timestampTo = Date.now(),
  ): P {
    try {
      // Validate params.
      if (!indexes.length) throw new Error('indexes empty');
      indexes.map((index) => this.validateEntityIndex(entity, index));

      // Shortcut empty dehydrated.
      if (!dehydrated.length) return {} as P;

      // Get hash key space & validate dehydrated length.
      const hashKeySpace = this.getHashKeySpace(
        entity,
        timestampFrom,
        timestampTo,
      );

      if (dehydrated.length !== hashKeySpace.length * indexes.length)
        throw new Error('dehydrated length mismatch');

      const rehydrated = mapValues(
        zipToObject(indexes, cluster(dehydrated, hashKeySpace.length)),
        (dehydratedIndexPageKeyMaps, index) =>
          zipToObject(hashKeySpace, (hashKey, i) => {
            if (!dehydratedIndexPageKeyMaps[i]) return;

            const item = {
              [this.config.hashKey]: hashKey,
              ...this.rehydrateIndexItem(
                dehydratedIndexPageKeyMaps[i],
                entity,
                index,
                [this.config.hashKey],
              ),
            };

            this.updateItemRangeKey(item, entity);

            return zipToObject(
              this.config.entities[entity].indexes[index],
              (component) =>
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                this.config.entities[entity].generated[component]
                  ? this.encodeGeneratedProperty(item, entity, component)!
                  : item[component],
            );
          }),
      ) as P;

      this.#logger.debug('rehydrated page key map', {
        dehydrated,
        entity,
        indexes,
        rehydrated,
      });

      return rehydrated;
    } catch (error) {
      if (error instanceof Error)
        this.#logger.debug(error.message, {
          dehydrated,
          entity,
          indexes,
        });

      throw error;
    }
  }
}
