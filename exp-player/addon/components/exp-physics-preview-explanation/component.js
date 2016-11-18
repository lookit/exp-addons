import layout from './template';

import ExpFrameBaseComponent from '../../components/exp-frame-base/component';

export default ExpFrameBaseComponent.extend({
    type: 'exp-physics-preview-explanation',
    layout: layout,
    meta: {
        name: 'ExpPhysicsPreviewExplanation',
        description: 'Let parents know about blinding, give option to preview videos.',
        parameters: {
            type: 'object',
            properties: {
                // define parameters here
            }
        },
        data: {
            type: 'object',
            properties: {
                // define data structure here
            }
        }
    },
    actions: {
        skipone: function() {
            this.get('skipone')();
        }
    }
});
