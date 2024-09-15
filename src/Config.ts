import type {
  Entity,
  Exactify,
  PropertiesOfType,
  StringifiableTypes,
  TypeMap,
} from '@karmaniverous/entity-tools';

/**
 * The base EntityMap type. All EntityMaps should extend this type.
 */
export type EntityMap = Record<string, Entity>;

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

export type IndexableProperties<
  E extends Entity,
  IndexableTypes extends TypeMap,
> = PropertiesOfType<E, IndexableTypes[keyof Exactify<IndexableTypes>]>;

/**
 * Returns the `generated` property of a Config entity.
 *
 * @typeParam E - The entity type.
 *
 * @remarks
 * All Entity properties of type `never` must be represented, and no extra properties are allowed.
 */
export type ConfigEntityGenerated<
  E extends Entity,
  IndexableTypes extends TypeMap,
> =
  | ([PropertiesOfType<E, never>] extends [never]
      ? never
      : Record<
          PropertiesOfType<E, never>,
          {
            atomic?: boolean;
            elements: IndexableProperties<E, IndexableTypes>[];
            sharded?: boolean;
          }
        >)
  | ([PropertiesOfType<E, never>] extends [never]
      ? Record<string, never>
      : never);

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
export type ConfigEntityTypes<
  E extends Entity,
  IndexableTypes extends TypeMap,
> =
  | ([IndexableProperties<E, IndexableTypes>] extends [never]
      ? never
      : Record<IndexableProperties<E, IndexableTypes>, keyof IndexableTypes>)
  | ([IndexableProperties<E, IndexableTypes>] extends [never]
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
  IndexableTypes extends TypeMap,
> = {
  defaultLimit?: number;
  defaultPageSize?: number;
  indexes?: Record<
    string,
    (
      | IndexableProperties<E, IndexableTypes>
      | PropertiesOfType<E, never>
      | HashKey
      | RangeKey
    )[]
  >;
  shardBumps?: ShardBump[];
  timestampProperty: PropertiesOfType<E, number>;
  uniqueProperty: PropertiesOfType<E, number | string>;
} & ([PropertiesOfType<E, never>] extends [never]
  ? { generated?: ConfigEntityGenerated<E, IndexableTypes> }
  : { generated: ConfigEntityGenerated<E, IndexableTypes> }) &
  ([IndexableProperties<E, IndexableTypes>] extends [never]
    ? { types?: ConfigEntityTypes<E, IndexableTypes> }
    : { types: ConfigEntityTypes<E, IndexableTypes> });

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
  IndexableTypes extends TypeMap,
> =
  | ([keyof Exactify<M>] extends [never]
      ? never
      : {
          [E in keyof Exactify<M>]: ConfigEntity<
            M[E],
            HashKey,
            RangeKey,
            IndexableTypes
          >;
        })
  | Record<string, never>;

/**
 * Returns all properties of the Config type as optional.
 */
interface ConfigKeys<
  M extends EntityMap,
  HashKey extends string,
  RangeKey extends string,
  IndexableTypes extends TypeMap,
> {
  entities?: ConfigEntities<M, HashKey, RangeKey, IndexableTypes>;
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
  IndexableTypes extends TypeMap = StringifiableTypes,
> = ([keyof Exactify<M>] extends [never]
  ? ConfigKeys<M, HashKey, RangeKey, IndexableTypes>
  : Required<ConfigKeys<M, HashKey, RangeKey, IndexableTypes>>) & {
  generatedKeyDelimiter?: string;
  generatedValueDelimiter?: string;
  shardKeyDelimiter?: string;
  throttle?: number;
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
