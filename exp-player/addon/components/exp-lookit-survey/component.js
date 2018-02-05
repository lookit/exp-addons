import Ember from 'ember';
import layout from './template';
import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base/component';

let {
    $
} = Ember;

export default ExpFrameBaseComponent.extend({
    type: 'exp-lookit-survey',
    layout: layout,
    meta: {
        name: 'ExpLookitSurvey',
        description: 'TODO: a description of this frame goes here.',
        parameters: {
            type: 'object',
            properties: {
                title: {
                    type: 'string'
                },
                /**
                 * Whether to show a 'previous' button
                 *
                 * @property {Boolean} showPreviousButton
                 * @default true
                 */
                showPreviousButton: {
                    type: 'boolean',
                    default: true
                },
                /**
                 * Text to display on the 'next frame' button
                 *
                 * @property {String} nextButtonText
                 * @default 'Next'
                 */
                nextButtonText: {
                    type: 'string',
                    default: 'Next'
                },
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
                    ],
                    default: {
                        "schema": {
        "title": "What do you think of Alpaca?",
        "type": "object",
        "properties": {
            "name": {
                "type": "string",
                "title": "Name"
            },
            "ranking": {
                "type": "string",
                "title": "Ranking",
                "enum": ['excellent', 'not too shabby', 'alpaca built my hotrod']
            }
        }
    }
                    }
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

