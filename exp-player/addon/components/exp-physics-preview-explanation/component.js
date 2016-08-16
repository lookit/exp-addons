import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from 'exp-player/templates/components/exp-physics-preview-explanation';

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
