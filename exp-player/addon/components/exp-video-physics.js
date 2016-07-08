import Ember from 'ember';

import layout from '../templates/components/exp-video-physics';

import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import FullScreen from '../mixins/full-screen';
import MediaReload from '../mixins/media-reload';
import VideoId from '../mixins/video-id';

let {
    $
} = Ember;


export default ExpFrameBaseComponent.extend(FullScreen, MediaReload, VideoId, {
    layout: layout,

    displayFullscreen: true, // force fullscreen for all uses of this component
    fullScreenElementId: 'experiment-player',
    fsButtonID: 'fsButton',
    videoRecorder: Ember.inject.service(),
    recordingIsReady: false,

    doingIntro: Ember.computed('videoSources', function() {
        return (this.get('currentTask') === 'intro');
    }),
    playAnnouncementNow: true,

    doingTest: Ember.computed('videoSources', function() {
        return (this.get('currentTask') === 'test');
    }),
    timeoutId: 0,
    hasBeenPaused: false,
    useAlternate: false,
    currentTask: 'announce', // announce, intro, or test.
    isPaused: false,

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
        return (this.get('isPaused') || (this.get('currentTask') === 'announce') || this.get('currentTask') === 'test');
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

    sendTimeEvent(name, opts) {
        Ember.merge(opts, {
            streamTime: this.get('videoRecorder').getTime(),
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
        playNext: function() {
            window.clearTimeout(this.get('timeoutID'));
            if (this.get("currentTask") === "intro") {
                // TODO: maybe don't record during last video?
                this.set("currentTask", "test");
            } else {
                this.send('next'); // moving to intro video
            }
        },

        startVideo: function() {
            if ((this.get('currentTask') === 'test') && !this.get('isPaused')) {
                var emberObj = this;
                var t = window.setTimeout(function(emb) {
                    $("audio#exp-music")[0].pause();
                    emb.send('playNext');
                }, emberObj.get('testLength') * 1000, emberObj);
                this.set('timeoutID', t);
                $("audio#exp-music")[0].play();
                if (this.get('useAlternate')) {
                    this.sendTimeEvent('startAlternateVideo');
                } else {
                    this.sendTimeEvent('startTestVideo');
                }
            }
        },
        startIntro: function() {

            this.set('currentTask', 'intro');
            this.set('playAnnouncementNow', false);

            if (~this.get('isPaused')) {
                if (this.isLast) {
                    window.clearTimeout(this.get('timeoutID'));
                    this.send('next');
                } else {
                    this.sendTimeEvent('startIntro');
                    this.set('videosShown', [this.get('sources')[0].src, this.get('altSources')[0].src]);
                }
            }
        },

        next() {
            this.get('videoRecorder').stop();
            this._super(...arguments);
        }
    },

    pauseStudy: function() { // only called in FS mode
        // make sure recording is set already; otherwise, pausing recording leads to an error and all following calls fail silently. Now that this is taken
        // care of in videoRecorder.pause(), skip the check.
        if (!this.get('isLast')) {
            this.beginPropertyChanges();

            this.set('hasBeenPaused', true);
            var wasPaused = this.get('isPaused');
            var currentState = this.get('currentTask');

            // Currently paused: restart
            if (wasPaused) {
                this.set('doingAttn', false);
                this.set('isPaused', false);
                if (currentState === "test") {
                    if (this.get('useAlternate')) {
                        // Necessary to reset hasBeenPaused
                        // here when restarting: doesn't
                        // work just to put this in init, or rely on the
                        // default values, or do endPropertyChanges before next.
                        this.send('next');
                        this.set('hasBeenPaused', true);
                        this.set('currentTask', 'announce');
                        this.set('playAnnouncementNow', true);
                        this.endPropertyChanges();
                        return;
                    } else {
                        this.set('useAlternate', true);
                        this.set('currentTask', 'announce');
                        this.set('playAnnouncementNow', true);
                    }
                } else {
                    this.set('currentTask', 'announce');
                    this.set('playAnnouncementNow', true);
                }

                // Not currently paused: pause
            } else if (!wasPaused) {
                window.clearTimeout(this.get('timeoutID'));
                this.sendTimeEvent('pauseVideo', {
                    'currentTask': this.get('currentTask')
                });
                this.get('videoRecorder').pause(true);
                this.set('playAnnouncementNow', false);
                this.set('isPaused', true);
            }

            this.endPropertyChanges();
        }
    },

    init() {
        this._super(...arguments);
        $(document).on("keypress", (e) => {
            if (this.checkFullscreen()) {
                if (e.which === 32) { // space
                    this.pauseStudy();
                }
            }
            this.send('showFullscreen');
        });
    },

    didReceiveAttrs() {
        this._super(...arguments);
        if (this.get('experiment') && this.get('id') && this.get('session') && !this.get('videoRecorder.started')) {
            this.set('_recorder', this.get('videoRecorder').start(this.get('videoId'), null, {
                hidden: true,
                record: true
            }).then(() => {
                this.sendTimeEvent('recorderReady');
                this.set('recordingIsReady', true);
            }, () => {
                // TODO handle errors in recording
            }));
        }
    },
    willDestroyElement() { // remove event handler
        this.get('videoRecorder').stop();
        this._super(...arguments);
        $(document).off("keypress");
    }
});
