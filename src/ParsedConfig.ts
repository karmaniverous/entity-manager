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
        message: `duplicate array element '${element}'`,
        path,
      });
  }
};

const validateKeyExclusive = (
  key: string,
  label: string,
  ref: string[],
  ctx: z.RefinementCtx,
) => {
  if (ref.includes(key))
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${label} '${key}' is not exclusive`,
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
            generated: z
              .record(
                z
                  .object({
                    atomic: z.boolean().optional().default(false),
                    elements: componentArray,
                    sharded: z.boolean().optional().default(false),
                  })
                  .optional(),
              )
              .optional()
              .default({}),
            elementTranscodes: z.record(z.string()).optional().default({}),
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
          .strict()
          .superRefine((data, ctx) => {
            const generatedKeys = Object.keys(data.generated);

            // validate timestampProperty is not a generated key.
            validateKeyExclusive(
              data.timestampProperty,
              'timestampProperty',
              generatedKeys,
              ctx,
            );

            // validate uniqueProperty is not a generated key.
            validateKeyExclusive(
              data.uniqueProperty,
              'uniqueProperty',
              generatedKeys,
              ctx,
            );
          }),
      )
      .optional()
      .default({}),
    generatedKeyDelimiter: z.string().regex(/\W+/).optional().default('|'),
    generatedValueDelimiter: z.string().regex(/\W+/).optional().default('#'),
    shardKeyDelimiter: z.string().regex(/\W+/).optional().default('!'),
    hashKey: z.string().optional().default('hashKey'),
    rangeKey: z.string().optional().default('rangeKey'),
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
        path: ['generatedKeyDelimiter'],
      });

    if (data.generatedKeyDelimiter.includes(data.shardKeyDelimiter))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'generatedKeyDelimiter contains shardKeyDelimiter',
        path: ['generatedKeyDelimiter'],
      });

    // validate no generated value delimiter collision
    if (data.generatedValueDelimiter.includes(data.generatedKeyDelimiter))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'generatedValueDelimiter contains generatedKeyDelimiter',
        path: ['generatedValueDelimiter'],
      });

    if (data.generatedValueDelimiter.includes(data.shardKeyDelimiter))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'generatedValueDelimiter contains shardKeyDelimiter',
        path: ['generatedValueDelimiter'],
      });

    // validate no shard key delimiter collision
    if (data.shardKeyDelimiter.includes(data.generatedKeyDelimiter))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'shardKeyDelimiter contains generatedKeyDelimiter',
        path: ['shardKeyDelimiter'],
      });

    if (data.shardKeyDelimiter.includes(data.generatedValueDelimiter))
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'shardKeyDelimiter contains generatedValueDelimiter',
        path: ['shardKeyDelimiter'],
      });

    const reservedKeys = Object.values(data.entities).reduce(
      (reserved, { generated, timestampProperty, uniqueProperty }) =>
        new Set([
          ...reserved,
          ...Object.keys(generated),
          timestampProperty,
          uniqueProperty,
        ]),
      new Set<string>(),
    );

    // validate hashKey is not a reserved key.
    validateKeyExclusive(
      data.hashKey,
      'hashKey',
      [...reservedKeys, data.rangeKey],
      ctx,
    );

    // validate rangeKey is not a reserved key.
    validateKeyExclusive(
      data.rangeKey,
      'rangeKey',
      [...reservedKeys, data.hashKey],
      ctx,
    );

    // validate entities
    const transcodes = Object.keys(data.transcodes);

    for (const [entityToken, entity] of Object.entries(data.entities)) {
      // validate all entity generated element type values are transcode keys.
      for (const [element, generatedElementType] of Object.entries(
        entity.elementTranscodes,
      ))
        if (!transcodes.includes(generatedElementType))
          ctx.addIssue({
            code: z.ZodIssueCode.invalid_enum_value,
            options: transcodes,
            path: ['entities', entityToken, 'elementTranscodes', element],
            received: generatedElementType,
          });

      // validate all entity generated property elements have a corresponding entity element type.
      const typedElements = Object.keys(entity.elementTranscodes);

      for (const [generatedKey, generated] of Object.entries(entity.generated))
        for (const element of generated?.elements ?? [])
          if (!typedElements.includes(element))
            ctx.addIssue({
              code: z.ZodIssueCode.invalid_enum_value,
              options: typedElements,
              path: [
                'entities',
                entityToken,
                'generated',
                generatedKey,
                'elements',
              ],
              received: element,
            });

      // validate indexes.
      const generatedProperties = Object.keys(entity.generated);

      for (const [
        indexKey,
        { hashKey, rangeKey, projections },
      ] of Object.entries(entity.indexes)) {
        // validate index hash key is sharded
        if (hashKey !== data.hashKey && !entity.generated[hashKey]?.sharded)
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'index hash key is not sharded',
            path: ['entities', entityToken, 'indexes', indexKey, 'hashKey'],
          });

        // validate index range key is unsharded
        if (rangeKey !== data.rangeKey && entity.generated[rangeKey]?.sharded)
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'index range key is sharded',
            path: ['entities', entityToken, 'indexes', indexKey, 'rangeKey'],
          });

        // validate all ungenerated entity index components have a corresponding entity element type
        for (const component of [hashKey, rangeKey])
          if (
            ![data.hashKey, data.rangeKey, ...generatedProperties].includes(
              component,
            ) &&
            !typedElements.includes(component)
          )
            ctx.addIssue({
              code: z.ZodIssueCode.invalid_enum_value,
              options: typedElements,
              path: [
                'entities',
                entityToken,
                'indexes',
                indexKey,
                'components',
              ],
              received: component,
            });

        // validate no index projections are index components, hashKey, or rangeKey
        if (projections)
          for (const projection of projections) {
            if (
              [data.hashKey, data.rangeKey, hashKey, rangeKey].includes(
                projection,
              )
            )
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message:
                  'index projection is an index component, hash key, or range key',
                path: [
                  'entities',
                  entityToken,
                  'indexes',
                  indexKey,
                  'projections',
                ],
              });
          }
      }
    }
  });

/**
 * Simplified type taken on by a {@link Config | `Config`} object after parsing in the {@link EntityManager | `EntityManager`} constructor.
 *
 * @category Config
 */
export type ParsedConfig = z.infer<typeof configSchema>;
