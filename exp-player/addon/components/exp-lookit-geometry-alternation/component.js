import Ember from 'ember';
import layout from './template';
import ExpFrameBaseComponent from '../../components/exp-frame-base/component';
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
 * Deprecated: not yet adapted for use with webrtc recorder. Currently kept in codebase
 * as an example of generating & drawing stimuli on the fly, but can be safely removed.
 *
 * Frame to implement specific test trial structure for geometry alternation
 * experiment. Includes announcement, calibration, and alternation (test)
 * phases. During "alternation," two streams of triangles are shown, in
 * rectangles on the left and right of the screen: one one side both size and
 * shape change, on the other only size changes. Frame is displayed fullscreen
 * and video recording is conducted during calibration/test.
 *
 * The geometry randomizer generates a series of ExpLookitGeometryAlternation
 * frames.
 *

```json
 "frames": {
    "alt-trial": {
        "kind": "exp-lookit-geometry-alternation",
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
        ],
        "altOnLeft": true,
        "context": true,
        "audioSources": [
            {
                "type": "audio/mp3",
                "src": "https://s3.amazonaws.com/lookitcontents/geometry/mp3/video_01.mp3"
            },
            {
                "type": "audio/ogg",
                "src": "https://s3.amazonaws.com/lookitcontents/geometry/ogg/video_01.ogg"
            }
        ],
        "endAudioSources": [
            {
                "type": 'audio/mp3',
                "src": "https://s3.amazonaws.com/lookitcontents/geometry/mp3/all_done.mp3"
            },
            {
                "type": "audio/ogg",
                "src": "https://s3.amazonaws.com/lookitcontents/geometry/ogg/all_done.ogg"
            }
        ]
    }
 }

 * ```
 * @class ExpLookitGeometryAlternation
 * @extends ExpFrameBase
 * @uses FullScreen
 * @uses VideoRecord
 */

