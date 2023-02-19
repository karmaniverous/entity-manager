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
        nibbles: 1,
        source: ({ transactionId }) => transactionId,
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
});
