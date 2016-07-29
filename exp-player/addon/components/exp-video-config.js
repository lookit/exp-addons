import Ember from 'ember';
import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from 'exp-player/templates/components/exp-video-config';

export default ExpFrameBaseComponent.extend({
    layout,
    videoRecorder: Ember.inject.service(),
    recorder: null,
    hasCamAccess: Ember.computed.alias('recorder.hasCamAccess'),
    hasWebCam: Ember.computed.alias('recorder.hasWebCam'),
    showWebCamWarning: Ember.computed.not('hasWebCam'),

    _setupRecorder() {
	var recorder = this.get('videoRecorder').start('', this.$('#recorder'), {config: true});
	recorder.install();
	this.set('recorder', recorder);
    },
    didInsertElement() {
	this._setupRecorder();
    },

    actions: {
        next() {
            this.get('recorder').stop({destroy: true});
            this._super(...arguments);
        },
	reloadRecorder() {
	    this.get('recorder').destroy();
	    this._setupRecorder();
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
                  default: 'Please make sure your video camera is working and shows up below!'
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
