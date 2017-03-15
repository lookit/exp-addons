import layout from './template';
import ExpFrameBaseComponent from '../../components/exp-frame-base/component';

export default ExpFrameBaseComponent.extend({
    type: 'exp-lookit-text',
    layout: layout,
    meta: {
        name: 'ExpLookitText',
        description: 'Text-only frame for a Lookit study',
        parameters: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'A unique identifier for this item'
                },
                showPreviousButton: {
                    type: 'boolean',
                    default: true
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
                            },
                            emph: {
                                type: 'boolean'
                            }
                        }
                    },
                    default: []
                }
            }
        },
        data: {
            type: 'object',
            properties: {

            }
        }
    }
});
