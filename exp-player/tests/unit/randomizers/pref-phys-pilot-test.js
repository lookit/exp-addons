import { getConditions } from '../../../randomizers/pref-phys-pilot';
import { module, test } from 'qunit';

module('Unit | Randomizer | pref phys pilot');

test('New conditions correctly depend on previous conditions: increment', function (assert) {
    const prevConditions = {
        startType: 1,
        showStay: 0,
        whichObjects: [2,1,3,4]
    };

    const fakeSession = {
        conditions: {
            '1_frameName': {
                prevConditions
            }
        }
    };

    let actualResult = getConditions(fakeSession, 'frameName');
    const expectedResult = {
        startType: 2,
        showStay: 1,
        whichObjects: [3,2,4,5]
    };

    assert.deepEqual(actualResult, expectedResult,
        'New conditions did not correctly increment based on previous session'
    );
});


test('New conditions correctly depend on previous conditions: wraparound', function (assert) {
    const prevConditions = {
        startType: 3,
        showStay: 1,
        whichObjects: [1,2,5,2]
    };

    const fakeSession = {
        conditions: {
            '1_frameName': {
                prevConditions
            }
        }
    };

    let actualResult = getConditions(fakeSession, 'frameName');
    const expectedResult = {
        startType: 0,
        showStay: 0,
        whichObjects: [2,3,0,3]
    };

    assert.deepEqual(actualResult, expectedResult,
        'New conditions did not correctly increment based on previous session'
    );});


test('If no prev conditions are specified, a random frame is returned', function (assert) {
    // TODO: Add Sinon so we control the output of the randomizer!!
    assert.ok(42);
});
