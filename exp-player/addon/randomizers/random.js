/*
 NOTE: you will need to manually add an entry for this file in addon/randomizers/index.js
 */   
var randomizer = function(frame, _, resolveFrame) {
    // Pick one option at random
    var sample = Math.floor(Math.random() * frame.options.length);
    var choice = frame.options[sample];
    
    var [frames,] = resolveFrame(choice);
    return [frames, choice];
};
export default randomizer;
