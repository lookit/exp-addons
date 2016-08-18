import Em from 'ember';
import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from '../templates/components/exp-video-consent';
import VideoRecord from '../mixins/video-record';

export default ExpFrameBaseComponent.extend(VideoRecord, {
    layout,
    videoRecorder: Em.inject.service(),
    recorder: null,
    hasCamAccess: Em.computed.alias('recorder.hasCamAccess'),
    disableRecord: Em.computed('recorder.recording', 'hasCamAccess', function() {
	return !this.get('hasCamAccess') || this.get('recorder.recording');
    }),
    recordingStarted: false,

    didInsertElement() {
        var recorder = this.get('videoRecorder').start(this.get('videoId'), this.$('.recorder'));
	recorder.install({record: false});
	this.set('recorder', recorder);
    },
    actions: {
        record() {
            this.get('recorder').record();
	    window.setTimeout(() => {
		this.set('recordingStarted', true);
	    }, 2000);
        },
        finish() {
            this.get('recorder').stop().then(() => {
		this.send('next');
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
