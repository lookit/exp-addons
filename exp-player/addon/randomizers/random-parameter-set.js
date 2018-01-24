/**
* @module exp-player
* @submodule randomizers
*/

import Ember from 'ember';

/**
* Randomizer to implement flexible condition assignment and counterbalancing by
* allowing the user to specify an arbitrary sequence of frames to create. A
* set of parameters is randomly selected from a list of available parameterSets,
* and these parameters are substituted in to the parameters specified in the
* list of frames.
*
* To use, define a frame with "kind": "choice" and "sampler": "random-parameter-set",
* as shown below, in addition to the parameters described under 'properties'.
*
* This
*
```json
"frames": {
    "test-trials": {
        "sampler": "random-parameter-set",
        "kind": "choice",
        "id": "test-trials",
        "commonFrameProperties": {
            "kind": "exp-lookit-story-page",
            "baseDir": "https://s3.amazonaws.com/lookitcontents/ingroupobligations/",
            "audioTypes": ["mp3", "ogg"],
            "doRecording": true,
            "autoProceed": false,
            "parentTextBlock": {
                "title": "Parents!",
                "text": "Common instructions across test trials here",
                "emph": true
            }
        },
        "frameList": [
            {
                "images": [
                    {
                        "id": "agent",
                        "src": "AGENTIMG1",
                        "left": "40",
                        "width": "20",
                        "top": "10"
                    },
                    {
                        "id": "left",
                        "src": "LEFTIMG1",
                        "left": "10",
                        "width": "20",
                        "top": "50"
                    },
                    {
                        "id": "right",
                        "src": "RIGHTIMG1",
                        "left": "70",
                        "width": "20",
                        "top": "50"
                    }
                ],
                "audioSources": [
                    {
                        "audioId": "questionaudio",
                        "sources": [{"stub": "QUESTION1AUDIO"}],
                        "highlights": "QUESTION1HIGHLIGHTS"
                    }
                ]
            },
            {
                "images": [
                    {
                        "id": "agent",
                        "src": "AGENTIMG2",
                        "left": "40",
                        "width": "20",
                        "top": "10"
                    },
                    {
                        "id": "left",
                        "src": "LEFTIMG2",
                        "left": "10",
                        "width": "20",
                        "top": "50"
                    },
                    {
                        "id": "right",
                        "src": "RIGHTIMG2",
                        "left": "70",
                        "width": "20",
                        "top": "50"
                    }
                ],
                "audioSources": [
                    {
                        "audioId": "questionaudio",
                        "sources": [{"stub": "QUESTION2AUDIO"}],
                        "highlights": "QUESTION2HIGHLIGHTS"
                    }
                ]
            }
        ],
        "parameterSets": [
            {
                "AGENTIMG1": "flurpagent1.jpg",
                "LEFTIMG1": "flurpvictim1.jpg",
                "RIGHTIMG1": "zazzvictim1.jpg",
                "QUESTION1AUDIO": "flurpleftmean1",
                "QUESTION1HIGHLIGHTS": [
                    {"range": [0.399293,	3.617124], "image": "agent"},
                    {"range": [5.085112,	6.811467], "image": "left"},
                    {"range": [6.905418,	8.702236], "image": "right"}
                ],
                "AGENTIMG2": "flurpagent2.jpg",
                "LEFTIMG2": "flurpvictim2.jpg",
                "RIGHTIMG2": "zazzvictim2.jpg",
                "QUESTION2AUDIO": "flurpleftinduct1",
                "QUESTION2HIGHLIGHTS": [
                    {"range": [0.372569,	5.309110], "image": "agent"},
                    {"range": [5.495395,	7.209213], "image": "left"},
                    {"range": [5.495395,	7.209213], "image": "right"},
                    {"range": [9.966225,	11.922212], "image": "left"},
                    {"range": [12.052612,	14.008600], "image": "right"}
                ]
            },
            {
                "AGENTIMG1": "zazzagent1.jpg",
                "LEFTIMG1": "flurpvictim1.jpg",
                "RIGHTIMG1": "zazzvictim1.jpg",
                "QUESTION1AUDIO": "zazzrightnice1",
                "QUESTION1HIGHLIGHTS": [
                    {"range": [0.348454,	3.736871], "image": "agent"},
                    {"range": [5.395033,	6.884975], "image": "left"},
                    {"range": [6.969085,	8.975701], "image": "right"}
                ],
                "AGENTIMG2": "zazzagent2.jpg",
                "LEFTIMG2": "flurpvictim2.jpg",
                "RIGHTIMG2": "zazzvictim2.jpg",
                "QUESTION2AUDIO": "zazzrightinduct1",
                "QUESTION2HIGHLIGHTS": [
                    {"range": [0.572920,	5.138376], "image": "agent"},
                    {"range": [5.335317,	7.089884], "image": "left"},
                    {"range": [5.335317,	7.089884], "image": "right"},
                    {"range": [9.721735,	11.565821], "image": "left"},
                    {"range": [11.655340,	13.535233], "image": "right"}
                ]
            }
        ],
        "parameterSetWeights": [1, 1]
    }
}

* ```
* @class randomParameterSet
*/

function getRandomElement(arr, weights) {
    var totalProb = weights.reduce((a, b) => a + b, 0);
    var randPos = Math.random() * totalProb;

    var weightSum = 0;
    for (var i = 0; i < arr.length; i++) {
        weightSum += weights[i];
        if (randPos <= weightSum) {
            return [i, arr[i]];
        }
    }
}

function replaceValues(obj, rep) {
    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (typeof obj[property] === 'object') {
                obj[property] = replaceValues(obj[property], rep);
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
     * the parameters for each frame in this session.
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
    if (!(frameConfig.hasOwnProperty('parameterSetWeights'))) {
        frameConfig.parameterSetWeights = new Array(frameConfig.parameterSets.length).fill(1);
    }

    var parameterData = getRandomElement(frameConfig.parameterSets, frameConfig.parameterSetWeights);
    var parameterSetIndex = parameterData[0];
    var parameterSet = parameterData[1];

    var frames = [];
    var thisFrame = {};

    for (var iFrame = 0; iFrame < frameConfig.frameList.length; iFrame++) {

        // Assign parameters common to all frames made by this randomizer.
        // Use deep copies to make sure that substitutions (replaceValues)
        // don't affect the original frameConfig values if they're objects
        // themselves!!
        thisFrame = {};
        Ember.$.extend(true, thisFrame, frameConfig.commonFrameProperties);

        // Assign parameters specific to this frame (allow to override
        // common parameters assigned above)
        Ember.$.extend(true, thisFrame, frameConfig.frameList[iFrame]);

        // Substitute any properties that can be replaced based on
        // the parameter set.
        thisFrame = replaceValues(thisFrame, parameterSet);

        // Assign frame ID
        thisFrame.id = `${frameId}`;

        thisFrame = resolveFrame(thisFrame.id, thisFrame)[0];
        frames.push(...thisFrame); // spread syntax important here -- a list of frames is returned by resolveFrame.
    }

    /**
     * Parameters captured and sent to the server
     *
     * @method conditions
     * @param {Number} conditionNum the index of the parameterSet chosen
     * @param {Object} parameterSet the parameterSet chosen
     */

    return [frames, {'conditionNum': parameterSetIndex, 'parameterSet': parameterSet}];

};
export default randomizer;

// Export helper functions to support unit testing
export { getRandomElement, replaceValues};
