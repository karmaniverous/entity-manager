import { defaultTranscodes } from '@karmaniverous/entity-tools';
import { counting, sort } from 'radash';
import { z } from 'zod';

const defaultShardBump = { timestamp: 0, charBits: 1, chars: 0 };

const validateArrayUnique = <T>(
  arr: T[],
  ctx: z.RefinementCtx,
  identity: (item: T) => string | number | symbol = (item) =>
    item as unknown as string | number | symbol,
  path: (string | number)[] = [],
) => {
  const counts = counting(arr, identity);

  for (const [element, count] of Object.entries(counts)) {
    if (count > 1)
      ctx.addIssue({
        code: 'custom',
        message: `duplicate array element`,
        params: { element },
        path,
      });
  }
};

const validateKeysExclusive = (
  keys: string[],
  label: string,
  ref: string[],
  ctx: z.RefinementCtx,
) => {
  const intersection = keys.filter((key) => ref.includes(key));

  if (intersection.length)
    ctx.addIssue({
      code: 'custom',
      message: `${label} key collision: ${intersection.toString()}`,
    });
};

const componentArray = z
  .array(z.string().min(1))
  .nonempty()
  .superRefine(validateArrayUnique);

export const configSchema = z
  .object({
    entities: z
      .record(
        z.string(),
        z
          .object({
            defaultLimit: z
              .number()
              .int()
              .positive()
              .optional()
              .default(10)
              .describe(
                'Default max items returned by EntityManager.query for this entity (across all shards).',
              ),
            defaultPageSize: z
              .number()
              .int()
              .positive()
              .optional()
              .default(10)
              .describe(
                'Default per-shard page size used by EntityManager.query for this entity.',
              ),
            shardBumps: z
              .array(
                z
                  .object({
                    timestamp: z
                      .number()
                      .int()
                      .nonnegative()
                      .describe(
                        'Start timestamp (ms) for this shard bump (inclusive).',
                      ),
                    charBits: z
                      .number()
                      .int()
                      .min(1)
                      .max(5)
                      .describe(
                        'Bits per shard character (radix = 2**charBits).',
                      ),
                    chars: z
                      .number()
                      .int()
                      .min(0)
                      .max(40)
                      .describe(
                        'Shard suffix width (chars); controls shard space.',
                      ),
                  })
                  .strict(),
              )
              .optional()
              .default([defaultShardBump])

              // validate shardBump uniqueness by timestamp.
              .superRefine((val, ctx) => {
                validateArrayUnique(val, ctx, ({ timestamp }) => timestamp, [
                  'timestamp',
                ]);
              })

              .transform((val) => {
                // sort shardBumps by timestamp.
                let sorted = sort(val, ({ timestamp }) => timestamp);

                // prepend defaultShardBump if missing zero-timestamp bump.
                if (sorted[0].timestamp !== 0) {
                  sorted = [defaultShardBump, ...sorted];
                }

                return sorted;
              })

              // validate shardBump chars mootonically increase with timestamp.
              .superRefine((val, ctx) => {
                if (val.length > 1) {
                  for (let i = 1; i < val.length; i++)
                    if (val[i].chars <= val[i - 1].chars)
                      ctx.addIssue({
                        code: 'custom',
                        message: `shardBump chars do not monotonically increase at timestamp ${val[i].timestamp.toString()}`,
                        path: [i],
                      });
                }
              }),
            timestampProperty: z
              .string()
              .min(1)
              .describe(
                'Property token whose value selects the shard bump (typically a timestamp).',
              ),
            uniqueProperty: z
              .string()
              .min(1)
              .describe(
                'Property token used to dedupe and build the global range key.',
              ),
          })
          .strict(),
      )
      .optional()
      .default({})
      .describe('Entity definitions keyed by entity token.'),
    generatedProperties: z
      .object({
        sharded: z
          .record(z.string(), componentArray)
          .optional()
          .default({})
          .describe(
            'Sharded generated property tokens (hash-side); atomic encoding semantics.',
          ),
        unsharded: z
          .record(z.string(), componentArray)
          .optional()
          .default({})
          .describe(
            'Unsharded generated property tokens (range-side); non-atomic encoding semantics.',
          ),
      })
      .optional()
      .default({ sharded: {}, unsharded: {} }),
    hashKey: z.string().describe('Global hash key property name.'),
    indexes: z
      .record(
        z.string(),
        z.object({
          hashKey: z
            .string()
            .min(1)
            .describe(
              'Index hash key token (global hash key or a sharded generated key).',
            ),
          rangeKey: z
            .string()
            .min(1)
            .describe(
              'Index range key token (global range key, an unsharded generated key, or a transcoded property).',
            ),
          projections: z
            .array(z.string().min(1))
            .superRefine(validateArrayUnique)
            .optional(),
        }),
      )
      .optional()
      .default({})
      .describe('Index definitions keyed by index token.'),
    generatedKeyDelimiter: z
      .string()
      .regex(/\W+/)
      .optional()
      .default('|')
      .describe('Delimiter between generated key elements (default `|`).'),
    generatedValueDelimiter: z
      .string()
      .regex(/\W+/)
      .optional()
      .default('#')
      .describe(
        'Delimiter between generated element name and value (default `#`).',
      ),
    propertyTranscodes: z.record(z.string(), z.string()).optional().default({}),
    rangeKey: z.string().describe('Global range key property name.'),
    shardKeyDelimiter: z
      .string()
      .regex(/\W+/)
      .optional()
      .default('!')
      .describe(
        'Delimiter between entity token and shard suffix in hash key values.',
      ),
    throttle: z
      .number()
      .int()
      .positive()
      .optional()
      .default(10)
      .describe(
        'Default max concurrency for shard queries during EntityManager.query.',
      ),
    transcodes: z
      .record(
        z.string(),
        z
          .object({
            // Accept function shapes without relying on z.function()
            // to avoid TS inference conflicts across Zod versions and
            // to remain compatible with narrower parameter types.
            encode: z
              .custom<unknown>((fn) => typeof fn === 'function')
              .describe(
                'Encode a value to a lexicographically sortable string.',
              ),
            decode: z
              .custom<unknown>((fn) => typeof fn === 'function')
              .describe(
                'Decode a previously encoded string back to the value type.',
              ),
          })
          .strict(),
      )
      .optional()
      .default(defaultTranscodes),
  })
  .strict()
  .superRefine((data, ctx) => {
    // validate no generated key delimiter collision
    if (data.generatedKeyDelimiter.includes(data.generatedValueDelimiter))
      ctx.addIssue({
        code: 'custom',
        message: 'generatedKeyDelimiter contains generatedValueDelimiter',
        params: {
          generatedKeyDelimiter: data.generatedKeyDelimiter,
          generatedValueDelimiter: data.generatedValueDelimiter,
        },
        path: ['generatedKeyDelimiter'],
      });

    if (data.generatedKeyDelimiter.includes(data.shardKeyDelimiter))
      ctx.addIssue({
        code: 'custom',
        message: 'generatedKeyDelimiter contains shardKeyDelimiter',
        params: {
          generatedKeyDelimiter: data.generatedKeyDelimiter,
          shardKeyDelimiter: data.shardKeyDelimiter,
        },
        path: ['generatedKeyDelimiter'],
      });

    // validate no generated value delimiter collision
    if (data.generatedValueDelimiter.includes(data.generatedKeyDelimiter))
      ctx.addIssue({
        code: 'custom',
        message: 'generatedValueDelimiter contains generatedKeyDelimiter',
        params: {
          generatedValueDelimiter: data.generatedValueDelimiter,
          generatedKeyDelimiter: data.generatedKeyDelimiter,
        },
        path: ['generatedValueDelimiter'],
      });

    if (data.generatedValueDelimiter.includes(data.shardKeyDelimiter))
      ctx.addIssue({
        code: 'custom',
        message: 'generatedValueDelimiter contains shardKeyDelimiter',
        params: {
          generatedValueDelimiter: data.generatedValueDelimiter,
          shardKeyDelimiter: data.shardKeyDelimiter,
        },
        path: ['generatedValueDelimiter'],
      });

    // validate no shard key delimiter collision
    if (data.shardKeyDelimiter.includes(data.generatedKeyDelimiter))
      ctx.addIssue({
        code: 'custom',
        message: 'shardKeyDelimiter contains generatedKeyDelimiter',
        params: {
          generatedKeyDelimiter: data.generatedKeyDelimiter,
          shardKeyDelimiter: data.shardKeyDelimiter,
        },
        path: ['shardKeyDelimiter'],
      });

    if (data.shardKeyDelimiter.includes(data.generatedValueDelimiter))
      ctx.addIssue({
        code: 'custom',
        message: 'shardKeyDelimiter contains generatedValueDelimiter',
        params: {
          generatedValueDelimiter: data.generatedValueDelimiter,
          shardKeyDelimiter: data.shardKeyDelimiter,
        },
        path: ['shardKeyDelimiter'],
      });

    // get reserved keys
    const shardedKeys = Object.keys(data.generatedProperties.sharded);
    const unshardedKeys = Object.keys(data.generatedProperties.unsharded);
    const transcodedProperties = Object.keys(data.propertyTranscodes);

    // validate hashKey exclusive.
    validateKeysExclusive(
      [data.hashKey],
      'hashKey',
      [
        data.rangeKey,
        ...shardedKeys,
        ...unshardedKeys,
        ...transcodedProperties,
      ],
      ctx,
    );

    // validate rangeKey exclusive.
    validateKeysExclusive(
      [data.rangeKey],
      'rangeKey',
      [...shardedKeys, ...unshardedKeys, ...transcodedProperties],
      ctx,
    );

    // validate shardedKeys exclusive.
    validateKeysExclusive(
      shardedKeys,
      'shardedKeys',
      [...unshardedKeys, ...transcodedProperties],
      ctx,
    );

    // validate unshardedKeys exclusive.
    validateKeysExclusive(
      unshardedKeys,
      'unshardedKeys',
      transcodedProperties,
      ctx,
    );

    // validate all propertyTranscode values are transcode keys.
    const transcodes = Object.keys(data.transcodes);

    for (const [property, transcode] of Object.entries(data.propertyTranscodes))
      if (!transcodes.includes(transcode))
        ctx.addIssue({
          code: 'custom',
          message: `propertyTranscodes['${property}'] references unknown transcode '${transcode}'`,
          path: ['propertyTranscodes', property],
        });

    // Validate all sharded property elements are transcoded properties.
    for (const [property, elements] of Object.entries(
      data.generatedProperties.sharded,
    ))
      for (const element of elements)
        if (!transcodedProperties.includes(element))
          ctx.addIssue({
            code: 'custom',
            message: `generatedProperties.sharded['${property}'] contains non-transcoded element '${element}'`,
            path: ['generatedProperties', 'sharded', property],
          });

    // Validate all unsharded property elements are transcoded properties.
    for (const [property, elements] of Object.entries(
      data.generatedProperties.unsharded,
    ))
      for (const element of elements)
        if (!transcodedProperties.includes(element))
          ctx.addIssue({
            code: 'custom',
            message: `generatedProperties.unsharded['${property}'] contains non-transcoded element '${element}'`,
            path: ['generatedProperties', 'unsharded', property],
          });

    // Validate indexes.
    // Validate no two indexes have the same hashKey & rangeKey.
    const seenIndexPairs = new Set<string>();
    for (const [indexKey, { hashKey, rangeKey, projections }] of Object.entries(
      data.indexes,
    )) {
      const pairSig = `${hashKey}|${rangeKey}`;
      if (seenIndexPairs.has(pairSig)) {
        ctx.addIssue({
          code: 'custom',
          message: `duplicate index hashKey/rangeKey pair`,
          path: ['indexes', indexKey],
        });
      } else seenIndexPairs.add(pairSig);
      // Validate hash key is sharded.
      if (![data.hashKey, ...shardedKeys].includes(hashKey)) {
        ctx.addIssue({
          code: 'custom',
          message: `index '${indexKey}' hashKey '${hashKey}' must be one of [${[
            data.hashKey,
            ...shardedKeys,
          ].join(', ')}]`,
          path: ['indexes', indexKey, 'hashKey'],
        });
      }

      // Validate range key is unsharded or transcodable.
      if (
        ![data.rangeKey, ...unshardedKeys, ...transcodedProperties].includes(
          rangeKey,
        )
      ) {
        ctx.addIssue({
          code: 'custom',
          message: `index '${indexKey}' rangeKey '${rangeKey}' must be one of [${[
            data.rangeKey,
            ...unshardedKeys,
            ...transcodedProperties,
          ].join(', ')}]`,
          path: ['indexes', indexKey, 'rangeKey'],
        });
      }

      // Validate no index projections are keys.
      if (projections)
        for (const projection of projections)
          if (
            [
              data.hashKey,
              data.rangeKey,
              hashKey,
              rangeKey,
              ...shardedKeys,
              ...unshardedKeys,
            ].includes(projection)
          )
            ctx.addIssue({
              code: 'custom',
              message: 'index projection is a key',
              params: { projection },
              path: ['indexes', indexKey, 'projections'],
            });
    }

    // validate entities
    for (const [
      entityToken,
      { timestampProperty, uniqueProperty },
    ] of Object.entries(data.entities)) {
      // validate timestampProperty is a transcoded property.
      if (!transcodedProperties.includes(timestampProperty))
        ctx.addIssue({
          code: 'custom',
          message: `entities['${entityToken}'].timestampProperty '${timestampProperty}' must be one of [${transcodedProperties.join(', ')}]`,
          path: ['entities', entityToken, 'timestampProperty'],
        });

      // validate uniqueProperty is a transcoded property.
      if (!transcodedProperties.includes(uniqueProperty))
        ctx.addIssue({
          code: 'custom',
          message: `entities['${entityToken}'].uniqueProperty '${uniqueProperty}' must be one of [${transcodedProperties.join(', ')}]`,
          path: ['entities', entityToken, 'uniqueProperty'],
        });
    }
  });

/**
 * Simplified type taken on by a {@link Config | `Config`} object after parsing in the {@link EntityManager | `EntityManager`} constructor.
 *
 * @category EntityManager
 */
export type ParsedConfig = z.infer<typeof configSchema>;

/**
 * Parsed runtime configuration schema for {@link EntityManager | `EntityManager`}.
 *
 * @remarks
 * This schema is authoritative at runtime; TypeDoc uses schema `.describe(...)` metadata
 * to document the derived shape when `typedoc-plugin-zod` is enabled.
 */

export const _configSchemaDocsAnchor = configSchema;
