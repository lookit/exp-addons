import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from 'exp-player/templates/components/<%= dasherizedModuleName %>';

export default ExpFrameBaseComponent.extend({
    layout: layout,
    type: '<%= dasherizedModuleName %>',
    meta: {
        name: '<%= classifiedModuleName %>',
        description: 'TODO: a description of this frame goes here.',
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
