/*
 NOTE: you will need to manually add an entry for this file in addon/randomizers/index.js, e.g.:

import randomParameterSet from './random-parameter-set';
...
export default {
    ...
    random-parameter-set: randomParameterSet
}
 */

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
 * @class randomParameterSet
 */

var randomizer = function(/*frameId, frameConfig, pastSessions, resolveFrame*/) {
    // return [resolvedFrames, conditions]
};
export default randomizer;
