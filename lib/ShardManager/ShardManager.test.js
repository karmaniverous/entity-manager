/* eslint-env mocha */

// mocha imports
import chai from 'chai';
const expect = chai.expect;

// subject imports
import { ShardManager } from './ShardManager.js';

describe('ShardManager', function () {
  describe('constructor', function () {
    it('should create a new ShardManager', function () {
      const shardManager = new ShardManager();
      expect(shardManager).to.be.an.instanceof(ShardManager);
    });
  });

  describe('config', function () {
    it('should return config', function () {
      const config = { foo: {} };
      const shardManager = new ShardManager({ config });
      expect(shardManager.config).to.deep.equal(config);
    });

    it('should allow no config', function () {
      expect(new ShardManager()).not.to.throw;
    });

    it('should fail on invalid entity key', function () {
      const config = { 'foo-bar': {} };
      expect(new ShardManager({ config })).to.throw;
    });

    it('should fail on invalid entity property', function () {
      const config = { foo: { bar: 'baz' } };
      expect(new ShardManager({ config })).to.throw;
    });

    it('should fail on invalid entity nibbles value type', function () {
      const config = { foo: { nibbles: 'baz' } };
      expect(new ShardManager({ config })).to.throw;
    });

    it('should fail on negative entity nibbles value', function () {
      const config = { foo: { nibbles: -1 } };
      expect(new ShardManager({ config })).to.throw;
    });

    it('should fail on invalid entity bumps type', function () {
      const config = { foo: { bumps: 'bar' } };
      expect(new ShardManager({ config })).to.throw;
    });

    it('should fail on invalid entity bumps property', function () {
      const config = { foo: { bumps: { bar: 1 } } };
      expect(new ShardManager({ config })).to.throw;
    });
  });
});
