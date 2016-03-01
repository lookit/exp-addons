import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from '../templates/components/exp-lookit-overview';

export default ExpFrameBaseComponent.extend({
    layout: layout,
    type: 'exp-lookit-overview',
    meta: {
        name: 'Lookit Overview Page',
        description: '',
        parameters: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'A unique identifier for this item'
                }
                // define additional parameters here
            },
            required: ['id']
        },
        data: {
            type: 'object',
            properties: {
                // define data structure here
            }
        }
    }
});
