/**
 * Indicates primitive types that have a `toString` method.
 */
export type Stringifiable = string | number | boolean | bigint;

/**
 * Stringifiable type names to support runtime generated property decoding.
 */
export type StringifiableTypes = 'string' | 'number' | 'boolean' | 'bigint';

/**
 * The base Entity type. All Entities should extend this type.
 */
export type Entity = Record<string, unknown>;

/**
 * The base EntityMap type. All EntityMaps should extend this type.
 */
export type EntityMap = Record<string, Entity>;

/**
 * Strips the generic `[x: string]: unknown` property from an Entity or EntityMap.
 *
 * @typeParam T - The Entity or EntityMap type.
 *
 * @returns The Entity or EntityMap type without the generic property.
 */
export type Exactify<T extends Record<string, unknown>> = {
  [P in keyof T as string extends P ? never : P]: T[P];
};

/**
 * Generates a union of the keys of an Entity type whose values are of a certain type.
 *
 * @typeParam E - The Entity type.
 * @typeParam T - The type to filter by.
 *
 * @returns A union of the keys of `E` whose values are of type `T`.
 */
export type PropertiesOfType<E extends Entity, T> = keyof {
  [Property in keyof Exactify<E> as [T] extends [never]
    ? [NonNullable<E[Property]>] extends [never]
      ? Property
      : never
    : [NonNullable<E[Property]>] extends [never]
      ? never
      : NonNullable<E[Property]> extends T
        ? Property
        : never]: never;
};

/**
 * Generates a union of the keys of an entity type whose values are not of a certain type.
 *
 * @typeParam E - The entity type.
 * @typeParam T - The type to filter by.
 *
 * @returns A union of the keys of `E` whose values are not of type `T`.
 */
export type PropertiesNotOfType<E extends Entity, T> = keyof {
  [Property in keyof Exactify<E> as [T] extends [never]
    ? [NonNullable<E[Property]>] extends [never]
      ? never
      : Property
    : [NonNullable<E[Property]>] extends [never]
      ? NonNullable<E[Property]> extends T
        ? Property
        : never
      : never]: never;
};

/**
 * Tests a string literal type to determine whether it is a key of any Entity in an EntityMap or is a member of a union of reserved keys.
 *
 * @typeParam K - The string literal type to test.
 * @typeParam M - The entity map type.
 * @typeParam R - The reserved set of string literal types.
 *
 * @returns `K` if `K` is exclusive or `never` otherwise.
 */
export type ExclusiveKey<
  K extends string,
  M extends EntityMap,
  R extends string = never,
> = keyof {
  [E in keyof Exactify<M> as K extends keyof Exactify<M[E]> | R
    ? K
    : never]: never;
} extends never
  ? K
  : never;

/**
 * Returns the `types` property of a Config entity.
 *
 * @typeParam E - The entity type.
 *
 * @remarks
 * This property supports typing of values decoded from generated properties.
 *
 * All Entity properties of types `string`, `number`, `boolean`, or `bigint` must be represented, and no extra properties are allowed.
 */
export type ConfigEntityTypes<E extends Entity> =
  | (PropertiesOfType<E, Stringifiable> extends never
      ? never
      : Record<PropertiesOfType<E, Stringifiable>, StringifiableTypes>)
  | (PropertiesOfType<E, Stringifiable> extends never
      ? Record<string, never>
      : never);

/**
 * Returns the `generated` property of a Config entity.
 *
 * @typeParam E - The entity type.
 *
 * @remarks
 * All Entity properties of type `never` must be represented, and no extra properties are allowed.
 */
export type ConfigEntityGenerated<E extends Entity> =
  | ([PropertiesOfType<E, never>] extends [never]
      ? never
      : Record<
          PropertiesOfType<E, never>,
          {
            atomic?: boolean;
            elements: PropertiesOfType<E, Stringifiable>[];
            sharded?: boolean;
          }
        >)
  | ([PropertiesOfType<E, never>] extends [never]
      ? Record<string, never>
      : never);

/**
 * ShardBump interface.
 */
export interface ShardBump {
  timestamp: number;
  nibbleBits: number;
  nibbles: number;
}

/**
 * Returns a Config entity type.
 *
 * @typeParam E - The Entity type.
 * @typeParam HashKey - The hash key string literal type.
 * @typeParam RangeKey - The unique key string literal type.
 *
 * @remarks
 * `generated` is optional if `E` has no properties of type `never`.
 */
type ConfigEntity<
  E extends Entity,
  HashKey extends string,
  RangeKey extends string,
> = {
  defaultLimit?: number;
  defaultPageSize?: number;
  indexes?: Record<
    string,
    (
      | PropertiesOfType<E, Stringifiable>
      | PropertiesOfType<E, never>
      | HashKey
      | RangeKey
    )[]
  >;
  shardBumps?: ShardBump[];
  timestampProperty: PropertiesOfType<E, number>;
  uniqueProperty: PropertiesOfType<E, number | string>;
} & ([PropertiesOfType<E, never>] extends [never]
  ? { generated?: ConfigEntityGenerated<E> }
  : { generated: ConfigEntityGenerated<E> }) &
  ([PropertiesOfType<E, Stringifiable>] extends [never]
    ? { types?: ConfigEntityTypes<E> }
    : { types: ConfigEntityTypes<E> });

/**
 * Returns the `entities` property of a Config tyoe.
 *
 * @typeParam M - The EntityMap type.
 * @typeParam HashKey - The hash key string literal type.
 * @typeParam RangeKey - The unique key string literal type.
 *
 * @remarks
 * All properties of `M` must be represented, and no extra properties are allowed.
 */
export type ConfigEntities<
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
> =
  | ([keyof Exactify<M>] extends [never]
      ? never
      : {
          [E in keyof Exactify<M>]: ConfigEntity<M[E], HashKey, RangeKey>;
        })
  | Record<string, never>;

/**
 * Returns all properties of the Config type as optional.
 */
interface ConfigKeys<
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
> {
  entities?: ConfigEntities<M, HashKey, RangeKey>;
  hashKey?: ExclusiveKey<HashKey, M, RangeKey>;
  rangeKey?: ExclusiveKey<RangeKey, M, HashKey>;
}

/**
 * EntityManager Config type.
 *
 * @typeParam M - The EntityMap type.
 * @typeParam HashKey - The hash key string literal type.
 * @typeParam RangeKey - The unique key string literal type.
 *
 * @remarks
 * `entities` is optional if `M` is empty.
 */
export type Config<
  M extends EntityMap = Record<string, never>,
  HashKey extends string = 'hashKey',
  RangeKey extends string = 'rangeKey',
> = ([keyof Exactify<M>] extends [never]
  ? ConfigKeys<M, HashKey, RangeKey>
  : Required<ConfigKeys<M, HashKey, RangeKey>>) & {
  generatedKeyDelimiter?: string;
  generatedValueDelimiter?: string;
  shardKeyDelimiter?: string;
};

/**
 * Flattens the top layer of logic in a type.
 */
export type Unwrap<T> = { [P in keyof T]: T[P] };

/**
 * Extracts an Entity item type decorated with generated properties.
 */
export type EntityItem<
  E extends keyof M,
  M extends EntityMap,
  HashKey extends string = 'hashKey',
  RangeKey extends string = 'rangeKey',
> = Unwrap<
  {
    [P in keyof Exactify<M[E]>]: [NonNullable<M[E][P]>] extends [never]
      ? string
      : M[E][P];
  } & {
    [P in HashKey | RangeKey]?: string;
  }
>;
