/* eslint-env mocha */

// mocha imports
import { expect } from 'chai';

import { sn2u } from '@karmaniverous/tagged-templates';
import { getParametersNames } from 'inspect-parameters-declaration';

describe('inspect-parameters-declaration', function () {
  it('should find arguments', function () {
    const f = (timestamp, transactionId) =>
      sn2u`timestamp#${timestamp}|transactionId#${transactionId}`;

    const args = getParametersNames(f);

    expect(args).to.deep.equal(['timestamp', 'transactionId']);
  });

  it('should find destructured arguments', function () {
    const f = ({ timestamp, transactionId }) =>
      sn2u`timestamp#${timestamp}|transactionId#${transactionId}`;

    const args = getParametersNames(f);

    expect(args).to.deep.equal(['timestamp', 'transactionId']);
  });
});
