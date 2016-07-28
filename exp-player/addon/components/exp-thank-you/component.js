import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from './template';

export default ExpFrameBaseComponent.extend({
    type: 'exp-thank-you',
    layout: layout,
    meta: {
        name: 'ExpThankYou',
        description: 'TODO: a description of this frame goes here.',
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
