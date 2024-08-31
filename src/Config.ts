import { counting, sort } from 'radash';
import { z } from 'zod';

const defaultBump = { timestamp: 0, nibbleBits: 1, nibbles: 0 };

// EncodeFunction zod schema
const encodeFunctionSchema = z
  .function()
  .args(z.record(z.unknown()))
  .returns(z.unknown());

/**
 * EncodeFunction
 *
 * @category Options
 */
export type EncodeFunction = z.infer<typeof encodeFunctionSchema>;

// DecodeFunction zod schema
const decodeFunctionSchema = z
  .function()
  .args(z.any())
  .returns(z.record(z.unknown()).optional());

/**
 * DecodeFunction
 *
 * @category Options
 */
export type DecodeFunction = z.infer<typeof decodeFunctionSchema>;

// DecodeFunction zod schema
const entityKeyFunctionSchema = z
  .function()
  .args(z.record(z.unknown()))
  .returns(z.string());

/**
 * EntityKeyFunction
 *
 * @category Options
 */
export type EntityKeyFunction = z.infer<typeof entityKeyFunctionSchema>;

// TimestampFunction zod schema
const timestampFunctionSchema = z
  .function()
  .args(z.record(z.unknown()))
  .returns(z.number());

/**
 * TimestampFunction
 *
 * @category Options
 */
export type TimestampFunction = z.infer<typeof timestampFunctionSchema>;

