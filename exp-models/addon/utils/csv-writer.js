import Ember from 'ember';

/**
 * New line string
 *
 * @type {String}
 */
export const NL = '\r\n';

/**
 * Flatten a nested object into a single level, with dotted paths for keys
 *
 * @param {Object} obj The object to flatten
 * @param {String} [prefix] The prefix for the keys
 * @return {Object} The flattened object
 */
function squashPrefix(obj, prefix) {
    let ret = {};

    for (const key of Object.keys(obj)) {
        const newPrefix = prefix ? `${prefix}.${key}` : key;

        let value = Ember.get(obj, key);

        if (value && value.toJSON) {
            value = value.toJSON();
        }

        if (Ember.$.isPlainObject(value)) {
            Object.assign(ret, squashPrefix(value, newPrefix));
        } else {
            ret[newPrefix] = value;
        }
    }

    return ret;
}

/**
 * Flatten a nested object into a single level, with dotted paths for keys
 * *Needed for making squashPrefix map-able (only takes first arg)*
 *
 * @param {Object} obj The object to flatten
 * @return {Object} The flattened object
 */
export function squash(obj) {
    return squashPrefix(obj);
}

/**
 * Extracts the unique object keys from an array of objects
 *
 * @param  {Array<Object>} dataArray An array of objects
 * @param  {Number} [maxRows] The maximum number of rows to process
 * @return {Array<String>} The unique keys
 */
export function uniqueFields(dataArray, maxRows) {
    const arr = maxRows ? dataArray.slice(0, maxRows) : dataArray;

    return [
        ...new Set(
            [].concat(
                ...arr.map(Object.keys)
            )
        )
    ];
}

/**
 * Makes a value safe for a CSV
 *
 * @param {Boolean|Null|Number|Object|Array|String} val The value to serialize
 * @return {String}
 */
function csvSafe(val) {
    let value = val;

    switch (typeof value) {
        case 'boolean':
            return value ? 'TRUE' : 'FALSE';
        case 'number':
            return value.toString();
        case 'object':
            if (value === null) {
                return '';
            }

            value = JSON.stringify(value);
            /* falls through */
        default:
            value = JSON.stringify(value);
    }

    return value ? value.replace(/\\"/g, '""') : '';
}

/**
 * Converts an array of objects to a standard CSV file
 *
 * @param {Array<Object>} dataArray The rows of the CSV
 * @param {Array<String>} fields The fields of the CSV array. If not supplied, the the headers are calculated based on
 * the first row of data.
 * @param {String} [columnSeparator=','] A custom column separator
 * @return {String}
 */
export function writeCSV(dataArray, fields, columnSeparator=',') {
    const csv = [fields.join(columnSeparator)];

    for (const item of dataArray) {
        const line = [];

        for (const field of fields) {
            line.push(
                csvSafe(item[field])
            );
        }

        csv.push(
            line.join(columnSeparator)
        );
    }

    return csv.join(NL);
}
