/**
 * Default {@link Entity | `Entity`} property types.
 */
export type DefaultPropertyTypes =
  | string
  | number
  | boolean
  | null
  | undefined
  | { [key: string]: DefaultPropertyTypes } // JSON objects
  | DefaultPropertyTypes[]; // JSON arrays

/**
 * Default indexable {@link Entity | `Entity`} property types. Types that do not intersect with valid property types will be ignored.
 */
export type DefaultIndexablePropertyTypes = number | string | null | undefined;

/**
 * Generate an Entity type.
 *
 * Extending from this type prevents use of invalid property types.
 *
 * @typeParam P - Entity property type. Defaults to {@link DefaultValidPropertyTypes | `DefaultValidPropertyTypes`}.
 *
 * @example
 * ```ts
 * // Say the database doesn't support undefined values.
 * type Property = Exclude<DefaultValidPropertyTypes, undefined>;
 *
 * // Define User entity interface. Omit the type argument if using the DefaultValidPropertyTypes type.
 * interface User extends Entity<Property> {
 *   id: number;
 *   name: string;
 * }
 * ```
 *
 * This is a contrived example, as a more flexible solution would be to keep the undefined type and strip undefined properties before posting to the database.
 */
export type Entity = Record<string, DefaultPropertyTypes>;

export type EntityMap = Record<string, Entity>;

export type PropertiesOfType<Entity, Type> = keyof {
  [Property in keyof Entity as Entity[Property] extends Type
    ? Property
    : never]: never;
};

export type PropertiesNotOfType<Entity, Type> = keyof {
  [Property in keyof Entity as Entity[Property] extends Type
    ? never
    : Property]: never;
};

export type ExclusiveKey<
  Key extends string,
  EntityMap,
  Reserved = never,
> = keyof {
  [E in keyof EntityMap as Key extends keyof EntityMap[E] | Reserved
    ? Key
    : never]: never;
} extends never
  ? Key
  : never;

type EntityGenerated<Entity> =
  | (PropertiesOfType<Entity, never> extends never
      ? never
      : Record<
          PropertiesOfType<Entity, never>,
          {
            elements?: PropertiesNotOfType<Entity, never>[];
            sharded?: boolean;
          }
        >)
  | Record<string, never>;

type ConfigEntity<Entity, HashKey extends string, UniqueKey extends string> = {
  defaultLimit?: number;
  defaultPageSize?: number;
  indexes?: Record<
    string,
    (PropertiesOfType<Entity, string | number> | HashKey | UniqueKey)[]
  >;
  shardBumps?: {
    timestamp: number;
    nibbleBits: number;
    nibbles: number;
  }[];
  timestampProperty: PropertiesOfType<Entity, number>;
  uniqueProperty: PropertiesOfType<Entity, number | string>;
} & (PropertiesOfType<Entity, never> extends never
  ? { generated?: EntityGenerated<Entity> }
  : { generated: EntityGenerated<Entity> });

export interface Config<
  EntityMap,
  HashKey extends string,
  UniqueKey extends string,
> {
  entities: {
    [Entity in keyof EntityMap]: ConfigEntity<
      EntityMap[Entity],
      HashKey,
      UniqueKey
    >;
  };
  hashKey: ExclusiveKey<HashKey, EntityMap, UniqueKey>;
  uniqueKey: ExclusiveKey<UniqueKey, EntityMap, HashKey>;
}

type Test = Record<never, string> | Record<string, never>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const test: Test = { a: 'a', b: 'b', c: 'c' };
