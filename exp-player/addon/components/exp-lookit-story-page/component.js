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
 * TODO: document correctly (below is for pref-look)
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
    "story-trial": {
    }
 }

 * ```
 * @class ExpLookitStoryPage
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
    type: 'exp-lookit-story-page',
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

    // Timers for intro & stimuli
    introTimer: null, // minimum length of intro segment
    stimTimer: null,

    meta: {
        name: 'ExpLookitStoryPage',
        description: 'Frame to [TODO]',
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
                }
            }
        },
        data: {
            /**
             * Parameters captured and sent to the server
             *
             * @method serializeContent
             * @param {String} videoID The ID of any video recorded during this frame
             * @param {Object} eventTimings
             * @return {Object} The payload sent to the server
             */
            type: 'object',
            properties: {
                videoId: {
                    type: 'string'
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

        $('#allstimuli').show();

        var audioPlayer = $('#player-test-audio');
        audioPlayer[0].currentTime = 0;
        audioPlayer[0].play();

        // Now presenting stimuli; stop after trial length.
        // TODO: consider actually setting to visible here
        frame.set('stimTimer', window.setTimeout(function() {
            window.clearTimeout(frame.get('stimTimer'));
            audioPlayer[0].pause();
            $('#allstimuli').hide();
            frame.endTrial();
            }, frame.trialLength * 1000));
    },

    // When stimuli have been shown for time indicated: play end-audio if
    // present, or just move on.
    endTrial() {
        // TODO: possibly put all calls to next here, rather than calling
        // next directly from ending audio in the template, for clarity
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
        } else {
            /**
             * Upon detecting change to fullscreen mode
             *
             * @event enteredFullscreen
            */
            this.sendTimeEvent('enteredFullscreen');
        }
    },

    didInsertElement() {
        this._super(...arguments);

        this.send('showFullscreen');
        //this.startIntro();

        // TODO: move handlers that just record events to the VideoRecord mixin?
//         if (this.get('experiment') && this.get('id') && this.get('session')) {
//             let recorder = this.get('videoRecorder').start(this.get('videoId'), this.$('#videoRecorder'), {
//                 hidden: true
//             });
//             recorder.install({
//                 record: true
//             }).then(() => {
//                 this.sendTimeEvent('recorderReady');
//                 this.set('recordingIsReady', true);
//             });
//             /**
//              * When recorder detects a change in camera access
//              *
//              * @event onCamAccess
//              * @param {Boolean} hasCamAccess
//              */
//             recorder.on('onCamAccess', (hasAccess) => {
//                 this.sendTimeEvent('hasCamAccess', {
//                     hasCamAccess: hasAccess
//                 });
//             });
//             /**
//              * When recorder detects a change in video stream connection status
//              *
//              * @event videoStreamConnection
//              * @param {String} status status of video stream connection, e.g.
//              * 'NetConnection.Connect.Success' if successful
//              */
//             recorder.on('onConnectionStatus', (status) => {
//                 this.sendTimeEvent('videoStreamConnection', {
//                     status: status
//                 });
//             });
//             this.set('recorder', recorder);
//         }

    },

    willDestroyElement() {
        this.sendTimeEvent('destroyingElement');

        // Whenever the component is destroyed, make sure that event handlers are removed and video recorder is stopped
        if (this.get('recorder')) {
            this.get('recorder').hide(); // Hide the webcam config screen
            this.get('recorder').stop();
        }

        this._super(...arguments);
    }

});
