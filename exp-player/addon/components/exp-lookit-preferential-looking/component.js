import Ember from 'ember';
import layout from './template';
import ExpFrameBaseUnsafeComponent from '../../components/exp-frame-base-unsafe/component';
import FullScreen from '../../mixins/full-screen';
import VideoRecord from '../../mixins/video-record';

let {
    $
} = Ember;

/**
 * @module exp-player
 * @submodule frames
 */

/**
 * Frame to implement a basic preferential looking trial, with static images
 * displayed in the center or at left and right of the screen. Trial proceeds
 * in segments:
 * - Intro: central attentiongrabber video (looping) & intro audio [wait until
 *   recording is established to move on, and a minimum amount of time]
 * - Test: image(s) displayed, any test audio played [set amount of time] OR
 * Calibration: calibration video displayed at center, left, right, center, each
 * for calibrationLength s.
 * - Final audio: central attentiongrabber video (looping) & final audio
 *   (optional section, intended for last trial in block)
 *
 * There are three basic uses of this frame expected:
 * - Familiarization trial with a single central image. Provide a value for
 * centerImage, but not rightImage or leftImage.
 * - Test trial with right and left images. Provide a value for rightImage and
 * leftImage, but not centerImage. (There is no explicit "preferential looking
 * vs. familiarization" switch: all of the images provided will be displayed.)
 * - Calibration trial. Set isCalibrationFrame to true, and provide
 * calibrationLength (length of each calibration segment in s),
 * calibrationVideoSources, and calibrationAudioSources.
 *
 * This frame extends ExpFrameBaseUnsafe because it is displayed fullscreen
 * and is expected to be repeated.

```json
 "frames": {
    "preferential-looking": {
        "kind": "exp-lookit-preferential-looking",
        "id": "pref-trial",
        "isCalibrationFrame": false,
        "allowPausingDuringTest": true,
        "baseDir": "https://s3.amazonaws.com/lookitcontents/labelsconcepts/",
        "audioTypes": ["mp3", "ogg"],
        "videoTypes": ["webm", "mp4"],
        "rightImage": "fam.jpg",
        "leftImage": "novel.jpg",
        "centerImage": "0001.jpg",
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
        "trialLength": 10,
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
        "calibrationLength": 3,
        "attnLength": 1,
        "endAudioSources": [
            {
                "src": "https://s3.amazonaws.com/lookitcontents/geometry/mp3/all_done.mp3",
                "type": "audio/mp3"
            },
            {
                "src": "https://s3.amazonaws.com/lookitcontents/geometry/ogg/all_done.ogg",
                "type": "audio/ogg"
            }
        ],
        "introAudioSources": [
            {
                "src": "https://s3.amazonaws.com/lookitcontents/geometry/mp3/chimes.mp3",
                "type": "audio/mp3"
            },
            {
                "src": "https://s3.amazonaws.com/lookitcontents/geometry/ogg/chimes.ogg",
                "type": "audio/ogg"
            }
        ],
        "testAudioSources": [
            {
                "stub": "Familiarization_find_dax_amplified_repeated"
            }
        ],
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

 * ```
 * @class ExpLookitPreferentialLooking
 * @extends ExpFrameBaseUnsafe
 * @uses FullScreen
 * @uses VideoRecord
 */

