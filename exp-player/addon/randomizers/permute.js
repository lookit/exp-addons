/**
* @module exp-player
* @submodule randomizers
*/

/**
* Randomizer to allow random ordering of a list of frames. Intended to be
* useful for e.g. randomly permuting the order of particular stimuli used during
* a set of trials (although frames need not be of the same kind to permute).
*
* To use, define a frame with "kind": "choice" and "sampler": "permute",
* as shown below, in addition to the parameters described under 'properties'.
*
*
```json
"frames": {
    "test-trials": {
        "sampler": "permute",
        "kind": "choice",
        "id": "test-trials",
        "frameOptions": [
            {
                "blocks": [
                    {
                        "emph": true,
                        "text": "Let's think about hippos!",
                        "title": "hippos!"
                    },
                    {
                        "text": "Some more about hippos..."
                    }
                ],
                "showPreviousButton": false,
                "kind": "exp-lookit-text"
            },
            {
                "blocks": [
                    {
                        "emph": false,
                        "text": "Let's think about dolphins!",
                        "title": "dolphins!"
                    }
                ],
                "showPreviousButton": false,
                "kind": "exp-lookit-text"
            },
        ]
    }
}

* ```
* @class permute
*/


var randomizer = function(frameId, frameConfig, pastSessions, resolveFrame) {

    // Data provided to randomizer (properties of frameConfig):

    /**
     * Unique string identifying this set of frames
     *
     * @property {String} id
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
     * commmonFrameProperties, but for a single frame in frameOptions, include
     * 'kind': 'special-frame'.)
     *
     * @property {Object[]} frameOptions
     */

     /**
     * Object describing common parameters to use in EVERY frame created
     * by this randomizer. Parameter names and values are as described in
     * the documentation for the frameType used.
     *
     * @property {Object} commonFrameProperties
     */

    // jscs:disable

    /*
     * Randomize array element order in-place.
     * Using Durstenfeld shuffle algorithm.
     */
    var array = frameConfig.frameOptions.slice();
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

    var thisFrame = {};
    var frames = [];
    for (var iFrame = 0; iFrame < array.length; iFrame++) {
        // Assign parameters common to all frames made by this randomizer
        thisFrame = {};
        Object.assign(thisFrame, frameConfig.commonFrameProperties);

        // Assign parameters specific to this frame (allow to override
        // common parameters assigned above)
        Object.assign(thisFrame, array[iFrame]);

        thisFrame = resolveFrame(frameId, thisFrame)[0];
        frames.push(...thisFrame);
    }
    return [frames, {'frameList': array}];
};
export default randomizer;
