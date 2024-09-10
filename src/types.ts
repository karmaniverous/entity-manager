/**
 * Generates a union of the keys of an entity type whose values are of a certain type.
 *
 * @typeParam Entity - The entity type.
 * @typeParam Type - The type to filter by.
 *
 * @returns A union of the keys of `Entity` whose values are of type `Type`.
 */
export type PropertiesOfType<Entity, Type> = keyof {
  [Property in keyof Entity as Entity[Property] extends Type
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
export type PropertiesNotOfType<Entity, Type> = keyof {
  [Property in keyof Entity as Entity[Property] extends Type
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
  EntityMap,
  Reserved extends string = never,
> = keyof {
  [E in keyof EntityMap as Key extends keyof EntityMap[E] | Reserved
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
export type ConfigEntityGenerated<Entity> =
  | (PropertiesOfType<Entity, never> extends never
      ? never
      : Record<
          PropertiesOfType<Entity, never>,
          {
            elements: PropertiesNotOfType<Entity, never>[];
            sharded?: boolean;
          }
        >)
  | Record<number | string | symbol, never>;

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
type ConfigEntity<Entity, HashKey extends string, UniqueKey extends string> = {
  defaultLimit?: number;
  defaultPageSize?: number;
  indexes?: Record<
    string,
    (PropertiesOfType<Entity, string | number> | HashKey | UniqueKey)[]
  >;
  shardBumps?: ShardBump[];
  timestampProperty: PropertiesOfType<Entity, number>;
  uniqueProperty: PropertiesOfType<Entity, number | string>;
} & (PropertiesOfType<Entity, never> extends never
  ? { generated?: ConfigEntityGenerated<Entity> }
  : { generated: ConfigEntityGenerated<Entity> });

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
  EntityMap,
  HashKey extends string,
  UniqueKey extends string,
> =
  | (keyof EntityMap extends never
      ? never
      : {
          [Entity in keyof EntityMap]: ConfigEntity<
            EntityMap[Entity],
            HashKey,
            UniqueKey
          >;
        })
  | Record<number | string | symbol, never>;

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
  EntityMap = object,
  HashKey extends string = 'hashKey',
  UniqueKey extends string = 'uniqueKey',
> = {
  hashKey: ExclusiveKey<HashKey, EntityMap, UniqueKey>;
  uniqueKey: ExclusiveKey<UniqueKey, EntityMap, HashKey>;
} & (keyof EntityMap extends never
  ? { entities?: ConfigEntities<EntityMap, HashKey, UniqueKey> }
  : { entities: ConfigEntities<EntityMap, HashKey, UniqueKey> });
