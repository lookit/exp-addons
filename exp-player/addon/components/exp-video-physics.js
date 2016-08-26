import Ember from 'ember';

import layout from '../templates/components/exp-video-physics';

import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import FullScreen from '../mixins/full-screen';
import MediaReload from '../mixins/media-reload';
import VideoRecord from '../mixins/video-record';

let {
    $
} = Ember;

export default ExpFrameBaseComponent.extend(FullScreen, MediaReload, VideoRecord, {
    layout: layout,

    displayFullscreen: true, // force fullscreen for all uses of this component
    fullScreenElementId: 'experiment-player',
    fsButtonID: 'fsButton',
    videoRecorder: Ember.inject.service(),
    recorder: null,
    recordingIsReady: false,
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

    onFullscreen: function() {
        if (this.get('isDestroyed')) {
            return;
        }
        this._super(...arguments);
        if (!this.checkFullscreen()) {
            this.sendTimeEvent('leftFullscreen');
            if (!this.get('isPaused')) {
                this.pauseStudy();
            }
        } else {
            this.sendTimeEvent('enteredFullscreen');
        }
    },

    sendTimeEvent(name, opts = {}) {
        var streamTime = this.get('recorder') ? this.get('recorder').getTime() : null;

        Ember.merge(opts, {
            streamTime: streamTime,
            videoId: this.get('videoId')
        });
        this.send('setTimeEvent', `exp-physics:${name}`, opts);
    },

    meta: {
        name: 'Video player',
        description: 'Component that plays a video',
        parameters: {
            type: 'object',
            properties: {
                autoforwardOnEnd: { // Generally leave this true, since controls will be hidden for fullscreen videos
                    type: 'boolean',
                    description: 'Whether to automatically advance to the next frame when the video is complete',
                    default: true
                },
                autoplay: {
                    type: 'boolean',
                    description: 'Whether to autoplay the video on load',
                    default: true
                },
                poster: {
                    type: 'string',
                    description: 'A still image to show until the video starts playing',
                    default: ''
                },
                sources: {
                    type: 'string',
                    description: 'List of objects specifying video src and type for test videos',
                    default: []
                },
                altSources: {
                    type: 'string',
                    description: 'List of objects specifying video src and type for alternate test videos',
                    default: []
                },
                introSources: {
                    type: 'string',
                    description: 'List of objects specifying intro video src and type',
                    default: []
                },
                attnSources: {
                    type: 'string',
                    description: 'List of objects specifying attention-grabber video src and type',
                    default: []
                },
                audioSources: {
                    type: 'string',
                    description: 'List of objects specifying intro announcement audio src and type',
                    default: []
                },
                musicSources: {
                    type: 'string',
                    description: 'List of objects specifying music audio src and type',
                    default: []
                },
                testLength: {
                    type: 'number',
                    description: 'Length of test videos in seconds',
                    default: 20
                },
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
            properties: {
                videosShown: {
                    type: 'string',
                    default: []
                },
                videoId: {
                    type: 'string'
                }
            },
            required: []
        }
    },
    actions: {
        showWarning: function() {
            if (!this.get('showVideoWarning')) {
                this.set('showVideoWarning', true);
                this.sendTimeEvent('webcamNotConfigured');
                var recorder = this.get('recorder');
                recorder.show();
                recorder.on('onCamAccessConfirm', () => {
                    this.send('removeWarning');
                    this.get('recorder').record();
                });
            }
        },
        removeWarning: function() {
            this.set('showVideoWarning', false);
            this.get('recorder').hide();
            this.send('showFullscreen');
            this.pauseStudy();
        },

        stopVideo: function() {
            var currentTask = this.get('currentTask');
            if (this.get('testTime') >= this.get('testLength')) {
                this.send('_afterTest');
            } else if (this.get('shouldLoop')) {
                this.set('_lastTime', 0);
                this.$('#player-video')[0].play();
            } else {
                this.sendTimeEvent('videoStopped', {
                    currentTask
                });
                if (this.get('autoforwardOnEnd')) {
                    this.send('playNext');
                }
            }
        },

        playNext: function() {
            if (this.get("currentTask") === "intro") {
                this.set("currentTask", "test");
            } else {
                this.send('next'); // moving to intro video
            }
        },

        _afterTest() {
            window.clearInterval(this.get('testTimer'));
            this.set('testTime', 0);
            $("audio#exp-music")[0].pause();
            this.send('playNext');
        },

        setTestTimer: function() {
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

        startVideo: function() {
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
                $("audio#exp-music")[0].play();
                if (this.get('useAlternate')) {
                    this.sendTimeEvent('startAlternateVideo');
                } else {
                    this.sendTimeEvent('startTestVideo');
                }
            }
        },
        startIntro: function() {
            if (this.get('skip')) {
                this.send('next');
                return;
            }

            this.set('currentTask', 'intro');
            this.set('playAnnouncementNow', false);

            if (~this.get('isPaused')) {
                if (this.isLast) {
                    this.send('next');
                } else {
                    this.sendTimeEvent('startIntro');
                    this.set('videosShown', [this.get('sources')[0].src, this.get('altSources')[0].src]);
                }
            }
        },

        next() {
            window.clearInterval(this.get('testTimer'));
            this.set('testTime', 0);
            this.sendTimeEvent('stoppingCapture');
            if (this.get('recorder')) {
                this.get('recorder').stop();
            }
            this._super(...arguments);
        }
    },

    pauseStudy: function(pause) { // only called in FS mode
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
                    if (currentState === "test") {
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
                        this.get('recorder').resume();
                    } catch (_) {
                        return;
                    }
                } else if (pause || !wasPaused) { // Not currently paused: pause
                    window.clearInterval(this.get('testTimer'));
                    this.set('testTime', 0);
                    this.sendTimeEvent('pauseVideo', {
                        'currentTask': this.get('currentTask')
                    });
                    if (this.get('recorder')) {
                        this.get('recorder').pause(true);
                    }
                    this.set('playAnnouncementNow', false);
                    this.set('isPaused', true);
                }
            }
        });
    },

    didInsertElement() {
        this._super(...arguments);
        $(document).on("keyup", (e) => {
            if (this.checkFullscreen()) {
                if (e.which === 32) { // space
                    this.pauseStudy();
                } else if (e.which === 112) { // F1
                    if (this.get('recorder')) {
                        this.get('recorder').stop();
                    }
                }
            }
        });

        if (this.get('experiment') && this.get('id') && this.get('session') && !this.get('isLast')) {
            let recorder = this.get('videoRecorder').start(this.get('videoId'), this.$('#videoRecorder'), {
                hidden: true
            });
            recorder.install({
                record: true
            }).then(() => {
                this.sendTimeEvent('recorderReady');
                this.set('recordingIsReady', true);
            });
            recorder.on('onCamAccess', (hasAccess) => {
                this.sendTimeEvent('hasCamAccess', {
                    hasCamAccess: hasAccess
                });
            });
            recorder.on('onConnectionStatus', (status) => {
                this.sendTimeEvent('videoStreamConnection', {
                    status: status
                });
            });
            this.set('recorder', recorder);
        }
        this.send('showFullscreen');
    },
    willDestroyElement() { // remove event handler
        this.sendTimeEvent('destroyingElement');
        this._super(...arguments);
        $(document).off("keyup");
    }
});
