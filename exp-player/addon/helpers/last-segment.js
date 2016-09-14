import Ember from 'ember';

/**
 * A helper method. Given a dotted value `a.b.c.d`, return only the last segment: `d`
 *
 * @method last-segment
 * @param {Array} params
 * @param {Object} hash
 * @param {String} [hash.sep='.'] The character to use when splitting segments of the string
 * @returns {String|Array} Returns the separated text- as an array, unless there is only one element
 */
export function lastSegment(params, hash) {
    let sep = hash.sep || '.';
    let value = params[0];
    if (Ember.$.type(value) === 'string') {
        return value.split(sep).pop();
    }
    return value;
}

export default Ember.Helper.helper(lastSegment);
