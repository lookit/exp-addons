import Ember from 'ember';

import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from '../templates/components/exp-dynamic-form';

export default ExpFrameBaseComponent.extend({
    layout: layout,
    type: 'exp-dynamic-form',
    meta: {
        name: 'ExpDynamicForm',
        description: 'TODO: a description of this frame goes here.',
        parameters: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'A unique identifier for this item'
                },
                title: {
                    type: 'string',
                    description: 'A title for this item'
                },
                description: {
                    type: 'string',
                    description: 'A description for this item'
                },
                form: {
                    type: 'jsonschema',
                    description: 'JSON-schema defining this item\'s form'
                }
            },
            required: ['id']
        },
        data: {
            type: 'object',
            properties: {
                formData: {
                    type: 'object'
                }
            }
        }
    },
    formSchema: Ember.computed('form', function() {
        return {
            schema: this.get('form'),
            options: {
                form: {
                    buttons: {
                        update: {
                            type: 'button',
                            value: 'Update'
                        }
                    }
                }
            }
        };
    }),
    formData: null,
    formActions: Ember.computed(function() {
        var root = this;

        return {
            update: function() {
                root.set('formData', this.getValue());
            }
        };
    })
});
