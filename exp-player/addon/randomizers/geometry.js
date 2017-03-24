/**
* @module exp-player
* @submodule randomizers
*/

/**
* Randomizer to implement counterbalancing for geometry alternation study.
* To use, define a frame with "kind": "choice" and "sampler": "geometry",
* as shown below, in addition to the parameters described under 'properties'.
*
```json
"frames": {
     "alt-trials": {
        "sampler": "geometry",
        "kind": "choice",
        "frameType": "exp-lookit-geometry-alternation",
        "counterbalance": {
            "startPositions": [
                "left",
                "right"
            ],
            "contexts": [
                "fat",
                "skinny"
            ]
        },
        "frameOptions": {
            "triangleLineWidth": 8,
            "calibrationVideoSources": [
                {
                    "src": "https://s3.amazonaws.com/lookitcontents/geometry/webm/attention.webm",
                    "type": "video/webm"
                },
                {
                    "src": "https://s3.amazonaws.com/lookitcontents/geometry/mp4/attention.mp4",
                    "type": "video/mp4"
                }
            ],
            "trialLength": 60,
            "attnLength": 10,
            "calibrationLength": 3000,
            "fsAudio": [
                {
                    "src": "https://s3.amazonaws.com/lookitcontents/geometry/mp3/fullscreen.mp3",
                    "type": "audio/mp3"
                },
                {
                    "src": "https://s3.amazonaws.com/lookitcontents/geometry/ogg/fullscreen.ogg",
                    "type": "audio/ogg"
                }
            ],
            "triangleColor": "#056090",
            "unpauseAudio": [
                {
                    "src": "https://s3.amazonaws.com/lookitcontents/geometry/mp3/return_after_pause.mp3",
                    "type": "audio/mp3"
                },
                {
                    "src": "https://s3.amazonaws.com/lookitcontents/geometry/ogg/return_after_pause.ogg",
                    "type": "audio/ogg"
                }
            ],
            "pauseAudio": [
                {
                    "src": "https://s3.amazonaws.com/lookitcontents/geometry/mp3/pause.mp3",
                    "type": "audio/mp3"
                },
                {
                    "src": "https://s3.amazonaws.com/lookitcontents/geometry/ogg/pause.ogg",
                    "type": "audio/ogg"
                }
            ],
            "videoSources": [
                {
                    "src": "https://s3.amazonaws.com/lookitcontents/exp-physics-final/stimuli/attention/webm/attentiongrabber.webm",
                    "type": "video/webm"
                },
                {
                    "src": "https://s3.amazonaws.com/lookitcontents/exp-physics-final/stimuli/attention/mp4/attentiongrabber.mp4",
                    "type": "video/mp4"
                }
            ],
            "musicSources": [
                {
                    "src": "https://s3.amazonaws.com/lookitcontents/geometry/mp3/happy-stroll.mp3",
                    "type": "audio/mp3"
                },
                {
                    "src": "https://s3.amazonaws.com/lookitcontents/geometry/ogg/happy-stroll.ogg",
                    "type": "audio/ogg"
                }
            ],
            "calibrationAudioSources": [
                {
                    "src": "https://s3.amazonaws.com/lookitcontents/geometry/mp3/chimes.mp3",
                    "type": "audio/mp3"
                },
                {
                    "src": "https://s3.amazonaws.com/lookitcontents/geometry/ogg/chimes.ogg",
                    "type": "audio/ogg"
                }
            ]
        }
    }
}

* ```
* @class geometry
*/

var getRandomElement = function(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
};

var randomizer = function(frameId, frame) {

    /**
     * Object describing possible values for counterbalancing conditions.
     *
     * @property {Object} counterbalance
     *   @param {String[]} startPositions list of starting positions
     *      for the triangle stream which alternates in both size and shape.
     *      (array of strings; options are 'left' and 'right')
     *   @param {String[]} contextOptions list of context triangle options
     *      (array of strings; options for context are 'fat', 'skinny')
     */

    var positionOptions = frame.counterbalance.startPositions;
    var contextOptions  = frame.counterbalance.contexts;

    var position = getRandomElement(positionOptions);
    var context  = getRandomElement(contextOptions);

    position = (position === 'left');
    context  = (context  === 'fat');

    var frames = [];
    var thisFrame = {};
    for (var iFrame = 0; iFrame < 4; iFrame++) {
        thisFrame = {
            /**
             * Type of frame to use, e.g. 'exp-lookit-geometry-alternation'
             *
             * @property {String} frameType
             */
            kind: frame.frameType,
            id: `${frameId}`,
            altOnLeft: position,
            context: context,
            audioSources: [
                {
                    'type': 'audio/mp3',
                    'src': 'https://s3.amazonaws.com/lookitcontents/geometry/mp3/video_0' + (iFrame + 1) + '.mp3'
                },
                {
                    'type': 'audio/ogg',
                    'src': 'https://s3.amazonaws.com/lookitcontents/geometry/ogg/video_0' + (iFrame + 1) + '.ogg'
                }
            ]
        };
        if (iFrame === 3) {
            thisFrame.endAudioSources = [
                {
                    'type': 'audio/mp3',
                    'src': 'https://s3.amazonaws.com/lookitcontents/geometry/mp3/all_done.mp3'
                },
                {
                    'type': 'audio/ogg',
                    'src': 'https://s3.amazonaws.com/lookitcontents/geometry/ogg/all_done.ogg'
                }
            ];
        }

        /**
         * Object describing common parameters to use in EVERY frame created
         * by this randomizer. Parameter names and values are as described in
         * the documentation for the frameType used; see example above.
         *
         * @property {Object} frameOptions
         */

        Object.assign(thisFrame, frame.frameOptions);

        position = !position;
        //[thisFrame,] = resolveFrame(null, thisFrame);
        frames.push(thisFrame);
    }

    return [frames, {'position': position, 'context': context}];

    // Short version for testing
    //return [[frames[0]], {'position': position, 'context': context}];

    // Random choice...
    // Pick one option at random
    //var sample = Math.floor(Math.random() * frame.options.length);
    //var choice = frame.options[sample];

    // jscs:disable
    //var [frames,] = resolveFrame(choice);
    //return [frames, choice];

    //lib/exp-player/addon/utils/parse-experiment.js

};
export default randomizer;
