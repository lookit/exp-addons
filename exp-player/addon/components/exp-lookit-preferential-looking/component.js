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
 * - Test: image(s) displayed, any test audio played [set amount of time]
 * - Final audio: central attentiongrabber video (looping) & final audio
 *   (optional section, intended for last trial in block)
 *
 *
 * These frames extend ExpFrameBaseUnsafe because they are displayed fullscreen
 * and expected to be repeated.

```json
 "frames": {
    "preferential-looking": {
        "allowPausingDuringTest": true,
        "rightImage": "https://s3.amazonaws.com/lookitcontents/labelsconcepts/img/fam.jpg",
        "leftImage":
        "https://s3.amazonaws.com/lookitcontents/labelsconcepts/img/novel.jpg",
        "centerImage":
        "https://s3.amazonaws.com/lookitcontents/labelsconcepts/img/0001.jpg",
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
        "kind": "exp-lookit-preferential-looking",
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
        "calibrationLength": 3000,
        "id": "pref-trial",
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
                "src": "https://s3.amazonaws.com/lookitcontents/labelsconcepts/mp3/Familiarization_find_dax_amplified_repeated.mp3",
                "type": "audio/mp3"
            },
            {
                "src": "https://s3.amazonaws.com/lookitcontents/labelsconcepts/ogg/Familiarization_find_dax_amplified_repeated.ogg",
                "type": "audio/ogg"
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

    // Timers for intro & stimuli
    introTimer: null, // minimum length of intro segment
    stimTimer: null,

    meta: {
        name: 'ExpLookitPreferentialLooking',
        description: 'Frame to implement specific test trial structure for geometry alternation experiment. Includes announcement, calibration, and alternation (test) phases. During "alternation," two streams of triangles are shown, in rectangles on the left and right of the screen: one one side both size and shape change, on the other only size changes. Frame is displayed fullscreen and video recording is conducted during calibration/test.',
        parameters: {
            type: 'object',
            properties: {
                /**
                 * Whether to allow user to pause the study during the test
                 * segment and restart from intro; otherwise, user can pause but
                 * this frame will end upon unpausing
                 *
                 * @property {Boolean} allowPausingDuringTest
                 */
                allowPausingDuringTest: {
                    type: 'boolean',
                    description: 'Whether to allow user to pause the study during the test segment and restart from intro; otherwise, user can pause but this frame will end upon unpausing'
                },
                /**
                 * URL of image to show on left (include to show left/right
                 * images)
                 *
                 * @property {String} leftImage
                 */
                leftImage: {
                    type: 'string',
                    description: 'URL of image to show on left'
                },
                /**
                 * URL of image to show on right
                 *
                 * @property {String} right
                 */
                rightImage: {
                    type: 'string',
                    description: 'URL of image to show on left'
                },
                /**
                 * URL of image to show at center (include to show a center
                 * image)
                 *
                 * @property {String} centerImage
                 */
                centerImage: {
                    type: 'string',
                    description: 'URL of image to show on left'
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
                 * length of preferential looking trial in seconds
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
                 * length of single calibration segment in seconds
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
                 * for audio played during test trial
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
                            }
                        }
                    }
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects
                 * for instructions during attention-getter video
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
                            }
                        }
                    }
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects
                 * for audio played after trial ends (optional, intended for
                 * last trial)
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
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects
                 * for calibration audio, played from start during each
                 * calibration segment
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
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects
                 * for calibration video, played from start during each
                 * calibration segment
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
                            }
                        }
                    }
                },
                /**
                 * Sources Array of {src: 'url', type: 'MIMEtype'} objects
                 * for attention-getter video
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
                 * audio played upon resuming study
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
             * @param {String} videoID The ID of any video recorded during this frame
             * @param {Boolean} hasBeenPaused whether this trial was paused
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
                }
            }
        }
    },

    calObserver: Ember.observer('readyToStartCalibration', function(frame) {
        if (frame.get('readyToStartCalibration') && frame.get('currentSegment') === 'intro') {
            frame.set('currentSegment', 'test');
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
        completedIntroAudio() {
            this.set('completedAudio', true);
            this.notifyPropertyChange('readyToStartCalibration');
        },

        next() {
            if (this.get('recorder')) {
            /**
             * Just before stopping webcam video capture
             *
             * @event stoppingCapture
             */
                this.sendTimeEvent('stoppingCapture');
                this.get('recorder').stop();
            }
            this._super(...arguments);
        }

    },

    startIntro() {
        // Allow pausing during intro
        var frame = this;
        $(document).off('keyup.pauser');
        $(document).on('keyup.pauser', function(e) {frame.handleSpace(e, frame);});

        /**
         * Just before starting intro segment
         *
         * @event startIntro
         */
        frame.sendTimeEvent('startIntro');
        $('#player-video')[0].play();

        // Set a timer for the minimum length for the intro/break
        $('#player-audio')[0].play();
        frame.set('introTimer', window.setTimeout(function(){
            frame.set('completedAttn', true);
            frame.notifyPropertyChange('readyToStartCalibration');
        }, frame.get('attnLength') * 1000));

    },

    startCalibration() {
        var frame = this;

        // Don't allow pausing during calibration/test.
        // TODO: generalize whether to allow pausing during each segment of the experiment.
        // $(document).off('keyup.pauser');

        var calAudio = $('#player-calibration-audio')[0];
        var calVideo = $('#player-calibration-video')[0];
        $('#player-calibration-video').show();

        // Show the calibration segment at center, left, right, center, each
        // time recording an event and playing the calibration audio.
        var doCalibrationSegments = function(calList, lastLoc) {
            if (calList.length === 0) {
                $('#player-calibration-video').hide();
                frame.set('currentSegment', 'test');
            } else {
                var thisLoc = calList.shift();
                /**
                 * Start of EACH calibration segment
                 *
                 * @event startCalibration
                 * @param {String} location location of calibration ball, relative to child: 'left', 'right', or 'center'
                 */
                frame.sendTimeEvent('startCalibration',
                    {location: thisLoc});
                calAudio.pause();
                calAudio.currentTime = 0;
                calAudio.play();
                calVideo.pause();
                calVideo.currentTime = 0;
                calVideo.play();
                $('#player-calibration-video').removeClass(lastLoc);
                $('#player-calibration-video').addClass(thisLoc);
                window.setTimeout(function(){
                    doCalibrationSegments(calList, thisLoc);
                }, frame.settings.calLength);
            }
        };

        doCalibrationSegments(['center', 'left', 'right', 'center'], '');

    },

    startTrial() {

        var frame = this;

        frame.sendTimeEvent('startTestTrial');

        var audioPlayer = $('#player-test-audio');
        audioPlayer[0].currentTime = 0;
        audioPlayer[0].play();

        // Now presenting stimuli; stop after trial length.
        // TODO: consider actually setting to visible here
        frame.set('stimTimer', window.setTimeout(function(){
            window.clearTimeout(frame.get('stimTimer'));
            audioPlayer[0].pause();
            frame.endTrial();
            }, frame.trialLength * 1000));
    },

    // When stimuli have been shown for time indicated: play end-audio if
    // present, or just move on.
    endTrial() {
        // Don't allow pausing anymore
        $(document).off('keyup.pauser');
        if (this.get('recorder')) {
            this.sendTimeEvent('stoppingCapture');
            this.get('recorder').stop();
        }
        if (this.get('endAudioSources').length) {
            this.set('currentSegment', 'finalaudio');
            $('#player-endaudio')[0].play();
        }
        else {
            this.send('next');
        }
    },

    // TODO: should this be moved to the recording mixin?
    sendTimeEvent(name, opts = {}) {
        var streamTime = this.get('recorder') ? this.get('recorder').getTime() : null;
        Ember.merge(opts, {
            streamTime: streamTime,
            videoId: this.get('videoId')
        });
        this.send('setTimeEvent', `exp-lookit-preferential-looking:${name}`, opts);
    },

    // TODO: should the events here be moved to the fullscreen mixin?
    onFullscreen() {
        if (this.get('isDestroyed')) {
            return;
        }
        this._super(...arguments);
        if (!this.checkFullscreen()) {
            /**
             * Upon detecting change out of fullscreen mode
             *
             * @event leftFullscreen
            */
            this.sendTimeEvent('leftFullscreen');
            if (!this.get('isPaused') && !(this.get('currentSegment') === 'finalaudio')) {
                this.pauseStudy();
            }
        } else {
            /**
             * Upon detecting change to fullscreen mode
             *
             * @event enteredFullscreen
            */
            this.sendTimeEvent('enteredFullscreen');
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

        // TODO: generalize across audio segments
        $('#player-audio')[0].pause();
        $('#player-audio')[0].currentTime = 0;
        $('#player-pause-audio')[0].pause();
        $('#player-pause-audio')[0].currentTime = 0;
        $('#player-pause-audio-leftfs')[0].pause();
        $('#player-pause-audio-leftfs')[0].currentTime = 0;
        $('#player-calibration-audio')[0].pause();
        $('#player-calibration-audio')[0].currentTime = 0;
        $('#player-test-audio')[0].pause();
        $('#player-test-audio')[0].currentTime = 0;

        this.set('completedAudio', false);
        this.set('completedAttn', false);

        Ember.run.once(this, () => {
            this.set('hasBeenPaused', true);
            var wasPaused = this.get('isPaused');

            // Currently paused: RESUME
            if (wasPaused) {
                /**
                 * When unpausing study, immediately before request to resume webcam recording
                 *
                 * @event unpauseVideo
                 */
                this.sendTimeEvent('unpauseVideo');
                // Always allow resuming if study was paused during intro; also
                // allow if designated for this frame
                if (this.get('allowPausingDuringTest') || this.get('previousSegment') === 'intro') {
                    try {
                        this.get('recorder').resume();
                    } catch (_) {
                        return;
                    }
                    this.startIntro();
                    this.set('isPaused', false);
                }
                else { // If restarting isn't allowed, end trial now
                    this.set('isPaused', false);
                    this.endTrial();
                }

            } else { // Not currently paused: PAUSE
                this.set('previousSegment', this.get('currentSegment'));
                this.set('currentSegment', 'intro');
                // TODO: generalize across timers
                window.clearTimeout(this.get('introTimer'));
                window.clearTimeout(this.get('stimTimer'));
                /**
                 * When pausing study, immediately before request to pause webcam recording
                 *
                 * @event pauseVideo
                 */
                this.sendTimeEvent('pauseVideo');
                if (this.get('recorder')) {
                    this.get('recorder').pause(true);
                }
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

        this.send('showFullscreen');
        this.startIntro();

        // TODO: move handlers that just record events to the VideoRecord mixin?
        if (this.get('experiment') && this.get('id') && this.get('session')) {
            let recorder = this.get('videoRecorder').start(this.get('videoId'), this.$('#videoRecorder'), {
                hidden: true
            });
            recorder.install({
                record: true
            }).then(() => {
                this.sendTimeEvent('recorderReady');
                this.set('recordingIsReady', true);
            });
            /**
             * When recorder detects a change in camera access
             *
             * @event onCamAccess
             * @param {Boolean} hasCamAccess
             */
            recorder.on('onCamAccess', (hasAccess) => {
                this.sendTimeEvent('hasCamAccess', {
                    hasCamAccess: hasAccess
                });
            });
            /**
             * When recorder detects a change in video stream connection status
             *
             * @event videoStreamConnection
             * @param {String} status status of video stream connection, e.g.
             * 'NetConnection.Connect.Success' if successful
             */
            recorder.on('onConnectionStatus', (status) => {
                this.sendTimeEvent('videoStreamConnection', {
                    status: status
                });
            });
            this.set('recorder', recorder);
        }

    },

    willDestroyElement() {
        this.sendTimeEvent('destroyingElement');

        // Whenever the component is destroyed, make sure that event handlers are removed and video recorder is stopped
        if (this.get('recorder')) {
            this.get('recorder').hide(); // Hide the webcam config screen
            this.get('recorder').stop();
        }
        // Remove pause handler
        $(document).off('keyup.pauser');

        this._super(...arguments);
    }

});
