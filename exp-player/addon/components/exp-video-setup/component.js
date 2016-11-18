import Ember from 'ember';
import layout from './template';

import ExpFrameBaseComponent from '../../components/exp-frame-base/component';

export default ExpFrameBaseComponent.extend({
    type: 'exp-video-setup',
    layout: layout,
    videoRecorder: Ember.inject.service(),
    didInsertElement() {
        let recorder = this.get('videoRecorder').start(`video-consent-${this.get('session.id')}`, this.$('#recorder'));
        recorder.install({
            record: false
        });
        recorder.on('onUploadDone', () => {
            this.get('videoRecorder').destroy();
            this.send('next');
        });
    },

    meta: {
        name: 'ExpVideoSetup',
        description: 'TODO: a description of this frame goes here.',
        parameters: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'A unique identifier for this item'
                },
                title: {
                    type: 'string'
                },
                heading: {
                    type: 'string'
                },
                headingText: {
                    type: 'string'
                },
                instructions: {
                    type: 'string'
                },
                examples: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            src: {
                                type: 'string'
                            },
                            caption: {
                                type: 'string'
                            }
                        }
                    }
                }
            },
            required: ['id']
        },
        data: {
            type: 'object',
            properties: {
                // define data structure here
            }
        }
    }
});
