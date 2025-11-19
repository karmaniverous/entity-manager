import { defaultTranscodes } from '@karmaniverous/entity-tools';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import type { Config } from './Config';
import type { ConfigMap } from './ConfigMap';
import { createEntityManager } from './createEntityManager';
import { EntityManager } from './EntityManager';

describe('entitiesSchema acceptance (factory and constructor)', function () {
  const configWithSchema = {
    hashKey: 'hashKey2',
    rangeKey: 'rangeKey',
    generatedProperties: { sharded: {}, unsharded: {} },
    propertyTranscodes: { userId: 'string', created: 'timestamp' },
    indexes: {},
    entities: {
      user: {
        uniqueProperty: 'userId',
        timestampProperty: 'created',
      },
    },
    entitiesSchema: {
      user: z.object({
        userId: z.string(),
        created: z.number(),
      }),
    },
    transcodes: defaultTranscodes,
  } as const;

  it('createEntityManager accepts entitiesSchema and does not leak it to runtime config', function () {
    const em = createEntityManager(configWithSchema);
    // entitiesSchema is compile-time only; should not appear in runtime config.
    expect(
      Object.prototype.hasOwnProperty.call(
        (em as unknown as { config: Record<string, unknown> }).config,
        'entitiesSchema',
      ),
    ).toBe(false);
  });

  it('EntityManager constructor accepts entitiesSchema and does not leak it to runtime config', function () {
    type CM = ConfigMap<{
      EntityMap: Record<string, { userId: string; created: number }>;
      HashKey: 'hashKey2';
      RangeKey: 'rangeKey';
      ShardedKeys: never;
      UnshardedKeys: never;
      TranscodedProperties: 'userId' | 'created';
    }>;

    // Cast through unknown to satisfy constructor type while preserving runtime shape.
    const em = new EntityManager(configWithSchema as unknown as Config<CM>);
    expect(
      Object.prototype.hasOwnProperty.call(
        (em as unknown as { config: Record<string, unknown> }).config,
        'entitiesSchema',
      ),
    ).toBe(false);
  });
});
