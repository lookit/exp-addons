import layout from './template';
import ExpFrameBaseComponent from '../../components/exp-frame-base/component';

export default ExpFrameBaseComponent.extend({
    type: 'exp-info',
    layout: layout,
    meta: {
        name: 'ExpInfo',
        description: 'TODO: a description of this frame goes here.',
        parameters: {
            type: 'object',
            properties: {
                title: {
                    type: 'string'
                },
                blocks: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            title: {
                                type: 'string'
                            },
                            text: {
                                type: 'string'
                            }
                        }
                    }
                }
            }
        },
        data: {
            type: 'object',
            properties: {}
        }
    }
});
