import Ember from 'ember';

import layout from '../templates/components/exp-video-physics';

import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import FullScreen from '../mixins/full-screen';
import MediaReload from '../mixins/media-reload';

let {
    $
} = Ember;


export default ExpFrameBaseComponent.extend(FullScreen, MediaReload, {
    layout: layout,

    displayFullscreen: true, // force fullscreen for all uses of this component
    fullScreenElementId: 'experiment-player',
    fsButtonID: 'fsButton',
    videoRecorder: Ember.inject.service(),

    doingIntro: true,
    playingAnnouncement: true,
    doingAttn: false,
    doingTest: Ember.computed.not('doingIntro'),
    timeoutId: 0,
    hasBeenPaused: false,
    useAlternate: false,

    videoId: Ember.computed('session', 'id', 'experiment', function() {
        return [
            this.get('experiment.id'),
            this.get('id'),
            this.get('session.id')
        ].join('_');
    }).volatile(),

    videoSources: Ember.computed('doingIntro', 'playingAnnouncement', 'doingAttn', 'useAlternate', function() {
        if (this.get('doingAttn') || this.get('playingAnnouncement')) {
            return this.get('attnSources');
        } else {
            if (this.get('doingIntro')) {
                return this.get('introSources');
            } else if (this.get('useAlternate')) {
                return this.get('altSources');
            } else {
                return this.get('sources');
            }
        }
    }),

    shouldLoop: Ember.computed('videoSources', function() {
        if (this.get('doingAttn') || this.get('playingAnnouncement') || this.get('doingTest')) {
            return true;
        }
        return false;
    }),

    onFullscreen: function() {
        if (this.get('isDestroyed')) {
            return;
        }
        this._super(...arguments);
        if (!this.checkFullscreen()) {
            this.send('pause');
        }
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
                isLast:  {
                    type: 'boolean',
                    description: 'Whether this is the last exp-physics-video frame in the group',
                    default: false
                }
            }
        },
        data: {
            // This video does not explicitly capture any parameters from the userdata:
            type: 'object',
            properties: { // We don't *need* to tell the server about this, but it might be nice to track usage of the setup page

            },
            required: []
        }
    },
    actions: {
        playNext: function() {
            window.clearTimeout(this.get('timeoutID'));
            if (this.get('doingIntro')) { // moving to test video
                this.getRecorder().then(() => {
                    this.get('videoRecorder').resume().then(() => {
                        this.set('doingIntro', false);
                    });
                });
            } else {
                this.send('next'); // moving to intro video
            }
        },
        startVideo: function() {
            if (!this.get('doingIntro') && !this.get('doingAttn')) {
                var emberObj = this;
                var t = window.setTimeout(function(emb) {
                    $("audio#exp-music")[0].pause();
                    emb.send('playNext');
                }, emberObj.get('testLength') * 1000, emberObj);
                this.set('timeoutID', t);
                $("audio#exp-music")[0].play();
            }
        },
        startIntro: function() {
            if (this.isLast) {
                window.clearTimeout(this.get('timeoutID'));
                this.sendAction('next');
            }
            this.set('playingAnnouncement', false);
        },
        pause: function() {

            this.beginPropertyChanges();

            window.clearTimeout(this.get('timeoutID'));
            this.set('hasBeenPaused', true);

            if (!this.get('doingAttn') || !this.checkFullscreen()) { // pausing one of the intro or test videos, or not in FS
                // show the attentiongrabber
                this.get('videoRecorder').pause();
                this.set('doingAttn', true);
                this.set('playingAnnouncement', false);
            } else { // returning to the videos
                // if doing intro, just return, no change necessary.
                // but if we were on a test video...
                if (this.get('doingTest')) {
                    // if it was already the alternate, just move on.
                    if (this.get('useAlternate')) {
                        this.send('next');
                    } else {
                        // if we still have the alternate to use, start at intro
                        this.set('useAlternate', true);
                        this.set('playingAnnouncement', true);
                        this.set('doingIntro', true);
                    }
                } else { // if we were previously on the intro
                    this.set('playingAnnouncement', true);
                }
                this.set('doingAttn', false);
            }

            this.endPropertyChanges();
        },
	next() {
	    this.get('videoRecorder').stop();
	    this._super(...arguments);
	}
    },

    _recorder: null,
    getRecorder() {
        return this.get('_recorder');
    },

    init() { // set up event handler for pausing
        this._super(...arguments);
        $(document).on("keypress", (e) => {
            if (this.checkFullscreen()) {
                if (e.which === 32) { // space
                    this.send('pause');
                }
            }
        });
        this.send('showFullscreen');
    },
    didReceiveAttrs() {
        this._super(...arguments);
        if (this.get('experiment') && this.get('id') && this.get('session') && !this.get('videoRecorder.started')) {
            this.set('_recorder', this.get('videoRecorder').start(this.get('videoId'), null, {
                hidden: true,
                record: true
            }).then(() => {
                this.get('videoRecorder').pause();
            }).catch(() => {
                // TODO handle no flashReady
            }));
        }
    },
    willDestroyElement() { // remove event handler
        this.get('videoRecorder').stop();
        this._super(...arguments);
        $(document).off("keypress");
    }
});
