import Ember from 'ember';
import layout from './template';

import ExpFrameBaseComponent from '../../components/exp-frame-base/component';

export default ExpFrameBaseComponent.extend({
    layout,
    videoRecorder: Ember.inject.service(),
    recorder: null,
    didReload: false,
    showWarning: false,
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
            this.set('showWarning', false);
            this.set('didReload', true);
            this.get('recorder').destroy();
            this._setupRecorder();
        },
        checkReloadedThenNext() {
            if (!this.get('didReload')) {
                this.set('showWarning', true);
            } else {
                this.send('next');
            }
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
