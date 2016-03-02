import Ember from 'ember';
import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from 'exp-player/templates/components/exp-video-config';

export default ExpFrameBaseComponent.extend({
    layout,
    videoRecorder: Ember.inject.service(),

    didInsertElement() {
        this.get('videoRecorder').start('', this.$('#recorder'), {
            config: true,
            record: false
      });
    },

    actions: {
        next() {
            this.get('videoRecorder').stop({destroy: true});
            this.sendAction('next');
        }
    },

    type: 'exp-videoconfig',
    meta: {
        name: 'Video Recorder Configuration',
        description: 'TODO: a description of this frame goes here.',
        parameters: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'A unique identifier for this item'
                },
                instructions: {
                  type: 'string',
                  description: 'Instructions to display to the user',
                  default: 'Configure your video camera for the upcoming sections. Press next when you are finished'
                }
            },
            required: ['id']
        },
        data: {
            type: 'object',
            properties: {}
        }
    }
});
