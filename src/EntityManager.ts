import {
  Exactify,
  isNil,
  sort,
  type TypeMap,
} from '@karmaniverous/entity-tools';
import lzString from 'lz-string';
import {
  cluster,
  isInt,
  mapValues,
  parallel,
  range,
  shake,
  unique,
  zipToObject,
} from 'radash';
import stringHash from 'string-hash';

import type { Config, EntityItem, EntityMap, ShardBump } from './Config';
import { decodeGeneratedProperty } from './decodeGeneratedProperty';
import { encodeGeneratedProperty } from './encodeGeneratedProperty';
import type { PageKeyMap } from './PageKeyMap';
import { configSchema, type ParsedConfig } from './ParsedConfig';
import type { QueryOptions } from './QueryOptions';
import type { QueryResult } from './QueryResult';
import { string2Stringifiable } from './string2Stringifiable';
import { validateEntityToken } from './validateEntityToken';
import type { WorkingQueryResult } from './WorkingQueryResult';

const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } =
  lzString;

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
  IndexableTypes extends TypeMap,
> {
  #config: ParsedConfig;

  /**
   * Create an EntityManager instance.
   *
   * @param config - EntityManager {@link Config | `Config`} object.
   */
  constructor(config: Config<M, HashKey, RangeKey, IndexableTypes>) {
    this.#config = configSchema.parse(config);
  }

  /**
   * Validate that an entity index is defined in EntityManager config.
   *
   * @param entityToken - {@link ConfigKeys.entities | `this.config.entities`} key.
   * @param indexToken - {@link ConfigEntity.indexes | `this.config.entities.<entityToken>.indexes`} key.
   *
   * @throws `Error` if `entityToken` is invalid.
   * @throws `Error` if `indexToken` is invalid.
   */
  validateEntityIndexToken(entityToken: string, indexToken: string): void {
    validateEntityToken(this, entityToken);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!this.config.entities[entityToken].indexes[indexToken])
      throw new Error('invalid entity index token');
  }

  /**
   * Validate that an entity generated property is defined in EntityManager
   * config.
   *
   * @param entityToken - {@link ConfigKeys.entities | `this.config.entities`} key.
   * @param property - {@link ConfigEntityGenerated | `this.config.entities.<entityToken>.generated`} key.
   * @param sharded - Whether the generated property is sharded. `undefined` indicates no constraint.
   *
   * @throws `Error` if `entityToken` is invalid.
   * @throws `Error` if `property` is invalid.
   * @throws `Error` if `sharded` is specified & does not match `this.config.entities.<entityToken>.generated.<property>.sharded`.
   */
  validateEntityGeneratedProperty(
    entityToken: string,
    property: string,
    sharded?: boolean,
  ): void {
    validateEntityToken(this, entityToken);

    const generated = this.config.entities[entityToken].generated[property];

    if (!generated && property !== this.config.hashKey)
      throw new Error('invalid entity generated property');

    if (
      sharded !== undefined &&
      ((generated && sharded !== generated.sharded) ||
        (!sharded && property === this.config.hashKey))
    )
      throw new Error(
        `entity generated property ${sharded ? 'not ' : ''}sharded`,
      );
  }

  /**
   * Get the current EntityManager {@link Config | `Config`} object.
   *
   * @returns Current {@link Config | `Config`} object.
   */
  get config(): ParsedConfig {
    return this.#config;
  }

  /**
   * Set the current EntityManager {@link Config | `Config`} object.
   *
   * @param value - {@link Config | `Config`} object.
   */
  set config(value) {
    this.#config = configSchema.parse(value);
  }

  /**
   * Get first entity shard bump before timestamp.
   *
   * @param entityToken - {@link ConfigKeys.entities | `this.config.entities`} key.
   * @param timestamp - Timestamp in milliseconds.
   *
   * @returns {@link ShardBump | `ShardBump`} object.
   *
   * @throws `Error` if `entityToken` is invalid.
   */
  private getShardBump(
    entityToken: keyof Exactify<M> & string,
    timestamp: number,
  ): ShardBump {
    // Validate params.
    validateEntityToken(this, entityToken);

    return [...this.config.entities[entityToken].shardBumps]
      .reverse()
      .find((bump) => bump.timestamp <= timestamp)!;
  }

  /**
   * Update the hash key on a partial {@link EntityItem | `EntityItem`} object. Mutates `item`.
   *
   * @param item - Partial {@link EntityItem | `EntityItem`} object.
   * @param entityToken - {@link ConfigKeys.entities | `this.config.entities`} key.
   * @param overwrite - Overwrite existing {@link ConfigKeys.hashKey | `this.config.hashKey`} property value (default `false`).
   *
   * @returns Mutated `item` with updated hash key.
   *
   * @throws `Error` if `entityToken` is invalid.
   */
  updateItemHashKey<
    Item extends EntityItem<EntityToken, M, HashKey, RangeKey>,
    EntityToken extends keyof Exactify<M> & string,
  >(item: Item, entityToken: EntityToken, overwrite = false): Item {
    try {
      // Validate params.
      validateEntityToken(this, entityToken);

      // Return current item if hashKey exists and overwrite is false.
      if (item[this.config.hashKey as keyof Item] && !overwrite) {
        console.debug('did not overwrite existing entity item hash key', {
          item,
          entityToken,
          overwrite,
        });

        return item;
      }

      // Get item timestamp property & validate.
      const timestamp: number = item[
        this.config.entities[entityToken].timestampProperty as keyof Item
      ] as unknown as number;

      if (isNil(timestamp)) throw new Error(`missing item timestamp property`);

      // Find first entity sharding bump before timestamp.
      const { charBits, chars } = this.getShardBump(entityToken, timestamp);

      let hashKey = `${entityToken}${this.config.shardKeyDelimiter}`;

      if (chars) {
        // Radix is the numerical base of the shardKey.
        const radix = 2 ** charBits;

        // Get item unique property & validate.
        const uniqueId =
          item[this.config.entities[entityToken].uniqueProperty as keyof Item];

        if (isNil(uniqueId)) throw new Error(`missing item unique property`);

        hashKey += (stringHash(uniqueId.toString()) % (chars * radix))
          .toString(radix)
          .padStart(chars, '0');
      }

      Object.assign(item, { [this.config.hashKey]: hashKey });

      console.debug('updated entity item hash key', {
        entityToken,
        overwrite,
        item,
      });

      return item;
    } catch (error) {
      if (error instanceof Error)
        console.error(error.message, { item, entityToken, overwrite });

      throw error;
    }
  }

  /**
   * Update the range key on a partial {@link EntityItem | `EntityItem`} object. Mutates `item`.
   *
   * @param item - Partial {@link EntityItem | `EntityItem`} object.
   * @param entityToken - {@link ConfigKeys.entities | `this.config.entities`} key.
   * @param overwrite - Overwrite existing {@link ConfigKeys.rangeKey | `this.config.rangeKey`} property value (default `false`).
   *
   * @returns Mutated `item` with updated range key.
   *
   * @throws `Error` if `entityToken` is invalid.
   * @throws `Error` if `item` {@link ConfigEntity.uniqueProperty | `this.config.entities<entityToken>.uniqueProperty`} property value is missing.
   */
  updateItemRangeKey<
    Item extends EntityItem<EntityToken, M, HashKey, RangeKey>,
    EntityToken extends keyof Exactify<M> & string,
  >(
    item: Partial<Item>,
    entityToken: EntityToken,
    overwrite = false,
  ): Partial<Item> {
    try {
      // Validate params.
      validateEntityToken(this, entityToken);

      // Return current item if rangeKey exists and overwrite is false.
      if (item[this.config.rangeKey as keyof Item] && !overwrite) {
        console.debug('did not overwrite existing entity item range key', {
          item,
          entityToken,
          overwrite,
        });

        return item;
      }

      // Get item unique property & validate.
      const uniqueProperty =
        item[this.config.entities[entityToken].uniqueProperty as keyof Item];

      if (isNil(uniqueProperty))
        throw new Error(`missing item unique property`);

      // Update range key.
      Object.assign(item, {
        [this.config.rangeKey]: [
          this.config.entities[entityToken].uniqueProperty,
          uniqueProperty,
        ].join(this.config.generatedValueDelimiter),
      });

      console.debug('updated entity item range key', {
        entityToken,
        overwrite,
        item,
      });

      return item;
    } catch (error) {
      if (error instanceof Error)
        console.error(error.message, { item, entityToken, overwrite });

      throw error;
    }
  }

  /**
   * Update generated properties, hash key, and range key on an {@link EntityItem | `EntityItem`} object. Mutates `item`.
   *
   * @param item - {@link EntityItem | `EntityItem`} object.
   * @param entityToken - {@link ConfigKeys.entities | `this.config.entities`} key.
   * @param overwrite - Overwrite existing properties (default `false`).
   *
   * @returns Mutated `item` with updated properties.
   *
   * @throws `Error` if `entityToken` is invalid.
   */
  updateItemGeneratedProperties<
    Item extends EntityItem<EntityToken, M, HashKey, RangeKey>,
    EntityToken extends keyof Exactify<M> & string,
  >(item: Item, entityToken: EntityToken, overwrite = false): Item {
    try {
      // Validate params.
      validateEntityToken(this, entityToken);

      // Update hash key.
      this.updateItemHashKey(item, entityToken, overwrite);

      // Update range key.
      this.updateItemRangeKey(item, entityToken, overwrite);

      // Update generated properties.
      for (const property in this.config.entities[entityToken].generated) {
        if (overwrite || isNil(item[property as keyof Item])) {
          const encoded = encodeGeneratedProperty(
            this,
            item,
            entityToken,
            property,
          );

          if (encoded) Object.assign(item, { [property]: encoded });
          else delete item[property as keyof Item];
        }
      }

      console.debug('updated entity item generated properties', {
        entityToken,
        overwrite,
        item,
      });

      return item;
    } catch (error) {
      if (error instanceof Error)
        console.error(error.message, { entityToken, overwrite, item });

      throw error;
    }
  }

  /**
   * Strips generated properties, hash key, and range key from an {@link EntityItem | `EntityItem`} object. Mutates `item`.
   *
   * @param item - {@link EntityItem | `EntityItem`} object.
   * @param entityToken - {@link ConfigKeys.entities | `this.config.entities`} key.
   *
   * @returns Mutated `item` without generated properties, hash key or range key.
   *
   * @throws `Error` if `entityToken` is invalid.
   */
  stripItemGeneratedProperties<
    Item extends EntityItem<EntityToken, M, HashKey, RangeKey>,
    EntityToken extends keyof Exactify<M> & string,
  >(item: Item, entityToken: EntityToken): Item {
    try {
      // Validate params.
      validateEntityToken(this, entityToken);

      // Delete hash & range keys.
      delete item[this.config.hashKey as keyof Item];
      delete item[this.config.rangeKey as keyof Item];

      // Delete generated properties.
      for (const property in this.config.entities[entityToken].generated)
        delete item[property as keyof Item];

      console.debug('stripped entity item generated properties', {
        entityToken,
        item,
      });

      return item;
    } catch (error) {
      if (error instanceof Error)
        console.error(error.message, { item, entityToken });

      throw error;
    }
  }

  /**
   * Unwraps an {@link ConfigEntity.indexes | Entity index} into deduped, sorted, ungenerated index component elements.
   *
   * @param entityToken - {@link ConfigKeys.entities | `this.config.entities`} key.
   * @param indexToken - {@link ConfigEntity.indexes | `this.config.entities.<entityToken>.indexes`} key.
   *
   * @returns Deduped, sorted array of ungenerated index component elements.
   *
   * @throws `Error` if `entityToken` is invalid.
   * @throws `Error` if `indexToken` is invalid.
   */
  unwrapIndex(entityToken: keyof Exactify<M> & string, indexToken: string) {
    try {
      // Validate params.
      this.validateEntityIndexToken(entityToken, indexToken);

      const generated = this.config.entities[entityToken].generated;
      const generatedKeys = Object.keys(shake(generated));

      return this.config.entities[entityToken].indexes[indexToken]
        .map((component) =>
          component === this.config.hashKey
            ? this.config.hashKey
            : component === this.config.rangeKey
              ? this.config.entities[entityToken].uniqueProperty
              : generatedKeys.includes(component)
                ? generated[component]!.elements
                : component,
        )
        .flat()
        .sort();
    } catch (error) {
      if (error instanceof Error)
        console.error(error.message, { indexToken, entityToken });

      throw error;
    }
  }

  /**
   * Condense a partial {@link EntityItem | `EntityItem`} object into a delimited string representing the deduped, sorted, ungenerated component elements of an {@link ConfigEntity.indexes | Entity index}.
   *
   * @remarks
   * Reverses {@link EntityManager.rehydrateIndexItem | `rehydrateIndexItem`}.
   *
   * To create the output value, this method:
   *
   * * Unwraps `index` components into deduped, sorted, ungenerated elements.
   * * Joins `item` element values with {@link Config.generatedKeyDelimiter | `this.config.generatedKeyDelimiter`}.
   *
   * `item` must be populated with all required index component elements!
   *
   * @param item - Partial {@link EntityItem | `EntityItem`} object.
   * @param entityToken - {@link ConfigKeys.entities | `this.config.entities`} key.
   * @param indexToken - {@link ConfigEntity.indexes | `this.config.entities.<entityToken>.indexes`} key.
   * @param omit - Array of index components to omit from the output value.
   *
   * @returns Dehydrated index value.
   *
   * @throws `Error` if `entityToken` is invalid.
   * @throws `Error` if `indexToken` is invalid.
   */
  dehydrateIndexItem<
    Item extends EntityItem<EntityToken, M, HashKey, RangeKey>,
    EntityToken extends keyof Exactify<M> & string,
  >(
    item: Partial<Item> | undefined,
    entityToken: EntityToken,
    indexToken: string,
    omit: string[] = [],
  ): string {
    try {
      // Validate params.
      this.validateEntityIndexToken(entityToken, indexToken);

      // Handle degenerate case.
      if (!item) return '';

      // Unwrap index elements.
      const elements = this.unwrapIndex(entityToken, indexToken).filter(
        (element) => !omit.includes(element),
      );

      // Join index element values.
      const dehydrated = elements
        .map((element) => item[element as keyof Item]?.toString() ?? '')
        .join(this.config.generatedKeyDelimiter);

      console.debug('dehydrated index', {
        item,
        entityToken,
        indexToken,
        elements,
        dehydrated,
      });

      return dehydrated;
    } catch (error) {
      if (error instanceof Error)
        console.error(error.message, { item, entityToken, indexToken });

      throw error;
    }
  }

  /**
   * Convert a delimited string into a partial {@link EntityItem | `EntityItem`} object representing the ungenerated component elements of a Config entity index.
   *
   * @remarks
   * Reverses {@link EntityManager.dehydrateIndexItem | `dehydrateIndexItem`}.
   *
   * {@link EntityManager.dehydrateIndexItem | `dehydrateIndexItem`} alphebetically sorts unwrapped index elements during the dehydration process. This method assumes delimited element values are presented in the same order.
   *
   * @param dehydrated - Dehydrated index value.
   * @param entityToken - {@link ConfigKeys.entities | `this.config.entities`} key.
   * @param indexToken - {@link ConfigEntity.indexes | `this.config.entities.<entityToken>.indexes`} key.
   * @param omit - Array of index components omitted from `dehydrated`.
   *
   * @returns Partial {@link EntityItem | `EntityItem`} object containing rehydrated index component elements.
   *
   * @throws `Error` if `entityToken` is invalid.
   * @throws `Error` if `indexToken` is invalid.
   */
  rehydrateIndexItem<
    Item extends EntityItem<EntityToken, M, HashKey, RangeKey>,
    EntityToken extends keyof Exactify<M> & string,
  >(
    dehydrated: string,
    entityToken: EntityToken,
    indexToken: string,
    omit: string[] = [],
  ): Partial<Item> {
    try {
      // Validate params.
      this.validateEntityIndexToken(entityToken, indexToken);

      // Unwrap index elements.
      const elements = this.unwrapIndex(entityToken, indexToken).filter(
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
            string2Stringifiable<IndexableTypes>(
              this.config.entities[entityToken].types[elements[i]],
              value,
            ),
          ),
        ),
      ) as Partial<Item>;

      console.debug('rehydrated index', {
        dehydrated,
        entityToken,
        indexToken,
        elements,
        values,
        rehydrated,
      });

      return rehydrated;
    } catch (error) {
      if (error instanceof Error)
        console.error(error.message, { dehydrated, entityToken, indexToken });

      throw error;
    }
  }

  /**
   * Dehydrate a {@link PageKeyMap | `PageKeyMap`} object into an array of dehydrated page keys.
   *
   * Reverses {@link EntityManager.rehydratePageKeyMap | `rehydratePageKeyMap`}.
   *
   * @param pageKeyMap - {@link PageKeyMap | `PageKeyMap`} object to dehydrate.
   * @param entityToken - {@link ConfigKeys.entities | `this.config.entities`} key.
   *
   * @returns  Array of dehydrated page keys.
   *
   * @throws `Error` if `entityToken` is invalid.
   * @throws `Error` if any `pageKeyMap` key is an invalid indexToken is invalid {@link ConfigEntity.indexes | `this.config.entities.<entityToken>.indexes`} key.
   *
   * @remarks
   * In the returned array, an empty string member indicates the corresponding page key is `undefined`.
   *
   * An empty returned array indicates all page keys are `undefined`.
   */
  dehydratePageKeyMap<
    Item extends EntityItem<EntityToken, M, HashKey, RangeKey>,
    EntityToken extends keyof Exactify<M> & string,
  >(
    pageKeyMap: PageKeyMap<Item, IndexableTypes>,
    entityToken: EntityToken,
  ): string[] {
    try {
      // Validate params.
      validateEntityToken(this, entityToken);

      // Shortcut empty pageKeyMap.
      if (!Object.keys(pageKeyMap).length) {
        const dehydrated: string[] = [];

        console.debug('dehydrated empty page key map', {
          pageKeyMap,
          entityToken,
          dehydrated,
        });

        return dehydrated;
      }

      // Extract, sort & validate indexs.
      const indexes = Object.keys(pageKeyMap).sort();
      indexes.map((index) => this.validateEntityIndexToken(entityToken, index));

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
            Partial<EntityItem<EntityToken, M, HashKey, RangeKey>>
          >((item, [property, value]) => {
            if (
              property in this.config.entities[entityToken].generated ||
              property === this.config.rangeKey
            )
              Object.assign(
                item,
                decodeGeneratedProperty(this, value as string, entityToken),
              );
            else Object.assign(item, { [property]: value });

            return item;
          }, {});

          // Dehydrate index from item.
          dehydrated.push(
            this.dehydrateIndexItem(item, entityToken, index, [
              this.config.hashKey,
            ]),
          );
        }
      }

      // Replace with empty array if all pageKeys are empty strings.
      if (dehydrated.every((pageKey) => pageKey === '')) dehydrated = [];

      console.debug('dehydrated page key map', {
        pageKeyMap,
        entityToken,
        indexes,
        hashKeys,
        dehydrated,
      });

      return dehydrated;
    } catch (error) {
      if (error instanceof Error)
        console.error(error.message, { entityToken, pageKeyMap });

      throw error;
    }
  }

  /**
   * Return an array of {@link ConfigKeys.hashKey | `this.config.hashKey`} property values covering the shard space bounded by `timestampFrom` & `timestampTo`.
   *
   * @param entityToken - {@link ConfigKeys.entities | `this.config.entities`} key.
   * @param timestampFrom - Lower timestanp limit. Defaults to `0`.
   * @param timestampTo - Upper timestamp limit. Defaults to `Date.now()`.
   *
   * @returns Array of {@link ConfigKeys.hashKey | `this.config.hashKey`} property values covering the indicated shard space.
   *
   * @throws `Error` if `entityToken` is invalid.
   */
  getHashKeySpace(
    entityToken: keyof M & string,
    timestampFrom = 0,
    timestampTo = Date.now(),
  ): string[] {
    try {
      // Validate params.
      validateEntityToken(this, entityToken);

      const { shardBumps } = this.config.entities[entityToken];

      const hashKeySpace = shardBumps
        .filter(
          (bump, i) =>
            (i === shardBumps.length - 1 ||
              shardBumps[i + 1].timestamp > timestampFrom) &&
            bump.timestamp <= timestampTo,
        )
        .flatMap(({ charBits, chars }) => {
          const radix = 2 ** charBits;

          return chars
            ? [...range(0, radix ** chars - 1)].map((char) =>
                char.toString(radix).padStart(chars, '0'),
              )
            : '';
        })
        .map(
          (shardKey) =>
            `${entityToken}${this.config.shardKeyDelimiter}${shardKey}`,
        );

      console.debug('generated hash key space', {
        entityToken,
        timestampFrom,
        timestampTo,
        hashKeySpace,
      });

      return hashKeySpace;
    } catch (error) {
      if (error instanceof Error)
        console.error(error.message, {
          entityToken,
          timestampFrom,
          timestampTo,
        });

      throw error;
    }
  }

  /**
   * Rehydrate an array of dehydrated page keys into a {@link PageKeyMap | `PageKeyMap`} object.
   *
   * Reverses the {@link EntityManager.dehydratePageKeyMap | `dehydratePageKeyMap`} method.
   *
   * @param dehydrated - Array of dehydrated page keys or undefined if new query.
   * @param entityToken - {@link ConfigKeys.entities | `this.config.entities`} key.
   * @param indexTokens - Array of {@link ConfigEntity.indexes | `this.config.entities.<entityToken>.indexes`} keys used as keys of the original {@link PageKeyMap | `PageKeyMap`}.
   * @param timestampFrom - Lower timestanp limit used to generate the original {@link PageKeyMap | `PageKeyMap`}. Defaults to `0`.
   * @param timestampTo - Upper timestamp limit used to generate the original {@link PageKeyMap | `PageKeyMap`}. Defaults to `Date.now()`.
   *
   * @returns Rehydrated {@link PageKeyMap | `PageKeyMap`} object.
   *
   * @throws `Error` if `entityToken` is invalid.
   * @throws `Error` if `indexTokens` is empty.
   * @throws `Error` if any `indexTokens` are invalid.
   * @throws `Error` if `dehydrated` has invalid length.
   */
  rehydratePageKeyMap<
    Item extends EntityItem<EntityToken, M, HashKey, RangeKey>,
    EntityToken extends keyof Exactify<M> & string,
  >(
    dehydrated: string[] | undefined,
    entityToken: EntityToken,
    indexTokens: string[],
    timestampFrom = 0,
    timestampTo = Date.now(),
  ): PageKeyMap<Item, IndexableTypes> {
    try {
      // Validate params.
      if (!indexTokens.length) throw new Error('indexTokens empty');
      indexTokens.map((index) =>
        this.validateEntityIndexToken(entityToken, index),
      );

      // Shortcut empty dehydrated.
      if (dehydrated && !dehydrated.length) return {};

      // Get hash key space.
      const hashKeySpace = this.getHashKeySpace(
        entityToken,
        timestampFrom,
        timestampTo,
      );

      // Default dehydrated.
      dehydrated ??= [
        ...range(1, hashKeySpace.length * indexTokens.length, ''),
      ];

      // Validate dehydrated length
      if (dehydrated.length !== hashKeySpace.length * indexTokens.length)
        throw new Error('dehydrated length mismatch');

      // Rehydrate pageKeys.
      const rehydrated = mapValues(
        zipToObject(indexTokens, cluster(dehydrated, hashKeySpace.length)),
        (dehydratedIndexPageKeyMaps, index) =>
          zipToObject(hashKeySpace, (hashKey, i) => {
            if (!dehydratedIndexPageKeyMaps[i]) return;

            const item = {
              [this.config.hashKey]: hashKey,
              ...this.rehydrateIndexItem(
                dehydratedIndexPageKeyMaps[i],
                entityToken,
                index,
                [this.config.hashKey],
              ),
            };

            this.updateItemRangeKey(item, entityToken);

            return zipToObject(
              this.config.entities[entityToken].indexes[index],
              (component) =>
                this.config.entities[entityToken].generated[component]
                  ? encodeGeneratedProperty(this, item, entityToken, component)!
                  : item[component],
            );
          }),
      );

      console.debug('rehydrated page key map', {
        dehydrated,
        entityToken,
        indexTokens,
        rehydrated,
      });

      return rehydrated as PageKeyMap<Item, IndexableTypes>;
    } catch (error) {
      if (error instanceof Error)
        console.error(error.message, {
          dehydrated,
          entityToken,
          indexTokens,
        });

      throw error;
    }
  }

  /**
   * Query a database entity across shards in a provider-generic fashion.
   *
   * @remarks
   * The provided {@link ShardQueryFunction | `ShardQueryFunction`} performs the actual query of individual data pages on individual shards. This function is presumed to express provider-specific query logic, including any necessary indexing or search constraints.
   *
   * Individual shard query results will be combined, deduped by {@link ConfigEntity.uniqueProperty} property value, and sorted by {@link QueryOptions.sortOrder | `sortOrder`}.
   *
   * In queries on sharded data, expect the leading and trailing edges of returned data pages to interleave somewhat with preceding & following pages.
   *
   * Unsharded query results should sort & page as expected.
   *
   * @param options - {@link QueryOptions | `QueryOptions`} object.
   *
   * @returns {@link QueryResult} object.
   *
   * @throws Error if {@link QueryOptions.pageKeyMap | `pageKeyMap`} keys do not match {@link QueryOptions.queryMap | `queryMap`} keys.
   */
  async query<
    Item extends EntityItem<EntityToken, M, HashKey, RangeKey>,
    EntityToken extends keyof Exactify<M> & string,
  >({
    entityToken,
    hashKey,
    item,
    limit,
    pageKeyMap,
    pageSize,
    queryMap,
    sortOrder = [],
    timestampFrom = 0,
    timestampTo = Date.now(),
    throttle = this.config.throttle,
  }: QueryOptions<
    Item,
    EntityToken,
    M,
    HashKey,
    RangeKey,
    IndexableTypes
  >): Promise<QueryResult<Item, EntityToken, M, HashKey, RangeKey>> {
    try {
      // Get defaults.
      const { defaultLimit, defaultPageSize } =
        this.config.entities[entityToken];
      limit ??= defaultLimit;
      pageSize ??= defaultPageSize;

      // Validate params.
      this.validateEntityGeneratedProperty(entityToken, hashKey, true);

      if (!(limit === Infinity || (isInt(limit) && limit >= 1)))
        throw new Error('limit must be a positive integer or Infinity.');

      if (!(isInt(pageSize) && pageSize >= 1))
        throw new Error('pageSize must be a positive integer');

      // Rehydrate pageKeyMap.
      const rehydratedPageKeyMap = this.rehydratePageKeyMap(
        pageKeyMap
          ? (JSON.parse(
              decompressFromEncodedURIComponent(pageKeyMap),
            ) as string[])
          : undefined,
        entityToken,
        Object.keys(queryMap),
        timestampFrom,
        timestampTo,
      );

      // Shortcut if pageKeyMap is empty.
      if (!Object.keys(rehydratedPageKeyMap).length)
        return {
          count: 0,
          items: [],
          pageKeyMap: compressToEncodedURIComponent(JSON.stringify([])),
        };

      // Iterate search over pages.
      let workingResult = {
        items: [],
        pageKeyMap: rehydratedPageKeyMap,
      } as WorkingQueryResult<Item, EntityToken, M, HashKey, RangeKey>;

      do {
        // TODO: This loop will blow up as shards scale, since at a minimum it will return shardCount * pageSize
        // items, which may be >> limit. Probably the way to fix this is to limit the number of shards queried per
        // iteration in order to keep shardsQueried * pageSize > (limit - items.length) but only just.

        // TODO: Test for invalid characters (path delimiters) in index keys & shard key values.

        // Query every shard on every index in pageKeyMap.
        const shardQueryResults = await parallel(
          throttle,
          Object.entries(rehydratedPageKeyMap).flatMap(
            ([index, indexPageKeys]) =>
              Object.entries(indexPageKeys).map(([hashKey, pageKey]) => [
                index,
                hashKey,
                pageKey,
              ]),
          ) as [string, string, Item | undefined][],
          async ([index, hashKey, pageKey]: [
            string,
            string,
            Item | undefined,
          ]) => ({
            index,
            queryResult: await queryMap[index](hashKey, pageKey, pageSize),
            hashKey,
          }),
        );

        // Reduce shardQueryResults & updateworkingRresult.
        workingResult = shardQueryResults.reduce<
          WorkingQueryResult<Item, EntityToken, M, HashKey, RangeKey>
        >(({ items, pageKeyMap }, { index, queryResult, hashKey }) => {
          Object.assign(rehydratedPageKeyMap[index], {
            [hashKey]: queryResult.pageKey,
          });

          return {
            items: [...items, ...queryResult.items],
            pageKeyMap,
          };
        }, workingResult);
      } while (
        // Repeat while pages remain & limit is not reached.
        Object.values(workingResult.pageKeyMap).some((indexPageKeys) =>
          Object.values(indexPageKeys).some((pageKey) => pageKey !== undefined),
        ) &&
        workingResult.items.length < limit
      );

      // Dedupe & sort working result.
      workingResult.items = sort(
        unique(workingResult.items, (item) =>
          (
            item[
              this.config.entities[entityToken].uniqueProperty as keyof Item
            ] as string | number
          ).toString(),
        ),
        sortOrder,
      );

      const result = {
        count: workingResult.items.length,
        items: workingResult.items,
        pageKeyMap: compressToEncodedURIComponent(
          JSON.stringify(
            this.dehydratePageKeyMap(workingResult.pageKeyMap, entityToken),
          ),
        ),
      } as QueryResult<Item, EntityToken, M, HashKey, RangeKey>;

      console.debug('queried entityToken across shards', {
        entityToken,
        hashKey,
        item,
        limit,
        pageKeyMap,
        pageSize,
        queryMap,
        timestampFrom,
        timestampTo,
        throttle,
        rehydratedPageKeyMap,
        workingResult,
        result,
      });

      return result;
    } catch (error) {
      if (error instanceof Error)
        console.error(error.message, {
          entityToken,
          hashKey,
          item,
          limit,
          pageKeyMap,
          pageSize,
          queryMap,
          timestampFrom,
          timestampTo,
          throttle,
        });

      throw error;
    }
  }
}
