import Ember from 'ember';
import layout from './template';

import ExpFrameBaseComponent from '../../components/exp-frame-base/component';

/**
 * @module exp-player
 * @submodule frames
 */

/**
Video configuration frame guiding user through making sure permissions are set appropriately and microphone is working, with troubleshooting text. All content is hard-coded for a general-purpose technical setup frame.

```json
"frames": {
    "video-config": {
        "id": "video-config",
        "kind": "exp-video-config"
    }
}
```

@class ExpVideoConfig
@extends ExpFrameBase
*/

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
                /**
                A unique identifier for this item
                @property {String} id
                */
                id: {
                    type: 'string',
                    description: 'A unique identifier for this item'
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
