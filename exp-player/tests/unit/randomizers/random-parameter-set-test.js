import Ember from 'ember';

import { module } from 'qunit';
import test from 'dummy/tests/ember-sinon-qunit/test';

import { getRandomElement } from 'exp-player/randomizers/random-parameter-set';

module('Unit | Randomizer | random parameter set');

test('Dummy test', function (assert) {
    assert.deepEqual(1, 2,
        'New conditions did not correctly increment based on previous session'
    );
});

// test('Dummy test', function (assert) {
//     const prevConditions = {
//         startType: 22,
//         showStay: 18,
//         whichObjects: [262, 88, 718, 18]
//     };
//
//     const fakeSession = Ember.Object.create({
//         conditions: {
//             '1_frameName': prevConditions
//         }
//     });
//
//     let actualResult = getConditions(fakeSession, 'frameName');
//     const expectedResult = {
//         startType: 23,
//         showStay: 19,
//         whichObjects: [263, 89, 719, 19]
//     };
//
//     assert.deepEqual(actualResult, expectedResult,
//         'New conditions did not correctly increment based on previous session'
//     );
// });
