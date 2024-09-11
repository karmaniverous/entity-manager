/* eslint-env mocha */

import { expect } from 'chai';

import type { Config } from './Config';
import { configSchema } from './ParsedConfig';

describe('Config', function () {
  it('should apply config defaults', function () {
    const config: Config = {};

    const parsedConfig = configSchema.parse(config);

    expect(parsedConfig).to.deep.equal({
      entities: {},
      hashKey: 'hashKey',
      uniqueKey: 'uniqueKey',
    });
  });

  it('should apply entity defaults', function () {
    interface EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<EntityMap> = {
      entities: {
        foo: {
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      uniqueKey: 'uniqueKey',
    };

    const parsedConfig = configSchema.parse(config);

    expect(parsedConfig.entities.foo).to.deep.include({
      defaultLimit: 10,
      defaultPageSize: 10,
      generated: {},
      indexes: {},
      shardBumps: [{ timestamp: 0, nibbles: 0, nibbleBits: 1 }],
    });
  });

  it('should fail when entity index is empty', function () {
    interface EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<EntityMap> = {
      entities: {
        foo: {
          indexes: { id: [] },
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      uniqueKey: 'uniqueKey',
    };

    expect(() => configSchema.parse(config)).to.throw('too_small');
  });

  it('should fail when entity index contains dupes', function () {
    interface EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<EntityMap> = {
      entities: {
        foo: {
          indexes: { id: ['bar', 'bar'] },
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      uniqueKey: 'uniqueKey',
    };

    expect(() => configSchema.parse(config)).to.throw(
      "duplicate array element 'bar'",
    );
  });

  it('should fail when entity generated elements is empty', function () {
    interface EntityMap {
      foo: { bar: string; baz: number; boo: never };
    }

    const config: Config<EntityMap> = {
      entities: {
        foo: {
          generated: {
            boo: { elements: [] },
          },
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      uniqueKey: 'uniqueKey',
    };

    expect(() => configSchema.parse(config)).to.throw('too_small');
  });

  it('should fail when entity generated elements contains dupes', function () {
    interface EntityMap {
      foo: { bar: string; baz: number; boo: never };
    }

    const config: Config<EntityMap> = {
      entities: {
        foo: {
          generated: {
            boo: { elements: ['bar', 'bar'] },
          },
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      uniqueKey: 'uniqueKey',
    };

    expect(() => configSchema.parse(config)).to.throw(
      "duplicate array element 'bar'",
    );
  });

  it('should fail on negative entity sharding bump nibbles value', function () {
    interface EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<EntityMap> = {
      entities: {
        foo: {
          shardBumps: [{ timestamp: 0, nibbles: -1, nibbleBits: 1 }],
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      uniqueKey: 'uniqueKey',
    };

    expect(() => configSchema.parse(config)).to.throw(
      'Number must be greater than or equal to 0',
    );
  });

  it('should fail on entity sharding bump nibbles value over 40', function () {
    interface EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<EntityMap> = {
      entities: {
        foo: {
          shardBumps: [{ timestamp: 0, nibbles: 41, nibbleBits: 1 }],
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      uniqueKey: 'uniqueKey',
    };

    expect(() => configSchema.parse(config)).to.throw(
      'Number must be less than or equal to 40',
    );
  });

  it('should fail when entity sharding bumps contain duplicate timestamp', function () {
    interface EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<EntityMap> = {
      entities: {
        foo: {
          shardBumps: [
            { timestamp: 0, nibbles: 0, nibbleBits: 1 },
            { timestamp: 0, nibbles: 1, nibbleBits: 1 },
          ],
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      uniqueKey: 'uniqueKey',
    };

    expect(() => configSchema.parse(config)).to.throw(
      'duplicate array element',
    );
  });

  it('should add missing entity sharding bumps zero-timestamp bump', function () {
    interface EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<EntityMap> = {
      entities: {
        foo: {
          shardBumps: [{ timestamp: 1, nibbles: 1, nibbleBits: 1 }],
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      uniqueKey: 'uniqueKey',
    };

    const parsedConfig = configSchema.parse(config);

    expect(parsedConfig.entities.foo.shardBumps[0]).to.deep.equal({
      timestamp: 0,
      nibbles: 0,
      nibbleBits: 1,
    });
  });

  it('should sort entity sharding bumps by timestamp', function () {
    interface EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<EntityMap> = {
      entities: {
        foo: {
          shardBumps: [
            { timestamp: 2, nibbleBits: 1, nibbles: 2 },
            { timestamp: 1, nibbleBits: 1, nibbles: 1 },
          ],
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      uniqueKey: 'uniqueKey',
    };

    const parsedConfig = configSchema.parse(config);

    expect(parsedConfig.entities.foo.shardBumps).to.deep.equal([
      { timestamp: 0, nibbleBits: 1, nibbles: 0 },
      { timestamp: 1, nibbleBits: 1, nibbles: 1 },
      { timestamp: 2, nibbleBits: 1, nibbles: 2 },
    ]);
  });

  it('should fail when entity sharding bumps nibbles do not increase monotonically with timestamp', function () {
    interface EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<EntityMap> = {
      entities: {
        foo: {
          shardBumps: [
            { timestamp: 1, nibbleBits: 1, nibbles: 1 },
            { timestamp: 2, nibbleBits: 1, nibbles: 1 },
          ],
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      uniqueKey: 'uniqueKey',
    };

    expect(() => configSchema.parse(config)).to.throw(
      'shardBump nibbles do not monotonically increase at timestamp',
    );
  });

  it('should keep configured zero-timestamp bump', function () {
    interface EntityMap {
      foo: { bar: string; baz: number };
    }

    const config: Config<EntityMap> = {
      entities: {
        foo: {
          shardBumps: [
            { timestamp: 2, nibbleBits: 1, nibbles: 2 },
            { timestamp: 1, nibbleBits: 1, nibbles: 1 },
            { timestamp: 0, nibbleBits: 1, nibbles: 0 },
          ],
          timestampProperty: 'baz',
          uniqueProperty: 'bar',
        },
      },
      hashKey: 'hashKey',
      uniqueKey: 'uniqueKey',
    };

    const parsedConfig = configSchema.parse(config);

    expect(parsedConfig.entities.foo.shardBumps).to.deep.equal([
      { timestamp: 0, nibbleBits: 1, nibbles: 0 },
      { timestamp: 1, nibbleBits: 1, nibbles: 1 },
      { timestamp: 2, nibbleBits: 1, nibbles: 2 },
    ]);
  });
});
