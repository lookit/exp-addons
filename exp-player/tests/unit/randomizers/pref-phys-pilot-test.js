import Ember from 'ember';

import { module } from 'qunit';
import test from 'dummy/tests/ember-sinon-qunit/test';

import { getConditions } from 'exp-player/randomizers/pref-phys-pilot';

module('Unit | Randomizer | pref phys pilot');

test('New conditions correctly depend on previous conditions: increment', function (assert) {
    const prevConditions = {
        startType: 1,
        showStay: 0,
        whichObjects: [2, 1, 3, 4]
    };

    const fakeSession = Ember.Object.create({
        conditions: {
            '1_frameName': prevConditions
        }
    });

    let actualResult = getConditions(fakeSession, 'frameName');
    const expectedResult = {
        startType: 2,
        showStay: 1,
        whichObjects: [3, 2, 4, 5]
    };

    assert.deepEqual(actualResult, expectedResult,
        'New conditions did not correctly increment based on previous session'
    );
});


test('New conditions correctly depend on previous conditions: wraparound', function (assert) {
    const prevConditions = {
        startType: 3,
        showStay: 1,
        whichObjects: [1, 2, 5, 2]
    };

    const fakeSession = Ember.Object.create({
        conditions: {
            '1_frameName': prevConditions
        }
    });

    let actualResult = getConditions(fakeSession, 'frameName');
    const expectedResult = {
        startType: 0,
        showStay: 0,
        whichObjects: [2, 3, 0, 3]
    };

    assert.deepEqual(actualResult, expectedResult,
        'New conditions did not correctly increment based on previous session'
    );
});


test('If no prev conditions are specified, a random frame is returned', function (assert) {
    // Stub out RNG so it always returns 0, and results are predictable
    this.stub(Math, 'random', () => 0);

    let actualResult = getConditions(null, 'frameName');
    const expectedResult = {
        startType: 0,
        showStay: 0,
        whichObjects: [0, 0, 0, 0]
    };
    assert.deepEqual(actualResult, expectedResult,
        'Randomizer should act randomly when no session is provided'
    );
});
