/*
 NOTE: you will need to manually add an entry for this file in addon/randomizers/index.js
 */

/*
 *  WARNING: This is provided solely on an example basis.  It represents unused code and may require revisions to
 *    run according to the newest design of the platform.
 */
var randomizer = function(frame, _, resolveFrame) {
    // Pick one option at random
    var sample = Math.floor(Math.random() * frame.options.length);
    var choice = frame.options[sample];

    // jscs:disable
    var [frames,] = resolveFrame(choice);
    return [frames, choice];
};
export default randomizer;
