import Ember from 'ember';

import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from 'exp-player/templates/components/exp-video-preview';
import MediaReload from 'exp-player/mixins/media-reload';
import VideoRecord from '../mixins/video-record';

let {
    $
} = Ember;

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
            properties: {
                videoId: {
                    type: 'string'
                }
            },
            required: []
        }
    },

    willDestroyElement() {
        if (this.get('recorder')) {
            this.get('recorder').stop();
        }
        this._super(...arguments);
        $(document).off("keypress");
    }
});
