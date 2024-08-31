/* eslint-env mocha */

import { n2e, sn2u } from '@karmaniverous/string-utilities';
import { expect } from 'chai';
import { pick } from 'radash';
import { setTimeout } from 'timers/promises';
import { inspect } from 'util';

import { type RawConfig } from './Config';
import {
  EntityManager,
  type QueryOptions,
  type ShardQueryFunction,
} from './EntityManager';
import { type EntityIndexItem, type EntityItem } from './util';

const now = Date.now();

const defaultConfig: RawConfig = {
  entities: {
    txn: {
      defaultLimit: 10,
      defaultPageSize: 10,
      indexes: {
        created: ['entityPK', 'entitySK', 'created'],
        updated: ['entityPK', 'entitySK', 'updated'],
        txnBeneficiaryCreated: [
          'entityPK',
          'entitySK',
          'txnBeneficiaryPK',
          'created',
        ],
        txnBeneficiaryUpdated: [
          'entityPK',
          'entitySK',
          'txnBeneficiaryPK',
          'updated',
        ],
        txnGroupCreated: ['entityPK', 'entitySK', 'txnGroupPK', 'created'],
        txnGroupUpdated: ['entityPK', 'entitySK', 'txnGroupPK', 'updated'],
        txnMerchantCreated: [
          'entityPK',
          'entitySK',
          'txnMerchantPK',
          'created',
        ],
        txnMerchantUpdated: [
          'entityPK',
          'entitySK',
          'txnMerchantPK',
          'updated',
        ],
        txnMethodCreated: ['entityPK', 'entitySK', 'txnMethodPK', 'created'],
        txnMethodUpdated: ['entityPK', 'entitySK', 'txnMethodPK', 'updated'],
        txnOfferCreated: ['entityPK', 'entitySK', 'txnOfferPK', 'created'],
        txnOfferUpdated: ['entityPK', 'entitySK', 'txnOfferPK', 'updated'],
        txnStoreCreated: ['entityPK', 'entitySK', 'txnStorePK', 'created'],
        txnStoreUpdated: ['entityPK', 'entitySK', 'txnStorePK', 'updated'],
        txnUserCreated: ['entityPK', 'entitySK', 'txnUserPK', 'created'],
        txnUserUpdated: ['entityPK', 'entitySK', 'txnUserPK', 'updated'],
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
          elements: ['txnId'],
          encode: ({ txnId }) => sn2u`txnId#${txnId}`,
          decode: (value: string) => /^txnId#(?<txnId>.*)$/.exec(value)?.groups,
        },

        txnBeneficiaryPK: {
          elements: ['entity', 'beneficiaryId', 'shardKey'],
          encode: ({ entity, beneficiaryId, shardKey }) =>
            sn2u`${n2e`${entity}!${shardKey}`}|beneficiaryId#${beneficiaryId}`,
          decode: (value: string) =>
            /^(?<entity>.*)!(?<shardKey>.*)\|beneficiaryId#(?<beneficiaryId>.*)$/.exec(
              value,
            )?.groups,
        },

        txnGroupPK: {
          elements: ['entity', 'groupId', 'shardKey'],
          encode: ({ entity, groupId, shardKey }) =>
            sn2u`${n2e`${entity}!${shardKey}`}|groupId#${groupId}`,
          decode: (value: string) =>
            /^(?<entity>.*)!(?<shardKey>.*)\|groupId#(?<groupId>.*)$/.exec(
              value,
            )?.groups,
        },

        txnMerchantPK: {
          elements: ['entity', 'merchantId', 'shardKey'],
          encode: ({ entity, merchantId, shardKey }) =>
            sn2u`${n2e`${entity}!${shardKey}`}|merchantId#${merchantId}`,
          decode: (value: string) =>
            /^(?<entity>.*)!(?<shardKey>.*)\|merchantId#(?<merchantId>.*)$/.exec(
              value,
            )?.groups,
        },

        txnMethodPK: {
          elements: ['entity', 'methodId', 'shardKey'],
          encode: ({ entity, methodId, shardKey }) =>
            sn2u`${n2e`${entity}!${shardKey}`}|methodId#${methodId}`,
          decode: (value: string) =>
            /^(?<entity>.*)!(?<shardKey>.*)\|methodId#(?<methodId>.*)$/.exec(
              value,
            )?.groups,
        },

        txnOfferPK: {
          elements: ['entity', 'offerId', 'shardKey'],
          encode: ({ entity, offerId, shardKey }) =>
            sn2u`${n2e`${entity}!${shardKey}`}|offerId#${offerId}`,
          decode: (value: string) =>
            /^(?<entity>.*)!(?<shardKey>.*)\|offerId#(?<offerId>.*)$/.exec(
              value,
            )?.groups,
        },

        txnStorePK: {
          elements: ['entity', 'storeId', 'shardKey'],
          encode: ({ entity, storeId, shardKey }) =>
            sn2u`${n2e`${entity}!${shardKey}`}|storeId#${storeId}`,
          decode: (value: string) =>
            /^(?<entity>.*)!(?<shardKey>.*)\|storeId#(?<storeId>.*)$/.exec(
              value,
            )?.groups,
        },

        txnUserPK: {
          elements: ['entity', 'userId', 'shardKey'],
          encode: ({ entity, userId, shardKey }) =>
            sn2u`${n2e`${entity}!${shardKey}`}|userId#${userId}`,
          decode: (value: string) =>
            /^(?<entity>.*)!(?<shardKey>.*)\|userId#(?<userId>.*)$/.exec(value)
              ?.groups,
        },

        updated: {
          encode: ({ updated }) => Number(updated),
          decode: (value: number) => ({ updated: value.toString() }),
          retain: true,
        },
      },
      sharding: {
        bumps: [{ timestamp: now + 1, nibbleBits: 2, nibbles: 1 }],
        entityKey: ({ txnId }) => txnId as string,
        timestamp: ({ created }) => created as number,
      },
    },
  },
};

