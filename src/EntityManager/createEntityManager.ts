import type {
  DefaultTranscodeRegistry,
  EntityMap,
} from '@karmaniverous/entity-tools';
import type * as z from 'zod';
import type { ZodType } from 'zod';

import type { BaseConfigMap } from './BaseConfigMap';
import type { Config } from './Config';
import { EntityManager } from './EntityManager';

/**
 * Values-first config input used to capture literal tokens from the provided
 * configuration value. This does not enforce full Config shape at compile
 * time; runtime validation still occurs via Zod in the EntityManager.
 *
 * Keep this intentionally permissive to maximize inference from `as const`.
 */
export interface ConfigInput {
  /** Global hash key property name (e.g., `"pk"`). */
  hashKey: string;

  /** Global range key property name (e.g., `"sk"`). */
  rangeKey: string;

  /**
   * Optional generated property token maps.
   *
   * @remarks
   * - `sharded` keys are hash-side generated property tokens and are encoded atomically.
   * - `unsharded` keys are range-side generated property tokens.
   */
  generatedProperties?: {
    /** Sharded generated property tokens (hash-side). */
    sharded?: Record<string, readonly string[]>;

    /** Unsharded generated property tokens (range-side). */
    unsharded?: Record<string, readonly string[]>;
  };

  /**
   * Optional map of transcodable property token -\> transcode name.
   *
   * @remarks
   * Only properties present here are treated as “transcoded properties”.
   */
  propertyTranscodes?: Record<string, string>;

  /**
   * Optional index token map used for typing and paging-key narrowing.
   *
   * @remarks
   * This is provider-agnostic metadata (not a provider-specific index definition).
   */
  indexes?: Record<
    string,
    {
      /** Index hash key token (global hash key or sharded generated key). */
      hashKey: string;

      /** Index range key token (global range key, unsharded generated key, or transcoded scalar). */
      rangeKey: string;

      /** Optional list of projected attribute names (validated at runtime to exclude key tokens). */
      projections?: string[];
    }
  >;

  /**
   * Optional per-entity configuration (runtime semantics).
   *
   * @remarks
   * This is intentionally permissive in `ConfigInput`; runtime validation occurs
   * in the {@link EntityManager | `EntityManager`} constructor via Zod.
   */
  entities?: Record<string, unknown>;

  /**
   * Optional Zod schemas for per-entity domain shapes (non-generated fields only).
   *
   * @remarks
   * Schemas MUST declare only base (non-generated) properties. Do not include:
   * - global keys (hashKey/rangeKey), or
   * - generated property tokens (sharded/unsharded keys).
   */
  entitiesSchema?: Record<string, ZodType>;

  /** Optional delimiter between generated key elements (default `|`). */
  generatedKeyDelimiter?: string;

  /** Optional delimiter between a generated element name and its value (default `#`). */
  generatedValueDelimiter?: string;

  /** Optional delimiter between entity token and shard suffix in hash key values (default `!`). */
  shardKeyDelimiter?: string;

  /** Optional transcode registry/value (validated at runtime). */
  transcodes?: unknown;

  /** Optional maximum concurrency for shard queries. */
  throttle?: number;
}

/** Extract the hash key token string literal from a values-first config input type. */
export type HashKeyFrom<CC> = CC extends {
  /** Hash key token property name. */
  hashKey: infer H;
}
  ? H & string
  : 'hashKey';

/** Extract the range key token string literal from a values-first config input type. */
export type RangeKeyFrom<CC> = CC extends {
  /** Range key token property name. */
  rangeKey: infer R;
}
  ? R & string
  : 'rangeKey';

/** Extract the union of sharded generated key tokens from a values-first config input type. */
export type ShardedKeysFrom<CC> = CC extends {
  /** Optional generated properties object containing sharded/unsharded maps. */
  generatedProperties?: infer GP;
}
  ? GP extends { sharded?: infer S }
    ? keyof S & string
    : never
  : never;

/** Extract the union of unsharded generated key tokens from a values-first config input type. */
export type UnshardedKeysFrom<CC> = CC extends {
  /** Optional generated properties object containing sharded/unsharded maps. */
  generatedProperties?: infer GP;
}
  ? GP extends { unsharded?: infer U }
    ? keyof U & string
    : never
  : never;

