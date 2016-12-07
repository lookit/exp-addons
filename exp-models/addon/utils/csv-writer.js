import Ember from 'ember';

/**
 * New line string
 *
 * @type {string}
 */
export const NL = '\r\n';

/**
 * Flatten a nested object into a single level, with dotted paths for keys
 *
 * @param obj {!Object} - The object to flatten
 * @param prefix {string} - The prefix for the keys
 * @returns {Object} - The flattened object
 */
function squashPrefix(obj, prefix) {
    let ret = {};

    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) {
            continue;
        }

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
 *
 * @param obj {!Object} - The object to flatten
 * @returns {Object} - The flattened object
 */
export function squash(obj) {
    return squashPrefix(obj);
}

/**
 * Extracts the unique object keys from an array of objects
 *
 * @param dataArray {Array<Object>} - An array of objects
 * @returns {Array<string>} - The unique keys
 */
export function uniqueFields(dataArray) {
    return [
        ...new Set(
            [].concat(
                ...dataArray.map(Object.keys)
            )
        )
    ];
}

/**
 * Makes a value safe for a CSV
 *
 * @param val {boolean|null|number|undefined|string} - The value to serialize
 * @returns {string}
 */
function csvSafe(val) {
    const value = JSON.stringify(val);
    return value ? value.replace(/\\"/g, '""') : '';
}

/**
 * Converts an array of objects to a standard CSV file
 *
 * @param dataArray {!Array<Object>} - The rows of the CSV
 * @param fields {!Array<string>} - The fields of the CSV array. If not supplied, the the headers are calculated based on the
 * first row of data.
 * @param columnSeparator {string} - A custom column separator
 * @returns {string}
 */
export function writeCSV(dataArray, fields, columnSeparator=',') {
    const csv = [fields.join()];

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
