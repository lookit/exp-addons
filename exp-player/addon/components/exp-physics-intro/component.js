import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from 'exp-player/templates/components/exp-physics-intro';

export default ExpFrameBaseComponent.extend({
    type: 'exp-physics-intro',
    layout: layout,
    meta: {
        name: 'ExpPhysicsIntro',
        description: 'Basic intro to physics study--first frame the user sees after consent.',
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
    }
});
