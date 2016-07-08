import Em from 'ember';
import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from '../templates/components/exp-video-consent';
import VideoId from '../mixins/video-id';

export default ExpFrameBaseComponent.extend(VideoId, {
    layout,
    videoRecorder: Em.inject.service(),
    scroller: Em.inject.service(),

    didInsertElement() {
	this.get('videoRecorder').on('onUploadDone', () => {
            this.get('videoRecorder').destroy().then(() => {
		this.get('videoRecorder').on('onUploadDone', null);
		this.send('next');
	    });
        });

        this.get('videoRecorder').start(this.get('videoId'), this.$('.recorder'), {
            record: false
        });
    },
    actions: {
        record() {
	        //this.get('scroller').scrollVertical(Em.$('.recorder'));
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
                    default: 'Consent to participate in behavioral research: <br> Inference and induction study'
                },
                blocks: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            title: {
                                type: 'string'
                            },
                            text: {
                                type: 'string'
                            }
                        }
                    },
                    default: []
                },
                prompt: {
                    type: 'string',
                    default: 'I consent to participate in this study'
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
