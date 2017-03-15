import layout from './template';
import ExpFrameBaseComponent from '../../components/exp-frame-base/component';

// This component is provided for demonstration purposes and may require modifications to work.
export default ExpFrameBaseComponent.extend({
    type: 'exp-survey',
    layout: layout,
    meta: {
        name: 'Exp Survey',
        description: 'A schema-driven survey',
        parameters: {
            type: 'object',
            properties: {
                formSchema: {
                    $oneOf: [
                        'string',
                        {
                            type: 'object',
                            properties: {
                                schema: {
                                    type: 'jsonschema'
                                }
                            }
                        }
                    ]
                }
            }
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
    form: null,
    formData: null,
    actions: {
        save() {
            this.set('formData', this.get('form').getValue());
            this.send('next');
        },
        getForm(form) {
            this.set('form', form);
        }
    }
});
