import Ember from 'ember';

var frameNamePattern = new RegExp(/^exp(?:-\w+)+$/);
var urlPattern = /^(URL|JSON):(.*)$/;

var ExperimentParser = function(context={
    pastSessions: [],
    structure: {
	frames: {},
	sequence: []
    }
}) {
    this.pastSessions = context.pastSessions;
    this.frames = context.structure.frames;
    this.sequence = context.structure.sequence;

};
/** Modifies the data in the experiment schema definition to match
 * the format expected by exp-player 
 **/
ExperimentParser.prototype._reformatFrame = function(frame, index) {
    var newConfig = Ember.copy(frame, true);
    newConfig.id = `${index}-${frame.id}`;
    return newConfig;
};
/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 **/
ExperimentParser.prototype._randomShuffleArray = function(array) {
    array = array.slice();
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
};
ExperimentParser.prototype._rotateConditions = function(frame) {
    var pastSessions = this.pastSessions.filter(function(session) {
        return session.get('conditions');
    });
    pastSessions.sort(function(a, b) {
        return a.get('createdOn') > b.get('createdOn') ? -1: 1;
    });
    if(pastSessions.length) {
        var lastChoice = (pastSessions[0].get(`conditions.${frame.id}`) || frame.options)[0];
        var offset = frame.options.indexOf(lastChoice) + 1;
        return frame.options.concat(frame.options).slice(offset, offset + frame.options.length);
    }
    else {
        return frame.options;
    }
};
/** Convert a random frame to a list of constituent 
 * frame config objects 
 **/
ExperimentParser.prototype._resolveRandom = function(frame) {
    var randomizer = frame.sampler || 'random';  // Random sampling by default
    var choice;
    var sample;
    if (randomizer === 'random') {
        // Pick one option at random
        sample = Math.floor(Math.random() * frame.options.length);
        choice = frame.options[sample];	    
	return this._resolveFrame(choice);
    }
    else if(randomizer === 'shuffle' || randomizer === 'rotate') {
        // Shuffle and resolve the set of all options, rather than returning just one
        var order = randomizer === 'shuffle' ? this._randomShuffleArray(frame.options): this._rotateConditions(frame);
	
        var resolvedConfigs = [];
        order.forEach((frameId) => {
	    resolvedConfigs.push(...this._resolveFrame(frameId));
        });
        return [[].concat.apply([], resolvedConfigs.filter((cfg) => !!cfg)), order];
    }
    else {
        throw "Unrecognized sampling method specified";
    }
    return [this._resolveFrame(choice), sample];
};
ExperimentParser.prototype._resolveDependencies = function(frame) {
    Object.keys(frame).forEach((key) => {
        var match = urlPattern.exec(frame[key]);
        if (match) {
	    var opts = {
                type: "GET",
                url: match.pop(),
                async: false,
                headers: {
		    'Access-Control-Allow-Origin': '*'
                }
	    };
	    var res = Ember.$.ajax(opts);
	    if (frame[key].indexOf('JSON') === 0) {
                frame[key] = JSON.parse(res.responseText);
	    }
	    else {
                frame[key] = res.responseText;
	    }
        }
    });
    return frame;
};
/** Convert a block of frames to an array of constituent frame config objects
 **/
ExperimentParser.prototype._resolveBlock = function(frame) {
    return [frame.items.map((frameId) => {
	return this._resolveFrame(frameId);
    }), null];
};
/** Convert any frame to a list of constituent frame config objects.
 * Centrally dispatches logic for all other frame types
 **/
ExperimentParser.prototype._resolveFrame = function(frameId) {
    var frame = this.frames[frameId];
    if (frameNamePattern.test(frame.kind)) {
        // Base case: this is a plain experiment frame
	frame.id = frameId;
        return [[
	    this._resolveDependencies(frame)
	], null];
    } else if (frame.kind === "block") {
        return this._resolveBlock(frame, frameId);
    } else if (frame.kind === "choice") {
        return this._resolveRandom(frame, frameId);
    } else {
        throw `Experiment definition specifies an unknown kind of frame: ${frame.kind}`;
    }
};
ExperimentParser.prototype.parse = function() {
    var expFrames = [];
    var choices = {};
    this.sequence.forEach((frameId, index) => {
        var [resolved, choice] = this._resolveFrame(frameId);
        expFrames.push(...resolved);
        if (choice) {
	    choices[`${index}-${frameId}`] = choice;
        }
    });
    return [expFrames.map((frame, index) => {
	return this._reformatFrame(frame, index);
    }), choices];
};
export default ExperimentParser;
