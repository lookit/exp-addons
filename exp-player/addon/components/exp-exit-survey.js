import Ember from 'ember';

import ExpFrameBaseComponent from 'exp-player/components/exp-frame-base';
import layout from '../templates/components/exp-exit-survey';

const defaultSchema = {
    schema: {
        title:"Post-study survey",
        description:"How was your experience?",
        type:"object",
        properties: {
            birthdate: {
                title:"Please confirm your child's birthdate: *"
            },
            feedback: {
                type:"string",
                title:"Your feedback:",
            },
            privacy: {
                type: "string",
                title: "Select the privacy level for the video of your participation: *",
                enum: ['Publicity and educational use (video may be publicity or educational purposes online or in the press in addition to for research purposes)', 'Scientific use only', 'In-lab use only', 'WITHDRAW your data from this session']
            }
        }
    },
    options: {
        fields: {
            birthdate: {
                type: "date",
                manualEntry: false,
                validator: "required-field",
                message: "Please provide a complete and valid birthday.",
                helper: "We ask again just to check for typos during registration or people accidentally selecting a different child at the start of the study.",
            },
            feedback: {
                type: "textarea",
                rows: 5,
                cols: 40,
                helper: "Do you have any ideas about how to make this study easier or more fun for families? Did you experience any technical challenges?"
            },
            privacy: {
                type: "radio",
                removeDefaultNone: true,
                validator: "required-field",
                message: "Please select a privacy level for your video."
            }
        }
    }
};
const emailOptOutSchema = {
    schema: {
        type:"object",
        properties: {
            emailOptOut: {
                title:"You are currently signed up to recieve email reminders about this study."
            }
        }
    },
    options: {
        fields: {
            emailOptOut: {
                type: "checkbox",
                rightLabel: "Opt out"
            }
        },
        form: {
            buttons: {
                finish: {
                    title: "Back to Lookit home page"
                }
            }
        }
    }
};

export default ExpFrameBaseComponent.extend({
    layout: layout,
    type: 'exp-exit-survey',
    meta: {
        name: 'ExpExitSurvey',
        description: 'Exit survey for Lookit.',
        parameters: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    description: 'A unique identifier for this item'
                },
                form: {
                    type: 'jsonschema',
                    description: 'JSON-schema defining this item\'s form',
                    default: defaultSchema
                },
                additionalForm: {
                    type: 'jsonschema',
                    description: 'JSON-schema defining second form.',
                    default: emailOptOutSchema
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
    formSchema: Ember.computed('form', {
        get() {
            var newOptions = this.get('form.options');
            newOptions.form = {
                buttons: {
                    update: {
                        title: 'Submit',
                        type: 'button',
                        styles: 'btn btn-default'
                    }
                }
            };
            return {
                schema: this.get('form.schema'),
                options: newOptions
            };
        },
        set(_, value) {
            this.set('formSchema', value);
            return value;
        }

    }),
    section1: true,
    formData: [],
    formActions: Ember.computed(function() {
        var root = this;
        return {
            update: function () {
                this.refreshValidationState(true);
                if (this.isValid(true)) {
                   root.set('formData', this.getValue());
                   root.set('section1', false);
                }
            },
            finish: function() {
                var formData = root.get('formData');
                Ember.merge(formData, this.getValue());
                root.set('formData', formData);
                console.log('Post-study survey complete.');
                root.actions.next();
            }
        };
    }),
    progressValue: Ember.computed('currentSessionsCompleted', 'idealSessionsCompleted', function() {
        return (this.get('currentSessionsCompleted')/this.get('idealSessionsCompleted')) * 100;
    })
});
