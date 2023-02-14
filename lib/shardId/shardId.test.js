/* eslint-env mocha */

// mocha imports
import chai from 'chai';
chai.should();

// subject imports
import { shardId } from './shardId.js';

describe('shardId', function () {
  it('returns default', function () {
    const output = shardId();

    output.should.equal('nil');
  });

  it('returns input', function () {
    const input = 'bar';
    const output = shardId(input);

    output.should.equal(input);
  });
});