/** Extract the union of transcoded property tokens from a values-first config input type. */
export type TranscodedPropertiesFrom<CC> = CC extends {
  /** Optional map of property token -> transcode name. */
  propertyTranscodes?: infer PT;
}
  ? keyof PT & string
  : never;

/**
 * Derive an EntityMap from CC.entitiesSchema when provided (values-first, no generics).
 *
 * Fallback to broad EntityMap if schemas are absent.
 */
export type EntitiesFromSchema<CC> = CC extends {
  /** Optional per-entity Zod schema map used only for type inference. */
  entitiesSchema?: infer S;
}
  ? S extends Record<string, ZodType>
    ? { [K in Extract<keyof S, string>]: z.infer<S[K]> } & EntityMap
    : EntityMap
  : EntityMap;

/**
 * Derive the union of index token names from a values-first config input.
 *
 * When the provided config literal carries an `indexes` object with preserved
 * literal keys (prefer `as const` at call sites), this helper captures the
 * index token union. Falls back to `string` if absent.
 */
export type IndexTokensFrom<CC> = CC extends { indexes?: infer I }
  ? keyof I & string
  : string;

/**
 * Captures a BaseConfigMap-compatible type from a literal ConfigInput value
 * and an EntityMap (defaults to MinimalEntityMapFrom<CC>).
 */
export interface CapturedConfigMapFrom<
  CC,
  EM extends EntityMap,
> extends BaseConfigMap {
  /** Entity map type (from schemas when provided; otherwise broad). */
  EntityMap: EM;

  /** Hash key token captured from the config literal. */
  HashKey: HashKeyFrom<CC>;

  /** Range key token captured from the config literal. */
  RangeKey: RangeKeyFrom<CC>;

  /** Sharded generated key token union captured from the config literal. */
  ShardedKeys: ShardedKeysFrom<CC>;

  /** Unsharded generated key token union captured from the config literal. */
  UnshardedKeys: UnshardedKeysFrom<CC>;

  /** Transcoded property token union captured from the config literal. */
  TranscodedProperties: TranscodedPropertiesFrom<CC>;

  /** Transcode registry type (default registry; runtime validation still applies). */
  TranscodeRegistry: DefaultTranscodeRegistry;
}

/**
 * Values-first factory that captures literal tokens and index names directly
 * from the provided config value. Runtime config parsing/validation is
 * unchanged (performed in the EntityManager constructor).
 *
 * @typeParam CC - Captured config input (values-first). Prefer `as const` and
 *                 `satisfies` at call sites to preserve literal keys.
 * @typeParam EM - EntityMap for the manager. Defaults to a minimal derived map
 *                 from `CC.entitiesSchema` when present; otherwise falls back to EntityMap.
 *
 * @returns An {@link EntityManager | `EntityManager`} instance whose type
 *          captures CF from the single values-first config literal ({@link ConfigInput | `ConfigInput`})
 *          as the second generic parameter (phantom; type-only).
 */
export function createEntityManager<
  const CC extends ConfigInput,
  EM extends EntityMap = EntitiesFromSchema<CC>,
>(
  config: CC,
  logger: Pick<Console, 'debug' | 'error'> = console,
): EntityManager<CapturedConfigMapFrom<CC, EM>, CC> {
  // Cast to the existing Config<C> shape for runtime parsing; Zod validation
  // remains authoritative at construction time.
  // Optional dev guardrail: cross-check entitiesSchema keys vs config.entities keys.
  try {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (config && 'entitiesSchema' in config && config.entitiesSchema) {
      const schemaKeys = Object.keys(
        (config as { entitiesSchema?: Record<string, unknown> })
          .entitiesSchema ?? {},
      );
      const entitiesKeys = Object.keys(
        (config as unknown as { entities?: Record<string, unknown> })
          .entities ?? {},
      );
      const missingInEntities = schemaKeys.filter(
        (k) => !entitiesKeys.includes(k),
      );
      const missingInSchema = entitiesKeys.filter(
        (k) => !schemaKeys.includes(k),
      );
      if (missingInEntities.length || missingInSchema.length) {
        logger.debug('entitiesSchema keys mismatch with config.entities', {
          missingInEntities,
          missingInSchema,
        });
      }
    }
  } catch {
    // Best-effort warning only; never block construction.
  }
  return new EntityManager<CapturedConfigMapFrom<CC, EM>, CC>(
    config as unknown as Config<CapturedConfigMapFrom<CC, EM>>,
    logger,
  );
}
