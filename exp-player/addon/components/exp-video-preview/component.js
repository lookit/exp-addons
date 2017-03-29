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
 * A frame that displays a series of videos to preview, without collecting data as a live experiment. User can go through these at their own pace and video controls are shown. Webcam video is recorded starting once the user presses a button to actually display the videos, so that researchers can check that the participant (infant/child) did not see the videos ahead of time.
 ```json
 "frames": {
    "my-sample-frame": {
        "id": "video-preview",
        "kind": "exp-video-preview",
        "text": "Here are the videos your child will see in this study. You can watch them ahead of time--please just don't show your child yet!",
        "prompt": "My child can NOT see the screen. Start the preview!",
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
        return this.get('videos')[this.get('videoIndex')];
    }),
    makeTimeEvent(eventName, extra) {
        return this._super(`exp-video-preview:${eventName}`, extra);
    },
    actions: {
        accept() {
            this.set('prompt', false);
            if (this.get('experiment') && this.get('id') && this.get('session') && !this.get('isLast')) {
                const installPromise = this.setupRecorder(this.$('#videoRecorder'), true, {
                    hidden: true
                });
                installPromise.then(() => {
                    this.send('setTimeEvent', 'recorderReady');
                });
            }
        },
        nextVideo() {
            this.set('videoIndex', this.get('videoIndex') + 1);
        },
        previousVideo() {
            this.set('videoIndex', this.get('videoIndex') - 1);
        },
        next() {
            this.send('setTimeEvent', 'stoppingCapture');
            this.stopRecorder();
            this._super(...arguments);
        }
    },
    type: 'exp-video-preview',
    meta: {
        name: 'ExpVideoPreview',
        description: 'Frame that displays a series of preview videos, self-paced with controls.',
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
                 *   @param {String} imgSrc URL of image to display (optional; each preview video should designate either sources or imgSrc)
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
                 * Text on the button prompt asking the user to continue to the videos
                 *
                 * @property {String} prompt
                 */
                prompt: {
                    type: 'object',
                    description: 'Text on the button prompt asking the user to continue to the videos',
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
                 * Informational text to display to the user before videos are shown, along with button to continue
                 *
                 * @property {String} text
                 */
                text: {
                    type: 'string',
                    description: 'Informational text to display to the user before videos are shown, along with button to continue',
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
        this.stopRecorder();
        this._super(...arguments);
        Ember.$(document).off('keypress');
    }
});
