import type {
  DefaultTranscodeRegistry,
  EntityMap,
} from '@karmaniverous/entity-tools';
import type { infer as zInfer, ZodType } from 'zod';

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
  hashKey: string;
  rangeKey: string;
  generatedProperties?: {
    sharded?: Record<string, readonly string[]>;
    unsharded?: Record<string, readonly string[]>;
  };
  propertyTranscodes?: Record<string, string>;
  indexes?: Record<
    string,
    { hashKey: string; rangeKey: string; projections?: string[] }
  >;
  entities?: Record<string, unknown>;
  /**
   * Optional Zod schemas for per-entity domain shapes (non-generated fields only).
   *
   * Important: Schemas MUST declare only base (non-generated) properties. Do not include
   * global keys (hashKey/rangeKey) or any generated tokens (sharded/unsharded).
   */
  entitiesSchema?: Record<string, ZodType>;
  generatedKeyDelimiter?: string;
  generatedValueDelimiter?: string;
  shardKeyDelimiter?: string;
  transcodes?: unknown;
  throttle?: number;
}

export type HashKeyFrom<CC> = CC extends { hashKey: infer H }
  ? H & string
  : 'hashKey';
export type RangeKeyFrom<CC> = CC extends { rangeKey: infer R }
  ? R & string
  : 'rangeKey';

export type ShardedKeysFrom<CC> = CC extends { generatedProperties?: infer GP }
  ? GP extends { sharded?: infer S }
    ? keyof S & string
    : never
  : never;

export type UnshardedKeysFrom<CC> = CC extends {
  generatedProperties?: infer GP;
}
  ? GP extends { unsharded?: infer U }
    ? keyof U & string
    : never
  : never;

export type TranscodedPropertiesFrom<CC> = CC extends {
  propertyTranscodes?: infer PT;
}
  ? keyof PT & string
  : never;

/**
 * Derive an EntityMap from CC.entitiesSchema when provided (values-first, no generics).
 * Fallback to broad EntityMap if schemas are absent.
 */
export type EntitiesFromSchema<CC> = CC extends {
  entitiesSchema?: infer S;
}
  ? S extends Record<string, ZodType>
    ? { [K in keyof S & string]: zInfer<S[K]> } & EntityMap
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
export type CapturedConfigMapFrom<CC, EM extends EntityMap> = {
  EntityMap: EM;
  HashKey: HashKeyFrom<CC>;
  RangeKey: RangeKeyFrom<CC>;
  ShardedKeys: ShardedKeysFrom<CC>;
  UnshardedKeys: UnshardedKeysFrom<CC>;
  TranscodedProperties: TranscodedPropertiesFrom<CC>;
  TranscodeRegistry: DefaultTranscodeRegistry;
} & BaseConfigMap;

/**
 * Values-first factory that captures literal tokens and index names directly
 * from the provided config value. Runtime config parsing/validation is
 * unchanged (performed in the EntityManager constructor).
 *
 * @typeParam CC - Captured config input (values-first). Prefer `as const` and
 *                 `satisfies` at call sites to preserve literal keys.
 * @typeParam EM - EntityMap for the manager. Defaults to a minimal derived map
 *                 from `CC.entitiesSchema` when present; otherwise falls back to EntityMap.
 */
export function createEntityManager<
  const CC extends ConfigInput,
  EM extends EntityMap = EntitiesFromSchema<CC>,
>(
  config: CC,
  logger: Pick<Console, 'debug' | 'error'> = console,
): EntityManager<CapturedConfigMapFrom<CC, EM>> {
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
  return new EntityManager(
    config as unknown as Config<CapturedConfigMapFrom<CC, EM>>,
    logger,
  );
}
