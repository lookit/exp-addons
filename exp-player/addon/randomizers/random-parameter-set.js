/**
* @module exp-player
* @submodule randomizers
*/

/**
* Randomizer to implement counterbalancing for geometry alternation study.
* To use, define a frame with "kind": "choice" and "sampler": "random-parameter-set",
* as shown below, in addition to the parameters described under 'properties'.
*
```json
"frames": {
     "trials": {
        "sampler": "random-parameter-set",
        "kind": "choice",
        "commonFrameProperties": ,
        "parameterSets": ,
        "frameList": ,
        "parameterSetWeights"
    }
}

* ```
* @class randomParameterSet
*/

var getRandomElement = function(arr, weights) {
    var totalProb = weights.reduce((a, b) => a + b, 0);
    var randPos = Math.random() * totalProb;

    var weightSum = 0;
    for (var i = 0; i < arr.length; i++) {
        weightSum += weights[i];
        if (randPos <= weightSum) {
            return [i, arr[i]];
        }
    }
};

function replaceValues(obj, rep) {
    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (typeof obj[property] == "object") {
                obj[property] = replaceValues(obj[property], replace);
            } else {
                if (rep.hasOwnProperty(obj[property])) {
                  obj[property] = rep[obj[property]];
                }
            }
        }
    }
    return obj;
}

var randomizer = function(frameId, frameConfig, pastSessions, resolveFrame) {

    // Data provided to randomizer (properties of frameConfig):

    /**
     * Object describing common parameters to use in EVERY frame created
     * by this randomizer. Parameter names and values are as described in
     * the documentation for the frameType used.
     *
     * @property {Object} commonFrameProperties
     */

    /**
     * List of frames to be created by this randomizer. Each frame is an
     * object with any necessary frame-specific properties specified. The
     * 'kind' of frame can be specified either here (per frame) or in
     * commonFrameProperties. If a property is defined for a given frame both
     * in this frame list and in commonFrameProperties, the value in the frame
     * list will take precedence.
     *
     * (E.g., you could include 'kind': 'normal-frame' in
     * commmonFrameProperties, but for a single frame in frameList, include
     * 'kind': 'special-frame'.)
     *
     * Any property VALUES within any of the frames in this list which match
     * a property NAME in the selected parameterSet will be replaced by the
     * corresponding parameterSet value. E.g., suppose a frame in frameList is
     *
     * ```
     *   {'leftImage': 'LEFTIMAGE1',
     *   'rightImage': 'frog.jpg',
     *   'size': 'IMAGESIZE'}
     * ```
     *
     * and the row that has been selected randomly of parameterSets is
     *
     * ```
     * {'LEFTIMAGE1': 'toad.jpg',
        'LEFTIMAGE2': 'dog.jpg',
        'IMAGESIZE': 250}
     * ```
     *
     * Then the frame would be transformed into:
     * ```
     *   {'leftImage': 'toad.jpg',
     *   'rightImage': 'frog.jpg',
     *   'size': 250}
     * ```
     *
     * The same values may be applied across multiple frames. For instance,
     * suppose frameList is

```
       [
            {
                'leftImage': 'LEFTIMAGE1',
                'rightImage': 'frog.jpg',
                'size': 'IMAGESIZE'
            },
            {
                'leftImage': 'LEFTIMAGE2',
                'rightImage': 'frog.jpg',
                'size': 'IMAGESIZE'
            }
        ]
```

     * Then the corresponding processed frames would include the values
```
       [
            {
                'leftImage': 'toad.jpg',
                'rightImage': 'frog.jpg',
                'size': 250
            },
            {
                'leftImage': 'dog.jpg',
                'rightImage': 'frog.jpg',
                'size': 250
            }
        ]
```
     * A property value like 'IMAGESIZE' may be placed in a frame definition
     * nested within another object (at any depth) or within a list and
     * will still be replaced.

     * @property {Object[]} frameList
     */

    /**
     * Array of parameter sets to randomly select from in order to determine
     * the parameters for each
     *
     * (E.g., you could include 'kind': 'normal-frame' in
     * commmonFrameProperties, but for a single frame in frameList, include
     * 'kind': 'special-frame'.)
     *
     * A single element of parameterSets will be applied to a given session.
     *
     * @property {Object[]} parameterSets
     */

    /**
     * [Optional] Array of weights for parameter sets; elements correspond to
     * elements of parameterSets. The probability of selecting an element
     * parameterSets[i] is parameterSetWeights[i]/sum(parameterSetWeights).
     *
     * If not provided, all parameterSets are weighted equally.
     *
     * This is intended to allow manual control of counterbalancing during
     * data collection, e.g. to allow one condition to "catch up" if it was
     * randomly selected less often.
     *
     * @property {Number[]} parameterSetWeights
     */

    // Select a parameter set to use for this trial.
    if !(frameConfig.hasOwnProperty('parameterSetWeights')) {
        frameConfig.parameterSetWeights = new Array(frameConfig.parameterSets.length).fill(1)
    }

    var parameterData = getRandomElement(frameConfig.parameterSets, frameConfig.parameterSetWeights);
    var parameterSetIndex = parameterData[0];
    var parameterSet = parameterData[1];

    var frames = [];
    var thisFrame = {};

    for (var iFrame = 0; iFrame < frameConfig.frameList.length; iFrame++) {

        // Assign parameters common to all frames made by this randomizer
        thisFrame = {};
        Object.assign(thisFrame, frameConfig.commonFrameProperties);
        [thisFrame,] = resolveFrame(null, thisFrame);
        frames.push(thisFrame);

        // Assign parameters specific to this frame (allow to override
        // common parameters assigned above)
        Object.assign(thisFrame, frameConfig.frameList[iFrame]);

        // Substitute any properties that can be replaced based on
        // the parameter set.
        thisFrame = replaceValues(thisFrame, parameterSet);

        // Assign frame ID
        thisFrame.id = `${frameId}`
    }

    return [frames, {'conditionNum': parameterSetIndex, 'parameterSet': parameterSet}];

};
export default randomizer;

// Export helper functions to support unit testing
export { getRandomElement };
