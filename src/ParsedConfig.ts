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
        code: z.ZodIssueCode.custom,
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
      code: z.ZodIssueCode.custom,
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
        z
          .object({
            defaultLimit: z
              .number()
              .int()
              .positive()
              .safe()
              .optional()
              .default(10),
            defaultPageSize: z
              .number()
              .int()
              .positive()
              .safe()
              .optional()
              .default(10),
            shardBumps: z
              .array(
                z
                  .object({
                    timestamp: z.number().nonnegative().safe(),
                    charBits: z.number().int().min(1).max(5),
                    chars: z.number().int().min(0).max(40),
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
                        code: z.ZodIssueCode.custom,
                        message: `shardBump chars do not monotonically increase at timestamp ${val[i].timestamp.toString()}`,
                        path: [i],
                      });
                }
              }),
            timestampProperty: z.string().min(1),
            uniqueProperty: z.string().min(1),
          })
          .strict(),
      )
      .optional()
      .default({}),
    generatedProperties: z
      .object({
        sharded: z.record(componentArray).optional().default({}),
        unsharded: z.record(componentArray).optional().default({}),
      })
      .optional()
      .default({ sharded: {}, unsharded: {} }),
    hashKey: z.string(),
    indexes: z
      .record(
        z.object({
          hashKey: z.string().min(1),
          rangeKey: z.string().min(1),
          projections: componentArray.optional(),
        }),
      )
      .optional()
      .default({}),
    generatedKeyDelimiter: z.string().regex(/\W+/).optional().default('|'),
    generatedValueDelimiter: z.string().regex(/\W+/).optional().default('#'),
    propertyTranscodes: z.record(z.string()).optional().default({}),
    rangeKey: z.string(),
    shardKeyDelimiter: z.string().regex(/\W+/).optional().default('!'),
    throttle: z.number().int().positive().safe().optional().default(10),
    transcodes: z
      .record(
        z
          .object({
            encode: z.function().args(z.any()).returns(z.string()),
            decode: z.function().args(z.string()).returns(z.any()),
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
        code: z.ZodIssueCode.custom,
        message: 'generatedKeyDelimiter contains generatedValueDelimiter',
        params: {
          generatedKeyDelimiter: data.generatedKeyDelimiter,
          generatedValueDelimiter: data.generatedValueDelimiter,
        },
        path: ['generatedKeyDelimiter'],
      });

    if (data.generatedKeyDelimiter.includes(data.shardKeyDelimiter))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
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
        code: z.ZodIssueCode.custom,
        message: 'generatedValueDelimiter contains generatedKeyDelimiter',
        params: {
          generatedValueDelimiter: data.generatedValueDelimiter,
          generatedKeyDelimiter: data.generatedKeyDelimiter,
        },
        path: ['generatedValueDelimiter'],
      });

    if (data.generatedValueDelimiter.includes(data.shardKeyDelimiter))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
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
        code: z.ZodIssueCode.custom,
        message: 'shardKeyDelimiter contains generatedKeyDelimiter',
        params: {
          generatedKeyDelimiter: data.generatedKeyDelimiter,
          shardKeyDelimiter: data.shardKeyDelimiter,
        },
        path: ['shardKeyDelimiter'],
      });

    if (data.shardKeyDelimiter.includes(data.generatedValueDelimiter))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
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
          code: z.ZodIssueCode.invalid_enum_value,
          options: transcodes,
          path: ['propertyTranscodes', property],
          received: transcode,
        });

    // Validate all sharded property elements are transcoded properties.
    for (const [property, elements] of Object.entries(
      data.generatedProperties.sharded,
    ))
      for (const element of elements)
        if (!transcodedProperties.includes(element))
          ctx.addIssue({
            code: z.ZodIssueCode.invalid_enum_value,
            options: transcodedProperties,
            received: element,
            path: ['generatedProperties', 'sharded', property],
          });

    // Validate all unsharded property elements are transcoded properties.
    for (const [property, elements] of Object.entries(
      data.generatedProperties.unsharded,
    ))
      for (const element of elements)
        if (!transcodedProperties.includes(element))
          ctx.addIssue({
            code: z.ZodIssueCode.invalid_enum_value,
            options: transcodedProperties,
            received: element,
            path: ['generatedProperties', 'unsharded', property],
          });

    // Validate indexes.
    // TODO: Vaidate no two indexes have the same hashKey & rangeKey.
    for (const [indexKey, { hashKey, rangeKey, projections }] of Object.entries(
      data.indexes,
    )) {
      // Validate hash key is sharded.
      if (![data.hashKey, ...shardedKeys].includes(hashKey)) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_enum_value,
          options: [data.hashKey, ...shardedKeys],
          path: ['indexes', indexKey, 'hashKey'],
          received: hashKey,
        });
      }

      // Validate range key is unsharded or transcodable.
      if (
        ![data.rangeKey, ...unshardedKeys, ...transcodedProperties].includes(
          rangeKey,
        )
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_enum_value,
          options: [data.rangeKey, ...unshardedKeys],
          path: ['indexes', indexKey, 'rangeKey'],
          received: rangeKey,
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
              code: z.ZodIssueCode.custom,
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
          code: z.ZodIssueCode.invalid_enum_value,
          options: transcodedProperties,
          path: ['entities', entityToken, 'timestampProperty'],
          received: timestampProperty,
        });

      // validate uniqueProperty is a transcoded property.
      if (!transcodedProperties.includes(uniqueProperty))
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_enum_value,
          options: transcodedProperties,
          path: ['entities', entityToken, 'uniqueProperty'],
          received: uniqueProperty,
        });
    }
  });

/**
 * Simplified type taken on by a {@link Config | `Config`} object after parsing in the {@link EntityManager | `EntityManager`} constructor.
 *
 * @category EntityManager
 */
export type ParsedConfig = z.infer<typeof configSchema>;
