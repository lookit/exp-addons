import Ember from 'ember';
import layout from './template';

import ExpFrameBaseComponent from '../../components/exp-frame-base/component';

/**
 * @module exp-player
 * @submodule frames
 */

/**
Video configuration frame showing webcam view at right and instructions for checking video quality for preferential looking setup at left, with pictures. Content is hard-coded for preferential looking requirements and images; this frame can serve as a template for other applications (e.g., verbal responses, where we might care less about lighting but want to generally be able to see the child's face) or can be generalized to show an arbitrary set of instructions/images.

```json
"frames": {
    "video-quality": {
        "id": "video-quality",
        "kind": "exp-video-config-quality"
    }
}
```

@class ExpVideoConfigQuality
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

    type: 'exp-video-config-quality',
    meta: {
        name: 'Video Recorder Configuration for preferential looking',
        description: 'Video configuration frame showing webcam view at right and instructions for checking video quality for preferential looking setup at left, with pictures.',
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
