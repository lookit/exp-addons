import Ember from 'ember';
import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from '../templates/components/exp-video-consent';

export default ExpFrameBaseComponent.extend({
    layout,
    videoRecorder: Ember.inject.service(),

    didInsertElement() {
      this.get('videoRecorder').on('onUploadDone', () => {
        this.get('videoRecorder').destroy();
        this.get('videoRecorder').on('onUploadDone', null);
        this.sendAction('next');
      });
      this.get('videoRecorder').start(`video-consent-${this.get('session.id')}`, this.$('#recorder'), {record: false});
    },

    actions: {
      record() {
        this.get('videoRecorder').record();
      },
      finish() {
        this.get('videoRecorder').stop();
      }
    },

    meta: {
        name: 'Video Consent Form',
        description: 'A video consent form.',
        parameters: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'A unique identifier for this item'
                },
                title: {
                    type: 'string',
                    default: 'Notice of Consent'
                },
                prompt: {
                    type: 'string',
                    default: 'Say Words'
                }
            }
        },
        data: {
            type: 'object',
            properties: {
                consentGranted: {
                    type: 'boolean',
                    default: false
                },
                videoId: {
                  type: 'string'
                }
            },
            required: ['consentGranted']
        }
    },
});
