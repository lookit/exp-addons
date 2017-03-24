import { module, skip } from 'qunit';
import test from 'dummy/tests/ember-sinon-qunit/test';

import { getRandomElement, replaceValues, randomizer } from 'exp-player/randomizers/random-parameter-set';

module('Unit | Randomizer | random parameter set');

test('Random element selected from weighted list is a possible choice', function (assert) {
    const arr       = [1, 2, 3, 4, 5, 6, 7, 8];
    const weights   = [0, 0, 0, 0, 0, 1, 0, 0];

    const expectedResult = 6;

    let [, actualResult] = getRandomElement(arr, weights);

    assert.deepEqual(actualResult, expectedResult,
        'Random element selected should not have probability weight 0'
    );
});

test('Values are replaced at multiple levels of object hierarchy and within arrays', function (assert) {

    const object = {
        prop0: 'val4',
        prop1: {
            setting1: 1,
            setting2: "val1",
            setting3: "val1",
            setting4: [4,"val3",6],
            setting5: 5
        },
        prop2: {
            setting1: {
                subSetting: "val2"
            },
            setting2: "val3"
        },
        prop3: {
            setting: "val4"
        }
    };

    const replace = {
        "val1": "replacedvalue1",
        "val2": "replacedvalue2",
        "val3": "replacedvalue3",
        "val4": "replacedvalue4"
    };

    const expectedResult = {
        prop0: 'replacedvalue4',
        prop1: {
            setting1: 1,
            setting2: "replacedvalue1",
            setting3: "replacedvalue1",
            setting4: [4,"replacedvalue3",6],
            setting5: 5
        },
        prop2: {
            setting1: {
                subSetting: "replacedvalue2"
            },
            setting2: "replacedvalue3"
        },
        prop3: {
            setting: "replacedvalue4"
        }
    };

    let actualResult = replaceValues(object, replace);

    assert.deepEqual(actualResult, expectedResult,
        'Strings that are properties of replace should be replaced throughout object'
    );
});


// Object.assign doesn't work in tests; omitting this for now (but have checked manually)
skip('Randomizer creates expected frame list', function (assert) {

    const frameId = 'frame-id';
    const frameConfig = {
        commonFrameProperties: {
            'kind': 'exp-lookit-experiment-page'
        },
        frameList: [
            {
                'leftImage': 'LEFTIMAGE1',
                'rightImage': 'frog.jpg',
                'size': 'IMAGESIZE'
            },
            {
                'leftImage': 'LEFTIMAGE2',
                'rightImage': 'frog.jpg'
            },
            {
                'leftImage': 'LEFTIMAGE3',
                'rightImage': 'giraffe.jpg',
                'size': 'IMAGESIZE',
                'endAudio': 'ENDAUDIO'
            },
        ],
        parameterSets: [
            {
                'LEFTIMAGE1': 'toad.jpg',
                'LEFTIMAGE2': 'snake.jpg',
                'LEFTIMAGE3': 'zebra.jpg',
                'IMAGESIZE': 250,
                'ENDAUDIO': 'roar.mp3'
            },
            {
                'LEFTIMAGE1': 'bunny.jpg',
                'LEFTIMAGE2': 'cat.jpg',
                'LEFTIMAGE3': 'dog.jpg',
                'IMAGESIZE': 300,
                'ENDAUDIO': 'purr.mp3'
            },
        ],
        parameterSetWeights: [1, 0]
    };

    // just test on regular frame type, don't test resolving choice frames
    // within randomizer (although that should eventually also work)
    var resolveFrame = function(_, frame) {
        return [frame];
    };

    const expectedResult = [
            {
                'id': 'frame-id',
                'kind': 'exp-lookit-experiment-page',
                'leftImage': 'toad.jpg',
                'rightImage': 'frog.jpg',
                'size': 250
            },
            {
                'id': 'frame-id',
                'kind': 'exp-lookit-experiment-page',
                'leftImage': 'snake.jpg',
                'rightImage': 'frog.jpg'
            },
            {
                'id': 'frame-id',
                'kind': 'exp-lookit-experiment-page',
                'leftImage': 'zebra.jpg',
                'rightImage': 'giraffe.jpg',
                'size': 250,
                'endAudio': 'roar.mp3'
            },
        ];

    let [actualResult, ] = randomizer(frameId, frameConfig, [], resolveFrame);

    assert.deepEqual(actualResult, expectedResult,
        'Randomizer did not create expected frame list'
    );

});