// Config zod schema
export const configSchema = z
  .object({
    entities: z
      .record(
        z.object({
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
          indexes: z
            .record(
              z.array(z.string()).nonempty(), // No dupes, items are keys
            )
            .default({}),
          keys: z
            .record(
              z.object({
                elements: z
                  .array(z.string().min(1))
                  .optional()
                  .refine((data): data is string[] => z.NEVER), // elements must be unique, defaults to [keyToken]
                encode: encodeFunctionSchema
                  .optional()
                  .refine((data): data is EncodeFunction => z.NEVER), // defaults to (item) => item[keyToken]
                decode: decodeFunctionSchema
                  .optional()
                  .refine((data): data is DecodeFunction => z.NEVER), // defauts to (value) => {[keyToken]: value}
                retain: z.boolean().default(false),
              }),
            ) // no token collisions
            .default({}),
          sharding: z
            .object({
              bumps: z
                .array(
                  z.object({
                    timestamp: z.number().nonnegative().safe(), // must be unique in bumps array
                    nibbleBits: z.number().int().min(1).max(5),
                    nibbles: z.number().int().min(0).max(40), // must increase monotonically with timestamp
                  }),
                )

                .default([defaultBump]),
              entityKey: entityKeyFunctionSchema
                .optional()
                .refine((data): data is EntityKeyFunction => z.NEVER), // required if positive-nibble bumps defined
              timestamp: timestampFunctionSchema
                .optional()
                .refine((data): data is TimestampFunction => z.NEVER), // required if positive-nibble bumps defined
            })
            .default({ bumps: [defaultBump] }),
        }),
      )
      .default({}),
    tokens: z
      .object({
        entity: z.string().min(1).default('entity'),
        entityKey: z.string().min(1).default('entityKey'),
        shardKey: z.string().min(1).default('shardKey'),
      })
      .default({
        entity: 'entity',
        entityKey: 'entityKey',
        shardKey: 'shardKey',
      }),
  })
  .superRefine((data, ctx) => {
    // validate entities
    for (const [entityToken, entity] of Object.entries(data.entities)) {
      const validKeyTokens = Object.keys(entity.keys);

      // validate indexes
      for (const [indexToken, index] of Object.entries(entity.indexes)) {
        // validate index constituents
        const counts = counting(index, (element) => element);

        for (const [element, count] of Object.entries(counts)) {
          // index element valid
          if (!validKeyTokens.includes(element))
            ctx.addIssue({
              code: z.ZodIssueCode.invalid_enum_value,
              message: `index ${indexToken} element ${element} is not a valid entity ${entityToken} key`,
              options: validKeyTokens,
              path: ['entities', entityToken, 'indexes', indexToken],
              received: element,
            });

          // index element unique
          if (count > 1)
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `index ${indexToken} has duplicate element ${element}`,
              path: ['entities', entityToken, 'indexes', indexToken],
            });
        }
      }

      // validate keys
      // recast to RawConfig type
      for (const [keyToken, key] of Object.entries(entity.keys))
        if (key.elements as string[] | undefined) {
          // validate elements
          const counts = counting(key.elements, (element) => element);

          for (const [element, count] of Object.entries(counts)) {
            // key element unique
            if (count > 1)
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `entity ${entityToken} key ${keyToken} has duplicate element ${element}`,
                path: ['entities', entityToken, 'keys', keyToken, 'elements'],
              });
          }
        }

      // validate sharding
      if (entity.sharding.bumps.length) {
        // validate bumnps
        const counts = counting(
          entity.sharding.bumps,
          ({ timestamp }) => timestamp,
        );

        // bump timestamp unique
        for (const [timestamp, count] of Object.entries(counts))
          if (count > 1)
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `entity ${entityToken} sharding has duplicate bump at timestamp ${timestamp}`,
              path: ['entities', entityToken, 'sharding', 'bumps'],
            });

        // bump nibbles mootonically increase with timestamp.
        if (entity.sharding.bumps.length > 1) {
          const sortedBumps = sort(
            entity.sharding.bumps,
            ({ timestamp }) => timestamp,
          );

          for (let i = 1; i < sortedBumps.length; i++)
            if (sortedBumps[i].nibbles <= sortedBumps[i - 1].nibbles)
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `entity ${entityToken} sharding bump nibbles do not monotonically increase at timestamp ${sortedBumps[i].timestamp.toString()}`,
              });
        }

        // if positive-nibble bumps are defined...
        if (entity.sharding.bumps.some(({ nibbles }) => !!nibbles)) {
          // entityKey function must be defined, recast to RawConfig type
          if (!(entity.sharding.entityKey as EntityKeyFunction | undefined))
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `entity ${entityToken} sharding entityToken function required when positive-nibble bumps defined`,
              path: ['entities', entityToken, 'sharding'],
            });

          // timestamp function must be defined, recast to RawConfig type
          if (!(entity.sharding.timestamp as TimestampFunction | undefined))
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `entity ${entityToken} sharding timestamp function required when positive-nibble bumps defined`,
              path: ['entities', entityToken, 'sharding'],
            });
        }
      }
    }
  })
  .transform((data) => {
    // Normalize entities.
    for (const entity of Object.values(data.entities)) {
      // Normalize keys.
      for (const [keyToken, key] of Object.entries(entity.keys)) {
        // default elements, recast to RawConfig type
        (key.elements as string[] | undefined) ??= [keyToken];

        // default encode function, recast to RawConfig type
        (key.encode as EncodeFunction | undefined) ??= (item) => item[keyToken];

        // default decode function, recast to RawConfig type
        (key.decode as DecodeFunction | undefined) ??= (value: unknown) => ({
          [keyToken]: value,
        });
      }

      // Sort sharding bumps by timestamp.
      entity.sharding.bumps = sort(
        entity.sharding.bumps,
        ({ timestamp }) => timestamp,
      );

      // Prepend default sharding bump if first bump has non-zero timestamp.
      if (entity.sharding.bumps[0].timestamp)
        entity.sharding.bumps = [defaultBump, ...entity.sharding.bumps];
    }

    return data;
  });

/**
 * RawConfig
 *
 * @category Options
 */
export type RawConfig = z.input<typeof configSchema>;

/**
 * Config
 *
 * @category Options
 */
export type Config = z.infer<typeof configSchema>;
