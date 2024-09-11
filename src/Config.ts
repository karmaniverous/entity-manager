export type Entity = Record<string, unknown>;

export type EntityMap = Record<string, Entity>;

type Exactify<T extends Record<string, unknown>> = {
  [P in keyof T as string extends P ? never : P]: T[P];
};

/**
 * Generates a union of the keys of an entity type whose values are of a certain type.
 *
 * @typeParam Entity - The entity type.
 * @typeParam Type - The type to filter by.
 *
 * @returns A union of the keys of `Entity` whose values are of type `Type`.
 */
export type PropertiesOfType<E extends Entity, Type> = keyof {
  [Property in keyof Exactify<E> as E[Property] extends Type
    ? Property
    : never]: never;
};

/**
 * Generates a union of the keys of an entity type whose values are not of a certain type.
 *
 * @typeParam Entity - The entity type.
 * @typeParam Type - The type to filter by.
 *
 * @returns A union of the keys of `Entity` whose values are not of type `Type`.
 */
export type PropertiesNotOfType<E extends Entity, Type> = keyof {
  [Property in keyof Exactify<E> as E[Property] extends Type
    ? never
    : Property]: never;
};

/**
 * Tests a string literal type to determine whether it belongs to any entity in an entity map or is a member of a union of reserved keys.
 *
 * @typeParam Key - The string literal type to test.
 * @typeParam EntityMap - The entity map type.
 * @typeParam Reserved - The reserved set of string literal types.
 *
 * @returns `Key` if `Key` is exclusive or `never` otherwise.
 */
export type ExclusiveKey<
  Key extends string,
  M extends EntityMap,
  Reserved extends string = never,
> = keyof {
  [E in keyof Exactify<M> as Key extends keyof Exactify<M[E]> | Reserved
    ? Key
    : never]: never;
} extends never
  ? Key
  : never;

/**
 * Returns the `generated` property type of a Config Entity.
 *
 * @typeParam Entity - The entity type.
 *
 * @remarks
 * All `Entity` properties of type `never` must be represented, and no extra properties are allowed.
 */
export type ConfigEntityGenerated<E extends Entity> =
  | (PropertiesOfType<E, never> extends never
      ? never
      : Record<
          PropertiesOfType<E, never>,
          {
            elements: PropertiesNotOfType<E, never>[];
            sharded?: boolean;
          }
        >)
  | (PropertiesOfType<E, never> extends never ? Record<string, never> : never);

/**
 * ShardBump interface.
 */
export interface ShardBump {
  timestamp: number;
  nibbleBits: number;
  nibbles: number;
}

/**
 * Returns a Config Entity type.
 *
 * @typeParam Entity - The Entity type.
 * @typeParam HashKey - The hash key string literal type.
 * @typeParam UniqueKey - The unique key string literal type.
 *
 * @remarks
 * `generated` is optional if `Entity` has no properties of type `never`.
 */
type ConfigEntity<
  E extends Entity,
  HashKey extends string,
  UniqueKey extends string,
> = {
  defaultLimit?: number;
  defaultPageSize?: number;
  indexes?: Record<
    string,
    (PropertiesOfType<E, string | number> | HashKey | UniqueKey)[]
  >;
  shardBumps?: ShardBump[];
  timestampProperty: PropertiesOfType<E, number>;
  uniqueProperty: PropertiesOfType<E, number | string>;
} & (PropertiesOfType<E, never> extends never
  ? { generated?: ConfigEntityGenerated<E> }
  : { generated: ConfigEntityGenerated<E> });

/**
 * Returns the `entities` property type of a Config tyoe.
 *
 * @typeParam EntityMap - The entity map type.
 * @typeParam HashKey - The hash key string literal type.
 * @typeParam UniqueKey - The unique key string literal type.
 *
 * @remarks
 * All `EntityMap` properties must be represented, and no extra properties are allowed.
 */
export type ConfigEntities<
  M extends EntityMap,
  HashKey extends string,
  UniqueKey extends string,
> =
  | (keyof Exactify<M> extends never
      ? never
      : {
          [E in keyof Exactify<M>]: ConfigEntity<M[E], HashKey, UniqueKey>;
        })
  | Record<string, never>;

interface ConfigKeys<
  M extends EntityMap,
  HashKey extends string,
  UniqueKey extends string,
> {
  entities?: ConfigEntities<M, HashKey, UniqueKey>;
  hashKey?: ExclusiveKey<HashKey, M, UniqueKey>;
  uniqueKey?: ExclusiveKey<UniqueKey, M, HashKey>;
}

/**
 * EntityManager Config type.
 *
 * @typeParam EntityMap - The entity map type.
 * @typeParam HashKey - The hash key string literal type.
 * @typeParam UniqueKey - The unique key string literal type.
 *
 * @remarks
 * `entities` is optional if `EntityMap` is empty.
 */
export type Config<
  M extends EntityMap = Record<string, never>,
  HashKey extends string = 'hashKey',
  UniqueKey extends string = 'uniqueKey',
> = keyof Exactify<M> extends never
  ? ConfigKeys<M, HashKey, UniqueKey>
  : Required<ConfigKeys<M, HashKey, UniqueKey>>;
