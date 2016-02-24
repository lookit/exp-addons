// h/t @aaxelb

import Ember from 'ember';
import moment from 'moment';

let {$} = Ember;

var AND = (a, b) => {
    return function() {
        return a(...arguments) && b(...arguments);
    };
};
var OR = (a, b) => {
    return function() {
        return a(...arguments) || b(...arguments);
    };
};

/**
 * @return {integer}: number of days represented by amount/unit pair, e.g. 3 'weeks' -> 21
 **/
function parseDate(amount, unit='days') {
    var inflector = new Ember.Inflector();
    return moment.duration(parseFloat(amount), inflector.pluralize(unit)).asDays();
}

/** Compile an eligibiliy string into a function: (participant) -> boolean
 *
 * @param {string} elig: an eligibiliy string
 * @returns {function (participant) -> boolean}
 *
 * Eligibilty strings should follow the general pattern: <attribute> <comparator> <value>
 * These clauses can be joined with 'and' or 'or', and order of operations can be defined
 * by wrapping a clause in '(' and ')'. <attribute>s must be attributes or computed values
 * defined on the Profile class (e.g. 'age'). <comparator>s must be one of: '>', '>=', '<',
 * '<=', 'is'. <value>s will be compared as numbers if $.isNumeric returns true when tested
 * on that value.
 *
 * For the time being, 'age' is a special case that supports units of time. These units
 * correspond directly with the units supported by the moment.duration constructor. This
 * allows syntax like: 'age > 3 months' and also 'age < 5 years'.
 **/
function compileEligibilityString(elig) {
    var parts = elig.split(/(\(|\)|and|or)/).map((p) => p.trim()).filter((p) => p.length);
    var part = parts.shift();

    var isEligible;
    if (part === '(') {
        var depth = 1;
        var acc = [];
        while (true) {
            var next = parts.shift();
            if (next === ')') {
                depth--;
                if (!depth) {
                    break;
                }
            } else if (next === '(') {
                depth++;
            }
            acc.push(next);
        }
        isEligible = compileEligibilityString(acc.join(' '));
    } else {
        var terms = part.split(/(>|<|>=|<=|is)/).map((p) => p.trim());
        var prop = terms.shift();
        var op = terms.shift();
        var [value, unit] = terms.shift();

        var opFn;
        if (op === '>') {
            opFn = function gt(a, b) {
                return a > b;
            };
        }
        if (op === '>=') {
            opFn = function gte(a, b) {
                return a >= b;
            };
        }
        if (op === '<') {
            opFn = function lt(a, b) {
                return a < b;
            };
        }
        if (op === '<=') {
            opFn = function lte(a, b) {
                return a <= b;
            };
        }
        if (op === 'is') {
            opFn = function eq(a, b) {
                return a === b;
            };
        }

        isEligible = function(participant) {
            // A slight hack
            if (prop === 'age') {
                value = parseDate(value, unit);
            }

            if ($.isNumeric(value)) {
                return opFn(
                    parseFloat(participant.get(prop)),
                    parseFloat(value)
                );
            }
            else {
                return opFn(participant.get(prop), value);
            }
        };

    }
    if (parts.length) {
        var nextOp = parts.shift();
        if (nextOp === 'and') {
            return AND(isEligible, compileEligibilityString(parts.join(' ')));
        } else if (nextOp === 'or') {
            return OR(isEligible, compileEligibilityString(parts.join(' ')));
        }
    } else {
        return isEligible;
    }
    return false;
}

var compile = compileEligibilityString;
export default compile;
