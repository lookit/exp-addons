import Ember from 'ember';

import layout from './template';

import ExpFrameBaseUnsafeComponent from '../../components/exp-frame-base-unsafe/component';
import FullScreen from '../../mixins/full-screen';
import MediaReload from '../../mixins/media-reload';
import VideoRecord from '../../mixins/video-record';

/**
 * @module exp-player
 * @submodule frames
 */

/**
Test trial for the 'Your baby the physicist' study: audio instructions, intro video, and test video, with webcam recording.

@class ExpVideoPhysics
@extends ExpFrameBaseUnsafe

@uses FullScreen
@uses MediaReload
@uses VideoRecord
*/

let {
    $
} = Ember;

export default ExpFrameBaseUnsafeComponent.extend(FullScreen, MediaReload, VideoRecord, {
    // In the Lookit use case, the frame BEFORE the one that goes fullscreen must use "unsafe" saves (in order for
    //   the fullscreen event to register as being user-initiated and not from a promise handler) #LEI-369
    layout: layout,

    displayFullscreen: true, // force fullscreen for all uses of this component
    fullScreenElementId: 'experiment-player',
    fsButtonID: 'fsButton',
    videoRecorder: Ember.inject.service(),
    recorder: null,
    warning: null,
    hasCamAccess: Ember.computed.alias('recorder.hasCamAccess'),
    videoUploadConnected: Ember.computed.alias('recorder.connected'),

    doingIntro: Ember.computed('videoSources', function() {
        return (this.get('currentTask') === 'intro');
    }),
    playAnnouncementNow: true,

    doingTest: Ember.computed('videoSources', function() {
        return (this.get('currentTask') === 'test');
    }),
    testTimer: null,
    testTime: 0,

    skip: false,
    hasBeenPaused: false,
    useAlternate: false,
    currentTask: 'announce', // announce, intro, or test.
    isPaused: false,

    showVideoWarning: false,

    meta: {
        name: 'Video player',
        description: 'Component that plays a video',
        parameters: {
            type: 'object',
            properties: {
                /**
                Whether to automatically advance to the next frame when video is complete. Generally leave this true, since controls will be hidden for fullscreen videos.
                @property {Boolean} autoforwardOnEnd
                @default true
                */
                autoforwardOnEnd: {
                    type: 'boolean',
                    description: 'Whether to automatically advance to the next frame when the video is complete',
                    default: true
                },
                /**
                Whether to automatically start the trial on load.
                @property {Boolean} autoplay
                @default true
                */
                autoplay: {
                    type: 'boolean',
                    description: 'Whether to autoplay the video on load',
                    default: true
                },
                /**
                Source URL for an image to show until the video starts playing.
                @property {String} poster
                @default ''
                */
                poster: {
                    type: 'string',
                    description: 'A still image to show until the video starts playing',
                    default: ''
                },
                /**
                Array of objects specifying video src and type for test video (these should be the same video, but multiple sources--e.g. mp4 and webm--are generally needed for cross-browser support). Example value:

                ```[{'src': 'http://.../video1.mp4', 'type': 'video/mp4'}, {'src': 'http://.../video1.webm', 'type': 'video/webm'}]```
                @property {Array} sources
                    @param {String} src
                    @param {String} type
                @default []
                */
                sources: {
                    type: 'string',
                    description: 'List of objects specifying video src and type for test videos',
                    default: []
                },

                /**
                Array of objects specifying video src and type for alternate test video, as for sources.
                @property {Array} altSources
                    @param {String} src
                    @param {String} type
                @default []
                */
                altSources: {
                    type: 'string',
                    description: 'List of objects specifying video src and type for alternate test videos',
                    default: []
                },

                /**
                Array of objects specifying intro video src and type, as for sources.
                @property {Array} introSources
                    @param {String} src
                    @param {String} type
                @default []
                */
                introSources: {
                    type: 'string',
                    description: 'List of objects specifying intro video src and type',
                    default: []
                },

                /**
                Array of objects specifying attention-grabber video src and type, as for sources.
                @property {Array} attnSources
                    @param {String} src
                    @param {String} type
                @default []
                */
                attnSources: {
                    type: 'string',
                    description: 'List of objects specifying attention-grabber video src and type',
                    default: []
                },

                /**
                List of objects specifying intro announcement src and type.
                Example: `[{'src': 'http://.../audio1.mp3', 'type': 'audio/mp3'}, {'src': 'http://.../audio1.ogg', 'type': 'audio/ogg'}]`
                @property {Array} audioSources
                    @param {String} src
                    @param {String} type
                @default []
                */
                audioSources: {
                    type: 'string',
                    description: 'List of objects specifying intro announcement audio src and type',
                    default: []
                },

                /**
                List of objects specifying music audio src and type, as for audioSources.
                @param musicSources
                @property {Array} audioSources
                    @param {String} src
                    @param {String} type
                @default []
                */
                musicSources: {
                    type: 'string',
                    description: 'List of objects specifying music audio src and type',
                    default: []
                },

                /**
                Length to loop test videos, in seconds
                @property {Number} testLength
                @default 20
                */
                testLength: {
                    type: 'number',
                    description: 'Length of test videos in seconds',
                    default: 20
                },
                /**
                Whether this is the last exp-physics-video frame in the group, before moving to a different frame type. (If so, play only the intro audio, no actual tests.)
                @property {Boolean} isLast
                @default false
                */
                isLast: {
                    type: 'boolean',
                    description: 'Whether this is the last exp-physics-video frame in the group',
                    default: false
                }
            }
        },
        data: {
            // Capture
            type: 'object',
            /**
             * Parameters captured and sent to the server
             *
             * @method serializeContent
             * @param {Array} videosShown Sources of videos (potentially) shown during this trial: [source of test video, source of alternate test video].
             * @param {Object} eventTimings
             * @param {String} videoID The ID of any webcam video recorded during this frame
             * @return {Object} The payload sent to the server
             */
            properties: {
                videosShown: {
                    type: 'string',
                    default: []
                },
                videoId: {
                    type: 'string'
                }
            },
            // No fields are required
        }
    },

    videoSources: Ember.computed('isPaused', 'currentTask', 'useAlternate', function() {
        if (this.get('isPaused')) {
            return this.get('attnSources');
        } else {
            switch (this.get('currentTask')) {
                case 'announce':
                    return this.get('attnSources');
                case 'intro':
                    return this.get('introSources');
                case 'test':
                    if (this.get('useAlternate')) {
                        return this.get('altSources');
                    } else {
                        return this.get('sources');
                    }
            }
        }
        return [];
    }),

    shouldLoop: Ember.computed('videoSources', function() {
        return (this.get('isPaused') || (this.get('currentTask') === 'announce' || this.get('currentTask') === 'test'));
    }),

    onFullscreen() {
        if (this.get('isDestroyed')) {
            return;
        }
        this._super(...arguments);
        if (!this.checkFullscreen()) {
            if (!this.get('isPaused')) {
                this.pauseStudy();
            }
        }
    },

    makeTimeEvent(eventName, extra) {
        return this._super(`exp-physics:${eventName}`, extra);
    },

    actions: {

        showWarning() {
            if (!this.get('showVideoWarning')) {
                this.set('showVideoWarning', true);
                this.send('setTimeEvent', 'webcamNotConfigured');

                // If webcam error, save the partial frame payload immediately, so that we don't lose timing events if
                // the user is unable to move on.
                // TODO: Assumption: this assumes the user isn't resuming this experiment later, so partial data is ok.
                this.send('save');

                var recorder = this.get('recorder');
                recorder.show();
                recorder.on('onCamAccessConfirm', () => {
                    this.send('removeWarning');
                    this.startRecorder();
                });
            }
        },

        removeWarning() {
            this.set('showVideoWarning', false);
            this.get('recorder').hide();
            this.send('showFullscreen');
            this.pauseStudy();
        },

        stopVideo() {
            var currentTask = this.get('currentTask');
            if (this.get('testTime') >= this.get('testLength')) {
                this.send('_afterTest');
            } else if (this.get('shouldLoop')) {
                this.set('_lastTime', 0);
                this.$('#player-video')[0].play();
            } else {
                this.send('setTimeEvent', 'videoStopped', {
                    currentTask
                });
                if (this.get('autoforwardOnEnd')) {
                    this.send('playNext');
                }
            }
        },

        playNext() {
            if (this.get('currentTask') === 'intro') {
                this.set('currentTask', 'test');
            } else {
                this.send('next'); // moving to intro video
            }
        },

        _afterTest() {
            window.clearInterval(this.get('testTimer'));
            this.set('testTime', 0);
            $('audio#exp-music')[0].pause();
            this.send('playNext');
        },

        setTestTimer() {
            window.clearInterval(this.get('testTimer'));
            this.set('testTime', 0);
            this.set('_lastTime', 0);

            var testLength = this.get('testLength');

            this.set('testTimer', window.setInterval(() => {
                var videoTime = this.$('#player-video')[0].currentTime;
                var lastTime = this.get('_lastTime');
                var diff = videoTime - lastTime;
                this.set('_lastTime', videoTime);

                var testTime = this.get('testTime');
                if ((testTime + diff) >= (testLength - 0.02)) {
                    this.send('_afterTest');
                } else {
                    this.set('testTime', testTime + diff);
                }
            }, 100));
        },

        startVideo() {
            if (this.get('doingTest')) {
                if (!this.get('hasCamAccess')) {
                    this.pauseStudy(true);
                    this.send('exitFullscreen');
                    this.send('showWarning');
                    $('#videoWarningAudio')[0].play();
                }
            }
            if (this.get('currentTask') === 'test' && !this.get('isPaused')) {
                if (this.get('testTime') === 0) {
                    this.send('setTestTimer');
                }
                $('audio#exp-music')[0].play();
                if (this.get('useAlternate')) {
                    this.send('setTimeEvent', 'startAlternateVideo');
                } else {
                    this.send('setTimeEvent', 'startTestVideo');
                }
            }
        },
        startIntro() {
            if (this.get('skip')) {
                this.send('next');
                return;
            }

            this.set('currentTask', 'intro');
            this.set('playAnnouncementNow', false);

            if (!this.get('isPaused')) {
                if (this.isLast) {
                    this.send('next');
                } else {
                    this.send('setTimeEvent', 'startIntro');
                    this.set('videosShown', [this.get('sources')[0].src, this.get('altSources')[0].src]);
                }
            }
        },

        next() {
            window.clearInterval(this.get('testTimer'));
            this.set('testTime', 0);
            this.stopRecorder();
            this._super(...arguments);
        }
    },

    pauseStudy(pause) { // only called in FS mode
        if (this.get('showVideoWarning')) {
            return;
        }

        // make sure recording is set already; otherwise, pausing recording leads to an error and all following calls fail silently. Now that this is taken
        // care of in videoRecorder.pause(), skip the check.
        Ember.run.once(this, () => {
            if (!this.get('isLast')) {
                try {
                    this.set('hasBeenPaused', true);
                } catch (_) {
                    return;
                }
                var wasPaused = this.get('isPaused');
                var currentState = this.get('currentTask');

                // Currently paused: restart
                if (!pause && wasPaused) {
                    this.set('doingAttn', false);
                    this.set('isPaused', false);
                    if (currentState === 'test') {
                        if (this.get('useAlternate')) {
                            this.set('skip', true);
                        }
                        this.set('useAlternate', true);
                        this.set('currentTask', 'announce');
                        this.set('playAnnouncementNow', true);
                    } else {
                        this.set('currentTask', 'announce');
                        this.set('playAnnouncementNow', true);
                    }
                    try {
                        this.resumeRecorder();
                    } catch (_) {
                        return;
                    }
                } else if (pause || !wasPaused) { // Not currently paused: pause
                    window.clearInterval(this.get('testTimer'));
                    this.set('testTime', 0);
                    this.send('setTimeEvent', 'pauseVideo', {
                        currentTask: this.get('currentTask')
                    });
                    this.pauseRecorder(true);
                    this.set('playAnnouncementNow', false);
                    this.set('isPaused', true);
                }
            }
        });
    },

    didInsertElement() {
        this._super(...arguments);
        $(document).on('keyup.pauser', (e) => {
            if (this.checkFullscreen()) {
                if (e.which === 32) { // space: pause/unpause study
                    this.pauseStudy();
                } else if (e.which === 112) { // F1: exit the study early
                    this.stopRecorder();
                }
            }
        });

        if (this.get('experiment') && this.get('id') && this.get('session') && !this.get('isLast')) {
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
        this.send('showFullscreen');
    },
    willDestroyElement() { // remove event handler
        // Whenever the component is destroyed, make sure that event handlers are removed and video recorder is stopped
        const recorder = this.get('recorder');
        if (recorder) {
            recorder.hide(); // Hide the webcam config screen
            this.stopRecorder();
        }

        this.send('setTimeEvent', 'destroyingElement');
        this._super(...arguments);
        $(document).off('keyup.pauser');
    }
});
