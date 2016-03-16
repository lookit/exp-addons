import Em from 'ember';
import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from '../templates/components/exp-video-consent';

export default ExpFrameBaseComponent.extend({
    layout,
    videoRecorder: Em.inject.service(),
    section: 'info',

    videoId: function() {
        return [
            'video-consent',
            this.get('experiment.id'),
            this.get('id'),
            this.get('session.id')
        ].join('-');
    }.property('session', 'id', 'experiment'),

    actions: {
        record() {
            this.get('videoRecorder').record();
        },
        finish() {
            this.get('videoRecorder').stop();
        },
        nextSection() {
            this.set('section', 'capture');

            Em.run.scheduleOnce('afterRender', this, function() {
                this.get('videoRecorder').on('onUploadDone', () => {
                    this.get('videoRecorder').destroy();
                    this.get('videoRecorder').on('onUploadDone', null);
                    this.send('next');
                });

                this.get('videoRecorder').start(this.get('videoId'), this.$('.recorder'), {
                    record: false
                });
            });
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
                videoId: {
                    type: 'string'
                }
            },
            required: ['videoId']
        }
    }
});