export default ExpFrameBaseComponent.extend(FullScreen, VideoRecord,  {
    type: 'exp-lookit-geometry-alternation',
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
    currentSegment: 'intro', // 'calibration', 'test' (mutually exclusive)

    readyToStartCalibration: Ember.computed('hasCamAccess', 'videoUploadConnected', 'completedAudio', 'completedAttn',
        function() {
            return (this.get('hasCamAccess') && this.get('videoUploadConnected') && this.get('completedAudio') && this.get('completedAttn'));
        }),

    // used only by template
    doingCalibration: Ember.computed('currentSegment', function() {
        return (this.get('currentSegment') === 'calibration');
    }),
    doingIntro: Ember.computed('currentSegment', function() {
        return (this.get('currentSegment') === 'intro');
    }),

    isPaused: false,
    hasBeenPaused: false,

    // Timers for intro & stimuli
    introTimer: null, // minimum length of intro segment
    stimTimer: null,

    // Store data about triangles to show, display lengths, etc. in frame
    settings: null,
    triangleBases: null,

    meta: {
        name: 'ExpLookitGeometryAlternation',
        description: 'Frame to implement specific test trial structure for geometry alternation experiment. Includes announcement, calibration, and alternation (test) phases. During "alternation," two streams of triangles are shown, in rectangles on the left and right of the screen: one one side both size and shape change, on the other only size changes. Frame is displayed fullscreen and video recording is conducted during calibration/test.',
        parameters: {
            type: 'object',
            properties: {
                /**
                 * True to use big fat triangle as context figure, or false to use small skinny triangle as context.
                 *
                 * @property {Boolean} context
                 * @default true
                 */
                context: {
                    type: 'boolean',
                    description: 'True to use big fat triangle as context, or false to use small skinny triangle as context.',
                    default: true
                },
                /**
                 * Whether to put the shape+size alternating stream on the left (other stream alternates only in size)
                 *
                 * @property {Boolean} altOnLeft
                 * @default true
                */
                altOnLeft: {
                    type: 'boolean',
                    description: 'Whether to put the shape+size alternating stream on the left.',
                    default: true
                },
                /**
                 * color of triangle outline (3 or 6 char hex, starting with #)
                 *
                 * @property {String} triangleColor
                 * @default '#056090'
                 */
                triangleColor: {
                    type: 'string',
                    description: 'color of triangle outline (3 or 6 char hex, starting with #)',
                    default: '#056090'
                },
                /**
                 * triangle line width in pixels
                 *
                 * @property {Integer} triangleLineWidth
                 * @default 5
                 */
                triangleLineWidth: {
                    type: 'integer',
                    description: 'triangle line width in pixels',
                    default: 5
                },
                /**
                 * minimum amount of time to show attention-getter in seconds
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
                 * length of alternation trial in seconds
                 *
                 * @property {Number} trialLength
                 * @default 6
                 */
                trialLength: {
                    type: 'number',
                    description: 'length of alternation trial in seconds',
                    default: 6
                },
                /**
                 * length of single calibration segment in ms
                 *
                 * @property {Number} calibrationLength
                 * @default 3000
                 */
                calibrationLength: {
                    type: 'number',
                    description: 'length of single calibration segment in ms',
                    default: 3000
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
                 * instructions during attention-getter video
                 *
                 * @property {Object[]} audioSources
                 */
                audioSources: {
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
                            }
                        }
                    }
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
                 * music during trial
                 *
                 * @property {Object[]} musicSources
                 */
                musicSources: {
                    type: 'array',
                    description: 'List of objects specifying audio src and type for music during trial',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            }
                        }
                    }
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
                 * audio after completion of trial (optional; used for last
                 * trial "okay to open your eyes now" announcement)
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
                            }
                        }
                    }
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
                 * calibration audio (played 4 times during calibration)
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
                            }
                        }
                    }
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
                 * calibration video (played from start 4 times during
                 * calibration)
                 *
                 * @property {Object[]} calibrationVideoSources
                 */
                calibrationVideoSources: {
                    type: 'array',
                    description: 'list of objects specifying video src and type for calibration audio',
                    default: [],
                    items: {
                        type: 'object',
                        properties: {
                            'src': {
                                type: 'string'
                            },
                            'type': {
                                type: 'string'
                            }
                        }
                    }
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
                 * attention-getter video (should be loopable)
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
                            }
                        }
                    }
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
                 * audio played upon pausing study
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
                            }
                        }
                    }
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
                 * audio played upon unpausing study
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
                            }
                        }
                    }
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects for
                 * audio played when study is paused due to not being fullscreen
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
             * @param {Boolean} context True to use big fat triangle as context figure, or false to use small skinny triangle as context. [same as passed to this frame]
             * @param {Boolean} altOnLeft Whether to put the shape+size alternating stream on the left (other stream alternates only in size) [same as passed to this frame]
             * @param {String} videoID The ID of any video recorded during this frame
             * @param {Boolean} hasBeenPaused whether this trial was paused
             * @param {Object} eventTimings
             * @return {Object} The payload sent to the server
             */
            type: 'object',
            properties: {
                context: {
                    type: 'boolean'
                },
                altOnLeft: {
                    type: 'boolean'
                },
                videoId: {
                    type: 'string'
                },
                hasBeenPaused: {
                    type: 'boolean'
                }
            }
        }
    },

    calObserver: Ember.observer('readyToStartCalibration', function(frame) {
        if (frame.get('readyToStartCalibration') && frame.get('currentSegment') === 'intro') {
            if (!frame.checkFullscreen()) {
                frame.pauseStudy();
            } else {
                frame.set('currentSegment', 'calibration');
            }
        }
    }),

    segmentObserver: Ember.observer('currentSegment', function(frame) {
        // Don't trigger starting intro; that'll be done manually.
        if (frame.get('currentSegment') === 'calibration') {
            frame.startCalibration();
        } else if (frame.get('currentSegment') === 'test') {
            frame.startTrial();
        }
    }),

    actions: {
        // When intro audio is complete
        endAudio() {
            this.set('completedAudio', true);
            this.notifyPropertyChange('readyToStartCalibration');
        },

        next() {
            /**
             * Just before stopping webcam video capture
             *
             * @event stoppingCapture
             */
            this.stopRecorder();
            this._super(...arguments);
        }

    },

    startIntro() {
        // Allow pausing during intro
        var _this = this;
        $(document).off('keyup.pauser');
        $(document).on('keyup.pauser', function(e) {_this.handleSpace(e, _this);});

        // Start placeholder video right away
        /**
         * Immediately before starting intro/announcement segment
         *
         * @event startIntro
         */
        this.send('setTimeEvent', 'startIntro');
        $('#player-video')[0].play();

        // Set a timer for the minimum length for the intro/break
        $('#player-audio')[0].play();
        this.set('introTimer', window.setTimeout(function() {
            _this.set('completedAttn', true);
            _this.notifyPropertyChange('readyToStartCalibration');
        }, _this.get('attnLength') * 1000));

    },

    startCalibration() {
        var _this = this;

        // Don't allow pausing during calibration/test.
        $(document).off('keyup.pauser');

        var calAudio = $('#player-calibration-audio')[0];
        var calVideo = $('#player-calibration-video')[0];
        $('#player-calibration-video').show();

        // Show the calibration segment at center, left, right, center, each
        // time recording an event and playing the calibration audio.
        var doCalibrationSegments = function(calList, lastLoc) {
            if (calList.length === 0) {
                $('#player-calibration-video').hide();
                _this.set('currentSegment', 'test');
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
                window.setTimeout(function() {
                    doCalibrationSegments(calList, thisLoc);
                }, _this.settings.calLength);
            }
        };

        doCalibrationSegments(['center', 'left', 'right', 'center'], '');

    },

    startTrial() {

        var _this = this;
        /**
         * Immediately before starting test trial segment
         *
         * @event startTestTrial
         */
        _this.send('setTimeEvent', 'startTestTrial');

        // Begin playing music; fade in and set to fade out at end of trial
        var $musicPlayer = $('#player-music');
        $musicPlayer.prop('volume', 0.1);
        $musicPlayer[0].play();
        $musicPlayer.animate({volume: 1}, _this.settings.musicFadeLength);
        window.setTimeout(function() {
            $musicPlayer.animate({volume: 0}, _this.settings.musicFadeLength);
        }, _this.settings.trialLength * 1000 - _this.settings.musicFadeLength);

        // Start presenting triangles and set to stop after trial length
        _this.presentTriangles(_this.settings.LshapesStart,
                                        _this.settings.RshapesStart,
                                        _this.settings.LsizeBaseStart,
                                        _this.settings.RsizeBaseStart);
        window.setTimeout(function() {
                window.clearTimeout(_this.get('stimTimer'));
                _this.clearTriangles();
                _this.endTrial();
            }, _this.settings.trialLength * 1000);
    },

    // When triangles have been shown for time indicated: play end-audio if
    // present, or just move on.
    endTrial() {
        this.stopRecorder();
        if (this.get('endAudioSources').length) {
            $('#player-endaudio')[0].play();
        } else {
            this.send('next');
        }
    },

    getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    getRandom(min, max) {
        return Math.random() * (max - min) + min;
    },

    drawTriangles(Lshape, LX, LY, LRot, LFlip, LSize, Rshape, RX, RY, RRot, RFlip, RSize) {
        /**
         * records EACH triangle presentation during test trial
         *
         * @event videoStreamConnection
         * @param {String} Lshape shape of left triangle: 'skinny' or 'fat'
         * @param {String} Rshape shape of right triangle: 'skinny' or 'fat'
         * @param {Number} LX Horizontal offset of left triangle from rectangle center, in units where rectangle width = 70; positive = to right
         * @param {Number} LY Vertical offset of left triangle from rectangle center, in units where rectangle height = 100.8; positive = down
         * @param {Number} RX Horizontal offset of right triangle from rectangle center, in units where screen width = 200 and rectangle width = 70; positive = to right
         * @param {Number} RY Vertical offset of right triangle from rectangle center, in units where rectangle height = 100.8; positive = down
         * @param {Number} LRot rotation of left triangle in degrees. 0 degrees has long side horizontal and 15 degree angle (skinny triangle) or 60 degree angle (fat triangle) on left.
         * @param {Number} RRot rotation of right triangle in degrees. 0 degrees has long side horizontal and 15 degree angle (skinny triangle) or 60 degree angle (fat triangle) on left.
         * @param {Number} LFlip whether left triangle is flipped (1 = no, -1 = yes)
         * @param {Number} RFlip whether right triangle is flipped (1 = no, -1 = yes)
         * @param {Number} LSize size of left triangle, relative to standard ('standard' sizes are set so that areas of skinny & fat triangles are equal), in terms of side length (e.g. for a rectangle, 2 would mean take a 1x3 rectangle and make it a 2x6 rectangle, quadrupling the area)
         * @param {Number} RSize size of right triangle, relative to standard ('standard' sizes are set so that areas of skinny & fat triangles are equal), in terms of side length (e.g. for a rectangle, 2 would mean take a 1x3 rectangle and make it a 2x6 rectangle, quadrupling the area)
         */
        this.send('setTimeEvent', 'presentTriangles', {
                Lshape: Lshape,
                LX: LX,
                LY: LY,
                LRot: LRot,
                LFlip: LFlip,
                LSize: LSize,
                Rshape: Rshape,
                RX: RX,
                RY: RY,
                RRot: RRot,
                RFlip: RFlip,
                RSize: RSize
            });

        var leftTriangle = `${this.triangleBases[Lshape]}
            transform=" translate(${LX}, ${LY})
                        translate(37.5, 56)
                        rotate(${LRot})
                        scale(${LFlip * LSize})" />`;
        var rightTriangle = `${this.triangleBases[Rshape]}
            transform=" translate(${RX}, ${RY})
                        translate(162.5, 56)
                        rotate(${RRot})
                        scale(${RFlip * RSize})" />`;
        $('#stimuli').html(leftTriangle + rightTriangle);
    },

    clearTriangles() {
        /**
         * Records each time triangles are cleared from display
         *
         * @event clearTriangles
        */
        this.send('setTimeEvent', 'clearTriangles');
        $('#stimuli').html('');
    },

    presentTriangles(Lshapes, Rshapes, LsizeBase, RsizeBase) {
        // select X and Y positions for each shape
        var LX = this.getRandom(this.settings.XRange[0],
                                this.settings.XRange[1]);
        var RX = this.getRandom(this.settings.XRange[0],
                                this.settings.XRange[1]);
        var LY = this.getRandom(this.settings.YRange[0],
                                this.settings.YRange[1]);
        var RY = this.getRandom(this.settings.YRange[0],
                                this.settings.YRange[1]);
        // select rotation, flip, size per shape
        var LRot = this.getRandom(this.settings.rotRange[0],
                                  this.settings.rotRange[1]);
        var RRot = this.getRandom(this.settings.rotRange[0],
                                  this.settings.rotRange[1]);
        var LFlip = this.getRandomElement(this.settings.flipVals);
        var RFlip = this.getRandomElement(this.settings.flipVals);
        var LSize = this.getRandom(this.settings.sizeRange[0],
                                   this.settings.sizeRange[1]) * LsizeBase[0];
        var RSize = this.getRandom(this.settings.sizeRange[0],
                                   this.settings.sizeRange[1]) * RsizeBase[0];

        var _this = this;
        _this.clearTriangles();
        _this.set('stimTimer', window.setTimeout(function() {
            _this.drawTriangles(Lshapes[0], LX, LY, LRot, LFlip, LSize,
                            Rshapes[0], RX, RY, RRot, RFlip, RSize);
            _this.set('stimTimer', window.setTimeout(function() {
                _this.presentTriangles(Lshapes.reverse(), Rshapes.reverse(),
                                    LsizeBase.reverse(), RsizeBase.reverse());
            }, _this.settings.msTriangles));
        }, _this.settings.msBlank));
    },

    handleSpace(event, frame) {
        if (frame.checkFullscreen() || !frame.isPaused) {
            if (event.which === 32) { // space
                frame.pauseStudy();
            }
        }
    },

    // Pause/unpause study; only called if doing intro.
    pauseStudy() {

        $('#player-audio')[0].pause();
        $('#player-audio')[0].currentTime = 0;
        $('#player-pause-audio')[0].pause();
        $('#player-pause-audio')[0].currentTime = 0;
        $('#player-pause-audio-leftfs')[0].pause();
        $('#player-pause-audio-leftfs')[0].currentTime = 0;

        this.set('completedAudio', false);
        this.set('completedAttn', false);

        Ember.run.once(this, () => {
            this.set('hasBeenPaused', true);
            var wasPaused = this.get('isPaused');
            this.set('currentSegment', 'intro');

            // Currently paused: RESUME
            if (wasPaused) {
                try {
                    this.resumeRecorder();
                } catch (_) {
                    return;
                }
                this.startIntro();
                this.set('isPaused', false);
            } else { // Not currently paused: PAUSE
                window.clearTimeout(this.get('introTimer'));
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

        // Define basic properties for two triangle shapes used. It would be
        // more natural to define these in the template, and then use the
        // <use xlink:href="#name" .../> syntax to transform them as
        // appropriate, but although this worked fine on experimenter I couldn't
        // get the links working on lookit. The code was correctly generated,
        // but while a direct use of polygon showed up, nothing that used
        // xlink:href showed up at all (even when hard-coded into the template).
        // Possibly related to issues like
        // https://github.com/emberjs/ember.js/issues/14752.
        // --kim

        this.set('triangleBases', {
            'fat': `<polygon stroke="${this.get('triangleColor')}"
                     stroke-width="${this.get('triangleLineWidth')}"
                     fill="none"
                     points="-12.1369327415 ,  -5.63277008813,
                              14.5176215029 ,  -5.63277008813,
                              -2.38068876146 ,  11.2655401763"
                     vector-effect="non-scaling-stroke"
                     stroke-linejoin="round"`,
            'skinny': `<polygon stroke="${this.get('triangleColor')}"
                     stroke-width="${this.get('triangleLineWidth')}"
                     fill="none"
                     points="-27.5259468096 ,  -3.25208132666,
                              18.6410953948 ,  -3.25208132666,
                               8.88485141479 ,  6.50416265333"
                     vector-effect="non-scaling-stroke"
                     stroke-linejoin="round"`

        });

        // COUNTERBALANCING (2x2):
        // context: whether to use big fat triangle or
        // small skinny triangle as context figure. If 'fat', contrasts are
        // big fat/small fat and big fat/small skinny. If 'skinny', contrasts
        // are big skinny/small skinny and big fat/small skinny.
        // altOnLeft: whether to put size-and-shape alteration on left

        var diffShapes;
        var sameShapes;
        var shapeSizes;
        if (this.get('context')) {
            sameShapes = ['fat']; // context: big fat triangle
            shapeSizes = [1, 0.7071]; // big fat vs. small fat/small skinny
            // sqrt(0.5) = 0.7071, to get factor of two difference in area
            diffShapes = ['fat', 'skinny']; // start with context
        } else {
            sameShapes = ['skinny']; // context: small skinny triangle
            shapeSizes = [0.7071, 1]; // small skinny vs. big skinny/big fat
            diffShapes = ['skinny', 'fat']; // start with context
        }

        var Lshapes;
        var Rshapes;
        if (this.get('altOnLeft')) {
            Lshapes = diffShapes;
            Rshapes = sameShapes;
        } else {
            Lshapes = sameShapes;
            Rshapes = diffShapes;
        }

        this.set('settings', {
            msBlank: 300,
            msTriangles: 500,
            LsizeBaseStart: shapeSizes,
            RsizeBaseStart: shapeSizes.slice(),
            XRange: [-3.125, 3.125],
            YRange: [-3.125, 3.125],
            rotRange: [0, 360],
            flipVals: [-1, 1],
            sizeRange: [0.921954, 1.072381], // 15% by AREA: sqrt(0.85), sqrt(1.15)
            trialLength: this.get('trialLength'),
            LshapesStart: Lshapes,
            RshapesStart: Rshapes,
            musicFadeLength: 2000,
            calLength: this.get('calibrationLength')});

        this.send('showFullscreen');
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
            this.get('recorder').hide(); // Hide the webcam config screen
            this.stopRecorder();
        }
        // Remove pause handler
        $(document).off('keyup.pauser');

        this._super(...arguments);
    }

});
