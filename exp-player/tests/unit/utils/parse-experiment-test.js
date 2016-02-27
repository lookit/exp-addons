import $ from 'jquery';
import parseExperiment from '../../../utils/parse-experiment';
import { module, test } from 'qunit';

module('Unit | Utility | parse experiment');

var sampleBaseExperiment = {
    structure: {
        frames: {
            aConsentForm: {
                kind: 'exp-consent', // etc
            },
            aVideo: {
                kind: 'exp-video'
            },
            aSound: {
                kind: 'exp-audio'
            },

            chooseMedia: { // randomizer
                kind: 'choice',
                sampler: 'random',
                options: ['aVideo', 'aSound']
            },

            bothMedia : {  // array
                kind: 'block',
                items: ['aVideo', 'aSound'],
            },

            conditionalMedia: { // randomizer
                kind: 'choice',
                sampler: 'random',
                options: ['aVideo', 'bothMedia']
            },

            notMuchOfAChoice: { // randomizer
                kind: 'choice',
                sampler: 'random',
                options: ['aConsentForm']
            },

            choiceIsArray: { // randomizer
                kind: 'choice',
                sampler: 'random',
                options: ['bothMedia']
            },
        }
    }
};


test('parser block unpacks frames', function(assert) {
    var experiment = $.extend(true, {}, sampleBaseExperiment);
    experiment.structure.sequence = ['bothMedia'];

    var result = parseExperiment(experiment.structure);
    var expIds = result.map((item) => item.id );
    assert.deepEqual(expIds, ['aVideo', 'aSound']);
});

test('parser two single frames stay single frames', function(assert) {
    var experiment = $.extend(true, {}, sampleBaseExperiment);
    experiment.structure.sequence = ['aVideo', 'aSound'];

    var result = parseExperiment(experiment.structure);
    var expIds = result.map((item) => item.id );
    assert.deepEqual(expIds, ['aVideo', 'aSound']);
});

test('parser one plus array equals three', function(assert) {
    var experiment = $.extend(true, {}, sampleBaseExperiment);
    experiment.structure.sequence = ['aVideo', 'bothMedia'];

    var result = parseExperiment(experiment.structure);
    var expIds = result.map((item) => item.id );
    assert.deepEqual(expIds, ['aVideo', 'aVideo', 'aSound']);
});

test('parser conditional picks one', function(assert) {
    var experiment = $.extend(true, {}, sampleBaseExperiment);
    experiment.structure.sequence = ['aVideo', 'notMuchOfAChoice'];

    var result = parseExperiment(experiment.structure);
    var expIds = result.map((item) => item.id );
    assert.deepEqual(expIds, ['aVideo', 'aConsentForm']);
});

test('parser block nested inside a conditional', function(assert) {
    var experiment = $.extend(true, {}, sampleBaseExperiment);
    experiment.structure.sequence = ['choiceIsArray'];

    var result = parseExperiment(experiment.structure);
    var expIds = result.map((item) => item.id );
    assert.deepEqual(expIds, ['aVideo', 'aSound']);
});
