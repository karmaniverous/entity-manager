import { counting, sort } from 'radash';
import { z } from 'zod';

const defaultBump = { timestamp: 0, nibbleBits: 1, nibbles: 0 };

type DeepRequired<T> = {
  [K in keyof T]-?: T[K] extends object ? DeepRequired<T[K]> : T[K];
};

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
                elements: z.array(z.string().min(1)).optional(), // must be unique, defaults to [keyToken]
                encode: z
                  .function()
                  .args(z.record(z.unknown()))
                  .returns(z.unknown())
                  .optional(), // defaults to (item) => item[keyToken]
                decode: z
                  .function()
                  .args(z.any())
                  .returns(z.record(z.unknown()).optional())
                  .optional(), // defauts to (value) => {[keyToken]: value}
                retain: z.boolean().default(false),
              }),
            ) // no token collisions
            .default({}),
          sharding: z
            .object({
              bumps: z
                .array(
                  z.object({
                    timestamp: z.number().nonnegative().safe(), // must be unique
                    nibbleBits: z.number().int().min(1).max(5),
                    nibbles: z.number().int().min(0).max(40), // must increase monotonically with timestamp
                  }),
                )

                .default([defaultBump]),
              entityKey: z
                .function()
                .args(z.record(z.unknown()))
                .returns(z.string())
                .optional(), // required if positive-nibble bumps defined
              timestamp: z
                .function()
                .args(z.record(z.unknown()))
                .returns(z.number())
                .optional(), // required if positive-nibble bumps defined
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
      for (const [keyToken, key] of Object.entries(entity.keys))
        if (key.elements) {
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
          // entityKey function must be defined
          if (!entity.sharding.entityKey)
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `entity ${entityToken} sharding entityToken function required when positive-nibble bumps defined`,
              path: ['entities', entityToken, 'sharding'],
            });

          // timestamp function must be defined.
          if (!entity.sharding.timestamp)
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
        // Default elements.
        key.elements ??= [keyToken];

        // Default encode function.
        key.encode ??= (item) => item[keyToken];

        // Default decode function.
        key.decode ??= (value: unknown) => ({ [keyToken]: value });
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

    return data as DeepRequired<typeof data>;
  });

export type RawConfig = z.input<typeof configSchema>;

export type Config = z.output<typeof configSchema>;
