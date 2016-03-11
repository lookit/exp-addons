import Ember from 'ember';

var frameNamePattern = new RegExp(/^exp(?:-\w+)+$/);

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
function randomShuffleArray(array) {
    array = array.slice();
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function rotateConditions(options, frameId, pastSessions) {
    if(pastSessions.length) {
        pastSessions = pastSessions.filter(function(session) {
            return session.get('conditions');
        });
        pastSessions.sort(function(a, b) {
            return a.get('createdOn') > b.get('createdOn') ? -1: 1;
        });
        var lastChoice = (pastSessions[0].get(`conditions.${frameId}`) || options)[0];
        var offset = options.indexOf(lastChoice) + 1;
        return options.concat(options).slice(offset, offset + options.length);
    }
    else {
        return options;
    }
}

/* Modifies the data in the experiment schema definition to match the format expected by exp-player */
function reformatConfig(frameId, config) {
    var newConfig = Ember.copy(config, true);
    newConfig.id = frameId;
    return newConfig;
}

/* Convert a random frame to a list of constituent frame config objects */
function resolveRandom(frameId, frames, pastSessions) {
    var config = frames[frameId];
    var randomizer = config.sampler || 'random';  // Random sampling by default
    var choice;
    var sample;
    if (randomizer === 'random') {
        // Pick one option at random
        sample = Math.floor(Math.random() * config.options.length);
        choice = config.options[sample];
    }
    else if(randomizer === 'shuffle' || randomizer === 'rotate') {
        // Shuffle and resolve the set of all options, rather than returning just one
        var order = randomizer === 'shuffle' ? randomShuffleArray(config.options): rotateConditions(
            config.options,
            frameId,
            pastSessions
        );
        var resolvedConfigs = [];
        order.forEach(function(frameId /* , index, array */) {
            resolvedConfigs.push(...resolveFrame(frameId, frames, pastSessions));
        });
        return [[].concat.apply([], resolvedConfigs.filter((cfg) => !!cfg)), order];
    }
    else {
        throw "Unrecognized sampling method specified";
    }
    return [resolveFrame(choice, frames, pastSessions)[0], sample];
}

/* Convert a block of frames to an array of constituent frame config objects */
function resolveBlock(frameId, frames, pastSessions) {
    var config = frames[frameId];

    var allConfigs = [];
    config.items.forEach(function(frameId /* , index, array */) {
        allConfigs.push(resolveFrame(frameId, frames, pastSessions)[0]);
    });
    return [allConfigs, null];
}

/* Convert any frame to a list of constituent frame config objects. Centrally dispatches logic for all other frame types */
function resolveFrame(frameId, frames, pastSessions) {
    var config = frames[frameId];
    if (frameNamePattern.test(config.kind)) {
        // Base case: this is a plain experiment frame
        return [[reformatConfig(frameId, config)], null];
    } else if (config.kind === "block") {
        return resolveBlock(frameId, frames, pastSessions);
    } else if (config.kind === "choice") {
        return resolveRandom(frameId, frames, pastSessions);
    } else {
        throw `Experiment definition specifies an unknown kind of frame: ${config.kind}`;
    }
}

/*
  Turn experiment structure into an array of frame configuration objects. Resolves lists and random frames into basic frame components.
 */
function parseExperiment(expStructure, pastSessions) {
    var frames = expStructure.frames;
    var sequence = expStructure.sequence;
    var expFrames = [];

    var choices = {};
    sequence.forEach(function(frameId /*, index, array */) {
        var [resolved, choice] = resolveFrame(frameId, frames, pastSessions);
        expFrames.push(...resolved);
        if (choice) {
            choices[frameId] = choice;
        }
    });

    return [expFrames, choices];
}

export default parseExperiment;