export default ExpFrameBaseUnsafeComponent.extend(FullScreen, VideoRecord,  {
    // In the Lookit use case, the frame BEFORE the one that goes fullscreen
    // must use "unsafe" saves (in order for the fullscreen event to register as
    // being user-initiated and not from a promise handler) #LEI-369.
    // exp-alternation frames are expected to be repeated, so they need to be
    // unsafe.
    type: 'exp-lookit-preferential-looking',
    layout: layout,
    displayFullscreen: true, // force fullscreen for all uses of this component
    fullScreenElementId: 'experiment-player',
    fsButtonID: 'fsButton',
    videoRecorder: Ember.inject.service(),
    recorder: null,
    hasCamAccess: Ember.computed.alias('recorder.hasCamAccess'),
    videoUploadConnected: Ember.computed.alias('recorder.connected'),

    // Track state of experiment
    completedAudio: false,
    completedAttn: false,
    currentSegment: 'intro', // 'calibration', 'test', 'finalaudio' (mutually exclusive)
    previousSegment: 'intro', // used when pausing/unpausing - refers to segment that study was paused during

    readyToStartCalibration: Ember.computed('hasCamAccess', 'videoUploadConnected', 'completedAudio', 'completedAttn',
        function() {
            return (this.get('hasCamAccess') && this.get('videoUploadConnected') && this.get('completedAttn') && (!this.get('hasBeenPaused') || this.get('completedAudio')));
        }),

    // helpers for use in template
    doingCalibration: Ember.computed('currentSegment', function() {
        return (this.get('currentSegment') === 'calibration');
    }),
    doingIntro: Ember.computed('currentSegment', function() {
        return (this.get('currentSegment') === 'intro');
    }),
    doingTest: Ember.computed('currentSegment', function() {
        return (this.get('currentSegment') === 'test');
    }),
    doingFinalAudio: Ember.computed('currentSegment', function() {
        return (this.get('currentSegment') === 'finalaudio');
    }),

    isPaused: false,
    hasBeenPaused: false,
    skipTest: false,

    // Timers for intro & stimuli
    introTimer: null, // minimum length of intro segment
    stimTimer: null,  // display of static images
    calTimer: null,   // display of calibration video

    meta: {
        name: 'ExpLookitPreferentialLooking',
        description: 'Frame to implement specific test trial structure for geometry alternation experiment. Includes announcement, calibration, and alternation (test) phases. During "alternation," two streams of triangles are shown, in rectangles on the left and right of the screen: one one side both size and shape change, on the other only size changes. Frame is displayed fullscreen and video recording is conducted during calibration/test.',
        parameters: {
            type: 'object',
            properties: {
                /**
                 * Whether to do calibration instead of a static image display.
                 * If this is true, then provide calibrationLength,
                 * calibrationAudioSources, and calibrationVideoSources as well.
                 *
                 * @property {Boolean} isCalibrationFrame
                 * @default false
                 */
                isCalibrationFrame: {
                    type: 'boolean',
                    default: false,
                    description: 'Whether to do calibration instead of a static image display'
                },
                /**
                 * Base directory for where to find stimuli. Any image src
                 * values that are not full paths will be expanded by prefixing
                 * with `baseDir` + `img/`. Any audio/video src values that give
                 * a value for 'stub' rather than 'src' and 'type' will be
                 * expanded out to
                 * `baseDir/avtype/[stub].avtype`, where the potential avtypes
                 * are given by audioTypes and videoTypes.
                 *
                 * Note that baseDir SHOULD include a trailing slash
                 * (e.g., `http://stimuli.org/myexperiment/`, not
                 * `http://stimuli.org/myexperiment`)
                 *
                 * @property {String} baseDir
                 * @default ''
                 */
                baseDir: {
                    type: 'string',
                    default: '',
                    description: 'Base directory for all stimuli'
                },
                /**
                 * List of audio types to expect for any audio specified just
                 * with a string rather than with a list of src/type pairs.
                 * If audioTypes is ['typeA', 'typeB'] and an audio source
                 * (e.g. introAudioSources) is given as [{'stub': 'intro'}],
                 * then introAudioSources will be expanded out to
                 *
```json
                 [
                        {
                            src: 'baseDir' + 'typeA/intro.typeA',
                            type: 'audio/typeA'
                        },
                        {
                            src: 'baseDir' + 'typeB/intro.typeB',
                            type: 'audio/typeB'
                        }
                ]
```
                 *
                 * @property {String[]} audioTypes
                 * @default ['mp3', 'ogg']
                 */
                audioTypes: {
                    type: 'array',
                    default: ['mp3', 'ogg'],
                    description: 'List of audio types to expect for any audio sources specified as strings rather than lists of src/type pairs'
                },
                /**
                 * List of video types to expect for any video specified just
                 * with a string rather than with a list of src/type pairs.
                 * If video is ['typeA', 'typeB'] and an video source
                 * is given as {['stub': 'attn']}, then
                 * the video source will be expanded out to
                 *
```json
                 [
                        {
                            src: 'baseDir' + 'typeA/attn.typeA',
                            type: 'video/typeA'
                        },
                        {
                            src: 'baseDir' + 'typeB/attn.typeB',
                            type: 'video/typeB'
                        }
                ]
```
                 *
                 * @property {String[]} videoTypes
                 * @default ['mp3', 'ogg']
                 */
                videoTypes: {
                    type: 'array',
                    default: ['webm', 'mp4'],
                    description: 'List of video types to expect for any video sources specified as strings rather than lists of src/type pairs'
                },
                /**
                 * Whether to allow user to pause the study during the test
                 * segment and restart from intro; otherwise, user can pause but
                 * this frame will end upon unpausing. Applies to pausing during
                 * both image display and calibration segments. Pausing is
                 * always allowed during the intro.
                 *
                 * @property {Boolean} allowPausingDuringTest
                 */
                allowPausingDuringTest: {
                    type: 'boolean',
                    description: 'Whether to allow user to pause the study during the test segment and restart from intro; otherwise, user can pause but this frame will end upon unpausing'
                },
                /**
                 * URL of image to show on left, if any. Can be a full URL or a
                 * stub that will be appended to `baseDir` + `img/` (see
                 * baseDir).
                 *
                 * @property {String} leftImage
                 */
                leftImage: {
                    type: 'string',
                    description: 'URL of image to show on left'
                },
                /**
                 * URL of image to show on right, if any. Can be a full URL or a
                 * stub that will be appended to `baseDir` + `img/` (see
                 * baseDir).
                 *
                 * @property {String} right
                 */
                rightImage: {
                    type: 'string',
                    description: 'URL of image to show on left'
                },
                /**
                 * URL of image to show at center, if any. Can be a full URL or
                 * a stub that will be appended to `baseDir` + `img/` (see
                 * baseDir).
                 *
                 * @property {String} centerImage
                 */
                centerImage: {
                    type: 'string',
                    description: 'URL of image to show on left'
                },
                /**
                 * minimum amount of time to show attention-getter in seconds.
                 * attention-getter intro video will be shown for at least this
                 * long, and also until any intro audio finishes playing and a
                 * webcam connection is established.
                 *
                 * @property {Number} attnLength
                 * @default 5
                 */
                attnLength: {
                    type: 'number',
                    description: 'minimum amount of time to show attention-getter in seconds',
                    default: 5
                },
                /**
                 * length of preferential looking trial in seconds. (Only used
                 * if not isCalibrationFrame.)
                 *
                 * @property {Number} trialLength
                 * @default 6
                 */
                trialLength: {
                    type: 'number',
                    description: 'length of preferential looking trial in seconds',
                    default: 6
                },
                /**
                 * length of single calibration segment in seconds (only used
                 * if isCalibrationFrame)
                 *
                 * @property {Number} calibrationLength
                 * @default 3
                 */
                calibrationLength: {
                    type: 'number',
                    description: 'length of single calibration segment in seconds',
                    default: 3
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects
                 * for audio played during test trial. (Only used if not
                 * isCalibrationFrame.)
                 *
                 * Can also give a single element {stub: 'filename'}, which will
                 * be expanded out to the appropriate array based on `baseDir`
                 * and `audioTypes` values; see `audioTypes`.
                 *
                 * @property {Object[]} testAudioSources
                 */
                testAudioSources: {
                    type: 'array',
                    description: 'List of objects specifying audio src and type for audio played during test trial',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            },
                            'stub': {
                                type: 'string'
                            }
                        }
                    }
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects
                 * for instructions or any other audio during attention-getter
                 * video
                 *
                 * Can also give a single element {stub: 'filename'}, which will
                 * be expanded out to the appropriate array based on `baseDir`
                 * and `audioTypes` values; see `audioTypes`.
                 *
                 * @property {Object[]} introAudioSources
                 */
                introAudioSources: {
                    type: 'array',
                    description: 'List of objects specifying audio src and type for instructions during attention-getter video',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            },
                            'stub': {
                                type: 'string'
                            }
                        }
                    }
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects
                 * for audio played after trial ends (optional, intended for
                 * use on last trial to let parents know they can open their
                 * eyes)
                 *
                 * Can also give a single element {stub: 'filename'}, which will
                 * be expanded out to the appropriate array based on `baseDir`
                 * and `audioTypes` values; see `audioTypes`.
                 *
                 * @property {Object[]} endAudioSources
                 */
                endAudioSources: {
                    type: 'array',
                    description: 'Supply this to play audio at the end of the trial; list of objects specifying audio src and type',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            },
                            'stub': {
                                type: 'string'
                            }
                        }
                    }
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects
                 * for calibration audio, played from start during each
                 * calibration segment (only used if isCalibrationFrame)
                 *
                 * Can also give a single element {stub: 'filename'}, which will
                 * be expanded out to the appropriate array based on `baseDir`
                 * and `audioTypes` values; see `audioTypes`.
                 *
                 * @property {Object[]} calibrationAudioSources
                 */
                calibrationAudioSources: {
                    type: 'array',
                    description: 'list of objects specifying audio src and type for calibration audio',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            },
                            'stub': {
                                type: 'string'
                            }
                        }
                    }
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects
                 * for calibration video, played from start during each
                 * calibration segment (only used if isCalibrationFrame)
                 *
                 * Can also give a single element {stub: 'filename'}, which will
                 * be expanded out to the appropriate array based on `baseDir`
                 * and `videoTypes` values; see `videoTypes`.
                 *
                 * @property {Object[]} calibrationVideoSources
                 */
                calibrationVideoSources: {
                    type: 'array',
                    description: 'list of objects specifying video src and type for calibration video',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            },
                            'stub': {
                                type: 'string'
                            }
                        }
                    }
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects
                 * for attention-getter video
                 *
                 * Can also give a single element {stub: 'filename'}, which will
                 * be expanded out to the appropriate array based on `baseDir`
                 * and `videoTypes` values; see `videoTypes`.
                 *
                 * @property {Object[]} videoSources
                 */
                videoSources: {
                    type: 'array',
                    description: 'List of objects specifying video src and type for attention-getter video',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            },
                            'stub': {
                                type: 'string'
                            }
                        }
                    }
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
                 * audio played upon pausing study
                 *
                 * Can also give a single element {stub: 'filename'}, which will
                 * be expanded out to the appropriate array based on `baseDir`
                 * and `audioTypes` values; see `audioTypes`.
                 *
                 * @property {Object[]} pauseAudio
                 */
                pauseAudio: {
                    type: 'array',
                    description: 'List of objects specifying audio src and type for audio played when pausing study',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            },
                            'stub': {
                                type: 'string'
                            }
                        }
                    }
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
                 * audio played upon resuming study
                 *
                 * Can also give a single element {stub: 'filename'}, which will
                 * be expanded out to the appropriate array based on `baseDir`
                 * and `audioTypes` values; see `audioTypes`.
                 *
                 * @property {Object[]} unpauseAudio
                 */
                unpauseAudio: {
                    type: 'array',
                    description: 'List of objects specifying audio src and type for audio played when pausing study',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            },
                            'stub': {
                                type: 'string'
                            }
                        }
                    }
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
                 * audio played when study is paused due to not being fullscreen
                 *
                 * Can also give a single element {stub: 'filename'}, which will
                 * be expanded out to the appropriate array based on `baseDir`
                 * and `audioTypes` values; see `audioTypes`.
                 *
                 * @property {Object[]} fsAudio
                 */
                fsAudio: {
                    type: 'array',
                    description: 'List of objects specifying audio src and type for audio played when pausing study if study is not fullscreen',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            },
                            'stub': {
                                type: 'string'
                            }
                        }
                    }
                }
            }
        },
        data: {
            /**
             * Parameters captured and sent to the server
             *
             * @method serializeContent
             * @param {String} videoID The ID of any video recorded during this frame
             * @param {Boolean} hasBeenPaused whether this trial was paused
             * @param {Boolean} isCalibrationFrame whether this is a calibration frame (given as a property of the frame)
             * @param {Boolean} allowPausingDuringTest whether the user can return to the test/calibration period after pausing (given as a property of the frame)
             * @param {String} rightImage URL of image shown on right (given as a property of the frame)
             * @param {String} leftImage URL of image shown on left (given as a property of the frame)
             * @param {String} centerImage URL of image shown at center (given as a property of the frame)
             * @param {Number} trialLength seconds to display images if this is a test trial (given as a property of the frame)
             * @param {Number} calibrationLength s to display calibration video in each of four locations if this is a calibration trial (given as a property of the frame)
             * @param {Object[]} testAudioSources Array of {src: 'url', type: 'MIMEtype'} objects for audio played during test trial (given as a property of the frame)
             * @param {Object} eventTimings
             * @return {Object} The payload sent to the server
             */
            type: 'object',
            properties: {
                videoId: {
                    type: 'string'
                },
                hasBeenPaused: {
                    type: 'boolean'
                },
                isCalibrationFrame: {
                    type: 'boolean'
                },
                allowPausingDuringTest: {
                    type: 'boolean'
                },
                rightImage: {
                    type: 'string'
                },
                leftImage: {
                    type: 'string'
                },
                centerImage: {
                    type: 'string'
                },
                trialLength: {
                    type: 'number'
                },
                testAudioSources: {
                    type: 'object'
                },
                calibrationLength: {
                    type: 'number'
                }
            }
        }
    },

    calObserver: Ember.observer('readyToStartCalibration', function(frame) {
        if (frame.get('readyToStartCalibration') && frame.get('currentSegment') === 'intro') {

            if (!this.get('skipTest')) {
                frame.set('currentSegment', 'test');
                frame.startTrial();
            } else {
                frame.endTrial();
            }
        }
    }),

    actions: {

        // When intro audio is complete
        completedIntroAudio() {
            this.set('completedAudio', true);
            this.notifyPropertyChange('readyToStartCalibration');
        },

        next() {
            this.stopRecorder();
            this._super(...arguments);
        }

    },

    // Utility to expand stubs into either full URLs (for images) or
    // array of {src: 'url', type: 'MIMEtype'} objects (for audio/video).
    // Updates this['propertyName'] based on the appropriate type, which should
    // be 'audio', 'video', or 'image'.
    expandAsset(propertyName, type) {

        if (this.hasOwnProperty(propertyName)) {

            var asset = this[propertyName];
            var fullAsset = asset;
            var _this = this;

            if (type === 'image' && typeof asset === 'string' && !(asset.includes('://'))) {
                // Image: replace stub with full URL if needed
                fullAsset = this.baseDir + 'img/' + asset;
            } else if (type === 'audio' || type === 'video') {
                // Audio/video: replace any source objects that have a
                // 'stub' attribute with the appropriate expanded source
                // objects
                fullAsset = [];

                var types = [];
                if (type === 'audio') {
                    types = this.audioTypes;
                } else {
                    types = this.videoTypes;
                }

                asset.forEach(function(srcObj) {
                    if (srcObj.hasOwnProperty('stub')) {
                        for (var iType = 0; iType < types.length; iType++) {
                            fullAsset.push({
                                src: _this.baseDir + types[iType] + '/' + srcObj.stub + '.' + types[iType],
                                type: type + '/' + types[iType]
                            });
                        }
                    } else {
                        fullAsset.push(srcObj);
                    }
                });
            }

            this.set(propertyName + '_parsed', fullAsset);

        }
    },

    startIntro() {

        var _this = this;

        /**
         * Just before starting intro segment
         *
         * @event startIntro
         */
        _this.send('setTimeEvent', 'startIntro');
        $('#player-video')[0].play();

        // Set a timer for the minimum length for the intro/break
        $('#player-audio')[0].currentTime = 0;
        $('#player-audio')[0].play();

        _this.set('introTimer', window.setTimeout(function() {
            _this.set('completedAttn', true);
            _this.notifyPropertyChange('readyToStartCalibration');
        }, _this.get('attnLength') * 1000));

    },

    startCalibration() {
        var _this = this;

        var calAudio = $('#player-calibration-audio')[0];
        var calVideo = $('#player-calibration-video')[0];

        $('#player-calibration-video').show();

        // Show the calibration segment at center, left, right, center, each
        // time recording an event and playing the calibration audio.
        var doCalibrationSegments = function(calList, lastLoc) {
            if (calList.length === 0) {
                $('#player-calibration-video').hide();
                _this.endTrial();
            } else {
                var thisLoc = calList.shift();
                /**
                 * Start of EACH calibration segment
                 *
                 * @event startCalibration
                 * @param {String} location location of calibration ball, relative to child: 'left', 'right', or 'center'
                 */
                _this.send('setTimeEvent', 'startCalibration',
                    {location: thisLoc});
                calAudio.pause();
                calAudio.currentTime = 0;
                calAudio.play();
                calVideo.pause();
                calVideo.currentTime = 0;
                calVideo.play();
                $('#player-calibration-video').removeClass(lastLoc);
                $('#player-calibration-video').addClass(thisLoc);
                _this.set('calTimer', window.setTimeout(function() {
                    doCalibrationSegments(calList, thisLoc);
                }, 1000 * _this.get('calibrationLength')));
            }
        };

        $('#player-calibration-video').removeClass('left right');
        $('#player-calibration-video').addClass('center');
        doCalibrationSegments(['center', 'left', 'right', 'center'], '');

    },

    startTrial() {

        var _this = this;

        _this.send('setTimeEvent', 'startTestTrial');

        if (_this.get('isCalibrationFrame')) { // Calibration frame
            _this.set('currentSegment', 'calibration');
            _this.startCalibration();
        } else { // Regular static image preferential looking frame
            $('#allstimuli').show();
            _this.set('currentSegment', 'test');

            var $audioPlayer = $('#player-test-audio');
            $audioPlayer[0].currentTime = 0;
            $audioPlayer[0].play();

            // Now presenting stimuli; stop after trial length.
            _this.set('stimTimer', window.setTimeout(function() {
                    window.clearTimeout(_this.get('stimTimer'));
                    $audioPlayer[0].pause();
                    $('#allstimuli').hide();
                    _this.endTrial();
                }, _this.trialLength * 1000));
        }
    },

    // When stimuli have been shown for time indicated: play end-audio if
    // present, or just move on.
    endTrial() {
        // Don't allow pausing anymore
        $(document).off('keyup.pauser');
        this.stopRecorder();
        if (this.get('endAudioSources').length) {
            this.set('currentSegment', 'finalaudio');
            $('#player-endaudio')[0].play();
        } else {
            this.send('next');
        }
    },

    makeTimeEvent(eventName, extra) {
        return this._super(`exp-lookit-preferential-looking:${eventName}`, extra);
    },

    onFullscreen() {
        if (this.get('isDestroyed')) {
            return;
        }
        this._super(...arguments);
        if (!this.checkFullscreen()) {
            if (!(this.get('isPaused')) && (this.get('currentSegment') !== 'finalaudio')) {
                this.pauseStudy();
            }
        }
    },

    handleSpace(event, frame) {
        // Only pause/unpause on space if study is fullscreen (or not currently paused)
        if (frame.checkFullscreen() || !frame.isPaused) {
            if (event.which === 32) { // space
                frame.pauseStudy();
            }
        }
    },

    // Pause/unpause study.
    pauseStudy() {

        Ember.run.once(this, () => {
            // Only "count" as pausing if outside of intro segment
            if (!this.get('allowPausingDuringTest') && (this.get('currentSegment') !== 'intro')) {
                this.set('skipTest', true);
            }

            this.set('hasBeenPaused', true);
            var wasPaused = this.get('isPaused');

            if (wasPaused) { // Currently paused: RESUME
                $('#player-pause-audio, #player-pause-audio-leftfs').each(function() {
                    this.pause();
                    this.currentTime = 0;
                });

                try {
                    this.resumeRecorder();
                } catch (_) {
                    return;
                }
                this.set('isPaused', false);
                this.startIntro();

            } else { // Not currently paused: PAUSE

                this.set('previousSegment', this.get('currentSegment'));
                this.set('currentSegment', 'intro');

                $('audio, video:not(#player-video)').each(function() {
                    this.pause();
                    this.currentTime = 0;
                });

                $('#allstimuli').hide();
                $('#player-calibration-video').hide();

                this.set('completedAudio', false);
                this.set('completedAttn', false);

                window.clearTimeout(this.get('introTimer'));
                window.clearTimeout(this.get('stimTimer'));
                window.clearTimeout(this.get('calTimer'));

                this.pauseRecorder(true);

                if (this.checkFullscreen()) {
                    $('#player-pause-audio')[0].play();
                } else {
                    $('#player-pause-audio-leftfs')[0].play();
                }
                this.set('isPaused', true);
            }
        });

    },

    didInsertElement() {
        this._super(...arguments);

        // Expand any stubs given for image, audio, or video sources, based on
        // baseDir and audioTypes/videoTypes.
        var _this = this;
        ['rightImage', 'leftImage', 'centerImage'].forEach(function(prop) {
            _this.expandAsset(prop, 'image');
        });

        ['testAudioSources',
         'introAudioSources',
         'endAudioSources',
         'calibrationAudioSources',
         'pauseAudio',
         'unpauseAudio',
         'fsAudio'].forEach(function(prop) {
            _this.expandAsset(prop, 'audio');
        });

        ['calibrationVideoSources',
         'videoSources'].forEach(function(prop) {
            _this.expandAsset(prop, 'video');
        });

        // Begin frame. Actual test trial will start once recording is ready.
        this.send('showFullscreen');
        $(document).on('keyup.pauser', function(e) {_this.handleSpace(e, _this);});
        this.startIntro();

        if (this.get('experiment') && this.get('id') && this.get('session')) {
            const installPromise = this.setupRecorder(this.$('#videoRecorder'), true, {
                hidden: true
            });
            installPromise.then(() => {
                /**
                 * When video recorder has been installed
                 *
                 * @event recorderReady
                 */
                this.send('setTimeEvent', 'recorderReady');
            });
        }
    },

    willDestroyElement() {
        this.send('setTimeEvent', 'destroyingElement');

        // Whenever the component is destroyed, make sure that event handlers are removed and video recorder is stopped
        const recorder = this.get('recorder');
        if (recorder) {
            recorder.hide(); // Hide the webcam config screen
            this.stopRecorder();
        }
        // Remove pause handler
        $(document).off('keyup.pauser');

        this._super(...arguments);
    }

});
