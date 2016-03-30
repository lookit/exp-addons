import Em from 'ember';

import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from 'exp-player/templates/components/exp-video-preview';
import MediaReload from 'exp-player/mixins/media-reload';

export default ExpFrameBaseComponent.extend(MediaReload, {
    layout,

    noNext: function() {
        return this.get('index') >= this.get('videos.length') - 1;
    }.property('index'),

    noPrev: function() {
        return this.get('index') <= 0;
    }.property('index'),

    currentVideo: function() {
        return this.get('videos')[this.get('index')];
    }.property('index'),

    didInsertElement() {
        if (this.get('prompt') || !this.get('record')) {return;}
        this.get('videoRecorder').start(`video-preview-${this.get('session.id')}`, this.$('#recorder'), {
            record: true,
            hidden: this.get('hideRecorder')
        });
    },

    actions:{
        accept() {
            this.set('prompt', false);
        },
        nextVideo() {
            this.set('index', this.get('index') + 1);
        },
        previousVideo() {
            this.set('index', this.get('index') - 1);
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
                            }
                        },
                        required: ['sources']
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
    }
});
