/*
 NOTE: you will need to manually add an entry for this file in addon/randomizers/index.js
 */   
var randomizer = function(frame, pastSessions, resolveFrame) {
    pastSessions = pastSessions.filter(function(session) {
        return session.get('conditions');
    });
    pastSessions.sort(function(a, b) {
        return a.get('createdOn') > b.get('createdOn') ? -1: 1;
    });

    var options = [];
    if(pastSessions.length) {
        var lastChoice = (pastSessions[0].get(`conditions.${frame.id}`) || frame.options)[0];
        var offset = frame.options.indexOf(lastChoice) + 1;
        options = frame.options.concat(frame.options).slice(offset, offset + frame.options.length);
    }
    else {
        options = frame.options;
    }
    var resolvedConfigs = [];
    options.forEach((frameId) => {
	resolvedConfigs.push(...resolveFrame(frameId));
    });
    return [[].concat.apply([], resolvedConfigs.filter((cfg) => !!cfg)), options[0]];
};

export default randomizer;
