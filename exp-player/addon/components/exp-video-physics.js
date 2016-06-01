import Ember from 'ember';

import layout from '../templates/components/exp-video-physics';

import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import FullScreen from '../mixins/full-screen';
import MediaReload from '../mixins/media-reload';
import VideoPause from '../mixins/video-pause';

let { $ } = Ember;


export default ExpFrameBaseComponent.extend(FullScreen, MediaReload, VideoPause, {
    layout: layout,

    displayFullscreen: true,  // force fullscreen for all uses of this component
    fullScreenElementId: 'experiment-player',
    fsButtonID: 'fsButton',

    onFullscreen: function () {
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
                autoforwardOnEnd: {  // Generally leave this true, since controls will be hidden for fullscreen videos
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
                testLength: {
                    type: 'number',
                    description: 'Length of test videos in seconds',
                    default: 20
                }
            }
        },
        data: {
            // This video does not explicitly capture any parameters from the userdata:
            type: 'object',
            properties: {  // We don't *need* to tell the server about this, but it might be nice to track usage of the setup page
                doingIntro: {
                    type: 'boolean',
                    default: true
                },
                doingAttn: {
                    type: 'boolean',
                    default: false
                },
                useAlternate: {
                    type: 'boolean',
                    default: false
                },
                timeoutID: {
                    type: 'number',
                    default: 0
                }
            },
            required: ['doingIntro', 'doingAttn', 'useAlternate']
        }
    },
    actions: {
        playNext: function() {
            window.clearTimeout(this.get('timeoutID'));
            if (this.get('doingIntro')) { // moving to test video
                this.set('doingIntro', false);
                $('#player-video')
                    .attr('loop', true)
                    .addClass('test')
                    .removeClass('intro attn');
            } else {
                this.send('next');
                $('#player-video')
                    .removeClass('attn test')
                    .addClass('intro')
                    .attr('loop', false);
            }
        },
        startVideo: function () {
            if (!this.get('doingIntro') && !this.get('doingAttn')) {
                var emberObj = this;
                var t = window.setTimeout(function(emb) {
                    emb.send('playNext');
                    }, emberObj.get('testLength') * 1000, emberObj);
                this.set('timeoutID', t);
            }
        },
        pause: function () {
            var emberObj = this;
            window.clearTimeout(this.get('timeoutID'));
            if (!emberObj.get('doingAttn') || !this.checkFullscreen()) { // pausing one of the videos
                emberObj.set('doingAttn', true);
                $('#player-video')
                    .addClass('attn')
                    .removeClass('intro test')
                    .attr('loop', true);
            } else { // returning to the videos
                 // if doing intro, just return, no change necessary.
                 // but if we were on a test video...
                if (!emberObj.get('doingIntro')) {
                    // if it was already the alternate, just move on.
                    if (emberObj.get('useAlternate')) {
                        emberObj.send('next');
                    } else {
                    // if we still have the alternate to use, start at intro
                        emberObj.set('useAlternate', true);
                        emberObj.set('doingIntro', true);
                    }
                }

                $('#player-video').removeClass('attn test');
                $('#player-video').addClass('intro');
                emberObj.set('doingAttn', false);
                $('#player-video').attr('loop', false);
            }
        }
    },

    didRender() { // set up event handler for pausing
        this._super(...arguments);
        var emberObj = this;
        $(document).on("keypress", function (e) {
            if (emberObj.checkFullscreen()) {
                if (e.which == 32) { // space
                    emberObj.send('pause');
                    // This isn't actually a function but somehow triggering the error works anyway so I'll take it for now...
                    //emberObj.get('refresh')();
                    emberObj.refresh();
                }
            }
        });
        this.send('showFullscreen');
    },
    willDestroyElement() { // remove event handler
        this._super(...arguments);
        $(document).off("keypress");
    }
});
