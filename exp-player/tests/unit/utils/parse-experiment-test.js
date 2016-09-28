import $ from 'jquery';
import ExperimentParser from '../../../utils/parse-experiment';
import { module, test, skip } from 'qunit';

module('Unit | Utility | parse experiment');

var sampleBaseExperiment = {
    structure: {
        frames: {
            aConsentForm: {
                id: 'aConsentForm',
                kind: 'exp-consent', // etc
            },
            aVideo: {
                id: 'aVideo',
                kind: 'exp-video'
            },
            aSound: {
                id: 'aSound',
                kind: 'exp-audio'
            },
            chooseMedia: { // randomizer
                id: 'chooseMedia',
                kind: 'choice',
                sampler: 'random',
                options: ['aVideo', 'aSound']
            },
            bothMedia : {  // array
                id: 'bothMedia',
                kind: 'block',
                items: ['aVideo', 'aSound'],
            },
            conditionalMedia: { // randomizer
                id: 'conditionalMedia',
                kind: 'choice',
                sampler: 'random',
                options: ['aVideo', 'bothMedia']
            },
            notMuchOfAChoice: { // randomizer
                id: 'notMuchOfAChoice',
                kind: 'choice',
                sampler: 'random',
                options: ['aConsentForm']
            },
            choiceIsArray: { // randomizer
                id: 'choiceIsArray',
                kind: 'choice',
                sampler: 'random',
                options: ['bothMedia']
            },
        }
    },
    pastSessions: []
};


skip('parser block unpacks frames', function(assert) {
    // FIXME: Skipped tests reveal an issue where the parser does not deal correctly with nested frame types
    // (like blocks), and fails to unpack the nested data structure. We will need to fix the parser to fix this test.
    var experiment = $.extend(true, {}, sampleBaseExperiment);
    experiment.structure.sequence = ['bothMedia'];

    var parser = new ExperimentParser(experiment);
    var result = parser.parse()[0];

    var expIds = result.map((item) => item.id);
    assert.deepEqual(expIds, ['aVideo', 'aSound']);
});

test('parser two single frames stay single frames', function(assert) {
    var experiment = $.extend(true, {}, sampleBaseExperiment);
    experiment.structure.sequence = ['aVideo', 'aSound'];

    var parser = new ExperimentParser(experiment);
    var result = parser.parse()[0];

    var expIds = result.map((item) => item.id);
    assert.deepEqual(expIds, ['0-aVideo', '1-aSound']);
});

skip('parser one plus array equals three', function(assert) {
    var experiment = $.extend(true, {}, sampleBaseExperiment);
    experiment.structure.sequence = ['aVideo', 'bothMedia'];

    var parser = new ExperimentParser(experiment);
    var result = parser.parse()[0];

    var expIds = result.map((item) => item.id);
    assert.deepEqual(expIds, ['aVideo', 'aVideo', 'aSound']);
});

skip('parser conditional picks one', function(assert) {
    var experiment = $.extend(true, {}, sampleBaseExperiment);
    experiment.structure.sequence = ['aVideo', 'notMuchOfAChoice'];

    var parser = new ExperimentParser(experiment);
    var result = parser.parse()[0];

    var expIds = result.map((item) => item.id);
    assert.deepEqual(expIds, ['aVideo', 'aConsentForm']);
});

skip('parser block nested inside a conditional', function(assert) {
    var experiment = $.extend(true, {}, sampleBaseExperiment);
    experiment.structure.sequence = ['choiceIsArray'];

    var parser = new ExperimentParser(experiment);
    var result = parser.parse()[0];

    var expIds = result.map((item) => item.id);
    assert.deepEqual(expIds, ['aVideo', 'aSound']);
});
