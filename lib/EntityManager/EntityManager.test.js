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
      keys: {
        // (item) => <string expression>
        primaryPK: ({ shardId }) => `transaction${sn2e`!${shardId}`}`,

        primarySK: ({ timestamp, transactionId }) =>
          sn2u`timestamp#${timestamp}|transactionId#${transactionId}`,

        merchantPK: ({ merchantId, shardId }) =>
          sn2u`merchantId#${merchantId}|transaction${sn2e`!${shardId}`}`,

        merchantSK: ({ methodId, timestamp, transactionId }) =>
          sn2u`timestamp#${timestamp}|methodId#${methodId}|transactionId#${transactionId}`,

        methodPK: ({ methodId, shardId }) =>
          sn2u`method#${methodId}|transaction${sn2e`!${shardId}`}`,

        methodSK: ({ merchantId, timestamp, transactionId }) =>
          sn2u`timestamp#${timestamp}|merchantId#${merchantId}|transactionId#${transactionId}`,

        userPK: ({ shardId, userId }) =>
          sn2u`user#${userId}|transaction${sn2e`!${shardId}`}`,

        userSK: ({ merchantId, timestamp, transactionId }) =>
          `timestamp#${timestamp}|merchantId#${merchantId}|transactionId#${transactionId}`,
      },
      sharding: {
        bumps: { [now]: 1 },
        entityKey: ({ transactionId }) => transactionId,
        nibbles: 0,
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

        entityManager.addKeys('transaction', item);

        expect(item).to.deep.equal({
          methodId: 'methodIdValue',
          merchantId: 'merchantIdValue',
          timestamp: now - 1000,
          transactionId: 'transactionIdValue',
          userId: 'userIdValue',
          shardId: undefined,
          primaryPK: 'transaction',
          primarySK: `timestamp#${now - 1000}|transactionId#transactionIdValue`,
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

        entityManager.addKeys('transaction', item);

        expect(item).to.deep.equal({
          methodId: 'methodIdValue',
          merchantId: 'merchantIdValue',
          timestamp: now + 1000,
          transactionId: 'transactionIdValue',
          userId: 'userIdValue',
          shardId: '2',
          primaryPK: 'transaction!2',
          primarySK: `timestamp#${now + 1000}|transactionId#transactionIdValue`,
          merchantPK: 'merchantId#merchantIdValue|transaction!2',
          merchantSK: `timestamp#${
            now + 1000
          }|methodId#methodIdValue|transactionId#transactionIdValue`,
          methodPK: 'method#methodIdValue|transaction!2',
          methodSK: `timestamp#${
            now + 1000
          }|merchantId#merchantIdValue|transactionId#transactionIdValue`,
          userPK: 'user#userIdValue|transaction!2',
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

        entityManager.addKeys('transaction', item);

        expect(item).to.deep.equal({
          methodId: 'methodIdValue',
          merchantId: 'merchantIdValue',
          timestamp: 0,
          transactionId: 'transactionIdValue',
          userId: 'userIdValue',
          shardId: 'q',
          primaryPK: 'transaction!q',
          primarySK: 'timestamp#0|transactionId#transactionIdValue',
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
          primaryPK: 'transaction!q',
          primarySK: 'timestamp#0|transactionId#transactionIdValue',
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

        entityManager.addKeys('transaction', item, true);

        expect(item).to.deep.equal({
          methodId: 'methodIdValue',
          merchantId: 'merchantIdValue',
          timestamp: now + 1000,
          transactionId: 'transactionIdValue',
          userId: 'userIdValue',
          shardId: '2',
          primaryPK: 'transaction!2',
          primarySK: `timestamp#${now + 1000}|transactionId#transactionIdValue`,
          merchantPK: 'merchantId#merchantIdValue|transaction!2',
          merchantSK: `timestamp#${
            now + 1000
          }|methodId#methodIdValue|transactionId#transactionIdValue`,
          methodPK: 'method#methodIdValue|transaction!2',
          methodSK: `timestamp#${
            now + 1000
          }|merchantId#merchantIdValue|transactionId#transactionIdValue`,
          userPK: 'user#userIdValue|transaction!2',
          userSK: `timestamp#${
            now + 1000
          }|merchantId#merchantIdValue|transactionId#transactionIdValue`,
        });
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
          item,
          'userPK',
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
          item,
          'userPK',
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

      it('should return key space for unsharded key', function () {
        const item = {
          methodId: 'methodIdValue',
          merchantId: 'merchantIdValue',
          timestamp: 0,
          transactionId: 'transactionIdValue',
          userId: 'userIdValue',
        };

        const result = entityManager.getKeySpace('transaction', item, 'userSK');

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
          entityManager.getKeySpace('transaction', item, 'foo')
        ).to.throw();
      });
    });
  });
});
