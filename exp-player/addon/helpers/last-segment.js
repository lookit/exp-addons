import Ember from 'ember';

/**
 * @module exp-player
 * @submodule helpers
 */

/**
 * Template helper. Given a dotted value `a.b.c.d`, return only the last segment: `d`
 *
 * @method last-segment
 * @param {Array} params An array of parameters passed in. The first param is the thing to transform. It may be either
 *  a string or an array of strings.
 * @param {Object} hash
 * @param {String} [hash.sep='.'] The character to use when splitting segments of the string
 * @returns {String|Array} Returns the separated text- if multiple items are provided, return an array
 */
export function lastSegment(params, hash) {
    let sep = hash.sep || '.';
    let value = params[0];

    if (!Ember.$.isArray(value)) {
        value = [value];
    }
    let results = value.map(item => Ember.$.type(item) === 'string' ? item.split(sep).pop() : item);
    return results.length === 1 ? results[0] : results;
}

export default Ember.Helper.helper(lastSegment);
