import _ from 'lodash';

/**
 * Configurably generates an entity-specific shard id based on entity id and timestamp.
 *
 * @param {any} value - Any value.
 * @returns {any} Whatever value it was passed.
 */
export const shardId = (value) => (_.isNil(value) ? 'nil' : value);