const entity = 'txn';

let entityManager: EntityManager;
let item: EntityItem;
let shardQuery: ShardQueryFunction;

describe('EntityManager', function () {
  beforeEach(function () {
    entityManager = new EntityManager({
      config: defaultConfig,
      logger: {
        ...console,
        debug: (...args: unknown[]) => {
          console.debug(...args.map((arg) => inspect(arg, false, null)));
        },
      },
    });
  });

  describe('addKeys', function () {
    it('should add unsharded keys to item', function () {
      item = {
        created: now,
        merchantId: 'merchantIdValue',
        methodId: 'methodIdValue',
        txnId: 'txnIdValue',
        updated: now,
        userId: 'userIdValue',
      };

      const newItem = entityManager.addKeys(entity, item);

      expect(newItem).to.deep.equal({
        created: item.created,
        entityPK: `${entity}!`,
        entitySK: `txnId#${item.txnId as string}`,
        merchantId: item.merchantId,
        methodId: item.methodId,
        txnId: item.txnId,
        txnMerchantPK: `${entity}!|merchantId#${item.merchantId as string}`,
        txnMethodPK: `${entity}!|methodId#${item.methodId as string}`,
        txnUserPK: `${entity}!|userId#${item.userId as string}`,
        updated: item.updated,
        userId: item.userId,
      });
    });

    it('should add sharded keys to item', function () {
      item = {
        created: now + 2,
        merchantId: 'merchantIdValue',
        methodId: 'methodIdValue',
        txnId: 'txnIdValue',
        updated: now + 2,
        userId: 'userIdValue',
      };

      const newItem = entityManager.addKeys(entity, item);

      expect(newItem).to.deep.equal({
        created: item.created,
        entityPK: `${entity}!1`,
        entitySK: `txnId#${item.txnId as string}`,
        merchantId: item.merchantId,
        methodId: item.methodId,
        shardKey: '1',
        txnId: item.txnId,
        txnMerchantPK: `${entity}!1|merchantId#${item.merchantId as string}`,
        txnMethodPK: `${entity}!1|methodId#${item.methodId as string}`,
        txnUserPK: `${entity}!1|userId#${item.userId as string}`,
        updated: item.updated,
        userId: item.userId,
      });
    });

    it('should re-use existing shardKey', function () {
      item = {
        created: now + 2,
        merchantId: 'merchantIdValue',
        methodId: 'methodIdValue',
        shardKey: 'q',
        txnId: 'txnIdValue',
        updated: now + 2,
        userId: 'userIdValue',
      };

      const newItem = entityManager.addKeys(entity, item);

      expect(newItem).to.deep.equal({
        created: item.created,
        entityPK: `${entity}!q`,
        entitySK: `txnId#${item.txnId as string}`,
        merchantId: item.merchantId,
        methodId: item.methodId,
        shardKey: 'q',
        txnId: item.txnId,
        txnMerchantPK: `${entity}!q|merchantId#${item.merchantId as string}`,
        txnMethodPK: `${entity}!q|methodId#${item.methodId as string}`,
        txnUserPK: `${entity}!q|userId#${item.userId as string}`,
        updated: item.updated,
        userId: item.userId,
      });
    });

    it('should perform sharded overwrite', function () {
      item = {
        created: now + 2,
        merchantId: 'merchantIdValue',
        methodId: 'methodIdValue',
        shardKey: 'q',
        txnId: 'txnIdValue',
        updated: now + 2,
        userId: 'userIdValue',
        entityPK: 'txn!q',
        entitySK: 'txnId#txnIdValue',
        txnMerchantPK: 'txn!q|merchantId#merchantIdValue',
        txnMethodPK: 'txn!q|methodId#methodIdValue',
        txnUserPK: 'txn!q|userId#userIdValue',
      };

      const newItem = entityManager.addKeys(entity, item, true);

      expect(newItem).to.deep.equal({
        created: item.created,
        entityPK: `${entity}!1`,
        entitySK: `txnId#${item.txnId as string}`,
        merchantId: item.merchantId,
        methodId: item.methodId,
        shardKey: '1',
        txnId: item.txnId,
        txnMerchantPK: `${entity}!1|merchantId#${item.merchantId as string}`,
        txnMethodPK: `${entity}!1|methodId#${item.methodId as string}`,
        txnUserPK: `${entity}!1|userId#${item.userId as string}`,
        updated: item.updated,
        userId: item.userId,
      });
    });
  });

  describe('removeKeys', function () {
    it('should remove sharded keys from an item', function () {
      item = {
        created: now + 2,
        merchantId: 'merchantIdValue',
        methodId: 'methodIdValue',
        txnId: 'txnIdValue',
        updated: now + 2,
        userId: 'userIdValue',
      };

      const newItem = entityManager.addKeys(entity, item);

      const restoredItem = entityManager.removeKeys(entity, newItem);

      expect(restoredItem).to.deep.equal(item);
    });
  });

  describe('getKeySpace', function () {
    it('should return unsharded key space', function () {
      item = {
        userId: 'userIdValue',
      };

      const result = entityManager.getKeySpace(
        'txn',
        'txnUserPK',
        item,
        0,
        now,
      );

      expect(result).to.deep.equal(['txn!|userId#userIdValue']);
    });

    it('should return sharded key space', function () {
      item = {
        userId: 'userIdValue',
      };

      const result = entityManager.getKeySpace(
        'txn',
        'txnUserPK',
        item,
        0,
        now + 2,
      );

      expect(result).to.deep.equal([
        'txn!|userId#userIdValue',
        'txn!0|userId#userIdValue',
        'txn!1|userId#userIdValue',
        'txn!2|userId#userIdValue',
        'txn!3|userId#userIdValue',
      ]);
    });
  });

  describe('dehydrateIndex', function () {
    it('should dehydrate index', function () {
      item = entityManager.addKeys(entity, {
        created: now + 2,
        merchantId: 'merchantIdValue',
        methodId: 'methodIdValue',
        txnId: 'txnIdValue',
        updated: now + 2,
        userId: 'userIdValue',
      });

      const result = entityManager.dehydrateIndex(
        'txn',
        'txnUserCreated',
        item,
      );

      expect(result).to.equal(
        n2e`${item.created}~${entity}~${item.shardKey}~${item.txnId}~${item.userId}`,
      );
    });
  });

  describe('query', function () {
    beforeEach(function () {
      item = entityManager.addKeys(entity, {
        created: now,
        merchantId: 'merchantIdValue',
        methodId: 'methodIdValue',
        txnId: 'txnIdValue',
        updated: now,
        userId: 'userIdValue',
      });

      shardQuery = async (shardedKey, pageKey) => {
        await setTimeout(100);

        return {
          count: 1,
          items: [{ ...item, txnUserPK: shardedKey }],
          pageKey:
            pageKey === undefined
              ? (pick(
                  item,
                  entityManager.config.entities.txn.indexes.txnUserCreated,
                ) as EntityIndexItem)
              : undefined,
        };
      };
    });

    it('should query for unsharded key', async function () {
      const queryOptions: QueryOptions = {
        entityToken: 'txn',
        keyToken: 'txnUserPK',
        item,
        limit: 1,
        shardQuery,
        pageSize: 1,
        timestampTo: now,
      };

      let result = await entityManager.query(queryOptions);

      expect(Object.keys(result.pageKeys).length).to.equal(1);

      result = await entityManager.query({
        ...queryOptions,
        pageKeys: result.pageKeys,
      });

      expect(Object.keys(result.pageKeys).length).to.equal(0);
    });

    it('should query for sharded key', async function () {
      const queryOptions: QueryOptions = {
        entityToken: 'txn',
        keyToken: 'txnUserPK',
        item,
        limit: 1,
        shardQuery,
        pageSize: 1,
        timestampFrom: 0,
        timestampTo: now + 2,
      };

      let result = await entityManager.query(queryOptions);

      expect(Object.keys(result.pageKeys).length).to.equal(5);

      result = await entityManager.query({
        ...queryOptions,
        pageKeys: result.pageKeys,
      });

      expect(Object.keys(result.pageKeys).length).to.equal(0);
    });
  });

  describe('rehydrateIndex', function () {
    it('should dehydrate index', function () {
      item = entityManager.addKeys(entity, {
        created: now + 2,
        merchantId: 'merchantIdValue',
        methodId: 'methodIdValue',
        txnId: 'txnIdValue',
        updated: now + 2,
        userId: 'userIdValue',
      });

      const dehydrated = entityManager.dehydrateIndex(
        'txn',
        'txnUserCreated',
        item,
      );

      const rehydrated = entityManager.rehydrateIndex(
        entity,
        'txnUserCreated',
        dehydrated,
      );

      expect(rehydrated).to.deep.equal(
        pick(item, entityManager.config.entities.txn.indexes.txnUserCreated),
      );
    });
  });
});
