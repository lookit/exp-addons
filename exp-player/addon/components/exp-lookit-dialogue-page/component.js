import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base/component';
import layout from './template';

export default ExpFrameBaseComponent.extend({
    type: 'exp-lookit-dialogue-page',
    layout: layout,
    meta: {
        name: 'ExpLookitDialoguePage',
        description: 'TODO: a description of this frame goes here.',
        parameters: {
            type: 'object',
            properties: {
                // define configurable parameters here
            }
        },
        data: {
            type: 'object',
            properties: {
                // define data to be sent to the server here
            }
        }
    }
});
