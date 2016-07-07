import Ember from 'ember';

import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from 'exp-player/templates/components/exp-video-preview';
import MediaReload from 'exp-player/mixins/media-reload';
import VideoId from '../mixins/video-id';

let { $ } = Ember;

export default ExpFrameBaseComponent.extend(MediaReload, VideoId, {
    layout,
    videoIndex: 0,

    videoRecorder: Ember.inject.service(),

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

    didInsertElement() {
        if (!this.get('record')) {return;}
        this.get('videoRecorder').start(`video-preview-${this.get('session.id')}`, this.$('#recorder'), {
            record: true,
            hidden: this.get('hideRecorder')
        });
    },

    actions:{
        accept() {
            this.set('prompt', false);
            this.getRecorder().then(() => { // start recording when videos are shown
                    this.get('videoRecorder').resume().then(() => {
                        this.set('doingIntro', false);
                    });
                });
        },
        nextVideo() {
            this.set('videoIndex', this.get('videoIndex') + 1);
        },
        previousVideo() {
            this.set('videoIndex', this.get('videoIndex') - 1);
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
                            imgSrc: {type: 'string', default: ''},
                            sources: {
                                type: 'array',
                                default: [],
                                items: {
                                    type: 'object',
                                    properties: {
                                        src: {type: 'string'},
                                        type: {type: 'string'}
                                    },
                                    required: ['src', 'type']
                                }
                            },
                            caption: {type: 'string'}
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
        data: {type: 'object', properties: {}}
    },


    _recorder: null,
    getRecorder() {
        return this.get('_recorder');
    },

    didReceiveAttrs() { // establish video connection right away, then wait for 'accept'
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
