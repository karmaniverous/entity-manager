import { n2e, sn2e, sn2u } from '@karmaniverous/string-utilities';

import { RawConfig } from '../src';

export const now = Date.now();
export const day = 24 * 60 * 60 * 1000;

export const config: RawConfig = {
  entities: {
    user: {
      defaultLimit: 2,
      defaultPageSize: 2,
      indexes: {
        firstName: ['entityPK', 'entitySK', 'firstNameSK'],
        lastName: ['entityPK', 'entitySK', 'lastNameSK'],
      },
      keys: {
        created: {
          encode: ({ created }) => Number(created),
          decode: (value: number) => ({ created: value.toString() }),
          retain: true,
        },

        entityPK: {
          elements: ['entity', 'shardKey'],
          encode: ({ entity, shardKey }) => n2e`${entity}!${shardKey}`,
          decode: (value: string) =>
            /^(?<entity>.*)!(?<shardKey>.*)$/.exec(value)?.groups,
        },

        entitySK: {
          elements: ['userId'],
          encode: ({ userId }) => sn2u`userId#${userId}`,
          decode: (value: string) =>
            /^userId#(?<userId>.*)$/.exec(value)?.groups,
        },

        firstNameCanonical: {
          retain: true,
        },

        firstNameSK: {
          elements: ['firstNameCanonical', 'lastNameCanonical'],
          encode: ({ firstNameCanonical, lastNameCanonical }) =>
            sn2u`firstNameCanonical#${firstNameCanonical}${sn2e`|lastNameCanonical#${lastNameCanonical}`}`,
          decode: (value: string) =>
            /^firstNameCanonical#(?<firstNameCanonical>.*?)(?:\|lastNameCanonical#(?<lastNameCanonical>.*))?$/.exec(
              value,
            )?.groups,
        },

        lastNameCanonical: {
          retain: true,
        },

        lastNameSK: {
          elements: ['firstNameCanonical', 'lastNameCanonical'],
          encode: ({ firstNameCanonical, lastNameCanonical }) =>
            sn2u`lastNameCanonical#${lastNameCanonical}${sn2e`|firstNameCanonical#${firstNameCanonical}`}`,
          decode: (value: string) =>
            /^lastNameCanonical#(?<lastNameCanonical>.*?)(?:\|firstNameCanonical#(?<firstNameCanonical>.*))?$/.exec(
              value,
            )?.groups,
        },

        userId: {
          retain: true,
        },
      },
      sharding: {
        bumps: [
          { timestamp: now + day, nibbleBits: 2, nibbles: 1 },
          { timestamp: now + day * 2, nibbleBits: 2, nibbles: 2 },
        ],
        entityKey: ({ userId }) => userId as string,
        timestamp: ({ created }) => created as number,
      },
    },
  },
};
