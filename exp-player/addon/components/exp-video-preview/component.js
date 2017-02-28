import Ember from 'ember';
import layout from './template';

import ExpFrameBaseComponent from '../../components/exp-frame-base/component';
import MediaReload from '../../mixins/media-reload';
import VideoRecord from '../../mixins/video-record';

/**
 * @module exp-player
 * @submodule frames
 */

/**
 * A frame that displays a series of videos to preview, without collecting data as a live experiment.
 ```json
 "frames": {
       "my-sample-frame": {
          "kind": "exp-video-preview",
         "text": "Some text that is shown to the user",
         "prompt": "Text of a button prompt",
         "videos": [
           {
             "caption": "User-facing text that appears below the video",
             "sources": [
               {
                 "type": "video/webm",
                 "src": "https://url.com/example_intro.webm"
               },
               {
                 "type": "video/mp4",
                 "src": "https://url.com/example_intro.webm"
               }
             ]
           }
         ]
    }
 * ```
 * @class ExpVideoPreview
 * @extends ExpFrameBase
 */
export default ExpFrameBaseComponent.extend(MediaReload, VideoRecord, {
    layout,
    videoIndex: 0,

    videoRecorder: Ember.inject.service(),
    recorder: null,
    recordingIsReady: false,
    warning: null,
    hasCamAccess: Ember.computed.alias('recorder.hasCamAccess'),
    videoUploadConnected: Ember.computed.alias('recorder.connected'),

    noNext: function() {
        return this.get('videoIndex') >= this.get('videos.length') - 1;
    }.property('videoIndex'),

    noPrev: function() {
        return this.get('videoIndex') <= 0;
    }.property('videoIndex'),

    currentVideo: Ember.computed('videoIndex', function() {
        console.log(this.get('videoIndex'));
        return this.get('videos')[this.get('videoIndex')];
    }),

    sendTimeEvent(name, opts = {}) {
        var streamTime = this.get('recorder') ? this.get('recorder').getTime() : null;

        Ember.merge(opts, {
            streamTime: streamTime,
            videoId: this.get('videoId')
        });
        this.send('setTimeEvent', `exp-physics:${name}`, opts);
    },

    actions: {
        accept() {
            this.set('prompt', false);
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
        },
        nextVideo() {
            this.set('videoIndex', this.get('videoIndex') + 1);
        },
        previousVideo() {
            this.set('videoIndex', this.get('videoIndex') - 1);
        },
        next() {
            this.sendTimeEvent('stoppingCapture');
            if (this.get('recorder')) {
                this.get('recorder').stop();
            }
            this._super(...arguments);
        }
    },
    type: 'exp-video-preview',
    meta: {
        name: 'ExpVideoPreview',
        description: 'TODO: a description of this frame goes here.',
        parameters: {
            type: 'object',
            properties: {
                index: {
                    type: 'integer',
                    default: 0
                },
                /**
                 * A series of preview videos to display within a single frame, defined as an array of objects.
                 *
                 * @property {Array} videos
                 *   @param {String} caption Some text to appear under this video
                 *   @param {Object[]} sources Array of {src: 'url', type: 'MIMEtype'} objects.
                 */
                videos: {
                    type: 'array',
                    description: 'A list of videos to preview',
                    items: {
                        type: 'object',
                        properties: {
                            imgSrc: {
                                type: 'string',
                                default: ''
                            },
                            sources: {
                                type: 'array',
                                default: [],
                                items: {
                                    type: 'object',
                                    properties: {
                                        src: {
                                            type: 'string'
                                        },
                                        type: {
                                            type: 'string'
                                        }
                                    },
                                    required: ['src', 'type']
                                }
                            },
                            caption: {
                                type: 'string'
                            }
                        },
                        required: ['sources', 'caption']
                    },
                    default: []
                },
                /**
                 * Text of the button prompt asking the user to continue
                 *
                 * @property {String} prompt
                 */
                prompt: {
                    type: 'object',
                    description: 'Require a button press before showing the videos',
                    properties: {
                        title: {
                            type: 'string'
                        },
                        text: {
                            type: 'string'
                        }
                    },
                    default: null
                },
                /**
                 * Informational text to display to the user
                 *
                 * @property {String} text
                 */
                text: {
                    type: 'string',
                    description: 'Text to display to the user',
                    default: ''
                }
            },
            required: ['videos']
        },
        data: {
            type: 'object',
            /**
             * Parameters captured and sent to the server
             *
             * @method serializeContent
             * @param {String} videoID The ID of any video recorded during this frame
             * @param {Object} eventTimings
             * @return {Object} The payload sent to the server
             */
            properties: {
                videoId: {
                    type: 'string'
                }
            },
            // No fields are required
        }
    },

    willDestroyElement() {
        if (this.get('recorder')) {
            this.get('recorder').stop();
        }
        this._super(...arguments);
        Ember.$(document).off('keypress');
    }
});
