import { setTimeout } from 'timers/promises';

import { Logger } from '@karmaniverous/edge-logger';
const logger = new Logger({ maxLevel: 'debug' });

import { sn2e, sn2u } from '@karmaniverous/tagged-templates';
import _ from 'lodash';

/* eslint-env mocha */

// mocha imports
import chai from 'chai';
const expect = chai.expect;

// subject imports
import { EntityManager } from './EntityManager.js';

const now = Date.now();
const defaultConfig = {
  entities: {
    transaction: {
      indexes: {
        entity: ['entityPK', 'entitySK'],
        merchant: ['merchantPK', 'merchantSK'],
        method: ['methodPK', 'methodSK'],
        user: ['userPK', 'userSK'],
      },
      keys: {
        // (item) => <string expression>
        entityPK: ({ shardId }) => `transaction!${sn2e`${shardId}`}`,

        entitySK: ({ timestamp, transactionId }) =>
          sn2u`timestamp#${timestamp}|transactionId#${transactionId}`,

        merchantPK: ({ merchantId, shardId }) =>
          sn2u`merchantId#${merchantId}|transaction${sn2e`!${shardId}`}`,

        merchantSK: ({ methodId, timestamp, transactionId }) =>
          sn2u`timestamp#${timestamp}|methodId#${methodId}|transactionId#${transactionId}`,

        methodPK: ({ methodId, shardId }) =>
          sn2u`method#${methodId}|transaction${sn2e`!${shardId}`}`,

        methodSK: ({ merchantId, timestamp, transactionId }) =>
          sn2u`timestamp#${timestamp}|merchantId#${merchantId}|transactionId#${transactionId}`,

        userPK: {
          encode: ({ shardId, userId }) =>
            sn2u`user#${userId}|transaction${sn2e`!${shardId}`}`,
          decode: (value = '') =>
            value.match(/^user#(?<userId>.*)\|transaction!(?<shardId>.*)$/)
              .groups,
        },

        userSK: {
          encode: ({ merchantId, timestamp, transactionId }) =>
            sn2u`timestamp#${timestamp}|merchantId#${merchantId}|transactionId#${transactionId}`,
          decode: (value = '') =>
            value.match(
              /^timestamp#(?<timestamp>.*)\|merchantId#(?<merchantId>.*)\|transactionId#(?<transactionId>.*)$/
            ).groups,
        },
      },
      sharding: {
        bumps: { [now]: 1 },
        entityKey: ({ transactionId }) => transactionId,
        nibbles: 0,
        nibbleBits: 4,
        timestamp: ({ timestamp }) => timestamp,
      },
    },
  },
  shardKeyToken: 'shardId',
};

let config;

describe('EntityManager', function () {
  beforeEach(function () {
    config = _.cloneDeep(defaultConfig);
  });

  describe('constructor', function () {
    it('should create a new EntityManager', function () {
      expect(new EntityManager({ config, logger })).to.be.an.instanceOf(
        EntityManager
      );
    });

    it('should fail if an entity key is not a function or nil', function () {
      config.entities.transaction.keys.foo = 'not a function';
      expect(() => new EntityManager({ config, logger })).to.throw();
    });
  });

  describe('methods', function () {
    let entityManager;

    beforeEach(function () {
      entityManager = new EntityManager({ config, logger });
    });

    describe('addKeys', function () {
      it('should add unsharded keys to an item', function () {
        const item = {
          methodId: 'methodIdValue',
          merchantId: 'merchantIdValue',
          timestamp: now - 1000,
          transactionId: 'transactionIdValue',
          userId: 'userIdValue',
        };

        const newItem = entityManager.addKeys('transaction', item);

        expect(newItem).to.deep.equal({
          methodId: 'methodIdValue',
          merchantId: 'merchantIdValue',
          timestamp: now - 1000,
          transactionId: 'transactionIdValue',
          userId: 'userIdValue',
          entityPK: 'transaction!',
          entitySK: `timestamp#${now - 1000}|transactionId#transactionIdValue`,
          merchantPK: 'merchantId#merchantIdValue|transaction',
          merchantSK: `timestamp#${
            now - 1000
          }|methodId#methodIdValue|transactionId#transactionIdValue`,
          methodPK: 'method#methodIdValue|transaction',
          methodSK: `timestamp#${
            now - 1000
          }|merchantId#merchantIdValue|transactionId#transactionIdValue`,
          userPK: 'user#userIdValue|transaction',
          userSK: `timestamp#${
            now - 1000
          }|merchantId#merchantIdValue|transactionId#transactionIdValue`,
        });
      });

      it('should add sharded keys to an item', function () {
        const item = {
          methodId: 'methodIdValue',
          merchantId: 'merchantIdValue',
          timestamp: now + 1000,
          transactionId: 'transactionIdValue',
          userId: 'userIdValue',
        };

        const newItem = entityManager.addKeys('transaction', item);

        expect(newItem).to.deep.equal({
          methodId: 'methodIdValue',
          merchantId: 'merchantIdValue',
          timestamp: now + 1000,
          transactionId: 'transactionIdValue',
          userId: 'userIdValue',
          shardId: '7',
          entityPK: 'transaction!7',
          entitySK: `timestamp#${now + 1000}|transactionId#transactionIdValue`,
          merchantPK: 'merchantId#merchantIdValue|transaction!7',
          merchantSK: `timestamp#${
            now + 1000
          }|methodId#methodIdValue|transactionId#transactionIdValue`,
          methodPK: 'method#methodIdValue|transaction!7',
          methodSK: `timestamp#${
            now + 1000
          }|merchantId#merchantIdValue|transactionId#transactionIdValue`,
          userPK: 'user#userIdValue|transaction!7',
          userSK: `timestamp#${
            now + 1000
          }|merchantId#merchantIdValue|transactionId#transactionIdValue`,
        });
      });

      it('should re-use existing shardId', function () {
        const item = {
          methodId: 'methodIdValue',
          merchantId: 'merchantIdValue',
          timestamp: 0,
          transactionId: 'transactionIdValue',
          userId: 'userIdValue',
          shardId: 'q',
        };

        const newItem = entityManager.addKeys('transaction', item);

        expect(newItem).to.deep.equal({
          methodId: 'methodIdValue',
          merchantId: 'merchantIdValue',
          timestamp: 0,
          transactionId: 'transactionIdValue',
          userId: 'userIdValue',
          shardId: 'q',
          entityPK: 'transaction!q',
          entitySK: 'timestamp#0|transactionId#transactionIdValue',
          merchantPK: 'merchantId#merchantIdValue|transaction!q',
          merchantSK:
            'timestamp#0|methodId#methodIdValue|transactionId#transactionIdValue',
          methodPK: 'method#methodIdValue|transaction!q',
          methodSK:
            'timestamp#0|merchantId#merchantIdValue|transactionId#transactionIdValue',
          userPK: 'user#userIdValue|transaction!q',
          userSK:
            'timestamp#0|merchantId#merchantIdValue|transactionId#transactionIdValue',
        });
      });

      it('should perform sharded overwrite', function () {
        const item = {
          methodId: 'methodIdValue',
          merchantId: 'merchantIdValue',
          timestamp: now + 1000,
          transactionId: 'transactionIdValue',
          userId: 'userIdValue',
          shardId: 'q',
          entityPK: 'transaction!q',
          entitySK: 'timestamp#0|transactionId#transactionIdValue',
          merchantPK: 'merchantId#merchantIdValue|transaction!q',
          merchantSK:
            'timestamp#0|methodId#methodIdValue|transactionId#transactionIdValue',
          methodPK: 'method#methodIdValue|transaction!q',
          methodSK:
            'timestamp#0|merchantId#merchantIdValue|transactionId#transactionIdValue',
          userPK: 'user#userIdValue|transaction!q',
          userSK:
            'timestamp#0|merchantId#merchantIdValue|transactionId#transactionIdValue',
        };

        const newItem = entityManager.addKeys('transaction', item, true);

        expect(newItem).to.deep.equal({
          methodId: 'methodIdValue',
          merchantId: 'merchantIdValue',
          timestamp: now + 1000,
          transactionId: 'transactionIdValue',
          userId: 'userIdValue',
          shardId: '7',
          entityPK: 'transaction!7',
          entitySK: `timestamp#${now + 1000}|transactionId#transactionIdValue`,
          merchantPK: 'merchantId#merchantIdValue|transaction!7',
          merchantSK: `timestamp#${
            now + 1000
          }|methodId#methodIdValue|transactionId#transactionIdValue`,
          methodPK: 'method#methodIdValue|transaction!7',
          methodSK: `timestamp#${
            now + 1000
          }|merchantId#merchantIdValue|transactionId#transactionIdValue`,
          userPK: 'user#userIdValue|transaction!7',
          userSK: `timestamp#${
            now + 1000
          }|merchantId#merchantIdValue|transactionId#transactionIdValue`,
        });
      });
    });

    describe('removeKeys', function () {
      it('should remove sharded keys from an item', function () {
        const item = {
          methodId: 'methodIdValue',
          merchantId: 'merchantIdValue',
          timestamp: now + 1000,
          transactionId: 'transactionIdValue',
          userId: 'userIdValue',
        };

        const newItem = entityManager.addKeys('transaction', item);

        const restoredItem = entityManager.removeKeys('transaction', newItem);

        expect(restoredItem).to.deep.equal(item);
      });
    });

    describe('getKeySpace', function () {
      it('should return unbumped key space for sharded key', function () {
        const item = {
          methodId: 'methodIdValue',
          merchantId: 'merchantIdValue',
          timestamp: now,
          transactionId: 'transactionIdValue',
          userId: 'userIdValue',
        };

        const result = entityManager.getKeySpace(
          'transaction',
          'userPK',
          item,
          now - 1000
        );

        expect(result).to.deep.equal(['user#userIdValue|transaction']);
      });

      it('should return bumped key space for sharded key', function () {
        const item = {
          methodId: 'methodIdValue',
          merchantId: 'merchantIdValue',
          timestamp: now,
          transactionId: 'transactionIdValue',
          userId: 'userIdValue',
        };

        const result = entityManager.getKeySpace(
          'transaction',
          'userPK',
          item,
          now + 1000
        );

        expect(result).to.deep.equal([
          'user#userIdValue|transaction',
          'user#userIdValue|transaction!0',
          'user#userIdValue|transaction!1',
          'user#userIdValue|transaction!2',
          'user#userIdValue|transaction!3',
          'user#userIdValue|transaction!4',
          'user#userIdValue|transaction!5',
          'user#userIdValue|transaction!6',
          'user#userIdValue|transaction!7',
          'user#userIdValue|transaction!8',
          'user#userIdValue|transaction!9',
          'user#userIdValue|transaction!a',
          'user#userIdValue|transaction!b',
          'user#userIdValue|transaction!c',
          'user#userIdValue|transaction!d',
          'user#userIdValue|transaction!e',
          'user#userIdValue|transaction!f',
        ]);
      });

      it('should return bumped key space for sharded PK', function () {
        const item = {
          methodId: 'methodIdValue',
          merchantId: 'merchantIdValue',
          timestamp: now,
          transactionId: 'transactionIdValue',
          userId: 'userIdValue',
        };

        const result = entityManager.getKeySpace(
          'transaction',
          'entityPK',
          item,
          now + 1000
        );

        expect(result).to.deep.equal([
          'transaction!',
          'transaction!0',
          'transaction!1',
          'transaction!2',
          'transaction!3',
          'transaction!4',
          'transaction!5',
          'transaction!6',
          'transaction!7',
          'transaction!8',
          'transaction!9',
          'transaction!a',
          'transaction!b',
          'transaction!c',
          'transaction!d',
          'transaction!e',
          'transaction!f',
        ]);
      });

      it('should return key space for unsharded key', function () {
        const item = {
          methodId: 'methodIdValue',
          merchantId: 'merchantIdValue',
          timestamp: 0,
          transactionId: 'transactionIdValue',
          userId: 'userIdValue',
        };

        const result = entityManager.getKeySpace('transaction', 'userSK', item);

        expect(result).to.deep.equal([
          'timestamp#0|merchantId#merchantIdValue|transactionId#transactionIdValue',
        ]);
      });

      it('should fail for invalid keyToken', function () {
        const item = {
          methodId: 'methodIdValue',
          merchantId: 'merchantIdValue',
          timestamp: 0,
          transactionId: 'transactionIdValue',
          userId: 'userIdValue',
        };

        expect(() =>
          entityManager.getKeySpace('transaction', 'foo', item)
        ).to.throw();
      });
    });

    describe('query', function () {
      it('should query for sharded key', async function () {
        const item = {
          methodId: 'methodIdValue',
          merchantId: 'merchantIdValue',
          timestamp: now,
          transactionId: 'transactionIdValue',
          userId: 'userIdValue',
        };

        const shardQuery = async (shardedKey, { pageKey }) => {
          await setTimeout(Math.random() * 1000);

          return {
            items: [{ ...item, userPK: shardedKey }],
            pageKey: _.isUndefined(pageKey) ? '0' : undefined,
          };
        };

        entityManager.addKeys('transaction', item);

        let result = await entityManager.query(
          'transaction',
          'userPK',
          item,
          shardQuery
        );

        expect(_.size(result.pageKeys)).to.equal(17);

        result = await entityManager.query(
          'transaction',
          'userPK',
          item,
          shardQuery,
          { pageKeys: result.pageKeys }
        );

        expect(_.size(result.pageKeys)).to.equal(0);
      });
    });

    describe('dehydrateIndex', function () {
      it('should dehydrate index', function () {
        const index = {
          userPK: 'user#userIdValue|transaction!7',
          userSK: `timestamp#${now}|merchantId#merchantIdValue|transactionId#transactionIdValue`,
        };

        const result = entityManager.dehydrateIndex(
          'transaction',
          'user',
          index
        );

        expect(result).to.equal(
          `merchantIdValue~7~${now}~transactionIdValue~userIdValue`
        );
      });
    });

    describe('rehydrateIndex', function () {
      it('should rehydrate index', function () {
        const value = `merchantIdValue~7~${now}~transactionIdValue~userIdValue`;

        const result = entityManager.rehydrateIndex(
          'transaction',
          'user',
          value
        );

        expect(result).to.deep.equal({
          userPK: 'user#userIdValue|transaction!7',
          userSK: `timestamp#${now}|merchantId#merchantIdValue|transactionId#transactionIdValue`,
        });
      });
    });
  });
});
