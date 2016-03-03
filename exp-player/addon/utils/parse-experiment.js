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


/* Modifies the data in the experiment schema definition to match the format expected by exp-player */
function reformatConfig(frameId, config) {
    var newConfig = Ember.copy(config, true);
    newConfig.id = frameId;
    return newConfig;
}

/* Convert a random frame to a list of constituent frame config objects */
function resolveRandom(frameId, frames) {
    var config = frames[frameId];
    var randomizer = config.sampler || 'random';  // Random sampling by default
    var choice;
    switch (randomizer) {
        case 'random':
            // Pick one option at random
            choice = config.options[Math.floor(Math.random() * config.options.length)];
            break;
        case 'shuffle':
            // Shuffle and resolve the set of all options, rather than returning just one
            var order = randomShuffleArray(config.options);
            var resolvedConfigs = [];
            order.forEach(function(frameId /* , index, array */) {
                resolvedConfigs.push(...resolveFrame(frameId, frames));
            });
            return resolvedConfigs;
        default:
            throw "Unrecognized sampling method specified";
    }
    return resolveFrame(choice, frames);
}

/* Convert a block of frames to an array of constituent frame config objects */
function resolveBlock(frameId, frames) {
    var config = frames[frameId];

    var allConfigs = [];
    config.items.forEach(function(frameId /* , index, array */) {
        allConfigs.push(...resolveFrame(frameId, frames));
    });
    return allConfigs;
}

/* Convert any frame to a list of constituent frame config objects. Centrally dispatches logic for all other frame types */
function resolveFrame(frameId, frames) {
    var config = frames[frameId];
    if (frameNamePattern.test(config.kind)) {
        // Base case: this is a plain experiment frame
        return [reformatConfig(frameId, config)];
    } else if (config.kind === "block") {
        return resolveBlock(frameId, frames);
    } else if (config.kind === "choice") {
        return resolveRandom(frameId, frames);
    } else {
        throw `Experiment definition specifies an unknown kind of frame: ${config.kind}`;
    }
}

/*
  Turn experiment structure into an array of frame configuration objects. Resolves lists and random frames into basic frame components.
 */
function parseExperiment(expStructure) {
    var frames = expStructure.frames;
    var sequence = expStructure.sequence;
    var expFrames = [];

    sequence.forEach(function(frameId /*, index, array */) {
        expFrames.push(...resolveFrame(frameId, frames));
    });

    return expFrames;
}

export default parseExperiment;
