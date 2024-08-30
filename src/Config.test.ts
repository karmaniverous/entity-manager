/* eslint-env mocha */

import { expect } from 'chai';

import { configSchema, type RawConfig } from './Config';

describe('Config', function () {
  it('should apply config defaults', function () {
    const rawConfig: RawConfig = {};

    const parsedConfig = configSchema.parse(rawConfig);

    expect(parsedConfig).to.deep.equal({
      entities: {},
      tokens: {
        entity: 'entity',
        entityKey: 'entityKey',
        shardKey: 'shardKey',
      },
    });
  });

  it('should apply entity defaults', function () {
    const rawConfig: RawConfig = {
      entities: {
        foo: {},
      },
    };

    const parsedConfig = configSchema.parse(rawConfig);

    expect(parsedConfig.entities.foo).to.deep.include({
      defaultLimit: 10,
      defaultPageSize: 10,
      sharding: {
        bumps: [{ timestamp: 0, nibbles: 0, nibbleBits: 1 }],
      },
    });
  });

  it('should fail when entity index contains dupes', function () {
    const rawConfig: RawConfig = {
      entities: {
        foo: {
          indexes: { id: ['bar', 'bar'] },
          keys: { bar: {} },
        },
      },
    };

    expect(() => configSchema.parse(rawConfig)).to.throw(
      'index id has duplicate element bar',
    );
  });

  it('should fail when entity index contains unknown element', function () {
    const rawConfig: RawConfig = {
      entities: {
        foo: {
          indexes: { id: ['bar', 'baz'] },
          keys: { bar: {} },
        },
      },
    };

    expect(() => configSchema.parse(rawConfig)).to.throw(
      'index id element baz is not a valid entity foo key',
    );
  });

  it('should apply entity key defaults', function () {
    const rawConfig: RawConfig = {
      entities: {
        foo: { keys: { bar: {} } },
      },
    };

    const parsedConfig = configSchema.parse(rawConfig);

    expect(parsedConfig.entities.foo.keys.bar.elements).to.deep.equal(['bar']);
  });

  it('should fail when entity key elements contain dupes', function () {
    const rawConfig: RawConfig = {
      entities: {
        foo: {
          keys: {
            bar: {
              elements: ['baz', 'baz'],
            },
          },
        },
      },
    };

    expect(() => configSchema.parse(rawConfig)).to.throw(
      'entity foo key bar has duplicate element baz',
    );
  });

  it('should apply entity sharding defaults', function () {
    const rawConfig: RawConfig = {
      entities: {
        foo: {
          sharding: {},
        },
      },
    };

    const parsedConfig = configSchema.parse(rawConfig);

    expect(parsedConfig.entities.foo.sharding).to.deep.include({
      bumps: [{ timestamp: 0, nibbles: 0, nibbleBits: 1 }],
    });
  });

  it('should apply entity sharding bumps defaults', function () {
    const rawConfig: RawConfig = {
      entities: {
        foo: {
          sharding: {
            bumps: [{ timestamp: 0, nibbles: 0, nibbleBits: 1 }],
          },
        },
      },
    };

    const parsedConfig = configSchema.parse(rawConfig);

    expect(parsedConfig.entities.foo.sharding.bumps).to.deep.equal([
      { timestamp: 0, nibbles: 0, nibbleBits: 1 },
    ]);
  });

  it('should fail on negative entity sharding bump nibbles value', function () {
    const config: RawConfig = {
      entities: {
        foo: {
          sharding: {
            bumps: [{ timestamp: 0, nibbleBits: 1, nibbles: -1 }],
            entityKey: () => 'foo',
            timestamp: () => 0,
          },
        },
      },
    };

    expect(() => configSchema.parse(config)).to.throw(
      'Number must be greater than or equal to 0',
    );
  });

  it('should fail on entity sharding bump nibbles value over 40', function () {
    const config: RawConfig = {
      entities: {
        foo: {
          sharding: {
            bumps: [{ timestamp: 0, nibbleBits: 1, nibbles: 41 }],
            entityKey: () => 'foo',
            timestamp: () => 0,
          },
        },
      },
    };

    expect(() => configSchema.parse(config)).to.throw(
      'Number must be less than or equal to 40',
    );
  });

  it('should fail when entity sharding bumps contain duplicate timestamp', function () {
    const config: RawConfig = {
      entities: {
        foo: {
          sharding: {
            bumps: [
              { timestamp: 1, nibbleBits: 1, nibbles: 1 },
              { timestamp: 1, nibbleBits: 1, nibbles: 2 },
            ],
            entityKey: () => 'foo',
            timestamp: () => 0,
          },
        },
      },
    };

    expect(() => configSchema.parse(config)).to.throw(
      'entity foo sharding has duplicate bump at timestamp 1',
    );
  });

  it('should add missing entity sharding bumps zero-timestamp bump', function () {
    const rawConfig: RawConfig = {
      entities: {
        foo: {
          sharding: {
            bumps: [{ timestamp: 1, nibbleBits: 1, nibbles: 1 }],
            entityKey: () => 'foo',
            timestamp: () => 0,
          },
        },
      },
    };

    const parsedConfig = configSchema.parse(rawConfig);

    expect(parsedConfig.entities.foo.sharding.bumps[0]).to.deep.equal({
      timestamp: 0,
      nibbleBits: 1,
      nibbles: 0,
    });
  });

  it('should sort entity sharding bumps by timestamp', function () {
    const rawConfig: RawConfig = {
      entities: {
        foo: {
          sharding: {
            bumps: [
              { timestamp: 2, nibbleBits: 1, nibbles: 2 },
              { timestamp: 1, nibbleBits: 1, nibbles: 1 },
            ],
            entityKey: () => 'foo',
            timestamp: () => 0,
          },
        },
      },
    };

    const parsedConfig = configSchema.parse(rawConfig);

    expect(parsedConfig.entities.foo.sharding.bumps).to.deep.equal([
      { timestamp: 0, nibbleBits: 1, nibbles: 0 },
      { timestamp: 1, nibbleBits: 1, nibbles: 1 },
      { timestamp: 2, nibbleBits: 1, nibbles: 2 },
    ]);
  });

  it('should fail when entity sharding bumps nibbles do not increase monotonically with timestamp', function () {
    const rawConfig: RawConfig = {
      entities: {
        foo: {
          sharding: {
            bumps: [
              { timestamp: 2, nibbleBits: 1, nibbles: 1 },
              { timestamp: 1, nibbleBits: 1, nibbles: 2 },
            ],
            entityKey: () => 'foo',
            timestamp: () => 0,
          },
        },
      },
    };

    expect(() => configSchema.parse(rawConfig)).to.throw(
      'entity foo sharding bump nibbles do not monotonically increase at timestamp 2',
    );
  });

  it('should not change entity sharding bumps if already sorted & zero-timestamp bump configured', function () {
    const rawConfig: RawConfig = {
      entities: {
        foo: {
          sharding: {
            bumps: [
              { timestamp: 2, nibbleBits: 1, nibbles: 2 },
              { timestamp: 1, nibbleBits: 1, nibbles: 1 },
              { timestamp: 0, nibbleBits: 1, nibbles: 0 },
            ],
            entityKey: () => 'foo',
            timestamp: () => 0,
          },
        },
      },
    };

    const parsedConfig = configSchema.parse(rawConfig);

    expect(parsedConfig.entities.foo.sharding.bumps).to.deep.equal([
      { timestamp: 0, nibbleBits: 1, nibbles: 0 },
      { timestamp: 1, nibbleBits: 1, nibbles: 1 },
      { timestamp: 2, nibbleBits: 1, nibbles: 2 },
    ]);
  });

  it('should fail if entity sharding entityToken function not defined when nonzero-timestamp bump configured', function () {
    const rawConfig: RawConfig = {
      entities: {
        foo: {
          sharding: {
            bumps: [{ timestamp: 1, nibbleBits: 1, nibbles: 1 }],
            timestamp: () => 0,
          },
        },
      },
    };

    expect(() => configSchema.parse(rawConfig)).to.throw(
      'entity foo sharding entityToken function required when positive-nibble bumps defined',
    );
  });

  it('should fail if entity sharding timestamp function not defined when nonzero-timestamp bump configured', function () {
    const rawConfig: RawConfig = {
      entities: {
        foo: {
          sharding: {
            bumps: [{ timestamp: 1, nibbleBits: 1, nibbles: 1 }],
            entityKey: () => 'foo',
          },
        },
      },
    };

    expect(() => configSchema.parse(rawConfig)).to.throw(
      'entity foo sharding timestamp function required when positive-nibble bumps defined',
    );
  });
});
