import { expect } from 'chai';
import { omit } from 'radash';

import type { Entity } from './Config';
import { sort } from './sort';

interface User extends Entity {
  id: number;
  name: string;
  optional?: string | null;
  data?: Record<string, unknown>;
}

const users: User[] = [
  { id: 2, name: 'Adam', optional: 'foo', data: { foo: 'bar' } },
  { id: 3, name: 'Bob', optional: 'bar', data: { bar: 'baz' } },
  { id: 1, name: 'Charlie', optional: null, data: { baz: 'qux' } },
  { id: 4, name: 'Adam' },
];

describe('sort', function () {
  it('will sort falsy data first', function () {
    const result = sort(users, [{ property: 'data' }]);

    expect(result[0]).to.deep.equal({ id: 4, name: 'Adam' });
  });

  it('empty sort returns original data', function () {
    const result = sort(users);

    expect(result).to.deep.equal(users);
  });

  it('should sort by id asc', function () {
    const result = sort(users, [{ property: 'id' }]);

    expect(result.map((u) => omit(u, ['data']))).to.deep.equal([
      { id: 1, name: 'Charlie', optional: null },
      { id: 2, name: 'Adam', optional: 'foo' },
      { id: 3, name: 'Bob', optional: 'bar' },
      { id: 4, name: 'Adam' },
    ]);
  });

  it('should sort by id desc', function () {
    const result = sort(users, [{ property: 'id', desc: true }]);

    expect(result.map((u) => omit(u, ['data']))).to.deep.equal([
      { id: 4, name: 'Adam' },
      { id: 3, name: 'Bob', optional: 'bar' },
      { id: 2, name: 'Adam', optional: 'foo' },
      { id: 1, name: 'Charlie', optional: null },
    ]);
  });

  it('should sort by name asc id asc', function () {
    const result = sort(users, [{ property: 'name' }, { property: 'id' }]);

    expect(result.map((u) => omit(u, ['data']))).to.deep.equal([
      { id: 2, name: 'Adam', optional: 'foo' },
      { id: 4, name: 'Adam' },
      { id: 3, name: 'Bob', optional: 'bar' },
      { id: 1, name: 'Charlie', optional: null },
    ]);
  });

  it('should sort by name asc id desc', function () {
    const result = sort(users, [
      { property: 'name' },
      { property: 'id', desc: true },
    ]);

    expect(result.map((u) => omit(u, ['data']))).to.deep.equal([
      { id: 4, name: 'Adam' },
      { id: 2, name: 'Adam', optional: 'foo' },
      { id: 3, name: 'Bob', optional: 'bar' },
      { id: 1, name: 'Charlie', optional: null },
    ]);
  });

  it('should sort by optional asc name desc', function () {
    const result = sort(users, [
      { property: 'optional' },
      { property: 'name', desc: true },
    ]);

    expect(result.map((u) => omit(u, ['data']))).to.deep.equal([
      { id: 1, name: 'Charlie', optional: null },
      { id: 4, name: 'Adam' },
      { id: 3, name: 'Bob', optional: 'bar' },
      { id: 2, name: 'Adam', optional: 'foo' },
    ]);
  });
});
