/*
 NOTE: you will need to manually add an entry for this file in addon/randomizers/index.js
 */   
var randomizer = function(frame, _, resolveFrame){
    /**
     * Randomize array element order in-place.
     * Using Durstenfeld shuffle algorithm.
     **/
    var array = frame.options.slice();
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
        
    var resolvedConfigs = [];
    array.forEach((frameId) => {
	resolvedConfigs.push(...resolveFrame(frameId));
    });
    return [[].concat.apply([], resolvedConfigs.filter((cfg) => !!cfg)), array];
};
export default randomizer;
