import { describe, expect, it } from 'vitest';

import { entityManager } from '../../test/config';
import { validateIndexToken } from './validateIndexToken';
import { validateTranscodedProperty } from './validateTranscodedProperty';

describe('validator error paths', function () {
  it('validateIndexToken throws on unknown token', function () {
    expect(() => {
      validateIndexToken(entityManager, 'unknownIndex');
    }).toThrow(/invalid index token/i);
  });

  it('validateTranscodedProperty throws on unknown property', function () {
    expect(() => {
      validateTranscodedProperty(entityManager, 'notAProperty' as never);
    }).toThrow(/invalid transcoded property/i);
  });
});
